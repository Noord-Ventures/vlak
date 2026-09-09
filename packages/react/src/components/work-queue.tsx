"use client";
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { rs } from "../rs";
import { vlak } from "../tokens.stylex";
import { Checkbox } from "./checkbox";
import { Reasoning } from "./reasoning";

export interface WorkQueueItem { id: string; content: React.ReactNode; description?: React.ReactNode; completed?: boolean; disabled?: boolean; attachments?: React.ReactNode; actions?: React.ReactNode }
export interface WorkQueueSection { id: string; title: string; items: readonly WorkQueueItem[]; defaultOpen?: boolean }
export interface WorkQueueProps extends React.HTMLAttributes<HTMLElement> { sections: readonly WorkQueueSection[]; label?: string; onItemCheckedChange?: (sectionId: string, itemId: string, checked: boolean) => void; emptyMessage?: React.ReactNode }
const styles = stylex.create({ root: { display: "grid", gap: "0.75rem", minWidth: 0, color: vlak.ink }, section: { maxWidth: "none" }, list: { display: "grid", gap: "1rem", padding: 0, margin: 0, listStyleType: "none", maxHeight: "24rem", overflowY: "auto" }, item: { display: "grid", gap: "0.5rem", paddingBlock: "0.5rem", minWidth: 0 }, row: { display: "flex", alignItems: "center", flexWrap: "wrap", justifyContent: "space-between", gap: "0.5rem", minWidth: 0 }, content: { flex: "1 1 12rem", minWidth: 0 }, complete: { color: vlak.gray, textDecorationLine: "line-through" }, detail: { color: vlak.gray, fontSize: "0.8125rem", lineHeight: 1.45 }, actions: { display: "flex", gap: "0.25rem", flexWrap: "wrap" } });
/** Supplied prompt and todo sections. Checking a row requests a change; the application owns scheduling. */
export const WorkQueue = React.forwardRef<HTMLElement, WorkQueueProps>(function WorkQueue({ sections, label = "Work queue", onItemCheckedChange, emptyMessage = "Nothing queued.", className, style, ...props }, ref) {
  const root = rs(["rs-work-queue", className], styles.root);
  return <section ref={ref} aria-label={label} {...props} className={root.className} style={{ ...root.style, ...style }}>{sections.length ? sections.map(section => <Reasoning key={section.id} {...rs(["rs-work-queue-section"], styles.section)} title={section.title} defaultOpen={section.defaultOpen ?? true} statusLabel={`${section.items.filter(item => item.completed).length}/${section.items.length}`}><ul {...rs(["rs-work-queue-list"], styles.list)} tabIndex={0} aria-label={`${section.title} items`}>{section.items.map(item => { const completed = !!item.completed; return <li key={item.id} {...rs(["rs-work-queue-item"], styles.item)}><div {...rs(["rs-work-queue-row"], styles.row)}><div {...rs(["rs-work-queue-content", completed && "rs-work-queue-complete"], styles.content, completed && styles.complete)}>{onItemCheckedChange ? <Checkbox checked={completed} disabled={item.disabled} onCheckedChange={checked => onItemCheckedChange(section.id, item.id, checked)} label={item.content} /> : <span>{completed && <span aria-label="Complete">✓ </span>}{item.content}</span>}</div>{item.actions && <div {...rs(["rs-work-queue-actions"], styles.actions)}>{item.actions}</div>}</div>{item.description && <div {...rs(["rs-work-queue-detail"], styles.detail)}>{item.description}</div>}{item.attachments}</li>; })}</ul>{section.items.length === 0 && <p>{emptyMessage}</p>}</Reasoning>) : <p role="status">{emptyMessage}</p>}</section>;
});
