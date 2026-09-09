"use client";
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { rs } from "../rs";
import { vlak } from "../tokens.stylex";
import { Reasoning, type ReasoningProps } from "./reasoning";
import { Shimmer } from "./shimmer";

export interface PlanProps extends Omit<ReasoningProps, "title" | "status"> { title: string; description?: string; streaming?: boolean; actions?: React.ReactNode; footer?: React.ReactNode }
const styles = stylex.create({ root: { maxWidth: "none" }, description: { margin: "0 0 1rem", color: vlak.gray }, actions: { display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "1rem" }, footer: { borderTopWidth: 1, borderTopStyle: "solid", borderTopColor: vlak.divider, paddingTop: "1rem", marginTop: "1rem" } });
/** A proposed plan with supplied steps and actions. Execution remains application-owned. */
export const Plan = React.forwardRef<HTMLDetailsElement, PlanProps>(function Plan({ title, description, streaming = false, actions, footer, children, className, style, ...props }, ref) {
  const root = rs(["rs-plan", className], styles.root);
  return <Reasoning ref={ref} defaultOpen {...props} title={<Shimmer active={streaming}>{title}</Shimmer>} status={streaming ? "streaming" : "complete"} className={root.className} style={{ ...root.style, ...style }}>{description && <p {...rs(["rs-plan-description"], styles.description)}><Shimmer active={streaming}>{description}</Shimmer></p>}{children}{actions && <div {...rs(["rs-plan-actions"], styles.actions)}>{actions}</div>}{footer && <footer {...rs(["rs-plan-footer"], styles.footer)}>{footer}</footer>}</Reasoning>;
});
