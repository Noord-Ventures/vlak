"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { useMergedRefs } from "../merge-refs";
import { useInputValue } from "../use-input-value";
import { Button } from "./button";

export interface RatingProps extends Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, "onChange" | "defaultValue"> {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  max?: number;
  label?: React.ReactNode;
  getLabel?: (value: number, max: number) => string;
  clearable?: boolean;
  clearLabel?: string;
  required?: boolean;
}

const styles = stylex.create({
  root: { display: "grid", gap: "0.5rem", minWidth: 0, borderWidth: 0, padding: 0, margin: 0 },
  legend: { padding: 0, marginBottom: "0.5rem", color: vlak.gray, fontSize: vlak.controlLabel },
  choices: { display: "flex", flexWrap: "wrap", gap: "0.5rem" },
  choice: { position: "relative", display: "inline-grid", placeItems: "center", width: vlak.hit, height: vlak.hit, flexShrink: 0, borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.controlBorder, borderRadius: vlak.radiusSm, boxSizing: "border-box", color: vlak.ink, backgroundColor: vlak.paper, fontSize: vlak.controlFs, fontVariantNumeric: "tabular-nums", cursor: "pointer", outlineWidth: { default: null, ":focus-within": 2 }, outlineStyle: { default: null, ":focus-within": "solid" }, outlineColor: vlak.ink, outlineOffset: 2 },
  selected: { backgroundColor: { default: vlak.ink, [mq.forcedColors]: "Highlight" }, color: { default: vlak.paper, [mq.forcedColors]: "HighlightText" } },
  // Include the label's hairline so the actual radio matches its 44px target.
  input: { position: "absolute", inset: "-1px", width: "calc(100% + 2px)", height: "calc(100% + 2px)", opacity: 0, margin: 0, cursor: "inherit" },
  clear: { width: "auto", justifySelf: "start" },
});

/** A discrete score using native radios; zero means no rating. */
export const Rating = React.forwardRef<HTMLFieldSetElement, RatingProps>(function Rating({
  value, defaultValue = 0, onValueChange, max = 5, label = "Rating", getLabel = (score, total) => `${score} of ${total}`, clearable = true, clearLabel = "Clear rating", required, name, disabled, className, style, ...props
}, ref) {
  const [current, setValue, fieldRef] = useInputValue<number, HTMLFieldSetElement>(value, defaultValue, onValueChange);
  const mergedRef = useMergedRefs(ref, fieldRef);
  const autoName = React.useId();
  const count = Math.max(1, Math.min(10, Math.floor(max) || 5));
  const root = rs(["rs-rating", className], styles.root);
  const legend = rs(["rs-rating-legend"], styles.legend);
  const choices = rs(["rs-rating-choices"], styles.choices);
  const input = rs(["rs-rating-input"], styles.input);
  const clear = rs(["rs-rating-clear"], styles.clear);
  return <fieldset {...props} ref={mergedRef} disabled={disabled} className={root.className} style={{ ...root.style, ...style }}>
    <legend className={legend.className} style={legend.style}>{label}</legend>
    <div className={choices.className} style={choices.style}>{Array.from({ length: count }, (_, index) => {
      const score = index + 1;
      const selected = current === score;
      const choice = rs(["rs-rating-choice", selected && "rs-rating-selected"], styles.choice, selected && styles.selected);
      return <label key={score} className={choice.className} style={choice.style}><span aria-hidden="true">{score}</span><input type="radio" name={name ?? autoName} value={score} checked={selected} disabled={disabled} required={required} aria-label={getLabel(score, count)} className={input.className} style={input.style} onChange={() => setValue(score)} /></label>;
    })}</div>
    {clearable && <Button variant="ghost" disabled={disabled || current === 0} className={clear.className} style={clear.style} onClick={() => setValue(0)}>{clearLabel}</Button>}
  </fieldset>;
});
