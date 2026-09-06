import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../tokens.stylex";
import { rs } from "../rs";

export interface MeasurementValueProps extends React.HTMLAttributes<HTMLDivElement> {
  label: React.ReactNode;
  /** Strings preserve supplied significant figures. Non-finite numbers are unavailable. */
  value?: number | string | null;
  unit?: string;
  /** A supplied symmetric, non-negative uncertainty in the same unit as value. */
  uncertainty?: number | null;
  uncertaintyLabel?: React.ReactNode;
  /** Scientific notation changes numeric formatting only; supplied strings are unchanged. */
  notation?: "plain" | "scientific";
  status?: "recorded" | "pending" | "unavailable";
  source?: React.ReactNode;
  description?: React.ReactNode;
}

const styles = stylex.create({
  root: { display: "grid", gap: "0.5rem", minWidth: 0, color: vlak.ink, lineHeight: 1.45, overflowWrap: "anywhere" },
  label: { margin: 0, fontSize: "0.875rem", fontWeight: 500 },
  reading: { margin: 0, display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "0.375rem", fontVariantNumeric: "tabular-nums" },
  value: { fontSize: "1.75rem", fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1.2 },
  uncertainty: { fontSize: "1rem" },
  unit: { fontSize: "0.875rem", color: vlak.gray },
  context: { margin: 0, fontSize: "0.75rem", color: vlak.gray, maxWidth: "66ch" },
});

/** A supplied scientific reading without inferred precision, confidence or unit conversion. */
export const MeasurementValue = React.forwardRef<HTMLDivElement, MeasurementValueProps>(function MeasurementValue({ label, value, unit, uncertainty, uncertaintyLabel, notation = "plain", status = "recorded", source, description, className, style, children, ...props }, ref) {
  const valid = typeof value === "number" ? Number.isFinite(value) : typeof value === "string" && value.trim().length > 0;
  const state = status === "recorded" && !valid ? "unavailable" : status;
  const validUncertainty = typeof uncertainty === "number" && Number.isFinite(uncertainty) && uncertainty >= 0;
  const format = (number: number) => notation === "scientific" ? number.toExponential() : String(number);
  const root = rs(["rs-measurement-value", className], styles.root);
  const heading = rs(["rs-measurement-value-label"], styles.label);
  const reading = rs(["rs-measurement-value-reading"], styles.reading);
  const amount = rs(["rs-measurement-value-number"], styles.value);
  const error = rs(["rs-measurement-value-uncertainty"], styles.uncertainty);
  const unitStyle = rs(["rs-measurement-value-unit"], styles.unit);
  const context = rs(["rs-measurement-value-context"], styles.context);
  return <div {...props} ref={ref} className={root.className} style={{ ...root.style, ...style }} data-status={state}>
    <p {...heading}>{label}</p>
    {state === "recorded" ? <p {...reading}><span {...amount}>{typeof value === "number" ? format(value) : value}</span>{validUncertainty && <span {...error}>± {format(uncertainty)}</span>}{unit && <span {...unitStyle}>{unit}</span>}</p> : <p {...context}>{state === "pending" ? "Measurement pending" : "Measurement unavailable"}</p>}
    {state === "recorded" && uncertainty != null && <p {...context}>{validUncertainty ? (uncertaintyLabel ?? "Supplied uncertainty") : "Uncertainty unavailable"}</p>}
    {source != null && <div {...context}>{source}</div>}
    {description != null && <div {...context}>{description}</div>}
    {children}
  </div>;
});
