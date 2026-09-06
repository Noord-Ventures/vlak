import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";

export interface AudioMeterChannel { id: string; label: string; level: number | null; peak?: number | null }
export interface AudioMeterProps extends React.HTMLAttributes<HTMLDivElement> {
  label: React.ReactNode;
  channels: AudioMeterChannel[];
  min?: number;
  max?: number;
}

const styles = stylex.create({
  root: { display: "grid", gap: "0.75rem", minWidth: 0, color: vlak.ink },
  label: { margin: 0, fontSize: vlak.controlFs, fontWeight: 600, lineHeight: 1.45 },
  channel: { display: "grid", gap: "0.375rem" },
  text: { display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "0.25rem 1rem", fontSize: vlak.controlLabel, lineHeight: 1.45, fontVariantNumeric: "tabular-nums" },
  meter: { display: "block", width: "100%", height: "0.75rem", appearance: "none", backgroundColor: vlak.paper, borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.controlBorder, boxSizing: "border-box", "::-webkit-meter-bar": { backgroundColor: vlak.paper, borderWidth: 0, borderRadius: 0, boxShadow: "none" }, "::-webkit-meter-optimum-value": { backgroundColor: { default: vlak.ink, [mq.forcedColors]: "CanvasText" } }, "::-moz-meter-bar": { backgroundColor: { default: vlak.ink, [mq.forcedColors]: "CanvasText" } } },
  note: { color: vlak.gray, margin: 0, fontSize: vlak.controlLabel, lineHeight: 1.45 },
});

function decibels(value: number | null | undefined) { return value === Number.NEGATIVE_INFINITY ? "−∞ dB" : value != null && Number.isFinite(value) ? `${value} dB` : "Unavailable"; }

/** Supplied channel levels and peaks; no audio analysis or peak holding. */
export const AudioMeter = React.forwardRef<HTMLDivElement, AudioMeterProps>(function AudioMeter({ label, channels, min = -60, max = 0, className, style, ...props }, ref) {
  const id = React.useId();
  const validRange = Number.isFinite(min) && Number.isFinite(max) && Number.isFinite(max - min) && max > min;
  const root = rs(["rs-audio-meter", className], styles.root);
  const heading = rs(["rs-audio-meter-label"], styles.label);
  const channelStyle = rs(["rs-audio-meter-channel"], styles.channel);
  const text = rs(["rs-audio-meter-text"], styles.text);
  const meter = rs(["rs-audio-meter-bar"], styles.meter);
  const note = rs(["rs-audio-meter-note"], styles.note);
  return <div {...props} ref={ref} className={root.className} style={{ ...root.style, ...style }}>
    <p id={`${id}-label`} className={heading.className} style={heading.style}>{label}</p>
    {!validRange && <p className={note.className} style={note.style}>Meter range unavailable</p>}
    {channels.length === 0 && <p className={note.className} style={note.style}>No channels supplied</p>}
    {channels.map((channel, index) => {
      const validLevel = channel.level != null && (Number.isFinite(channel.level) || channel.level === Number.NEGATIVE_INFINITY);
      return <div key={channel.id} className={channelStyle.className} style={channelStyle.style}>
        <div className={text.className} style={text.style}><span id={`${id}-${index}`}>{channel.label}</span><span>{decibels(channel.level)}</span></div>
        {validRange && validLevel && <meter min={min} max={max} value={Math.min(max, Math.max(min, channel.level!))} aria-labelledby={`${id}-label ${id}-${index}`} aria-valuetext={decibels(channel.level)} className={meter.className} style={meter.style}>{decibels(channel.level)}</meter>}
        {channel.peak !== undefined && <p className={note.className} style={note.style}>Peak: {decibels(channel.peak)}</p>}
      </div>;
    })}
  </div>;
});
