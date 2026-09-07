"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";

export interface WellPosition { row: string; column: string }
export interface WellRecord extends WellPosition { status: string; label?: string; disabled?: boolean }
export interface WellPlateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue"> {
  label: string;
  rows: readonly string[];
  columns: readonly string[];
  wells: readonly WellRecord[];
  value?: WellPosition | null;
  defaultValue?: WellPosition | null;
  onValueChange?: (value: WellPosition) => void;
  description?: React.ReactNode;
  disabled?: boolean;
  /** Static well cells add no tab stops; their scroll container remains focusable. */
  readOnly?: boolean;
}

const styles = stylex.create({
  root: { display: "grid", gap: "0.75rem", minWidth: 0, maxWidth: "100%", color: vlak.ink, lineHeight: 1.45 },
  label: { margin: 0, fontSize: "0.875rem", fontWeight: 600 },
  description: { margin: 0, fontSize: "0.75rem", color: vlak.gray, overflowWrap: "anywhere", maxWidth: "66ch" },
  scroll: { maxWidth: "100%", overflowX: "auto", overscrollBehaviorX: "contain", padding: "0.25rem", outlineWidth: { default: null, ":focus-visible": 2 }, outlineStyle: { default: null, ":focus-visible": "solid" }, outlineColor: vlak.ink, outlineOffset: 2 },
  table: { borderCollapse: "separate", borderSpacing: "0.25rem", width: "max-content" },
  heading: { minWidth: vlak.hit, height: vlak.hit, padding: "0.25rem", boxSizing: "border-box", fontSize: "0.75rem", fontWeight: 500, textAlign: "center" },
  cell: { padding: 0, minWidth: vlak.hit },
  well: { minHeight: vlak.hit, minWidth: vlak.hit, width: "100%", boxSizing: "border-box", display: "grid", alignContent: "center", gap: "0.125rem", padding: "0.5rem", borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.controlBorder, borderRadius: vlak.radiusSm, backgroundColor: vlak.paper, color: vlak.ink, fontFamily: "inherit", fontSize: "0.75rem", lineHeight: 1.45, cursor: "pointer", outlineWidth: { default: null, ":focus-visible": 2 }, outlineStyle: { default: null, ":focus-visible": "solid" }, outlineColor: vlak.ink, outlineOffset: 2 },
  selected: { backgroundColor: { default: vlak.ink, [mq.forcedColors]: "Highlight" }, color: { default: vlak.paper, [mq.forcedColors]: "HighlightText" } },
  unavailable: { opacity: { default: 0.55, [mq.forcedColors]: 1 }, cursor: "default" },
  static: { cursor: "default" },
  coordinate: { fontWeight: 600, fontVariantNumeric: "tabular-nums" },
});

const positionKey = (position: WellPosition) => JSON.stringify([position.row, position.column]);

/** A plate of up to 1536 wells, with roving keyboard focus and explicit unrecorded cells. */
export const WellPlate = React.forwardRef<HTMLDivElement, WellPlateProps>(function WellPlate({ label, rows, columns, wells, value, defaultValue = null, onValueChange, description, disabled = false, readOnly = false, className, style, children, ...props }, ref) {
  const [inner, setInner] = React.useState(defaultValue);
  const current = value === undefined ? inner : value;
  const [focused, setFocused] = React.useState<string | null>(null);
  const controls = React.useRef(new Map<string, HTMLButtonElement>());
  const id = React.useId();
  const bounded = rows.length > 0 && columns.length > 0 && rows.length <= 1536 && columns.length <= 1536 && rows.length * columns.length <= 1536 && wells.length <= 1536;
  const validLayout = bounded && rows.every(row => row.trim()) && columns.every(column => column.trim()) && new Set(rows).size === rows.length && new Set(columns).size === columns.length;
  const records = new Map<string, WellRecord>();
  let validRecords = true;
  if (validLayout) for (const well of wells) {
    const key = positionKey(well);
    if (!rows.includes(well.row) || !columns.includes(well.column) || records.has(key)) { validRecords = false; break; }
    records.set(key, well);
  }
  const valid = validLayout && validRecords;
  const positions = valid ? rows.flatMap(row => columns.map(column => ({ row, column }))) : [];
  const enabled = positions.filter(position => !disabled && !records.get(positionKey(position))?.disabled);
  const activeKey = enabled.some(position => positionKey(position) === focused) ? focused : enabled.find(position => current && positionKey(position) === positionKey(current)) ? positionKey(current!) : enabled[0] ? positionKey(enabled[0]) : null;
  const choose = (position: WellPosition) => { if (value === undefined) setInner(position); onValueChange?.(position); };
  const navigate = (event: React.KeyboardEvent<HTMLButtonElement>, rowIndex: number, columnIndex: number) => {
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    let candidates: WellPosition[] = [];
    if (event.key === "Home" || event.key === "End") {
      candidates = event.ctrlKey ? positions : positions.slice(rowIndex * columns.length, (rowIndex + 1) * columns.length);
      if (event.key === "End") candidates = [...candidates].reverse();
    } else {
      const rowDelta = event.key === "ArrowDown" ? 1 : event.key === "ArrowUp" ? -1 : 0;
      const columnDelta = event.key === "ArrowRight" ? (rtl ? -1 : 1) : event.key === "ArrowLeft" ? (rtl ? 1 : -1) : 0;
      if (!rowDelta && !columnDelta) return;
      for (let row = rowIndex + rowDelta, column = columnIndex + columnDelta; row >= 0 && row < rows.length && column >= 0 && column < columns.length; row += rowDelta, column += columnDelta) candidates.push({ row: rows[row]!, column: columns[column]! });
    }
    event.preventDefault();
    const target = candidates.find(position => !disabled && !records.get(positionKey(position))?.disabled);
    if (target) { const key = positionKey(target); setFocused(key); controls.current.get(key)?.focus(); }
  };
  const root = rs(["rs-well-plate", className], styles.root);
  const heading = rs(["rs-well-plate-label"], styles.label);
  const copy = rs(["rs-well-plate-description"], styles.description);
  const scroll = rs(["rs-well-plate-scroll"], styles.scroll);
  const table = rs(["rs-well-plate-table"], styles.table);
  const header = rs(["rs-well-plate-heading"], styles.heading);
  const cell = rs(["rs-well-plate-cell"], styles.cell);
  const coordinate = rs(["rs-well-plate-coordinate"], styles.coordinate);
  return <div {...props} ref={ref} className={root.className} style={{ ...root.style, ...style }}>
    <p {...heading} id={`${id}-label`}>{label}</p>
    {description != null && <div {...copy}>{description}</div>}
    {!valid ? <p {...copy}>{!rows.length || !columns.length ? "No plate layout supplied" : !bounded ? "Plate unavailable: supply at most 1536 wells" : "Plate unavailable: row, column or well records are invalid"}</p> : <>
      {!readOnly && <p {...copy} id={`${id}-keys`}>Arrow keys move between wells. Enter or Space selects a well.</p>}
      <div {...scroll} role="region" aria-labelledby={`${id}-label`} tabIndex={readOnly || !enabled.length ? 0 : undefined}><table {...table} role={readOnly ? undefined : "grid"} aria-labelledby={`${id}-label`} aria-describedby={readOnly ? undefined : `${id}-keys`}>
        <thead><tr><th {...header} scope="col">Well</th>{columns.map(column => <th key={column} {...header} scope="col">{column}</th>)}</tr></thead>
        <tbody>{rows.map((row, rowIndex) => <tr key={row}><th {...header} scope="row">{row}</th>{columns.map((column, columnIndex) => {
          const position = { row, column };
          const key = positionKey(position);
          const record = records.get(key);
          const selected = current != null && positionKey(current) === key;
          const unavailable = disabled || record?.disabled;
          const paint = rs(["rs-well-plate-well", selected && "rs-well-plate-selected", unavailable && "rs-well-plate-unavailable", readOnly && "rs-well-plate-static"], styles.well, selected && styles.selected, unavailable && styles.unavailable, readOnly && styles.static);
          const status = record?.status.trim() || "Unrecorded";
          const contents = <><span {...coordinate}>{record?.label ?? `${row}${column}`}</span><span>{status}</span></>;
          if (readOnly) return <td key={column} {...cell}><div {...paint}>{contents}{selected && <span>Selected</span>}</div></td>;
          // Native cells inherit gridcell semantics from the table's grid role;
          // the contained button owns the roving focus target.
          return <td key={column} {...cell} aria-selected={selected}><button {...paint} type="button" ref={node => { if (node) controls.current.set(key, node); else controls.current.delete(key); }} disabled={unavailable} tabIndex={key === activeKey ? 0 : -1} aria-label={`Well ${row}, ${column}${record?.label ? `, ${record.label}` : ""}: ${status}`} onFocus={() => setFocused(key)} onKeyDown={event => navigate(event, rowIndex, columnIndex)} onClick={() => choose(position)}>{contents}</button></td>;
        })}</tr>)}</tbody>
      </table></div>
    </>}
    {children}
  </div>;
});
