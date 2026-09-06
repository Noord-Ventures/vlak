"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { useInputValue } from "../use-input-value";
import { useMergedRefs } from "../merge-refs";

export interface ParameterKnobProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "defaultValue" | "onChange" | "min" | "max" | "step"> {
  label: React.ReactNode;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

const styles = stylex.create({
  root: { display: "inline-grid", justifyItems: "center", gap: "0.5rem", minWidth: "5rem", color: vlak.ink },
  label: { fontSize: vlak.controlFs, lineHeight: 1.45, fontWeight: 500 },
  control: { position: "relative", width: "4rem", height: "4rem", borderRadius: "50%", borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.controlBorder, boxSizing: "border-box", backgroundColor: vlak.paper, outlineWidth: { default: null, ":focus-within": 2 }, outlineStyle: { default: null, ":focus-within": "solid" }, outlineColor: vlak.ink, outlineOffset: 3 },
  pointer: { position: "absolute", inset: "0.5rem", pointerEvents: "none", "::after": { content: '""', position: "absolute", width: 2, height: "0.875rem", insetInlineStart: "calc(50% - 1px)", top: 0, backgroundColor: { default: vlak.ink, [mq.forcedColors]: "CanvasText" } } },
  input: { position: "absolute", inset: "-1px", width: "calc(100% + 2px)", height: "calc(100% + 2px)", margin: 0, opacity: 0, cursor: "ew-resize" },
  value: { fontSize: vlak.controlLabel, color: vlak.gray, lineHeight: 1.45, fontVariantNumeric: "tabular-nums" },
});

/** A rotary display driven by a native horizontal range input. */
export const ParameterKnob = React.forwardRef<HTMLInputElement, ParameterKnobProps>(function ParameterKnob({
  label, value, defaultValue, onValueChange, min = 0, max = 100, step = 1, unit, id, disabled, readOnly, className, style, onKeyDown, onClick, ...props
}, ref) {
  const autoId = React.useId();
  const inputId = id ?? autoId;
  const [, refresh] = React.useReducer((n: number) => n + 1, 0);
  const [current, setValue, inputRef] = useInputValue<number, HTMLInputElement>(value, defaultValue ?? min, onValueChange, refresh);
  const mergedRef = useMergedRefs(ref, inputRef);
  const stepCount = (max - min) / step;
  const validRange = Number.isFinite(min) && Number.isFinite(max) && Number.isFinite(max - min) && max > min && Number.isFinite(step) && step > 0 && Number.isFinite(stepCount) && stepCount <= Number.MAX_SAFE_INTEGER;
  const validValue = Number.isFinite(current);
  const usable = validRange && validValue;
  const lastStep = validRange ? Math.floor(stepCount + Number.EPSILON * Math.max(1, stepCount) * 4) : 0;
  const snap = (next: number) => {
    const bounded = Math.max(min, Math.min(max, next));
    const index = Math.max(0, Math.min(lastStep, Math.round((bounded - min) / step)));
    return Number((min + index * step).toPrecision(12));
  };
  const snapped = usable ? snap(current) : 0;
  const root = rs(["rs-parameter-knob"], styles.root);
  const caption = rs(["rs-parameter-knob-label"], styles.label);
  const control = rs(["rs-parameter-knob-control"], styles.control);
  const pointer = rs(["rs-parameter-knob-pointer"], styles.pointer);
  const input = rs(["rs-parameter-knob-input", className], styles.input);
  const output = rs(["rs-parameter-knob-value"], styles.value);
  return <div className={root.className} style={root.style}>
    <label htmlFor={inputId} className={caption.className} style={caption.style}>{label}</label>
    <div className={control.className} style={control.style}>
      {usable && <span aria-hidden="true" className={pointer.className} style={{ ...pointer.style, transform: `rotate(${-135 + ((snapped - min) / (max - min)) * 270}deg)` }} />}
      <input {...props} ref={mergedRef} id={inputId} type="range" min={usable ? min : 0} max={usable ? max : 1} step={usable ? step : 1} value={snapped} disabled={disabled || !usable} readOnly={readOnly} aria-disabled={readOnly || undefined} aria-valuetext={usable ? `${snapped}${unit ? ` ${unit}` : ""}` : "Unavailable"} className={input.className} style={{ ...input.style, ...style }}
        onClick={(event) => { onClick?.(event); if (readOnly) event.preventDefault(); }}
        onKeyDown={(event) => { onKeyDown?.(event); if (readOnly && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End", "PageUp", "PageDown"].includes(event.key)) event.preventDefault(); }}
        onChange={(event) => { if (!readOnly && usable) setValue(snap(Number(event.currentTarget.value))); }} />
    </div>
    <span className={output.className} style={output.style}>{!validRange ? "Invalid range" : !validValue ? "Unavailable" : `${snapped}${unit ? ` ${unit}` : ""}`}</span>
  </div>;
});
