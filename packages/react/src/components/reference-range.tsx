import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";

export interface ReferenceRangeProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value?: number | null;
  /** Caller-supplied lower bound. Omit for an upper bound only. */
  minimum?: number | null;
  /** Caller-supplied upper bound. Omit for a lower bound only. */
  maximum?: number | null;
  unit?: string;
  /** Display formatting for the supplied numeric value. */
  valueLabel?: string;
  /** Optional contextual label, such as the laboratory's reference interval. */
  rangeLabel?: string;
}

const styles = stylex.create({
  root: { display: "grid", gap: "0.5rem", width: "100%", minWidth: 0, color: vlak.ink, lineHeight: 1.45, overflowWrap: "anywhere" },
  head: { margin: 0, display: "flex", alignItems: "baseline", flexWrap: "wrap", justifyContent: "space-between", gap: "0.25rem 1rem", fontSize: "0.875rem" },
  label: { fontWeight: 500 },
  value: { fontVariantNumeric: "tabular-nums", fontSize: "1.25rem", fontWeight: 500, lineHeight: 1.2, textAlign: "end", marginInlineStart: "auto" },
  track: { position: "relative", height: "1.5rem", marginInline: "0.3125rem", "::before": { content: "''", position: "absolute", insetInline: 0, top: "50%", height: vlak.hairline, transform: "translateY(-50%)", backgroundColor: { default: vlak.controlBorder, [mq.forcedColors]: "CanvasText" } } },
  interval: { position: "absolute", insetInlineStart: "20%", width: "60%", height: "0.5rem", top: "50%", transform: "translateY(-50%)", backgroundColor: { default: vlak.divider, [mq.forcedColors]: "Canvas" }, borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.controlBorder, boxSizing: "border-box" },
  marker: { position: "absolute", top: "50%", transform: "translateY(-50%)", height: "0.625rem", width: "0.625rem", marginInlineStart: "-0.3125rem", backgroundColor: { default: vlak.ink, [mq.forcedColors]: "CanvasText" }, borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.ink, boxSizing: "border-box" },
  bounds: { display: "flex", alignItems: "baseline", flexWrap: "wrap", justifyContent: "space-between", gap: "0.25rem 1rem", margin: 0, fontSize: "0.75rem", color: vlak.gray, fontVariantNumeric: "tabular-nums" },
  boundValue: { textAlign: "end", marginInlineStart: "auto" },
  description: { margin: 0, fontSize: "0.75rem", color: vlak.gray },
});

/** A supplied numeric reference interval. Position describes arithmetic, never clinical status. */
export const ReferenceRange = React.forwardRef<HTMLDivElement, ReferenceRangeProps>(function ReferenceRange({ label, value, minimum, maximum, unit, valueLabel, rangeLabel = "Reference interval", className, style, children, ...props }, ref) {
  const hasValue = typeof value === "number" && Number.isFinite(value);
  const hasMinimum = typeof minimum === "number" && Number.isFinite(minimum);
  const hasMaximum = typeof maximum === "number" && Number.isFinite(maximum);
  const invalid = (minimum != null && !hasMinimum) || (maximum != null && !hasMaximum) || (hasMinimum && hasMaximum && minimum >= maximum);
  const bounded = !invalid && hasMinimum && hasMaximum;
  const suffix = unit ? ` ${unit}` : "";
  const intervalText = invalid || (!hasMinimum && !hasMaximum) ? "Unavailable" : hasMinimum && hasMaximum ? `${minimum}–${maximum}${suffix}` : hasMinimum ? `At least ${minimum}${suffix}` : `Up to ${maximum}${suffix}`;
  // Normalize first so finite bounds near Number.MAX_VALUE cannot overflow their span.
  const scale = bounded ? Math.max(Math.abs(minimum), Math.abs(maximum), 1) : 1;
  const ratio = bounded && hasValue ? (value / scale - minimum / scale) / (maximum / scale - minimum / scale) : null;
  const position = ratio != null && !Number.isNaN(ratio) ? Math.min(100, Math.max(0, 20 + ratio * 60)) : null;
  const placement = bounded && hasValue ? value < minimum ? "Below displayed interval" : value > maximum ? "Above displayed interval" : null : null;
  const root = rs(["rs-reference-range", className], styles.root);
  const head = rs(["rs-reference-range-head"], styles.head);
  const labelStyle = rs(["rs-reference-range-label"], styles.label);
  const valueStyle = rs(["rs-reference-range-value"], styles.value);
  const track = rs(["rs-reference-range-track"], styles.track);
  const interval = rs(["rs-reference-range-interval"], styles.interval);
  const marker = rs(["rs-reference-range-marker"], styles.marker);
  const bounds = rs(["rs-reference-range-bounds"], styles.bounds);
  const boundValue = rs(["rs-reference-range-bound-value"], styles.boundValue);
  const description = rs(["rs-reference-range-description"], styles.description);
  return <div ref={ref} {...props} className={root.className} style={{ ...root.style, ...style }}>
    <p {...head}><span {...labelStyle}>{label}</span><span {...valueStyle}>{hasValue ? (valueLabel ?? `${value}${suffix}`) : "No result"}</span></p>
    {bounded && <div {...track} aria-hidden="true"><span {...interval} />{position != null && <span className={marker.className} style={{ ...marker.style, insetInlineStart: `${position}%` }} />}</div>}
    <p {...bounds}><span>{rangeLabel}</span><span {...boundValue}>{intervalText}</span></p>
    {placement && <p {...description}>{placement}</p>}
    {children}
  </div>;
});
