"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../tokens.stylex";
import { rs } from "../rs";
import { Button } from "./button";
import { Icon } from "./icon";
import { NativeSelect } from "./native-select";

export interface KanbanColumn { id: string; label: string }
export interface KanbanCard { id: string; title: string; columnId: string; description?: React.ReactNode; disabled?: boolean }
export interface KanbanBoardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue"> {
  columns: readonly KanbanColumn[];
  value?: KanbanCard[];
  defaultValue?: KanbanCard[];
  onValueChange?: (cards: KanbanCard[]) => void;
  label?: string;
}
const styles = stylex.create({
  root: { display: "flex", flexDirection: "column", width: "100%", minWidth: 0, gap: "0.75rem", color: vlak.ink },
  columns: { display: "grid", gridAutoFlow: "column", gridAutoColumns: "minmax(min(100%, 17rem), 1fr)", gap: "1rem", width: "100%", minWidth: 0, maxWidth: "100%", boxSizing: "border-box", overflowX: "auto", overscrollBehaviorX: "contain", padding: "0.25rem", scrollPaddingInline: "0.25rem", scrollSnapType: "x proximity", outlineColor: vlak.ink, outlineOffset: -2 },
  column: { display: "flex", flexDirection: "column", alignSelf: "start", gap: "0.75rem", minWidth: 0, borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.divider, borderRadius: vlak.radiusSm, padding: "0.5rem", scrollSnapAlign: "start" },
  heading: { margin: 0, paddingInline: "0.75rem", minHeight: vlak.hit, fontSize: "0.9375rem", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", overflowWrap: "anywhere" },
  list: { display: "grid", gap: "0.75rem", listStyleType: "none", margin: 0, padding: 0, minWidth: 0 },
  card: { display: "grid", gap: "0.75rem", minWidth: 0, padding: "0.75rem", borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.divider, borderRadius: vlak.radiusSm, backgroundColor: vlak.paper, fontSize: "0.875rem", lineHeight: 1.45 },
  header: { display: "grid", gridTemplateColumns: `minmax(0, 1fr) ${vlak.hit}`, alignItems: "center", gap: "0.5rem", minWidth: 0 },
  title: { fontWeight: 600, overflowWrap: "anywhere" },
  detail: { color: vlak.gray, overflowWrap: "anywhere" },
  controls: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem", minWidth: 0 },
  destination: { flex: "1 1 8rem", minWidth: 0 },
  reorder: { display: "flex", gap: "0.25rem", marginInlineStart: "auto", flexShrink: 0 },
  action: { width: vlak.hit, minWidth: vlak.hit, height: vlak.hit, minHeight: vlak.hit, padding: 0, flexShrink: 0, borderRadius: vlak.radiusSm },
  status: { margin: 0, paddingInline: "0.75rem", color: vlak.gray, fontSize: "0.75rem", lineHeight: 1.45 },
  help: { position: "absolute", width: 1, height: 1, overflow: "hidden", clipPath: "inset(50%)", whiteSpace: "nowrap" },
});

/** Movable cards with drag, keyboard reordering, and named destination selectors. */
export const KanbanBoard = React.forwardRef<HTMLDivElement, KanbanBoardProps>(function KanbanBoard({ columns, value, defaultValue = [], onValueChange, label = "Board", className, style, ...props }, ref) {
  const [inner, setInner] = React.useState(defaultValue);
  const cards = value ?? inner;
  const [announcement, setAnnouncement] = React.useState("");
  const dragging = React.useRef<string | null>(null);
  const destinations = React.useRef(new Map<string, HTMLSelectElement>());
  const handles = React.useRef(new Map<string, HTMLButtonElement>());
  const pending = React.useRef<{ id: string; order: Array<{ id: string; columnId: string }>; focus: "destination" | "handle" | null; message: string } | null>(null);
  React.useLayoutEffect(() => {
    const request = pending.current;
    if (!request || request.order.length !== cards.length || !request.order.every((entry, index) => entry.id === cards[index]?.id && entry.columnId === cards[index]?.columnId)) return;
    pending.current = null;
    setAnnouncement(request.message);
    if (request.focus === "destination") destinations.current.get(request.id)?.focus();
    else if (request.focus === "handle") handles.current.get(request.id)?.focus();
  }, [cards]);
  const commit = (next: KanbanCard[], id: string, message: string, focus: "destination" | "handle" | null) => {
    pending.current = { id, order: next.map(card => ({ id: card.id, columnId: card.columnId })), message, focus };
    if (value === undefined) setInner(next);
    onValueChange?.(next);
  };
  const reorder = (id: string, destination: number) => {
    const item = cards.find(card => card.id === id);
    if (!item || item.disabled) return;
    const items = cards.filter(card => card.columnId === item.columnId);
    const source = items.findIndex(card => card.id === id);
    if (destination < 0 || destination >= items.length || source === destination) return;
    const ordered = [...items]; ordered.splice(source, 1); ordered.splice(destination, 0, item);
    let at = 0;
    commit(cards.map(card => card.columnId === item.columnId ? ordered[at++]! : card), id, `${item.title}, position ${destination + 1} of ${items.length}`, "handle");
  };
  const move = (id: string, columnId: string, before?: number) => {
    const item = cards.find(card => card.id === id);
    const destination = columns.find(column => column.id === columnId);
    if (!item || item.disabled || !destination || item.columnId === columnId) return;
    const remaining = cards.filter(card => card.id !== id);
    const target = before == null ? undefined : remaining.filter(card => card.columnId === columnId)[before];
    const insertAt = target ? remaining.findIndex(card => card.id === target.id) : remaining.length;
    remaining.splice(insertAt, 0, { ...item, columnId });
    const focus = document.activeElement === destinations.current.get(id) ? "destination" : document.activeElement === handles.current.get(id) ? "handle" : null;
    commit(remaining, id, `${item.title} moved to ${destination.label}.`, focus);
  };
  const root = rs(["rs-kanban-board", className], styles.root);
  const columnGrid = rs(["rs-kanban-columns"], styles.columns);
  const columnStyle = rs(["rs-kanban-column"], styles.column);
  const heading = rs(["rs-kanban-heading"], styles.heading);
  const list = rs(["rs-kanban-list"], styles.list);
  const cardStyle = rs(["rs-kanban-card"], styles.card);
  const header = rs(["rs-kanban-card-header"], styles.header);
  const title = rs(["rs-kanban-title"], styles.title);
  const detail = rs(["rs-kanban-detail"], styles.detail);
  const controls = rs(["rs-kanban-controls"], styles.controls);
  const destination = rs(["rs-kanban-destination"], styles.destination);
  const reorderStyle = rs(["rs-kanban-reorder"], styles.reorder);
  const action = rs(["rs-kanban-action"], styles.action);
  const actionStyle = { ...action.style, width: vlak.hit, padding: 0 };
  const status = rs(["rs-kanban-status"], styles.status);
  const help = rs(["rs-kanban-help"], styles.help);
  const id = React.useId();
  return <div ref={ref} role="region" aria-label={label} {...props} className={root.className} style={{ ...root.style, ...style }}>
    <span {...help} id={`${id}-help`}>Use the move buttons, or focus a card handle and press Alt with Arrow up or Arrow down. Scroll horizontally to see more columns.</span>
    <div {...columnGrid} role="group" aria-label={`${label} columns`} tabIndex={0}>
      {columns.map((column, columnIndex) => { const items = cards.filter(card => card.columnId === column.id); const titleId = `${id}-${columnIndex}`; return <section key={column.id} {...columnStyle} aria-labelledby={titleId} onDragOver={event => { if (dragging.current) event.preventDefault(); }} onDrop={event => { if (dragging.current) { event.preventDefault(); move(dragging.current, column.id); dragging.current = null; } }}>
        <h3 {...heading} id={titleId}>{column.label}<span>{items.length}</span></h3>
        <ol {...list} aria-label={`${column.label} cards`}>{items.map((card, index) => <li key={card.id} {...cardStyle} onDragOver={event => { if (dragging.current) event.preventDefault(); }} onDrop={event => {
          const source = cards.find(item => item.id === dragging.current);
          if (!source) return;
          event.preventDefault(); event.stopPropagation();
          if (source.columnId === column.id) reorder(source.id, index);
          else move(source.id, column.id, index);
          dragging.current = null;
        }}>
          <div {...header}>
            <span {...title}>{card.title}</span>
            <Button {...action} style={actionStyle} ref={element => { if (element) handles.current.set(card.id, element); else handles.current.delete(card.id); }} variant="ghost" disabled={card.disabled} draggable={!card.disabled} aria-label={`Move ${card.title}`} aria-describedby={`${id}-help`} onDragStart={event => { dragging.current = card.id; event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/plain", card.id); }} onDragEnd={() => { dragging.current = null; }} onKeyDown={event => {
              if (event.altKey && (event.key === "ArrowUp" || event.key === "ArrowDown")) { event.preventDefault(); reorder(card.id, index + (event.key === "ArrowUp" ? -1 : 1)); }
            }}><Icon name="grip" /></Button>
          </div>
          {card.description != null && <div {...detail}>{card.description}</div>}
          <div {...controls}>
            <div {...destination}><NativeSelect ref={element => { if (element) destinations.current.set(card.id, element); else destinations.current.delete(card.id); }} aria-label={`Move ${card.title} to`} value={card.columnId} disabled={card.disabled} onChange={event => move(card.id, event.currentTarget.value)}>{columns.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}</NativeSelect></div>
            <div {...reorderStyle}>
              <Button {...action} style={actionStyle} variant="ghost" disabled={card.disabled || index === 0} aria-label={`Move ${card.title} up`} onClick={() => reorder(card.id, index - 1)}><Icon name="arrow-up" /></Button>
              <Button {...action} style={actionStyle} variant="ghost" disabled={card.disabled || index === items.length - 1} aria-label={`Move ${card.title} down`} onClick={() => reorder(card.id, index + 1)}><Icon name="arrow-down" /></Button>
            </div>
          </div>
        </li>)}</ol>
        {items.length === 0 && <p {...status}>No cards.</p>}
      </section>; })}
    </div>
    <p {...status} role="status">{announcement}</p>
  </div>;
});
