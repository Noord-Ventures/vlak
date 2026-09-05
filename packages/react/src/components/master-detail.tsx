"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { Button } from "./button";
import { Icon } from "./icon";

export interface MasterDetailItem { id: string; label: string; description?: string; detail: React.ReactNode }
export interface MasterDetailProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue"> {
  items: MasterDetailItem[];
  label?: string;
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (id: string | null) => void;
  emptyLabel?: string;
}
const styles = stylex.create({
  root: { display: "grid", gridTemplateColumns: { default: "minmax(12rem, 1fr) minmax(0, 2fr)", [mq.phone]: "minmax(0, 1fr)" }, gap: "1.25rem", minWidth: 0, color: vlak.ink },
  list: { display: "flex", flexDirection: "column", gap: "0.25rem", minWidth: 0 },
  hideMobile: { display: { default: null, [mq.phone]: "none" } },
  selected: { backgroundColor: vlak.controlFill, fontWeight: 600 },
  button: { display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "0.25rem", minHeight: vlak.hit, padding: "0.75rem", borderWidth: 0, borderRadius: vlak.radiusSm, backgroundColor: "transparent", color: vlak.ink, fontFamily: "inherit", fontSize: "1rem", textAlign: "start", cursor: "pointer", outlineColor: vlak.ink, outlineOffset: -2 },
  description: { color: vlak.gray, fontSize: "0.875rem", lineHeight: 1.45, fontWeight: 400 },
  detail: { minWidth: 0, overflowWrap: "anywhere" },
  title: { fontSize: "1.25rem", lineHeight: 1.2, marginBlock: "1rem", outlineColor: vlak.ink, outlineOffset: 2 },
  back: { display: { default: "none", [mq.phone]: "block" }, marginBottom: "1rem" },
});

/** List/detail selection with a mobile back path and preserved item focus. */
export const MasterDetail = React.forwardRef<HTMLDivElement, MasterDetailProps>(function MasterDetail({ items, label = "Items", value, defaultValue = null, onValueChange, emptyLabel = "Select an item to see its details", className, style, ...props }, ref) {
  const [inner, setInner] = React.useState(defaultValue);
  const current = value === undefined ? inner : value;
  const item = items.find(entry => entry.id === current);
  const heading = React.useRef<HTMLHeadingElement | null>(null);
  const buttons = React.useRef(new Map<string, HTMLButtonElement>());
  const focusTarget = React.useRef<string | "detail" | null>(null);
  React.useLayoutEffect(() => { if (focusTarget.current === "detail" && item) heading.current?.focus(); else if (focusTarget.current && !item) buttons.current.get(focusTarget.current)?.focus(); focusTarget.current = null; }, [item]);
  const choose = (id: string | null) => { focusTarget.current = id ? "detail" : item?.id ?? null; if (value === undefined) setInner(id); onValueChange?.(id); };
  const root = rs(["rs-master-detail", className], styles.root);
  const list = rs(["rs-master-detail-list", Boolean(item) && "rs-master-detail-list-hidden"], styles.list, Boolean(item) && styles.hideMobile);
  const detail = rs(["rs-master-detail-panel", !item && "rs-master-detail-panel-hidden"], styles.detail, !item && styles.hideMobile);
  const title = rs(["rs-master-detail-title"], styles.title);
  const description = rs(["rs-master-detail-description"], styles.description);
  const back = rs(["rs-master-detail-back"], styles.back);
  return <div ref={ref} {...props} className={root.className} style={{ ...root.style, ...style }}><div {...list} role="group" aria-label={label}>{items.map(entry => { const selected = entry.id === current; const button = rs(["rs-master-detail-button", selected && "rs-master-detail-selected"], styles.button, selected && styles.selected); return <button type="button" key={entry.id} ref={element => { if (element) buttons.current.set(entry.id, element); else buttons.current.delete(entry.id); }} {...button} aria-pressed={selected} onClick={() => choose(entry.id)}><span>{entry.label}</span>{entry.description && <span {...description}>{entry.description}</span>}</button>; })}{!items.length && <p>No items</p>}</div>
    <section {...detail} aria-label={item ? `${item.label} details` : `${label} details`}>{item ? <><div {...back}><Button variant="ghost" onClick={() => choose(null)}><Icon name="arrow-left" />Back to {label.toLocaleLowerCase()}</Button></div><h2 ref={heading} tabIndex={-1} {...title}>{item.label}</h2>{item.detail}</> : <p>{emptyLabel}</p>}</section>
  </div>;
});
