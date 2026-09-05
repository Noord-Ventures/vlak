"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../tokens.stylex";
import { rs } from "../rs";
import { Button } from "./button";
import { Icon } from "./icon";

export interface SortableItem { id: string; label: string; content?: React.ReactNode; disabled?: boolean }
export interface SortableListProps extends Omit<React.HTMLAttributes<HTMLOListElement>, "defaultValue"> {
  value?: SortableItem[];
  defaultValue?: SortableItem[];
  onValueChange?: (items: SortableItem[]) => void;
  label?: string;
}
const styles = stylex.create({
  root: { listStyleType: "none", margin: 0, padding: 0, width: "100%", color: vlak.ink },
  item: { display: "flex", alignItems: "center", flexWrap: "wrap", justifyContent: "space-between", gap: "0.75rem", paddingBlock: "0.75rem", borderBottomWidth: vlak.hairline, borderBottomStyle: "solid", borderBottomColor: vlak.divider },
  content: { flex: "1 1 10rem", minWidth: 0, overflowWrap: "anywhere", lineHeight: 1.45 },
  actions: { display: "flex", gap: "0.25rem" },
  status: { position: "absolute", width: 1, height: 1, overflow: "hidden", clipPath: "inset(50%)", whiteSpace: "nowrap" },
});

/** Reordering through drag, named move buttons, or Alt and the arrow keys. */
export const SortableList = React.forwardRef<HTMLOListElement, SortableListProps>(function SortableList({ value, defaultValue = [], onValueChange, label = "Reorder items", className, style, ...props }, ref) {
  const [inner, setInner] = React.useState(defaultValue);
  const items = value ?? inner;
  const [announcement, setAnnouncement] = React.useState("");
  const dragging = React.useRef<string | null>(null);
  const handles = React.useRef(new Map<string, HTMLButtonElement>());
  const pending = React.useRef<{ id: string; order: string[] } | null>(null);
  React.useLayoutEffect(() => {
    const request = pending.current;
    if (!request || request.order.length !== items.length || !request.order.every((id, index) => items[index]?.id === id)) return;
    pending.current = null;
    const index = items.findIndex(item => item.id === request.id);
    const item = items[index];
    if (item) { setAnnouncement(`${item.label}, position ${index + 1} of ${items.length}`); handles.current.get(item.id)?.focus(); }
  }, [items]);
  const move = (id: string, destination: number) => {
    const source = items.findIndex(item => item.id === id); const item = items[source];
    if (!item || item.disabled || destination < 0 || destination >= items.length || destination === source) return;
    const next = [...items]; next.splice(source, 1); next.splice(destination, 0, item);
    pending.current = { id, order: next.map(entry => entry.id) };
    if (value === undefined) setInner(next); onValueChange?.(next);
  };
  const root = rs(["rs-sortable-list", className], styles.root);
  const row = rs(["rs-sortable-list-item"], styles.item);
  const content = rs(["rs-sortable-list-content"], styles.content);
  const actions = rs(["rs-sortable-list-actions"], styles.actions);
  const status = rs(["rs-sortable-list-status"], styles.status);
  const helpId = React.useId();
  return <><span {...status} id={helpId}>Use move buttons, or focus an item handle and press Alt with Arrow up or Arrow down.</span><ol ref={ref} aria-label={label} {...props} className={root.className} style={{ ...root.style, ...style }}>
    {items.map((item, index) => <li key={item.id} {...row} onDragOver={event => { if (dragging.current) event.preventDefault(); }} onDrop={event => { event.preventDefault(); if (dragging.current) move(dragging.current, index); dragging.current = null; }}>
      <Button ref={element => { if (element) handles.current.set(item.id, element); else handles.current.delete(item.id); }} variant="ghost" style={{ width: "auto", paddingInline: "0.75rem" }} draggable={!item.disabled} disabled={item.disabled} aria-label={`Move ${item.label}`} aria-describedby={helpId} onDragStart={event => { dragging.current = item.id; event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/plain", item.id); }} onDragEnd={() => { dragging.current = null; }} onKeyDown={event => { if (event.altKey && ["ArrowUp", "ArrowDown"].includes(event.key)) { event.preventDefault(); move(item.id, index + (event.key === "ArrowUp" ? -1 : 1)); } }}><Icon name="grip" /></Button>
      <div {...content}>{item.content ?? item.label}</div><div {...actions}><Button variant="ghost" style={{ width: "auto", paddingInline: "0.75rem" }} disabled={item.disabled || index === 0} aria-label={`Move ${item.label} up`} onClick={() => move(item.id, index - 1)}><Icon name="arrow-up" /></Button><Button variant="ghost" style={{ width: "auto", paddingInline: "0.75rem" }} disabled={item.disabled || index === items.length - 1} aria-label={`Move ${item.label} down`} onClick={() => move(item.id, index + 1)}><Icon name="arrow-down" /></Button></div>
    </li>)}
  </ol><span {...status} role="status">{announcement}</span></>;
});
