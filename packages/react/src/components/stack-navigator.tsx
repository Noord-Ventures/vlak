"use client";
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../tokens.stylex";
import { rs } from "../rs";
import { useInputValue } from "../use-input-value";
import { useMergedRefs } from "../merge-refs";
import { Button } from "./button";
import { Select } from "./select";

export interface StackPosition { value?: number | string | null; label?: string; disabled?: boolean }
export interface StackAxis { id: string; label: string; unit?: string; positions: readonly StackPosition[] }
/** Zero-based supplied position indexes. null means no selected position. */
export type StackSelection = Readonly<Record<string, number | null>>;
export interface StackNavigatorProps extends Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, "defaultValue"> {
  label: React.ReactNode;
  axes: readonly StackAxis[];
  value?: StackSelection;
  defaultValue?: StackSelection;
  onValueChange?: (value: StackSelection) => void;
  description?: React.ReactNode;
  readOnly?: boolean;
}
const styles = stylex.create({
  root: { display: "grid", gap: "1rem", minWidth: 0, padding: 0, margin: 0, borderWidth: 0, color: vlak.ink, lineHeight: 1.45 },
  legend: { padding: 0, marginBottom: "0.75rem", fontSize: "0.875rem", fontWeight: 600 },
  axis: { display: "grid", gap: "0.5rem", minWidth: 0 },
  label: { fontSize: "0.75rem", fontWeight: 500 },
  row: { display: "grid", gridTemplateColumns: "auto minmax(0, 1fr) auto", gap: "0.5rem", minWidth: 0 },
  step: { minWidth: vlak.hit, minHeight: vlak.hit, width: vlak.hit, paddingInline: 0 },
  copy: { margin: 0, fontSize: "0.75rem", color: vlak.gray, overflowWrap: "anywhere", maxWidth: "66ch" },
});
const physicalValue = (position: StackPosition, unit?: string) => {
  const valid = typeof position.value === "number" ? Number.isFinite(position.value) : typeof position.value === "string" && position.value.trim().length > 0;
  return valid ? `${position.value}${unit ? ` ${unit}` : ""}` : "Physical value unavailable";
};
/** Navigates supplied stack coordinates without calculating stage positions or calling an instrument. */
export const StackNavigator = React.forwardRef<HTMLFieldSetElement, StackNavigatorProps>(function StackNavigator({ label, axes, value, defaultValue = {}, onValueChange, description, readOnly = false, name, form, disabled, className, style, children, ...props }, ref) {
  const [, refresh] = React.useReducer((n: number) => n + 1, 0);
  const [current, setValue, fieldRef] = useInputValue<StackSelection, HTMLFieldSetElement>(value, defaultValue, onValueChange, refresh);
  const merged = useMergedRefs(ref, fieldRef);
  const id = React.useId();
  const valid = axes.length <= 8 && axes.reduce((total, axis) => total + axis.positions.length, 0) <= 8192 && axes.every(axis => axis.id.trim()) && new Set(axes.map(axis => axis.id)).size === axes.length;
  const root = rs(["rs-stack-navigator", className], styles.root);
  const legend = rs(["rs-stack-navigator-legend"], styles.legend);
  const axisStyle = rs(["rs-stack-navigator-axis"], styles.axis);
  const labelStyle = rs(["rs-stack-navigator-label"], styles.label);
  const row = rs(["rs-stack-navigator-row"], styles.row);
  const step = rs(["rs-stack-navigator-step"], styles.step);
  const copy = rs(["rs-stack-navigator-copy"], styles.copy);
  return <fieldset {...props} ref={merged} name={name} form={form} disabled={disabled} className={root.className} style={{ ...root.style, ...style }}>
    <legend {...legend}>{label}</legend>{description != null && <div {...copy}>{description}</div>}
    {!valid ? <p {...copy}>Stack unavailable: supply unique axes, at most 8 axes and 8192 positions</p> : axes.length === 0 ? <p {...copy}>No stack axes supplied</p> : axes.map((axis, axisIndex) => {
      const index = current[axis.id];
      const selected = index != null && Number.isSafeInteger(index) && index >= 0 && index < axis.positions.length;
      let previous = -1;
      if (selected) for (let candidate = 0; candidate < index; candidate++) if (!axis.positions[candidate]?.disabled) previous = candidate;
      const next = axis.positions.findIndex((position, candidate) => (!selected || candidate > index) && !position.disabled);
      const inputName = name ? `${name}.${axis.id}` : undefined;
      return <div key={axis.id} {...axisStyle}>
        <span {...labelStyle} id={`${id}-${axisIndex}-label`}>{axis.label}</span>
        <div {...row}><Button {...step} variant="ghost" disabled={disabled || readOnly || previous < 0} aria-label={`Previous ${axis.label} position`} onClick={() => setValue({ ...current, [axis.id]: previous })}>−</Button>
          <Select fullWidth name={inputName} form={form} disabled={disabled || !axis.positions.length} readOnly={readOnly} value={selected ? String(index) : ""} aria-labelledby={`${id}-${axisIndex}-label`} aria-describedby={`${id}-${axisIndex}-value`} options={[{ value: "", label: "Choose position" }, ...axis.positions.map((position, candidate) => ({ value: String(candidate), label: `${candidate + 1} / ${axis.positions.length} · ${physicalValue(position, axis.unit)}${position.label ? ` · ${position.label}` : ""}`, disabled: position.disabled }))]} onValueChange={nextValue => setValue({ ...current, [axis.id]: nextValue === "" ? null : Number(nextValue) })} />
          <Button {...step} variant="ghost" disabled={disabled || readOnly || next < 0} aria-label={`Next ${axis.label} position`} onClick={() => setValue({ ...current, [axis.id]: next })}>+</Button></div>
        <p {...copy} id={`${id}-${axisIndex}-value`}>{selected ? `Position ${index + 1} of ${axis.positions.length}; ${physicalValue(axis.positions[index]!, axis.unit)}` : !axis.positions.length ? "No positions supplied" : index == null ? "No position selected" : "Selected position unavailable"}</p>
      </div>;
    })}{children}
  </fieldset>;
});
