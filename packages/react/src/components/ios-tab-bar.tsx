"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";

export interface IOSTabBarItem extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children" | "value"> {
  id: string;
  label: string;
  icon?: React.ReactNode;
  panelId?: string;
  /** Optional stable DOM ID for a panel's aria-labelledby. */
  buttonId?: string;
}
export interface IOSTabBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange" | "children"> {
  items: IOSTabBarItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: "horizontal" | "vertical";
  label?: string;
}
const styles = stylex.create({
  root: { display: "inline-flex", boxSizing: "border-box", alignItems: "stretch", gap: 2, padding: 6, maxWidth: "100%", minHeight: 62, overflowX: "auto", borderRadius: 31, borderWidth: 1, borderStyle: "solid", borderColor: { default: vlak.controlBorder, [mq.forcedColors]: "ButtonText" }, backgroundColor: vlak.controlFill, color: vlak.ink, fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" },
  vertical: { flexDirection: "column", width: 62, minWidth: 62, maxHeight: "100%", overflowY: "auto", overflowX: "hidden", minHeight: 0 },
  tab: { appearance: "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: "1 0 48px", gap: 2, minWidth: 48, minHeight: 48, boxSizing: "border-box", paddingBlock: 4, paddingInline: 12, borderRadius: 24, borderWidth: 0, backgroundColor: { default: "transparent", ":hover": { default: null, [mq.hover]: vlak.paper } }, color: vlak.ink, fontFamily: "inherit", fontSize: 11, lineHeight: "14px", fontWeight: 500, cursor: "pointer", outlineWidth: { default: 0, ":focus-visible": 2 }, outlineStyle: "solid", outlineColor: vlak.ink, outlineOffset: -2, transition: { default: "background-color 200ms ease, color 200ms ease", [mq.reduce]: "none" } },
  active: { color: { default: vlak.ink, [mq.forcedColors]: "HighlightText" }, backgroundColor: { default: vlak.paper, [mq.forcedColors]: "Highlight" }, fontWeight: 600, forcedColorAdjust: "none" },
  disabled: { opacity: 0.45, cursor: "not-allowed" },
  symbol: { display: "inline-flex", width: 24, height: 24, alignItems: "center", justifyContent: "center" },
  verticalTab: { padding: 0, flex: "0 0 48px" },
  verticalLabel: { position: "absolute", width: 1, height: 1, overflow: "hidden", clipPath: "inset(50%)", whiteSpace: "nowrap" },
});

/** Automatically activated peer tabs. Supply panelId for the associated content. */
export const IOSTabBar = React.forwardRef<HTMLDivElement, IOSTabBarProps>(function IOSTabBar({ items, value, defaultValue, onValueChange, orientation = "horizontal", label = "App navigation", className, style, onKeyDown, ...props }, ref) {
  const [inner, setInner] = React.useState(defaultValue ?? items.find(item => !item.disabled)?.id);
  const base = React.useId();
  const controlled = value !== undefined;
  const current = controlled ? value : inner;
  const selected = items.find(item => item.id === current && !item.disabled)?.id ?? items.find(item => !item.disabled)?.id;
  const vertical = orientation === "vertical";
  const root = rs(["rs-ios-tab-bar", vertical && "rs-ios-tab-bar-vertical", className], styles.root, vertical && styles.vertical);
  const symbol = rs(["rs-ios-tab-bar-symbol"], styles.symbol);
  const hidden = rs(["rs-ios-tab-bar-vertical-label"], styles.verticalLabel);
  const change = (next: string) => { if (!controlled) setInner(next); if (next !== selected) onValueChange?.(next); };
  return <div {...props} ref={ref} role="tablist" aria-label={label} aria-orientation={orientation} className={root.className} style={{ ...root.style, ...style }} onKeyDown={event => {
    onKeyDown?.(event); if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    const tabs = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)')];
    const index = tabs.indexOf(event.target as HTMLButtonElement); if (index < 0) return;
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    const previous = vertical ? "ArrowUp" : rtl ? "ArrowRight" : "ArrowLeft";
    const next = vertical ? "ArrowDown" : rtl ? "ArrowLeft" : "ArrowRight";
    const target = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : event.key === next ? (index + 1) % tabs.length : event.key === previous ? (index - 1 + tabs.length) % tabs.length : -1;
    if (target < 0) return; event.preventDefault(); const tab = tabs[target]!; tab.focus(); change(tab.dataset.value!);
  }}>{items.map(({ id, label: itemLabel, icon, panelId, buttonId, disabled, className: itemClass, style: itemStyle, onClick, ...buttonProps }) => {
    const active = id === selected;
    const tab = rs(["rs-ios-tab-bar-tab", active && "rs-ios-tab-bar-active", vertical && "rs-ios-tab-bar-tab-vertical", disabled && "rs-ios-tab-bar-disabled", itemClass], styles.tab, active && styles.active, vertical && styles.verticalTab, disabled && styles.disabled);
    return <button {...buttonProps} key={id} id={buttonId ?? `${base}-${id}`} type="button" role="tab" data-value={id} disabled={disabled} aria-selected={active} aria-controls={panelId} tabIndex={active ? 0 : -1} className={tab.className} style={{ ...tab.style, ...itemStyle }} onClick={event => { onClick?.(event); if (!event.defaultPrevented) change(id); }}>{icon && <span {...symbol} aria-hidden="true">{icon}</span>}<span {...(vertical && icon ? hidden : {})}>{itemLabel}</span></button>;
  })}</div>;
});
