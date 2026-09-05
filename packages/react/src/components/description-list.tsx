import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";

export interface DescriptionItem {
  id: string;
  label: React.ReactNode;
  value: React.ReactNode;
}
export interface DescriptionListProps extends React.HTMLAttributes<HTMLDListElement> {
  items: DescriptionItem[];
}
const styles = stylex.create({
  root: { margin: 0, width: "100%", minWidth: 0, color: vlak.ink },
  row: { display: "grid", gridTemplateColumns: { default: "minmax(8rem, 1fr) minmax(0, 2fr)", [mq.phone]: "minmax(0, 1fr)" }, gap: "0.5rem", paddingBlock: "1rem", borderBottomWidth: vlak.hairline, borderBottomStyle: "solid", borderBottomColor: vlak.divider },
  label: { margin: 0, color: vlak.gray, fontSize: "0.875rem", lineHeight: 1.45 },
  value: { margin: 0, minWidth: 0, overflowWrap: "anywhere", lineHeight: 1.45, fontVariantNumeric: "tabular-nums" },
});

/** Aligned, semantic labels and values without an extra card. */
export const DescriptionList = React.forwardRef<HTMLDListElement, DescriptionListProps>(function DescriptionList({ items, className, style, ...props }, ref) {
  const root = rs(["rs-description-list", className], styles.root);
  const row = rs(["rs-description-list-row"], styles.row);
  const label = rs(["rs-description-list-label"], styles.label);
  const value = rs(["rs-description-list-value"], styles.value);
  return <dl ref={ref} {...props} className={root.className} style={{ ...root.style, ...style }}>
    {items.map(item => <div key={item.id} {...row}><dt {...label}>{item.label}</dt><dd {...value}>{item.value}</dd></div>)}
  </dl>;
});
