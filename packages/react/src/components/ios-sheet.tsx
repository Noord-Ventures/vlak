"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { useMergedRefs } from "../merge-refs";
import { Icon } from "./icon";

export interface IOSSheetProps extends Omit<React.DialogHTMLAttributes<HTMLDialogElement>, "open" | "onClose" | "title"> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  closeLabel?: string;
  dismissable?: boolean;
  lightDismiss?: boolean;
}
const enter = stylex.keyframes({ from: { transform: "translateY(24px)", opacity: 0 }, to: { transform: "translateY(0)", opacity: 1 } });
const styles = stylex.create({
  root: { position: "fixed", insetBlockStart: "auto", insetBlockEnd: 0, insetInline: 0, boxSizing: "border-box", width: "min(653px, calc(100vw - 16px))", maxWidth: "calc(100vw - 16px)", maxHeight: "calc(100dvh - 32px)", marginBlock: 0, marginInline: "auto", padding: 0, borderWidth: 1, borderStyle: "solid", borderColor: { default: vlak.controlBorder, [mq.forcedColors]: "ButtonText" }, borderStartStartRadius: 28, borderStartEndRadius: 28, borderEndStartRadius: 0, borderEndEndRadius: 0, backgroundColor: vlak.paper, color: vlak.ink, fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif", fontSize: 17, lineHeight: "22px", overflowY: "auto", overscrollBehavior: "contain", "::backdrop": { backgroundColor: "rgba(0,0,0,0.3)" } },
  open: { animationName: { default: enter, [mq.reduce]: "none" }, animationDuration: "350ms", animationTimingFunction: "cubic-bezier(.2,.8,.2,1)" },
  handle: { width: 36, height: 5, borderRadius: 3, marginBlock: "8px 0", marginInline: "auto", backgroundColor: vlak.controlBorder },
  header: { display: "grid", gridTemplateColumns: "44px minmax(0,1fr) 44px", alignItems: "center", gap: 8, minHeight: 62, boxSizing: "border-box", paddingBlock: 8, paddingInline: 12, borderBlockEndWidth: 1, borderBlockEndStyle: "solid", borderBlockEndColor: vlak.divider },
  title: { margin: 0, textAlign: "center", fontSize: 17, lineHeight: "22px", fontWeight: 600, overflowWrap: "anywhere" },
  close: { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 44, minWidth: 44, height: 44, minHeight: 44, padding: 0, appearance: "none", borderRadius: 22, borderWidth: 1, borderStyle: "solid", borderColor: { default: vlak.controlBorder, [mq.forcedColors]: "ButtonText" }, backgroundColor: { default: vlak.controlFill, ":hover": { default: null, [mq.hover]: vlak.paper } }, color: vlak.ink, cursor: "pointer", outlineWidth: { default: 0, ":focus-visible": 2 }, outlineStyle: "solid", outlineColor: vlak.ink, outlineOffset: 2 },
  body: { paddingBlockStart: 20, paddingBlockEnd: "max(24px, env(safe-area-inset-bottom, 0px))", paddingInline: 20 },
  description: { marginBlock: "0 16px", marginInline: 0, fontSize: 15, lineHeight: "20px", color: vlak.gray },
});

/** A modal bottom sheet. The platform owns the focus trap and top layer. */
export const IOSSheet = React.forwardRef<HTMLDialogElement, IOSSheetProps>(function IOSSheet({ open, defaultOpen = false, onOpenChange, onClose, title, description, closeLabel = "Close sheet", dismissable = true, lightDismiss = true, className, style, children, onCancel, onClick, ...props }, forwardedRef) {
  const [inner, setInner] = React.useState(defaultOpen);
  const controlled = open !== undefined;
  const shown = controlled ? open : inner;
  const dialog = React.useRef<HTMLDialogElement>(null);
  const ref = useMergedRefs(dialog, forwardedRef);
  const origin = React.useRef<HTMLElement | null>(null);
  const shownRef = React.useRef(shown);
  const pendingCloses = React.useRef(0);
  shownRef.current = shown;
  const id = React.useId();
  const requestClose = () => { if (!controlled) setInner(false); onOpenChange?.(false); onClose?.(); };
  const restore = React.useCallback((node: HTMLDialogElement) => { const previous = origin.current; origin.current = null; if (previous?.isConnected && (document.activeElement === document.body || node.contains(document.activeElement))) previous.focus(); }, []);
  React.useLayoutEffect(() => {
    shownRef.current = shown;
    const node = dialog.current; if (!node) return;
    if (shown && !node.open) {
      origin.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      if (typeof node.showModal === "function") node.showModal(); else node.open = true;
      if (!node.contains(document.activeElement)) (node.querySelector<HTMLElement>("[autofocus],button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex='0']") ?? node).focus();
    } else if (!shown) { if (node.open) { if (typeof node.close === "function") { pendingCloses.current++; node.close(); } else node.open = false; } restore(node); }
  }, [shown, restore]);
  React.useEffect(() => { const node = dialog.current; return () => { shownRef.current = false; if (node) { if (node.open && typeof node.close === "function") { pendingCloses.current++; node.close(); } restore(node); } }; }, [restore]);
  const root = rs(["rs-ios-sheet", shown && "rs-ios-sheet-open", className], styles.root, shown && styles.open);
  const handle = rs(["rs-ios-sheet-handle"], styles.handle);
  const header = rs(["rs-ios-sheet-header"], styles.header);
  const heading = rs(["rs-ios-sheet-title"], styles.title);
  const close = rs(["rs-ios-sheet-close"], styles.close);
  const body = rs(["rs-ios-sheet-body"], styles.body);
  const detail = rs(["rs-ios-sheet-description"], styles.description);
  return <dialog {...props} ref={ref} aria-labelledby={props["aria-label"] ? undefined : (props["aria-labelledby"] ?? `${id}-title`)} aria-describedby={props["aria-describedby"] ?? (description ? `${id}-description` : undefined)} className={root.className} style={{ ...root.style, ...style }} onCancel={event => { onCancel?.(event); if (event.defaultPrevented) return; event.preventDefault(); if (dismissable) requestClose(); }} onClose={() => { if (pendingCloses.current) pendingCloses.current--; else if (shownRef.current) requestClose(); }} onClick={event => {
    onClick?.(event); if (event.defaultPrevented || !lightDismiss || !dismissable || event.target !== event.currentTarget) return;
    const bounds = event.currentTarget.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) requestClose();
  }}><div {...handle} aria-hidden="true" /><header {...header}><span /><h2 {...heading} id={`${id}-title`}>{title}</h2>{dismissable ? <button {...close} type="button" aria-label={closeLabel} onClick={requestClose}><Icon name="close" size={24} /></button> : <span />}</header><div {...body}>{description && <p {...detail} id={`${id}-description`}>{description}</p>}{children}</div></dialog>;
});
