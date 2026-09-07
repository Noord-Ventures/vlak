import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";

export interface ApplicationMilestone {
  id: string;
  label: React.ReactNode;
  status: React.ReactNode;
  description?: React.ReactNode;
  dateLabel?: React.ReactNode;
  dateTime?: string;
  /** Explicitly marks the current step. No step is selected from its date or status. */
  current?: boolean;
}

export interface ApplicationStatusProps extends React.HTMLAttributes<HTMLDivElement> {
  applicationTitle: string;
  reference?: React.ReactNode;
  status: React.ReactNode;
  statusDetail?: React.ReactNode;
  updatedLabel?: React.ReactNode;
  milestones: readonly ApplicationMilestone[];
  nextStep?: React.ReactNode;
  milestonesEmptyLabel?: React.ReactNode;
}

const styles = stylex.create({
  root: { width: "100%", minWidth: 0, display: "grid", gap: "1.25rem", color: vlak.ink, lineHeight: 1.45, overflowWrap: "anywhere" },
  header: { display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "baseline", gap: "0.5rem 1rem" },
  title: { margin: 0, fontSize: "1.125rem", fontWeight: 600, lineHeight: 1.3 },
  reference: { color: vlak.gray, fontSize: "0.875rem", fontVariantNumeric: "tabular-nums" },
  overview: { display: "grid", gap: "0.5rem" },
  status: { margin: 0, fontSize: "1.5rem", fontWeight: 500, lineHeight: 1.25, letterSpacing: "-0.03em" },
  detail: { margin: 0, fontSize: "0.875rem", color: vlak.gray, maxWidth: "66ch" },
  milestones: { margin: 0, padding: 0, listStyle: "none", borderTopWidth: vlak.hairline, borderTopStyle: "solid", borderTopColor: vlak.divider },
  milestone: { display: "grid", gridTemplateColumns: { default: "minmax(0, 2fr) minmax(6rem, 1fr)", [mq.phone]: "minmax(0, 1fr)" }, gap: "0.5rem 1rem", padding: "1rem", borderBottomWidth: vlak.hairline, borderBottomStyle: "solid", borderBottomColor: vlak.divider },
  current: { backgroundColor: { default: vlak.tableAlt, [mq.forcedColors]: "Canvas" }, fontWeight: 600 },
  milestoneLabel: { fontSize: "0.875rem" },
  milestoneMeta: { display: "flex", flexDirection: "column", alignItems: { default: "flex-end", [mq.phone]: "flex-start" }, gap: "0.25rem", fontSize: "0.75rem", fontVariantNumeric: "tabular-nums" },
  next: { display: "grid", gap: "0.5rem", fontSize: "0.875rem" },
  nextLabel: { margin: 0, fontSize: "0.75rem", color: vlak.gray },
  actions: { display: "flex", flexWrap: "wrap", gap: "0.5rem" },
});

/** A case reference, explicit decision status, and supplied milestones with no inferred progress. */
export const ApplicationStatus = React.forwardRef<HTMLDivElement, ApplicationStatusProps>(function ApplicationStatus(
  { applicationTitle, reference, status, statusDetail, updatedLabel, milestones, nextStep, milestonesEmptyLabel = "Application milestones not supplied", children, className, style, ...props }, ref,
) {
  const root = rs(["rs-application-status", className], styles.root);
  const header = rs(["rs-application-status-header"], styles.header);
  const title = rs(["rs-application-status-title"], styles.title);
  const referenceStyle = rs(["rs-application-status-reference"], styles.reference);
  const overview = rs(["rs-application-status-overview"], styles.overview);
  const statusStyle = rs(["rs-application-status-status"], styles.status);
  const detail = rs(["rs-application-status-detail"], styles.detail);
  const milestonesStyle = rs(["rs-application-status-milestones"], styles.milestones);
  const milestoneLabel = rs(["rs-application-status-milestone-label"], styles.milestoneLabel);
  const milestoneMeta = rs(["rs-application-status-milestone-meta"], styles.milestoneMeta);
  const next = rs(["rs-application-status-next"], styles.next);
  const nextLabel = rs(["rs-application-status-next-label"], styles.nextLabel);
  const actions = rs(["rs-application-status-actions"], styles.actions);
  return <div ref={ref} role="group" aria-label={applicationTitle} {...props} className={root.className} style={{ ...root.style, ...style }}>
    <div {...header}><p {...title}>{applicationTitle}</p><span {...referenceStyle}>{reference ?? "Case reference not supplied"}</span></div>
    <div {...overview}><p {...statusStyle}>{status ?? "Status not supplied"}</p>{statusDetail != null && <p {...detail}>{statusDetail}</p>}<p {...detail}>{updatedLabel ?? "Update time not supplied"}</p></div>
    {milestones.length > 0 ? <ol {...milestonesStyle} aria-label="Application milestones">{milestones.map(item => {
      const milestone = rs(["rs-application-status-milestone", item.current && "rs-application-status-current"], styles.milestone, item.current && styles.current);
      return <li key={item.id} {...milestone} aria-current={item.current ? "step" : undefined}>
        <div><span {...milestoneLabel}>{item.label}</span>{item.description != null && <p {...detail}>{item.description}</p>}</div>
        <div {...milestoneMeta}><span>{item.status ?? "Status not supplied"}</span>{item.dateTime && item.dateLabel != null ? <time dateTime={item.dateTime}>{item.dateLabel}</time> : <span>{item.dateLabel ?? "Date not supplied"}</span>}</div>
      </li>;
    })}</ol> : <p {...detail}>{milestonesEmptyLabel}</p>}
    <div {...next}><p {...nextLabel}>Next step</p><div>{nextStep ?? "Next step not supplied"}</div></div>
    {children != null && <div {...actions}>{children}</div>}
  </div>;
});
