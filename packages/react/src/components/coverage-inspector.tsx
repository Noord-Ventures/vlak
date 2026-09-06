"use client";
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { Select } from "./select";

import { useInputValue } from "../use-input-value";
import { useMergedRefs } from "../merge-refs";

export interface CoverageLocus {
  position: number;
  depth: number | null;
  bases?: Readonly<Record<string, number | null>>;
  forward?: number | null;
  reverse?: number | null;
}
export interface CoverageInspectorProps extends Omit<React.HTMLAttributes<HTMLElement>, "defaultValue"> {
  label: string;
  contig: string;
  reference?: string;
  loci: readonly CoverageLocus[];
  /** A supplied one-based position, not an array index. */
  value?: number | null;
  defaultValue?: number | null;
  onValueChange?: (position: number | null) => void;
}
const styles = stylex.create({
  root: { display: "grid", gap: "0.75rem", minWidth: 0, margin: 0, color: vlak.ink, lineHeight: 1.45 },
  title: { fontSize: "0.875rem", fontWeight: 600 },
  copy: { margin: 0, fontSize: "0.75rem", color: vlak.gray, overflowWrap: "anywhere", maxWidth: "66ch" },
  plot: { display: "block", width: "100%", height: "auto", direction: "ltr", color: { default: vlak.ink, [mq.forcedColors]: "CanvasText" } },
  stem: { stroke: "currentColor", strokeWidth: 2, fill: "none" },
  point: { stroke: "currentColor", strokeWidth: 1, fill: "currentColor" },
  missing: { stroke: "currentColor", strokeWidth: 1, fill: { default: vlak.paper, [mq.forcedColors]: "Canvas" } },
  axis: { display: "flex", justifyContent: "space-between", gap: "1rem", fontSize: "0.75rem", color: vlak.gray, direction: "ltr", fontVariantNumeric: "tabular-nums" },
  field: { display: "grid", gap: "0.375rem", fontSize: "0.75rem" },
  select: { width: "100%", minWidth: 0 },
  counts: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(5rem, 1fr))", gap: "0.75rem", margin: 0, fontSize: "0.75rem" },
  value: { margin: 0, marginTop: "0.25rem", fontSize: "1rem", fontVariantNumeric: "tabular-nums" },
  summary: { display: "list-item", minWidth: vlak.hit, minHeight: vlak.hit, alignContent: "center", fontSize: "0.875rem", cursor: "pointer", outlineWidth: { default: null, ":focus-visible": 2 }, outlineStyle: { default: null, ":focus-visible": "solid" }, outlineColor: vlak.ink, outlineOffset: 2 },
  table: { borderCollapse: "collapse", width: "100%", fontSize: "0.75rem", fontVariantNumeric: "tabular-nums" },
  cell: { padding: "0.5rem", textAlign: "start", fontWeight: 400, borderBottomWidth: vlak.hairline, borderBottomStyle: "solid", borderBottomColor: vlak.divider },
});
const isCount = (value: number | null | undefined): value is number => value != null && Number.isSafeInteger(value) && value >= 0;
const countLabel = (value: number | null | undefined) => value == null ? "Not supplied" : isCount(value) ? String(value) : "Unavailable";
/** Supplied coverage and counts, with missing depth distinct from recorded zero and no variant calls. */
export const CoverageInspector = React.forwardRef<HTMLElement, CoverageInspectorProps>(function CoverageInspector({ label, contig, reference, loci, value, defaultValue, onValueChange, className, style, children, ...props }, ref) {
  const [, refresh] = React.useReducer((n: number) => n + 1, 0);
  const id = React.useId();
  const [selected, setSelected, figureRef] = useInputValue<number | null, HTMLElement>(value, defaultValue === undefined ? (loci[0]?.position ?? null) : defaultValue, onValueChange, refresh);
  const merged = useMergedRefs(ref, figureRef);
  const valid = loci.length <= 512 && loci.every(locus => Number.isSafeInteger(locus.position) && locus.position >= 1) && new Set(loci.map(locus => locus.position)).size === loci.length;
  const record = valid ? loci.find(locus => locus.position === selected) : undefined;
  const start = valid && loci.length ? Math.min(...loci.map(locus => locus.position)) : 0;
  const end = valid && loci.length ? Math.max(...loci.map(locus => locus.position)) : 0;
  const maximum = valid ? Math.max(1, ...loci.map(locus => isCount(locus.depth) ? locus.depth : 0)) : 1;
  const baseCounts = record?.bases ? Object.entries(record.bases) : [];
  const root = rs(["rs-coverage-inspector", className], styles.root);
  const title = rs(["rs-coverage-inspector-title"], styles.title);
  const copy = rs(["rs-coverage-inspector-copy"], styles.copy);
  const plot = rs(["rs-coverage-inspector-plot"], styles.plot);
  const stem = rs(["rs-coverage-inspector-stem"], styles.stem);
  const point = rs(["rs-coverage-inspector-point"], styles.point);
  const missing = rs(["rs-coverage-inspector-missing"], styles.missing);
  const axis = rs(["rs-coverage-inspector-axis"], styles.axis);
  const field = rs(["rs-coverage-inspector-label"], styles.field);
  const select = rs(["rs-coverage-inspector-select"], styles.select);
  const counts = rs(["rs-coverage-inspector-counts"], styles.counts);
  const valueStyle = rs(["rs-coverage-inspector-value"], styles.value);
  const summary = rs(["rs-coverage-inspector-summary"], styles.summary);
  const table = rs(["rs-coverage-inspector-table"], styles.table);
  const cell = rs(["rs-coverage-inspector-cell"], styles.cell);
  return <figure {...props} ref={merged} className={root.className} style={{ ...root.style, ...style }}>
    <figcaption {...title}>{label}</figcaption><p {...copy}>{reference ? `${reference} · ` : ""}{contig} · 1-based positions</p>
    {!valid ? <p {...copy}>Coverage unavailable: supply at most 512 unique positive integer positions</p> : !loci.length ? <p {...copy}>No coverage records supplied</p> : <>
      <p {...copy}>Supplied depth. Open markers indicate missing or unavailable depth; filled markers include recorded zero.</p>
      <svg {...plot} viewBox="0 0 600 112" aria-hidden="true" focusable="false">{loci.map(locus => {
        const x = start === end ? 300 : 8 + (locus.position - start) / (end - start) * 584;
        const y = 102 - (isCount(locus.depth) ? locus.depth / maximum : 0) * 94;
        return <g key={locus.position}>{isCount(locus.depth) ? <><path {...stem} d={`M${x} 102V${y}`} /><circle {...point} cx={x} cy={y} r={2} /></> : <circle {...missing} cx={x} cy={102} r={3} />}</g>;
      })}</svg><div {...axis}><span>{start}</span><span>{end}</span></div>
      <div {...field}><span id={`${id}-position-label`}>Inspect position</span><Select {...select} fullWidth aria-labelledby={`${id}-position-label`} value={record ? String(record.position) : ""} onValueChange={next => setSelected(next ? Number(next) : null)} options={[{ value: "", label: "Choose position" }, ...loci.map(locus => ({ value: String(locus.position), label: `${locus.position} · Depth ${countLabel(locus.depth)}` }))]} /></div>
      {record ? <>
        <dl {...counts}>{[["Depth", record.depth], ["Forward strand", record.forward], ["Reverse strand", record.reverse]].map(([name, value]) => <div key={String(name)}><dt>{name}</dt><dd {...valueStyle}>{countLabel(value as number | null | undefined)}</dd></div>)}</dl>
        {baseCounts.length > 16 ? <p {...copy}>Base counts unavailable: supply at most 16 symbols per locus</p> : baseCounts.length ? <dl {...counts} aria-label="Supplied base counts">{baseCounts.map(([base, count]) => <div key={base}><dt>{base}</dt><dd {...valueStyle}>{countLabel(count)}</dd></div>)}</dl> : <p {...copy}>Base counts not supplied</p>}
      </> : <p {...copy}>{selected == null ? "No position selected" : "Selected position unavailable"}</p>}
      <details><summary {...summary}>Depth table, {loci.length} positions</summary><table {...table}><caption>{contig}, supplied coverage</caption><thead><tr><th {...cell} scope="col">Position</th><th {...cell} scope="col">Depth</th></tr></thead><tbody>{loci.map(locus => <tr key={locus.position}><th {...cell} scope="row">{locus.position}</th><td {...cell}>{countLabel(locus.depth)}</td></tr>)}</tbody></table></details>
    </>}{children}
  </figure>;
});
