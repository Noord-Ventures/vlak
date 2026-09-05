"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../tokens.stylex";
import { rs } from "../rs";
import { Button } from "./button";
import { Input } from "./input";
import { NativeSelect } from "./native-select";

export interface QueryField { id: string; label: string; type?: "text" | "number" }
export interface QueryRule { id: string; field: string; operator: "is" | "is-not" | "contains" | "greater-than" | "less-than"; value: string }
export interface QueryGroup { id: string; combinator: "and" | "or"; rules: Array<QueryRule | QueryGroup> }
export interface QueryBuilderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue"> {
  fields: QueryField[];
  value?: QueryGroup;
  defaultValue?: QueryGroup;
  onValueChange?: (query: QueryGroup) => void;
  label?: string;
  /** Maximum group nesting, capped at eight. */
  maxDepth?: number;
}
const operators = [{ value: "is", label: "is" }, { value: "is-not", label: "is not" }, { value: "contains", label: "contains" }, { value: "greater-than", label: "is greater than" }, { value: "less-than", label: "is less than" }] as const;
function fieldOperators(field?: QueryField) {
  return operators.filter(operator => field?.type === "number" ? operator.value !== "contains" : !["greater-than", "less-than"].includes(operator.value));
}
/** Human-readable summary only. This is not SQL and never executes a query. */
export function describeQuery(group: QueryGroup, fields: QueryField[]): string {
  if (!group.rules.length) return "No conditions";
  return `(${group.rules.map(rule => "rules" in rule ? describeQuery(rule, fields) : `${fields.find(field => field.id === rule.field)?.label ?? rule.field} ${operators.find(operator => operator.value === rule.operator)?.label ?? rule.operator} ${JSON.stringify(rule.value)}`).join(` ${group.combinator} `)})`;
}
const styles = stylex.create({
  root: { display: "grid", gap: "1rem", width: "100%", minWidth: 0, color: vlak.ink },
  group: { borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.divider, padding: "1rem", margin: 0, minWidth: 0, display: "grid", gap: "0.75rem" },
  legend: { fontWeight: 600, fontSize: "0.875rem", paddingInline: "0.25rem" },
  rule: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 9rem), 1fr))", gap: "0.5rem", alignItems: "end" },
  actions: { display: "flex", flexWrap: "wrap", gap: "0.5rem" },
  summary: { margin: 0, maxWidth: "66ch", overflowWrap: "anywhere", fontSize: "0.875rem", lineHeight: 1.45, color: vlak.gray },
});
function replaceGroup(tree: QueryGroup, id: string, next: (group: QueryGroup) => QueryGroup): QueryGroup {
  return tree.id === id ? next(tree) : { ...tree, rules: tree.rules.map(rule => "rules" in rule ? replaceGroup(rule, id, next) : rule) };
}

/** A structured filter expression with nested groups and native field editors. */
export const QueryBuilder = React.forwardRef<HTMLDivElement, QueryBuilderProps>(function QueryBuilder({ fields, value, defaultValue, onValueChange, label = "Filter conditions", maxDepth = 3, className, style, ...props }, ref) {
  const prefix = React.useId();
  const counter = React.useRef(0);
  const makeId = () => `${prefix}-${++counter.current}`;
  const [inner, setInner] = React.useState<QueryGroup>(() => defaultValue ?? { id: `${prefix}-root`, combinator: "and", rules: [] });
  const current = value ?? inner;
  const depthLimit = Math.max(1, Math.min(8, Number.isFinite(maxDepth) ? Math.floor(maxDepth) : 3));
  const root = rs(["rs-query-builder", className], styles.root);
  const groupStyle = rs(["rs-query-builder-group"], styles.group);
  const legend = rs(["rs-query-builder-legend"], styles.legend);
  const row = rs(["rs-query-builder-rule"], styles.rule);
  const actions = rs(["rs-query-builder-actions"], styles.actions);
  const summary = rs(["rs-query-builder-summary"], styles.summary);
  const update = (id: string, change: (group: QueryGroup) => QueryGroup) => { const next = replaceGroup(current, id, change); if (value === undefined) setInner(next); onValueChange?.(next); };
  const renderGroup = (group: QueryGroup, depth: number, parent?: string): React.ReactNode => <fieldset key={group.id} {...groupStyle}><legend {...legend}>{depth === 0 ? label : `Condition group ${depth + 1}`}</legend>
    <NativeSelect label="Match conditions" value={group.combinator} onChange={event => update(group.id, previous => ({ ...previous, combinator: event.target.value as "and" | "or" }))}><option value="and">All conditions</option><option value="or">Any condition</option></NativeSelect>
    {group.rules.map((rule, index) => "rules" in rule ? renderGroup(rule, depth + 1, group.id) : <div key={rule.id} {...row}>
      <NativeSelect label={`Field ${index + 1}`} value={rule.field} onChange={event => { const fieldId = event.currentTarget.value; const allowed = fieldOperators(fields.find(field => field.id === fieldId)); update(group.id, previous => ({ ...previous, rules: previous.rules.map(entry => entry.id === rule.id ? { ...rule, field: fieldId, operator: allowed.some(operator => operator.value === rule.operator) ? rule.operator : "is", value: "" } : entry) })); }}>{fields.map(field => <option key={field.id} value={field.id}>{field.label}</option>)}</NativeSelect>
      <NativeSelect label={`Operator ${index + 1}`} value={rule.operator} onChange={event => update(group.id, previous => ({ ...previous, rules: previous.rules.map(entry => entry.id === rule.id ? { ...rule, operator: event.target.value as QueryRule["operator"] } : entry) }))}>{!fieldOperators(fields.find(field => field.id === rule.field)).some(operator => operator.value === rule.operator) && <option value={rule.operator} disabled>Choose an operator</option>}{fieldOperators(fields.find(field => field.id === rule.field)).map(operator => <option key={operator.value} value={operator.value}>{operator.label}</option>)}</NativeSelect>
      <Input label={`Value ${index + 1}`} type={fields.find(field => field.id === rule.field)?.type ?? "text"} value={rule.value} onChange={event => update(group.id, previous => ({ ...previous, rules: previous.rules.map(entry => entry.id === rule.id ? { ...rule, value: event.target.value } : entry) }))} />
      <Button variant="ghost" aria-label={`Remove condition ${index + 1}`} onClick={event => { const fieldset = event.currentTarget.closest("fieldset"); fieldset?.querySelector("select")?.focus(); update(group.id, previous => ({ ...previous, rules: previous.rules.filter(entry => entry.id !== rule.id) })); }}>Remove</Button>
    </div>)}
    {!group.rules.length && <p {...summary}>No conditions in this group</p>}
    <div {...actions}><Button variant="ghost" disabled={!fields.length} onClick={() => update(group.id, previous => ({ ...previous, rules: [...previous.rules, { id: makeId(), field: fields[0]!.id, operator: "is", value: "" }] }))}>Add condition</Button>{depth + 1 < depthLimit && <Button variant="ghost" onClick={() => update(group.id, previous => ({ ...previous, rules: [...previous.rules, { id: makeId(), combinator: "and", rules: [] }] }))}>Add group</Button>}{parent && <Button variant="ghost" onClick={event => { const parentFieldset = event.currentTarget.closest("fieldset")?.parentElement?.closest("fieldset"); parentFieldset?.querySelector("select")?.focus(); update(parent, previous => ({ ...previous, rules: previous.rules.filter(entry => entry.id !== group.id) })); }}>Remove group</Button>}</div>
  </fieldset>;
  return <div ref={ref} {...props} className={root.className} style={{ ...root.style, ...style }}>{renderGroup(current, 0)}<p {...summary} role="note" aria-label="Query summary">{describeQuery(current, fields)}</p></div>;
});
