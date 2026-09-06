"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../tokens.stylex";
import { rs } from "../rs";
import { useInputValue } from "../use-input-value";
import { useMergedRefs } from "../merge-refs";

export interface InspectorColor { hex: string; alpha: number | null }
export interface ColorInspectorProps extends Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, "defaultValue" | "onChange"> {
  label: React.ReactNode;
  value?: InspectorColor;
  defaultValue?: InspectorColor;
  /** Receives editable hex text and alpha, including incomplete values. */
  onValueChange?: (value: InspectorColor) => void;
  readOnly?: boolean;
}

const initial: InspectorColor = { hex: "#808080", alpha: 1 };
const styles = stylex.create({
  root: { display: "grid", gap: "0.75rem", minWidth: 0, borderWidth: 0, margin: 0, padding: 0, color: vlak.ink },
  label: { marginBottom: "0.75rem", padding: 0, fontSize: vlak.controlFs, lineHeight: 1.45, fontWeight: 600 },
  preview: { position: "relative", minHeight: "4rem", borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.controlBorder, backgroundColor: vlak.paper, backgroundImage: `repeating-conic-gradient(${vlak.divider} 0% 25%, transparent 0% 50%)`, backgroundSize: "1rem 1rem" },
  swatch: { position: "absolute", inset: 0, forcedColorAdjust: "none" },
  fields: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(8rem, 1fr))", gap: "0.75rem" },
  field: { display: "grid", gap: "0.375rem", fontSize: vlak.controlLabel, lineHeight: 1.45 },
  input: { minWidth: vlak.hit, minHeight: vlak.hit, width: "100%", boxSizing: "border-box", paddingInline: "0.625rem", borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.controlBorder, borderRadius: vlak.radiusSm, backgroundColor: vlak.paper, color: vlak.ink, fontSize: vlak.controlFs, fontFamily: "ui-monospace, monospace", outlineWidth: { default: null, ":focus-visible": 2 }, outlineStyle: { default: null, ":focus-visible": "solid" }, outlineColor: vlak.ink, outlineOffset: 2 },
  note: { margin: 0, fontSize: vlak.controlLabel, color: vlak.gray, lineHeight: 1.45 },
});

/** A data swatch and editable six-digit hex and alpha, on a monochrome shell. */
export const ColorInspector = React.forwardRef<HTMLFieldSetElement, ColorInspectorProps>(function ColorInspector({ label, value, defaultValue = initial, onValueChange, readOnly, name, form, disabled, className, style, ...props }, ref) {
  const id = React.useId();
  const [, refresh] = React.useReducer((n: number) => n + 1, 0);
  const [current, setValue, fieldRef] = useInputValue<InspectorColor, HTMLFieldSetElement>(value, defaultValue, onValueChange, refresh);
  const mergedRef = useMergedRefs(ref, fieldRef);
  const validHex = /^#[\da-f]{6}$/i.test(current.hex);
  const validAlpha = current.alpha != null && Number.isFinite(current.alpha) && current.alpha >= 0 && current.alpha <= 1;
  const root = rs(["rs-color-inspector", className], styles.root);
  const heading = rs(["rs-color-inspector-label"], styles.label);
  const preview = rs(["rs-color-inspector-preview"], styles.preview);
  const swatch = rs(["rs-color-inspector-swatch"], styles.swatch);
  const fields = rs(["rs-color-inspector-fields"], styles.fields);
  const field = rs(["rs-color-inspector-field"], styles.field);
  const input = rs(["rs-color-inspector-input"], styles.input);
  const note = rs(["rs-color-inspector-note"], styles.note);
  return <fieldset {...props} ref={mergedRef} name={name} form={form} disabled={disabled} className={root.className} style={{ ...root.style, ...style }}>
    <legend className={heading.className} style={heading.style}>{label}</legend>
    <div aria-hidden="true" className={preview.className} style={preview.style}>{validHex && validAlpha && <span className={swatch.className} style={{ ...swatch.style, backgroundColor: current.hex, opacity: current.alpha! }} />}</div>
    <div className={fields.className} style={fields.style}>
      <label className={field.className} style={field.style}>Hex<input type="text" name={name ? `${name}.hex` : undefined} form={form} value={current.hex} pattern="#[0-9a-fA-F]{6}" required readOnly={readOnly} spellCheck={false} aria-invalid={!validHex || undefined} aria-describedby={`${id}-hint`} className={input.className} style={input.style} onChange={(event) => setValue({ ...current, hex: event.currentTarget.value })} /></label>
      <label className={field.className} style={field.style}>Alpha<input type="number" name={name ? `${name}.alpha` : undefined} form={form} min={0} max={1} step="any" required readOnly={readOnly} value={current.alpha != null && Number.isFinite(current.alpha) ? current.alpha : ""} aria-invalid={!validAlpha || undefined} aria-describedby={`${id}-hint`} className={input.className} style={input.style} onChange={(event) => setValue({ ...current, alpha: event.currentTarget.value === "" ? null : Number(event.currentTarget.value) })} /></label>
    </div>
    <p id={`${id}-hint`} className={note.className} style={note.style}>{!validHex ? "Enter a six-digit hex color beginning with #." : !validAlpha ? "Enter alpha from 0 to 1." : `${current.hex}, alpha ${current.alpha}`}</p>
  </fieldset>;
});
