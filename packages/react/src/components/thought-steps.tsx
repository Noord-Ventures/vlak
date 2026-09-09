"use client";
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { rs } from "../rs";
import { vlak } from "../tokens.stylex";
import { Reasoning, type ReasoningProps } from "./reasoning";

export interface ThoughtStep { id: string; title: React.ReactNode; state?: "pending" | "active" | "complete"; description?: React.ReactNode; content?: React.ReactNode; sources?: React.ReactNode; image?: React.ReactNode; caption?: React.ReactNode; icon?: React.ReactNode }
export interface ThoughtStepsProps extends ReasoningProps { steps: readonly ThoughtStep[] }
const styles = stylex.create({ root: { maxWidth: "none" }, list: { display: "grid", gap: "1.5rem", padding: 0, margin: 0, listStyleType: "none" }, step: { display: "grid", gridTemplateColumns: "1.25rem minmax(0, 1fr)", gap: "0.75rem", fontSize: "0.875rem", lineHeight: 1.45 }, title: { color: vlak.gray, fontWeight: 500 }, active: { color: vlak.ink, fontWeight: 600 }, detail: { display: "grid", gap: "0.75rem", minWidth: 0 }, sources: { display: "flex", flexWrap: "wrap", gap: "0.5rem" }, figure: { margin: 0, display: "grid", gap: "0.5rem", minWidth: 0 }, caption: { color: vlak.gray, fontSize: "0.8125rem" } });
/** Application-supplied work summaries, with per-step state and supporting evidence. */
export const ThoughtSteps = React.forwardRef<HTMLDetailsElement, ThoughtStepsProps>(function ThoughtSteps({ steps, children, className, style, ...props }, ref) {
  const root = rs(["rs-thought-steps", className], styles.root);
  return <Reasoning ref={ref} title="Work summary" {...props} className={root.className} style={{ ...root.style, ...style }}><ol {...rs(["rs-thought-steps-list"], styles.list)}>{steps.map(step => { const active = step.state === "active"; return <li key={step.id} {...rs(["rs-thought-steps-step"], styles.step)} data-state={step.state}><span role="img" aria-label={step.state ?? "Step"}>{step.icon ?? (step.state === "complete" ? "✓" : active ? "◉" : "○")}</span><div {...rs(["rs-thought-steps-detail"], styles.detail)}><div {...rs(["rs-thought-steps-title", active && "rs-thought-steps-active"], styles.title, active && styles.active)}>{step.title}</div>{step.description && <div>{step.description}</div>}{step.content}{step.sources && <div {...rs(["rs-thought-steps-sources"], styles.sources)}>{step.sources}</div>}{step.image && <figure {...rs(["rs-thought-steps-figure"], styles.figure)}>{step.image}{step.caption && <figcaption {...rs(["rs-thought-steps-caption"], styles.caption)}>{step.caption}</figcaption>}</figure>}</div></li>; })}</ol>{children}</Reasoning>;
});
