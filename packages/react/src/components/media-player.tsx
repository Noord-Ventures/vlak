"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../tokens.stylex";
import { rs } from "../rs";
import { useMergedRefs } from "../merge-refs";
import { Button } from "./button";
import { Icon } from "./icon";
import { NativeSelect } from "./native-select";
import { Slider } from "./slider";
import { PlaybackControls } from "./playback-controls";
import { MediaScrubber } from "./media-scrubber";

export interface MediaTrack { src: string; srcLang: string; label: string; default?: boolean }
export interface MediaPlayerProps extends React.HTMLAttributes<HTMLDivElement> {
  src: string;
  title: string;
  kind?: "audio" | "video";
  poster?: string;
  preload?: "none" | "metadata" | "auto";
  tracks?: readonly MediaTrack[];
  transcript?: React.ReactNode;
  onPlayingChange?: (playing: boolean) => void;
  onTimeChange?: (seconds: number) => void;
}
const styles = stylex.create({
  root: { width: "100%", minWidth: 0, color: vlak.ink, display: "flex", flexDirection: "column", gap: "1rem" },
  media: { display: "block", width: "100%", maxHeight: "32rem", backgroundColor: vlak.controlFill },
  heading: { margin: 0, fontSize: "1rem", fontWeight: 600, lineHeight: 1.45, overflowWrap: "anywhere" },
  controls: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.75rem" },
  action: { width: "auto", paddingInline: "0.75rem", minWidth: vlak.hit, minHeight: vlak.hit },
  volume: { flex: "0 1 8rem", minWidth: "5rem" },
  status: { margin: 0, fontSize: "0.875rem", color: vlak.gray, lineHeight: 1.45 },
  transcript: { lineHeight: 1.45, maxWidth: "66ch" },
  summary: { minHeight: vlak.hit, cursor: "pointer", display: "flex", alignItems: "center", fontWeight: 500, ":focus-visible": { outlineWidth: 2, outlineStyle: "solid", outlineColor: vlak.ink, outlineOffset: 2 } },
});

/** Native media with Vlak transport, seeking, volume, captions, and recoverable loading errors. */
export const MediaPlayer = React.forwardRef<HTMLMediaElement, MediaPlayerProps>(function MediaPlayer({ src, title, kind = "video", poster, preload = "metadata", tracks = [], transcript, onPlayingChange, onTimeChange, className, style, ...props }, ref) {
  const mediaRef = React.useRef<HTMLMediaElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const mergedRef = useMergedRefs(mediaRef, ref);
  const [hydrated, setHydrated] = React.useState(false);
  const [playing, setPlaying] = React.useState(false);
  const [position, setPosition] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [volume, setVolume] = React.useState(1);
  const [muted, setMuted] = React.useState(false);
  const [status, setStatus] = React.useState("");
  const [failed, setFailed] = React.useState(false);
  const [captions, setCaptions] = React.useState(() => String(tracks.findIndex(track => track.default)));
  const [canFullscreen, setCanFullscreen] = React.useState(false);
  const [speed, setSpeed] = React.useState(1);
  const [buffered, setBuffered] = React.useState(0);
  const headingId = React.useId();
  React.useEffect(() => { setHydrated(true); setCanFullscreen(typeof containerRef.current?.requestFullscreen === "function"); }, []);
  React.useEffect(() => { setPlaying(false); setPosition(0); setDuration(0); setBuffered(0); setFailed(false); setStatus(""); }, [src]);
  const captionsKey = tracks.map(track => `${track.src}:${Boolean(track.default)}`).join("\n");
  const defaultCaptions = String(tracks.findIndex(track => track.default));
  React.useEffect(() => {
    setCaptions(defaultCaptions);
    const list = mediaRef.current?.textTracks;
    if (list) for (let index = 0; index < list.length; index++) list[index]!.mode = index === Number(defaultCaptions) ? "showing" : "disabled";
  }, [src, captionsKey, defaultCaptions]);
  const applyCaptions = (selected: string) => {
    const list = mediaRef.current?.textTracks;
    if (list) for (let index = 0; index < list.length; index++) list[index]!.mode = index === Number(selected) ? "showing" : "disabled";
  };
  const toggle = async (next: boolean) => {
    const media = mediaRef.current;
    if (!media) return;
    setFailed(false); setStatus("");
    if (!next) { media.pause(); return; }
    try { await media.play(); } catch { setStatus("Playback could not start. Try Play again."); }
  };
  const root = rs(["rs-media-player", className], styles.root);
  const media = rs(["rs-media-player-media"], styles.media);
  const heading = rs(["rs-media-player-title"], styles.heading);
  const controls = rs(["rs-media-player-controls"], styles.controls);
  const action = rs(["rs-media-player-action"], styles.action);
  const volumeStyle = rs(["rs-media-player-volume"], styles.volume);
  const message = rs(["rs-media-player-status"], styles.status);
  const transcriptStyle = rs(["rs-media-player-transcript"], styles.transcript);
  const summary = rs(["rs-media-player-summary"], styles.summary);
  const shared = {
    ...media, ref: mergedRef, src, preload, controls: !hydrated, "aria-label": title,
    onPlay: () => { setPlaying(true); onPlayingChange?.(true); setStatus(""); },
    onPause: () => { setPlaying(false); onPlayingChange?.(false); },
    onEnded: () => { setPlaying(false); onPlayingChange?.(false); },
    onTimeUpdate: (event: React.SyntheticEvent<HTMLMediaElement>) => { setPosition(event.currentTarget.currentTime); onTimeChange?.(event.currentTarget.currentTime); },
    onDurationChange: (event: React.SyntheticEvent<HTMLMediaElement>) => setDuration(event.currentTarget.duration),
    onLoadedMetadata: (event: React.SyntheticEvent<HTMLMediaElement>) => { setDuration(event.currentTarget.duration); setFailed(false); setStatus(""); applyCaptions(captions); },
    onWaiting: () => setStatus("Buffering media…"),
    onCanPlay: () => setStatus(""),
    onVolumeChange: (event: React.SyntheticEvent<HTMLMediaElement>) => { setVolume(event.currentTarget.volume); setMuted(event.currentTarget.muted); },
    onRateChange: (event: React.SyntheticEvent<HTMLMediaElement>) => setSpeed(event.currentTarget.playbackRate),
    onProgress: (event: React.SyntheticEvent<HTMLMediaElement>) => { const ranges = event.currentTarget.buffered; setBuffered(ranges.length ? ranges.end(ranges.length - 1) : 0); },
    onError: () => { setFailed(true); setPlaying(false); setStatus("The media could not load. Check the connection and retry."); },
  };
  return <div ref={containerRef} role="region" aria-labelledby={headingId} {...props} className={root.className} style={{ ...root.style, ...style }}>
    <h3 {...heading} id={headingId}>{title}</h3>
    {kind === "video" ? <video {...shared} poster={poster} playsInline>{tracks.map(track => <track key={track.src} kind="captions" {...track} />)}</video> : <audio {...shared} />}
    {hydrated && <>
      <MediaScrubber value={position} duration={duration} buffered={buffered} disabled={failed} onValueChange={next => { const element = mediaRef.current; if (element && Number.isFinite(duration)) { element.currentTime = next; setPosition(next); onTimeChange?.(next); } }} />
      <div {...controls}>
        <PlaybackControls playing={playing} disabled={failed} onPlayingChange={next => { void toggle(next); }} />
        <Button {...action} variant="ghost" aria-label={muted ? "Unmute" : "Mute"} onClick={() => { if (mediaRef.current) { mediaRef.current.muted = !muted; setMuted(!muted); } }}><Icon name={muted ? "volume-off" : "volume"} /></Button>
        <div {...volumeStyle}><Slider aria-label="Volume" min={0} max={1} step={0.05} value={muted ? 0 : volume} onValueChange={next => { if (mediaRef.current) { mediaRef.current.volume = next; mediaRef.current.muted = false; setVolume(next); setMuted(false); } }} /></div>
        <NativeSelect aria-label="Playback speed" value={String(speed)} onChange={event => { const next = Number(event.target.value); if (mediaRef.current) mediaRef.current.playbackRate = next; setSpeed(next); }}>{[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => <option key={rate} value={String(rate)}>{rate}× speed</option>)}</NativeSelect>
        {kind === "video" && tracks.length > 0 && <NativeSelect aria-label="Captions" value={captions} onChange={event => { setCaptions(event.target.value); applyCaptions(event.target.value); }}><option value="-1">Captions off</option>{tracks.map((track, index) => <option key={track.src} value={String(index)}>{track.label}</option>)}</NativeSelect>}
        {kind === "video" && canFullscreen && <Button {...action} variant="ghost" aria-label="Full screen" onClick={() => { void containerRef.current?.requestFullscreen().catch(() => setStatus("Full screen is unavailable in this browser.")); }}><Icon name="expand" /></Button>}
      </div>
    </>}
    <p {...message} role="status">{status}</p>
    {failed && <Button {...action} variant="ghost" onClick={() => { setFailed(false); setStatus("Loading media…"); mediaRef.current?.load(); }}>Retry media</Button>}
    {transcript && <details {...transcriptStyle}><summary {...summary}>Transcript</summary>{transcript}</details>}
  </div>;
});
