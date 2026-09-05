"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { useMergedRefs } from "../merge-refs";
import { useInputValue } from "../use-input-value";
import { Checkbox } from "./checkbox";
import { Button } from "./button";

export interface TransferListOption { value: string; label: string; disabled?: boolean }
export interface TransferListProps extends Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, "onChange" | "defaultValue"> {
  options: TransferListOption[];
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  label?: React.ReactNode;
  availableLabel?: string;
  selectedLabel?: string;
  addLabel?: string;
  removeLabel?: string;
  emptyLabel?: string;
}

const styles = stylex.create({
  root: { borderWidth: 0, padding: 0, margin: 0, minWidth: 0 },
  legend: { fontSize: vlak.controlLabel, color: vlak.gray, marginBottom: "0.75rem", padding: 0 },
  columns: { display: "grid", gridTemplateColumns: { default: "minmax(0, 1fr) auto minmax(0, 1fr)", [mq.phone]: "minmax(0, 1fr)" }, gap: "0.75rem", alignItems: "center" },
  panel: { minWidth: 0, margin: 0, padding: "0.75rem", borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.controlBorder, borderRadius: vlak.radiusSm, alignSelf: "stretch" },
  heading: { paddingInline: "0.25rem", fontSize: vlak.controlFs, color: vlak.ink },
  list: { display: "grid", gap: "0.25rem", minHeight: "8.25rem", alignContent: "start", maxHeight: "22rem", overflowY: "auto" },
  item: { minHeight: vlak.hit, display: "flex", alignItems: "center", paddingInline: "0.25rem" },
  actions: { display: "grid", gap: "0.5rem" },
  action: { width: "auto" },
  empty: { margin: 0, color: vlak.gray, fontSize: vlak.controlFs },
  status: { margin: "0.75rem 0 0", color: vlak.gray, fontSize: vlak.controlLabel },
});

export const TransferList = React.forwardRef<HTMLFieldSetElement, TransferListProps>(function TransferList({
  options, value, defaultValue = [], onValueChange, label = "Assign options", availableLabel = "Available", selectedLabel = "Selected", addLabel = "Add selected", removeLabel = "Remove selected", emptyLabel = "No options", name, disabled, className, style, ...props
}, ref) {
  const [current, setValue, fieldRef] = useInputValue<string[], HTMLFieldSetElement>(value, defaultValue, onValueChange, () => setMarked([]));
  const mergedRef = useMergedRefs(ref, fieldRef);
  const [marked, setMarked] = React.useState<string[]>([]);
  const available = options.filter((option) => !current.includes(option.value));
  const selected = current.map((entry) => options.find((option) => option.value === entry) ?? { value: entry, label: `${entry} (unavailable)` });
  const chosenAvailable = available.filter((option) => marked.includes(option.value) && !option.disabled);
  const chosenSelected = selected.filter((option) => marked.includes(option.value) && !option.disabled);
  const root = rs(["rs-transfer-list", className], styles.root);
  const legend = rs(["rs-transfer-list-legend"], styles.legend);
  const columns = rs(["rs-transfer-list-columns"], styles.columns);
  const panel = rs(["rs-transfer-list-panel"], styles.panel);
  const heading = rs(["rs-transfer-list-heading"], styles.heading);
  const list = rs(["rs-transfer-list-options"], styles.list);
  const item = rs(["rs-transfer-list-item"], styles.item);
  const actions = rs(["rs-transfer-list-actions"], styles.actions);
  const action = rs(["rs-transfer-list-action"], styles.action);
  const empty = rs(["rs-transfer-list-empty"], styles.empty);
  const status = rs(["rs-transfer-list-status"], styles.status);
  const renderPanel = (title: string, entries: TransferListOption[]) => <fieldset className={panel.className} style={panel.style}><legend className={heading.className} style={heading.style}>{title} ({entries.length})</legend><div className={list.className} style={list.style}>
    {entries.map((option) => <div key={option.value} className={item.className} style={item.style}><Checkbox label={option.label} disabled={disabled || option.disabled} checked={marked.includes(option.value)} onChange={(event) => { const checked = event.currentTarget.checked; setMarked((previous) => checked ? [...previous, option.value] : previous.filter((entry) => entry !== option.value)); }} /></div>)}
    {!entries.length && <p className={empty.className} style={empty.style}>{emptyLabel}</p>}
  </div></fieldset>;
  return <fieldset {...props} ref={mergedRef} disabled={disabled} className={root.className} style={{ ...root.style, ...style }}>
    <legend className={legend.className} style={legend.style}>{label}</legend>
    <div className={columns.className} style={columns.style}>{renderPanel(availableLabel, available)}<div className={actions.className} style={actions.style}>
      <Button variant="ghost" disabled={disabled || !chosenAvailable.length} className={action.className} style={action.style} onClick={() => { setValue([...current, ...chosenAvailable.map((option) => option.value)]); setMarked([]); }}>{addLabel}</Button>
      <Button variant="ghost" disabled={disabled || !chosenSelected.length} className={action.className} style={action.style} onClick={() => { setValue(current.filter((entry) => !chosenSelected.some((option) => option.value === entry))); setMarked([]); }}>{removeLabel}</Button>
    </div>{renderPanel(selectedLabel, selected)}</div>
    <p role="status" className={status.className} style={status.style}>{selected.length} selected</p>
    {name && current.map((entry) => <input type="hidden" key={entry} name={name} value={entry} disabled={disabled} />)}
  </fieldset>;
});
