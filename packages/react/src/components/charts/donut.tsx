import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../../tokens.stylex";
import { rs } from "../../rs";
import { ChartField, ChartLegend, ChartLegendItem, ChartTitle, SrTable, chartStyles, defaultFormat } from "./frame";

const styles = stylex.create({
  donut: {
    display: "block",
  },
  track: {
    fill: "none",
    stroke: vlak.divider,
    strokeWidth: 1,
  },
  value: {
    fill: "none",
    stroke: "var(--rs-chart-spot)",
    strokeWidth: 1,
    strokeLinecap: "butt",
  },
  /* Laid out in CSS px: the viewBox equals the rendered size, so type does not scale. */
  label: {
    fill: vlak.ink,
    fontSize: "1.25rem",
    fontWeight: 500,
    letterSpacing: "-0.03em",
    fontVariantNumeric: "tabular-nums",
  },
  caption: {
    fill: vlak.gray,
    fontSize: "0.6875rem",
    fontWeight: 500,
    letterSpacing: "0.06em",
  },
  share: {
    display: "flex",
    height: "0.5rem",
    width: "100%",
    borderWidth: vlak.hairline,
    borderStyle: "solid",
    borderColor: vlak.divider,
    borderRadius: 0,
    boxShadow: "none",
  },
  seg: {
    height: "100%",
    borderRadius: 0,
    backgroundColor: {
      default: vlak.ink,
      ":nth-child(2)": vlak.gray,
      ":nth-child(3)": vlak.divider,
    },
    transition: "fill var(--duration-snap) var(--ease), opacity var(--duration-snap) var(--ease)",
  },
  segSpot: {
    backgroundColor: "var(--rs-chart-spot)",
  },
});

export interface DonutProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  size?: number;
  label?: React.ReactNode;
  unit?: string;
  valueFormat?: (value: number) => string;
  spot?: boolean | string;
  /** BCP 47 tag for number formatting; undefined is the reader's own. */
  locale?: string;
}

export const Donut = React.forwardRef<HTMLDivElement, DonutProps>(function Donut({
  value,
  max = 100,
  size = 184,
  label,
  unit,
  valueFormat,
  className,
  spot,
  locale,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: DonutProps, ref: React.ForwardedRef<HTMLDivElement>) {
  const valid = Number.isFinite(value) && Number.isFinite(max) && max > 0 && value >= 0;
  const format = valueFormat ?? ((v: number) => `${Math.round((v / max) * 100)}%`);
  const pct = valid ? Math.max(0, Math.min(1, value / max)) : 0;
  const caption = typeof label === "string" ? label : undefined;
  const ids = React.useId();
  const valueId = `${ids}-value`;
  const captionId = `${ids}-caption`;
  const titleId = `${ids}-title`;
  const c = size / 2;
  const r = size * 0.375;
  const circumference = 2 * Math.PI * r;
  const shown = valid ? `${format(value)}${unit ? ` ${unit}` : ""}` : "No data";
  const svg = rs(["rs-chart-plot", "rs-chart-donut"], chartStyles.svg, chartStyles.plot, styles.donut);
  const track = rs(["rs-chart-donut-track"], styles.track);
  const valueSx = rs(["rs-chart-donut-value"], styles.value);
  const labelSx = rs(["rs-chart-donut-label"], styles.label);
  const captionSx = rs(["rs-chart-donut-caption"], styles.caption);
  const name = ariaLabelledBy
    ? { "aria-labelledby": ariaLabelledBy }
    : ariaLabel
      ? { "aria-label": ariaLabel }
      : {
          "aria-labelledby": [caption ? captionId : label ? titleId : null, valueId].filter(Boolean).join(" "),
        };
  return (
    <ChartField ref={ref} spot={spot} className={className ? `rs-chart-donut-wrap ${className}` : "rs-chart-donut-wrap"} {...props}>
      <svg
        className={svg.className}
        style={svg.style}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        {...name}
      >
        <circle className={track.className} style={track.style} cx={c} cy={c} r={r} />
        <circle
          className={valueSx.className}
          style={valueSx.style}
          cx={c}
          cy={c}
          r={r}
          strokeDasharray={`${pct * circumference} ${circumference}`}
          transform={`rotate(-90 ${c} ${c})`}
        />
        <text id={valueId} className={labelSx.className} style={labelSx.style} x={c} y={caption ? c - 3 : c + 7} textAnchor="middle">
          {shown}
        </text>
        {caption && (
          <text id={captionId} className={captionSx.className} style={captionSx.style} x={c} y={c + 16} textAnchor="middle">
            {caption}
          </text>
        )}
      </svg>
      {label && !caption ? <ChartTitle id={titleId}>{label}</ChartTitle> : null}
      <SrTable
        caption={caption ?? "Donut"}
        labels={[caption ?? "Value"]}
        series={[
          { name: unit ?? "Value", values: [defaultFormat(value, undefined, locale)] },
          { name: "Of", values: [defaultFormat(max, undefined, locale)] },
          { name: "Share", values: [valid ? `${Math.round(pct * 100)}%` : "No data"] },
        ]}
      />
    </ChartField>
  );
});

export type ShareSlice = { label: string; value: number };

export interface ShareProps extends React.HTMLAttributes<HTMLDivElement> {
  slices: ShareSlice[];
  unit?: string;
  valueFormat?: (n: number) => string;
  spot?: boolean | string;
  /** BCP 47 tag for number formatting; undefined is the reader's own. */
  locale?: string;
}

export const Share = React.forwardRef<HTMLDivElement, ShareProps>(function Share({
  slices: inputSlices,
  unit,
  valueFormat,
  className,
  spot,
  locale,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: ShareProps, ref: React.ForwardedRef<HTMLDivElement>) {
  const slices = inputSlices.filter((slice) => Number.isFinite(slice.value) && slice.value >= 0);
  const format = valueFormat ?? ((v: number) => defaultFormat(v, unit, locale));
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  const percent = (v: number) => `${defaultFormat((v / total) * 100, undefined, locale)}%`;
  const share = rs(["rs-chart-share"], styles.share);
  const name = ariaLabelledBy
    ? { "aria-labelledby": ariaLabelledBy }
    : {
        "aria-label": ariaLabel ?? `Share: ${slices.map((s) => `${s.label} ${percent(s.value)}`).join(", ")}`,
      };
  return (
    <ChartField ref={ref} spot={spot} className={className} {...props}>
      {!slices.some((slice) => slice.value > 0) && <p role="status">No data to display</p>}
      <div className={share.className} style={share.style} role="img" {...name}>
        {slices.map((s, i) => {
          const seg = rs(
            ["rs-chart-share-seg", i === 0 && "rs-chart-share-seg-spot"],
            styles.seg,
            i === 0 && styles.segSpot,
          );
          return (
            <div
              key={s.label}
              className={seg.className}
              style={{ ...seg.style, flex: `${s.value} 1 0` }}
              title={`${s.label} ${format(s.value)}`}
            />
          );
        })}
      </div>
      <ChartLegend aria-hidden="true">
        {slices.map((s) => (
          <ChartLegendItem key={s.label}>
            {s.label} {percent(s.value)}
          </ChartLegendItem>
        ))}
      </ChartLegend>
      <SrTable
        caption="Share"
        labels={slices.map((s) => s.label)}
        series={[
          { name: unit ?? "Value", values: slices.map((s) => format(s.value)) },
          { name: "Share", values: slices.map((s) => percent(s.value)) },
        ]}
      />
    </ChartField>
  );
});
