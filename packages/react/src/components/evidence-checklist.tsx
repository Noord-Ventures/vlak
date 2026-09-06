"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../tokens.stylex";
import { rs } from "../rs";
import { Button } from "./button";

export interface EvidenceChecklistAction {
  id: string;
  label: string;
  disabled?: boolean;
}

export interface EvidenceChecklistItem {
  id: string;
  label: string;
  /** A supplied required/optional/unknown requirement label. */
  requirement?: React.ReactNode;
  /** Record status supplied by the application, never inferred from a filename. */
  status: React.ReactNode;
  description?: React.ReactNode;
  fileName?: React.ReactNode;
  receivedLabel?: React.ReactNode;
  actions?: readonly EvidenceChecklistAction[];
  pending?: boolean;
  pendingLabel?: React.ReactNode;
  disabled?: boolean;
}

export interface EvidenceChecklistProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onAction"> {
  label: string;
  items: readonly EvidenceChecklistItem[];
  /** Application-supplied coverage summary; the component does not count approvals. */
  summary?: React.ReactNode;
  emptyLabel?: React.ReactNode;
  /** Requests an action only; uploads, removals, and resulting statuses belong to the caller. */
  onAction?: (itemId: string, actionId: string) => void;
}

const styles = stylex.create({
  root: { width: "100%", minWidth: 0, color: vlak.ink, lineHeight: 1.45, overflowWrap: "anywhere" },
  heading: { margin: 0, fontSize: "1.125rem", fontWeight: 600, lineHeight: 1.3 },
  summary: { margin: 0, marginTop: "0.5rem", color: vlak.gray, fontSize: "0.875rem", maxWidth: "66ch" },
  list: { margin: 0, marginTop: "1rem", padding: 0, listStyle: "none", borderTopWidth: vlak.hairline, borderTopStyle: "solid", borderTopColor: vlak.divider },
  item: { display: "grid", gap: "0.75rem", paddingBlock: "1rem", borderBottomWidth: vlak.hairline, borderBottomStyle: "solid", borderBottomColor: vlak.divider },
  head: { display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "0.5rem 1rem", fontSize: "0.875rem" },
  label: { margin: 0, fontWeight: 600 },
  requirement: { color: vlak.gray, fontSize: "0.75rem" },
  detail: { margin: 0, fontSize: "0.875rem", color: vlak.gray, maxWidth: "66ch" },
  record: { display: "flex", flexWrap: "wrap", gap: "0.5rem 1rem", fontSize: "0.875rem" },
  status: { fontSize: "0.875rem", fontWeight: 500 },
  actions: { display: "flex", flexWrap: "wrap", gap: "0.5rem" },
  action: { minWidth: vlak.hit, minHeight: vlak.hit, height: "auto", whiteSpace: "normal", lineHeight: 1.3, paddingBlock: "0.625rem" },
  empty: { margin: 0, paddingBlock: "1rem", fontSize: "0.875rem", color: vlak.gray },
});

/** Evidence requirements, file records, and verification status with controlled action requests. */
export const EvidenceChecklist = React.forwardRef<HTMLDivElement, EvidenceChecklistProps>(function EvidenceChecklist(
  { label, items, summary, emptyLabel = "Evidence requirements not supplied", onAction, children, className, style, ...props }, ref,
) {
  const baseId = React.useId();
  const root = rs(["rs-evidence-checklist", className], styles.root);
  const heading = rs(["rs-evidence-checklist-heading"], styles.heading);
  const summaryStyle = rs(["rs-evidence-checklist-summary"], styles.summary);
  const list = rs(["rs-evidence-checklist-list"], styles.list);
  const itemStyle = rs(["rs-evidence-checklist-item"], styles.item);
  const head = rs(["rs-evidence-checklist-head"], styles.head);
  const itemLabel = rs(["rs-evidence-checklist-label"], styles.label);
  const requirement = rs(["rs-evidence-checklist-requirement"], styles.requirement);
  const detail = rs(["rs-evidence-checklist-detail"], styles.detail);
  const record = rs(["rs-evidence-checklist-record"], styles.record);
  const statusStyle = rs(["rs-evidence-checklist-status"], styles.status);
  const actions = rs(["rs-evidence-checklist-actions"], styles.actions);
  const action = rs(["rs-evidence-checklist-action"], styles.action);
  const empty = rs(["rs-evidence-checklist-empty"], styles.empty);
  return <div ref={ref} role="group" aria-label={label} {...props} className={root.className} style={{ ...root.style, ...style }}>
    <p {...heading}>{label}</p>{summary != null && <p {...summaryStyle}>{summary}</p>}
    {items.length > 0 ? <ul {...list}>{items.map((item, index) => {
      const requirementId = `${baseId}-${index}-requirement`;
      const recordId = `${baseId}-${index}-record`;
      const statusId = `${baseId}-${index}-status`;
      return <li key={item.id} {...itemStyle}>
        <div {...head}><p {...itemLabel}>{item.label}</p><span {...requirement} id={requirementId}>{item.requirement ?? "Requirement not supplied"}</span></div>
        {item.description != null && <p {...detail}>{item.description}</p>}
        <div {...record} id={recordId}><span>{item.fileName ?? "File details not supplied"}</span>{item.receivedLabel != null && <span {...detail}>{item.receivedLabel}</span>}</div>
        <div role="status" aria-live="polite" aria-atomic="true" {...statusStyle}><span id={statusId}>{item.status ?? "Status not supplied"}</span>{item.pending && <span> · {item.pendingLabel ?? "Evidence update pending"}</span>}</div>
        {onAction && (item.actions?.length ?? 0) > 0 && <div {...actions} aria-busy={item.pending || undefined}>{item.actions?.map(choice => <Button key={choice.id} {...action} type="button" variant="ghost" disabled={item.pending || item.disabled || choice.disabled} aria-label={`${choice.label}: ${item.label}`} aria-describedby={`${requirementId} ${recordId} ${statusId}`} onClick={() => onAction(item.id, choice.id)}>{choice.label}</Button>)}</div>}
      </li>;
    })}</ul> : <p {...empty}>{emptyLabel}</p>}
    {children}
  </div>;
});
