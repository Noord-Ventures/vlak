import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../../tokens.stylex";
import { rs } from "../../rs";
import { LineChart, type LineChartProps } from "./line";
import { niceMax } from "./frame";

const styles = stylex.create({
  multi: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(184px, 1fr))",
    gap: "1.25rem",
  },
  item: { margin: 0, minWidth: 0 },
  cap: {
    marginTop: 0,
    marginInlineEnd: 0,
    marginBottom: "0.5rem",
    marginInlineStart: 0,
    fontSize: "0.75rem",
    fontWeight: 600,
    letterSpacing: "-0.01em",
    color: vlak.ink,
  },
});

export type SmallMultiple = {
  title: string;
  series: LineChartProps["series"];
  labels: string[];
};

export interface SmallMultiplesProps extends React.HTMLAttributes<HTMLDivElement> {
  panels: SmallMultiple[];
  height?: number;
  unit?: string;
  grid?: boolean;
  ticks?: number;
  spot?: boolean | string;
  /** Compare panels on one scale by default. Disable only for independent trends. */
  sharedDomain?: boolean;
  /** BCP 47 tag for number formatting; undefined is the reader's own. */
  locale?: string;
}

export const SmallMultiples = React.forwardRef<HTMLDivElement, SmallMultiplesProps>(function SmallMultiples({
  panels,
  height = 136,
  unit,
  grid = true,
  ticks = 3,
  className,
  spot,
  sharedDomain = true,
  locale,
  style,
  ...props
}, ref) {
  const sx = rs(["rs-chart-multi", className], styles.multi);
  const item = rs(["rs-chart-multi-item"], styles.item);
  const values = panels.flatMap((panel) => panel.series.flatMap((series) => series.values)).filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  const domain: [number, number] | undefined = sharedDomain ? [Math.min(0, ...values), niceMax(Math.max(0, ...values))] : undefined;
  const idBase = React.useId();
  return (
    <div ref={ref} {...props} className={sx.className} style={{ ...sx.style, ...style }}>
      {panels.map((p, i) => {
        const capId = `${idBase}-cap-${i}`;
        return (
          <figure key={p.title} className={item.className} style={item.style}>
            <figcaption id={capId} {...rs(["rs-chart-multi-cap"], styles.cap)}>
              {p.title}
            </figcaption>
            <LineChart
              series={p.series}
              labels={p.labels}
              height={height}
              unit={unit}
              grid={grid}
              ticks={ticks}
              spot={spot}
              locale={locale}
              domain={domain}
              aria-labelledby={capId}
            />
          </figure>
        );
      })}
    </div>
  );
});
