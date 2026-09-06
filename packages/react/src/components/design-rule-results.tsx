"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { Select } from "./select";
import { Button } from "./button";
import { useInputValue } from "../use-input-value";
import { useMergedRefs } from "../merge-refs";

export type DesignRuleSeverity = "error" | "warning" | "info";
export type DesignRuleStatus = "open" | "resolved" | "excluded";
export interface DesignRuleLocation { x: number | null; y: number | null; unit: string | null }
export interface DesignRuleViolation {
  id: string;
  title: string;
  severity: DesignRuleSeverity | null;
  status: DesignRuleStatus | null;
  rule?: string | null;
  layer?: string | null;
  net?: string | null;
  location?: DesignRuleLocation | null;
  objects?: readonly string[];
  description?: React.ReactNode;
  canResolve?: boolean;
  pending?: boolean;
  disabled?: boolean;
}
export interface DesignRuleFilter { severity: DesignRuleSeverity | "all" | "unknown"; status: DesignRuleStatus | "all" | "unknown" }
export interface DesignRuleResultsProps extends Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, "onSelect"> {
  label: React.ReactNode;
  violations: readonly DesignRuleViolation[];
  filter?: DesignRuleFilter;
  defaultFilter?: DesignRuleFilter;
  onFilterChange?: (filter: DesignRuleFilter) => void;
  selectedId?: string | null;
  /** Requests selection in the host board viewer; selectedId remains host-owned. */
  onSelect?: (id: string) => void;
  /** Requests resolution of an open result. Confirmed status never changes locally. */
  onResolve?: (id: string) => void;
  runLabel?: React.ReactNode;
  description?: React.ReactNode;
}

const initial: DesignRuleFilter = { severity: "all", status: "all" };
const severityLabels: Record<DesignRuleSeverity, string> = { error: "Error", warning: "Warning", info: "Information" };
const statusLabels: Record<DesignRuleStatus, string> = { open: "Open", resolved: "Resolved", excluded: "Excluded" };
const styles = stylex.create({
  root: { display: "grid", gap: "0.875rem", minWidth: 0, margin: 0, padding: 0, borderWidth: 0, color: vlak.ink, lineHeight: 1.45 },
  legend: { padding: 0, marginBottom: "0.75rem", fontSize: vlak.controlFs, fontWeight: 600 },
  filters: { display: "grid", gridTemplateColumns: { default: "repeat(2, minmax(0, 1fr))", [mq.phone]: "minmax(0, 1fr)" }, gap: "0.75rem" },
  field: { display: "grid", minWidth: 0, gap: "0.375rem", fontSize: vlak.controlLabel },
  control: { minWidth: 0, width: "100%", minHeight: vlak.hit },
  list: { display: "grid", gap: "0.75rem", listStyle: "none", padding: 0, margin: 0 },
  item: { display: "grid", gap: "0.75rem", minWidth: 0, padding: "0.875rem", borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.divider },
  selected: { backgroundColor: vlak.tableAlt, borderColor: { default: vlak.controlBorder, [mq.forcedColors]: "Highlight" } },
  title: { margin: 0, fontSize: vlak.controlFs, fontWeight: 600, overflowWrap: "anywhere" },
  properties: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 8rem), 1fr))", gap: "0.625rem", margin: 0 },
  term: { color: vlak.gray, fontSize: vlak.controlLabel },
  detail: { margin: 0, fontSize: vlak.controlLabel, fontVariantNumeric: "tabular-nums", overflowWrap: "anywhere" },
  actions: { display: "flex", flexWrap: "wrap", gap: "0.5rem" },
  action: { minHeight: vlak.hit, maxWidth: "100%" },
  note: { margin: 0, color: vlak.gray, fontSize: vlak.controlLabel, overflowWrap: "anywhere", maxWidth: "66ch" },
});

function supplied(value: string | null | undefined) { return value?.trim() ? value : "Not supplied"; }
function coordinate(value: number | null) { return value == null ? "Not supplied" : Number.isFinite(value) ? String(value) : "Unavailable"; }

/** Supplied rule-check outcomes with local or controlled filters and host-confirmed actions. */
export const DesignRuleResults = React.forwardRef<HTMLFieldSetElement, DesignRuleResultsProps>(function DesignRuleResults({ label, violations, filter, defaultFilter = initial, onFilterChange, selectedId, onSelect, onResolve, runLabel, description, disabled, name, form, className, style, children, "aria-describedby": ariaDescribedBy, ...props }, ref) {
  const id = React.useId();
  const [, refresh] = React.useReducer((n: number) => n + 1, 0);
  const [current, setFilter, fieldRef] = useInputValue<DesignRuleFilter, HTMLFieldSetElement>(filter, defaultFilter, onFilterChange, refresh);
  const mergedRef = useMergedRefs(ref, fieldRef);
  const validRecords = violations.every(item => item.id.length > 0) && new Set(violations.map(item => item.id)).size === violations.length;
  const visible = violations.filter(item => (current.severity === "all" || (current.severity === "unknown" ? item.severity == null : item.severity === current.severity)) && (current.status === "all" || (current.status === "unknown" ? item.status == null : item.status === current.status)));
  const describedBy = [ariaDescribedBy, description != null && `${id}-description`, `${id}-count`].filter(Boolean).join(" ");
  const root = rs(["rs-design-rule-results", className], styles.root);
  const legend = rs(["rs-design-rule-results-legend"], styles.legend);
  const filters = rs(["rs-design-rule-results-filters"], styles.filters);
  const field = rs(["rs-design-rule-results-label"], styles.field);
  const control = rs(["rs-design-rule-results-control"], styles.control);
  const list = rs(["rs-design-rule-results-list"], styles.list);
  const title = rs(["rs-design-rule-results-title"], styles.title);
  const properties = rs(["rs-design-rule-results-properties"], styles.properties);
  const term = rs(["rs-design-rule-results-term"], styles.term);
  const detail = rs(["rs-design-rule-results-detail"], styles.detail);
  const actions = rs(["rs-design-rule-results-actions"], styles.actions);
  const action = rs(["rs-design-rule-results-action"], styles.action);
  const note = rs(["rs-design-rule-results-note"], styles.note);
  return <fieldset {...props} ref={mergedRef} name={name} form={form} disabled={disabled} aria-describedby={describedBy} className={root.className} style={{ ...root.style, ...style }}>
    <legend {...legend}>{label}</legend>
    {runLabel != null && <p {...note}>{runLabel}</p>}
    {description != null && <p {...note} id={`${id}-description`}>{description}</p>}
    <div {...filters}>
      <div {...field}><span id={`${id}-severity-label`}>Severity</span><Select {...control} fullWidth name={name ? `${name}.severity` : undefined} form={form} value={current.severity} disabled={disabled} aria-labelledby={`${id}-severity-label`} options={[{ value: "all", label: "All severities" }, { value: "error", label: "Error" }, { value: "warning", label: "Warning" }, { value: "info", label: "Information" }, { value: "unknown", label: "Unknown severity" }]} onValueChange={next => { if (!disabled) setFilter({ ...current, severity: next as DesignRuleFilter["severity"] }); }} /></div>
      <div {...field}><span id={`${id}-status-label`}>Result status</span><Select {...control} fullWidth name={name ? `${name}.status` : undefined} form={form} value={current.status} disabled={disabled} aria-labelledby={`${id}-status-label`} options={[{ value: "all", label: "All statuses" }, { value: "open", label: "Open" }, { value: "resolved", label: "Resolved" }, { value: "excluded", label: "Excluded" }, { value: "unknown", label: "Unknown status" }]} onValueChange={next => { if (!disabled) setFilter({ ...current, status: next as DesignRuleFilter["status"] }); }} /></div>
    </div>
    <p {...note} id={`${id}-count`} aria-live="polite">{validRecords ? `${visible.length} of ${violations.length} results` : "Result records unavailable"}</p>
    {!validRecords ? <p {...note}>Result identifiers must be unique and non-empty.</p> : <>
      <ul {...list}>{visible.map((item, index) => {
        const row = rs(["rs-design-rule-results-item", selectedId === item.id && "rs-design-rule-results-selected"], styles.item, selectedId === item.id && styles.selected);
        const detailsId = `${id}-result-${index}`;
        const blocked = disabled || item.disabled || item.pending;
        const fields = [["Result identifier", item.id], ["Severity", item.severity == null ? "Unknown" : severityLabels[item.severity] ?? "Unknown"], ["Confirmed status", item.status == null ? "Unknown" : statusLabels[item.status] ?? "Unknown"], ["Rule", supplied(item.rule)], ["Layer", supplied(item.layer)], ["Net", supplied(item.net)]];
        return <li {...row} key={item.id}>
          <p {...title}>{item.title}{selectedId === item.id ? " · Selected" : ""}</p>
          {item.description != null && <div {...note}>{item.description}</div>}
          <div id={detailsId}><dl {...properties}>{fields.map(([key, value]) => <div key={key}><dt {...term}>{key}</dt><dd {...detail}>{value}</dd></div>)}<div><dt {...term}>Location</dt><dd {...detail}>{item.location ? `X: ${coordinate(item.location.x)}, Y: ${coordinate(item.location.y)}; unit: ${supplied(item.location.unit)}` : "Not supplied"}</dd></div><div><dt {...term}>Objects</dt><dd {...detail}>{item.objects == null ? "Not supplied" : item.objects.length === 0 ? "None recorded" : item.objects.join(", ")}</dd></div></dl></div>
          {item.pending && <p {...note}>Update pending</p>}
          {(onSelect || onResolve && item.status === "open" && item.canResolve !== false) && <div {...actions} aria-busy={item.pending || undefined}>
            {onSelect && <Button variant="ghost" {...action} type="button" disabled={blocked} aria-label={`Select result ${item.id}: ${item.title}`} aria-describedby={detailsId} onClick={() => onSelect(item.id)}>Select</Button>}
            {onResolve && item.status === "open" && item.canResolve !== false && <Button variant="ghost" {...action} type="button" disabled={blocked} aria-label={`Request resolution for ${item.id}: ${item.title}`} aria-describedby={detailsId} onClick={() => onResolve(item.id)}>Request resolution</Button>}
          </div>}
        </li>;
      })}</ul>
      {violations.length === 0 ? <p {...note}>No rule-check results supplied</p> : visible.length === 0 ? <p {...note}>No results match these filters</p> : null}
      {selectedId != null && !violations.some(item => item.id === selectedId) && <p {...note}>Selected result unavailable: {selectedId}</p>}
    </>}
    {children}
  </fieldset>;
});
