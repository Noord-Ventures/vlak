import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";

export interface BenefitProgramCriterion {
  id: string;
  label: React.ReactNode;
  /** A supplied assessment for this criterion. It does not determine overall eligibility. */
  status: React.ReactNode;
  description?: React.ReactNode;
}

export interface BenefitProgramProps extends React.HTMLAttributes<HTMLDivElement> {
  programName: string;
  provider?: React.ReactNode;
  /** Supplied programme availability, separate from a person's eligibility. */
  status: React.ReactNode;
  eligibility: React.ReactNode;
  awardLabel?: React.ReactNode;
  awardDetails?: React.ReactNode;
  deadlineLabel?: React.ReactNode;
  criteria: readonly BenefitProgramCriterion[];
  description?: React.ReactNode;
  criteriaEmptyLabel?: React.ReactNode;
}

const styles = stylex.create({
  root: { width: "100%", minWidth: 0, color: vlak.ink, lineHeight: 1.45, overflowWrap: "anywhere", display: "grid", gap: "1.25rem" },
  header: { display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "baseline", gap: "0.75rem" },
  name: { margin: 0, fontSize: "1.25rem", fontWeight: 600, lineHeight: 1.3, letterSpacing: "-0.025em" },
  status: { fontSize: "0.75rem", padding: "0.25rem 0.5rem", borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.divider },
  detail: { margin: 0, fontSize: "0.875rem", color: vlak.gray, maxWidth: "66ch" },
  facts: { margin: 0, display: "grid", gridTemplateColumns: { default: "repeat(2, minmax(0, 1fr))", [mq.phone]: "minmax(0, 1fr)" }, gap: "1rem", padding: "1rem", backgroundColor: vlak.tableAlt },
  field: { minWidth: 0 },
  label: { margin: 0, fontSize: "0.75rem", color: vlak.gray },
  value: { margin: 0, marginTop: "0.25rem", fontSize: "0.875rem", fontVariantNumeric: "tabular-nums" },
  criteria: { margin: 0, padding: 0, listStyle: "none", borderTopWidth: vlak.hairline, borderTopStyle: "solid", borderTopColor: vlak.divider },
  criterion: { display: "grid", gap: "0.5rem", paddingBlock: "1rem", borderBottomWidth: vlak.hairline, borderBottomStyle: "solid", borderBottomColor: vlak.divider },
  criterionHead: { display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "baseline", gap: "0.5rem 1rem", fontSize: "0.875rem" },
  actions: { display: "flex", flexWrap: "wrap", gap: "0.5rem" },
});

/** Programme availability, supplied eligibility, and award terms kept as distinct facts. */
export const BenefitProgram = React.forwardRef<HTMLDivElement, BenefitProgramProps>(function BenefitProgram(
  { programName, provider, status, eligibility, awardLabel, awardDetails, deadlineLabel, criteria, description, criteriaEmptyLabel = "Eligibility criteria not supplied", children, className, style, ...props }, ref,
) {
  const root = rs(["rs-benefit-program", className], styles.root);
  const header = rs(["rs-benefit-program-header"], styles.header);
  const name = rs(["rs-benefit-program-name"], styles.name);
  const statusStyle = rs(["rs-benefit-program-status"], styles.status);
  const detail = rs(["rs-benefit-program-detail"], styles.detail);
  const facts = rs(["rs-benefit-program-facts"], styles.facts);
  const field = rs(["rs-benefit-program-field"], styles.field);
  const label = rs(["rs-benefit-program-label"], styles.label);
  const value = rs(["rs-benefit-program-value"], styles.value);
  const criteriaStyle = rs(["rs-benefit-program-criteria"], styles.criteria);
  const criterion = rs(["rs-benefit-program-criterion"], styles.criterion);
  const criterionHead = rs(["rs-benefit-program-criterion-head"], styles.criterionHead);
  const actions = rs(["rs-benefit-program-actions"], styles.actions);
  return <div ref={ref} role="group" aria-label={programName} {...props} className={root.className} style={{ ...root.style, ...style }}>
    <div {...header}><p {...name}>{programName}</p><span {...statusStyle}>{status ?? "Status not supplied"}</span></div>
    {description != null && <p {...detail}>{description}</p>}
    <dl {...facts}>
      <div {...field}><dt {...label}>Provider</dt><dd {...value}>{provider ?? "Provider not supplied"}</dd></div>
      <div {...field}><dt {...label}>Your eligibility</dt><dd {...value}>{eligibility ?? "Eligibility not supplied"}</dd></div>
      <div {...field}><dt {...label}>Award</dt><dd {...value}>{awardLabel ?? "Award amount not supplied"}{awardDetails != null && <p {...detail}>{awardDetails}</p>}</dd></div>
      <div {...field}><dt {...label}>Application deadline</dt><dd {...value}>{deadlineLabel ?? "Deadline not supplied"}</dd></div>
    </dl>
    {criteria.length > 0 ? <ul {...criteriaStyle} aria-label="Eligibility criteria">{criteria.map(item => <li key={item.id} {...criterion}><div {...criterionHead}><strong>{item.label}</strong><span>{item.status ?? "Status not supplied"}</span></div>{item.description != null && <p {...detail}>{item.description}</p>}</li>)}</ul> : <p {...detail}>{criteriaEmptyLabel}</p>}
    {children != null && <div {...actions}>{children}</div>}
  </div>;
});
