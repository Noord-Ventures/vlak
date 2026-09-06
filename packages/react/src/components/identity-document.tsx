import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";

export interface IdentityDocumentProps extends React.HTMLAttributes<HTMLDivElement> {
  documentTitle: string;
  holderName: React.ReactNode;
  /** A display-safe, already-masked identifier. This component does not mask raw data. */
  maskedIdentifier?: string | null;
  identifierLabel?: string;
  issuer?: React.ReactNode;
  issuedLabel?: React.ReactNode;
  expiresLabel?: React.ReactNode;
  /** Supplied record or verification status. Expiry is never calculated. */
  status: React.ReactNode;
  statusDetail?: React.ReactNode;
  /** Working links or application-owned actions. No reveal or copy action is generated. */
  children?: React.ReactNode;
}

const styles = stylex.create({
  root: { width: "100%", minWidth: 0, boxSizing: "border-box", borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.divider, padding: "1.25rem", display: "grid", gap: "1.25rem", color: vlak.ink, backgroundColor: vlak.paper, overflowWrap: "anywhere", lineHeight: 1.45 },
  header: { display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "baseline", gap: "0.75rem" },
  title: { margin: 0, fontWeight: 600, fontSize: "0.875rem" },
  status: { borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.divider, padding: "0.25rem 0.5rem", fontSize: "0.75rem" },
  holder: { margin: 0, fontSize: "1.375rem", fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 1.25 },
  fields: { margin: 0, display: "grid", gridTemplateColumns: { default: "repeat(2, minmax(0, 1fr))", [mq.phone]: "minmax(0, 1fr)" }, gap: "1rem" },
  field: { minWidth: 0 },
  label: { margin: 0, color: vlak.gray, fontSize: "0.75rem" },
  value: { margin: 0, marginTop: "0.25rem", fontSize: "0.875rem", fontVariantNumeric: "tabular-nums" },
  detail: { margin: 0, color: vlak.gray, maxWidth: "66ch", fontSize: "0.875rem" },
  actions: { borderTopWidth: vlak.hairline, borderTopStyle: "solid", borderTopColor: vlak.divider, paddingTop: "1rem", display: "flex", flexWrap: "wrap", gap: "0.5rem" },
});

/** A credential record using only the supplied, display-safe identity information. */
export const IdentityDocument = React.forwardRef<HTMLDivElement, IdentityDocumentProps>(function IdentityDocument(
  { documentTitle, holderName, maskedIdentifier, identifierLabel = "Document number", issuer, issuedLabel, expiresLabel, status, statusDetail, children, className, style, ...props }, ref,
) {
  const root = rs(["rs-identity-document", className], styles.root);
  const header = rs(["rs-identity-document-header"], styles.header);
  const title = rs(["rs-identity-document-title"], styles.title);
  const statusStyle = rs(["rs-identity-document-status"], styles.status);
  const holder = rs(["rs-identity-document-holder"], styles.holder);
  const fields = rs(["rs-identity-document-fields"], styles.fields);
  const field = rs(["rs-identity-document-field"], styles.field);
  const label = rs(["rs-identity-document-label"], styles.label);
  const value = rs(["rs-identity-document-value"], styles.value);
  const detail = rs(["rs-identity-document-detail"], styles.detail);
  const actions = rs(["rs-identity-document-actions"], styles.actions);
  return <div ref={ref} role="group" aria-label={documentTitle} {...props} className={root.className} style={{ ...root.style, ...style }}>
    <div {...header}><p {...title}>{documentTitle}</p><span {...statusStyle}>{status ?? "Status not supplied"}</span></div>
    <p {...holder}>{holderName ?? "Holder not supplied"}</p>
    <dl {...fields}>
      <div {...field}><dt {...label}>{identifierLabel}</dt><dd {...value}>{maskedIdentifier?.trim() ? maskedIdentifier : "Identifier not supplied"}</dd></div>
      <div {...field}><dt {...label}>Issuer</dt><dd {...value}>{issuer ?? "Issuer not supplied"}</dd></div>
      <div {...field}><dt {...label}>Issued</dt><dd {...value}>{issuedLabel ?? "Issue date not supplied"}</dd></div>
      <div {...field}><dt {...label}>Expires</dt><dd {...value}>{expiresLabel ?? "Expiry date not supplied"}</dd></div>
    </dl>
    {statusDetail != null && <p {...detail}>{statusDetail}</p>}
    {children != null && <div {...actions}>{children}</div>}
  </div>;
});
