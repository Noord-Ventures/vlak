"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../tokens.stylex";
import { rs } from "../rs";
import { NativeSelect } from "./native-select";
import { SortableList } from "./sortable-list";

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
  columns: { display: "grid", gridAutoFlow: "column", gridAutoColumns: "minmax(17rem, 1fr)", gap: "1rem", overflowX: "auto", padding: "0.25rem", scrollSnapType: "x proximity" },
  column: { minWidth: 0, borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.divider, padding: "1rem", scrollSnapAlign: "start" },
  heading: { margin: 0, fontSize: "0.9375rem", fontWeight: 600, display: "flex", justifyContent: "space-between", gap: "0.5rem" },
  card: { display: "flex", flexDirection: "column", gap: "0.625rem", minWidth: 0, fontSize: "0.875rem", lineHeight: 1.45 },
  title: { fontWeight: 600, overflowWrap: "anywhere" },
  detail: { color: vlak.gray, overflowWrap: "anywhere" },
  status: { margin: 0, color: vlak.gray, fontSize: "0.75rem", lineHeight: 1.45 },
});

/** Movable cards with drag, keyboard reordering, and named destination selectors. */
export const KanbanBoard = React.forwardRef<HTMLDivElement, KanbanBoardProps>(function KanbanBoard({ columns, value, defaultValue = [], onValueChange, label = "Board", className, style, ...props }, ref) {
  const [inner, setInner] = React.useState(defaultValue);
  const cards = value ?? inner;
  const [announcement, setAnnouncement] = React.useState("");
  const dragging = React.useRef<string | null>(null);
  const destinations = React.useRef(new Map<string, HTMLSelectElement>());
  const restoreFocus = React.useRef<{ id: string; columnId: string } | null>(null);
  React.useEffect(() => {
    const request = restoreFocus.current;
    if (request && cards.some(card => card.id === request.id && card.columnId === request.columnId)) { destinations.current.get(request.id)?.focus(); restoreFocus.current = null; }
  }, [cards]);
  const change = (next: KanbanCard[]) => { if (value === undefined) setInner(next); onValueChange?.(next); };
  const move = (id: string, columnId: string) => { const item = cards.find(card => card.id === id); const destination = columns.find(column => column.id === columnId); if (!item || item.disabled || !destination || item.columnId === columnId) return; if (document.activeElement === destinations.current.get(id)) restoreFocus.current = { id, columnId }; change([...cards.filter(card => card.id !== id), { ...item, columnId }]); setAnnouncement(`${item.title} moved to ${destination.label}.`); };
  const root = rs(["rs-kanban-board", className], styles.root);
  const columnGrid = rs(["rs-kanban-columns"], styles.columns);
  const columnStyle = rs(["rs-kanban-column"], styles.column);
  const heading = rs(["rs-kanban-heading"], styles.heading);
  const cardStyle = rs(["rs-kanban-card"], styles.card);
  const title = rs(["rs-kanban-title"], styles.title);
  const detail = rs(["rs-kanban-detail"], styles.detail);
  const status = rs(["rs-kanban-status"], styles.status);
  const id = React.useId();
  return <div ref={ref} role="region" aria-label={label} {...props} className={root.className} style={{ ...root.style, ...style }}>
    <div {...columnGrid} onDragStart={event => { const dragged = event.dataTransfer.getData("text/plain"); if (cards.some(card => card.id === dragged && !card.disabled)) dragging.current = dragged; }} onDragEnd={() => { dragging.current = null; }}>
      {columns.map((column, columnIndex) => { const items = cards.filter(card => card.columnId === column.id); const titleId = `${id}-${columnIndex}`; return <section key={column.id} {...columnStyle} aria-labelledby={titleId} onDragOver={event => { if (dragging.current) event.preventDefault(); }} onDrop={event => { if (dragging.current) { event.preventDefault(); move(dragging.current, column.id); dragging.current = null; } }}>
        <h3 {...heading} id={titleId}>{column.label}<span>{items.length}</span></h3>
        <SortableList label={`${column.label} cards`} value={items.map(card => ({ id: card.id, label: card.title, disabled: card.disabled, content: <div {...cardStyle}><span {...title}>{card.title}</span>{card.description && <span {...detail}>{card.description}</span>}<NativeSelect ref={element => { if (element) destinations.current.set(card.id, element); else destinations.current.delete(card.id); }} aria-label={`Move ${card.title} to`} value={card.columnId} disabled={card.disabled} onChange={event => move(card.id, event.target.value)}>{columns.map(destination => <option key={destination.id} value={destination.id}>{destination.label}</option>)}</NativeSelect></div> }))} onValueChange={next => { const ordered = next.map(item => items.find(card => card.id === item.id)!); let at = 0; change(cards.map(card => card.columnId === column.id ? ordered[at++]! : card)); }} />
        {items.length === 0 && <p {...status}>No cards.</p>}
      </section>; })}
    </div>
    <p {...status} role="status">{announcement}</p>
  </div>;
});
