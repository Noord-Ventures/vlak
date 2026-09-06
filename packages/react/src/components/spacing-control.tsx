"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { useInputValue } from "../use-input-value";
import { useMergedRefs } from "../merge-refs";

export interface SpacingValue { top: number | null; right: number | null; bottom: number | null; left: number | null }
export interface SpacingControlProps extends Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, "defaultValue" | "onChange"> {
  label: React.ReactNode;
  value?: SpacingValue;
  defaultValue?: SpacingValue;
  onValueChange?: (value: SpacingValue) => void;
  linked?: boolean;
  defaultLinked?: boolean;
  onLinkedChange?: (linked: boolean) => void;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  readOnly?: boolean;
}

const initial: SpacingValue = { top: 0, right: 0, bottom: 0, left: 0 };
const sides = ["top", "right", "bottom", "left"] as const;
const styles = stylex.create({
  root: { display: "grid", gap: "0.75rem", minWidth: 0, margin: 0, padding: 0, borderWidth: 0, color: vlak.ink },
  label: { marginBottom: "0.75rem", padding: 0, fontSize: vlak.controlFs, fontWeight: 600, lineHeight: 1.45 },
  fields: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(5rem, 1fr))", gap: "0.5rem" },
  field: { display: "grid", gap: "0.375rem", fontSize: vlak.controlLabel, lineHeight: 1.45 },
  input: { minWidth: vlak.hit, minHeight: vlak.hit, width: "100%", boxSizing: "border-box", paddingInline: "0.5rem", borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.controlBorder, borderRadius: vlak.radiusSm, backgroundColor: vlak.paper, color: vlak.ink, fontSize: vlak.controlFs, fontFamily: "inherit", fontVariantNumeric: "tabular-nums", outlineWidth: { default: null, ":focus-visible": 2 }, outlineStyle: { default: null, ":focus-visible": "solid" }, outlineColor: vlak.ink, outlineOffset: 2 },
  link: { minWidth: vlak.hit, minHeight: vlak.hit, justifySelf: "start", paddingInline: "0.75rem", borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.controlBorder, borderRadius: vlak.radiusSm, backgroundColor: vlak.paper, color: vlak.ink, fontFamily: "inherit", fontSize: vlak.controlFs, cursor: "pointer", outlineWidth: { default: null, ":focus-visible": 2 }, outlineStyle: { default: null, ":focus-visible": "solid" }, outlineColor: vlak.ink, outlineOffset: 2 },
  linked: { backgroundColor: { default: vlak.ink, [mq.forcedColors]: "Highlight" }, color: { default: vlak.paper, [mq.forcedColors]: "HighlightText" } },
  note: { margin: 0, color: vlak.gray, fontSize: vlak.controlLabel, lineHeight: 1.45 },
});

/** Four native numeric fields; linking applies the next edit to every side. */
export const SpacingControl = React.forwardRef<HTMLFieldSetElement, SpacingControlProps>(function SpacingControl({ label, value, defaultValue = initial, onValueChange, linked, defaultLinked = false, onLinkedChange, unit = "px", min, max, step = 1, readOnly, name, form, disabled, className, style, ...props }, ref) {
  const id = React.useId();
  const [, refresh] = React.useReducer((n: number) => n + 1, 0);
  const [current, setValue, fieldRef] = useInputValue<SpacingValue, HTMLFieldSetElement>(value, defaultValue, onValueChange, refresh);
  const [isLinked, setLinked, linkRef] = useInputValue<boolean, HTMLButtonElement>(linked, defaultLinked, onLinkedChange, refresh);
  const mergedRef = useMergedRefs(ref, fieldRef);
  const validBounds = (min == null || Number.isFinite(min)) && (max == null || Number.isFinite(max)) && (min == null || max == null || min <= max) && Number.isFinite(step) && step > 0;
  const root = rs(["rs-spacing-control", className], styles.root);
  const heading = rs(["rs-spacing-control-label"], styles.label);
  const fields = rs(["rs-spacing-control-fields"], styles.fields);
  const field = rs(["rs-spacing-control-field"], styles.field);
  const input = rs(["rs-spacing-control-input"], styles.input);
  const link = rs(["rs-spacing-control-link", isLinked && "rs-spacing-control-linked"], styles.link, isLinked && styles.linked);
  const note = rs(["rs-spacing-control-note"], styles.note);
  return <fieldset {...props} ref={mergedRef} name={name} form={form} disabled={disabled} className={root.className} style={{ ...root.style, ...style }}>
    <legend className={heading.className} style={heading.style}>{label}</legend>
    <div className={fields.className} style={fields.style}>{sides.map((side) => <label key={side} className={field.className} style={field.style}>{side.charAt(0).toUpperCase() + side.slice(1)} ({unit})<input type="number" form={form} name={name ? `${name}.${side}` : undefined} min={validBounds ? min : undefined} max={validBounds ? max : undefined} step={validBounds ? step : undefined} disabled={disabled || !validBounds} readOnly={readOnly} value={current[side] != null && Number.isFinite(current[side]) ? current[side] : ""} aria-describedby={`${id}-hint`} className={input.className} style={input.style} onChange={(event) => {
      const next = event.currentTarget.value === "" ? null : Number(event.currentTarget.value);
      setValue(isLinked ? { top: next, right: next, bottom: next, left: next } : { ...current, [side]: next });
    }} /></label>)}</div>
    <button type="button" ref={linkRef} form={form} disabled={disabled || readOnly || !validBounds} aria-pressed={isLinked} aria-describedby={`${id}-hint`} className={link.className} style={link.style} onClick={() => setLinked(!isLinked)}>Link sides</button>
    <p id={`${id}-hint`} className={note.className} style={note.style}>{!validBounds ? "Spacing bounds unavailable" : isLinked ? "The next edit applies to all four sides." : "Each side is edited separately."}</p>
  </fieldset>;
});
