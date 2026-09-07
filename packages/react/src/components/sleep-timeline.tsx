import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";

export type SleepState = "asleep" | "awake" | "unknown";

export interface SleepInterval {
  id: string;
  /** Numeric offsets in minutes on the same caller-owned timeline. */
  start: number;
  end: number;
  /** Explicit display labels, including dates or timezone when needed. */
  startLabel: string;
  endLabel: string;
  state: SleepState;
}

export interface SleepTimelineProps extends React.HTMLAttributes<HTMLElement> {
  label: React.ReactNode;
  description?: React.ReactNode;
  intervals: SleepInterval[];
  /** Visible window in minutes. All intervals must fit within it. */
  start: number;
  end: number;
  startLabel: string;
  endLabel: string;
}

const stateLabels: Record<SleepState, string> = { asleep: "Asleep", awake: "Awake", unknown: "Unknown" };

const styles = stylex.create({
  root: { display: "grid", gap: "0.75rem", minWidth: 0, margin: 0, color: vlak.ink },
  caption: { display: "grid", gap: "0.375rem" },
  label: { fontSize: vlak.controlFs, fontWeight: 600, lineHeight: 1.45 },
  description: { margin: 0, color: vlak.gray, fontSize: vlak.controlFs, lineHeight: 1.45, maxWidth: "66ch" },
  chart: { display: "flex", width: "100%", height: "2rem", borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.controlBorder, boxSizing: "border-box", overflow: "hidden" },
  // A separator must never enlarge an interval whose allotted width is below 1px.
  segment: {
    position: "relative", height: "100%", minWidth: 0, flexShrink: 0, boxSizing: "border-box", overflow: "hidden",
    "::after": { content: '""', position: "absolute", top: 0, bottom: 0, insetInlineEnd: 0, width: vlak.hairline, backgroundColor: { default: vlak.controlBorder, [mq.forcedColors]: "CanvasText" }, pointerEvents: "none" },
  },
  asleep: { backgroundColor: { default: vlak.ink, [mq.forcedColors]: "CanvasText" } },
  awake: { backgroundColor: { default: vlak.paper, [mq.forcedColors]: "Canvas" } },
  unknown: { backgroundColor: { default: vlak.tableAlt, [mq.forcedColors]: "Canvas" }, backgroundImage: { default: `repeating-linear-gradient(135deg, transparent, transparent 4px, ${vlak.controlBorder} 4px, ${vlak.controlBorder} 5px)`, [mq.forcedColors]: "none" }, borderBottomWidth: { default: 0, [mq.forcedColors]: 3 }, borderBottomStyle: "dotted", borderBottomColor: "CanvasText" },
  axis: { display: "flex", justifyContent: "space-between", gap: "1rem", fontSize: vlak.controlLabel, lineHeight: 1.45, color: vlak.gray },
  list: { display: "grid", gap: 0, listStyleType: "none", padding: 0, margin: 0, borderTopWidth: vlak.hairline, borderTopStyle: "solid", borderTopColor: vlak.divider },
  interval: { display: "flex", flexWrap: "wrap", alignItems: "baseline", justifyContent: "space-between", gap: "0.25rem 1rem", paddingBlock: "0.625rem", borderBottomWidth: vlak.hairline, borderBottomStyle: "solid", borderBottomColor: vlak.divider, fontSize: vlak.controlFs, lineHeight: 1.45 },
  period: { color: vlak.gray, fontVariantNumeric: "tabular-nums" },
});

type Segment = { start: number; end: number; startLabel: string; endLabel: string; state: SleepState; gap?: boolean };

/** Supplied sleep and wake intervals, with gaps exposed as unrecorded time. */
export const SleepTimeline = React.forwardRef<HTMLElement, SleepTimelineProps>(function SleepTimeline({
  label, description, intervals, start, end, startLabel, endLabel, className, style, ...props
}, ref) {
  const duration = end - start;
  const validWindow = Number.isFinite(start) && Number.isFinite(end) && Number.isFinite(duration) && duration > 0;
  const validIntervals = intervals.every((interval) => Number.isFinite(interval.start) && Number.isFinite(interval.end) && interval.end > interval.start && interval.start >= start && interval.end <= end && Object.hasOwn(stateLabels, interval.state));
  const ordered = [...intervals].sort((left, right) => left.start - right.start);
  const overlap = validIntervals && ordered.some((interval, index) => index > 0 && interval.start < ordered[index - 1]!.end);
  const problem = !validWindow ? "Timeline unavailable: the time window is invalid." : !validIntervals ? "Timeline unavailable: an interval is invalid or outside the time window." : overlap ? "Timeline unavailable: intervals overlap." : null;
  const segments: Segment[] = [];
  if (problem == null) {
    let cursor = start;
    let cursorLabel = startLabel;
    for (const interval of ordered) {
      if (interval.start > cursor) segments.push({ start: cursor, end: interval.start, startLabel: cursorLabel, endLabel: interval.startLabel, state: "unknown", gap: true });
      segments.push(interval);
      cursor = interval.end;
      cursorLabel = interval.endLabel;
    }
    if (cursor < end) segments.push({ start: cursor, end, startLabel: cursorLabel, endLabel, state: "unknown", gap: true });
  }
  const root = rs(["rs-sleep-timeline", className], styles.root);
  const caption = rs(["rs-sleep-timeline-caption"], styles.caption);
  const heading = rs(["rs-sleep-timeline-label"], styles.label);
  const copy = rs(["rs-sleep-timeline-description"], styles.description);
  const chart = rs(["rs-sleep-timeline-chart"], styles.chart);
  const axis = rs(["rs-sleep-timeline-axis"], styles.axis);
  const list = rs(["rs-sleep-timeline-list"], styles.list);
  const row = rs(["rs-sleep-timeline-interval"], styles.interval);
  const period = rs(["rs-sleep-timeline-period"], styles.period);
  const records = problem == null ? segments : intervals;
  return <figure {...props} ref={ref} className={root.className} style={{ ...root.style, ...style }}>
    <figcaption className={caption.className} style={caption.style}>
      <span className={heading.className} style={heading.style}>{label}</span>
      {description != null && <span className={copy.className} style={copy.style}>{description}</span>}
    </figcaption>
    {problem != null ? <p className={copy.className} style={copy.style}>{problem}</p> : <div aria-hidden="true" className={chart.className} style={chart.style}>{segments.map((segment, index) => {
      const asleep = segment.state === "asleep";
      const awake = segment.state === "awake";
      const unknown = segment.state === "unknown";
      const paint = rs(["rs-sleep-timeline-segment", asleep && "rs-sleep-timeline-asleep", awake && "rs-sleep-timeline-awake", unknown && "rs-sleep-timeline-unknown"], styles.segment, asleep && styles.asleep, awake && styles.awake, unknown && styles.unknown);
      return <span key={index} className={paint.className} style={{ ...paint.style, width: `${((segment.end - segment.start) / duration) * 100}%` }} />;
    })}</div>}
    <div className={axis.className} style={axis.style}><span>{startLabel}</span><span>{endLabel}</span></div>
    {intervals.length === 0 && <p className={copy.className} style={copy.style}>No sleep intervals recorded</p>}
    {records.length > 0 && <ul className={list.className} style={list.style}>{records.map((interval, index) => <li key={index} className={row.className} style={row.style}>
      <span>{"gap" in interval && interval.gap ? "Unrecorded" : Object.hasOwn(stateLabels, interval.state) ? stateLabels[interval.state] : "Unknown state"}</span>
      <span className={period.className} style={period.style}>{interval.startLabel} to {interval.endLabel}</span>
    </li>)}</ul>}
  </figure>;
});
