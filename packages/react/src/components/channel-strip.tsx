"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { useInputValue } from "../use-input-value";
import { useMergedRefs } from "../merge-refs";

export interface ChannelStripValue { gain: number; pan: number; muted: boolean; solo: boolean }
export interface ChannelStripProps extends Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, "onChange" | "defaultValue"> {
  label: React.ReactNode;
  value?: ChannelStripValue;
  defaultValue?: ChannelStripValue;
  onValueChange?: (value: ChannelStripValue) => void;
  gainMin?: number;
  gainMax?: number;
  readOnly?: boolean;
}

const initial: ChannelStripValue = { gain: 0, pan: 0, muted: false, solo: false };
const styles = stylex.create({
  root: { display: "grid", gap: "0.75rem", minWidth: 0, borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.divider, padding: "1rem", margin: 0, color: vlak.ink },
  label: { paddingInline: "0.25rem", fontSize: vlak.controlFs, lineHeight: 1.45, fontWeight: 600 },
  field: { display: "grid", gap: "0.25rem", fontSize: vlak.controlLabel, lineHeight: 1.45 },
  text: { display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "0.5rem", fontVariantNumeric: "tabular-nums" },
  range: { display: "block", margin: 0, width: "100%", minWidth: vlak.hit, minHeight: vlak.hit, accentColor: vlak.ink, outlineWidth: { default: null, ":focus-visible": 2 }, outlineStyle: { default: null, ":focus-visible": "solid" }, outlineColor: vlak.ink, outlineOffset: 2 },
  actions: { display: "flex", flexWrap: "wrap", gap: "0.5rem" },
  button: { minWidth: vlak.hit, minHeight: vlak.hit, paddingInline: "0.75rem", backgroundColor: vlak.paper, color: vlak.ink, borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.controlBorder, borderRadius: vlak.radiusSm, fontFamily: "inherit", fontSize: vlak.controlFs, cursor: "pointer", outlineWidth: { default: null, ":focus-visible": 2 }, outlineStyle: { default: null, ":focus-visible": "solid" }, outlineColor: vlak.ink, outlineOffset: 2 },
  pressed: { backgroundColor: { default: vlak.ink, [mq.forcedColors]: "Highlight" }, color: { default: vlak.paper, [mq.forcedColors]: "HighlightText" } },
});

/** Gain, pan, mute and solo state for an application-owned audio channel. */
export const ChannelStrip = React.forwardRef<HTMLFieldSetElement, ChannelStripProps>(function ChannelStrip({ label, value, defaultValue = initial, onValueChange, gainMin = -60, gainMax = 12, readOnly, name, form, disabled, className, style, ...props }, ref) {
  const [, refresh] = React.useReducer((n: number) => n + 1, 0);
  const [current, setValue, fieldRef] = useInputValue<ChannelStripValue, HTMLFieldSetElement>(value, defaultValue, onValueChange, refresh);
  const mergedRef = useMergedRefs(ref, fieldRef);
  const root = rs(["rs-channel-strip", className], styles.root);
  const heading = rs(["rs-channel-strip-label"], styles.label);
  const field = rs(["rs-channel-strip-field"], styles.field);
  const text = rs(["rs-channel-strip-text"], styles.text);
  const range = rs(["rs-channel-strip-range"], styles.range);
  const actions = rs(["rs-channel-strip-actions"], styles.actions);
  const gainBoundsValid = Number.isFinite(gainMin) && Number.isFinite(gainMax) && Number.isFinite(gainMax - gainMin) && gainMax > gainMin;
  const gainValid = gainBoundsValid && Number.isFinite(current.gain) && current.gain >= gainMin && current.gain <= gainMax;
  const panValid = Number.isFinite(current.pan) && current.pan >= -100 && current.pan <= 100;
  const gainText = !gainBoundsValid ? "Range unavailable" : !Number.isFinite(current.gain) ? "Unavailable" : `${current.gain} dB${gainValid ? "" : " · Outside range"}`;
  const panText = !Number.isFinite(current.pan) ? "Unavailable" : `${current.pan === 0 ? "Center" : `${Math.abs(current.pan)}% ${current.pan < 0 ? "left" : "right"}`}${panValid ? "" : " · Outside range"}`;
  return <fieldset {...props} ref={mergedRef} name={name} form={form} disabled={disabled} className={root.className} style={{ ...root.style, ...style }}>
    <legend className={heading.className} style={heading.style}>{label}</legend>
    <label className={field.className} style={field.style}><span className={text.className} style={text.style}><span>Gain</span><span>{gainText}</span></span><input type="range" aria-label="Gain" form={form} name={name ? `${name}.gain` : undefined} min={gainValid ? gainMin : 0} max={gainValid ? gainMax : 1} step="any" value={gainValid ? current.gain : 0} disabled={disabled || readOnly || !gainValid} aria-invalid={!gainValid || undefined} aria-valuetext={gainText} className={range.className} style={range.style} onChange={(event) => setValue({ ...current, gain: Number(event.currentTarget.value) })} /></label>
    <label className={field.className} style={field.style}><span className={text.className} style={text.style}><span>Pan</span><span>{panText}</span></span><input type="range" aria-label="Pan" form={form} name={name ? `${name}.pan` : undefined} min={-100} max={100} step="any" value={panValid ? current.pan : 0} disabled={disabled || readOnly || !panValid} aria-invalid={!panValid || undefined} aria-valuetext={panText} className={range.className} style={range.style} onChange={(event) => setValue({ ...current, pan: Number(event.currentTarget.value) })} /></label>
    <div className={actions.className} style={actions.style}>{([['muted', 'Mute'], ['solo', 'Solo']] as const).map(([key, title]) => {
      const button = rs(["rs-channel-strip-button", current[key] && "rs-channel-strip-pressed"], styles.button, current[key] && styles.pressed);
      return <button key={key} type="button" disabled={disabled || readOnly} aria-pressed={current[key]} className={button.className} style={button.style} onClick={() => setValue({ ...current, [key]: !current[key] })}>{title}</button>;
    })}</div>
    {name && <><input type="hidden" name={`${name}.muted`} form={form} value={String(current.muted)} /><input type="hidden" name={`${name}.solo`} form={form} value={String(current.solo)} /></>}
    {readOnly && name && <>{gainValid && <input type="hidden" name={`${name}.gain`} form={form} value={current.gain} />}{panValid && <input type="hidden" name={`${name}.pan`} form={form} value={current.pan} />}</>}
  </fieldset>;
});
