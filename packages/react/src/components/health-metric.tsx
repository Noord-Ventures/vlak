import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../tokens.stylex";
import { rs } from "../rs";

export type HealthMetricStatus = "available" | "pending" | "unavailable" | "stale";

export interface HealthMetricProps extends React.HTMLAttributes<HTMLDivElement> {
  label: React.ReactNode;
  /** A supplied reading. Zero is a reading; empty strings and non-finite numbers are missing. */
  value?: number | string | null;
  unit?: string;
  /** Supplied by the application. Freshness is never inferred from the timestamp. */
  status?: HealthMetricStatus;
  statusLabel?: React.ReactNode;
  dateTime?: string;
  /** Human-readable time, including the relevant timezone. Falls back to dateTime. */
  timeLabel?: string;
  source?: React.ReactNode;
  description?: React.ReactNode;
}

const styles = stylex.create({
  root: { display: "grid", gap: "0.5rem", minWidth: 0, color: vlak.ink, paddingBlock: "1rem", borderTopWidth: vlak.hairline, borderTopStyle: "solid", borderTopColor: vlak.divider, lineHeight: 1.45, overflowWrap: "anywhere" },
  label: { margin: 0, fontSize: "0.875rem", fontWeight: 500 },
  reading: { margin: 0, display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: "0.5rem", fontVariantNumeric: "tabular-nums" },
  value: { fontSize: "2rem", lineHeight: 1.2, fontWeight: 500, letterSpacing: "-0.04em" },
  unit: { fontSize: "0.875rem", color: vlak.gray },
  status: { margin: 0, fontSize: "0.75rem", fontWeight: 500 },
  meta: { margin: 0, fontSize: "0.75rem", color: vlak.gray, display: "flex", flexWrap: "wrap", gap: "0.25rem 0.75rem" },
  description: { margin: 0, fontSize: "0.875rem", maxWidth: "66ch" },
});

/** A sourced reading with explicit data availability, without clinical interpretation. */
export const HealthMetric = React.forwardRef<HTMLDivElement, HealthMetricProps>(function HealthMetric({ label, value, unit, status = "available", statusLabel, dateTime, timeLabel, source, description, className, style, children, ...props }, ref) {
  const hasValue = typeof value === "number" ? Number.isFinite(value) : typeof value === "string" && value.trim().length > 0;
  const state = !hasValue && (status === "available" || status === "stale") ? "unavailable" : status;
  const showValue = hasValue && (state === "available" || state === "stale");
  const labels: Record<HealthMetricStatus, string> = { available: "Recorded", pending: "Pending", unavailable: "Unavailable", stale: "Last recorded, stale" };
  const root = rs(["rs-health-metric", className], styles.root);
  const labelStyle = rs(["rs-health-metric-label"], styles.label);
  const reading = rs(["rs-health-metric-reading"], styles.reading);
  const valueStyle = rs(["rs-health-metric-value"], styles.value);
  const unitStyle = rs(["rs-health-metric-unit"], styles.unit);
  const statusStyle = rs(["rs-health-metric-status"], styles.status);
  const meta = rs(["rs-health-metric-meta"], styles.meta);
  const descriptionStyle = rs(["rs-health-metric-description"], styles.description);
  return <div ref={ref} {...props} className={root.className} style={{ ...root.style, ...style }} data-status={state}>
    <p {...labelStyle}>{label}</p>
    {showValue && <p {...reading}><span {...valueStyle}>{value}</span>{unit && <span {...unitStyle}>{unit}</span>}</p>}
    <p {...statusStyle}>{statusLabel ?? labels[state]}</p>
    {(dateTime || timeLabel || source != null) && <p {...meta}>
      {(dateTime || timeLabel) && <time dateTime={dateTime}>{timeLabel ?? dateTime}</time>}
      {source != null && <span>{source}</span>}
    </p>}
    {description != null && <div {...descriptionStyle}>{description}</div>}
    {children}
  </div>;
});
