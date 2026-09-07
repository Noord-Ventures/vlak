import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";

export interface SymptomEntry {
  id: string;
  symptom: string;
  /** ISO timestamp with an explicit offset. Invalid dates sort after dated entries. */
  dateTime: string;
  timeLabel?: string;
  /** A supplied description, such as the person's own intensity scale. */
  intensity?: string;
  notes?: React.ReactNode;
  details?: React.ReactNode;
  /** Unique accessible disclosure name; defaults to symptom and display time. */
  detailsLabel?: string;
  actions?: React.ReactNode;
}

export interface SymptomDiaryProps extends React.HTMLAttributes<HTMLOListElement> {
  entries: readonly SymptomEntry[];
  emptyLabel?: string;
  /** Sorts a copy of entries. Equal timestamps retain their supplied order. */
  order?: "newest" | "oldest";
}

const styles = stylex.create({
  root: { listStyleType: "none", margin: 0, padding: 0, minWidth: 0, color: vlak.ink, lineHeight: 1.45 },
  item: { display: "grid", gridTemplateColumns: { default: "minmax(7rem, 1fr) minmax(0, 3fr)", [mq.phone]: "minmax(0, 1fr)" }, gap: "0.5rem 1rem", paddingBlock: "1rem", borderBottomWidth: vlak.hairline, borderBottomStyle: "solid", borderBottomColor: vlak.divider, overflowWrap: "anywhere" },
  time: { fontSize: "0.75rem", color: vlak.gray, fontVariantNumeric: "tabular-nums" },
  content: { display: "grid", gap: "0.5rem", minWidth: 0 },
  head: { display: "flex", justifyContent: "space-between", flexWrap: "wrap", alignItems: "baseline", gap: "0.25rem 1rem" },
  symptom: { margin: 0, fontSize: "0.875rem", fontWeight: 600 },
  intensity: { margin: 0, fontSize: "0.75rem", color: vlak.gray },
  body: { margin: 0, maxWidth: "66ch", fontSize: "0.875rem" },
  summary: { minHeight: vlak.hit, minWidth: vlak.hit, display: "list-item", alignContent: "center", cursor: "pointer", fontSize: "0.875rem", borderRadius: vlak.radiusSm, outline: { default: "none", ":focus-visible": `2px solid ${vlak.ink}` }, outlineOffset: 2, paddingInline: "0.25rem" },
  actions: { display: "flex", flexWrap: "wrap", gap: "0.5rem" },
});

/** A time-ordered record of supplied symptoms, descriptions and native detail disclosures. */
export const SymptomDiary = React.forwardRef<HTMLOListElement, SymptomDiaryProps>(function SymptomDiary({ entries, emptyLabel = "No symptoms recorded", order = "newest", className, style, children, ...props }, ref) {
  const sorted = entries.map((entry, index) => ({ entry, index, timestamp: Date.parse(entry.dateTime) })).sort((a, b) => {
    if (Number.isNaN(a.timestamp)) return Number.isNaN(b.timestamp) ? a.index - b.index : 1;
    if (Number.isNaN(b.timestamp)) return -1;
    return (order === "newest" ? b.timestamp - a.timestamp : a.timestamp - b.timestamp) || a.index - b.index;
  });
  const root = rs(["rs-symptom-diary", className], styles.root);
  const item = rs(["rs-symptom-diary-item"], styles.item);
  const time = rs(["rs-symptom-diary-time"], styles.time);
  const content = rs(["rs-symptom-diary-content"], styles.content);
  const head = rs(["rs-symptom-diary-head"], styles.head);
  const symptom = rs(["rs-symptom-diary-symptom"], styles.symptom);
  const intensity = rs(["rs-symptom-diary-intensity"], styles.intensity);
  const body = rs(["rs-symptom-diary-body"], styles.body);
  const summary = rs(["rs-symptom-diary-summary"], styles.summary);
  const actions = rs(["rs-symptom-diary-actions"], styles.actions);
  return <ol ref={ref} {...props} className={root.className} style={{ ...root.style, ...style }}>
    {sorted.length === 0 && <li {...item}>{emptyLabel}</li>}
    {sorted.map(({ entry, timestamp }) => {
      const displayTime = entry.timeLabel ?? (Number.isNaN(timestamp) ? "Time not recorded" : entry.dateTime);
      return <li key={entry.id} {...item}>
        <time {...time} dateTime={Number.isNaN(timestamp) ? undefined : entry.dateTime}>{displayTime}</time>
        <div {...content}>
          <div {...head}><p {...symptom}>{entry.symptom}</p>{entry.intensity != null && <p {...intensity}>{entry.intensity}</p>}</div>
          {entry.notes != null && <div {...body}>{entry.notes}</div>}
          {entry.details != null && <details><summary {...summary} aria-label={entry.detailsLabel ?? `Details for ${entry.symptom}, ${displayTime}`}>Details</summary><div {...body}>{entry.details}</div></details>}
          {entry.actions != null && <div {...actions}>{entry.actions}</div>}
        </div>
      </li>;
    })}
    {children}
  </ol>;
});
