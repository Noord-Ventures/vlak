"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";

export interface ClipTrack { id: string; label: string }
export interface TimelineClip { id: string; trackId: string; label: string; start: number; duration: number }
export interface ClipTimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  label: React.ReactNode;
  tracks: ClipTrack[];
  clips: TimelineClip[];
  duration: number;
  unit: "seconds" | "frames";
  position?: number | null;
  selectedClipId?: string | null;
  onSeek?: (position: number) => void;
  onSelectClip?: (id: string) => void;
  disabled?: boolean;
}

const styles = stylex.create({
  root: { display: "grid", gap: "0.75rem", minWidth: 0, maxWidth: "100%", color: vlak.ink },
  label: { margin: 0, fontSize: vlak.controlFs, fontWeight: 600, lineHeight: 1.45 },
  note: { margin: 0, fontSize: vlak.controlLabel, color: vlak.gray, lineHeight: 1.45 },
  seek: { display: "grid", gap: "0.25rem", fontSize: vlak.controlLabel, lineHeight: 1.45 },
  range: { margin: 0, minHeight: vlak.hit, minWidth: vlak.hit, width: "100%", accentColor: vlak.ink },
  viewport: { maxWidth: "100%", minWidth: 0, overflowX: "auto", borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.divider, outlineWidth: { default: null, ":focus-visible": 2 }, outlineStyle: { default: null, ":focus-visible": "solid" }, outlineColor: vlak.ink, outlineOffset: 2 },
  track: { minWidth: "24rem", padding: "0.75rem", borderBottomWidth: vlak.hairline, borderBottomStyle: "solid", borderBottomColor: vlak.divider, display: "grid", gap: "0.5rem" },
  clips: { display: "grid", gap: "0.375rem" },
  lane: { minWidth: 0, height: vlak.hit, position: "relative", backgroundColor: vlak.tableAlt },
  clip: { position: "absolute", top: 0, bottom: 0, minWidth: 0, boxSizing: "border-box", backgroundColor: vlak.paper, borderWidth: 0, boxShadow: `inset 0 0 0 1px ${vlak.controlBorder}`, color: vlak.ink, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", padding: 0 },
  selected: { backgroundColor: { default: vlak.ink, [mq.forcedColors]: "Highlight" }, color: { default: vlak.paper, [mq.forcedColors]: "HighlightText" } },
  rows: { display: "grid", gap: "0.25rem", listStyleType: "none", margin: 0, padding: 0 },
  button: { textAlign: "start", minWidth: vlak.hit, minHeight: vlak.hit, padding: "0.625rem 0.75rem", width: "100%", backgroundColor: vlak.paper, color: vlak.ink, borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.controlBorder, borderRadius: vlak.radiusSm, fontSize: vlak.controlFs, fontFamily: "inherit", lineHeight: 1.45, cursor: "pointer", outlineWidth: { default: null, ":focus-visible": 2 }, outlineStyle: { default: null, ":focus-visible": "solid" }, outlineColor: vlak.ink, outlineOffset: 2 },
});

/** Supplied clip positions, with separate reachable selection and seek controls. */
export const ClipTimeline = React.forwardRef<HTMLDivElement, ClipTimelineProps>(function ClipTimeline({ label, tracks, clips, duration, unit, position, selectedClipId, onSeek, onSelectClip, disabled, className, style, ...props }, ref) {
  const labelId = React.useId();
  const validDuration = Number.isFinite(duration) && duration > 0 && (unit !== "frames" || Number.isInteger(duration));
  const clipEnd = (clip: TimelineClip) => {
    const end = clip.start + clip.duration;
    const tolerance = Number.EPSILON * Math.max(Math.abs(clip.start), Math.abs(clip.duration), Math.abs(duration)) * 4;
    return unit === "seconds" && end > duration && end - duration <= tolerance ? duration : end;
  };
  const validClip = (clip: TimelineClip) => validDuration && Number.isFinite(clip.start) && Number.isFinite(clip.duration) && clip.start >= 0 && clip.duration > 0 && clipEnd(clip) <= duration && (unit !== "frames" || (Number.isInteger(clip.start) && Number.isInteger(clip.duration)));
  const validPosition = position != null && Number.isFinite(position) && position >= 0 && position <= duration && (unit !== "frames" || Number.isInteger(position));
  const root = rs(["rs-clip-timeline", className], styles.root);
  const heading = rs(["rs-clip-timeline-label"], styles.label);
  const note = rs(["rs-clip-timeline-note"], styles.note);
  const seek = rs(["rs-clip-timeline-seek"], styles.seek);
  const range = rs(["rs-clip-timeline-range"], styles.range);
  const viewport = rs(["rs-clip-timeline-viewport"], styles.viewport);
  const trackStyle = rs(["rs-clip-timeline-track"], styles.track);
  const lanes = rs(["rs-clip-timeline-clips"], styles.clips);
  const lane = rs(["rs-clip-timeline-lane"], styles.lane);
  const rows = rs(["rs-clip-timeline-rows"], styles.rows);
  return <div {...props} ref={ref} className={root.className} style={{ ...root.style, ...style }}>
    <p id={labelId} className={heading.className} style={heading.style}>{label}</p>
    {!validDuration ? <p className={note.className} style={note.style}>Timeline duration unavailable</p> : <p className={note.className} style={note.style}>0 to {duration} {unit}</p>}
    {onSeek && validDuration && <label className={seek.className} style={seek.style}><span>{validPosition ? `Position: ${position} ${unit}` : "Choose a position"}</span><input type="range" aria-label={`Seek in ${unit}`} min={0} max={duration} step={unit === "frames" ? 1 : 0.01} value={validPosition ? position : 0} disabled={disabled} className={range.className} style={range.style} onChange={(event) => onSeek(Number(event.currentTarget.value))} /></label>}
    {tracks.length === 0 && <p className={note.className} style={note.style}>No tracks supplied</p>}
    {tracks.length > 0 && <div role="region" aria-labelledby={labelId} tabIndex={0} className={viewport.className} style={viewport.style}>{tracks.map((track) => <div key={track.id} className={trackStyle.className} style={trackStyle.style}>
      <span className={note.className} style={note.style}>{track.label}</span>
      <div aria-hidden="true" className={lanes.className} style={lanes.style}>{clips.filter((clip) => clip.trackId === track.id && validClip(clip)).map((clip) => {
        const selected = clip.id === selectedClipId;
        const paint = rs(["rs-clip-timeline-clip", selected && "rs-clip-timeline-selected"], styles.clip, selected && styles.selected);
        return <div key={clip.id} className={lane.className} style={lane.style}><span className={paint.className} style={{ ...paint.style, insetInlineStart: `${clip.start / duration * 100}%`, width: `${clip.duration / duration * 100}%` }}>{clip.label}</span></div>;
      })}</div>
      {clips.every((clip) => clip.trackId !== track.id) && <span className={note.className} style={note.style}>No clips</span>}
    </div>)}</div>}
    {clips.length === 0 && <p className={note.className} style={note.style}>No clips supplied</p>}
    <ul className={rows.className} style={rows.style}>{clips.map((clip) => {
      const selected = clip.id === selectedClipId;
      const button = rs(["rs-clip-timeline-button", selected && "rs-clip-timeline-selected"], styles.button, selected && styles.selected);
      const track = tracks.find((item) => item.id === clip.trackId);
      const text = `${clip.label} · ${track?.label ?? "Unknown track"} · ${validClip(clip) ? `${clip.start}–${clipEnd(clip)} ${unit}` : "Invalid interval"}`;
      return <li key={clip.id}>{onSelectClip ? <button type="button" disabled={disabled} aria-pressed={selected} className={button.className} style={button.style} onClick={() => onSelectClip(clip.id)}>{text}</button> : <span className={note.className} style={note.style}>{text}</span>}</li>;
    })}</ul>
  </div>;
});
