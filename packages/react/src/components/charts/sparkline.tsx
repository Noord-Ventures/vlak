import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { rs } from "../../rs";
import { CROUWEL_SPOT, SrTable, chartStyles, defaultFormat, lineMark } from "./frame";

const styles = stylex.create({
  spark: {
    display: "inline-block",
    verticalAlign: "middle",
  },
  svg: {
    display: "block",
    overflow: "visible",
  },
});

export interface SparklineProps extends React.HTMLAttributes<HTMLSpanElement> {
  values: Array<number | null>;
  width?: number;
  height?: number;
  spot?: boolean | string;
  /** What the trend is of; leads the accessible name and the table. */
  label?: string;
  unit?: string;
  /** BCP 47 tag for number formatting; undefined is the reader's own. */
  locale?: string;
}

export const Sparkline = React.forwardRef<HTMLSpanElement, SparklineProps>(function Sparkline({
  values,
  width = 120,
  height = 28,
  className,
  spot,
  style,
  label,
  unit,
  locale,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...props
}, ref) {
  const finite = values.filter((v): v is number => typeof v === "number" && Number.isFinite(v));
  const max = finite.length ? Math.max(...finite) : 1;
  const min = finite.length ? Math.min(...finite) : 0;
  const span = max - min || 1;
  const x = (i: number) => (i / Math.max(values.length - 1, 1)) * (width - 4) + 2;
  const y = (v: number) => 2 + (1 - (v - min) / span) * (height - 4);
  let penDown = false;
  const d = values.map((v, i) => {
    if (typeof v !== "number" || !Number.isFinite(v)) { penDown = false; return ""; }
    const command = `${penDown ? "L" : "M"}${x(i)} ${y(v)}`;
    penDown = true;
    return command;
  }).join(" ");
  const last = values[values.length - 1];
  const color = spot === true ? CROUWEL_SPOT : typeof spot === "string" ? spot : undefined;
  const sx = rs(["rs-spark", className], styles.spark);
  const svg = rs(["rs-chart-svg"], styles.svg);
  const line = lineMark(0, Boolean(spot));
  const dot = rs(["rs-chart-dot"], chartStyles.dot);
  const name = ariaLabelledBy
    ? { "aria-labelledby": ariaLabelledBy }
    : {
        "aria-label":
          ariaLabel ??
          (finite.length ? `${label ? `${label}: ` : ""}trend of ${finite.length} values ending at ${last != null ? defaultFormat(last, unit, locale) : "No data"}` : `${label ? `${label}: ` : ""}No data to display`),
      };
  return (
    <span
      ref={ref}
      {...props}
      className={sx.className}
      style={{
        ...sx.style,
        ...(style as React.CSSProperties),
        ...(color ? ({ ["--rs-chart-spot" as string]: color } as React.CSSProperties) : null),
      }}
    >
      <svg
        className={svg.className}
        style={svg.style}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        {...name}
      >
        {finite.length > 0 && <path className={line.className} style={line.style} d={d} />}
        {last != null && Number.isFinite(last) && <circle className={dot.className} style={dot.style} cx={x(values.length - 1)} cy={y(last)} r={2} />}
      </svg>
      <SrTable
        caption={label ?? "Trend"}
        labels={values.map((_, i) => `${i + 1}`)}
        series={[{ name: unit ?? label ?? "Value", values }]}
      />
    </span>
  );
});
