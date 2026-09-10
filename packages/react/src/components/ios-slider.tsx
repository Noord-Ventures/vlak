"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { useMergedRefs } from "../merge-refs";

export interface IOSSliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "defaultValue" | "min" | "max" | "step" | "children"> {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number | "any";
  onValueChange?: (value: number) => void;
}
const styles = stylex.create({
  root: { position: "relative", display: "block", minWidth: 44, width: "100%", height: 44, borderRadius: 22, outlineWidth: { default: 0, ":focus-within": 2 }, outlineStyle: "solid", outlineColor: vlak.ink, outlineOffset: 2 },
  disabled: { opacity: 0.45 },
  track: { position: "absolute", top: 19, insetInline: 14, height: 6, borderRadius: 3, backgroundColor: { default: vlak.controlFill, [mq.forcedColors]: "Canvas" }, boxShadow: `inset 0 0 0 1px ${vlak.controlBorder}`, pointerEvents: "none" },
  fill: { position: "absolute", insetInlineStart: 0, top: 0, height: "100%", borderRadius: 3, backgroundColor: { default: vlak.ink, [mq.forcedColors]: "Highlight" }, forcedColorAdjust: "none" },
  thumb: { position: "absolute", top: -9, marginInlineStart: -14, width: 28, height: 24, borderRadius: 12, boxSizing: "border-box", borderWidth: 1, borderStyle: "solid", borderColor: { default: vlak.controlBorder, [mq.forcedColors]: "ButtonText" }, backgroundColor: { default: vlak.paper, [mq.forcedColors]: "Canvas" } },
  input: { position: "absolute", inset: 0, width: "100%", height: "100%", margin: 0, opacity: 0, cursor: { default: "pointer", ":disabled": "not-allowed" } },
});

function normalize(value: number, min: number, max: number, step: number | "any") {
  const upper = Math.max(min, max);
  const bounded = Math.max(min, Math.min(upper, Number.isFinite(value) ? value : min));
  if (step === "any") return bounded;
  const interval = Number.isFinite(step) && step > 0 ? step : 1;
  const steps = Math.min(Math.floor((upper - min) / interval + 1e-10), Math.round((bounded - min) / interval));
  return Number((min + Math.max(0, steps) * interval).toPrecision(12));
}

/** Native range keyboard and form behavior beneath the iOS pill thumb. */
export const IOSSlider = React.forwardRef<HTMLInputElement, IOSSliderProps>(function IOSSlider({ value, defaultValue = 50, min = 0, max = 100, step = 1, onValueChange, onChange, disabled, className, style, ...props }, forwardedRef) {
  const [inner, setInner] = React.useState(defaultValue);
  const input = React.useRef<HTMLInputElement>(null);
  const ref = useMergedRefs(input, forwardedRef);
  const controlled = value !== undefined;
  const raw = controlled ? value : inner;
  const current = normalize(raw, min, max, step);
  const progress = max > min ? (current - min) / (max - min) * 100 : 0;
  React.useEffect(() => {
    const form = props.form ? document.getElementById(props.form) : input.current?.form;
    let mounted = true;
    const reset = (event: Event) => queueMicrotask(() => { if (mounted && !controlled && !event.defaultPrevented) { if (input.current) input.current.value = String(normalize(defaultValue, min, max, step)); setInner(defaultValue); } });
    form?.addEventListener("reset", reset);
    return () => { mounted = false; form?.removeEventListener("reset", reset); };
  }, [controlled, defaultValue, props.form, min, max, step]);
  const root = rs(["rs-ios-slider", disabled && "rs-ios-slider-disabled", className], styles.root, disabled && styles.disabled);
  const track = rs(["rs-ios-slider-track"], styles.track);
  const fill = rs(["rs-ios-slider-fill"], styles.fill);
  const thumb = rs(["rs-ios-slider-thumb"], styles.thumb);
  const field = rs(["rs-ios-slider-input"], styles.input);
  return <div className={root.className} style={{ ...root.style, ...style }}><span {...track} aria-hidden="true"><span className={fill.className} style={{ ...fill.style, width: `${progress}%` }} /><span className={thumb.className} style={{ ...thumb.style, insetInlineStart: `${progress}%` }} /></span><input {...props} {...field} ref={ref} type="range" min={min} max={max} step={step} value={current} disabled={disabled} onChange={(event) => { onChange?.(event); if (event.defaultPrevented) return; const next = event.currentTarget.valueAsNumber; if (!controlled) setInner(next); onValueChange?.(next); }} /></div>;
});
