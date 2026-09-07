import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";

export interface PatientBannerIdentifier {
  id: string;
  label: React.ReactNode;
  value: React.ReactNode;
}

export interface PatientBannerContextItem {
  id: string;
  label: React.ReactNode;
  /** Supply the recorded value or an explicit unknown/not-reviewed statement. */
  value: React.ReactNode;
}

export interface PatientBannerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Caller-supplied identity. No age or other demographic values are inferred. */
  patientName: string;
  identifiers?: readonly PatientBannerIdentifier[];
  contextItems?: readonly PatientBannerContextItem[];
  identifiersEmptyLabel?: React.ReactNode;
  /** Missing context never means that no allergies or alerts exist. */
  contextEmptyLabel?: React.ReactNode;
}

const styles = stylex.create({
  root: { width: "100%", minWidth: 0, boxSizing: "border-box", color: vlak.ink, backgroundColor: vlak.paper, borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.divider, padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem", overflowWrap: "anywhere" },
  name: { margin: 0, fontSize: "1.375rem", fontWeight: 600, lineHeight: 1.25, letterSpacing: "-0.035em" },
  identifiers: { margin: 0, display: "flex", flexWrap: "wrap", gap: "0.75rem 2rem" },
  field: { minWidth: 0, display: "flex", flexDirection: "column", gap: "0.25rem" },
  label: { margin: 0, color: vlak.gray, fontSize: "0.75rem", lineHeight: 1.45 },
  value: { margin: 0, fontSize: "0.875rem", lineHeight: 1.45, fontVariantNumeric: "tabular-nums" },
  context: { margin: 0, display: "grid", gridTemplateColumns: { default: "repeat(auto-fit, minmax(min(100%, 12rem), 1fr))", [mq.phone]: "minmax(0, 1fr)" }, gap: "1rem", borderTopWidth: vlak.hairline, borderTopStyle: "solid", borderTopColor: vlak.divider, paddingTop: "1rem" },
  missing: { margin: 0, fontSize: "0.875rem", color: vlak.gray, lineHeight: 1.45 },
});

/** A supplied patient identity and explicitly recorded context, without clinical inference. */
export const PatientBanner = React.forwardRef<HTMLDivElement, PatientBannerProps>(function PatientBanner(
  { patientName, identifiers = [], contextItems = [], identifiersEmptyLabel = "Identifiers not supplied", contextEmptyLabel = "Patient context not supplied", children, className, style, ...props }, ref,
) {
  const root = rs(["rs-patient-banner", className], styles.root);
  const name = rs(["rs-patient-banner-name"], styles.name);
  const identifiersStyle = rs(["rs-patient-banner-identifiers"], styles.identifiers);
  const field = rs(["rs-patient-banner-field"], styles.field);
  const label = rs(["rs-patient-banner-label"], styles.label);
  const value = rs(["rs-patient-banner-value"], styles.value);
  const context = rs(["rs-patient-banner-context"], styles.context);
  const missing = rs(["rs-patient-banner-missing"], styles.missing);
  return <div ref={ref} role="group" aria-label={patientName} {...props} className={root.className} style={{ ...root.style, ...style }}>
    <p {...name}>{patientName}</p>
    {identifiers.length > 0 ? <dl {...identifiersStyle}>{identifiers.map(item => <div key={item.id} {...field}><dt {...label}>{item.label}</dt><dd {...value}>{item.value}</dd></div>)}</dl> : <p {...missing}>{identifiersEmptyLabel}</p>}
    {contextItems.length > 0 ? <dl {...context}>{contextItems.map(item => <div key={item.id} {...field}><dt {...label}>{item.label}</dt><dd {...value}>{item.value}</dd></div>)}</dl> : <p {...missing}>{contextEmptyLabel}</p>}
    {children}
  </div>;
});
