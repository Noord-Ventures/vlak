"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";

export type HabitStatus = "complete" | "missed" | "skipped" | "unrecorded";

export interface HabitDay {
  /** Application-owned calendar date, used as a key and passed back unchanged. */
  date: string;
  /** Explicit accessible date label; no date or timezone is inferred. */
  label: string;
  status: HabitStatus;
  disabled?: boolean;
}

export interface HabitTrackerProps extends React.HTMLAttributes<HTMLDivElement> {
  label: React.ReactNode;
  description?: React.ReactNode;
  /** A supplied week or another dated range, rendered in the given order. */
  days: HabitDay[];
  /** A completion action requests complete, or unrecorded when clearing completion. */
  onDayChange?: (date: string, status: HabitStatus) => void;
  disabled?: boolean;
  readOnly?: boolean;
}

const statusLabels: Record<HabitStatus, string> = { complete: "Complete", missed: "Missed", skipped: "Skipped", unrecorded: "Unrecorded" };
const statusMarks: Record<HabitStatus, string> = { complete: "✓", missed: "×", skipped: "–", unrecorded: "·" };

const styles = stylex.create({
  root: { display: "grid", gap: "0.75rem", minWidth: 0, color: vlak.ink },
  label: { margin: 0, fontSize: vlak.controlFs, fontWeight: 600, lineHeight: 1.45 },
  description: { margin: 0, color: vlak.gray, fontSize: vlak.controlFs, lineHeight: 1.45, maxWidth: "66ch" },
  days: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(5rem, 1fr))", gap: "0.5rem", listStyleType: "none", padding: 0, margin: 0 },
  day: { minWidth: 0, display: "grid", gap: "0.5rem", alignContent: "start", textAlign: "center" },
  date: { fontSize: vlak.controlLabel, lineHeight: 1.45, overflowWrap: "anywhere" },
  control: { display: "grid", justifyItems: "center", alignContent: "center", gap: "0.25rem", minHeight: "4.5rem", minWidth: vlak.hit, boxSizing: "border-box", width: "100%", padding: "0.5rem", borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.controlBorder, borderRadius: vlak.radiusSm, backgroundColor: vlak.paper, color: vlak.ink, fontFamily: "inherit", fontSize: vlak.controlLabel, lineHeight: 1.45, cursor: "pointer", outlineWidth: { default: null, ":focus-visible": 2 }, outlineStyle: { default: null, ":focus-visible": "solid" }, outlineColor: vlak.ink, outlineOffset: 2 },
  complete: { backgroundColor: { default: vlak.ink, [mq.forcedColors]: "Highlight" }, color: { default: vlak.paper, [mq.forcedColors]: "HighlightText" } },
  unavailable: { cursor: "default", opacity: { default: 0.55, [mq.forcedColors]: 1 } },
  static: { cursor: "default" },
  mark: { fontSize: "1.25rem", lineHeight: 1.2 },
});

/** Dated completion records with caller-owned state and no inferred streak. */
export const HabitTracker = React.forwardRef<HTMLDivElement, HabitTrackerProps>(function HabitTracker({
  label, description, days, onDayChange, disabled = false, readOnly = false, className, style, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy, "aria-describedby": ariaDescribedBy, ...props
}, ref) {
  const id = React.useId();
  const interactive = onDayChange != null && !readOnly;
  const root = rs(["rs-habit-tracker", className], styles.root);
  const heading = rs(["rs-habit-tracker-label"], styles.label);
  const copy = rs(["rs-habit-tracker-description"], styles.description);
  const list = rs(["rs-habit-tracker-days"], styles.days);
  const dayStyle = rs(["rs-habit-tracker-day"], styles.day);
  const dateStyle = rs(["rs-habit-tracker-date"], styles.date);
  const mark = rs(["rs-habit-tracker-mark"], styles.mark);
  return <div {...props} ref={ref} role="group" aria-label={ariaLabel} aria-labelledby={ariaLabelledBy ?? (ariaLabel == null ? `${id}-label` : undefined)} aria-describedby={[ariaDescribedBy, description != null && `${id}-description`].filter(Boolean).join(" ") || undefined} className={root.className} style={{ ...root.style, ...style }}>
    <p id={`${id}-label`} className={heading.className} style={heading.style}>{label}</p>
    {description != null && <p id={`${id}-description`} className={copy.className} style={copy.style}>{description}</p>}
    {days.length === 0 && <p className={copy.className} style={copy.style}>No days recorded</p>}
    <ul className={list.className} style={list.style}>{days.map((day, index) => {
      const complete = day.status === "complete";
      const unavailable = interactive && (disabled || day.disabled);
      const control = rs(["rs-habit-tracker-control", complete && "rs-habit-tracker-complete", unavailable && "rs-habit-tracker-unavailable", !interactive && "rs-habit-tracker-static"], styles.control, complete && styles.complete, unavailable && styles.unavailable, !interactive && styles.static);
      const contents = <><span aria-hidden="true" className={mark.className} style={mark.style}>{statusMarks[day.status]}</span><span id={`${id}-status-${index}`}>{statusLabels[day.status]}</span></>;
      return <li key={day.date} className={dayStyle.className} style={dayStyle.style}>
        <span className={dateStyle.className} style={dateStyle.style}>{day.label}</span>
        {interactive ? <button type="button" disabled={disabled || day.disabled} aria-pressed={complete} aria-label={`${day.label}: completion`} aria-describedby={`${id}-status-${index}`} className={control.className} style={control.style} onClick={() => onDayChange?.(day.date, complete ? "unrecorded" : "complete")}>{contents}</button> : <div className={control.className} style={control.style}>{contents}</div>}
      </li>;
    })}</ul>
  </div>;
});
