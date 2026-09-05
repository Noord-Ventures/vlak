"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../tokens.stylex";
import { rs } from "../rs";
import { Button } from "./button";
import { Icon } from "./icon";

export interface ActiveFilter { id: string; label: string }
export interface FilterBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue"> {
  value?: ActiveFilter[];
  defaultValue?: ActiveFilter[];
  onValueChange?: (filters: ActiveFilter[]) => void;
  resultCount?: number;
  label?: string;
}
const styles = stylex.create({
  root: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem", color: vlak.ink, minWidth: 0 },
  count: { fontSize: "0.875rem", color: vlak.gray, fontVariantNumeric: "tabular-nums", lineHeight: 1.45 },
});

/** Removable active filters and result count. Supply filter editors as children. */
export const FilterBar = React.forwardRef<HTMLDivElement, FilterBarProps>(function FilterBar({ value, defaultValue = [], onValueChange, resultCount, label = "Active filters", children, className, style, ...props }, ref) {
  const [inner, setInner] = React.useState(defaultValue);
  const filters = value ?? inner;
  const root = rs(["rs-filter-bar", className], styles.root);
  const count = rs(["rs-filter-bar-count"], styles.count);
  const change = (next: ActiveFilter[]) => { if (value === undefined) setInner(next); onValueChange?.(next); };
  return <div ref={ref} role="group" aria-label={label} tabIndex={-1} {...props} className={root.className} style={{ ...root.style, ...style }}>
    {children}{filters.map(filter => <Button key={filter.id} variant="ghost" style={{ width: "auto" }} aria-label={`Remove ${filter.label} filter`} onClick={event => { event.currentTarget.parentElement?.focus(); change(filters.filter(entry => entry.id !== filter.id)); }}>{filter.label}<Icon name="close" size={12} /></Button>)}
    {!!filters.length && <Button variant="ghost" style={{ width: "auto" }} onClick={event => { event.currentTarget.parentElement?.focus(); change([]); }}>Clear filters</Button>}
    {resultCount != null && <span {...count} role="status">{resultCount} {resultCount === 1 ? "result" : "results"}</span>}
  </div>;
});
