import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../tokens.stylex";
import { rs } from "../rs";
import { ReferenceRange } from "./reference-range";

export type LabResultStatus = "final" | "pending" | "unavailable" | "amended";

export interface LabResult {
  id: string;
  name: string;
  value?: number | string | null;
  unit?: string;
  status?: LabResultStatus;
  /** A supplied textual result flag or contextual status. No flag is calculated. */
  statusLabel?: React.ReactNode;
  minimum?: number | null;
  maximum?: number | null;
  rangeLabel?: string;
  dateTime?: string;
  timeLabel?: string;
  note?: React.ReactNode;
}

export interface LabResultsProps extends Omit<React.HTMLAttributes<HTMLUListElement>, "results"> {
  /** Accessible collection name. */
  label: string;
  results: readonly LabResult[];
  emptyLabel?: string;
}

const styles = stylex.create({
  root: { listStyleType: "none", margin: 0, padding: 0, width: "100%", minWidth: 0, color: vlak.ink, lineHeight: 1.45 },
  item: { display: "grid", gap: "0.75rem", paddingBlock: "1rem", borderBottomWidth: vlak.hairline, borderBottomStyle: "solid", borderBottomColor: vlak.divider, overflowWrap: "anywhere" },
  head: { display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: "0.25rem 1rem" },
  name: { margin: 0, fontSize: "0.875rem", fontWeight: 600 },
  status: { margin: 0, fontSize: "0.75rem", color: vlak.gray },
  reading: { display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "baseline", gap: "0.25rem 1rem", margin: 0, fontSize: "1.25rem", fontWeight: 500, lineHeight: 1.2, fontVariantNumeric: "tabular-nums" },
  readingLabel: { fontSize: "0.875rem", lineHeight: 1.45 },
  readingValue: { textAlign: "end", marginInlineStart: "auto" },
  unit: { fontSize: "0.875rem", color: vlak.gray },
  note: { margin: 0, fontSize: "0.875rem", maxWidth: "66ch" },
  time: { fontSize: "0.75rem", color: vlak.gray },
});

/** Supplied laboratory results with explicit report states and optional reference intervals. */
export const LabResults = React.forwardRef<HTMLUListElement, LabResultsProps>(function LabResults({ label, results, emptyLabel = "No results available", className, style, children, ...props }, ref) {
  const root = rs(["rs-lab-results", className], styles.root);
  const itemStyle = rs(["rs-lab-results-item"], styles.item);
  const head = rs(["rs-lab-results-head"], styles.head);
  const name = rs(["rs-lab-results-name"], styles.name);
  const statusStyle = rs(["rs-lab-results-status"], styles.status);
  const reading = rs(["rs-lab-results-reading"], styles.reading);
  const readingLabel = rs(["rs-lab-results-reading-label"], styles.readingLabel);
  const readingValue = rs(["rs-lab-results-reading-value"], styles.readingValue);
  const unit = rs(["rs-lab-results-unit"], styles.unit);
  const note = rs(["rs-lab-results-note"], styles.note);
  const time = rs(["rs-lab-results-time"], styles.time);
  const labels: Record<LabResultStatus, string> = { final: "Final", pending: "Pending", unavailable: "Unavailable", amended: "Amended" };
  return <ul ref={ref} aria-label={label} {...props} className={root.className} style={{ ...root.style, ...style }}>
    {results.length === 0 && <li {...itemStyle}>{emptyLabel}</li>}
    {results.map(result => {
      const hasValue = typeof result.value === "number" ? Number.isFinite(result.value) : typeof result.value === "string" && result.value.trim().length > 0;
      const requestedStatus = result.status ?? "final";
      const status = !hasValue && requestedStatus === "final" ? "unavailable" : requestedStatus;
      const showValue = hasValue && (status === "final" || status === "amended");
      const hasRange = result.minimum != null || result.maximum != null;
      return <li key={result.id} {...itemStyle} data-status={status}>
        <div {...head}><p {...name}>{result.name}</p><p {...statusStyle}>{labels[status]}{result.statusLabel != null && <> · {result.statusLabel}</>}</p></div>
        {showValue && hasRange && typeof result.value === "number"
          ? <ReferenceRange label="Result" value={result.value} minimum={result.minimum} maximum={result.maximum} unit={result.unit} rangeLabel={result.rangeLabel} />
          : showValue && <p {...reading}><span {...readingLabel}>Result</span><span {...readingValue}>{result.value}{result.unit && <> <span {...unit}>{result.unit}</span></>}</span></p>}
        {status === "amended" && !hasValue && <p {...note}>Result unavailable</p>}
        {(result.dateTime || result.timeLabel) && <time {...time} dateTime={result.dateTime}>{result.timeLabel ?? result.dateTime}</time>}
        {result.note != null && <div {...note}>{result.note}</div>}
      </li>;
    })}
    {children}
  </ul>;
});
