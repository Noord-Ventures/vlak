"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../../tokens.stylex";
import { rs } from "../../rs";
import {
  ChartCanvas,
  ChartField,
  ChartHead,
  ChartLegend,
  ChartLegendItem,
  ChartTip,
  ChartTitle,
  PLOT,
  SrTable,
  chartStyles,
  defaultFormat,
  describePlot,
  niceMax,
  plotName,
  plotProps,
  stepCursor,
  ticksFor,
  useChartWidth,
} from "./frame";

const styles = stylex.create({
  hist: {
    fill: vlak.divider,
    stroke: "none",
    borderRadius: 0,
  },
});

export type HistogramBin = { label: string; count: number };

export interface HistogramProps extends React.HTMLAttributes<HTMLDivElement> {
  bins: HistogramBin[];
  height?: number;
  unit?: string;
  yLabel?: string;
  grid?: boolean;
  ticks?: number;
  valueFormat?: (n: number) => string;
  spot?: boolean | string;
  /** BCP 47 tag for number formatting; undefined is the reader's own. */
  locale?: string;
}

export const Histogram = React.forwardRef<HTMLDivElement, HistogramProps>(function Histogram({
  bins: inputBins,
  height = 204,
  unit,
  yLabel,
  grid = true,
  ticks = 4,
  valueFormat,
  className,
  spot,
  locale,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: HistogramProps, ref: React.ForwardedRef<HTMLDivElement>) {
  const bins = inputBins.filter((bin) => Number.isFinite(bin.count) && bin.count >= 0);
  const format = valueFormat ?? ((v: number) => defaultFormat(v, undefined, locale));
  const tip = valueFormat ?? ((v: number) => defaultFormat(v, unit, locale));
  const [hover, setHover] = React.useState<number | null>(null);
  const [canvasRef, W] = useChartWidth<HTMLDivElement>();
  const titleId = React.useId();
  const { ML, MR, MT, MB } = PLOT;
  const plotW = W - ML - MR;
  const plotH = height - MT - MB;
  const max = niceMax(Math.max(...bins.map((b) => b.count), 1));
  const yTicks = ticksFor(max, ticks);
  const gap = 1;
  const bw = Math.max(0, (plotW - gap * Math.max(0, bins.length - 1)) / Math.max(1, bins.length));
  const active = hover != null ? bins[hover] : null;

  const svg = rs(["rs-chart-svg"], chartStyles.svg);
  const plot = rs(["rs-chart-plot"], chartStyles.plot);
  const gridSx = rs(["rs-chart-grid"], chartStyles.grid);
  const axis = rs(["rs-chart-axis"], chartStyles.axis);
  const baseline = rs(["rs-chart-baseline"], chartStyles.baseline);
  const hist = rs(["rs-chart-hist", Boolean(spot) && "rs-chart-bar-spot"], styles.hist, Boolean(spot) && chartStyles.barSpot);

  const name = plotName(
    { "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy },
    yLabel ? titleId : undefined,
    describePlot("Histogram", [`${bins.length} bins`], unit),
  );
  const a11y = plotProps(
    name,
    (key) => {
      const next = stepCursor(key, hover, bins.length);
      if (next === undefined) return false;
      setHover(next);
      return true;
    },
    () => setHover(null),
  );

  return (
    <ChartField ref={ref} spot={spot} className={className} {...props}>
      {!bins.length && <p role="status">No data to display</p>}
      {yLabel && (
        <ChartHead>
          <ChartTitle id={titleId}>{yLabel}</ChartTitle>
        </ChartHead>
      )}
      <ChartCanvas ref={canvasRef}>
        <svg className={svg.className} style={svg.style} viewBox={`0 0 ${W} ${height}`} {...a11y}>
          <g className={plot.className} style={plot.style} aria-hidden="true">
            {grid &&
              yTicks.map((t) => {
                const y = MT + plotH - (t / max) * plotH;
                return (
                  <g key={t}>
                    <line className={gridSx.className} style={gridSx.style} x1={ML} x2={W - MR} y1={y} y2={y} />
                    <text className={axis.className} style={axis.style} x={ML - 6} y={y + 3.5} textAnchor="end">
                      {format(t)}
                    </text>
                  </g>
                );
              })}
            <line className={baseline.className} style={baseline.style} x1={ML} x2={W - MR} y1={MT + plotH} y2={MT + plotH} />
            {bins.map((b, i) => {
              const h = (b.count / max) * plotH;
              const x = ML + i * (bw + gap);
              const y = MT + plotH - h;
              return (
                <g key={b.label} onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)}>
                  <rect className={hist.className} style={hist.style} x={x} y={y} width={bw} height={h} />
                  <text className={axis.className} style={axis.style} x={x + bw / 2} y={height - 4} textAnchor="middle">
                    {b.label}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
        {active && (
          <ChartTip
            left={ML + (hover ?? 0) * (bw + gap) + bw / 2}
            top={MT + plotH - (active.count / max) * plotH}
            label={active.label}
            rows={[{ value: tip(active.count) }]}
          />
        )}
      </ChartCanvas>
      {unit && (
        <ChartLegend aria-hidden="true">
          <ChartLegendItem>{unit}</ChartLegendItem>
        </ChartLegend>
      )}
      <SrTable
        caption={yLabel ?? "Histogram"}
        labels={bins.map((b) => b.label)}
        series={[{ name: unit ?? "Count", values: bins.map((b) => b.count) }]}
      />
    </ChartField>
  );
});
