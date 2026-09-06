"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { Button } from "./button";


export interface SpectrumPoint { x: number; y: number }
export interface SpectrumPeak extends SpectrumPoint { id: string; label: string }
export interface SpectrumPlotProps extends React.HTMLAttributes<HTMLElement> {
  label: string;
  /** Up to 4096 supplied points, connected in the supplied order without resampling. */
  points: readonly SpectrumPoint[];
  xLabel: string;
  yLabel: string;
  xUnit?: string;
  yUnit?: string;
  xDomain?: readonly [number, number];
  yDomain?: readonly [number, number];
  /** Up to 128 supplied annotations. The component never detects peaks. */
  peaks?: readonly SpectrumPeak[];
  description?: React.ReactNode;
}

const styles = stylex.create({
  root: { display: "grid", gap: "0.75rem", minWidth: 0, margin: 0, color: vlak.ink, lineHeight: 1.45, overflowWrap: "anywhere" },
  label: { fontSize: "0.875rem", fontWeight: 600 },
  description: { margin: 0, fontSize: "0.75rem", color: vlak.gray, maxWidth: "66ch" },
  scroll: { overflowX: "auto", maxWidth: "100%", minWidth: 0, overscrollBehaviorX: "contain", outlineWidth: { default: null, ":focus-visible": 2 }, outlineStyle: { default: null, ":focus-visible": "solid" }, outlineColor: vlak.ink, outlineOffset: 2 },
  svg: { display: "block", width: "100%", minWidth: "24rem", height: "auto", direction: "ltr", color: { default: vlak.ink, [mq.forcedColors]: "CanvasText" } },
  axis: { fill: "none", stroke: "currentColor", strokeWidth: 1 },
  grid: { fill: "none", stroke: vlak.divider, strokeWidth: 1 },
  trace: { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinejoin: "round" },
  point: { fill: "currentColor", stroke: "currentColor", strokeWidth: 1 },
  annotation: { fill: "currentColor", fontSize: 20, fontFamily: "inherit" },
  ticks: { fill: "currentColor", fontSize: 20, fontVariantNumeric: "tabular-nums", fontFamily: "inherit" },
  xLabel: { margin: 0, textAlign: "center", fontSize: "0.75rem" },
  peaks: { margin: 0, paddingInlineStart: "1.5rem", fontSize: "0.75rem" },
  summary: { minHeight: vlak.hit, minWidth: vlak.hit, display: "list-item", alignContent: "center", cursor: "pointer", fontSize: "0.875rem", outlineWidth: { default: null, ":focus-visible": 2 }, outlineStyle: { default: null, ":focus-visible": "solid" }, outlineColor: vlak.ink, outlineOffset: 2 },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "0.75rem", fontVariantNumeric: "tabular-nums" },
  cell: { padding: "0.5rem", textAlign: "start", borderBottomWidth: vlak.hairline, borderBottomStyle: "solid", borderBottomColor: vlak.divider, fontWeight: 400 },
  controls: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem", paddingBlock: "0.5rem", fontSize: "0.75rem" },
  button: { flexShrink: 0 },
});

function domainFor(values: readonly number[], supplied?: readonly [number, number]): readonly [number, number] {
  if (supplied) return supplied;
  let minimum = values[0] ?? 0;
  let maximum = minimum;
  for (const value of values) { minimum = Math.min(minimum, value); maximum = Math.max(maximum, value); }
  if (minimum !== maximum) return [minimum, maximum];
  const pad = Math.abs(minimum) * 0.05 || 1;
  const lower = minimum - pad;
  const upper = maximum + pad;
  return [Number.isFinite(lower) ? lower : minimum, Number.isFinite(upper) ? upper : maximum];
}
function fraction(value: number, domain: readonly [number, number]) {
  const scale = Math.max(Math.abs(domain[0]), Math.abs(domain[1]), 1);
  return (value / scale - domain[0] / scale) / (domain[1] / scale - domain[0] / scale);
}
const finitePoint = (point: SpectrumPoint) => Number.isFinite(point.x) && Number.isFinite(point.y);

/** A supplied spectrum and peak annotations, with a paginated complete data table. */
export const SpectrumPlot = React.forwardRef<HTMLElement, SpectrumPlotProps>(function SpectrumPlot({ label, points, xLabel, yLabel, xUnit, yUnit, xDomain, yDomain, peaks = [], description, className, style, children, ...props }, ref) {
  const [page, setPage] = React.useState(0);
  const bounded = points.length <= 4096 && peaks.length <= 128;
  const finite = bounded && points.every(finitePoint) && peaks.every(finitePoint);
  const horizontal = domainFor(finite ? points.map(point => point.x) : [], xDomain);
  const vertical = domainFor(finite ? points.map(point => point.y) : [], yDomain);
  const validDomain = [horizontal, vertical].every(domain => Number.isFinite(domain[0]) && Number.isFinite(domain[1]) && domain[1] > domain[0]);
  const inside = (point: SpectrumPoint) => point.x >= horizontal[0] && point.x <= horizontal[1] && point.y >= vertical[0] && point.y <= vertical[1];
  const problem = !bounded ? "Spectrum unavailable: supply at most 4096 points and 128 annotations" : !points.length ? "No spectrum points supplied" : !finite ? "Spectrum unavailable: a point or annotation is non-finite" : !validDomain ? "Spectrum unavailable: axis bounds must be finite and increasing" : !points.every(inside) || !peaks.every(inside) ? "Spectrum unavailable: data or annotations fall outside the axis bounds" : null;
  const x = (value: number) => 128 + fraction(value, horizontal) * 484;
  const y = (value: number) => 216 - fraction(value, vertical) * 184;
  const axisName = (name: string, unit?: string) => unit ? `${name} (${unit})` : name;
  const xTitle = axisName(xLabel, xUnit);
  const yTitle = axisName(yLabel, yUnit);
  const tickFractions = Math.max(horizontal[0].toPrecision(4).length, horizontal[1].toPrecision(4).length) > 7 ? [0, 0.5, 1] : [0, 0.25, 0.5, 0.75, 1];
  const pageCount = Math.ceil(points.length / 50);
  const currentPage = Math.min(page, Math.max(0, pageCount - 1));
  const visible = bounded ? points.slice(currentPage * 50, (currentPage + 1) * 50) : [];
  const root = rs(["rs-spectrum-plot", className], styles.root);
  const heading = rs(["rs-spectrum-plot-label"], styles.label);
  const copy = rs(["rs-spectrum-plot-description"], styles.description);
  const scroll = rs(["rs-spectrum-plot-scroll"], styles.scroll);
  const svg = rs(["rs-spectrum-plot-svg"], styles.svg);
  const axis = rs(["rs-spectrum-plot-axis"], styles.axis);
  const grid = rs(["rs-spectrum-plot-grid"], styles.grid);
  const trace = rs(["rs-spectrum-plot-trace"], styles.trace);
  const pointStyle = rs(["rs-spectrum-plot-point"], styles.point);
  const annotation = rs(["rs-spectrum-plot-annotation"], styles.annotation);
  const ticks = rs(["rs-spectrum-plot-ticks"], styles.ticks);
  const xLabelStyle = rs(["rs-spectrum-plot-x-label"], styles.xLabel);
  const peakList = rs(["rs-spectrum-plot-peaks"], styles.peaks);
  const summary = rs(["rs-spectrum-plot-summary"], styles.summary);
  const table = rs(["rs-spectrum-plot-table"], styles.table);
  const cell = rs(["rs-spectrum-plot-cell"], styles.cell);
  const controls = rs(["rs-spectrum-plot-controls"], styles.controls);
  const button = rs(["rs-spectrum-plot-button"], styles.button);
  return <figure {...props} ref={ref} className={root.className} style={{ ...root.style, ...style }}>
    <figcaption {...heading}>{label}</figcaption>
    {description != null && <div {...copy}>{description}</div>}
    {problem ? <p {...copy}>{problem}</p> : <>
      <p {...copy}>{yTitle}</p>
      <div {...scroll} role="region" aria-label={`${label} plot`} tabIndex={0}><svg {...svg} viewBox="0 0 640 272" aria-hidden="true" focusable="false">
        <path {...axis} d="M128 32V216H612" />
        {tickFractions.map((ratio, index) => {
          const xv = horizontal[0] * (1 - ratio) + horizontal[1] * ratio;
          const yv = vertical[0] * (1 - ratio) + vertical[1] * ratio;
          return <g key={index}><path {...grid} d={`M128 ${216 - ratio * 184}H612`} /><text {...ticks} x={128 + ratio * 484} y={244} textAnchor={ratio === 0 ? "start" : ratio === 1 ? "end" : "middle"}>{xv.toPrecision(4)}</text><text {...ticks} x={118} y={223 - ratio * 184} textAnchor="end">{yv.toPrecision(4)}</text></g>;
        })}
        {points.length === 1 ? <circle {...pointStyle} cx={x(points[0]!.x)} cy={y(points[0]!.y)} r={3} /> : <polyline {...trace} points={points.map(point => `${x(point.x)},${y(point.y)}`).join(" ")} />}
        {peaks.map((peak, index) => <g key={peak.id}><circle {...pointStyle} cx={x(peak.x)} cy={y(peak.y)} r={3} /><text {...annotation} x={x(peak.x)} y={y(peak.y) - 8} textAnchor="middle">{index + 1}</text></g>)}
      </svg></div><p {...xLabelStyle}>{xTitle}</p>
    </>}
    {bounded && peaks.length > 0 && <ol {...peakList} aria-label="Supplied peak annotations">{peaks.map(peak => <li key={peak.id}>{peak.label}: {xTitle} {Number.isFinite(peak.x) ? peak.x : "Unavailable"}; {yTitle} {Number.isFinite(peak.y) ? peak.y : "Unavailable"}</li>)}</ol>}
    {bounded && points.length > 0 && <details><summary {...summary}>Data table, {points.length} points</summary>
      <div {...controls}><Button variant="ghost" size="sm" {...button} type="button" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>Previous rows</Button><span role="status">Rows {currentPage * 50 + 1}–{Math.min(points.length, (currentPage + 1) * 50)} of {points.length}</span><Button variant="ghost" size="sm" {...button} type="button" disabled={currentPage + 1 >= pageCount} onClick={() => setPage(currentPage + 1)}>Next rows</Button></div>
      <div {...scroll}><table {...table}><caption>{label}, supplied data</caption><thead><tr><th {...cell} scope="col">Point</th><th {...cell} scope="col">{xTitle}</th><th {...cell} scope="col">{yTitle}</th></tr></thead><tbody>{visible.map((point, index) => <tr key={currentPage * 50 + index}><th {...cell} scope="row">{currentPage * 50 + index + 1}</th><td {...cell}>{Number.isFinite(point.x) ? point.x : "Unavailable"}</td><td {...cell}>{Number.isFinite(point.y) ? point.y : "Unavailable"}</td></tr>)}</tbody></table></div>
    </details>}
    {children}
  </figure>;
});
