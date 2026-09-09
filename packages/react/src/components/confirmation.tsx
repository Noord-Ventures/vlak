"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { Button } from "./button";

export type ConfirmationStatus = "pending" | "accepted" | "rejected";
type Decision = Exclude<ConfirmationStatus, "pending">;

export interface ConfirmationProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** Names the proposed action and the confirmation region. */
  title: React.ReactNode;
  status?: ConfirmationStatus;
  defaultStatus?: ConfirmationStatus;
  onStatusChange?: (status: Decision) => void;
  /** Records approval. A rejection keeps the proposal pending and allows retry. */
  onConfirm: () => void | Promise<void>;
  onReject?: () => void | Promise<void>;
  confirmLabel?: string;
  rejectLabel?: string;
  disabled?: boolean;
}

const styles = stylex.create({
  root: { boxSizing: "border-box", minWidth: 0, padding: "1rem", display: "grid", gap: "0.75rem", borderWidth: vlak.hairline, borderStyle: "solid", borderColor: { default: vlak.divider, [mq.forcedColors]: "CanvasText" }, borderRadius: vlak.radiusSm, color: vlak.ink, backgroundColor: vlak.paper },
  title: { margin: 0, fontSize: vlak.controlFs, fontWeight: 600, lineHeight: 1.45, overflowWrap: "anywhere" },
  context: { minWidth: 0, fontSize: vlak.controlFs, lineHeight: 1.45, overflowWrap: "anywhere" },
  actions: { display: "flex", flexWrap: "wrap", gap: "0.5rem" },
  action: { width: "auto", minHeight: vlak.hit },
  status: { margin: 0, color: vlak.gray, fontSize: vlak.controlLabel, lineHeight: 1.45 },
  error: { margin: 0, color: vlak.ink, fontSize: vlak.controlFs, lineHeight: 1.45, overflowWrap: "anywhere" },
});

/** Records a decision about an application-owned action without executing a tool. */
export const Confirmation = React.forwardRef<HTMLElement, ConfirmationProps>(function Confirmation({
  title, status, defaultStatus = "pending", onStatusChange, onConfirm, onReject, confirmLabel = "Confirm", rejectLabel = "Reject", disabled, className, style, children, ...props
}, ref) {
  const id = React.useId();
  const [innerStatus, setInnerStatus] = React.useState<ConfirmationStatus>(defaultStatus);
  const current = status ?? innerStatus;
  const currentRef = React.useRef(current);
  currentRef.current = current;
  const [busy, setBusy] = React.useState<Decision | null>(null);
  const [acknowledged, setAcknowledged] = React.useState(false);
  const [error, setError] = React.useState("");
  const [failedDecision, setFailedDecision] = React.useState<Decision | null>(null);
  const locked = React.useRef(false);
  const version = React.useRef(0);
  const mounted = React.useRef(true);
  const previousStatus = React.useRef(status);
  React.useEffect(() => { mounted.current = true; return () => { mounted.current = false; version.current++; }; }, []);
  React.useEffect(() => {
    if (previousStatus.current === status) return;
    previousStatus.current = status;
    version.current++;
    locked.current = false;
    setBusy(null);
    setAcknowledged(false);
    setError("");
    setFailedDecision(null);
  }, [status]);

  const decide = async (decision: Decision) => {
    if (disabled || locked.current || currentRef.current !== "pending") return;
    locked.current = true;
    const request = ++version.current;
    setBusy(decision);
    setError("");
    setFailedDecision(null);
    try {
      await (decision === "accepted" ? onConfirm() : onReject?.());
    } catch (reason) {
      if (mounted.current && version.current === request) {
        setError(reason instanceof Error && reason.message ? reason.message : "Could not record your decision. Try again.");
        setFailedDecision(decision);
        setBusy(null);
        locked.current = false;
      }
      return;
    }
    if (!mounted.current || version.current !== request || currentRef.current !== "pending") return;
    if (status === undefined) {
      currentRef.current = decision;
      setInnerStatus(decision);
    } else {
      setAcknowledged(true);
    }
    setBusy(null);
    // Controlled owners may need another render or network round trip to acknowledge the decision.
    // Keep this proposal locked until they change status, or remount it for a new proposal.
    locked.current = status !== undefined;
    onStatusChange?.(decision);
  };

  const root = rs(["rs-confirmation", className], styles.root);
  const heading = rs(["rs-confirmation-title"], styles.title);
  const context = rs(["rs-confirmation-context"], styles.context);
  const actions = rs(["rs-confirmation-actions"], styles.actions);
  const action = rs(["rs-confirmation-action"], styles.action);
  const feedback = rs(["rs-confirmation-status"], styles.status);
  const failure = rs(["rs-confirmation-error"], styles.error);
  const unavailable = disabled || busy !== null || acknowledged || current !== "pending";
  const statusText = busy ? "Recording decision…" : current === "accepted" ? "Approval recorded" : current === "rejected" ? "Rejected" : acknowledged ? "Decision recorded; waiting for update" : "Awaiting your decision";

  return <section aria-labelledby={`${id}-title`} {...props} ref={ref} data-status={current} aria-busy={busy !== null || undefined} className={root.className} style={{ ...root.style, ...style }}>
    <p id={`${id}-title`} className={heading.className} style={heading.style}>{title}</p>
    {children !== undefined && <div className={context.className} style={context.style}>{children}</div>}
    <div className={actions.className} style={actions.style}>
      <Button className={action.className} style={action.style} disabled={unavailable} aria-describedby={error ? `${id}-error` : undefined} onClick={() => void decide("accepted")}>{failedDecision === "accepted" ? "Try again" : confirmLabel}</Button>
      <Button variant="ghost" className={action.className} style={action.style} disabled={unavailable} aria-describedby={error ? `${id}-error` : undefined} onClick={() => void decide("rejected")}>{failedDecision === "rejected" ? "Try again" : rejectLabel}</Button>
    </div>
    <p role="status" className={feedback.className} style={feedback.style}>{statusText}</p>
    {error && <p id={`${id}-error`} role="alert" className={failure.className} style={failure.style}>{error}</p>}
  </section>;
});
