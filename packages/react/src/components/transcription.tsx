"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { Button } from "./button";
import { formatMediaTime } from "./media-scrubber";

export interface TranscriptionSegment { id: string; text: string; startSecond: number; endSecond: number; speaker?: string }
export interface TranscriptionProps extends React.HTMLAttributes<HTMLDivElement> {
  segments: readonly TranscriptionSegment[];
  currentTime?: number;
  onSeek?: (seconds: number) => void;
  label?: string;
  /** Follow active text until the reader scrolls. Off by default. */
  autoScroll?: boolean;
  maxHeight?: number | string;
}
const styles = stylex.create({
  root: { display: "grid", gap: "0.5rem", minWidth: 0, color: vlak.ink },
  viewport: { overflowY: "auto", minWidth: 0, overscrollBehavior: "contain", borderWidth: vlak.hairline, borderStyle: "solid", borderColor: { default: vlak.divider, [mq.forcedColors]: "CanvasText" }, borderRadius: vlak.radiusSm, ":focus-visible": { outlineWidth: 2, outlineStyle: "solid", outlineColor: vlak.ink, outlineOffset: 2 } },
  list: { margin: 0, padding: 0, listStyleType: "none" },
  segment: { display: "grid", gridTemplateColumns: "4.5rem minmax(0, 1fr)", alignItems: "start", gap: "0.75rem", width: "100%", minHeight: vlak.hit, boxSizing: "border-box", padding: "0.75rem", borderWidth: 0, borderRadius: 0, backgroundColor: "transparent", color: vlak.gray, fontSize: vlak.controlFs, lineHeight: 1.45, fontFamily: "inherit", textAlign: "start", overflowWrap: "anywhere" },
  interactive: { cursor: "pointer", color: { default: vlak.gray, ":hover": { default: null, [mq.hover]: vlak.ink } }, ":focus-visible": { outlineWidth: 2, outlineStyle: "solid", outlineColor: vlak.ink, outlineOffset: -2 } },
  active: { backgroundColor: { default: vlak.controlFill, [mq.forcedColors]: "Highlight" }, color: { default: vlak.ink, [mq.forcedColors]: "HighlightText" }, fontWeight: 500 },
  time: { fontSize: vlak.controlLabel, fontVariantNumeric: "tabular-nums", paddingTop: "0.125rem" },
  speaker: { display: "block", fontSize: vlak.controlLabel, marginBottom: "0.25rem" },
  empty: { margin: 0, padding: "0.75rem", fontSize: vlak.controlFs, color: vlak.gray },
});

/** Supplied timed text. Playback remains application-owned; only activation requests a seek. */
export const Transcription = React.forwardRef<HTMLDivElement, TranscriptionProps>(function Transcription({ segments, currentTime = 0, onSeek, label = "Transcript", autoScroll = false, maxHeight = "24rem", className, style, ...props }, ref) {
  const viewport = React.useRef<HTMLDivElement>(null);
  const activeRef = React.useRef<HTMLLIElement>(null);
  const [following, setFollowing] = React.useState(autoScroll);
  const rendered = segments.filter(segment => segment.text.trim() && Number.isFinite(segment.startSecond) && Number.isFinite(segment.endSecond) && segment.startSecond >= 0 && segment.endSecond >= segment.startSecond);
  const active = rendered.find(segment => currentTime >= segment.startSecond && currentTime < segment.endSecond)?.id;
  const reveal = React.useCallback(() => {
    const parent = viewport.current; const item = activeRef.current;
    if (!parent || !item) return;
    const parentBox = parent.getBoundingClientRect(); const itemBox = item.getBoundingClientRect();
    if (itemBox.top < parentBox.top) parent.scrollTop += itemBox.top - parentBox.top;
    else if (itemBox.bottom > parentBox.bottom) parent.scrollTop += itemBox.bottom - parentBox.bottom;
  }, []);
  React.useEffect(() => setFollowing(autoScroll), [autoScroll]);
  React.useEffect(() => { if (autoScroll && following && active) reveal(); }, [active, autoScroll, following, reveal]);
  const root = rs(["rs-transcription", className], styles.root);
  const frame = rs(["rs-transcription-viewport"], styles.viewport);
  const list = rs(["rs-transcription-list"], styles.list);
  const time = rs(["rs-transcription-time"], styles.time);
  const speaker = rs(["rs-transcription-speaker"], styles.speaker);
  const empty = rs(["rs-transcription-empty"], styles.empty);
  return <div ref={ref} {...props} className={root.className} style={{ ...root.style, ...style }}>
    <div {...frame} ref={viewport} role="group" aria-label={label} tabIndex={0} style={{ ...frame.style, maxHeight }} onWheel={() => setFollowing(false)} onTouchMove={() => setFollowing(false)} onPointerDown={() => setFollowing(false)} onKeyDown={event => { if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"].includes(event.key)) setFollowing(false); }}>
      {rendered.length ? <ol {...list}>{rendered.map(segment => {
        const selected = segment.id === active;
        const item = rs(["rs-transcription-segment", Boolean(onSeek) && "rs-transcription-interactive", selected && "rs-transcription-active"], styles.segment, Boolean(onSeek) && styles.interactive, selected && styles.active);
        const content = <><span {...time}>{formatMediaTime(segment.startSecond)}</span><span>{segment.speaker && <span {...speaker}>{segment.speaker}</span>}{segment.text}</span></>;
        return <li key={segment.id} ref={selected ? activeRef : undefined}>{onSeek ? <button {...item} type="button" aria-current={selected ? "true" : undefined} aria-label={`Seek to ${formatMediaTime(segment.startSecond)}${segment.speaker ? `, ${segment.speaker}` : ""}: ${segment.text}`} onClick={() => onSeek(segment.startSecond)}>{content}</button> : <div {...item} aria-current={selected ? "true" : undefined}>{content}</div>}</li>;
      })}</ol> : <p {...empty}>No transcript available.</p>}
    </div>
    {autoScroll && !following && <Button variant="subtle" size="sm" onClick={() => { setFollowing(true); reveal(); }}>Follow transcript</Button>}
  </div>;
});
