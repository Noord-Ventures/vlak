"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { useMergedRefs } from "../merge-refs";
import { useInputValue } from "../use-input-value";
import { useFieldControl } from "./field";
import { Checkbox } from "./checkbox";
import { Input } from "./input";
import { Button } from "./button";
import { Icon } from "./icon";

export interface MultiSelectOption { value: string; label: string; disabled?: boolean }
export interface MultiSelectProps extends Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, "onChange" | "defaultValue"> {
  options: MultiSelectOption[];
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  label?: React.ReactNode;
  placeholder?: string;
  searchable?: boolean;
  searchLabel?: string;
  emptyLabel?: React.ReactNode;
  clearLabel?: string;
}

const styles = stylex.create({
  root: { display: "grid", gap: "0.5rem", minWidth: 0, borderWidth: 0, margin: 0, padding: 0 },
  legend: { padding: 0, marginBottom: "0.5rem", fontSize: vlak.controlLabel, color: vlak.gray },
  trigger: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem", boxSizing: "border-box", minHeight: vlak.hit, padding: "0.625rem 0.75rem", color: vlak.ink, backgroundColor: vlak.paper, borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.controlBorder, borderRadius: vlak.radiusSm, fontSize: vlak.controlFs, cursor: "pointer", listStyle: "none", "::-webkit-details-marker": { display: "none" }, outlineWidth: { default: null, ":focus-visible": 2 }, outlineStyle: { default: null, ":focus-visible": "solid" }, outlineColor: vlak.ink, outlineOffset: 2 },
  panel: { display: "grid", gap: "0.5rem", marginTop: "0.5rem", padding: "0.75rem", borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.controlBorder, borderRadius: vlak.radiusSm, backgroundColor: vlak.paper },
  options: { display: "grid", gap: "0.25rem", maxHeight: "16.5rem", overflowY: "auto", overscrollBehavior: "contain" },
  option: { minHeight: vlak.hit, paddingInline: "0.5rem", borderRadius: vlak.radiusSm },
  selected: { backgroundColor: { default: vlak.controlFill, [mq.forcedColors]: "Highlight" }, color: { default: vlak.ink, [mq.forcedColors]: "HighlightText" } },
  empty: { margin: 0, paddingBlock: "0.75rem", color: vlak.gray, fontSize: vlak.controlFs },
  clear: { justifySelf: "start", width: "auto" },
});

/** A native disclosure containing named checkboxes; selections remain visible when collapsed. */
export const MultiSelect = React.forwardRef<HTMLFieldSetElement, MultiSelectProps>(function MultiSelect({
  options, value, defaultValue = [], onValueChange, label = "Options", placeholder = "Select options", searchable = true, searchLabel = "Filter options", emptyLabel = "No matching options", clearLabel = "Clear selection", name, disabled, className, style, onKeyDown, ...props
}, ref) {
  const [current, setValue, fieldRef] = useInputValue<string[], HTMLFieldSetElement>(value, defaultValue, onValueChange, () => setQuery(""));
  const mergedRef = useMergedRefs(ref, fieldRef);
  const [query, setQuery] = React.useState("");
  const detailsRef = React.useRef<HTMLDetailsElement>(null);
  const summaryRef = React.useRef<HTMLElement>(null);
  const field = useFieldControl(props);
  const availableOptions: MultiSelectOption[] = [...options, ...current.filter((item) => !options.some((option) => option.value === item)).map((item) => ({ value: item, label: `${item} (unavailable)` }))];
  const selected = availableOptions.filter((option) => current.includes(option.value));
  const shown = availableOptions.filter((option) => option.label.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  const summary = selected.length ? `${selected.slice(0, 2).map((option) => option.label).join(", ")}${selected.length > 2 ? ` +${selected.length - 2}` : ""}` : placeholder;
  const root = rs(["rs-multi-select", className], styles.root);
  const legend = rs(["rs-multi-select-legend"], styles.legend);
  const trigger = rs(["rs-multi-select-trigger"], styles.trigger);
  const panel = rs(["rs-multi-select-panel"], styles.panel);
  const list = rs(["rs-multi-select-options"], styles.options);
  const empty = rs(["rs-multi-select-empty"], styles.empty);
  const clear = rs(["rs-multi-select-clear"], styles.clear);
  return <fieldset {...props} ref={mergedRef} disabled={disabled} className={root.className} style={{ ...root.style, ...style }} aria-describedby={field["aria-describedby"]} aria-invalid={field["aria-invalid"]} onKeyDown={(event) => {
    onKeyDown?.(event);
    if (!event.defaultPrevented && event.key === "Escape" && detailsRef.current?.open) { event.preventDefault(); detailsRef.current.open = false; summaryRef.current?.focus(); }
  }}>
    <legend className={legend.className} style={legend.style}>{label}</legend>
    <details ref={detailsRef}>
      <summary ref={summaryRef} aria-disabled={disabled || undefined} tabIndex={disabled ? -1 : undefined} className={trigger.className} style={trigger.style} onClick={(event) => { if (disabled) event.preventDefault(); }}><span>{summary}</span><Icon name="chevron-down" size={16} /></summary>
      <div className={panel.className} style={panel.style}>
        {searchable && <Input plain aria-label={searchLabel} value={query} onChange={(event) => setQuery(event.currentTarget.value)} type="search" disabled={disabled} />}
        <div className={list.className} style={list.style}>
          {shown.map((option) => {
            const checked = current.includes(option.value);
            const row = rs(["rs-multi-select-option", checked && "rs-multi-select-selected"], styles.option, checked && styles.selected);
            return <div key={option.value} className={row.className} style={row.style}><Checkbox label={option.label} checked={checked} disabled={disabled || option.disabled} onChange={(event) => setValue(event.currentTarget.checked ? [...current, option.value] : current.filter((item) => item !== option.value))} /></div>;
          })}
          {!shown.length && <p role="status" className={empty.className} style={empty.style}>{emptyLabel}</p>}
        </div>
      </div>
    </details>
    {current.length > 0 && <Button variant="ghost" disabled={disabled || selected.every((option) => option.disabled)} className={clear.className} style={clear.style} onClick={() => setValue(current.filter((item) => options.find((option) => option.value === item)?.disabled))}>{clearLabel}</Button>}
    {name && current.map((item) => <input key={item} type="hidden" name={name} value={item} disabled={disabled} />)}
  </fieldset>;
});
