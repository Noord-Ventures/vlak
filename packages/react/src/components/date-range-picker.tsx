"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { useMergedRefs } from "../merge-refs";
import { useInputValue } from "../use-input-value";
import { useFieldControl } from "./field";
import { Input } from "./input";

export interface DateRangeValue { start: string; end: string }
export interface DateRangePickerProps extends Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, "onChange" | "defaultValue"> {
  /** ISO calendar dates, YYYY-MM-DD; no time zone conversion. */
  value?: DateRangeValue;
  defaultValue?: DateRangeValue;
  onValueChange?: (value: DateRangeValue) => void;
  label?: React.ReactNode;
  startLabel?: string;
  endLabel?: string;
  min?: string;
  max?: string;
  required?: boolean;
}

const styles = stylex.create({
  root: { minWidth: 0, borderWidth: 0, margin: 0, padding: 0 },
  legend: { fontSize: vlak.controlLabel, color: vlak.gray, marginBottom: "0.75rem", padding: 0 },
  fields: { display: "grid", gridTemplateColumns: { default: "minmax(0, 1fr) minmax(0, 1fr)", [mq.mobileGrid]: "minmax(0, 1fr)" }, gap: "0.75rem", minWidth: 0 },
  input: { minWidth: 0, maxWidth: "100%", boxSizing: "border-box", colorScheme: "inherit" },
});

/** Two native date editors share bounds; changing the start beyond the end clears the end. */
export const DateRangePicker = React.forwardRef<HTMLFieldSetElement, DateRangePickerProps>(function DateRangePicker({
  value, defaultValue = { start: "", end: "" }, onValueChange, label = "Date range", startLabel = "Start date", endLabel = "End date", min, max, required, name, disabled, className, style, ...props
}, ref) {
  const [current, setValue, fieldRef] = useInputValue<DateRangeValue, HTMLFieldSetElement>(value, defaultValue, onValueChange);
  const mergedRef = useMergedRefs(ref, fieldRef);
  const field = useFieldControl(props);
  const lower = current.start && (!min || current.start > min) ? current.start : min;
  const invalid = Boolean(current.start && current.end && current.end < current.start);
  const root = rs(["rs-date-range-picker", className], styles.root);
  const legend = rs(["rs-date-range-picker-legend"], styles.legend);
  const fields = rs(["rs-date-range-picker-fields"], styles.fields);
  const input = rs(["rs-date-range-picker-input"], styles.input);
  return <fieldset {...props} ref={mergedRef} disabled={disabled} className={root.className} style={{ ...root.style, ...style }} aria-describedby={field["aria-describedby"]} aria-invalid={invalid || field["aria-invalid"] || undefined}>
    <legend className={legend.className} style={legend.style}>{label}</legend>
    <div className={fields.className} style={fields.style}>
      <Input label={startLabel} type="date" name={name ? `${name}[start]` : undefined} value={current.start} min={min} max={max} required={required} disabled={disabled} className={input.className} style={input.style} onChange={(event) => { const start = event.currentTarget.value; setValue({ start, end: start && current.end && current.end < start ? "" : current.end }); }} />
      <Input label={endLabel} type="date" name={name ? `${name}[end]` : undefined} value={current.end} min={lower} max={max} required={required} disabled={disabled} className={input.className} style={input.style} aria-invalid={invalid || undefined} onChange={(event) => setValue({ ...current, end: event.currentTarget.value })} />
    </div>
  </fieldset>;
});
