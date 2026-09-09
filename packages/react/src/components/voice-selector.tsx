"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { Button } from "./button";
import { Combobox } from "./combobox";

export interface VoiceOption {
  id: string;
  name: string;
  provider?: string;
  language?: string;
  description?: string;
  attributes?: readonly string[];
  previewSrc?: string;
  /** A text alternative for speech in the preview sample. */
  previewText?: string;
  disabled?: boolean;
}
export interface VoiceSelectorProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue"> {
  voices: readonly VoiceOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (voiceId: string) => void;
  label?: string;
  disabled?: boolean;
}
const styles = stylex.create({
  root: { display: "grid", gap: "0.75rem", minWidth: 0, width: "100%", color: vlak.ink },
  label: { fontSize: vlak.controlFs, fontWeight: 500, lineHeight: 1.45 },
  option: { display: "grid", gap: "0.125rem" },
  metadata: { fontSize: vlak.controlLabel, color: vlak.gray, lineHeight: 1.45 },
  detail: { padding: "0.75rem", borderWidth: vlak.hairline, borderStyle: "solid", borderColor: { default: vlak.divider, [mq.forcedColors]: "CanvasText" }, borderRadius: vlak.radiusSm, display: "grid", gap: "0.5rem" },
  message: { margin: 0, fontSize: vlak.controlLabel, color: vlak.gray, lineHeight: 1.45 },
});

/** Supplied voice metadata and optional real audio samples; provider catalogs remain application-owned. */
export const VoiceSelector = React.forwardRef<HTMLDivElement, VoiceSelectorProps>(function VoiceSelector({ voices, value, defaultValue = "", onValueChange, label = "Voice", disabled = false, className, style, ...props }, ref) {
  const [inner, setInner] = React.useState(defaultValue);
  const selected = voices.find(voice => voice.id === (value ?? inner));
  const [playing, setPlaying] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const mediaRef = React.useRef<HTMLAudioElement>(null);
  const version = React.useRef(0);
  const busy = React.useRef(false);
  const id = React.useId();
  React.useEffect(() => {
    const media = mediaRef.current;
    version.current++; busy.current = false; setPlaying(false); setPending(false); setMessage("");
    return () => { version.current++; busy.current = false; media?.pause(); };
  }, [selected?.id, selected?.previewSrc, disabled]);
  const preview = async () => {
    const media = mediaRef.current;
    if (!media || disabled || selected?.disabled || busy.current) return;
    if (playing) { media.pause(); setPlaying(false); return; }
    busy.current = true; const request = ++version.current;
    setPending(true); setMessage("");
    try { await media.play(); if (request === version.current) setPlaying(!media.paused); }
    catch { if (request === version.current) setMessage("The voice sample could not play. Try again."); }
    finally { if (request === version.current) { busy.current = false; setPending(false); } }
  };
  const root = rs(["rs-voice-selector", className], styles.root);
  const heading = rs(["rs-voice-selector-label"], styles.label);
  const option = rs(["rs-voice-selector-option"], styles.option);
  const metadata = rs(["rs-voice-selector-metadata"], styles.metadata);
  const detail = rs(["rs-voice-selector-detail"], styles.detail);
  const status = rs(["rs-voice-selector-message"], styles.message);
  return <div ref={ref} {...props} className={root.className} style={{ ...root.style, ...style }}>
    <span {...heading} id={`${id}-label`}>{label}</span>
    <Combobox value={value ?? inner} onValueChange={next => { if (value === undefined) setInner(next); onValueChange?.(next); }} aria-labelledby={`${id}-label`} placeholder="Search voices…" emptyLabel="No voices match" disabled={disabled} options={voices.map(voice => ({ value: voice.id, disabled: voice.disabled, searchText: [voice.name, voice.provider, voice.language, voice.description, ...(voice.attributes ?? [])].filter(Boolean).join(" "), label: <span {...option}><span>{voice.name}</span><span {...metadata}>{[voice.provider, voice.language, ...(voice.attributes ?? [])].filter(Boolean).join(" · ")}</span></span> }))} />
    {selected && <div {...detail}><span>{selected.name}</span>{selected.description && <p {...status}>{selected.description}</p>}<span {...metadata}>{[selected.provider, selected.language, ...(selected.attributes ?? [])].filter(Boolean).join(" · ")}</span>
      {selected.previewSrc && <>
      {/* biome-ignore lint/a11y/useMediaCaption: The supplied sample's speech alternative is rendered visibly through previewText. */}
      <audio ref={mediaRef} key={`${selected.id}:${selected.previewSrc}`} src={selected.previewSrc} preload="none" aria-label={`${selected.name} voice sample`} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} onError={() => { version.current++; busy.current = false; setPlaying(false); setPending(false); setMessage("The voice sample could not load. Try again."); }} />
      {selected.previewText && <p {...status}>{selected.previewText}</p>}
      <Button variant="subtle" size="sm" disabled={disabled || selected.disabled || pending} onClick={() => { void preview(); }}>{pending ? "Loading sample…" : playing ? "Stop sample" : "Preview voice"}</Button></>}
    </div>}
    <p {...status} role="status">{message || (voices.length === 0 ? "No voices supplied." : (value ?? inner) && !selected ? "The selected voice is unavailable. Choose another voice." : "")}</p>
  </div>;
});
