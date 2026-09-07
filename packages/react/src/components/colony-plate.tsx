"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { useInputValue } from "../use-input-value";
import { useMergedRefs } from "../merge-refs";
import { Button } from "./button";

export interface ColonyMarker {
  id: string;
  label: string;
  /** Normalized plate coordinates from 0 to 100, with the origin at the upper left. */
  x: number | null;
  y: number | null;
  description?: React.ReactNode;
  disabled?: boolean;
}
export interface ColonyPlateProps extends Omit<React.HTMLAttributes<HTMLElement>, "defaultValue"> {
  label: string;
  markers: readonly ColonyMarker[];
  plateId?: string;
  source?: React.ReactNode;
  /** The source's recorded count, independent of the number of supplied marker records. */
  recordedCount?: number | null;
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (id: string | null) => void;
  readOnly?: boolean;
}
const styles = stylex.create({
  root: { display: "grid", gap: "0.75rem", minWidth: 0, margin: 0, color: vlak.ink, lineHeight: 1.45, overflowWrap: "anywhere" },
  title: { fontSize: "0.875rem", fontWeight: 600 },
  copy: { margin: 0, fontSize: "0.75rem", color: vlak.gray, maxWidth: "66ch" },
  count: { margin: 0, fontSize: "1.5rem", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" },
  body: { display: "flex", flexWrap: "wrap", alignItems: "start", gap: "1rem 1.5rem", minWidth: 0 },
  graphic: { display: "block", flex: "0 1 15rem", width: "15rem", maxWidth: "100%", height: "auto", color: { default: vlak.ink, [mq.forcedColors]: "CanvasText" } },
  dish: { fill: { default: vlak.paper, [mq.forcedColors]: "Canvas" }, stroke: "currentColor", strokeWidth: 1 },
  marker: { fill: "currentColor", stroke: "currentColor", strokeWidth: 1 },
  chosen: { fill: { default: vlak.paper, [mq.forcedColors]: "HighlightText" }, stroke: { default: vlak.ink, [mq.forcedColors]: "Highlight" }, strokeWidth: 3 },
  list: { listStyleType: "none", margin: 0, padding: 0, display: "grid", gap: "0.5rem", flex: "1 1 10rem", minWidth: 0 },
  record: { display: "grid", gap: "0.25rem", minWidth: 0, fontSize: "0.75rem" },
  control: { display: "block", width: "100%", minWidth: vlak.hit, minHeight: vlak.hit, boxSizing: "border-box", textAlign: "start", padding: "0.625rem", borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.controlBorder, borderRadius: vlak.radiusSm, backgroundColor: vlak.paper, color: vlak.ink, fontFamily: "inherit", fontSize: "0.875rem", lineHeight: 1.45, overflowWrap: "anywhere", cursor: "pointer", outlineWidth: { default: null, ":focus-visible": 2 }, outlineStyle: { default: null, ":focus-visible": "solid" }, outlineColor: vlak.ink, outlineOffset: 2 },
  selected: { backgroundColor: { default: vlak.ink, [mq.forcedColors]: "Highlight" }, color: { default: vlak.paper, [mq.forcedColors]: "HighlightText" } },
  static: { paddingBlock: "0.5rem", borderBottomWidth: vlak.hairline, borderBottomStyle: "solid", borderBottomColor: vlak.divider },
  details: { margin: 0, fontSize: "0.75rem", maxWidth: "66ch" },
  clear: { minWidth: vlak.hit, minHeight: vlak.hit, width: "auto", justifySelf: "start" },
});
const positioned = (marker: ColonyMarker) => marker.x != null && marker.y != null && Number.isFinite(marker.x) && Number.isFinite(marker.y) && Math.hypot(marker.x - 50, marker.y - 50) <= 50;
/** A supplied plate record. Marker positions and source count are never detected or inferred. */
export const ColonyPlate = React.forwardRef<HTMLElement, ColonyPlateProps>(function ColonyPlate({ label, markers, plateId, source, recordedCount, value, defaultValue = null, onValueChange, readOnly = false, className, style, children, ...props }, ref) {
  const [current, setCurrent, figureRef] = useInputValue<string | null, HTMLElement>(value, defaultValue, onValueChange);
  const merged = useMergedRefs(ref, figureRef);
  const id = React.useId();
  const bounded = markers.length <= 256;
  const valid = bounded && markers.every(marker => marker.id.trim()) && new Set(markers.map(marker => marker.id)).size === markers.length;
  const plotted = valid ? markers.filter(positioned) : [];
  const selected = valid ? markers.find(marker => marker.id === current) : undefined;
  const root = rs(["rs-colony-plate", className], styles.root);
  const title = rs(["rs-colony-plate-title"], styles.title);
  const copy = rs(["rs-colony-plate-copy"], styles.copy);
  const count = rs(["rs-colony-plate-count"], styles.count);
  const body = rs(["rs-colony-plate-body"], styles.body);
  const graphic = rs(["rs-colony-plate-graphic"], styles.graphic);
  const dish = rs(["rs-colony-plate-dish"], styles.dish);
  const list = rs(["rs-colony-plate-list"], styles.list);
  const record = rs(["rs-colony-plate-record"], styles.record);
  const staticStyle = rs(["rs-colony-plate-static"], styles.static);
  const details = rs(["rs-colony-plate-details"], styles.details);
  const clear = rs(["rs-colony-plate-clear"], styles.clear);
  return <figure {...props} ref={merged} className={root.className} style={{ ...root.style, ...style }}>
    <figcaption {...title}>{label}</figcaption>{plateId != null && <p {...copy}>Plate: {plateId.trim() || "Not supplied"}</p>}
    <p {...count}>Source count: {recordedCount == null ? "Not supplied" : Number.isSafeInteger(recordedCount) && recordedCount >= 0 ? recordedCount : "Unavailable"}</p>
    {source != null && <div {...copy}>{source}</div>}
    <p {...copy}>{markers.length} marker records supplied{valid ? `; ${plotted.length} positioned` : ""}</p>
    {!valid ? <p {...copy}>{bounded ? "Plate markers unavailable: supply unique non-empty record identifiers" : "Plate markers unavailable: supply at most 256 records"}</p> : <>
      <p {...copy}>Coordinates are percentages, measured from the upper left. The dish center is 50, 50.</p>
      <div {...body}><svg {...graphic} viewBox="0 0 240 240" aria-hidden="true" focusable="false"><circle {...dish} cx={120} cy={120} r={108} />{plotted.map(marker => {
        const active = marker.id === current;
        const paint = rs(["rs-colony-plate-marker", active && "rs-colony-plate-chosen"], styles.marker, active && styles.chosen);
        return <circle key={marker.id} {...paint} cx={12 + marker.x! * 2.16} cy={12 + marker.y! * 2.16} r={active ? 5 : 3} />;
      })}</svg>{markers.length > 0 ? <ol {...list} aria-label={`${label}, supplied marker records`}>{markers.map((marker, index) => {
        const active = marker.id === current;
        const control = rs(["rs-colony-plate-control", active && "rs-colony-plate-selected"], styles.control, active && styles.selected);
        const position = positioned(marker) ? `x ${marker.x}%, y ${marker.y}%` : marker.x == null || marker.y == null ? "Position not supplied" : "Position unavailable";
        const markerLabel = marker.label.trim() || "Unlabelled record";
        return <li key={marker.id} {...record}>
          {readOnly ? <div {...staticStyle}>{index + 1}. {markerLabel}{active ? " (selected)" : ""}</div> : <button {...control} type="button" disabled={marker.disabled} aria-pressed={active} aria-label={`Select ${index + 1}. ${markerLabel}`} aria-describedby={`${id}-${index}-position`} onClick={() => setCurrent(marker.id)}>{index + 1}. {markerLabel}</button>}
          <p {...copy} id={`${id}-${index}-position`}>{position}</p>{marker.description != null && <div {...details}>{marker.description}</div>}
        </li>;
      })}</ol> : <p {...copy}>No marker records supplied</p>}</div>
      <p {...copy} role="status">{selected ? `Selected record: ${selected.label.trim() || "Unlabelled record"}` : current == null ? "No record selected" : "Selected record unavailable"}</p>
      {!readOnly && <Button {...clear} variant="ghost" disabled={current == null} onClick={() => setCurrent(null)}>Clear selection</Button>}
    </>}{children}
  </figure>;
});
