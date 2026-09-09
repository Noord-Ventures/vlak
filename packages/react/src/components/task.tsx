"use client";
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { rs } from "../rs";
import { vlak } from "../tokens.stylex";
import { Reasoning, type ReasoningProps } from "./reasoning";

export interface TaskItem { id: string; content: React.ReactNode; file?: React.ReactNode; state?: "pending" | "active" | "complete" }
export interface TaskProps extends ReasoningProps { items?: readonly TaskItem[] }
const styles = stylex.create({ root: { maxWidth: "none" }, list: { display: "grid", gap: "0.75rem", listStyleType: "none", padding: 0, margin: 0 }, item: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem", color: vlak.gray, fontSize: "0.875rem" }, active: { color: vlak.ink, fontWeight: 600 }, file: { display: "inline-flex", alignItems: "center", gap: "0.25rem", borderWidth: 1, borderStyle: "solid", borderColor: vlak.divider, borderRadius: vlak.radiusSm, padding: "0.25rem 0.5rem", fontSize: "0.75rem" } });
/** A default-open task disclosure with supplied rows and file references. */
export const Task = React.forwardRef<HTMLDetailsElement, TaskProps>(function Task({ items = [], children, className, style, ...props }, ref) {
  const root = rs(["rs-task", className], styles.root);
  return <Reasoning ref={ref} defaultOpen title="Task" {...props} className={root.className} style={{ ...root.style, ...style }}><ul {...rs(["rs-task-list"], styles.list)}>{items.map(item => { const active = item.state === "active"; return <li key={item.id} {...rs(["rs-task-item", active && "rs-task-active"], styles.item, active && styles.active)} data-state={item.state}><span role="img" aria-label={item.state ?? "Task item"}>{item.state === "complete" ? "✓" : item.state === "active" ? "◉" : "○"}</span><span>{item.content}</span>{item.file && <span {...rs(["rs-task-file"], styles.file)}>{item.file}</span>}</li>; })}</ul>{children}</Reasoning>;
});
