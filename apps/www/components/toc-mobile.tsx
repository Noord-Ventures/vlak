"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { Icon } from "@noorddev/vlak-react";

const chromeSelector = ".logo-wrap, .corner-nav, .settings, .nav-toggle, .site-crumb-bar";
const focusableSelector = 'a[href], button:not(:disabled), [tabindex]:not([tabindex="-1"])';
const useIsoLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

/** Phone contents fill the viewport below the still-usable global chrome. */
export function MobileToc({
  label,
  children,
  inset,
}: {
  label: string;
  children: React.ReactNode;
  inset?: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const panelRef = React.useRef<HTMLElement>(null);
  const restoreFocusFrame = React.useRef<number | null>(null);
  const sheetId = React.useId();

  const cancelRestoreFocus = React.useCallback(() => {
    if (restoreFocusFrame.current !== null) {
      cancelAnimationFrame(restoreFocusFrame.current);
      restoreFocusFrame.current = null;
    }
  }, []);

  const close = React.useCallback((restoreFocus = false) => {
    cancelRestoreFocus();
    setOpen(false);
    if (restoreFocus) restoreFocusFrame.current = requestAnimationFrame(() => {
      restoreFocusFrame.current = null;
      triggerRef.current?.focus({ preventScroll: true });
    });
  }, [cancelRestoreFocus]);

  React.useEffect(() => cancelRestoreFocus, [cancelRestoreFocus]);

  React.useEffect(() => close(), [pathname, close]);

  React.useEffect(() => {
    const media = window.matchMedia("(min-width: 900px)");
    const onResize = () => { if (media.matches) close(); };
    const onNavigation = (event: Event) => {
      cancelRestoreFocus();
      if ((event as CustomEvent<string>).detail !== "section") close();
    };
    media.addEventListener("change", onResize);
    window.addEventListener("vlak:navigation-open", onNavigation);
    return () => {
      media.removeEventListener("change", onResize);
      window.removeEventListener("vlak:navigation-open", onNavigation);
    };
  }, [close, cancelRestoreFocus]);

  useIsoLayoutEffect(() => {
    if (!open || !panelRef.current) return;
    const panel = panelRef.current;
    // The portal is a body sibling, so the page can be natively inert without
    // disabling the contents or the visible global navigation above it.
    const background = Array.from(document.body.children)
      .filter((element): element is HTMLElement => element instanceof HTMLElement
        && element !== panel && !element.matches(chromeSelector) && !element.inert);
    for (const element of background) element.inert = true;

    const focusable = () => Array.from(document.querySelectorAll<HTMLElement>(focusableSelector))
      .filter((element) => (panel.contains(element) || element.closest(chromeSelector))
        && !element.closest('[inert], [hidden]') && element.getClientRects().length > 0);
    const first = panel.querySelector<HTMLElement>('.toc-mobile-sheet [aria-current="page"], .toc-mobile-sheet [aria-current="true"]')
      ?? panel.querySelector<HTMLElement>(".toc-mobile-sheet a, .toc-mobile-sheet button");
    first?.focus({ preventScroll: true });
    const sheet = panel.querySelector<HTMLElement>(".toc-mobile-sheet");
    if (first && sheet) sheet.scrollTop = first.getBoundingClientRect().top - sheet.getBoundingClientRect().top;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close(true);
      } else if (event.key === "Tab") {
        const items = focusable();
        const index = items.indexOf(document.activeElement as HTMLElement);
        if (index < 0 || (event.shiftKey ? index === 0 : index === items.length - 1)) {
          event.preventDefault();
          (event.shiftKey ? items.at(-1) : items[0])?.focus();
        }
      }
    };
    const onFocus = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      if (!panel.contains(target) && !target.closest(chromeSelector)) first?.focus({ preventScroll: true });
    };
    const onChromeLink = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest(chromeSelector) && target.closest("a[href]")) close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("focusin", onFocus);
    document.addEventListener("click", onChromeLink);
    return () => {
      for (const element of background) element.inert = false;
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("focusin", onFocus);
      document.removeEventListener("click", onChromeLink);
    };
  }, [open, close]);

  const trigger = (expanded: boolean) => (
    <button
      type="button"
      ref={expanded ? undefined : triggerRef}
      className="toc-mobile-trigger"
      aria-expanded={expanded}
      aria-controls={sheetId}
      onClick={() => {
        if (expanded) close(true);
        else {
          cancelRestoreFocus();
          window.dispatchEvent(new CustomEvent("vlak:navigation-open", { detail: "section" }));
          setOpen(true);
        }
      }}
    >
      <span>{label}</span>
      <span className="toc-mobile-mark" aria-hidden="true">
        <Icon name="chevron-right" size={16} rotate={expanded ? 270 : 90} />
      </span>
    </button>
  );

  return (
    <>
      <nav className={`toc-mobile${inset ? " toc-mobile-inset" : ""}`} aria-label={label} data-open={open}>
        {trigger(false)}
        {!open ? <div id={sheetId} hidden /> : null}
      </nav>
      {open ? createPortal(
        <nav ref={panelRef} className="toc-mobile toc-mobile-open" aria-label={`${label} contents`}>
          {trigger(true)}
          <div id={sheetId} className="toc-mobile-sheet" onClick={(event) => {
            if ((event.target as HTMLElement).closest("a[href]")) close();
          }}>
            {children}
          </div>
        </nav>,
        document.body,
      ) : null}
    </>
  );
}
