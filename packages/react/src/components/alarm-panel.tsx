"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { Button } from "./button";


export type AlarmAction = "acknowledge" | "shelve" | "unshelve";
export type AlarmFilter = "all" | "active" | "unacknowledged" | "shelved";
export interface AlarmRecord {
  id: string;
  label: string;
  source?: string;
  priority?: string;
  condition: "active" | "cleared" | "unknown";
  acknowledgement: "acknowledged" | "unacknowledged" | "unknown";
  shelving: "shelved" | "unshelved" | "unknown";
  /** Supplied expiry text; the component never schedules a shelving timer. */
  shelvedUntilLabel?: string;
  dateTime?: string;
  timeLabel?: string;
  note?: React.ReactNode;
  /** Actions allowed by the host, independently of the displayed lifecycle fields. */
  actions?: readonly AlarmAction[];
  pending?: boolean;
}
export interface AlarmPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  alarms: readonly AlarmRecord[];
  filter?: AlarmFilter;
  defaultFilter?: AlarmFilter;
  onFilterChange?: (filter: AlarmFilter) => void;
  /** Requests an operation. Update the supplied record only after the host confirms it. */
  onAction?: (id: string, action: AlarmAction) => void;
  disabled?: boolean;
  description?: React.ReactNode;
}

const styles = stylex.create({
  root: { width: "100%", minWidth: 0, color: vlak.ink, lineHeight: 1.45, overflowWrap: "anywhere" },
  heading: { margin: 0, fontSize: "1rem", fontWeight: 600 },
  copy: { margin: "0.5rem 0 0", fontSize: "0.75rem", color: vlak.gray },
  filters: { display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBlock: "1rem" },
  button: { flexShrink: 0 },
  selected: { backgroundColor: { default: vlak.ink, [mq.forcedColors]: "Highlight" }, color: { default: vlak.paper, [mq.forcedColors]: "HighlightText" } },
  list: { listStyleType: "none", margin: 0, padding: 0, borderTopWidth: vlak.hairline, borderTopStyle: "solid", borderTopColor: vlak.divider },
  item: { display: "grid", gap: "0.75rem", paddingBlock: "1rem", borderBottomWidth: vlak.hairline, borderBottomStyle: "solid", borderBottomColor: vlak.divider },
  head: { display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "0.5rem", fontSize: "0.875rem", fontWeight: 600 },
  states: { display: "flex", flexWrap: "wrap", gap: "0.5rem 1.5rem", margin: 0, fontSize: "0.875rem" },
  term: { fontSize: "0.75rem", color: vlak.gray },
  value: { margin: 0 },
  actions: { display: "flex", flexWrap: "wrap", gap: "0.5rem" },
});
const filters: Record<AlarmFilter, string> = { all: "All", active: "Active", unacknowledged: "Unacknowledged", shelved: "Shelved" };
const actionLabels: Record<AlarmAction, string> = { acknowledge: "Acknowledge", shelve: "Shelve", unshelve: "Unshelve" };

/** An industrial alarm's condition, acknowledgement and shelving are independent records. */
export const AlarmPanel = React.forwardRef<HTMLDivElement, AlarmPanelProps>(function AlarmPanel({ label, alarms, filter, defaultFilter = "all", onFilterChange, onAction, disabled, description, children, className, style, ...props }, ref) {
  const [inner, setInner] = React.useState(defaultFilter);
  const current = filter ?? inner;
  const id = React.useId();
  const visible = alarms.filter(alarm => current === "all" || (current === "active" ? alarm.condition === "active" : current === "unacknowledged" ? alarm.acknowledgement === "unacknowledged" : alarm.shelving === "shelved"));
  const root = rs(["rs-alarm-panel", className], styles.root);
  const heading = rs(["rs-alarm-panel-heading"], styles.heading);
  const copy = rs(["rs-alarm-panel-copy"], styles.copy);
  const filterStyle = rs(["rs-alarm-panel-filters"], styles.filters);
  const list = rs(["rs-alarm-panel-list"], styles.list);
  const item = rs(["rs-alarm-panel-item"], styles.item);
  const head = rs(["rs-alarm-panel-head"], styles.head);
  const states = rs(["rs-alarm-panel-states"], styles.states);
  const term = rs(["rs-alarm-panel-term"], styles.term);
  const value = rs(["rs-alarm-panel-value"], styles.value);
  const actions = rs(["rs-alarm-panel-actions"], styles.actions);
  const action = rs(["rs-alarm-panel-button"], styles.button);
  return <div {...props} ref={ref} className={root.className} style={{ ...root.style, ...style }}>
    <p {...heading} id={id}>{label}</p>
    {description != null && <p {...copy}>{description}</p>}
    <div {...filterStyle} role="group" aria-label={`${label} filter`}>{(Object.keys(filters) as AlarmFilter[]).map(key => {
      const selected = current === key;
      const button = rs(["rs-alarm-panel-button", selected && "rs-alarm-panel-selected"], styles.button, selected && styles.selected);
      return <Button variant="ghost" size="sm" key={key} {...button} type="button" disabled={disabled} aria-pressed={selected} onClick={() => { if (filter === undefined) setInner(key); onFilterChange?.(key); }}>{filters[key]}</Button>;
    })}</div>
    <p {...copy} role="status">{visible.length} of {alarms.length} alarm records</p>
    <ul {...list} aria-labelledby={id}>{visible.map(alarm => <li key={alarm.id} {...item}>
      <div {...head}><span>{alarm.label}</span>{alarm.priority && <span>{alarm.priority}</span>}</div>
      {alarm.source && <p {...copy}>{alarm.source}</p>}
      <dl {...states}>
        <div><dt {...term}>Condition</dt><dd {...value}>{alarm.condition === "active" ? "Active" : alarm.condition === "cleared" ? "Cleared" : "Unknown"}</dd></div>
        <div><dt {...term}>Acknowledgement</dt><dd {...value}>{alarm.acknowledgement === "acknowledged" ? "Acknowledged" : alarm.acknowledgement === "unacknowledged" ? "Unacknowledged" : "Unknown"}</dd></div>
        <div><dt {...term}>Shelving</dt><dd {...value}>{alarm.shelving === "shelved" ? "Shelved" : alarm.shelving === "unshelved" ? "Not shelved" : "Unknown"}</dd></div>
      </dl>
      {alarm.shelving === "shelved" && <p {...copy}>{alarm.shelvedUntilLabel ? `Shelved until ${alarm.shelvedUntilLabel}` : "Shelving expiry unknown"}</p>}
      {alarm.timeLabel && <time {...copy} dateTime={alarm.dateTime}>{alarm.timeLabel}</time>}
      {alarm.note != null && <div {...copy}>{alarm.note}</div>}
      {alarm.pending && <p {...copy} role="status">Update pending for {alarm.label}</p>}
      {onAction && !!alarm.actions?.length && <div {...actions} aria-busy={alarm.pending || undefined}>{alarm.actions.map(choice => <Button variant="ghost" size="sm" key={choice} {...action} type="button" disabled={disabled || alarm.pending} aria-label={`${actionLabels[choice]}: ${alarm.label}`} onClick={() => onAction(alarm.id, choice)}>{actionLabels[choice]}</Button>)}</div>}
    </li>)}</ul>
    {!visible.length && <p {...copy}>{alarms.length ? "No alarm records match this filter" : "No alarm records supplied"}</p>}
    {children}
  </div>;
});
