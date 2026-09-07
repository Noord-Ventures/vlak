"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { useInputValue } from "../use-input-value";
import { useMergedRefs } from "../merge-refs";

export interface PatchPort { id: string; label: string; group?: string; signalType: string }
export interface PatchConnection { sourceId: string; destinationId: string }
export interface PatchbayProps extends Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, "defaultValue" | "onChange"> {
  label: React.ReactNode;
  sources: PatchPort[];
  destinations: PatchPort[];
  value?: PatchConnection[];
  defaultValue?: PatchConnection[];
  onValueChange?: (connections: PatchConnection[]) => void;
  /** Additional host constraints. Matching signal types are required by default. */
  getBlockReason?: (source: PatchPort, destination: PatchPort) => string | null;
  readOnly?: boolean;
}

const styles = stylex.create({
  root: { display: "grid", gap: "0.75rem", minWidth: 0, margin: 0, padding: 0, borderWidth: 0, color: vlak.ink },
  legend: { marginBottom: "0.75rem", padding: 0, fontSize: vlak.controlFs, fontWeight: 600, lineHeight: 1.45 },
  viewport: { minWidth: 0, maxWidth: "100%", overflow: "auto", borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.divider },
  table: { width: "100%", borderCollapse: "collapse", fontSize: vlak.controlLabel, lineHeight: 1.45 },
  header: { textAlign: "start", verticalAlign: "top", minWidth: "7rem", padding: "0.625rem", borderBottomWidth: vlak.hairline, borderBottomStyle: "solid", borderBottomColor: vlak.divider, fontWeight: 500 },
  detail: { display: "block", fontWeight: 400, color: vlak.gray, fontSize: vlak.controlLabel, lineHeight: 1.45 },
  cell: { textAlign: "center", verticalAlign: "top", padding: "0.5rem", borderBottomWidth: vlak.hairline, borderBottomStyle: "solid", borderBottomColor: vlak.divider },
  control: { position: "relative", display: "inline-grid", placeItems: "center", minWidth: vlak.hit, minHeight: vlak.hit, boxSizing: "border-box", borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.controlBorder, borderRadius: vlak.radiusSm, backgroundColor: vlak.paper, color: vlak.ink, cursor: "pointer", outlineWidth: { default: null, ":focus-within": 2 }, outlineStyle: { default: null, ":focus-within": "solid" }, outlineColor: vlak.ink, outlineOffset: 2 },
  connected: { backgroundColor: { default: vlak.ink, [mq.forcedColors]: "Highlight" }, color: { default: vlak.paper, [mq.forcedColors]: "HighlightText" } },
  blocked: { cursor: "default", borderStyle: "dashed" },
  input: { position: "absolute", inset: "-1px", width: "calc(100% + 2px)", height: "calc(100% + 2px)", margin: 0, opacity: 0, cursor: "inherit" },
  note: { margin: 0, fontSize: vlak.controlLabel, color: vlak.gray, lineHeight: 1.45, maxWidth: "66ch" },
});

/** A connection matrix for supplied ports; the caller owns the routing engine. */
export const Patchbay = React.forwardRef<HTMLFieldSetElement, PatchbayProps>(function Patchbay({ label, sources, destinations, value, defaultValue = [], onValueChange, getBlockReason, readOnly, disabled, name, form, className, style, ...props }, ref) {
  const id = React.useId();
  const [, refresh] = React.useReducer((n: number) => n + 1, 0);
  const [current, setValue, fieldRef] = useInputValue<PatchConnection[], HTMLFieldSetElement>(value, defaultValue, onValueChange, refresh);
  const mergedRef = useMergedRefs(ref, fieldRef);
  const [focusIndex, setFocusIndex] = React.useState(0);
  const controls = React.useRef(new Map<number, HTMLInputElement>());
  const cells = sources.flatMap((source) => destinations.map((destination) => {
    const connected = current.some((connection) => connection.sourceId === source.id && connection.destinationId === destination.id);
    const reason = !source.signalType.trim() || !destination.signalType.trim() ? "Signal type unavailable." : source.signalType !== destination.signalType ? `Signal types differ: ${source.signalType} to ${destination.signalType}.` : getBlockReason?.(source, destination) ?? null;
    return { source, destination, connected, reason, blocked: Boolean(disabled || readOnly || (reason && !connected)) };
  }));
  const tabIndex = cells[focusIndex] && !cells[focusIndex]!.blocked ? focusIndex : cells.findIndex((cell) => !cell.blocked);
  const unknown = current.filter((connection) => !sources.some((source) => source.id === connection.sourceId) || !destinations.some((destination) => destination.id === connection.destinationId));
  const moveFocus = (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    const columns = destinations.length;
    const key = event.key;
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(key)) return;
    event.preventDefault();
    const rowStart = Math.floor(index / columns) * columns;
    let target = key === "Home" ? (event.ctrlKey ? 0 : rowStart) : key === "End" ? (event.ctrlKey ? cells.length - 1 : rowStart + columns - 1) : index + (key === "ArrowUp" ? -columns : key === "ArrowDown" ? columns : key === "ArrowLeft" ? -1 : 1);
    const direction = key === "ArrowLeft" || key === "ArrowUp" || key === "End" ? -1 : 1;
    const stride = key === "ArrowUp" || key === "ArrowDown" ? columns : 1;
    while (target >= 0 && target < cells.length) {
      if ((key === "ArrowLeft" || key === "ArrowRight" || ((key === "Home" || key === "End") && !event.ctrlKey)) && Math.floor(target / columns) !== Math.floor(index / columns)) break;
      if (!cells[target]!.blocked) { controls.current.get(target)?.focus(); break; }
      target += direction * stride;
    }
  };
  const root = rs(["rs-patchbay", className], styles.root);
  const legend = rs(["rs-patchbay-legend"], styles.legend);
  const viewport = rs(["rs-patchbay-viewport"], styles.viewport);
  const table = rs(["rs-patchbay-table"], styles.table);
  const header = rs(["rs-patchbay-header"], styles.header);
  const detail = rs(["rs-patchbay-detail"], styles.detail);
  const cellStyle = rs(["rs-patchbay-cell"], styles.cell);
  const input = rs(["rs-patchbay-input"], styles.input);
  const note = rs(["rs-patchbay-note"], styles.note);
  return <fieldset {...props} ref={mergedRef} name={name} form={form} disabled={disabled} className={root.className} style={{ ...root.style, ...style }}>
    <legend className={legend.className} style={legend.style}>{label}</legend>
    {sources.length === 0 || destinations.length === 0 ? <p className={note.className} style={note.style}>Supply source and destination ports to edit connections.</p> : <div className={viewport.className} style={viewport.style}>
      <table className={table.className} style={table.style}><thead><tr><th scope="col" className={header.className} style={header.style}>Source / destination</th>{destinations.map((port) => <th key={port.id} scope="col" className={header.className} style={header.style}>{port.label}<span className={detail.className} style={detail.style}>{[port.group, port.signalType].filter(Boolean).join(" · ")}</span></th>)}</tr></thead><tbody>{sources.map((source, row) => <tr key={source.id}>
        <th scope="row" className={header.className} style={header.style}>{source.label}<span className={detail.className} style={detail.style}>{[source.group, source.signalType].filter(Boolean).join(" · ")}</span></th>
        {destinations.map((destination, column) => {
          const index = row * destinations.length + column;
          const cell = cells[index]!;
          const control = rs(["rs-patchbay-control", cell.connected && "rs-patchbay-connected", cell.blocked && "rs-patchbay-blocked"], styles.control, cell.connected && styles.connected, cell.blocked && styles.blocked);
          return <td key={destination.id} className={cellStyle.className} style={cellStyle.style}>
            <label className={control.className} style={control.style}><span aria-hidden="true">{cell.connected ? "✓" : cell.reason ? "×" : "+"}</span><input ref={(node) => { if (node) controls.current.set(index, node); else controls.current.delete(index); }} type="checkbox" name={name} form={form} value={JSON.stringify([source.id, destination.id])} checked={cell.connected} disabled={cell.blocked} tabIndex={index === tabIndex ? 0 : -1} aria-label={`${source.label} to ${destination.label}`} aria-describedby={cell.reason ? `${id}-reason-${index}` : undefined} className={input.className} style={input.style} onFocus={() => setFocusIndex(index)} onKeyDown={(event) => moveFocus(event, index)} onChange={() => setValue(cell.connected ? current.filter((connection) => connection.sourceId !== source.id || connection.destinationId !== destination.id) : [...current, { sourceId: source.id, destinationId: destination.id }])} /></label>
            {cell.reason && <span id={`${id}-reason-${index}`} className={detail.className} style={detail.style}>{cell.reason}{cell.connected ? " Existing connection can be removed." : ""}</span>}
          </td>;
        })}
      </tr>)}</tbody></table>
    </div>}
    {readOnly && <p className={note.className} style={note.style}>Read only</p>}
    {unknown.length > 0 && <div className={note.className} style={note.style}>Connections with unavailable ports:<ul>{unknown.map((connection, index) => <li key={index}>{connection.sourceId} to {connection.destinationId}</li>)}</ul></div>}
    {name && current.filter((connection) => readOnly || unknown.includes(connection)).map((connection, index) => <input key={index} type="hidden" name={name} form={form} value={JSON.stringify([connection.sourceId, connection.destinationId])} />)}
  </fieldset>;
});
