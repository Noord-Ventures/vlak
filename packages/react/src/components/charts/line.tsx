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
  MAX_SERIES,
  PLOT,
  SrTable,
  areaMark,
  chartStyles,
  defaultFormat,
  describePlot,
  lineMark,
  niceMax,
  plotName,
  plotProps,
  stackedRows,
  stepCursor,
  ticksBetween,
  useChartWidth,
  type ChartAnnotation,
  type ChartSeries,
} from "./frame";
import { rs } from "../../rs";

export interface LineChartProps extends React.HTMLAttributes<HTMLDivElement> {
  series: ChartSeries[];
  labels?: string[];
  height?: number;
  /** Fill under the first series. Prefer AreaChart for a dedicated area. */
  area?: boolean;
  stacked?: boolean;
  inverted?: boolean;
  grid?: boolean;
  ticks?: number;
  unit?: string;
  yLabel?: string;
  xLabel?: string;
  annotations?: ChartAnnotation[];
  domain?: [number, number];
  spot?: boolean | string;
  valueFormat?: (value: number) => string;
  /** BCP 47 tag for number formatting; undefined is the reader's own. */
  locale?: string;
}

export const LineChart = React.forwardRef<HTMLDivElement, LineChartProps>(function LineChart({
  series,
  labels,
  height = 204,
  area,
  stacked,
  inverted,
  grid = true,
  ticks = 4,
  unit,
  yLabel,
  xLabel,
  annotations,
  domain,
  spot,
  valueFormat,
  locale,
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: LineChartProps, ref: React.ForwardedRef<HTMLDivElement>) {
  const shown = series.slice(0, MAX_SERIES);
  const n = Math.max(0, ...shown.map((s) => s.values.length));
  const stacks = stacked ? stackedRows(shown) : null;
  const extent = (stacks ? stacks.flat() : shown.flatMap((s) => s.values)).filter((v): v is number => typeof v === "number" && Number.isFinite(v));
  const validDomain = domain?.every(Number.isFinite) && domain[0] !== domain[1] ? domain : undefined;
  const min = validDomain ? Math.min(...validDomain) : Math.min(0, ...extent);
  const max = validDomain ? Math.max(...validDomain) : niceMax(Math.max(0, ...extent));
  const span = max - min || 1;
  const format = valueFormat ?? ((v: number) => defaultFormat(v, undefined, locale));
  const tip = valueFormat ?? ((v: number) => defaultFormat(v, unit, locale));
  const [hover, setHover] = React.useState<number | null>(null);
  const overlayRef = React.useRef<SVGRectElement>(null);
  const [canvasRef, W] = useChartWidth<HTMLDivElement>();
  const titleId = React.useId();
  const clipId = React.useId();

  const { ML, MR, MT, MB } = PLOT;
  const plotW = W - ML - MR;
  const plotH = height - MT - MB;
  const x = (i: number) => ML + (n <= 1 ? 0 : (i / (n - 1)) * plotW);
  const y = (v: number) => {
    const t = (v - min) / span;
    return inverted ? MT + t * plotH : MT + plotH - t * plotH;
  };
  const segments = (values: Array<number | null>) => {
    const groups: Array<Array<{ v: number; i: number }>> = [];
    let current: Array<{ v: number; i: number }> = [];
    values.forEach((v, i) => {
      if (typeof v === "number" && Number.isFinite(v)) current.push({ v, i });
      else if (current.length) { groups.push(current); current = []; }
    });
    if (current.length) groups.push(current);
    return groups;
  };
  const path = (values: Array<number | null>, fill = false) => segments(values).map((group) =>
    group.map(({ v, i }, j) => `${j ? "L" : "M"}${x(i)} ${y(v)}`).join(" ") +
    (fill ? ` L${x(group[group.length - 1]!.i)} ${y(Math.max(min, Math.min(max, 0)))} L${x(group[0]!.i)} ${y(Math.max(min, Math.min(max, 0)))} Z` : "")
  ).join(" ");
  const tickVals = ticksBetween(min, max, ticks);
  const tickLabels = Array.from({ length: n }, (_, i) => labels?.[i] ?? `${i + 1}`);

  const locate = (clientX: number): number | null => {
    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || !extent.length) return null;
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    return Math.round(ratio * (n - 1));
  };

  const svg = rs(["rs-chart-svg"], chartStyles.svg);
  const plot = rs(["rs-chart-plot"], chartStyles.plot);
  const gridSx = rs(["rs-chart-grid"], chartStyles.grid);
  const axis = rs(["rs-chart-axis"], chartStyles.axis);
  const baseline = rs(["rs-chart-baseline"], chartStyles.baseline);
  const cursor = rs(["rs-chart-cursor"], chartStyles.cursor);
  const ann = rs(["rs-chart-ann"], chartStyles.ann);
  const dot = rs(["rs-chart-dot"], chartStyles.dot);

  const name = plotName(
    { "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy },
    yLabel ? titleId : undefined,
    describePlot(area ? "Area chart" : "Line chart", shown.map((s) => s.name), unit),
  );
  const a11y = plotProps(
    name,
    (key) => {
      const next = stepCursor(key, hover, extent.length ? n : 0);
      if (next === undefined) return false;
      setHover(next);
      return true;
    },
    () => setHover(null),
  );

  return (
    <ChartField ref={ref} spot={spot} className={className} {...props}>
      {!extent.length && <p role="status">No data to display</p>}
      {(yLabel || xLabel) && (
        <ChartHead>
          {yLabel ? <ChartTitle id={titleId}>{yLabel}</ChartTitle> : <span />}
          {xLabel ? <ChartTitle>{xLabel}</ChartTitle> : null}
        </ChartHead>
      )}
      <ChartCanvas ref={canvasRef}>
        <svg className={svg.className} style={svg.style} viewBox={`0 0 ${W} ${height}`} {...a11y}>
          <defs><clipPath id={clipId}><rect x={ML} y={MT} width={plotW} height={plotH} /></clipPath></defs>
          <g className={plot.className} style={plot.style} aria-hidden="true">
            {grid &&
              tickVals.map((t) => (
                <g key={t}>
                  <line className={gridSx.className} style={gridSx.style} x1={ML} x2={W - MR} y1={y(t)} y2={y(t)} />
                  <text className={axis.className} style={axis.style} x={ML - 6} y={y(t) + 3.5} textAnchor="end">
                    {format(t)}
                  </text>
                </g>
              ))}
            <line className={baseline.className} style={baseline.style} x1={ML} x2={W - MR} y1={y(min)} y2={y(min)} />
            {area && shown[0] && !stacked && (
              <path {...areaMark(Boolean(spot))} clipPath={`url(#${clipId})`} d={path(shown[0].values, true)} />
            )}
            {stacked && stacks
              ? shown.map((s, si) => {
                  const top = stacks.map((row) => row[si] ?? 0);
                  return <path key={s.name} {...lineMark(si, Boolean(spot))} clipPath={`url(#${clipId})`} d={path(top)} />;
                })
              : shown.map((s, si) => <path key={s.name} {...lineMark(si, Boolean(spot))} clipPath={`url(#${clipId})`} d={path(s.values)} />)}
            {annotations?.map((a) => (
              <g key={`${a.at}-${a.label}`}>
                <line className={cursor.className} style={cursor.style} x1={x(a.at)} x2={x(a.at)} y1={MT} y2={y(min)} />
                <text className={ann.className} style={ann.style} x={x(a.at) + 4} y={MT + 10}>
                  {a.label}
                </text>
              </g>
            ))}
            {hover != null && hover < n && extent.length > 0 && (
              <g>
                <line className={cursor.className} style={cursor.style} x1={x(hover)} x2={x(hover)} y1={MT} y2={y(min)} />
                {shown.map((s, si) => typeof s.values[hover] === "number" && Number.isFinite(s.values[hover]) ? (
                  <circle
                    key={si}
                    className={dot.className}
                    style={dot.style}
                    cx={x(hover)}
                    cy={y(stacked && stacks ? (stacks[hover]?.[si] ?? 0) : (s.values[hover] ?? 0))}
                    r={3}
                    clipPath={`url(#${clipId})`}
                  />
                ) : null)}
              </g>
            )}
            <text className={axis.className} style={axis.style} x={ML} y={height - 4} textAnchor="start">
              {tickLabels[0]}
            </text>
            <text className={axis.className} style={axis.style} x={W - MR} y={height - 4} textAnchor="end">
              {tickLabels[n - 1]}
            </text>
            <rect
              ref={overlayRef}
              x={ML}
              y={0}
              width={plotW}
              height={height}
              fill="transparent"
              onPointerMove={(e) => setHover(locate(e.clientX))}
              onPointerLeave={() => setHover(null)}
            />
          </g>
        </svg>
        {hover != null && hover < n && extent.length > 0 && (
          <ChartTip
            left={x(hover)}
            top={MT}
            label={tickLabels[hover] ?? ""}
            rows={shown.map((s) => ({ name: s.name, value: s.values[hover] != null && Number.isFinite(s.values[hover]) ? tip(s.values[hover]!) : "No data" }))}
          />
        )}
      </ChartCanvas>
      {(shown.length > 1 || unit) && (
        <ChartLegend>
          {shown.map((s, si) => (
            <ChartLegendItem key={s.name}>
              <LegendSwatch seriesIndex={si} spot={Boolean(spot)} />
              {s.name}
            </ChartLegendItem>
          ))}
          {unit ? <ChartLegendItem>{unit}</ChartLegendItem> : null}
        </ChartLegend>
      )}
      <SrTable caption={yLabel ?? describePlot("Chart data", shown.map((s) => s.name), unit)} labels={tickLabels} series={shown} />
    </ChartField>
  );
});
