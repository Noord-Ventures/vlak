"use client";

import * as React from "react";
import {
  ChartCanvas,
  ChartField,
  ChartHead,
  ChartLegend,
  ChartLegendItem,
  ChartTip,
  ChartTitle,
  LegendSwatch,
  PLOT,
  SrTable,
  chartStyles,
  defaultFormat,
  describePlot,
  plotName,
  plotProps,
  scatterMark,
  stepCursor,
  ticksBetween,
  useChartWidth,
  type ChartAnnotation,
  type ChartPoint,
} from "./frame";
import { rs } from "../../rs";

export type ScatterChartProps = React.HTMLAttributes<HTMLDivElement> & {
  points: ChartPoint[];
  height?: number;
  unit?: string;
  xLabel?: string;
  yLabel?: string;
  xDomain?: [number, number];
  yDomain?: [number, number];
  grid?: boolean;
  ticks?: number;
  annotations?: ChartAnnotation[];
  valueFormat?: (n: number) => string;
  spot?: boolean | string;
  /** BCP 47 tag for number formatting; undefined is the reader's own. */
  locale?: string;
};

function extent(values: number[], pad = 0.08): [number, number] {
  if (!values.length) return [0, 1];
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const span = hi - lo || 1;
  return [lo - span * pad, hi + span * pad];
}

export const ScatterChart = React.forwardRef<HTMLDivElement, ScatterChartProps>(function ScatterChart({
  points: inputPoints,
  height = 204,
  unit,
  xLabel,
  yLabel,
  xDomain,
  yDomain,
  grid = true,
  ticks = 4,
  annotations = [],
  valueFormat,
  className,
  spot,
  locale,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: ScatterChartProps, ref: React.ForwardedRef<HTMLDivElement>) {
  const points = inputPoints.filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
  const format = valueFormat ?? ((v: number) => defaultFormat(v, undefined, locale));
  const [hover, setHover] = React.useState<number | null>(null);
  const [canvasRef, W] = useChartWidth<HTMLDivElement>();
  const titleId = React.useId();
  const { ML, MR, MT, MB } = PLOT;
  const plotW = W - ML - MR;
  const plotH = height - MT - MB;
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const safeDomain = (domain: [number, number] | undefined, fallback: [number, number]): [number, number] => domain?.every(Number.isFinite) && domain[0] !== domain[1] ? [Math.min(...domain), Math.max(...domain)] : fallback;
  const [xMin, xMax] = safeDomain(xDomain, extent(xs));
  const [yMin, yMax] = safeDomain(yDomain, extent(ys));
  const yTicks = ticksBetween(yMin, yMax, ticks);
  const xTicks = ticksBetween(xMin, xMax, ticks);
  const toX = (x: number) => ML + ((x - xMin) / (xMax - xMin || 1)) * plotW;
  const toY = (y: number) => MT + plotH - ((y - yMin) / (yMax - yMin || 1)) * plotH;
  const groups = [...new Set(points.map((p) => p.group).filter(Boolean))] as string[];
  const active = hover != null ? points[hover] : null;

  const svg = rs(["rs-chart-svg"], chartStyles.svg);
  const plot = rs(["rs-chart-plot"], chartStyles.plot);
  const gridSx = rs(["rs-chart-grid"], chartStyles.grid);
  const axis = rs(["rs-chart-axis"], chartStyles.axis);
  const baseline = rs(["rs-chart-baseline"], chartStyles.baseline);
  const cursor = rs(["rs-chart-cursor"], chartStyles.cursor);
  const ann = rs(["rs-chart-ann"], chartStyles.ann);
  const mark = scatterMark(Boolean(spot));

  const name = plotName(
    { "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy },
    yLabel ? titleId : undefined,
    describePlot("Scatter chart", [xLabel ?? `${points.length} points`, ...(yLabel ? [yLabel] : [])], unit),
  );
  const a11y = plotProps(
    name,
    (key) => {
      const next = stepCursor(key, hover, points.length);
      if (next === undefined) return false;
      setHover(next);
      return true;
    },
    () => setHover(null),
  );

  return (
    <ChartField ref={ref} spot={spot} className={className} {...props}>
      {!points.length && <p role="status">No data to display</p>}
      {(yLabel || xLabel) && (
        <ChartHead>
          {yLabel ? <ChartTitle id={titleId}>{yLabel}</ChartTitle> : <span />}
          {xLabel ? <ChartTitle>{xLabel}</ChartTitle> : null}
        </ChartHead>
      )}
      <ChartCanvas ref={canvasRef}>
        <svg className={svg.className} style={svg.style} viewBox={`0 0 ${W} ${height}`} {...a11y}>
          <g className={plot.className} style={plot.style} aria-hidden="true">
            {grid &&
              yTicks.map((t) => (
                <g key={`yg-${t}`}>
                  <line className={gridSx.className} style={gridSx.style} x1={ML} x2={W - MR} y1={toY(t)} y2={toY(t)} />
                  <text className={axis.className} style={axis.style} x={ML - 6} y={toY(t) + 3.5} textAnchor="end">
                    {format(t)}
                  </text>
                </g>
              ))}
            {grid &&
              xTicks.map((t) => (
                <line key={`xg-${t}`} className={gridSx.className} style={gridSx.style} x1={toX(t)} x2={toX(t)} y1={MT} y2={MT + plotH} />
              ))}
            <line className={baseline.className} style={baseline.style} x1={ML} x2={ML} y1={MT} y2={MT + plotH} />
            <line className={baseline.className} style={baseline.style} x1={ML} x2={W - MR} y1={MT + plotH} y2={MT + plotH} />
            {xTicks.map((t) => (
              <text key={`xl-${t}`} className={axis.className} style={axis.style} x={toX(t)} y={height - 4} textAnchor="middle">
                {format(t)}
              </text>
            ))}
            {annotations.map((a) => (
              <g key={`${a.at}-${a.label}`}>
                <line className={cursor.className} style={cursor.style} x1={toX(a.at)} x2={toX(a.at)} y1={MT} y2={MT + plotH} />
                <text className={ann.className} style={ann.style} x={toX(a.at) + 4} y={MT + 10}>
                  {a.label}
                </text>
              </g>
            ))}
            {points.map((p, i) => (
              <circle
                key={i}
                className={mark.className}
                style={mark.style}
                cx={toX(p.x)}
                cy={toY(p.y)}
                r={hover === i ? 3.5 : 2.25}
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
              />
            ))}
          </g>
        </svg>
        {active && (
          <ChartTip
            left={toX(active.x)}
            top={toY(active.y)}
            label={active.label ?? `${format(active.x)} · ${format(active.y)}`}
            rows={[{ name: active.group, value: format(active.y) }]}
          />
        )}
      </ChartCanvas>
      {(groups.length > 0 || unit) && (
        <ChartLegend aria-hidden="true">
          {groups.map((g) => (
            <ChartLegendItem key={g}>
              <LegendSwatch seriesIndex={0} spot={Boolean(spot)} />
              {g}
            </ChartLegendItem>
          ))}
          {unit ? <ChartLegendItem>{unit}</ChartLegendItem> : null}
        </ChartLegend>
      )}
      <SrTable
        caption={yLabel ?? "Scatter data"}
        labels={points.map((p) => p.label ?? `${p.x}`)}
        series={[
          { name: xLabel ?? "x", values: points.map((p) => p.x) },
          { name: yLabel ?? "y", values: points.map((p) => p.y) },
          ...(groups.length ? [{ name: "Group", values: points.map((p) => p.group ?? "") }] : []),
        ]}
      />
    </ChartField>
  );
});
