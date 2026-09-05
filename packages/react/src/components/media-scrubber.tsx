"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../tokens.stylex";
import { rs } from "../rs";
import { Slider, type SliderProps } from "./slider";
import { NativeSelect } from "./native-select";

export interface MediaChapter { time: number; label: string }
export interface MediaScrubberProps extends Omit<SliderProps, "min" | "max"> {
  duration: number;
  label?: string;
  showTime?: boolean;
  /** Last buffered second. */
  buffered?: number;
  chapters?: readonly MediaChapter[];
  /** Thumbnail or other visual preview for the pointed or focused second. */
  preview?: (seconds: number) => React.ReactNode;
}

/** Elapsed media time, including hours when needed. Invalid duration is displayed as zero. */
export function formatMediaTime(seconds: number): string {
  const total = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor(total / 60) % 60;
  const rest = String(total % 60).padStart(2, "0");
  return hours ? `${hours}:${String(minutes).padStart(2, "0")}:${rest}` : `${minutes}:${rest}`;
}

const styles = stylex.create({
  root: { display: "flex", flexDirection: "column", minWidth: 0, width: "100%", color: vlak.ink },
  times: { display: "flex", justifyContent: "space-between", gap: "1rem", color: vlak.gray, fontSize: "0.75rem", fontVariantNumeric: "tabular-nums", lineHeight: 1.45 },
  track: { position: "relative", display: "flex", flexDirection: "column" },
  rail: { position: "absolute", top: "calc(50% - 1px)", insetInlineStart: 0, height: 2, width: "100%", backgroundColor: vlak.divider, pointerEvents: "none" },
  buffered: { position: "absolute", top: "calc(50% - 1px)", insetInlineStart: 0, height: 2, backgroundColor: vlak.gray, pointerEvents: "none" },
  slider: { backgroundColor: "transparent" },
  preview: { position: "absolute", bottom: "100%", insetInlineStart: 0, maxWidth: "12rem", padding: "0.5rem", backgroundColor: vlak.paper, color: vlak.ink, borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.divider, borderRadius: vlak.radiusSm, pointerEvents: "none", zIndex: 1 },
  chapters: { marginTop: "0.75rem" },
});

/** A native range in seconds with elapsed and total time. The input remains a 44px target. */
export const MediaScrubber = React.forwardRef<HTMLInputElement, MediaScrubberProps>(function MediaScrubber({ value, defaultValue = 0, duration, label = "Playback position", showTime = true, step = 1, onValueChange, buffered = 0, chapters = [], preview, className, style, disabled, onFocus, onBlur, onPointerMove, onPointerLeave, ...props }, ref) {
  const [inner, setInner] = React.useState(defaultValue);
  const end = Number.isFinite(duration) ? Math.max(0, duration) : 0;
  const raw = value ?? inner;
  const current = Math.min(end, Math.max(0, Number.isFinite(raw) ? raw : 0));
  const [previewTime, setPreviewTime] = React.useState<number | null>(null);
  const change = (next: number) => { const bounded = Math.min(end, Math.max(0, next)); if (value === undefined) setInner(bounded); onValueChange?.(bounded); if (previewTime !== null) setPreviewTime(bounded); };
  const validChapters = chapters.filter(chapter => Number.isFinite(chapter.time) && chapter.time >= 0 && chapter.time <= end).slice().sort((a, b) => a.time - b.time);
  let chapterIndex = -1;
  validChapters.forEach((chapter, index) => { if (chapter.time <= current) chapterIndex = index; });
  const root = rs(["rs-media-scrubber", className], styles.root);
  const times = rs(["rs-media-scrubber-times"], styles.times);
  const track = rs(["rs-media-scrubber-track"], styles.track);
  const rail = rs(["rs-media-scrubber-rail"], styles.rail);
  const buffer = rs(["rs-media-scrubber-buffered"], styles.buffered);
  const slider = rs(["rs-media-scrubber-slider"], styles.slider);
  const previewStyle = rs(["rs-media-scrubber-preview"], styles.preview);
  const chapterStyle = rs(["rs-media-scrubber-chapters"], styles.chapters);
  return <div className={root.className} style={{ ...root.style, ...style }}>
    <div {...track}>
      <span {...rail} aria-hidden="true" /><span {...buffer} aria-hidden="true" style={{ ...buffer.style, width: `${end ? Math.max(0, Math.min(100, (Number.isFinite(buffered) ? buffered : 0) / end * 100)) : 0}%` }} />
      <Slider ref={ref} {...props} {...slider} min={0} max={end || 1} step={step} value={current} disabled={disabled || end === 0} aria-label={props["aria-label"] ?? label} aria-valuetext={`${formatMediaTime(current)} of ${formatMediaTime(end)}`} onValueChange={change}
        onFocus={event => { onFocus?.(event); setPreviewTime(current); }} onBlur={event => { onBlur?.(event); setPreviewTime(null); }}
        onPointerMove={event => { onPointerMove?.(event); const box = event.currentTarget.getBoundingClientRect(); if (preview && box.width > 0) setPreviewTime(Math.min(end, Math.max(0, (event.clientX - box.left) / box.width * end))); }} onPointerLeave={event => { onPointerLeave?.(event); setPreviewTime(null); }} />
      {preview && previewTime !== null && <div {...previewStyle} aria-hidden="true">{preview(previewTime)}</div>}
    </div>
    {showTime && <div {...times} aria-hidden="true"><span>{formatMediaTime(current)}</span><span>{formatMediaTime(end)}</span></div>}
    {validChapters.length > 0 && <div {...chapterStyle}><NativeSelect aria-label="Chapter" value={String(chapterIndex)} disabled={disabled || end === 0} onChange={event => { const chapter = validChapters[Number(event.target.value)]; if (chapter) change(chapter.time); }}><option value="-1" disabled>Select a chapter</option>{validChapters.map((chapter, index) => <option key={`${chapter.time}-${chapter.label}`} value={String(index)}>{chapter.label} · {formatMediaTime(chapter.time)}</option>)}</NativeSelect></div>}
  </div>;
});
