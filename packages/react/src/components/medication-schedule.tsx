"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { Button } from "./button";

export interface MedicationScheduleAction {
  id: string;
  /** An explicit recording choice, for example "Record as taken". */
  label: string;
  disabled?: boolean;
}

export interface MedicationScheduleItem {
  id: string;
  name: string;
  dose: React.ReactNode;
  timeLabel: React.ReactNode;
  /** Optional machine-readable value; never parsed or reformatted. */
  dateTime?: string;
  /** Recorded status supplied by the application, never inferred from the time. */
  status: React.ReactNode;
  instructions?: React.ReactNode;
  actions?: readonly MedicationScheduleAction[];
  pending?: boolean;
  pendingLabel?: React.ReactNode;
  disabled?: boolean;
}

export interface MedicationScheduleProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onAction"> {
  items: readonly MedicationScheduleItem[];
  /** Display label supplied by the application, including any relevant UTC offset. */
  timeZone: React.ReactNode;
  dateLabel?: React.ReactNode;
  emptyLabel?: React.ReactNode;
  /** Requests a record change. The caller persists it and supplies updated items. */
  onAction?: (itemId: string, actionId: string) => void;
}

const styles = stylex.create({
  root: { width: "100%", minWidth: 0, color: vlak.ink, lineHeight: 1.45, overflowWrap: "anywhere" },
  header: { display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "0.5rem 1rem", paddingBottom: "1rem", fontSize: "0.875rem" },
  zone: { color: vlak.gray, fontVariantNumeric: "tabular-nums" },
  list: { margin: 0, padding: 0, listStyle: "none", borderTopWidth: vlak.hairline, borderTopStyle: "solid", borderTopColor: vlak.divider },
  row: { display: "grid", gridTemplateColumns: { default: "minmax(4.5rem, 0.5fr) minmax(0, 3fr)", [mq.phone]: "minmax(0, 1fr)" }, gap: "0.75rem 1.25rem", paddingBlock: "1.25rem", borderBottomWidth: vlak.hairline, borderBottomStyle: "solid", borderBottomColor: vlak.divider },
  time: { fontSize: "0.875rem", fontVariantNumeric: "tabular-nums", fontWeight: 600 },
  body: { display: "flex", flexDirection: "column", minWidth: 0, gap: "0.5rem" },
  name: { margin: 0, fontSize: "1rem", fontWeight: 600, lineHeight: 1.3 },
  detail: { margin: 0, fontSize: "0.875rem", maxWidth: "66ch" },
  status: { margin: 0, color: vlak.gray, fontSize: "0.875rem" },
  actions: { display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.25rem" },
  action: { minWidth: vlak.hit, minHeight: vlak.hit, height: "auto", paddingBlock: "0.625rem", whiteSpace: "normal", lineHeight: 1.3 },
  empty: { margin: 0, paddingBlock: "1.25rem", color: vlak.gray, fontSize: "0.875rem" },
});

/** A controlled record of supplied medication rows, not a dosing or reminder engine. */
export const MedicationSchedule = React.forwardRef<HTMLDivElement, MedicationScheduleProps>(function MedicationSchedule(
  { items, timeZone, dateLabel, emptyLabel = "No medication entries supplied", onAction, children, className, style, ...props }, ref,
) {
  const baseId = React.useId();
  const root = rs(["rs-medication-schedule", className], styles.root);
  const header = rs(["rs-medication-schedule-header"], styles.header);
  const zone = rs(["rs-medication-schedule-zone"], styles.zone);
  const list = rs(["rs-medication-schedule-list"], styles.list);
  const row = rs(["rs-medication-schedule-row"], styles.row);
  const time = rs(["rs-medication-schedule-time"], styles.time);
  const body = rs(["rs-medication-schedule-body"], styles.body);
  const name = rs(["rs-medication-schedule-name"], styles.name);
  const detail = rs(["rs-medication-schedule-detail"], styles.detail);
  const status = rs(["rs-medication-schedule-status"], styles.status);
  const actions = rs(["rs-medication-schedule-actions"], styles.actions);
  const action = rs(["rs-medication-schedule-action"], styles.action);
  const empty = rs(["rs-medication-schedule-empty"], styles.empty);
  return <div ref={ref} role="group" aria-label="Medication schedule" {...props} className={root.className} style={{ ...root.style, ...style }}>
    <div {...header}>{dateLabel != null && <span>{dateLabel}</span>}<span {...zone}>{timeZone}</span></div>
    {items.length === 0 ? <p {...empty}>{emptyLabel}</p> : <ol {...list}>{items.map((item, index) => {
      const nameId = `${baseId}-${index}-name`;
      const timeId = `${baseId}-${index}-time`;
      const doseId = `${baseId}-${index}-dose`;
      const statusId = `${baseId}-${index}-status`;
      return <li key={item.id} {...row} aria-labelledby={nameId} aria-busy={item.pending || undefined}>
        {item.dateTime ? <time {...time} id={timeId} dateTime={item.dateTime}>{item.timeLabel}</time> : <span {...time} id={timeId}>{item.timeLabel}</span>}
        <div {...body}>
          <p {...name} id={nameId}>{item.name}</p>
          <p {...detail} id={doseId}>{item.dose}</p>
          {item.instructions != null && <p {...detail}>{item.instructions}</p>}
          <p {...status} id={statusId}>{item.status}</p>
          <span role="status" aria-live="polite" {...status}>{item.pending ? (item.pendingLabel ?? "Record update pending") : null}</span>
          {onAction && (item.actions?.length ?? 0) > 0 && <div {...actions}>{item.actions?.map(choice => <Button key={choice.id} {...action} variant="ghost" type="button" disabled={item.pending || item.disabled || choice.disabled} aria-label={`${choice.label}: ${item.name}`} aria-describedby={`${timeId} ${doseId} ${statusId}`} onClick={() => onAction(item.id, choice.id)}>{choice.label}</Button>)}</div>}
        </div>
      </li>;
    })}</ol>}
    {children}
  </div>;
});
