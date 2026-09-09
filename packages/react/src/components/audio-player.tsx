"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { useMergedRefs } from "../merge-refs";
import { Button } from "./button";
import { ButtonGroup } from "./button-group";
import { Slider } from "./slider";
import { MediaScrubber } from "./media-scrubber";
import { Icon } from "./icon";

export interface GeneratedSpeechAudio { base64: string; mediaType: string }
export interface AudioPlayerProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  src?: string;
  data?: GeneratedSpeechAudio;
  transcript?: React.ReactNode;
  preload?: "none" | "metadata" | "auto";
  onTimeChange?: (seconds: number) => void;
  onPlayingChange?: (playing: boolean) => void;
}
export interface AudioPlayerState {
  playing: boolean; pending: boolean; currentTime: number; duration: number;
  volume: number; muted: boolean; error: string;
  play: () => Promise<void>; pause: () => void; seek: (seconds: number) => void;
  setVolume: (volume: number) => void; toggleMute: () => void; retry: () => void;
}
export interface AudioPlayerControlsProps extends React.HTMLAttributes<HTMLDivElement> { seekOffset?: number; disabled?: boolean }
const AudioPlayerContext = React.createContext<AudioPlayerState | null>(null);

/** Access the native media controller from controls nested inside AudioPlayer. */
export function useAudioPlayer(): AudioPlayerState {
  const context = React.useContext(AudioPlayerContext);
  if (!context) throw new Error("useAudioPlayer must be used inside AudioPlayer.");
  return context;
}
const styles = stylex.create({
  root: { display: "grid", gap: "0.75rem", width: "100%", minWidth: 0, padding: "0.75rem", boxSizing: "border-box", color: vlak.ink, borderWidth: vlak.hairline, borderStyle: "solid", borderColor: { default: vlak.divider, [mq.forcedColors]: "CanvasText" }, borderRadius: vlak.radiusSm },
  heading: { margin: 0, fontSize: vlak.controlFs, lineHeight: 1.45, fontWeight: 500 },
  controls: { display: "grid", gap: "0.75rem", minWidth: 0 },
  row: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" },
  volume: { flex: "1 1 6rem", minWidth: "4rem", maxWidth: "10rem" },
  status: { margin: 0, fontSize: vlak.controlLabel, color: vlak.gray, lineHeight: 1.45 },
  transcript: { fontSize: vlak.controlFs, lineHeight: 1.45, maxWidth: "66ch" },
});

/** Native audio for URLs or generated speech, with replaceable controls and explicit media ownership. */
export const AudioPlayer = React.forwardRef<HTMLAudioElement, AudioPlayerProps>(function AudioPlayer({ title, src, data, transcript, preload = "metadata", onTimeChange, onPlayingChange, children, className, style, ...props }, ref) {
  const validData = data && /^audio\/[a-z0-9.+-]+$/i.test(data.mediaType) && /^[a-z0-9+/=\s]+$/i.test(data.base64);
  const source = src ?? (validData ? `data:${data.mediaType};base64,${data.base64.replace(/\s/g, "")}` : "");
  const mediaRef = React.useRef<HTMLAudioElement>(null);
  const mergedRef = useMergedRefs(mediaRef, ref);
  const [playing, setPlaying] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [volume, setVolumeState] = React.useState(1);
  const [muted, setMuted] = React.useState(false);
  const [error, setError] = React.useState("");
  const [hydrated, setHydrated] = React.useState(false);
  const version = React.useRef(0); const busy = React.useRef(false);
  const callbacks = React.useRef({ onTimeChange, onPlayingChange }); callbacks.current = { onTimeChange, onPlayingChange };
  const id = React.useId();
  React.useEffect(() => {
    const media = mediaRef.current; version.current++; busy.current = false;
    // Cached/data audio can finish loading before hydration installs the native event handlers.
    // Read the element first so switching to custom controls preserves its ready metadata.
    setHydrated(true); setPlaying(media ? !media.paused && !media.ended : false); setPending(false);
    setCurrentTime(media && Number.isFinite(media.currentTime) ? media.currentTime : 0);
    setDuration(media && Number.isFinite(media.duration) ? media.duration : 0);
    setVolumeState(media?.volume ?? 1); setMuted(media?.muted ?? false);
    setError(source ? media?.error ? "Audio could not load. Retry the source." : "" : "Supply an audio address or valid generated speech data.");
    return () => { version.current++; busy.current = false; media?.pause(); };
  }, [source]);
  const play = async () => {
    const media = mediaRef.current; if (!media || !source || busy.current) return;
    busy.current = true; const request = ++version.current; setPending(true); setError("");
    try { await media.play(); }
    catch { if (request === version.current) setError("Audio could not play. Try again."); }
    finally { if (request === version.current) { busy.current = false; setPending(false); } }
  };
  const pause = () => { version.current++; busy.current = false; setPending(false); mediaRef.current?.pause(); };
  const seek = (seconds: number) => {
    const media = mediaRef.current;
    if (!media || !Number.isFinite(seconds) || !Number.isFinite(media.duration) || media.duration <= 0) return;
    const next = Math.min(media.duration, Math.max(0, seconds)); media.currentTime = next; setCurrentTime(next); callbacks.current.onTimeChange?.(next);
  };
  const setVolume = (next: number) => { if (mediaRef.current && Number.isFinite(next)) { mediaRef.current.volume = Math.max(0, Math.min(1, next)); mediaRef.current.muted = false; setVolumeState(mediaRef.current.volume); setMuted(false); } };
  const toggleMute = () => { if (mediaRef.current) { mediaRef.current.muted = !mediaRef.current.muted; setMuted(mediaRef.current.muted); } };
  const retry = () => { setError(""); mediaRef.current?.load(); };
  const root = rs(["rs-audio-player", className], styles.root);
  const heading = rs(["rs-audio-player-heading"], styles.heading);
  const status = rs(["rs-audio-player-status"], styles.status);
  const transcriptStyle = rs(["rs-audio-player-transcript"], styles.transcript);
  const state = { playing, pending, currentTime, duration, volume, muted, error, play, pause, seek, setVolume, toggleMute, retry };
  return <AudioPlayerContext.Provider value={state}><div {...props} role="region" aria-labelledby={id} className={root.className} style={{ ...root.style, ...style }}>
    <h3 {...heading} id={id}>{title}</h3>
    {/* biome-ignore lint/a11y/useMediaCaption: Audio speech has a visible application-supplied transcript slot below the controls. */}
    <audio key={source} ref={mergedRef} src={source || undefined} preload={preload} controls={!hydrated} aria-label={title}
      onPlay={() => { setPlaying(true); callbacks.current.onPlayingChange?.(true); }} onPause={() => { setPlaying(false); callbacks.current.onPlayingChange?.(false); }} onEnded={() => { setPlaying(false); callbacks.current.onPlayingChange?.(false); }}
      onTimeUpdate={event => { setCurrentTime(event.currentTarget.currentTime); callbacks.current.onTimeChange?.(event.currentTarget.currentTime); }}
      onDurationChange={event => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)}
      onLoadedMetadata={event => { setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0); setError(""); }}
      onVolumeChange={event => { setVolumeState(event.currentTarget.volume); setMuted(event.currentTarget.muted); }}
      onError={() => { version.current++; busy.current = false; setPending(false); setPlaying(false); callbacks.current.onPlayingChange?.(false); setError("Audio could not load. Retry the source."); }} />
    {hydrated && (children ?? <AudioPlayerControls disabled={!source} />)}
    <p {...status} role="status">{error}</p>
    {error && source && <Button variant="subtle" size="sm" onClick={retry}>Retry audio</Button>}
    {transcript && <div {...transcriptStyle}>{transcript}</div>}
  </div></AudioPlayerContext.Provider>;
});

/** Default transport, bounded skip seeking and volume; replace or compose with useAudioPlayer. */
export const AudioPlayerControls = React.forwardRef<HTMLDivElement, AudioPlayerControlsProps>(function AudioPlayerControls({ seekOffset = 10, disabled = false, className, style, ...props }, ref) {
  const audio = useAudioPlayer();
  const offset = Number.isFinite(seekOffset) && seekOffset > 0 ? seekOffset : 10;
  const root = rs(["rs-audio-player-controls", className], styles.controls);
  const row = rs(["rs-audio-player-row"], styles.row);
  const volume = rs(["rs-audio-player-volume"], styles.volume);
  return <div {...props} ref={ref} className={root.className} style={{ ...root.style, ...style }}>
    <MediaScrubber value={audio.currentTime} duration={audio.duration} onValueChange={audio.seek} disabled={disabled || audio.duration <= 0} />
    <div {...row}><ButtonGroup aria-label="Audio playback">
      <Button variant="subtle" size="icon" aria-label={`Back ${offset} seconds`} disabled={disabled || audio.duration <= 0 || audio.currentTime <= 0} onClick={() => audio.seek(audio.currentTime - offset)}><Icon name="skip-back" /></Button>
      <Button variant="subtle" size="icon" aria-label={audio.playing ? "Pause audio" : "Play audio"} disabled={disabled || audio.pending} onClick={() => { if (audio.playing) audio.pause(); else void audio.play(); }}><Icon name={audio.playing ? "pause" : "play"} /></Button>
      <Button variant="subtle" size="icon" aria-label={`Forward ${offset} seconds`} disabled={disabled || audio.duration <= 0 || audio.currentTime >= audio.duration} onClick={() => audio.seek(audio.currentTime + offset)}><Icon name="skip-forward" /></Button>
    </ButtonGroup>
    <Button variant="subtle" size="icon" aria-label={audio.muted ? "Unmute audio" : "Mute audio"} disabled={disabled} onClick={audio.toggleMute}><Icon name={audio.muted ? "volume-off" : "volume"} /></Button>
    <div {...volume}><Slider aria-label="Audio volume" min={0} max={1} step={0.05} value={audio.muted ? 0 : audio.volume} onValueChange={audio.setVolume} disabled={disabled} /></div></div>
  </div>;
});
