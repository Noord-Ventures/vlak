"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { Button } from "./button";

export interface CultureCondition { id: string; label: string; value: React.ReactNode }
export interface CultureAction { id: string; label: string; disabled?: boolean }
export interface CultureObservation {
  id: string;
  label: string;
  /** An offset-bearing timestamp. Missing or invalid times remain undated and sort last. */
  dateTime: string | null;
  timeLabel?: string;
  status?: string | null;
  notes?: React.ReactNode;
}
export interface CultureLogProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  cultureId: string;
  sampleId: string;
  observations: readonly CultureObservation[];
  medium?: React.ReactNode;
  status?: string | null;
  conditions?: readonly CultureCondition[];
  actions?: readonly CultureAction[];
  /** Requests a host recording action without changing any supplied observation or status. */
  onAction?: (actionId: string) => void;
  pending?: boolean;
  order?: "oldest" | "newest";
}
const styles = stylex.create({
  root: { display: "grid", gap: "1rem", minWidth: 0, color: vlak.ink, lineHeight: 1.45, overflowWrap: "anywhere" },
  head: { display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "baseline", gap: "0.5rem 1rem" },
  title: { margin: 0, fontSize: "0.875rem", fontWeight: 600 },
  copy: { margin: 0, fontSize: "0.75rem", color: vlak.gray, maxWidth: "66ch" },
  metadata: { display: "grid", gridTemplateColumns: { default: "repeat(auto-fit, minmax(min(100%, 8rem), 1fr))", [mq.phone]: "minmax(0, 1fr)" }, gap: "0.75rem 1rem", paddingBlock: "1rem", margin: 0, borderBlockWidth: vlak.hairline, borderBlockStyle: "solid", borderBlockColor: vlak.divider },
  value: { margin: "0.25rem 0 0", fontSize: "0.875rem", fontVariantNumeric: "tabular-nums" },
  list: { listStyleType: "none", margin: 0, padding: 0 },
  observation: { display: "grid", gridTemplateColumns: { default: "minmax(6rem, 1fr) minmax(0, 3fr)", [mq.phone]: "minmax(0, 1fr)" }, gap: "0.5rem 1rem", paddingBlock: "0.875rem", borderBottomWidth: vlak.hairline, borderBottomStyle: "solid", borderBottomColor: vlak.divider },
  time: { fontSize: "0.75rem", color: vlak.gray, fontVariantNumeric: "tabular-nums" },
  content: { display: "grid", gap: "0.375rem", minWidth: 0 },
  observationLabel: { margin: 0, fontSize: "0.875rem", fontWeight: 500 },
  notes: { fontSize: "0.875rem", maxWidth: "66ch" },
  actions: { display: "flex", flexWrap: "wrap", gap: "0.5rem" },
  action: { minWidth: vlak.hit, minHeight: vlak.hit, width: "auto" },
});
function timestamp(value: string | null) {
  if (value == null) return null;
  const parts = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/.exec(value);
  if (!parts) return null;
  const [, yearText, monthText, dayText, hourText, minuteText, secondText] = parts;
  const year = Number(yearText), month = Number(monthText), day = Number(dayText);
  const lastDay = month === 2 ? (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28) : [4, 6, 9, 11].includes(month) ? 30 : 31;
  if (month < 1 || month > 12 || day < 1 || day > lastDay || Number(hourText) > 23 || Number(minuteText) > 59 || Number(secondText ?? 0) > 59) return null;
  const result = Date.parse(value);
  return Number.isFinite(result) ? result : null;
}
const supplied = (value: React.ReactNode) => value == null || typeof value === "string" && !value.trim() ? "Not supplied" : typeof value === "number" && !Number.isFinite(value) ? "Unavailable" : value;
/** A chronological notebook of supplied culture observations, without protocol recommendations. */
export const CultureLog = React.forwardRef<HTMLDivElement, CultureLogProps>(function CultureLog({ label, cultureId, sampleId, observations, medium, status, conditions = [], actions = [], onAction, pending = false, order = "oldest", className, style, children, ...props }, ref) {
  const id = React.useId();
  const valid = observations.length <= 256 && conditions.length <= 32 && actions.length <= 16 && [observations, conditions, actions].every(records => records.every(record => record.id.trim()) && new Set(records.map(record => record.id)).size === records.length);
  const sorted = valid ? observations.map((observation, index) => ({ observation, index, time: timestamp(observation.dateTime) })).sort((a, b) => a.time == null ? b.time == null ? a.index - b.index : 1 : b.time == null ? -1 : (order === "newest" ? b.time - a.time : a.time - b.time) || a.index - b.index) : [];
  const root = rs(["rs-culture-log", className], styles.root);
  const head = rs(["rs-culture-log-head"], styles.head);
  const title = rs(["rs-culture-log-title"], styles.title);
  const copy = rs(["rs-culture-log-copy"], styles.copy);
  const metadata = rs(["rs-culture-log-metadata"], styles.metadata);
  const valueStyle = rs(["rs-culture-log-value"], styles.value);
  const list = rs(["rs-culture-log-list"], styles.list);
  const observationStyle = rs(["rs-culture-log-observation"], styles.observation);
  const timeStyle = rs(["rs-culture-log-time"], styles.time);
  const content = rs(["rs-culture-log-content"], styles.content);
  const observationLabel = rs(["rs-culture-log-observation-label"], styles.observationLabel);
  const notes = rs(["rs-culture-log-notes"], styles.notes);
  const actionsStyle = rs(["rs-culture-log-actions"], styles.actions);
  const actionStyle = rs(["rs-culture-log-action"], styles.action);
  return <div ref={ref} role="group" aria-labelledby={`${id}-label`} {...props} className={root.className} style={{ ...root.style, ...style }}>
    <div {...head}><p {...title} id={`${id}-label`}>{label}</p><span {...copy} id={`${id}-status`}>{status?.trim() || "Status not supplied"}</span></div>
    <dl {...metadata}><div><dt {...copy}>Culture</dt><dd {...valueStyle}>{supplied(cultureId)}</dd></div><div><dt {...copy}>Sample</dt><dd {...valueStyle}>{supplied(sampleId)}</dd></div><div><dt {...copy}>Medium</dt><dd {...valueStyle}>{supplied(medium)}</dd></div>{valid && conditions.map(condition => <div key={condition.id}><dt {...copy}>{condition.label.trim() || "Condition"}</dt><dd {...valueStyle}>{supplied(condition.value)}</dd></div>)}</dl>
    {!valid ? <p {...copy}>Culture records unavailable: supply unique identifiers, at most 256 observations, 32 conditions and 16 actions</p> : <>
      {sorted.length === 0 ? <p {...copy}>No observations supplied</p> : <><p {...copy}>{order === "oldest" ? "Oldest" : "Newest"} dated observation first; undated records follow</p><ol {...list} aria-label={`${label}, observations`}>{sorted.map(({ observation, time }) => <li key={observation.id} {...observationStyle}>
        <time {...timeStyle} dateTime={time == null ? undefined : observation.dateTime!}>{time == null ? observation.dateTime == null ? "Time not supplied" : "Timestamp unavailable" : observation.timeLabel?.trim() || observation.dateTime}</time>
        <div {...content}><div {...head}><p {...observationLabel}>{observation.label.trim() || "Observation label not supplied"}</p><span {...copy}>{observation.status?.trim() || "Observation status not supplied"}</span></div>{observation.notes != null && <div {...notes}>{observation.notes}</div>}</div>
      </li>)}</ol></>}
      <p {...copy} role="status">{pending ? "Record update pending; supplied status is unchanged" : null}</p>
      {onAction && actions.length > 0 && <div {...actionsStyle}>{actions.map(action => <Button key={action.id} {...actionStyle} variant="ghost" disabled={pending || action.disabled} aria-label={`${action.label}: ${cultureId.trim() || label}`} aria-describedby={`${id}-status`} onClick={() => onAction(action.id)}>{action.label}</Button>)}</div>}
    </>}{children}
  </div>;
});
