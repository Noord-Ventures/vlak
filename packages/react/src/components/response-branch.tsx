"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../tokens.stylex";
import { rs } from "../rs";
import { Button } from "./button";

export interface ResponseBranchItem {
  /** Stable identity for a saved response alternative. */
  id: string;
  content: React.ReactNode;
  label?: string;
}
export interface ResponseBranchProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "defaultValue"> {
  branches: readonly ResponseBranchItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  label?: string;
}
const styles = stylex.create({
  root: { display: "grid", gap: "0.5rem", minWidth: 0 },
  content: { minWidth: 0 },
  controls: { display: "flex", alignItems: "center", gap: "0.25rem", minWidth: 0 },
  action: { width: 44, minWidth: 44, maxWidth: 44, height: 44, padding: 0, flexShrink: 0 },
  icon: { width: 16, height: 16, display: "block" },
  position: { color: vlak.gray, fontSize: "0.8125rem", fontVariantNumeric: "tabular-nums", minWidth: "4ch", textAlign: "center" },
  empty: { color: vlak.gray, fontSize: "0.875rem", margin: 0 },
});

/** Navigates application-owned response alternatives without changing conversation history. */
export const ResponseBranch = React.forwardRef<HTMLDivElement, ResponseBranchProps>(function ResponseBranch({
  branches, value, defaultValue, onValueChange, label = "Response alternatives", className, style, ...props
}, ref) {
  const [internalValue, setInternalValue] = React.useState(() => defaultValue ?? branches[0]?.id);
  const selectedId = value === undefined ? internalValue : value;
  const index = Math.max(0, branches.findIndex((branch) => branch.id === selectedId));
  const current = branches[index];
  const contentId = React.useId();
  const choose = (nextIndex: number) => {
    const next = branches[nextIndex];
    if (!next || next.id === current?.id) return;
    if (value === undefined) setInternalValue(next.id);
    onValueChange?.(next.id);
  };
  const root = rs(["rs-response-branch", className], styles.root);
  const content = rs(["rs-response-branch-content"], styles.content);
  const controls = rs(["rs-response-branch-controls"], styles.controls);
  const action = rs(["rs-response-branch-action"], styles.action);
  const icon = rs(["rs-response-branch-icon"], styles.icon);
  const position = rs(["rs-response-branch-position"], styles.position);
  const empty = rs(["rs-response-branch-empty"], styles.empty);
  return <div {...props} ref={ref} className={root.className} style={{ ...root.style, ...style }}>
    <div {...content} id={contentId}>{current ? <React.Fragment key={current.id}>{current.content}</React.Fragment> : <p {...empty}>No responses yet.</p>}</div>
    {branches.length > 1 && <div {...controls} role="group" aria-label={label}>
      <Button {...action} variant="subtle" disabled={index === 0} aria-label="Previous response" aria-controls={contentId} title="Previous response" onClick={() => choose(index - 1)}><svg {...icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m14 6-6 6 6 6" /></svg></Button>
      <span {...position} role="status" aria-live="polite" aria-atomic="true" aria-label={current?.label ? `${current.label}, ${index + 1} of ${branches.length}` : undefined}>{index + 1} / {branches.length}</span>
      <Button {...action} variant="subtle" disabled={index === branches.length - 1} aria-label="Next response" aria-controls={contentId} title="Next response" onClick={() => choose(index + 1)}><svg {...icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m10 6 6 6-6 6" /></svg></Button>
    </div>}
  </div>;
});
