"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { useMergedRefs } from "../merge-refs";
import { useInputValue } from "../use-input-value";

export interface CheckInOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface CheckInProps extends Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, "onChange" | "defaultValue"> {
  label: React.ReactNode;
  description?: React.ReactNode;
  /** Text answers supplied by the application. Values must be unique. */
  options: CheckInOption[];
  /** null is an unanswered check-in. */
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  required?: boolean;
  readOnly?: boolean;
  clearable?: boolean;
  clearLabel?: string;
}

const styles = stylex.create({
  root: { display: "grid", gap: "0.75rem", minWidth: 0, borderWidth: 0, padding: 0, margin: 0, color: vlak.ink },
  legend: { padding: 0, marginBottom: "0.75rem", fontSize: vlak.controlFs, fontWeight: 600, lineHeight: 1.45 },
  description: { margin: 0, color: vlak.gray, fontSize: vlak.controlFs, lineHeight: 1.45, maxWidth: "66ch" },
  choices: { display: "flex", flexWrap: "wrap", gap: "0.5rem" },
  choice: { position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: vlak.hit, minHeight: vlak.hit, paddingInline: "0.875rem", paddingBlock: "0.5rem", borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.controlBorder, borderRadius: vlak.radiusSm, boxSizing: "border-box", backgroundColor: vlak.paper, color: vlak.ink, fontSize: vlak.controlFs, lineHeight: 1.45, cursor: "pointer", outlineWidth: { default: null, ":focus-within": 2 }, outlineStyle: { default: null, ":focus-within": "solid" }, outlineColor: vlak.ink, outlineOffset: 2 },
  selected: { backgroundColor: { default: vlak.ink, [mq.forcedColors]: "Highlight" }, color: { default: vlak.paper, [mq.forcedColors]: "HighlightText" } },
  unavailable: { cursor: "default", opacity: { default: 0.55, [mq.forcedColors]: 1 } },
  input: { position: "absolute", inset: "-1px", width: "calc(100% + 2px)", height: "calc(100% + 2px)", opacity: 0, margin: 0, cursor: "inherit" },
  clear: { justifySelf: "start", minWidth: vlak.hit, minHeight: vlak.hit, paddingInline: "0.5rem", backgroundColor: vlak.paper, color: vlak.ink, borderWidth: 0, borderRadius: vlak.radiusSm, fontSize: vlak.controlFs, textDecoration: "underline", cursor: "pointer", outlineWidth: { default: null, ":focus-visible": 2 }, outlineStyle: { default: null, ":focus-visible": "solid" }, outlineColor: vlak.ink, outlineOffset: 2, opacity: { default: 1, ":disabled": 0.55 } },
});

/** A named text choice without an inferred clinical score. */
export const CheckIn = React.forwardRef<HTMLFieldSetElement, CheckInProps>(function CheckIn({
  label, description, options, value, defaultValue = null, onValueChange, required, readOnly = false, clearable = true, clearLabel = "Clear answer", name, form, disabled, className, style, "aria-describedby": ariaDescribedBy, ...props
}, ref) {
  const [, refreshAfterReset] = React.useReducer((revision: number) => revision + 1, 0);
  const [current, setValue, fieldRef] = useInputValue<string | null, HTMLFieldSetElement>(value, defaultValue, onValueChange, refreshAfterReset);
  const mergedRef = useMergedRefs(ref, fieldRef);
  const id = React.useId();
  const descriptionId = `${id}-description`;
  const readonlyId = `${id}-readonly`;
  const describedBy = [ariaDescribedBy, description != null && descriptionId, readOnly && readonlyId].filter(Boolean).join(" ") || undefined;
  const root = rs(["rs-check-in", className], styles.root);
  const legend = rs(["rs-check-in-legend"], styles.legend);
  const copy = rs(["rs-check-in-description"], styles.description);
  const choices = rs(["rs-check-in-choices"], styles.choices);
  const input = rs(["rs-check-in-input"], styles.input);
  const clear = rs(["rs-check-in-clear"], styles.clear);
  return <fieldset {...props} ref={mergedRef} name={name} form={form} disabled={disabled} aria-describedby={describedBy} className={root.className} style={{ ...root.style, ...style }}>
    <legend className={legend.className} style={legend.style}>{label}</legend>
    {description != null && <p id={descriptionId} className={copy.className} style={copy.style}>{description}</p>}
    {readOnly && <p id={readonlyId} className={copy.className} style={copy.style}>Read only</p>}
    {options.length === 0 && <p className={copy.className} style={copy.style}>No answers available</p>}
    <div className={choices.className} style={choices.style}>{options.map((option) => {
      const selected = current === option.value;
      const unavailable = disabled || option.disabled || readOnly;
      const choice = rs(["rs-check-in-choice", selected && "rs-check-in-selected", unavailable && "rs-check-in-unavailable"], styles.choice, selected && styles.selected, unavailable && styles.unavailable);
      return <label key={option.value} className={choice.className} style={choice.style}>
        <span>{option.label}</span>
        <input type="radio" name={name ?? id} form={form} value={option.value} checked={selected} required={required} disabled={disabled || option.disabled} readOnly={readOnly} aria-disabled={readOnly || undefined} aria-describedby={describedBy} className={input.className} style={input.style}
          onClick={(event) => { if (readOnly) event.preventDefault(); }}
          onKeyDown={(event) => { if (readOnly && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(event.key)) event.preventDefault(); }}
          onChange={() => { if (!readOnly) setValue(option.value); }} />
      </label>;
    })}</div>
    {clearable && <button type="button" disabled={disabled || readOnly || current == null} className={clear.className} style={clear.style} onClick={() => setValue(null)}>{clearLabel}</button>}
  </fieldset>;
});
