"use client";

import * as React from "react";
import { Button, Icon, Popover, PopoverTitle } from "@noorddev/vlak-react";
import { VlakMark } from "@/components/vlak-mark";
import "./preview.css";
import "./preview-apps.css";

const PreviewRouteContext = React.createContext(false);
type PreviewState = {
  slug: string; title: string; open: boolean; setOpen(open: boolean): void;
  frameId: string; trigger: React.RefObject<HTMLButtonElement | null>;
};
const PreviewContext = React.createContext<PreviewState | null>(null);

/** Short routes render the same page and app, initially filling the viewport. */
export function PreviewRouteProvider({ children }: { children: React.ReactNode }) {
  return <PreviewRouteContext.Provider value>{children}</PreviewRouteContext.Provider>;
}

export function InterfacePreviewProvider({ slug, title, children }: { slug: string; title: string; children: React.ReactNode }) {
  const initialOpen = React.useContext(PreviewRouteContext);
  const [open, setOpen] = React.useState(initialOpen);
  const trigger = React.useRef<HTMLButtonElement>(null);
  const frameId = `interface-preview-${React.useId()}`;
  const value = React.useMemo(() => ({ slug, title, open, setOpen, frameId, trigger }), [slug, title, open, frameId]);
  return <PreviewContext.Provider value={value}>{children}</PreviewContext.Provider>;
}

function usePreview() {
  const context = React.useContext(PreviewContext);
  if (!context) throw new Error("Interface preview needs an InterfacePreviewProvider");
  return context;
}

export function PreviewButton() {
  const { open, setOpen, frameId, trigger } = usePreview();
  return <Button ref={trigger} className="if-preview-trigger" variant="ghost" aria-haspopup="dialog" aria-expanded={open} aria-controls={frameId} onClick={() => setOpen(true)}><Icon name="expand" size={16} />Preview fullscreen</Button>;
}

const focusable = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),iframe,[tabindex]:not([tabindex="-1"])';
function visible(element: Element) {
  return element instanceof HTMLElement && !element.closest('[inert],[hidden],[aria-hidden="true"]') && element.getClientRects().length > 0 && getComputedStyle(element).visibility !== "hidden";
}
function openOverlays(frame: HTMLElement) {
  return [...document.querySelectorAll('dialog[open],[popover]:popover-open,[role="dialog"],[role="menu"],[role="listbox"]')].filter(element => element !== frame && visible(element));
}

/** The app stays in this exact DOM position through every preview transition. */
export function InterfacePreview({ children }: { children: React.ReactNode }) {
  const { slug, title, open, setOpen, frameId, trigger } = usePreview();
  const frame = React.useRef<HTMLDivElement>(null), exit = React.useRef<HTMLButtonElement>(null), linkField = React.useRef<HTMLInputElement>(null);
  const [url, setUrl] = React.useState(`https://vlak.dev/i/${slug}/`);
  const [copy, setCopy] = React.useState<"idle" | "copied" | "error">("idle");
  const [failure, setFailure] = React.useState("");
  const [fallbackAttempt, setFallbackAttempt] = React.useState(0);
  const [nativeShare, setNativeShare] = React.useState(false), [sharing, setSharing] = React.useState(false);
  const active = React.useRef(true), request = React.useRef(0), shareRequest = React.useRef(0);
  const openNow = React.useRef(open); openNow.current = open;
  React.useEffect(() => { active.current = true; setUrl(`${location.origin}/i/${slug}/`); setNativeShare(typeof navigator.share === "function"); return () => { active.current = false; request.current++; shareRequest.current++; }; }, [slug]);
  React.useEffect(() => { if (!open) { request.current++; shareRequest.current++; setCopy("idle"); setSharing(false); } }, [open]);
  React.useEffect(() => { if (copy === "error" && fallbackAttempt) { for (const panel of frame.current?.querySelectorAll<HTMLElement>("[popover]:popover-open") ?? []) panel.hidePopover(); linkField.current?.focus({ preventScroll: true }); linkField.current?.select(); } }, [copy, fallbackAttempt]);

  React.useEffect(() => {
    const container = frame.current;
    if (!open || !container) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const scroll = { x: window.scrollX, y: window.scrollY };
    const htmlOverflow = document.documentElement.style.overflow, bodyOverflow = document.body.style.overflow;
    const inert = new Map<HTMLElement, boolean>();
    // Only existing siblings along the frame's ancestor path are background.
    // App portals subsequently added to body remain interactive.
    let branch: HTMLElement = container;
    while (branch.parentElement) {
      for (const sibling of branch.parentElement.children) {
        if (sibling === branch || !(sibling instanceof HTMLElement) || /^(SCRIPT|STYLE|LINK)$/.test(sibling.tagName)) continue;
        inert.set(sibling, sibling.inert); sibling.inert = true;
      }
      branch = branch.parentElement;
      if (branch === document.body) break;
    }
    document.documentElement.style.overflow = "hidden"; document.body.style.overflow = "hidden";
    exit.current?.focus({ preventScroll: true });
    const guarded = new WeakSet<KeyboardEvent>();
    const capture = (event: KeyboardEvent) => { if (event.key === "Escape" && openOverlays(container).length) guarded.add(event); };
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        // Child React handlers and the native top layer get the first close.
        queueMicrotask(() => { if (!event.defaultPrevented && !guarded.has(event)) setOpen(false); });
      } else if (event.key === "Tab" && !openOverlays(container).length) {
        const controls = [...container.querySelectorAll<HTMLElement>(focusable)].filter(element => visible(element) && element.tabIndex >= 0);
        const first = controls[0], last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    window.addEventListener("keydown", capture, true); window.addEventListener("keydown", keyboard);
    return () => {
      window.removeEventListener("keydown", capture, true); window.removeEventListener("keydown", keyboard);
      for (const panel of container.querySelectorAll<HTMLElement>("[popover]:popover-open")) panel.hidePopover();
      for (const [element, wasInert] of inert) element.inert = wasInert;
      document.documentElement.style.overflow = htmlOverflow; document.body.style.overflow = bodyOverflow;
      const restore = previousFocus?.isConnected && previousFocus !== document.body ? previousFocus : trigger.current;
      if (restore && !restore.closest("[inert]")) restore.focus({ preventScroll: true });
      window.scrollTo({ left: scroll.x, top: scroll.y, behavior: "instant" });
    };
  }, [open, setOpen, trigger]);

  const copyLink = async () => {
    const attempt = ++request.current;
    try { await navigator.clipboard.writeText(`${location.origin}/i/${slug}/`); if (active.current && openNow.current && request.current === attempt) setCopy("copied"); }
    catch { if (active.current && openNow.current && request.current === attempt) { setFailure("Clipboard unavailable. Select and copy this link."); setCopy("error"); setFallbackAttempt(value => value + 1); } }
  };
  const share = async () => {
    const attempt = ++shareRequest.current; setSharing(true);
    try { await navigator.share({ title: `${title} · Vlak`, url }); }
    catch (error) { if (active.current && openNow.current && shareRequest.current === attempt && !(error instanceof DOMException && error.name === "AbortError")) { setFailure("Sharing unavailable. Select and copy this link."); setCopy("error"); setFallbackAttempt(value => value + 1); } }
    finally { if (active.current && shareRequest.current === attempt) setSharing(false); }
  };
  const links = [
    ["X", `https://twitter.com/intent/tweet?${new URLSearchParams({ text: `${title} · Vlak`, url })}`],
    ["LinkedIn", `https://www.linkedin.com/sharing/share-offsite/?${new URLSearchParams({ url })}`],
    ["Bluesky", `https://bsky.app/intent/compose?${new URLSearchParams({ text: `${title} · Vlak\n${url}` })}`],
  ];
  const semantics = open ? { role: "dialog", "aria-modal": true, "aria-label": `${title} fullscreen preview` } as const : {};
  return <div ref={frame} id={frameId} className="if-preview-frame" data-preview-open={open} {...semantics}>
    <header className="if-preview-bar" hidden={!open}>
      <div className="if-preview-bar-row">
        <a className="if-preview-brand" href="/" aria-label="Vlak home"><VlakMark className="if-preview-mark" /><span>Vlak</span></a>
        <strong className="if-preview-title">{title}</strong>
        <div className="if-preview-actions">
          <Button variant="ghost" aria-label="Copy preview link" onClick={copyLink}><Icon name={copy === "copied" ? "check" : "copy"} size={16} /><span className="if-preview-action-label">{copy === "copied" ? "Copied" : "Copy link"}</span></Button>
          <Popover align="end" className="if-preview-share" aria-label="Share preview" trigger={<><Icon name="share" size={16} /><span className="if-preview-action-label">Share</span></>}>
            <PopoverTitle>Share preview</PopoverTitle>
            <nav className="if-preview-share-links" aria-label="Share on social media">{links.map(([name, href]) => <a key={name} className="rs-link-underline" href={href} target="_blank" rel="noopener noreferrer"><span>{name}</span><Icon name="external" size={16} /></a>)}</nav>
            {nativeShare && <Button variant="ghost" className="if-preview-native-share" disabled={sharing} onClick={share}><Icon name="share" size={16} />More sharing options</Button>}
          </Popover>
          <Button ref={exit} variant="ghost" aria-label="Exit fullscreen preview" onClick={() => setOpen(false)}><Icon name="close" size={16} /><span className="if-preview-action-label">Exit</span></Button>
        </div>
      </div>
      <span className="if-preview-status" role="status">{copy === "copied" ? "Preview link copied" : ""}</span>
      {copy === "error" && <div className="if-preview-copy-fallback"><p role="alert">{failure}</p><input ref={linkField} aria-label="Preview link" readOnly value={url} onFocus={event => event.currentTarget.select()} /></div>}
    </header>
    <div className="if-preview-content">{children}</div>
  </div>;
}
