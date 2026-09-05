"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../tokens.stylex";
import { rs } from "../rs";
import { Slider } from "./slider";

export interface WaveformRegion { start: number; end: number }
export interface WaveformProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue"> {
  /** Amplitudes from zero to one; values are clamped. */
  samples: readonly number[];
  label: string;
  value?: number;
  defaultValue?: number;
  onValueChange?: (position: number) => void;
  disabled?: boolean;
  region?: WaveformRegion;
  defaultRegion?: WaveformRegion;
  onRegionChange?: (region: WaveformRegion) => void;
}
const styles = stylex.create({
  root: { minWidth: 0, width: "100%", color: vlak.ink, display: "flex", flexDirection: "column", gap: "0.5rem" },
  stage: { position: "relative", minHeight: vlak.hit, height: "4rem", borderRadius: vlak.radiusSm, ":focus-within": { outlineWidth: 2, outlineStyle: "solid", outlineColor: vlak.ink, outlineOffset: 2 } },
  plot: { display: "block", width: "100%", height: "100%", overflow: "visible" },
  bar: { fill: vlak.gray },
  played: { fill: vlak.ink },
  input: { position: "absolute", inset: 0, width: "100%", height: "100%", margin: 0, opacity: 0, cursor: "pointer" },
  region: { position: "absolute", top: 0, bottom: 0, backgroundColor: vlak.controlFill, borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.controlBorder, pointerEvents: "none" },
  regionControls: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "1rem" },
  label: { fontSize: "0.75rem", color: vlak.gray, lineHeight: 1.45 },
});

/** A waveform from supplied amplitude data, optionally scrubbed through a native range. */
export const Waveform = React.forwardRef<HTMLDivElement, WaveformProps>(function Waveform({ samples, label, value, defaultValue = 0, onValueChange, disabled = false, region, defaultRegion = { start: 0, end: 1 }, onRegionChange, className, style, ...props }, ref) {
  const [inner, setInner] = React.useState(defaultValue);
  const position = Math.max(0, Math.min(1, Number.isFinite(value ?? inner) ? value ?? inner : 0));
  const [innerRegion, setInnerRegion] = React.useState(defaultRegion);
  const rawRegion = region ?? innerRegion;
  const start = Math.max(0, Math.min(1, Number.isFinite(rawRegion.start) ? rawRegion.start : 0));
  const end = Math.max(start, Math.min(1, Number.isFinite(rawRegion.end) ? rawRegion.end : 1));
  const changeRegion = (next: WaveformRegion) => { if (region === undefined) setInnerRegion(next); onRegionChange?.(next); };
  // Bound the SVG cost while retaining peak energy when input comes from a long recording.
  const peaks = React.useMemo(() => {
    const stride = Math.max(1, Math.ceil(samples.length / 240));
    return Array.from({ length: Math.ceil(samples.length / stride) }, (_, index) => {
      let peak = 0;
      for (let at = index * stride; at < Math.min(samples.length, (index + 1) * stride); at++) peak = Math.max(peak, Number.isFinite(samples[at]) ? Math.abs(samples[at]!) : 0);
      return Math.min(1, peak);
    });
  }, [samples]);
  const root = rs(["rs-waveform", className], styles.root);
  const stage = rs(["rs-waveform-stage"], styles.stage);
  const plot = rs(["rs-waveform-plot"], styles.plot);
  const input = rs(["rs-waveform-input"], styles.input);
  const regionStyle = rs(["rs-waveform-region"], styles.region);
  const regionControls = rs(["rs-waveform-region-controls"], styles.regionControls);
  const regionLabel = rs(["rs-waveform-label"], styles.label);
  return <div ref={ref} {...props} className={root.className} style={{ ...root.style, ...style }}>
    <div {...stage}>
    {(region || onRegionChange) && <span {...regionStyle} aria-hidden="true" style={{ ...regionStyle.style, insetInlineStart: `${start * 100}%`, width: `${(end - start) * 100}%` }} />}
    <svg {...plot} viewBox={`0 0 ${Math.max(4, peaks.length * 4)} 48`} preserveAspectRatio="none" role={onValueChange ? undefined : "img"} aria-label={onValueChange ? undefined : label} aria-hidden={onValueChange ? true : undefined}>
      {peaks.map((peak, index) => { const bar = rs(["rs-waveform-bar", index / Math.max(1, peaks.length) < position && "rs-waveform-played"], styles.bar, index / Math.max(1, peaks.length) < position && styles.played); const height = Math.max(1, peak * 44); return <rect key={index} {...bar} x={index * 4} y={(48 - height) / 2} width={2} height={height} />; })}
    </svg>
    {onValueChange && <input {...input} type="range" min={0} max={1} step={0.001} value={position} disabled={disabled || peaks.length === 0} aria-label={label} aria-valuetext={`${Math.round(position * 100)} percent`} onChange={event => { const next = Number(event.target.value); if (value === undefined) setInner(next); onValueChange(next); }} />}
    </div>
    {onRegionChange && <div {...regionControls}>
      <label {...regionLabel}>Selection start · {Math.round(start * 100)}%<Slider min={0} max={end || 0.001} step={0.001} value={start} disabled={disabled || peaks.length === 0} aria-label="Selection start" aria-valuetext={`${Math.round(start * 100)} percent`} onValueChange={next => changeRegion({ start: Math.min(next, end), end })} /></label>
      <label {...regionLabel}>Selection end · {Math.round(end * 100)}%<Slider min={start} max={1} step={0.001} value={end} disabled={disabled || peaks.length === 0} aria-label="Selection end" aria-valuetext={`${Math.round(end * 100)} percent`} onValueChange={next => changeRegion({ start, end: Math.max(start, next) })} /></label>
    </div>}
  </div>;
});
