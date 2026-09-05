"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../tokens.stylex";
import { rs } from "../rs";

export interface VirtualItem { id: string; label: string; content?: React.ReactNode }
export interface VirtualListProps extends React.HTMLAttributes<HTMLDivElement> {
  items: VirtualItem[];
  label: string;
  /** Fixed row height, at least 44px. */
  rowHeight?: number;
  height?: number;
  overscan?: number;
  emptyLabel?: string;
}
const styles = stylex.create({
  root: { overflowY: "auto", overscrollBehavior: "contain", borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.divider, minWidth: 0, color: vlak.ink, position: "relative" },
  canvas: { position: "relative", minWidth: 0 },
  item: { position: "absolute", insetInline: 0, insetBlockStart: 0, boxSizing: "border-box", display: "flex", alignItems: "center", paddingInline: "0.75rem", borderBottomWidth: vlak.hairline, borderBottomStyle: "solid", borderBottomColor: vlak.divider, outlineColor: vlak.ink, outlineOffset: -2, overflow: "hidden" },
  empty: { padding: "1rem", color: vlak.gray, lineHeight: 1.45 },
});

/** Fixed-height windowing with a retained focused row and keyboard navigation. */
export const VirtualList = React.forwardRef<HTMLDivElement, VirtualListProps>(function VirtualList({ items, label, rowHeight = 44, height = 352, overscan = 4, emptyLabel = "No items", className, style, onScroll, ...props }, ref) {
  const rowSize = Math.max(44, Number.isFinite(rowHeight) ? rowHeight : 44);
  const viewport = Math.max(rowSize, Number.isFinite(height) ? height : 352);
  const extra = Math.max(0, Math.min(50, Number.isFinite(overscan) ? Math.floor(overscan) : 4));
  const local = React.useRef<HTMLDivElement | null>(null);
  const rows = React.useRef(new Map<string, HTMLDivElement>());
  const [scroll, setScroll] = React.useState(0);
  const [activeId, setActiveId] = React.useState<string>();
  const pendingFocus = React.useRef<string | null>(null);
  const pendingRemoval = React.useRef(false);
  const lastIndex = React.useRef(0);
  const indexById = React.useMemo(() => new Map(items.map((item, index) => [item.id, index])), [items]);
  const latestIndexes = React.useRef(indexById);
  latestIndexes.current = indexById;
  const found = activeId == null ? undefined : indexById.get(activeId);
  const activeIndex = found ?? Math.max(0, Math.min(lastIndex.current, items.length - 1));
  if (found != null) lastIndex.current = found;
  const start = Math.max(0, Math.min(Math.max(0, items.length - 1), Math.floor(scroll / rowSize) - extra));
  const end = Math.min(items.length, start + Math.ceil(viewport / rowSize) + extra * 2);
  const indexes = new Set(Array.from({ length: end - start }, (_, index) => start + index));
  if (items.length) indexes.add(activeIndex);
  const focus = React.useCallback((index: number) => {
    const item = items[index]; if (!item || !local.current) return;
    const top = index * rowSize; let nextScroll = local.current.scrollTop;
    if (top < nextScroll) nextScroll = top; else if (top + rowSize > nextScroll + viewport) nextScroll = top + rowSize - viewport;
    local.current.scrollTop = nextScroll;
    const mounted = rows.current.get(item.id);
    pendingFocus.current = mounted ? null : item.id;
    setScroll(nextScroll); setActiveId(item.id);
    mounted?.focus({ preventScroll: true });
  }, [items, rowSize, viewport]);
  React.useLayoutEffect(() => {
    const max = Math.max(0, items.length * rowSize - viewport);
    if (local.current && local.current.scrollTop > max) { local.current.scrollTop = max; setScroll(max); }
    if (pendingRemoval.current) {
      pendingRemoval.current = false;
      if (items.length) focus(activeIndex); else local.current?.focus();
    }
    if (pendingFocus.current) { rows.current.get(pendingFocus.current)?.focus({ preventScroll: true }); pendingFocus.current = null; }
  }, [items, rowSize, viewport, activeIndex, focus]);
  const root = rs(["rs-virtual-list", className], styles.root);
  const canvas = rs(["rs-virtual-list-canvas"], styles.canvas);
  const itemStyle = rs(["rs-virtual-list-item"], styles.item);
  const empty = rs(["rs-virtual-list-empty"], styles.empty);
  return <div ref={element => { local.current = element; if (typeof ref === "function") ref(element); else if (ref) ref.current = element; }} role="list" aria-label={label} tabIndex={items.length ? undefined : 0} {...props} className={root.className} style={{ ...root.style, height: viewport, ...style }} onScroll={event => { setScroll(event.currentTarget.scrollTop); onScroll?.(event); }}>
    <div {...canvas} role="none" style={{ ...canvas.style, height: items.length * rowSize }}>{[...indexes].sort((a, b) => a - b).map(index => { const item = items[index]!; return <div key={item.id} ref={element => { if (element) rows.current.set(item.id, element); else { if (!latestIndexes.current.has(item.id) && rows.current.get(item.id)?.contains(document.activeElement)) pendingRemoval.current = true; rows.current.delete(item.id); } }} {...itemStyle} style={{ ...itemStyle.style, height: rowSize, transform: `translateY(${index * rowSize}px)` }} role="listitem" aria-posinset={index + 1} aria-setsize={items.length} tabIndex={index === activeIndex ? 0 : -1} onFocus={() => setActiveId(item.id)} onKeyDown={event => {
      if (event.target !== event.currentTarget) return;
      const target = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : event.key === "ArrowDown" ? Math.min(items.length - 1, index + 1) : event.key === "ArrowUp" ? Math.max(0, index - 1) : -1;
      if (target >= 0) { event.preventDefault(); focus(target); }
    }}>{item.content ?? item.label}</div>; })}</div>{!items.length && <div {...empty} role="listitem">{emptyLabel}</div>}
  </div>;
});
