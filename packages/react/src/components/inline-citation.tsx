"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { useOverlayPosition } from "../use-overlay-position";
import { Button } from "./button";
import { Icon } from "./icon";
import { sourceHref, type CitationSource } from "./sources";

export interface InlineCitationProps extends React.HTMLAttributes<HTMLSpanElement> {
  sources: readonly CitationSource[];
  label?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
}
const styles = stylex.create({
  root: { display: "inline", color: vlak.ink },
  trigger: { display: "inline-flex", verticalAlign: "middle", paddingInline: "0.5rem", fontVariantNumeric: "tabular-nums", fontSize: vlak.controlLabel },
  panel: { position: "fixed", zIndex: vlak.zFloat, inset: "auto", margin: 0, width: "22rem", maxWidth: "calc(100vw - 16px)", boxSizing: "border-box", padding: "0.75rem", display: "grid", gridAutoRows: "min-content", gap: "0.75rem", backgroundColor: vlak.paper, color: vlak.ink, borderWidth: vlak.hairline, borderStyle: "solid", borderColor: { default: vlak.divider, [mq.forcedColors]: "CanvasText" }, borderRadius: vlak.radiusSm, fontFamily: "inherit", fontSize: vlak.controlFs, lineHeight: 1.45, ":focus-visible": { outlineWidth: 2, outlineStyle: "solid", outlineColor: vlak.ink, outlineOffset: 2 } },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" },
  navigation: { display: "flex", alignItems: "center", gap: 0 },
  count: { color: vlak.gray, fontSize: vlak.controlLabel, fontVariantNumeric: "tabular-nums" },
  title: { margin: 0, fontSize: vlak.controlFs, fontWeight: 600, lineHeight: 1.45 },
  link: { display: "flex", alignItems: "center", minHeight: vlak.hit, minWidth: vlak.hit, color: { default: vlak.gray, ":hover": { default: null, [mq.hover]: vlak.ink } }, overflowWrap: "anywhere", fontSize: vlak.controlLabel, textUnderlineOffset: 3, ":focus-visible": { outlineWidth: 2, outlineStyle: "solid", outlineColor: vlak.ink, outlineOffset: 2 } },
  description: { margin: 0, color: vlak.gray, fontSize: vlak.controlFs, lineHeight: 1.45 },
  quote: { margin: 0, padding: "0.75rem", backgroundColor: vlak.tableAlt, borderRadius: vlak.radiusSm, color: vlak.ink, fontSize: vlak.controlFs, lineHeight: 1.45 },
});

/** A keyboard-reachable source preview with count, quotes and navigation through multiple citations. */
export const InlineCitation = React.forwardRef<HTMLSpanElement, InlineCitationProps>(function InlineCitation({ sources, label, open, defaultOpen = false, onOpenChange, index, defaultIndex = 0, onIndexChange, className, style, children, ...props }, ref) {
  const [innerOpen, setInnerOpen] = React.useState(defaultOpen);
  const [innerIndex, setInnerIndex] = React.useState(defaultIndex);
  const [mounted, setMounted] = React.useState(false);
  const expanded = (open ?? innerOpen) && sources.length > 0;
  const active = Math.max(0, Math.min(sources.length - 1, Number.isFinite(index ?? innerIndex) ? index ?? innerIndex : 0));
  const source = sources[active];
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const id = React.useId();
  const callbacks = React.useRef({ onOpenChange, onIndexChange }); callbacks.current = { onOpenChange, onIndexChange };
  const changeOpen = React.useCallback((next: boolean, restore = false) => { if (open === undefined) setInnerOpen(next); callbacks.current.onOpenChange?.(next); if (restore) triggerRef.current?.focus(); }, [open]);
  const changeIndex = (next: number) => { const bounded = Math.max(0, Math.min(sources.length - 1, next)); if (bounded === active) return; if (index === undefined) setInnerIndex(bounded); callbacks.current.onIndexChange?.(bounded); };
  React.useEffect(() => setMounted(true), []);
  const position = useOverlayPosition(mounted && expanded, panelRef, triggerRef, undefined, "bottom", { matchAnchorWidth: false });
  React.useEffect(() => {
    // The positioning layout effect first measures a hidden panel. Browsers cannot focus it
    // until that effect's visible placement has been committed to the DOM.
    if (mounted && expanded && position.visibility === "visible") panelRef.current?.focus({ preventScroll: true });
  }, [expanded, mounted, position.visibility]);
  React.useEffect(() => {
    if (!mounted || !expanded) return;
    const outside = (event: PointerEvent) => { const target = event.target as Node; if (!panelRef.current?.contains(target) && !triggerRef.current?.contains(target)) changeOpen(false); };
    const escapeKey = (event: KeyboardEvent) => { if (event.key === "Escape") { event.preventDefault(); changeOpen(false, true); } };
    document.addEventListener("pointerdown", outside); document.addEventListener("keydown", escapeKey);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escapeKey); };
  }, [expanded, mounted, changeOpen]);
  const root = rs(["rs-inline-citation", className], styles.root);
  const trigger = rs(["rs-inline-citation-trigger"], styles.trigger);
  const panel = rs(["rs-inline-citation-panel"], styles.panel);
  const header = rs(["rs-inline-citation-header"], styles.header);
  const navigation = rs(["rs-inline-citation-navigation"], styles.navigation);
  const count = rs(["rs-inline-citation-count"], styles.count);
  const title = rs(["rs-inline-citation-title"], styles.title);
  const link = rs(["rs-inline-citation-link"], styles.link);
  const description = rs(["rs-inline-citation-description"], styles.description);
  const quote = rs(["rs-inline-citation-quote"], styles.quote);
  return <span ref={ref} {...props} className={root.className} style={{ ...root.style, ...style }}>{children}<Button {...trigger} ref={triggerRef} variant="subtle" size="sm" aria-label={label ?? `View ${sources.length} ${sources.length === 1 ? "source" : "sources"}`} aria-haspopup="dialog" aria-expanded={expanded} aria-controls={expanded ? id : undefined} disabled={!sources.length} onClick={() => changeOpen(!expanded)}>{label ?? `[${sources.length}]`}</Button>
    {mounted && expanded && source && createPortal(<div {...panel} ref={panelRef} id={id} role="dialog" aria-label="Citation sources" tabIndex={-1} style={{ ...panel.style, ...position }} onKeyDown={event => {
      if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) { event.preventDefault(); const rtl = getComputedStyle(event.currentTarget).direction === "rtl"; changeIndex(event.key === "Home" ? 0 : event.key === "End" ? sources.length - 1 : active + ((event.key === "ArrowRight") !== rtl ? 1 : -1)); }
      if (event.key === "Tab") {
        const focusable = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex="0"]'));
        const first = focusable[0]; const last = focusable.at(-1);
        if (event.shiftKey && (document.activeElement === first || document.activeElement === event.currentTarget)) { event.preventDefault(); changeOpen(false, true); }
        else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault(); const candidates = Array.from(document.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex="0"]')).filter(element => !panelRef.current?.contains(element));
          const next = candidates[candidates.indexOf(triggerRef.current!) + 1]; changeOpen(false); (next ?? triggerRef.current)?.focus();
        }
      }
    }}><div {...header}><span {...count} role="status">Source {active + 1} of {sources.length}</span><div {...navigation}>
      <Button variant="subtle" size="icon" aria-label="Previous source" aria-disabled={active <= 0} onClick={() => changeIndex(active - 1)}><Icon name="chevron-left" /></Button>
      <Button variant="subtle" size="icon" aria-label="Next source" aria-disabled={active >= sources.length - 1} onClick={() => changeIndex(active + 1)}><Icon name="chevron-right" /></Button>
      <Button variant="subtle" size="icon" aria-label="Close sources" onClick={() => changeOpen(false, true)}><Icon name="close" /></Button>
    </div></div><h3 {...title}>{source.title}</h3>{sourceHref(source.url) && <a {...link} href={sourceHref(source.url)} target="_blank" rel="noopener noreferrer" aria-label={`${source.title} (new tab)`}>{source.url}<span aria-hidden="true"> ↗</span></a>}{source.description && <p {...description}>{source.description}</p>}{source.quote && <blockquote {...quote}>{source.quote}</blockquote>}</div>, document.body)}
  </span>;
});
