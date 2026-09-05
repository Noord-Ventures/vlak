"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../tokens.stylex";
import { rs } from "../rs";
import { inertAttrs } from "../compat";
import { Button } from "./button";
import { DropdownMenu } from "./dropdown-menu";

export interface OverflowAction { id: string; label: string; onAction: () => void; disabled?: boolean }
export interface OverflowListProps extends React.HTMLAttributes<HTMLDivElement> {
  items: OverflowAction[];
  label?: string;
  /** Upper bound on visible priority actions, available width may show fewer. */
  maxVisible?: number;
}
const styles = stylex.create({
  root: { position: "relative", display: "flex", alignItems: "center", gap: "0.5rem", width: "100%", minWidth: 0, color: vlak.ink },
  measure: { position: "absolute", visibility: "hidden", pointerEvents: "none", display: "flex", gap: "0.5rem", width: "max-content", insetBlockStart: 0, insetInlineStart: 0 },
  sample: { display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: vlak.hit, minHeight: vlak.hit, boxSizing: "border-box", borderWidth: vlak.hairline, borderStyle: "solid", paddingInline: "1.375rem", fontFamily: "inherit", fontSize: vlak.controlFs, letterSpacing: "-0.01em", whiteSpace: "nowrap" },
  more: { flexShrink: 0, minWidth: 0 },
});

/** Keeps priority actions in order and moves the remainder into a keyboard menu. */
export const OverflowList = React.forwardRef<HTMLDivElement, OverflowListProps>(function OverflowList({ items, label = "Actions", maxVisible = items.length, className, style, ...props }, ref) {
  const limit = Math.max(0, Math.min(items.length, Number.isFinite(maxVisible) ? Math.floor(maxVisible) : items.length));
  const [count, setCount] = React.useState(Math.min(limit, 3));
  const local = React.useRef<HTMLDivElement | null>(null);
  const measure = React.useRef<HTMLDivElement | null>(null);
  const more = React.useRef<HTMLDivElement | null>(null);
  const focusMore = React.useRef(false);
  React.useLayoutEffect(() => {
    const update = () => {
      const available = local.current?.clientWidth ?? 0; if (!available || !measure.current) return;
      const widths = [...measure.current.children].map(element => element.getBoundingClientRect().width);
      const all = widths.slice(0, items.length).reduce((total, width) => total + width, 0) + Math.max(0, items.length - 1) * 8;
      let visible = 0; let used = 0;
      if (items.length <= limit && all <= available) visible = items.length;
      else { const reserve = (widths.at(-1) ?? 120) + 8; for (let index = 0; index < limit; index++) { used += (widths[index] ?? 44) + (index ? 8 : 0); if (used + reserve > available) break; visible++; } }
      const active = local.current?.contains(document.activeElement) ? document.activeElement?.getAttribute("data-overflow-id") : null;
      if (active && items.findIndex(item => item.id === active) >= visible) focusMore.current = true;
      setCount(visible);
    };
    update();
    if (typeof ResizeObserver === "undefined" || !local.current) return;
    const observer = new ResizeObserver(update); observer.observe(local.current); if (measure.current) observer.observe(measure.current);
    return () => observer.disconnect();
  }, [items, limit]);
  React.useLayoutEffect(() => { if (focusMore.current) { more.current?.querySelector("button")?.focus(); focusMore.current = false; } });
  const visibleCount = Math.min(count, limit);
  const root = rs(["rs-overflow-list", className], styles.root);
  const measurement = rs(["rs-overflow-list-measure"], styles.measure);
  const sample = rs(["rs-overflow-list-sample"], styles.sample);
  const overflow = rs(["rs-overflow-list-more"], styles.more);
  return <div ref={element => { local.current = element; if (typeof ref === "function") ref(element); else if (ref) ref.current = element; }} role="group" aria-label={label} {...props} className={root.className} style={{ ...root.style, ...style }}>
    {items.slice(0, visibleCount).map(item => <Button key={item.id} data-overflow-id={item.id} variant="ghost" disabled={item.disabled} style={{ width: "auto", flexShrink: 0, whiteSpace: "nowrap" }} onClick={item.onAction}>{item.label}</Button>)}
    {visibleCount < items.length && <div ref={more} {...overflow}><DropdownMenu label="More actions" style={{ minWidth: 0 }} items={items.slice(visibleCount).map(item => ({ label: item.label, disabled: item.disabled, onSelect: item.onAction }))} /></div>}
    <div ref={measure} {...measurement} aria-hidden="true" {...inertAttrs(true)}>{items.map(item => <span key={item.id} {...sample}>{item.label}</span>)}<span {...sample}>More actions ▾</span></div>
  </div>;
});
