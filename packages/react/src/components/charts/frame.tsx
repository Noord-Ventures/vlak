"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../../tokens.stylex";
import { rs } from "../../rs";
import { hidden } from "../../hidden.stylex";

export interface ChartSeries {
  name: string;
  values: Array<number | null>;
}

export interface ChartAnnotation {
  /** Index into the labels (line/bar) or an x value (scatter). */
  at: number;
  label: string;
}

export interface ChartPoint {
  x: number;
  y: number;
  label?: string;
  group?: string;
}

const styles = stylex.create({
  chart: {
    position: "relative",
    width: "100%",
    borderRadius: 0,
    boxShadow: "none",
  },
  field: {
    isolation: "isolate",
    backgroundColor: vlak.paper,
    borderWidth: vlak.hairline,
    borderStyle: "solid",
    borderColor: vlak.divider,
    borderRadius: 0,
    boxShadow: "none",
    padding: "1rem",
  },
  /* The canvas is measured; the svg's viewBox equals its rendered width, so type stays CSS-px sized. */
  canvas: {
    position: "relative",
    width: "100%",
    minWidth: 0,
  },
  svg: {
    display: "block",
    width: "100%",
    height: "auto",
    overflow: "visible",
    outlineWidth: {
      default: null,
      ":focus-visible": 2,
    },
    outlineStyle: {
      default: null,
      ":focus-visible": "solid",
    },
    outlineColor: {
      default: null,
      ":focus-visible": vlak.ink,
    },
    outlineOffset: {
      default: null,
      ":focus-visible": 2,
    },
  },
  plot: {
    transformOrigin: "center",
  },
  head: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: "0.75rem",
    marginBottom: "0.625rem",
  },
  title: {
    fontSize: "0.8125rem",
    fontWeight: 600,
    letterSpacing: "-0.01em",
    color: vlak.ink,
  },
  grid: {
    stroke: vlak.divider,
    strokeWidth: 1,
  },
  baseline: {
    stroke: vlak.divider,
    strokeWidth: 1,
  },
  axis: {
    fill: vlak.gray,
    fontSize: "0.6875rem",
    fontWeight: 500,
    letterSpacing: 0,
    fontVariantNumeric: "tabular-nums",
  },
  line: {
    fill: "none",
    stroke: vlak.ink,
    strokeWidth: 1,
    strokeLinecap: "butt",
    strokeLinejoin: "miter",
  },
  lineDashed: {
    strokeDasharray: "4 4",
  },
  lineMuted: {
    stroke: vlak.gray,
  },
  lineDotted: {
    stroke: vlak.gray,
    strokeDasharray: "0.1 5",
    strokeWidth: 1.5,
    strokeLinecap: "butt",
  },
  lineSpot: {
    stroke: "var(--rs-chart-spot)",
  },
  area: {
    fill: vlak.ink,
    opacity: 0.08,
    stroke: "none",
  },
  areaSpot: {
    fill: "var(--rs-chart-spot)",
    opacity: 0.16,
    stroke: "none",
  },
  bar: {
    fill: vlak.ink,
    borderRadius: 0,
    transition: {
      default: "fill var(--duration-snap) var(--ease), opacity var(--duration-snap) var(--ease)",
      [mq.reduce]: "none",
    },
  },
  barMuted: {
    fill: vlak.divider,
  },
  barSpot: {
    fill: "var(--rs-chart-spot)",
  },
  cursor: {
    stroke: vlak.divider,
    strokeWidth: 1,
  },
  dot: {
    fill: vlak.paper,
    stroke: vlak.ink,
    strokeWidth: 1,
  },
  mark: {
    fill: vlak.ink,
    borderRadius: 0,
    transition: {
      default: "fill var(--duration-snap) var(--ease), opacity var(--duration-snap) var(--ease)",
      [mq.reduce]: "none",
    },
  },
  markSpot: {
    fill: "var(--rs-chart-spot)",
  },
  ann: {
    fill: vlak.gray,
    fontSize: "0.6875rem",
    fontWeight: 500,
    letterSpacing: "-0.01em",
  },
  tip: {
    position: "absolute",
    pointerEvents: "none",
    backgroundColor: vlak.paper,
    borderWidth: vlak.hairline,
    borderStyle: "solid",
    borderColor: vlak.divider,
    borderRadius: 0,
    boxShadow: "none",
    paddingBlock: "0.375rem",
    paddingInline: "0.5rem",
    fontSize: "0.75rem",
    letterSpacing: "-0.01em",
    color: vlak.ink,
    whiteSpace: "nowrap",
    zIndex: vlak.zFloat,
    transform: "translate(-50%, calc(-100% - 8px))",
  },
  tipLabel: {
    display: "block",
    fontSize: "0.6875rem",
    color: vlak.gray,
    marginBottom: 2,
  },
  tipRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "0.625rem",
  },
  tipName: {
    color: vlak.gray,
  },
  tipVal: {
    fontWeight: 600,
    fontVariantNumeric: "tabular-nums",
  },
  legend: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.875rem",
    marginTop: "0.625rem",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.4375rem",
    fontSize: "0.75rem",
    fontWeight: 500,
    letterSpacing: "-0.01em",
    color: vlak.gray,
  },
  legendSvg: {
    display: "block",
  },
});

export const chartStyles = styles;

export function ticksBetween(min: number, max: number, count = 4): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [];
  if (min > max) [min, max] = [max, min];
  const span = max - min || 1;
  const step = niceStep(span, count);
  const start = Math.ceil(min / step) * step;
  const values: number[] = [];
  for (let t = start; t <= max + step * 1e-6; t += step) values.push(+t.toFixed(8));
  return values.length ? values : [+min.toFixed(2), +max.toFixed(2)];
}

export const LINE_CLASS = [
  "rs-chart-line",
  "rs-chart-line rs-chart-line-dashed",
  "rs-chart-line rs-chart-line-muted",
  "rs-chart-line rs-chart-line-dotted",
] as const;

const LINE_SX = [null, styles.lineDashed, styles.lineMuted, styles.lineDotted] as const;

export const MAX_SERIES = LINE_CLASS.length;

/** Crouwel-adjacent red. Applied only as an inline field variable, never in CSS. */
export const CROUWEL_SPOT = "#E30613";

export function niceMax(raw: number): number {
  if (!Number.isFinite(raw) || raw <= 0) return 1;
  const pow = 10 ** Math.floor(Math.log10(raw));
  for (const f of [1, 2, 2.5, 5, 10]) {
    if (f * pow >= raw) return f * pow;
  }
  return 10 * pow;
}

const formatters = new Map<string, Intl.NumberFormat>();

function numberFormat(locale: string | undefined, options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = `${locale ?? ""}|${JSON.stringify(options)}`;
  let f = formatters.get(key);
  if (!f) {
    f = new Intl.NumberFormat(locale, options);
    formatters.set(key, f);
  }
  return f;
}

/**
 * Locale-aware number: compact from a thousand (1.2K, 3M), else at most one
 * decimal. `locale` undefined means the reader's own.
 */
export function defaultFormat(v: number, unit?: string, locale?: string): string {
  if (!Number.isFinite(v)) return "No data";
  const n = numberFormat(
    locale,
    Math.abs(v) >= 1000
      ? { notation: "compact", maximumFractionDigits: 1 }
      : { maximumFractionDigits: Number.isInteger(v) ? 0 : 1 },
  ).format(v);
  return unit ? `${n} ${unit}` : n;
}

export function niceStep(span: number, count = 4): number {
  const raw = span / (Number.isFinite(count) ? Math.max(1, Math.min(100, count)) : 4);
  if (raw <= 0) return 1;
  const pow = 10 ** Math.floor(Math.log10(raw));
  for (const f of [1, 2, 2.5, 5, 10]) {
    if (f * pow >= raw) return f * pow;
  }
  return 10 * pow;
}

export function ticksFor(max: number, count = 4, inverted = false): number[] {
  const step = niceStep(max, count);
  const values: number[] = [];
  for (let t = step; t <= max + step * 1e-6; t += step) values.push(+t.toFixed(8));
  return inverted ? values.reverse() : values;
}

export function stackedRows(series: ChartSeries[]): number[][] {
  const n = Math.max(0, ...series.map((s) => s.values.length));
  return Array.from({ length: n }, (_, i) => {
    let positive = 0;
    let negative = 0;
    return series.map((s) => {
      const value = s.values[i];
      if (typeof value !== "number" || !Number.isFinite(value)) return Number.NaN;
      if (value < 0) { negative += value; return negative; }
      positive += value;
      return positive;
    });
  });
}

export function lineMark(seriesIndex: number, spot?: boolean) {
  if (spot && seriesIndex === 0) {
    return rs(["rs-chart-line", "rs-chart-line-spot"], styles.line, styles.lineSpot);
  }
  const classes = LINE_CLASS[seriesIndex] ?? LINE_CLASS[0];
  return rs(classes.split(/\s+/), styles.line, LINE_SX[seriesIndex]);
}

export function areaMark(spot?: boolean) {
  return rs([spot ? "rs-chart-area-spot" : "rs-chart-area"], spot ? styles.areaSpot : styles.area);
}

export function barMark(opts: { spot?: boolean; muted?: boolean } = {}) {
  return rs(
    ["rs-chart-bar", opts.spot && "rs-chart-bar-spot", opts.muted && "rs-chart-bar-muted"],
    styles.bar,
    opts.spot && styles.barSpot,
    opts.muted && styles.barMuted,
  );
}

export function scatterMark(spot?: boolean) {
  return rs(["rs-chart-mark", spot && "rs-chart-mark-spot"], styles.mark, spot && styles.markSpot);
}

export interface SrSeries {
  name: string;
  values: Array<number | string | null>;
}

/** The data behind a plot, as a screen-reader table. */
export function SrTable({
  caption,
  labels,
  series,
}: {
  caption: string;
  labels: string[];
  series: SrSeries[];
}) {
  const sx = rs(["rs-sr"], hidden.sr);
  return (
    <table className={sx.className} style={sx.style}>
      <caption>{caption}</caption>
      <thead>
        <tr>
          <th scope="col">Label</th>
          {series.map((s) => (
            <th key={s.name} scope="col">
              {s.name}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {labels.map((label, i) => (
          <tr key={i}>
            <th scope="row">{label}</th>
            {series.map((s) => (
              <td key={s.name}>{s.values[i] == null || (typeof s.values[i] === "number" && !Number.isFinite(s.values[i])) ? "No data" : s.values[i]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function LegendSwatch({ seriesIndex, spot }: { seriesIndex: number; spot?: boolean }) {
  const svg = rs(["rs-chart-legend-svg"], styles.legendSvg);
  return (
    <svg width="18" height="4" viewBox="0 0 18 4" aria-hidden="true" className={svg.className} style={svg.style}>
      <path d="M0 2h18" {...lineMark(seriesIndex, spot)} />
    </svg>
  );
}

export function ChartHead({ className, style, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const sx = rs(["rs-chart-head", className], styles.head);
  return <div {...props} className={sx.className} style={{ ...sx.style, ...style }} />;
}

export function ChartTitle({ className, style, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  const sx = rs(["rs-chart-title", className], styles.title);
  return <p {...props} className={sx.className} style={{ ...sx.style, ...style }} />;
}

export function ChartLegend({ className, style, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const sx = rs(["rs-chart-legend", className], styles.legend);
  return <div {...props} className={sx.className} style={{ ...sx.style, ...style }} />;
}

export function ChartLegendItem({ className, style, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  const sx = rs(["rs-chart-legend-item", className], styles.legendItem);
  return <span {...props} className={sx.className} style={{ ...sx.style, ...style }} />;
}

export function ChartTip({
  left,
  top,
  label,
  rows,
}: {
  left: number | string;
  top: number | string;
  label: string;
  rows: Array<{ name?: string; value: string }>;
}) {
  const tip = rs(["rs-chart-tip"], styles.tip);
  const tipLabel = rs(["rs-chart-tip-label"], styles.tipLabel);
  return (
    <div role="status" className={tip.className} style={{ ...tip.style, left, top }}>
      <span className={tipLabel.className} style={tipLabel.style}>
        {label}
      </span>
      {rows.map((row, i) => {
        const tipRow = rs(["rs-chart-tip-row"], styles.tipRow);
        const tipName = rs(["rs-chart-tip-name"], styles.tipName);
        const tipVal = rs(["rs-chart-tip-val"], styles.tipVal);
        return (
          <div key={i} className={tipRow.className} style={tipRow.style}>
            {row.name ? (
              <span className={tipName.className} style={tipName.style}>
                {row.name}
              </span>
            ) : null}
            <span className={tipVal.className} style={tipVal.style}>
              {row.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export interface ChartFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  /** One Crouwel spot on the field. Chrome stays ink. */
  spot?: boolean | string;
}

export const ChartField = React.forwardRef<HTMLDivElement, ChartFieldProps>(function ChartField(
  { spot, className, style, children, ...props },
  ref,
) {
  const color = spot === true ? CROUWEL_SPOT : typeof spot === "string" ? spot : undefined;
  const sx = rs(["rs-chart", "rs-chart-field", className], styles.chart, styles.field);
  return (
    <div
      ref={ref}
      {...props}
      className={sx.className}
      style={{
        ...sx.style,
        ...(style as React.CSSProperties),
        ...(color ? ({ ["--rs-chart-spot" as string]: color } as React.CSSProperties) : null),
      }}
    >
      {children}
    </div>
  );
});

/** The canvas wraps a plot: measured for width, and the tooltip's positioning box. */
export const ChartCanvas = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function ChartCanvas({ className, style, ...props }, ref) {
    const sx = rs(["rs-chart-canvas", className], styles.canvas);
    return <div ref={ref} {...props} className={sx.className} style={{ ...sx.style, ...style }} />;
  },
);

export const PLOT = { W: 408, ML: 36, MR: 8, MT: 8, MB: 22 } as const;

/**
 * Rendered width of the canvas in CSS px, so the plot lays out in real
 * pixels and its type keeps its size. PLOT.W on the server, before the
 * first measure, and where ResizeObserver is missing.
 */
export function useChartWidth<T extends HTMLElement>(fallback: number = PLOT.W): [React.RefObject<T | null>, number] {
  const ref = React.useRef<T | null>(null);
  const [width, setWidth] = React.useState(fallback);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const apply = (w: number) => {
      if (w > 0) setWidth((prev) => (Math.abs(prev - w) < 0.5 ? prev : Math.round(w)));
    };
    apply(el.clientWidth);
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) apply(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, width];
}

/**
 * Keyboard cursor over `count` points: arrows step, Home/End jump, Escape
 * clears. Returns undefined for keys it does not handle.
 */
export function stepCursor(key: string, current: number | null, count: number): number | null | undefined {
  if (count <= 0) return undefined;
  const last = count - 1;
  if (key === "ArrowRight") return current == null ? 0 : Math.min(last, current + 1);
  if (key === "ArrowLeft") return current == null ? last : Math.max(0, current - 1);
  if (key === "Home") return 0;
  if (key === "End") return last;
  if (key === "Escape") return null;
  return undefined;
}

export interface PlotNameProps {
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

/**
 * The plot's accessible name: an explicit label or labelledby wins, then the
 * visible ChartTitle by id, then a composed description. Never a bare kind.
 */
export function plotName(explicit: PlotNameProps, titleId: string | undefined, fallback: string): PlotNameProps {
  if (explicit["aria-labelledby"]) return { "aria-labelledby": explicit["aria-labelledby"] };
  if (explicit["aria-label"]) return { "aria-label": explicit["aria-label"] };
  if (titleId) return { "aria-labelledby": titleId };
  return { "aria-label": fallback };
}

/** "Bar chart of Sheets and Proofs, in units". */
export function describePlot(kind: string, names: string[], unit?: string): string {
  const what = names.filter(Boolean);
  const list = what.length > 1 ? `${what.slice(0, -1).join(", ")} and ${what[what.length - 1]}` : what[0];
  return `${kind}${list ? ` of ${list}` : ""}${unit ? `, in ${unit}` : ""}`;
}

/** Props that make a plot a focusable, keyboard-driven group. */
export function plotProps(
  name: PlotNameProps,
  onKey: (key: string) => boolean,
  onLeave: () => void,
): React.SVGAttributes<SVGSVGElement> {
  return {
    role: "group",
    tabIndex: 0,
    "aria-roledescription": "interactive chart",
    ...name,
    onKeyDown: (e) => {
      if (onKey(e.key)) e.preventDefault();
    },
    onBlur: onLeave,
  };
}
