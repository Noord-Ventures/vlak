"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { Select } from "./select";
import { Input } from "./input";
import { useInputValue } from "../use-input-value";
import { useMergedRefs } from "../merge-refs";

export interface RasterSourceBand {
  id: string;
  label: string;
  description?: React.ReactNode;
  unit?: string | null;
  /** undefined means unknown, null means no missing-data sentinel, and zero is a valid sentinel. */
  noDataValue?: number | null;
  disabled?: boolean;
}
export interface RasterChannelMapping { bandId: string | null; minimum: number | null; maximum: number | null }
export type RasterStretch = "none" | "min-max" | "clip" | "stretch-clip";
export interface RasterBandConfiguration {
  mode: "rgb" | "single";
  stretch: RasterStretch;
  red: RasterChannelMapping;
  green: RasterChannelMapping;
  blue: RasterChannelMapping;
  single: RasterChannelMapping;
}
export interface RasterBandMixerProps extends Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, "defaultValue"> {
  label: React.ReactNode;
  bands: readonly RasterSourceBand[];
  value?: RasterBandConfiguration;
  defaultValue?: RasterBandConfiguration;
  /** Emits configuration only. The host owns rendering and any statistics or range calculation. */
  onValueChange?: (value: RasterBandConfiguration) => void;
  description?: React.ReactNode;
  readOnly?: boolean;
}

const emptyChannel: RasterChannelMapping = { bandId: null, minimum: null, maximum: null };
const initial: RasterBandConfiguration = { mode: "rgb", stretch: "none", red: emptyChannel, green: emptyChannel, blue: emptyChannel, single: emptyChannel };
const stretches: { value: RasterStretch; label: string }[] = [{ value: "none", label: "No enhancement" }, { value: "min-max", label: "Stretch to range" }, { value: "clip", label: "Clip to range" }, { value: "stretch-clip", label: "Stretch and clip" }];
const styles = stylex.create({
  root: { display: "grid", gap: "0.875rem", minWidth: 0, margin: 0, padding: 0, borderWidth: 0, color: vlak.ink, lineHeight: 1.45 },
  legend: { padding: 0, marginBottom: "0.75rem", fontSize: vlak.controlFs, fontWeight: 600 },
  fields: { display: "grid", gridTemplateColumns: { default: "repeat(auto-fit, minmax(min(100%, 9rem), 1fr))", [mq.phone]: "minmax(0, 1fr)" }, gap: "0.75rem", minWidth: 0 },
  channel: { display: "grid", gap: "0.75rem", minWidth: 0, padding: "0.875rem", borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.divider },
  title: { margin: 0, fontSize: vlak.controlFs, fontWeight: 600 },
  field: { display: "grid", alignContent: "start", gap: "0.375rem", minWidth: 0, fontSize: vlak.controlLabel },
  control: { minWidth: 0, width: "100%", minHeight: vlak.hit },
  note: { margin: 0, color: vlak.gray, fontSize: vlak.controlLabel, maxWidth: "66ch", overflowWrap: "anywhere" },
});

/** Selects source bands and display ranges. No pixels, statistics or missing-data rules are inferred. */
export const RasterBandMixer = React.forwardRef<HTMLFieldSetElement, RasterBandMixerProps>(function RasterBandMixer({ label, bands, value, defaultValue = initial, onValueChange, description, readOnly, disabled, name, form, className, style, children, "aria-describedby": ariaDescribedBy, ...props }, ref) {
  const id = React.useId();
  const [, refresh] = React.useReducer((n: number) => n + 1, 0);
  const [current, setValue, fieldRef] = useInputValue<RasterBandConfiguration, HTMLFieldSetElement>(value, defaultValue, onValueChange, refresh);
  const mergedRef = useMergedRefs(ref, fieldRef);
  const validBands = bands.every(band => band.id.length > 0) && new Set(bands.map(band => band.id)).size === bands.length;
  const channels: { key: "red" | "green" | "blue" | "single"; label: string }[] = current.mode === "single" ? [{ key: "single", label: "Single band" }] : [{ key: "red", label: "Red channel" }, { key: "green", label: "Green channel" }, { key: "blue", label: "Blue channel" }];
  const describedBy = [ariaDescribedBy, `${id}-hint`, description != null && `${id}-description`, readOnly && `${id}-readonly`].filter(Boolean).join(" ");
  const root = rs(["rs-raster-band-mixer", className], styles.root);
  const legend = rs(["rs-raster-band-mixer-legend"], styles.legend);
  const fields = rs(["rs-raster-band-mixer-fields"], styles.fields);
  const channelStyle = rs(["rs-raster-band-mixer-channel"], styles.channel);
  const title = rs(["rs-raster-band-mixer-title"], styles.title);
  const field = rs(["rs-raster-band-mixer-label"], styles.field);
  const control = rs(["rs-raster-band-mixer-control"], styles.control);
  const note = rs(["rs-raster-band-mixer-note"], styles.note);
  const inputName = (part: string) => name ? `${name}.${part}` : undefined;
  const change = (next: RasterBandConfiguration) => { if (!readOnly && !disabled) setValue(next); };
  return <fieldset {...props} ref={mergedRef} name={name} form={form} disabled={disabled} aria-describedby={describedBy} className={root.className} style={{ ...root.style, ...style }}>
    <legend {...legend}>{label}</legend>
    {description != null && <p {...note} id={`${id}-description`}>{description}</p>}
    <p {...note} id={`${id}-hint`}>Choose display bands and ranges. The application renders the image from this configuration.</p>
    {readOnly && <p {...note} id={`${id}-readonly`}>Read only</p>}
    {!validBands ? <p {...note}>Band identifiers must be unique and non-empty.</p> : <>
      <div {...fields}>
        <div {...field}><span id={`${id}-mode-label`}>Rendering mode</span><Select {...control} fullWidth name={inputName("mode")} form={form} value={current.mode} disabled={disabled} readOnly={readOnly} aria-labelledby={`${id}-mode-label`} aria-describedby={describedBy} options={[{ value: "rgb", label: "Three channels" }, { value: "single", label: "Single band" }]} onValueChange={next => change({ ...current, mode: next as RasterBandConfiguration["mode"] })} /></div>
        <div {...field}><span id={`${id}-stretch-label`}>Range treatment</span><Select {...control} fullWidth name={inputName("stretch")} form={form} value={current.stretch} disabled={disabled} readOnly={readOnly} aria-labelledby={`${id}-stretch-label`} aria-describedby={describedBy} options={stretches} onValueChange={next => change({ ...current, stretch: next as RasterStretch })} /></div>
      </div>
      {channels.map(channel => {
        const mapping = current[channel.key];
        const band = bands.find(item => item.id === mapping.bandId);
        const unavailable = mapping.bandId != null && (!band || band.disabled);
        const finiteMin = mapping.minimum != null && Number.isFinite(mapping.minimum);
        const finiteMax = mapping.maximum != null && Number.isFinite(mapping.maximum);
        const reversed = finiteMin && finiteMax && mapping.minimum! >= mapping.maximum!;
        const channelId = `${id}-${channel.key}`;
        const update = (patch: Partial<RasterChannelMapping>) => change({ ...current, [channel.key]: { ...mapping, ...patch } });
        return <div {...channelStyle} key={channel.key}>
          <p {...title}>{channel.label}</p>
          <div {...field}><span id={`${channelId}-label`}>{channel.label} source</span><Select {...control} fullWidth name={inputName(`${channel.key}.band`)} form={form} value={unavailable ? "" : mapping.bandId ?? ""} disabled={disabled} readOnly={readOnly} required aria-invalid={unavailable || undefined} aria-labelledby={`${channelId}-label`} aria-describedby={`${describedBy} ${channelId}-source`} options={[{ value: "", label: unavailable ? `Unavailable band: ${mapping.bandId}` : "No band selected" }, ...bands.map(item => ({ value: item.id, label: `${item.label}${item.disabled ? " (unavailable)" : ""}`, disabled: item.disabled }))]} onValueChange={next => update({ bandId: next || null })} /></div>
          <p {...note} id={`${channelId}-source`}>{unavailable ? `Source band unavailable: ${mapping.bandId}` : !band ? "Source band not supplied" : <>Missing-data value: {band.noDataValue === undefined ? "Unknown" : band.noDataValue === null ? "None defined" : String(band.noDataValue)}. Unit: {band.unit || "Not supplied"}{band.description != null ? <>. {band.description}</> : null}</>}</p>
          {current.stretch !== "none" && <><div {...fields}>{(["minimum", "maximum"] as const).map(bound => {
            const amount = mapping[bound];
            const finite = amount != null && Number.isFinite(amount);
            const invalid = amount != null && !finite;
            return <label {...field} key={bound}><span>{channel.label} {bound}</span><Input plain {...control} type="number" name={inputName(`${channel.key}.${bound}`)} form={form} value={finite ? amount : ""} step="any" required readOnly={readOnly} aria-invalid={invalid || reversed || undefined} aria-describedby={`${describedBy} ${channelId}-range`} ref={node => { node?.setCustomValidity(reversed ? "Minimum must be less than maximum." : invalid ? "Range value unavailable. Enter a finite number." : ""); }} onChange={event => update({ [bound]: Number.isFinite(event.currentTarget.valueAsNumber) ? event.currentTarget.valueAsNumber : null })} /></label>;
          })}</div><p {...note} id={`${channelId}-range`}>{reversed ? "Minimum must be less than maximum" : !finiteMin || !finiteMax ? "Supply both range bounds as finite numbers" : `Supplied range: ${mapping.minimum} to ${mapping.maximum}`}</p></>}
        </div>;
      })}
      {bands.length === 0 && <p {...note}>No source bands supplied</p>}
    </>}
    {children}
  </fieldset>;
});
