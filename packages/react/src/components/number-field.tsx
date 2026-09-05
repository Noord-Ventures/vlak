"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../tokens.stylex";
import { rs } from "../rs";
import { useMergedRefs } from "../merge-refs";
import { useInputValue } from "../use-input-value";
import { Button } from "./button";
import { Input } from "./input";

export interface NumberFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "defaultValue" | "onChange" | "size" | "min" | "max" | "step"> {
  value?: number | null;
  defaultValue?: number | null;
  onValueChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: React.ReactNode;
  unit?: string;
  incrementLabel?: string;
  decrementLabel?: string;
  /** Stack the increase button above decrease at the end of the field. */
  controlsPlacement?: "inline" | "stacked";
}

const styles = stylex.create({
  root: { display: "grid", gap: "0.5rem", minWidth: 0 },
  label: { color: vlak.gray, fontSize: vlak.controlLabel },
  row: { display: "flex", alignItems: "center", gap: "0.5rem", minWidth: 0 },
  input: { minWidth: 0, flex: "1 1 5rem", fontVariantNumeric: "tabular-nums" },
  unit: { color: vlak.gray, fontSize: vlak.controlFs },
  controls: { display: "flex", gap: "0.5rem", flexShrink: 0 },
  stacked: { flexDirection: "column" },
  action: { width: vlak.hit, minWidth: vlak.hit, minHeight: vlak.hit, paddingInline: 0, flex: "0 0 auto" },
});

/** Numeric input with native validation and bounded increment/decrement actions. */
export const NumberField = React.forwardRef<HTMLInputElement, NumberFieldProps>(function NumberField({
  value, defaultValue = null, onValueChange, min, max, step = 1, label, unit,
  incrementLabel = "Increase value", decrementLabel = "Decrease value", controlsPlacement = "inline", id,
  disabled, readOnly, className, style, ...props
}, ref) {
  const generated = React.useId();
  const inputId = id ?? generated;
  const [current, setValue, inputRef] = useInputValue<number | null, HTMLInputElement>(value, defaultValue, onValueChange);
  const mergedRef = useMergedRefs(ref, inputRef);
  const move = (direction: -1 | 1) => {
    const native = inputRef.current;
    if (native) {
      const previous = native.value;
      try {
        // Native stepping snaps off-grid values and handles an initially empty field.
        // Restore before emitting so a controlled caller can reject the change.
        native.stepUp(direction);
        const next = native.valueAsNumber;
        native.value = previous;
        if (Number.isFinite(next)) { setValue(next); return; }
      } catch { native.value = previous; }
    }
    const stride = Number.isFinite(step) && step > 0 ? step : 1;
    const next = Number(((current ?? min ?? 0) + direction * stride).toFixed(10));
    setValue(Math.min(max ?? Number.POSITIVE_INFINITY, Math.max(min ?? Number.NEGATIVE_INFINITY, next)));
  };
  const root = rs(["rs-number-field", className], styles.root);
  const lab = rs(["rs-number-field-label"], styles.label);
  const row = rs(["rs-number-field-row"], styles.row);
  const input = rs(["rs-number-field-input"], styles.input);
  const suffix = rs(["rs-number-field-unit"], styles.unit);
  const action = rs(["rs-number-field-action"], styles.action);
  const stacked = controlsPlacement === "stacked";
  const controls = rs(["rs-number-field-controls", stacked && "rs-number-field-controls-stacked"], styles.controls, stacked && styles.stacked);
  const decrement = <Button key="decrease" variant="ghost" className={action.className} style={action.style} disabled={disabled || readOnly || (min != null && current != null && current <= min)} aria-label={decrementLabel} aria-controls={inputId} onClick={() => move(-1)}>−</Button>;
  const increment = <Button key="increase" variant="ghost" className={action.className} style={action.style} disabled={disabled || readOnly || (max != null && current != null && current >= max)} aria-label={incrementLabel} aria-controls={inputId} onClick={() => move(1)}>+</Button>;
  return <div className={root.className} style={{ ...root.style, ...style }}>
    {label != null && <label htmlFor={inputId} className={lab.className} style={lab.style}>{label}</label>}
    <div className={row.className} style={row.style}>
      <Input {...props} ref={mergedRef} id={inputId} plain type="number" inputMode="decimal" value={current ?? ""} min={min} max={max} step={step} disabled={disabled} readOnly={readOnly} className={input.className} style={input.style} aria-describedby={[props["aria-describedby"], unit ? `${inputId}-unit` : null].filter(Boolean).join(" ") || undefined} onChange={(event) => setValue(Number.isFinite(event.currentTarget.valueAsNumber) ? event.currentTarget.valueAsNumber : null)} />
      {unit && <span id={`${inputId}-unit`} className={suffix.className} style={suffix.style}>{unit}</span>}
      <div className={controls.className} style={controls.style}>{stacked ? [increment, decrement] : [decrement, increment]}</div>
    </div>
  </div>;
});
