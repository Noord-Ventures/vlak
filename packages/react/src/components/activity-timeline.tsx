import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";

export interface ActivityEvent {
  id: string;
  title: React.ReactNode;
  dateTime: string;
  timeLabel?: string;
  actor?: React.ReactNode;
  description?: React.ReactNode;
  details?: React.ReactNode;
}
export interface ActivityTimelineProps extends React.HTMLAttributes<HTMLOListElement> {
  events: ActivityEvent[];
  emptyLabel?: string;
  locale?: string;
  timeZone?: string;
}
const styles = stylex.create({
  root: { listStyleType: "none", margin: 0, padding: 0, color: vlak.ink, width: "100%" },
  event: { display: "grid", gridTemplateColumns: { default: "minmax(7rem, 1fr) minmax(0, 3fr)", [mq.phone]: "minmax(0, 1fr)" }, gap: "0.5rem", paddingBlock: "1rem", borderBottomWidth: vlak.hairline, borderBottomStyle: "solid", borderBottomColor: vlak.divider },
  time: { color: vlak.gray, fontSize: "0.875rem", fontVariantNumeric: "tabular-nums", lineHeight: 1.45 },
  title: { margin: 0, fontWeight: 600, lineHeight: 1.45 },
  body: { marginBlock: "0.5rem", lineHeight: 1.45, maxWidth: "66ch", overflowWrap: "anywhere" },
  summary: { minHeight: vlak.hit, display: "list-item", alignContent: "center", cursor: "pointer", borderRadius: vlak.radiusSm, outlineColor: vlak.ink, outlineOffset: 2 },
});

/** Chronological events in caller-supplied order, with optional native disclosures. */
export const ActivityTimeline = React.forwardRef<HTMLOListElement, ActivityTimelineProps>(function ActivityTimeline({ events, emptyLabel = "No activity yet", locale = "en", timeZone = "UTC", className, style, ...props }, ref) {
  const root = rs(["rs-activity-timeline", className], styles.root);
  const row = rs(["rs-activity-timeline-event"], styles.event);
  const time = rs(["rs-activity-timeline-time"], styles.time);
  const title = rs(["rs-activity-timeline-title"], styles.title);
  const body = rs(["rs-activity-timeline-body"], styles.body);
  const summary = rs(["rs-activity-timeline-summary"], styles.summary);
  return <ol ref={ref} {...props} className={root.className} style={{ ...root.style, ...style }}>
    {!events.length && <li {...row}>{emptyLabel}</li>}
    {events.map(event => { const date = new Date(event.dateTime); return <li key={event.id} {...row}>
      <time {...time} dateTime={event.dateTime}>{event.timeLabel ?? (Number.isNaN(date.valueOf()) ? event.dateTime : new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short", timeZone }).format(date))}</time>
      <div><p {...title}>{event.title}</p>{event.actor != null && <p {...time}>{event.actor}</p>}{event.description != null && <div {...body}>{event.description}</div>}{event.details != null && <details><summary {...summary}>Details</summary><div {...body}>{event.details}</div></details>}</div>
    </li>; })}
  </ol>;
});
