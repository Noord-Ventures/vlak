"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";

export type ToolCallState = "queued" | "running" | "complete" | "error";

export interface ToolCallProps extends Omit<React.DetailsHTMLAttributes<HTMLDetailsElement>, "title"> {
  /** Name of the application-owned tool operation. */
  title: React.ReactNode;
  state?: ToolCallState;
  /** More precise supplied progress, for example approval or input preparation. */
  statusLabel?: string;
  /** Strings and numbers are rendered as plain preformatted text. Format objects before passing them. */
  input?: React.ReactNode;
  output?: React.ReactNode;
  error?: string;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const styles = stylex.create({
  root: { boxSizing: "border-box", minWidth: 0, borderWidth: vlak.hairline, borderStyle: "solid", borderColor: { default: vlak.divider, [mq.forcedColors]: "CanvasText" }, borderRadius: vlak.radiusSm, color: vlak.ink, backgroundColor: vlak.paper },
  summary: {
    display: "flex", alignItems: "center", gap: "0.75rem", boxSizing: "border-box", minHeight: vlak.hit, padding: "0.75rem 1rem", borderRadius: "inherit", cursor: "pointer", listStyle: "none",
    "::-webkit-details-marker": { display: "none" },
    outlineWidth: { default: null, ":focus-visible": 2 }, outlineStyle: { default: null, ":focus-visible": "solid" }, outlineColor: { default: null, ":focus-visible": vlak.ink }, outlineOffset: { default: null, ":focus-visible": -2 },
  },
  title: { flex: "1 1 auto", minWidth: 0, fontSize: vlak.controlFs, fontWeight: 600, overflowWrap: "anywhere" },
  state: { flexShrink: 0, fontSize: vlak.controlLabel, color: vlak.gray },
  indicator: { display: "block", flexShrink: 0, width: "1rem", height: "1rem" },
  body: { minWidth: 0, padding: "1rem", borderTopWidth: vlak.hairline, borderTopStyle: "solid", borderTopColor: vlak.divider, display: "grid", gap: "1rem" },
  section: { display: "grid", gap: "0.5rem", minWidth: 0 },
  label: { margin: 0, fontSize: vlak.controlLabel, fontWeight: 600 },
  value: { minWidth: 0, fontSize: vlak.controlFs, lineHeight: 1.45, overflowWrap: "anywhere" },
  code: { margin: 0, padding: "0.75rem", minWidth: 0, whiteSpace: "pre-wrap", overflowWrap: "anywhere", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: "0.8125rem", lineHeight: 1.45, backgroundColor: vlak.tableAlt },
  error: { margin: 0, fontSize: vlak.controlFs, lineHeight: 1.45, overflowWrap: "anywhere" },
});

const stateLabels: Record<ToolCallState, string> = { queued: "Queued", running: "Running", complete: "Complete", error: "Error" };

/** Displays supplied tool activity. The application owns execution and its state. */
export const ToolCall = React.forwardRef<HTMLDetailsElement, ToolCallProps>(function ToolCall({
  title, state = "queued", statusLabel, input, output, error, open, defaultOpen = false, onOpenChange, onToggle, className, style, children, ...props
}, ref) {
  const [innerOpen, setInnerOpen] = React.useState(defaultOpen);
  const isOpen = open ?? innerOpen;
  const root = rs(["rs-tool-call", className], styles.root);
  const summary = rs(["rs-tool-call-summary"], styles.summary);
  const heading = rs(["rs-tool-call-title"], styles.title);
  const status = rs(["rs-tool-call-state"], styles.state);
  const indicator = rs(["rs-tool-call-indicator"], styles.indicator);
  const body = rs(["rs-tool-call-body"], styles.body);
  const section = rs(["rs-tool-call-section"], styles.section);
  const label = rs(["rs-tool-call-label"], styles.label);
  const value = rs(["rs-tool-call-value"], styles.value);
  const code = rs(["rs-tool-call-code"], styles.code);
  const failure = rs(["rs-tool-call-error"], styles.error);
  const renderValue = (content: React.ReactNode) => typeof content === "string" || typeof content === "number"
    ? <pre className={code.className} style={code.style}>{content}</pre>
    : <div className={value.className} style={value.style}>{content}</div>;
  return <details {...props} ref={ref} open={isOpen} data-state={state} className={root.className} style={{ ...root.style, ...style }} onToggle={(event) => {
    const next = event.currentTarget.open;
    if (next !== isOpen) {
      if (open === undefined) setInnerOpen(next);
      else event.currentTarget.open = isOpen;
      onOpenChange?.(next);
    }
    onToggle?.(event);
  }}>
    <summary className={summary.className} style={summary.style} onClick={(event) => {
      if (open !== undefined) {
        event.preventDefault();
        onOpenChange?.(!open);
      }
    }}>
      <span className={heading.className} style={heading.style}>{title}</span>
      <span role="status" className={status.className} style={status.style}>{statusLabel ?? stateLabels[state]}</span>
      <svg {...indicator} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={isOpen ? "m6 9 6 6 6-6" : "m9 6 6 6-6 6"} /></svg>
    </summary>
    <div className={body.className} style={body.style}>
      {input !== undefined && input !== null && <div className={section.className} style={section.style}><p className={label.className} style={label.style}>Input</p>{renderValue(input)}</div>}
      {output !== undefined && output !== null && <div className={section.className} style={section.style}><p className={label.className} style={label.style}>Output</p>{renderValue(output)}</div>}
      {error !== undefined && <p role="alert" className={failure.className} style={failure.style}>{error}</p>}
      {children}
    </div>
  </details>;
});

/** Provider-neutral shape for the AI SDK static and dynamic tool lifecycle. */
export interface ToolPartPresentationInput {
  type: string;
  toolName?: string;
  state: "input-streaming" | "input-available" | "approval-requested" | "approval-responded" | "output-available" | "output-error" | "output-denied";
  approval?: { id: string; approved?: boolean; isAutomatic?: boolean };
  input?: unknown;
  output?: unknown;
  errorText?: string;
}
export interface ToolPartPresentation {
  title: string;
  state: ToolCallState;
  statusLabel: string;
  approvalStatus?: "pending" | "accepted" | "rejected";
  approvalId?: string;
  input?: unknown;
  output?: unknown;
  error?: string;
}
/** Maps supplied tool lifecycle without inferring that ready arguments have started execution. */
export function getToolCallPresentation(part: ToolPartPresentationInput): ToolPartPresentation {
  const title = part.type === "dynamic-tool" ? part.toolName || "Tool" : part.type.startsWith("tool-") ? part.type.slice(5) : part.toolName || part.type;
  const base = { title, input: part.input, output: part.output, approvalId: part.approval?.id };
  switch (part.state) {
    case "input-streaming": return { ...base, state: "queued", statusLabel: "Preparing input" };
    case "input-available": return { ...base, state: "queued", statusLabel: "Ready" };
    case "approval-requested": return { ...base, state: "queued", statusLabel: part.approval?.isAutomatic ? "Checking approval policy" : "Approval requested", approvalStatus: part.approval?.isAutomatic ? undefined : "pending" };
    case "approval-responded": return { ...base, state: "queued", statusLabel: part.approval?.approved === true ? "Approved, awaiting execution" : part.approval?.approved === false ? "Denied" : "Approval decision unavailable", approvalStatus: part.approval?.approved === true ? "accepted" : part.approval?.approved === false ? "rejected" : undefined };
    case "output-available": return { ...base, state: "complete", statusLabel: "Complete" };
    case "output-error": return { ...base, state: "error", statusLabel: "Error", error: part.errorText || "The tool could not complete." };
    case "output-denied": return { ...base, state: "complete", statusLabel: "Denied", approvalStatus: "rejected" };
  }
}
