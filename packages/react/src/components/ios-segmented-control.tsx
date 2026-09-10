"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { useMergedRefs } from "../merge-refs";

export interface IOSSegmentedControlItem { id: string; label: string; disabled?: boolean }
export interface IOSSegmentedControlProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange" | "children"> {
  items: IOSSegmentedControlItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  form?: string;
  disabled?: boolean;
  label?: string;
}
const styles = stylex.create({
  root: { display: "inline-flex", alignItems: "stretch", boxSizing: "border-box", gap: 2, padding: 3, minHeight: 50, maxWidth: "100%", overflowX: "auto", fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif", borderRadius: 25, backgroundColor: vlak.controlFill, borderWidth: 1, borderStyle: "solid", borderColor: { default: vlak.controlBorder, [mq.forcedColors]: "ButtonText" } },
  item: { appearance: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "1 0 auto", minWidth: 44, minHeight: 44, boxSizing: "border-box", paddingBlock: 10, paddingInline: 16, borderWidth: 0, borderRadius: 22, backgroundColor: { default: "transparent", ":hover": { default: null, [mq.hover]: vlak.paper } }, color: vlak.ink, fontFamily: "inherit", fontSize: 15, lineHeight: "20px", fontWeight: 500, cursor: "pointer", outlineWidth: { default: 0, ":focus-visible": 2 }, outlineStyle: "solid", outlineColor: vlak.ink, outlineOffset: -2, transition: { default: "background-color 220ms ease, color 220ms ease", [mq.reduce]: "none" } },
  selected: { color: { default: vlak.ink, [mq.forcedColors]: "HighlightText" }, backgroundColor: { default: vlak.paper, [mq.forcedColors]: "Highlight" }, fontWeight: 600, forcedColorAdjust: "none" },
  disabled: { opacity: 0.45, cursor: "not-allowed" },
});

/** A mutually exclusive choice with one Tab stop and arrow-key selection. */
export const IOSSegmentedControl = React.forwardRef<HTMLDivElement, IOSSegmentedControlProps>(function IOSSegmentedControl({ items, value, defaultValue, onValueChange, name, form, disabled, label = "View", className, style, onKeyDown, ...props }, forwardedRef) {
  const initial = defaultValue ?? items.find(item => !item.disabled)?.id;
  const [inner, setInner] = React.useState(initial);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const ref = useMergedRefs(rootRef, forwardedRef);
  const controlled = value !== undefined;
  const current = controlled ? value : inner;
  const selected = items.find(item => item.id === current && !item.disabled)?.id ?? items.find(item => !item.disabled)?.id;
  React.useEffect(() => {
    const owner = form ? document.getElementById(form) : rootRef.current?.closest("form");
    let mounted = true;
    const reset = (event: Event) => queueMicrotask(() => { if (mounted && !controlled && !event.defaultPrevented) setInner(initial); });
    owner?.addEventListener("reset", reset); return () => { mounted = false; owner?.removeEventListener("reset", reset); };
  }, [controlled, initial, form]);
  const root = rs(["rs-ios-segmented-control", className], styles.root);
  const change = (next: string) => { if (!controlled) setInner(next); if (next !== selected) onValueChange?.(next); };
  return <div {...props} ref={ref} role="radiogroup" aria-label={label} aria-disabled={disabled || undefined} className={root.className} style={{ ...root.style, ...style }} onKeyDown={event => {
    onKeyDown?.(event); if (event.defaultPrevented || disabled || event.altKey || event.ctrlKey || event.metaKey) return;
    const buttons = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]:not(:disabled)')];
    const index = buttons.indexOf(event.target as HTMLButtonElement); if (index < 0) return;
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    const delta = event.key === "ArrowDown" || event.key === (rtl ? "ArrowLeft" : "ArrowRight") ? 1 : event.key === "ArrowUp" || event.key === (rtl ? "ArrowRight" : "ArrowLeft") ? -1 : 0;
    const target = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : delta ? (index + delta + buttons.length) % buttons.length : -1;
    if (target < 0) return; event.preventDefault(); const button = buttons[target]!; button.focus(); change(button.dataset.value!);
  }}>{items.map(item => {
    const active = item.id === selected;
    const off = disabled || item.disabled;
    const segment = rs(["rs-ios-segmented-control-item", active && "rs-ios-segmented-control-selected", off && "rs-ios-segmented-control-disabled"], styles.item, active && styles.selected, off && styles.disabled);
    return <button {...segment} key={item.id} type="button" role="radio" aria-checked={active} data-value={item.id} disabled={off} tabIndex={active && !off ? 0 : -1} onClick={() => change(item.id)}>{item.label}</button>;
  })}{name && <input type="hidden" name={name} form={form} value={selected ?? ""} disabled={disabled || !selected} />}</div>;
});
