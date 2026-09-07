"use client";
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { Button } from "./button";

export interface AlignedRead { id: string; label: string; sequence: string }
/** One-based aligned column indexes, independent of supplied genomic positions. */
export interface AlignmentSelection { startColumn: number; endColumn: number }
export interface SequenceAlignmentProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue"> {
  label: string;
  contig: string;
  referenceLabel: string;
  referenceSequence: string;
  /** One supplied one-based reference position per column; null means a reference gap. */
  positions: readonly (number | null)[];
  reads: readonly AlignedRead[];
  value?: AlignmentSelection | null;
  defaultValue?: AlignmentSelection | null;
  onValueChange?: (value: AlignmentSelection | null) => void;
  readOnly?: boolean;
}
const styles = stylex.create({
  root: { display: "grid", gap: "0.75rem", minWidth: 0, maxWidth: "100%", color: vlak.ink, lineHeight: 1.45 },
  title: { margin: 0, fontSize: "0.875rem", fontWeight: 600 },
  copy: { margin: 0, fontSize: "0.75rem", color: vlak.gray, overflowWrap: "anywhere", maxWidth: "66ch" },
  scroll: { maxWidth: "100%", minWidth: 0, overflowX: "auto", overscrollBehaviorX: "contain", padding: "0.25rem", outlineWidth: { default: null, ":focus-visible": 2 }, outlineStyle: { default: null, ":focus-visible": "solid" }, outlineColor: vlak.ink, outlineOffset: 2 },
  table: { width: "max-content", borderCollapse: "collapse", direction: "ltr" },
  heading: { padding: "0.5rem", fontSize: "0.75rem", fontWeight: 500, textAlign: "start", borderBottomWidth: vlak.hairline, borderBottomStyle: "solid", borderBottomColor: vlak.divider, whiteSpace: "nowrap" },
  column: { minWidth: vlak.hit, padding: 0, textAlign: "center", borderBottomWidth: vlak.hairline, borderBottomStyle: "solid", borderBottomColor: vlak.divider },
  base: { minWidth: vlak.hit, padding: "0.5rem", boxSizing: "border-box", textAlign: "center", fontSize: "1rem", fontFamily: "ui-monospace, monospace", borderBottomWidth: vlak.hairline, borderBottomStyle: "solid", borderBottomColor: vlak.divider },
  selected: { backgroundColor: { default: vlak.ink, [mq.forcedColors]: "Highlight" }, color: { default: vlak.paper, [mq.forcedColors]: "HighlightText" } },
  control: { minWidth: vlak.hit, minHeight: vlak.hit, padding: "0.5rem", boxSizing: "border-box", borderWidth: 0, borderRadius: 0, backgroundColor: "transparent", color: "inherit", fontFamily: "inherit", fontSize: "0.75rem", fontVariantNumeric: "tabular-nums", cursor: "pointer", outlineWidth: { default: null, ":focus-visible": 2 }, outlineStyle: { default: null, ":focus-visible": "solid" }, outlineColor: "currentColor", outlineOffset: -2 },
  actions: { display: "flex", flexWrap: "wrap", gap: "0.5rem" },
  action: { minWidth: vlak.hit, minHeight: vlak.hit, width: "auto" },
});
/** A bounded window of already aligned strings; reference positions and gaps are caller-supplied. */
export const SequenceAlignment = React.forwardRef<HTMLDivElement, SequenceAlignmentProps>(function SequenceAlignment({ label, contig, referenceLabel, referenceSequence, positions, reads, value, defaultValue = null, onValueChange, readOnly = false, className, style, children, ...props }, ref) {
  const [inner, setInner] = React.useState(defaultValue);
  const current = value === undefined ? inner : value;
  const [focusColumn, setFocusColumn] = React.useState(1);
  const anchor = React.useRef<number | null>(null);
  const buttons = React.useRef(new Map<number, HTMLButtonElement>());
  const id = React.useId();
  const bounded = positions.length <= 120 && reads.length <= 32;
  const valid = bounded && positions.length > 0 && referenceSequence.length === positions.length && /^[A-Za-z.*-]+$/.test(referenceSequence) && positions.every((position, index) => position == null ? /[-.]/.test(referenceSequence[index]!) : Number.isSafeInteger(position) && position >= 1 && !/[-.]/.test(referenceSequence[index]!)) && reads.every(read => read.sequence.length === positions.length && /^[A-Za-z.*-]+$/.test(read.sequence)) && new Set(reads.map(read => read.id)).size === reads.length;
  const validSelection = current != null && Number.isSafeInteger(current.startColumn) && Number.isSafeInteger(current.endColumn) && current.startColumn >= 1 && current.endColumn >= current.startColumn && current.endColumn <= positions.length;
  const select = (next: AlignmentSelection | null) => { if (value === undefined) setInner(next); onValueChange?.(next); };
  const choose = (column: number) => { anchor.current = column; select({ startColumn: column, endColumn: column }); };
  const move = (event: React.KeyboardEvent<HTMLButtonElement>, column: number) => {
    const next = event.key === "Home" ? 1 : event.key === "End" ? positions.length : event.key === "ArrowRight" ? Math.min(positions.length, column + 1) : event.key === "ArrowLeft" ? Math.max(1, column - 1) : null;
    if (next == null) return;
    event.preventDefault(); setFocusColumn(next); buttons.current.get(next)?.focus();
    if (event.shiftKey) { const start = anchor.current ?? (validSelection ? current.startColumn : column); anchor.current = start; select({ startColumn: Math.min(start, next), endColumn: Math.max(start, next) }); }
  };
  const root = rs(["rs-sequence-alignment", className], styles.root);
  const title = rs(["rs-sequence-alignment-title"], styles.title);
  const copy = rs(["rs-sequence-alignment-copy"], styles.copy);
  const scroll = rs(["rs-sequence-alignment-scroll"], styles.scroll);
  const table = rs(["rs-sequence-alignment-table"], styles.table);
  const heading = rs(["rs-sequence-alignment-heading"], styles.heading);
  const control = rs(["rs-sequence-alignment-control"], styles.control);
  const actions = rs(["rs-sequence-alignment-actions"], styles.actions);
  const action = rs(["rs-sequence-alignment-action"], styles.action);
  const isSelected = (column: number) => validSelection && column >= current.startColumn && column <= current.endColumn;
  return <div {...props} ref={ref} className={root.className} style={{ ...root.style, ...style }}>
    <p {...title} id={`${id}-label`}>{label}</p><p {...copy}>{contig} · 1-based reference positions; aligned columns include gaps</p>
    {!valid ? <p {...copy}>{!positions.length ? "No alignment columns supplied" : !bounded ? "Alignment unavailable: supply at most 120 columns and 32 reads" : "Alignment unavailable: sequences, positions or read identifiers are inconsistent"}</p> : <>
      {!readOnly && <p {...copy} id={`${id}-keys`}>Arrow keys move between columns. Enter selects a base; Shift with Arrow keys extends a region.</p>}
      <div {...scroll} role="region" aria-labelledby={`${id}-label`} tabIndex={readOnly ? 0 : undefined}><table {...table} aria-label={`${label}, reference and reads`} aria-describedby={!readOnly ? `${id}-keys` : undefined}>
        <thead><tr><th {...heading} scope="col">Reference position</th>{positions.map((position, index) => {
          const selected = isSelected(index + 1);
          const cell = rs(["rs-sequence-alignment-column", selected && "rs-sequence-alignment-selected"], styles.column, selected && styles.selected);
          return <th key={index} {...cell} scope="col">{readOnly ? <span>{position ?? "Gap"}</span> : <button {...control} type="button" ref={node => { if (node) buttons.current.set(index + 1, node); else buttons.current.delete(index + 1); }} tabIndex={index + 1 === Math.min(focusColumn, positions.length) ? 0 : -1} aria-pressed={selected} aria-label={`Column ${index + 1}, ${position == null ? "reference gap" : `${contig} position ${position}`}, reference ${referenceSequence[index]}`} onFocus={() => setFocusColumn(index + 1)} onKeyDown={event => move(event, index + 1)} onClick={() => choose(index + 1)}>{position ?? "Gap"}</button>}</th>;
        })}</tr></thead>
        <tbody>{[{ id: "reference", label: referenceLabel, sequence: referenceSequence }, ...reads].map((read, rowIndex) => <tr key={`${rowIndex}-${read.id}`}><th {...heading} scope="row">{read.label}</th>{[...read.sequence].map((base, index) => {
          const selected = isSelected(index + 1);
          const cell = rs(["rs-sequence-alignment-base", selected && "rs-sequence-alignment-selected"], styles.base, selected && styles.selected);
          return <td key={index} {...cell}>{base}</td>;
        })}</tr>)}</tbody>
      </table></div>
      {!readOnly && <div {...actions}><Button {...action} variant="ghost" onClick={() => { anchor.current = 1; select({ startColumn: 1, endColumn: positions.length }); }}>Select all columns</Button><Button {...action} variant="ghost" disabled={current == null} onClick={() => { anchor.current = null; select(null); }}>Clear selection</Button></div>}
      <p {...copy} role="status">{validSelection ? `Selected columns ${current.startColumn}–${current.endColumn}; reference positions ${positions.slice(current.startColumn - 1, current.endColumn).map(position => position ?? "gap").join(", ")}` : current == null ? "No columns selected" : "Selected columns unavailable"}</p>
    </>}{children}
  </div>;
});
