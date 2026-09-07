import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../tokens.stylex";
import { rs } from "../rs";

export interface TaxSummaryItem {
  id: string;
  label: React.ReactNode;
  /** A formatted amount including its currency/sign. No arithmetic is performed. */
  amount: React.ReactNode;
  detail?: React.ReactNode;
}

export interface TaxSummaryTotal {
  id: string;
  label: React.ReactNode;
  /** The host's assessed amount, not a sum of the displayed line items. */
  amount: React.ReactNode;
}

export interface TaxSummaryProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  periodLabel: React.ReactNode;
  reference?: React.ReactNode;
  status: React.ReactNode;
  items: readonly TaxSummaryItem[];
  totals: readonly TaxSummaryTotal[];
  dueLabel?: React.ReactNode;
  note?: React.ReactNode;
  itemsEmptyLabel?: React.ReactNode;
  totalsEmptyLabel?: React.ReactNode;
}

const styles = stylex.create({
  root: { width: "100%", minWidth: 0, color: vlak.ink, lineHeight: 1.45, overflowWrap: "anywhere" },
  header: { display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "0.5rem 1rem", marginBottom: "1rem", fontSize: "0.875rem" },
  status: { fontWeight: 600 },
  reference: { color: vlak.gray, fontVariantNumeric: "tabular-nums" },
  table: { width: "100%", borderCollapse: "collapse", tableLayout: "fixed", fontSize: "0.875rem" },
  caption: { textAlign: "start", paddingBottom: "1rem", fontSize: "1.125rem", fontWeight: 600 },
  period: { display: "block", fontSize: "0.875rem", fontWeight: 400, color: vlak.gray, marginTop: "0.25rem" },
  column: { textAlign: "start", paddingBlock: "0.75rem", borderBottomWidth: vlak.hairline, borderBottomStyle: "solid", borderBottomColor: vlak.divider, fontSize: "0.75rem", fontWeight: 500, color: vlak.gray },
  rowLabel: { textAlign: "start", fontWeight: 400, verticalAlign: "top", paddingBlock: "1rem", paddingInlineEnd: "1rem", borderBottomWidth: vlak.hairline, borderBottomStyle: "solid", borderBottomColor: vlak.divider },
  amount: { textAlign: "end", verticalAlign: "top", paddingBlock: "1rem", borderBottomWidth: vlak.hairline, borderBottomStyle: "solid", borderBottomColor: vlak.divider, fontVariantNumeric: "tabular-nums", width: "38%" },
  detail: { display: "block", color: vlak.gray, fontSize: "0.75rem", marginTop: "0.25rem" },
  total: { backgroundColor: vlak.tableAlt, fontWeight: 600 },
  footer: { display: "grid", gap: "0.5rem", marginTop: "1rem", fontSize: "0.875rem" },
  note: { margin: 0, color: vlak.gray, maxWidth: "66ch" },
  actions: { display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "1rem" },
});

/** A supplied assessment with distinct line items and authoritative totals. */
export const TaxSummary = React.forwardRef<HTMLDivElement, TaxSummaryProps>(function TaxSummary(
  { label, periodLabel, reference, status, items, totals, dueLabel, note, itemsEmptyLabel = "Assessment lines not supplied", totalsEmptyLabel = "Totals not supplied", children, className, style, ...props }, ref,
) {
  const root = rs(["rs-tax-summary", className], styles.root);
  const header = rs(["rs-tax-summary-header"], styles.header);
  const statusStyle = rs(["rs-tax-summary-status"], styles.status);
  const referenceStyle = rs(["rs-tax-summary-reference"], styles.reference);
  const table = rs(["rs-tax-summary-table"], styles.table);
  const caption = rs(["rs-tax-summary-caption"], styles.caption);
  const period = rs(["rs-tax-summary-period"], styles.period);
  const column = rs(["rs-tax-summary-column"], styles.column);
  const amountColumn = rs(["rs-tax-summary-column", "rs-tax-summary-amount"], styles.column, styles.amount);
  const rowLabel = rs(["rs-tax-summary-row-label"], styles.rowLabel);
  const amount = rs(["rs-tax-summary-amount"], styles.amount);
  const detail = rs(["rs-tax-summary-detail"], styles.detail);
  const total = rs(["rs-tax-summary-total"], styles.total);
  const footer = rs(["rs-tax-summary-footer"], styles.footer);
  const noteStyle = rs(["rs-tax-summary-note"], styles.note);
  const actions = rs(["rs-tax-summary-actions"], styles.actions);
  return <div ref={ref} role="group" aria-label={label} {...props} className={root.className} style={{ ...root.style, ...style }}>
    <div {...header}><span {...statusStyle}>{status ?? "Status not supplied"}</span><span {...referenceStyle}>{reference ?? "Assessment reference not supplied"}</span></div>
    <table {...table}>
      <caption {...caption}>{label}<span {...period}>{periodLabel ?? "Assessment period not supplied"}</span></caption>
      <thead><tr><th scope="col" {...column}>Item</th><th scope="col" {...amountColumn}>Amount</th></tr></thead>
      <tbody>{items.length > 0 ? items.map(item => <tr key={item.id}><th scope="row" {...rowLabel}>{item.label}{item.detail != null && <span {...detail}>{item.detail}</span>}</th><td {...amount}>{item.amount ?? "Amount not supplied"}</td></tr>) : <tr><td colSpan={2} {...rowLabel}>{itemsEmptyLabel}</td></tr>}</tbody>
      <tfoot>{totals.length > 0 ? totals.map(item => <tr key={item.id} {...total}><th scope="row" {...rowLabel}>{item.label}</th><td {...amount}>{item.amount ?? "Amount not supplied"}</td></tr>) : <tr><td colSpan={2} {...rowLabel}>{totalsEmptyLabel}</td></tr>}</tfoot>
    </table>
    <div {...footer}><span>{dueLabel ?? "Payment timing not supplied"}</span>{note != null && <p {...noteStyle}>{note}</p>}</div>
    {children != null && <div {...actions}>{children}</div>}
  </div>;
});
