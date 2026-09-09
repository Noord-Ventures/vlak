"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";

export type ReasoningStatus = "streaming" | "complete";

export interface ReasoningProps extends Omit<React.DetailsHTMLAttributes<HTMLDetailsElement>, "title"> {
  title?: React.ReactNode;
  /** Describes application-supplied progress, without generating a thinking trace. */
  status?: ReasoningStatus;
  statusLabel?: string;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** An inline disclosure for message activity, or a framed panel. */
  variant?: "panel" | "inline";
  /** Optional elapsed time supplied by the application, in milliseconds. */
  durationMs?: number;
  /** Measure this component's streaming interval. Off by default. */
  measureDuration?: boolean;
  /** Open when a new streaming interval begins. Manual disclosure remains the default. */
  autoExpand?: boolean;
  /** Close once after completion unless the reader manually changed the disclosure. */
  autoCollapseDelay?: number | false;
}

const styles = stylex.create({
  root: {
    boxSizing: "border-box",
    minWidth: 0,
    width: "100%",
    maxWidth: "66ch",
    borderWidth: vlak.hairline,
    borderStyle: "solid",
    borderColor: { default: vlak.divider, [mq.forcedColors]: "ButtonText" },
    borderRadius: vlak.radiusSm,
    backgroundColor: vlak.paper,
    color: vlak.ink,
  },
  inline: { borderWidth: 0, backgroundColor: "transparent" },
  summary: {
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "0.625rem",
    minWidth: vlak.hit,
    minHeight: vlak.hit,
    paddingBlock: "0.75rem",
    paddingInline: "1rem",
    borderRadius: "inherit",
    listStyle: "none",
    cursor: "pointer",
    fontSize: "0.84375rem",
    lineHeight: 1.45,
    "::-webkit-details-marker": { display: "none" },
    backgroundColor: {
      default: "transparent",
      ":hover": { default: null, [mq.hover]: vlak.controlFill },
      [mq.forcedColors]: "ButtonFace",
    },
    color: { default: vlak.ink, [mq.forcedColors]: "ButtonText" },
    outlineWidth: { default: null, ":focus-visible": 2 },
    outlineStyle: { default: null, ":focus-visible": "solid" },
    outlineColor: { default: null, ":focus-visible": vlak.ink },
    outlineOffset: { default: null, ":focus-visible": -2 },
  },
  indicator: {
    display: "block",
    flexShrink: 0,
    width: "1rem",
    height: "1rem",
  },
  summaryInline: {
    paddingBlock: "0.5rem",
    paddingInline: "0.75rem",
    color: { default: vlak.gray, ":hover": { default: null, [mq.hover]: vlak.ink }, [mq.forcedColors]: "ButtonText" },
    backgroundColor: { default: "transparent", ":hover": { default: null, [mq.hover]: "transparent" }, [mq.forcedColors]: "transparent" },
  },
  title: {
    flexGrow: 1,
    fontWeight: 600,
  },
  titleInline: { fontWeight: 400 },
  status: {
    color: vlak.gray,
    fontSize: "0.8125rem",
  },
  content: {
    paddingBlock: "0.25rem 1rem",
    paddingInline: "1rem",
    fontSize: "0.875rem",
    lineHeight: 1.45,
    overflowWrap: "anywhere",
    color: vlak.gray,
  },
});

/** A native disclosure for a work summary supplied by the application. */
export const Reasoning = React.forwardRef<HTMLDetailsElement, ReasoningProps>(function Reasoning(
  {
    title = "Work summary",
    status = "complete",
    statusLabel,
    open,
    defaultOpen = false,
    onOpenChange,
    variant = "panel",
    durationMs,
    measureDuration = false,
    autoExpand = false,
    autoCollapseDelay = false,
    onToggle,
    children,
    className,
    style,
    ...props
  },
  ref,
) {
  const [innerOpen, setInnerOpen] = React.useState(defaultOpen);
  const [elapsed, setElapsed] = React.useState(0);
  const manuallyChanged = React.useRef(false);
  const changeOpen = React.useRef((next: boolean) => { if (open === undefined) setInnerOpen(next); onOpenChange?.(next); });
  changeOpen.current = (next: boolean) => { if (open === undefined) setInnerOpen(next); onOpenChange?.(next); };
  const previousStatus = React.useRef<ReasoningStatus | undefined>(undefined);
  const began = React.useRef<number | null>(null);
  React.useEffect(() => {
    const nextInterval = status === "streaming" && previousStatus.current !== "streaming";
    const completed = status === "complete" && previousStatus.current === "streaming";
    previousStatus.current = status;
    if (nextInterval) {
      manuallyChanged.current = false;
      began.current = Date.now();
      setElapsed(0);
      if (autoExpand) changeOpen.current(true);
    }
    if (completed && began.current !== null) setElapsed(Math.max(0, Date.now() - began.current));
    if (completed && autoCollapseDelay !== false && !manuallyChanged.current) {
      const timer = setTimeout(() => { if (!manuallyChanged.current) changeOpen.current(false); }, Math.max(0, Number.isFinite(autoCollapseDelay) ? autoCollapseDelay : 0));
      return () => clearTimeout(timer);
    }
  }, [status, autoExpand, autoCollapseDelay]);
  React.useEffect(() => {
    if (!measureDuration || status !== "streaming") return;
    const timer = setInterval(() => { if (began.current !== null) setElapsed(Math.max(0, Date.now() - began.current)); }, 1000);
    return () => clearInterval(timer);
  }, [status, measureDuration]);
  const duration = durationMs ?? (measureDuration ? elapsed : undefined);
  const isOpen = open ?? innerOpen;
  const inline = variant === "inline";
  const root = rs(["rs-reasoning", inline && "rs-reasoning-inline", className], styles.root, inline && styles.inline);
  const summary = rs(["rs-reasoning-summary", inline && "rs-reasoning-summary-inline"], styles.summary, inline && styles.summaryInline);
  const indicator = rs(["rs-reasoning-indicator"], styles.indicator);
  const titleStyle = rs(["rs-reasoning-title", inline && "rs-reasoning-title-inline"], styles.title, inline && styles.titleInline);
  const statusStyle = rs(["rs-reasoning-status"], styles.status);
  const content = rs(["rs-reasoning-content"], styles.content);

  return (
    <details
      ref={ref}
      {...props}
      open={isOpen}
      data-status={status}
      className={root.className}
      style={{ ...root.style, ...style }}
      onToggle={(event) => {
        const nextOpen = event.currentTarget.open;
        if (nextOpen !== isOpen) {
          manuallyChanged.current = true;
          if (open === undefined) setInnerOpen(nextOpen);
          else event.currentTarget.open = open;
          onOpenChange?.(nextOpen);
        }
        onToggle?.(event);
      }}
    >
      <summary
        {...summary}
        onClick={(event) => {
          manuallyChanged.current = true;
          if (open !== undefined) { event.preventDefault(); onOpenChange?.(!open); }
        }}
      >
        <svg {...indicator} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={isOpen ? "m6 9 6 6 6-6" : "m9 6 6 6-6 6"} /></svg>
        <span {...titleStyle}>{title}</span>
        <span {...statusStyle} role="status" aria-live="polite" aria-atomic="true">
          {statusLabel ?? (status === "streaming" ? "In progress" : "Complete")}
          {duration !== undefined && Number.isFinite(duration) && <span aria-hidden={status === "streaming" || undefined}>{` · ${Math.round(Math.max(0, duration) / 1000)}s`}</span>}
        </span>
      </summary>
      <div {...content}>{children}</div>
    </details>
  );
});
