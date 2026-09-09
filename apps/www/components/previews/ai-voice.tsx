"use client";

import { useState, type ComponentType } from "react";
import { AudioPlayer, AudioPlayerControls, Button, ButtonGroup, MicSelector, Persona, SpeechInput, Transcription, VoiceSelector, type PersonaState, type SpeechInputStatus } from "@noorddev/vlak-react";

function toneAudio() {
  const rate = 8000; const samples = rate * 8;
  const buffer = new ArrayBuffer(44 + samples); const view = new DataView(buffer); const bytes = new Uint8Array(buffer);
  const word = (at: number, text: string) => { for (let index = 0; index < text.length; index++) bytes[at + index] = text.charCodeAt(index); };
  word(0, "RIFF"); view.setUint32(4, samples + 36, true); word(8, "WAVE"); word(12, "fmt "); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true); view.setUint32(24, rate, true); view.setUint32(28, rate, true); view.setUint16(32, 1, true); view.setUint16(34, 8, true); word(36, "data"); view.setUint32(40, samples, true);
  for (let index = 0; index < samples; index++) { const time = index / rate; bytes[44 + index] = Math.round(128 + Math.sin(2 * Math.PI * (time < 4 ? 220 : 330) * time) * 14 * Math.min(1, time * 4, (8 - time) * 4)); }
  return { base64: btoa(Array.from(bytes, byte => String.fromCharCode(byte)).join("")), mediaType: "audio/wav" };
}
export function AudioPlayerPreview({ title = "Two tones" }: { title?: string } = {}) {
  const [data] = useState(toneAudio);
  return <AudioPlayer title={title} data={data} transcript="Eight seconds: a low tone followed by a higher tone. No speech."><AudioPlayerControls seekOffset={3} /></AudioPlayer>;
}
export function SpeechInputPreview() {
  const [text, setText] = useState(""); const [status, setStatus] = useState<SpeechInputStatus>("idle");
  return <div style={{ display: "grid", gap: 24, width: "100%" }}><div style={{ display: "flex", alignItems: "start", gap: 12 }}><span style={{ display: "grid", placeItems: "center", height: 44, width: 28, flexShrink: 0 }}><Persona size={28} state={status === "listening" ? "listening" : status === "processing" ? "thinking" : "idle"} /></span><SpeechInput onTranscript={next => setText(current => `${current} ${next}`.trim())} onStatusChange={setStatus} /></div><p style={{ margin: 0 }}>{text || "Final speech appears here. Nothing is sent to a conversation."}</p></div>;
}
export function MicSelectorPreview() { return <MicSelector />; }
export function VoiceSelectorPreview() {
  return <VoiceSelector defaultValue="mina" voices={[{ id: "mina", name: "Mina", provider: "Example provider", language: "English", attributes: ["Warm", "Measured"], description: "A supplied catalog entry for a calm reading voice." }, { id: "noor", name: "Noor", provider: "Example provider", language: "Dutch", attributes: ["Clear"], description: "A supplied catalog entry for concise instructions." }, { id: "alex", name: "Alex", provider: "Example provider", language: "English", attributes: ["Bright"], description: "A supplied catalog entry for conversational replies." }]} />;
}
export function TranscriptionPreview({ label = "Brief transcript" }: { label?: string } = {}) {
  const [time, setTime] = useState(0);
  return <div style={{ display: "grid", gap: 24, width: "100%" }}><Transcription label={label} currentTime={time} onSeek={setTime} segments={[{ id: "start", startSecond: 0, endSecond: 4, speaker: "Mina", text: "The brief is ready for review." }, { id: "next", startSecond: 4, endSecond: 8, speaker: "Noor", text: "Each decision has an owner and a next step." }, { id: "finish", startSecond: 8, endSecond: 12, speaker: "Mina", text: "We can share the draft when everyone has reviewed it." }]} /><span>Selected position: {time}s · Transcript data example</span></div>;
}
export function PersonaPreview() {
  const [state, setState] = useState<PersonaState>("idle");
  return <div style={{ display: "grid", gap: 24, width: "100%", justifyItems: "start" }}><Persona state={state} label="Assistant" /><ButtonGroup aria-label="Persona state" style={{ display: "flex", flexWrap: "wrap" }}>{(["idle", "listening", "thinking", "speaking", "asleep"] as const).map(value => <Button key={value} variant="subtle" size="sm" aria-pressed={state === value} onClick={() => setState(value)}>{value.charAt(0).toUpperCase() + value.slice(1)}</Button>)}</ButtonGroup></div>;
}
export const aiVoicePreviews: Record<string, ComponentType> = {
  "audio-player": AudioPlayerPreview,
  "mic-selector": MicSelectorPreview,
  "speech-input": SpeechInputPreview,
  "voice-selector": VoiceSelectorPreview,
  transcription: TranscriptionPreview,
  persona: PersonaPreview
};
