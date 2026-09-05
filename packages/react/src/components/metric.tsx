import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../tokens.stylex";
import { rs } from "../rs";

export interface MetricProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  label: React.ReactNode;
  value: number | string;
  unit?: React.ReactNode;
  description?: React.ReactNode;
  comparison?: React.ReactNode;
  /** Optional trend visualization, for example an existing Sparkline. */
  trend?: React.ReactNode;
  locale?: string;
  formatOptions?: Intl.NumberFormatOptions;
}
const styles = stylex.create({
  root: { display: "grid", alignContent: "start", gap: "1rem", minWidth: 0, color: vlak.ink },
  label: { color: vlak.gray, fontSize: "0.875rem", lineHeight: 1.45, margin: 0 },
  reading: { display: "flex", alignItems: "baseline", gap: "0.5rem", minHeight: "4rem", minWidth: 0, fontVariantNumeric: "tabular-nums", lineHeight: 1 },
  value: { fontSize: "clamp(2.5rem, 5vw, 4rem)", letterSpacing: "-0.04em", fontWeight: 500, overflowWrap: "anywhere" },
  unit: { fontSize: "1.125rem", color: vlak.gray },
  detail: { margin: 0, color: vlak.gray, fontSize: "0.875rem", lineHeight: 1.45 },
});

/** A numeric reading with stable baseline, tabular figures, and an explicit unit. */
export const Metric = React.forwardRef<HTMLDivElement, MetricProps>(function Metric({ label, value, unit, description, comparison, trend, locale = "en", formatOptions, className, style, ...props }, ref) {
  const root = rs(["rs-metric", className], styles.root);
  const lab = rs(["rs-metric-label"], styles.label);
  const reading = rs(["rs-metric-reading"], styles.reading);
  const figure = rs(["rs-metric-value"], styles.value);
  const suffix = rs(["rs-metric-unit"], styles.unit);
  const detail = rs(["rs-metric-detail"], styles.detail);
  const formatted = typeof value === "number" ? new Intl.NumberFormat(locale, formatOptions).format(value) : value;
  return <div ref={ref} {...props} className={root.className} style={{ ...root.style, ...style }}>
    <p {...lab}>{label}</p><div {...reading}><span {...figure}>{formatted}</span>{unit != null && <span {...suffix}>{unit}</span>}</div>
    {description != null && <p {...detail}>{description}</p>}{comparison != null && <p {...detail}>{comparison}</p>}{trend}
  </div>;
});
