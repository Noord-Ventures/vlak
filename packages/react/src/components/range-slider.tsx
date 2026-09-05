"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../tokens.stylex";
import { rs } from "../rs";
import { useMergedRefs } from "../merge-refs";
import { useInputValue } from "../use-input-value";
import { useFieldControl } from "./field";

export interface RangeSliderProps extends Omit<React.HTMLAttributes<HTMLFieldSetElement>, "onChange" | "defaultValue"> {
  value?: [number, number];
  defaultValue?: [number, number];
  onValueChange?: (value: [number, number]) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: React.ReactNode;
  lowerLabel?: string;
  upperLabel?: string;
  name?: string;
  disabled?: boolean;
  formatValue?: (value: number) => string;
}

const styles = stylex.create({
  root: { display: "grid", gap: "0.5rem", minWidth: 0, borderWidth: 0, margin: 0, padding: 0, color: vlak.ink },
  legend: { fontSize: vlak.controlLabel, color: vlak.gray, marginBottom: "0.5rem", padding: 0 },
  row: { display: "grid", gridTemplateColumns: "minmax(3rem, auto) minmax(0, 1fr) minmax(3rem, auto)", gap: "0.75rem", alignItems: "center" },
  label: { fontSize: vlak.controlFs },
  input: { width: "100%", minWidth: vlak.hit, height: vlak.hit, margin: 0, accentColor: vlak.ink, cursor: "pointer", outlineColor: vlak.ink, outlineOffset: 2 },
  output: { fontSize: vlak.controlFs, fontVariantNumeric: "tabular-nums", textAlign: "end" },
});

export const RangeSlider = React.forwardRef<HTMLFieldSetElement, RangeSliderProps>(function RangeSlider({
  value, defaultValue, onValueChange, min = 0, max = 100, step = 1, label = "Range", lowerLabel = "From", upperLabel = "To", name, disabled, formatValue = String, className, style, ...props
}, ref) {
  const [current, setValue, fieldRef] = useInputValue<[number, number], HTMLFieldSetElement>(value, defaultValue ?? [min, max], onValueChange);
  const mergedRef = useMergedRefs(ref, fieldRef);
  const id = React.useId();
  const field = useFieldControl(props);
  const high = Math.max(min, max);
  const lower = Math.min(high, Math.max(min, current[0]));
  const upper = Math.min(high, Math.max(lower, current[1]));
  const root = rs(["rs-range-slider", className], styles.root);
  const legend = rs(["rs-range-slider-legend"], styles.legend);
  const row = rs(["rs-range-slider-row"], styles.row);
  const lab = rs(["rs-range-slider-label"], styles.label);
  const input = rs(["rs-range-slider-input"], styles.input);
  const output = rs(["rs-range-slider-output"], styles.output);
  return <fieldset {...props} ref={mergedRef} disabled={disabled} className={root.className} style={{ ...root.style, ...style }} aria-describedby={field["aria-describedby"]} aria-invalid={field["aria-invalid"]}>
    <legend className={legend.className} style={legend.style}>{label}</legend>
    <div className={row.className} style={row.style}>
      <label htmlFor={`${id}-lower`} className={lab.className} style={lab.style}>{lowerLabel}</label>
      <input id={`${id}-lower`} type="range" name={name ? `${name}[0]` : undefined} min={min} max={upper} step={step} value={lower} aria-valuetext={formatValue(lower)} className={input.className} style={input.style} onChange={(event) => setValue([Math.min(upper, event.currentTarget.valueAsNumber), upper])} />
      <output htmlFor={`${id}-lower`} className={output.className} style={output.style}>{formatValue(lower)}</output>
    </div>
    <div className={row.className} style={row.style}>
      <label htmlFor={`${id}-upper`} className={lab.className} style={lab.style}>{upperLabel}</label>
      <input id={`${id}-upper`} type="range" name={name ? `${name}[1]` : undefined} min={lower} max={high} step={step} value={upper} aria-valuetext={formatValue(upper)} className={input.className} style={input.style} onChange={(event) => setValue([lower, Math.max(lower, event.currentTarget.valueAsNumber)])} />
      <output htmlFor={`${id}-upper`} className={output.className} style={output.style}>{formatValue(upper)}</output>
    </div>
  </fieldset>;
});
