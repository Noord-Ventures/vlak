"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { Checkbox } from "./checkbox";

export interface CarePlanTask {
  id: string;
  title: string;
  owner?: React.ReactNode;
  dueLabel?: React.ReactNode;
  /** The application's recorded status. Not inferred from a due date. */
  status: React.ReactNode;
  description?: React.ReactNode;
  /** Omit for unknown completion; a control requires an explicit boolean. */
  completed?: boolean;
  pending?: boolean;
  pendingLabel?: React.ReactNode;
  disabled?: boolean;
}

export interface CarePlanProps extends React.HTMLAttributes<HTMLDivElement> {
  tasks: readonly CarePlanTask[];
  description?: React.ReactNode;
  emptyLabel?: React.ReactNode;
  /** Requests a change only. Persist it and return updated tasks from the caller. */
  onCompletedChange?: (taskId: string, completed: boolean) => void;
}

const styles = stylex.create({
  root: { width: "100%", minWidth: 0, color: vlak.ink, overflowWrap: "anywhere", lineHeight: 1.45 },
  description: { margin: 0, marginBottom: "1rem", maxWidth: "66ch", fontSize: "0.875rem", color: vlak.gray },
  list: { margin: 0, padding: 0, listStyle: "none", borderTopWidth: vlak.hairline, borderTopStyle: "solid", borderTopColor: vlak.divider },
  row: { display: "flex", flexDirection: "column", gap: "0.75rem", paddingBlock: "1.25rem", borderBottomWidth: vlak.hairline, borderBottomStyle: "solid", borderBottomColor: vlak.divider },
  title: { margin: 0, fontSize: "1rem", fontWeight: 600, lineHeight: 1.3 },
  check: { fontWeight: 600, minHeight: vlak.hit, minWidth: vlak.hit, marginBlock: "-0.375rem" },
  detail: { margin: 0, maxWidth: "66ch", fontSize: "0.875rem" },
  metadata: { margin: 0, display: "grid", gridTemplateColumns: { default: "repeat(3, minmax(0, 1fr))", [mq.phone]: "minmax(0, 1fr)" }, gap: "0.75rem 1rem" },
  field: { minWidth: 0 },
  label: { margin: 0, color: vlak.gray, fontSize: "0.75rem" },
  value: { margin: 0, marginTop: "0.25rem", fontSize: "0.875rem" },
  pending: { fontSize: "0.875rem", color: vlak.gray },
  empty: { margin: 0, paddingBlock: "1.25rem", color: vlak.gray, fontSize: "0.875rem" },
});

/** A supplied care task list with controlled completion requests and explicit pending states. */
export const CarePlan = React.forwardRef<HTMLDivElement, CarePlanProps>(function CarePlan(
  { tasks, description, emptyLabel = "No care tasks supplied", onCompletedChange, children, className, style, ...props }, ref,
) {
  const baseId = React.useId();
  const root = rs(["rs-care-plan", className], styles.root);
  const descriptionStyle = rs(["rs-care-plan-description"], styles.description);
  const list = rs(["rs-care-plan-list"], styles.list);
  const row = rs(["rs-care-plan-row"], styles.row);
  const title = rs(["rs-care-plan-title"], styles.title);
  const check = rs(["rs-care-plan-check"], styles.check);
  const detail = rs(["rs-care-plan-detail"], styles.detail);
  const metadata = rs(["rs-care-plan-metadata"], styles.metadata);
  const field = rs(["rs-care-plan-field"], styles.field);
  const label = rs(["rs-care-plan-label"], styles.label);
  const value = rs(["rs-care-plan-value"], styles.value);
  const pending = rs(["rs-care-plan-pending"], styles.pending);
  const empty = rs(["rs-care-plan-empty"], styles.empty);
  return <div ref={ref} role="group" aria-label="Care plan" {...props} className={root.className} style={{ ...root.style, ...style }}>
    {description != null && <p {...descriptionStyle}>{description}</p>}
    {tasks.length === 0 ? <p {...empty}>{emptyLabel}</p> : <ul {...list}>{tasks.map((task, index) => {
      const statusId = `${baseId}-${index}-status`;
      return <li key={task.id} {...row} aria-busy={task.pending || undefined}>
        {onCompletedChange && typeof task.completed === "boolean" ? <Checkbox {...check} label={task.title} checked={task.completed} disabled={task.pending || task.disabled} aria-describedby={statusId} onCheckedChange={completed => onCompletedChange(task.id, completed)} /> : <p {...title}>{task.title}</p>}
        {task.description != null && <p {...detail}>{task.description}</p>}
        <dl {...metadata}>
          <div {...field}><dt {...label}>Owner</dt><dd {...value}>{task.owner ?? "Owner not supplied"}</dd></div>
          <div {...field}><dt {...label}>Due</dt><dd {...value}>{task.dueLabel ?? "Due date not supplied"}</dd></div>
          <div {...field}><dt {...label}>Status</dt><dd {...value} id={statusId}>{task.status}</dd></div>
        </dl>
        <span role="status" aria-live="polite" {...pending}>{task.pending ? (task.pendingLabel ?? "Task update pending") : null}</span>
      </li>;
    })}</ul>}
    {children}
  </div>;
});
