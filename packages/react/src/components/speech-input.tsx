"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../tokens.stylex";
import { rs } from "../rs";
import { Button, type ButtonProps } from "./button";

export type SpeechInputStatus = "idle" | "requesting" | "listening" | "processing" | "error" | "unsupported";
export interface SpeechInputProps extends Omit<ButtonProps, "onError"> {
  onTranscript: (text: string) => void;
  onInterimTranscript?: (text: string) => void;
  onAudioRecorded?: (audio: Blob, context: { signal: AbortSignal }) => Promise<string>;
  onStatusChange?: (status: SpeechInputStatus) => void;
  onError?: (error: Error) => void;
  mode?: "auto" | "recognition" | "recording";
  deviceId?: string;
  lang?: string;
  /** Stops and processes a recording after this many seconds. Defaults to 120. */
  maxDuration?: number;
}
interface RecognitionResult { isFinal: boolean; length: number; [index: number]: { transcript: string } }
interface Recognition {
  continuous: boolean; interimResults: boolean; lang: string;
  onstart: (() => void) | null; onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onresult: ((event: { resultIndex: number; results: { length: number; [index: number]: RecognitionResult } }) => void) | null;
  start(): void; stop(): void; abort(): void;
}
interface SpeechSession {
  id: number; abort: AbortController; stream?: MediaStream; recorder?: MediaRecorder;
  recognition?: Recognition; timer?: ReturnType<typeof setTimeout>; chunks: Blob[];
}
const styles = stylex.create({
  root: { display: "inline-flex", flexDirection: "column", alignItems: "start", minWidth: 0, maxWidth: "100%", color: vlak.ink },
  message: { margin: 0, marginBlockStart: { default: "0.5rem", ":empty": 0 }, fontSize: vlak.controlLabel, color: vlak.gray, lineHeight: 1.45, maxWidth: "48ch" },
  icon: { width: "1.125rem", height: "1.125rem", flexShrink: 0 },
});

function recognitionConstructor() {
  const browser = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
  return browser.SpeechRecognition ?? browser.webkitSpeechRecognition;
}
function release(session: SpeechSession) {
  clearTimeout(session.timer);
  session.abort.abort();
  if (session.recognition) {
    session.recognition.onstart = null; session.recognition.onresult = null; session.recognition.onend = null; session.recognition.onerror = null;
    try { session.recognition.abort(); } catch { /* Already stopped. */ }
  }
  if (session.recorder) {
    session.recorder.ondataavailable = null; session.recorder.onstop = null; session.recorder.onerror = null;
    if (session.recorder.state !== "inactive") { try { session.recorder.stop(); } catch { /* Already stopped. */ } }
  }
  session.stream?.getTracks().forEach(track => { track.stop(); });
}

/** User-activated speech capture with an application-owned transcription fallback. */
export const SpeechInput = React.forwardRef<HTMLButtonElement, SpeechInputProps>(function SpeechInput({ onTranscript, onInterimTranscript, onAudioRecorded, onStatusChange, onError, mode = "auto", deviceId, lang = "en-US", maxDuration = 120, disabled = false, children, className, style, onClick, "aria-label": ariaLabel, "aria-describedby": describedBy, ...props }, ref) {
  const [status, setStatus] = React.useState<SpeechInputStatus>("idle");
  const [message, setMessage] = React.useState("");
  const [available, setAvailable] = React.useState(false);
  const sessionRef = React.useRef<SpeechSession | null>(null);
  const sequence = React.useRef(0);
  const mounted = React.useRef(false);
  const state = React.useRef<SpeechInputStatus>("idle");
  const callbacks = React.useRef({ onTranscript, onInterimTranscript, onAudioRecorded, onStatusChange, onError });
  callbacks.current = { onTranscript, onInterimTranscript, onAudioRecorded, onStatusChange, onError };
  const id = React.useId();
  const transition = React.useCallback((next: SpeechInputStatus, text = "") => {
    if (!mounted.current) return;
    state.current = next; setStatus(next); setMessage(text); callbacks.current.onStatusChange?.(next);
  }, []);
  const current = (session: SpeechSession) => mounted.current && sessionRef.current === session && !session.abort.signal.aborted;
  const finish = (session: SpeechSession, next: SpeechInputStatus = "idle", text = "") => {
    if (!current(session)) return;
    sessionRef.current = null; release(session); transition(next, text);
  };
  const fail = (session: SpeechSession, reason: unknown) => {
    if (!current(session)) return;
    const error = reason instanceof Error ? reason : new Error(String(reason));
    finish(session, "error", error.name === "NotAllowedError" ? "Microphone permission was denied. Allow access and try again." : error.message || "Speech input failed. Try again.");
    callbacks.current.onError?.(error);
  };
  const hasRecorderCallback = Boolean(onAudioRecorded);
  // A capture configuration change cancels its previous session; callback identities do not.
  // biome-ignore lint/correctness/useExhaustiveDependencies: deviceId, lang and disabled invalidate owned capture resources.
  React.useEffect(() => {
    mounted.current = true;
    const recording = typeof MediaRecorder === "function" && typeof navigator.mediaDevices?.getUserMedia === "function" && hasRecorderCallback;
    const recognition = Boolean(recognitionConstructor());
    const supported = mode === "recording" ? recording : mode === "recognition" ? recognition : recognition || recording;
    setAvailable(supported);
    transition(supported ? "idle" : "unsupported", supported ? "" : "Speech input is unavailable. This browser needs an application transcription service.");
    return () => { mounted.current = false; const session = sessionRef.current; sessionRef.current = null; if (session) release(session); };
  }, [mode, deviceId, lang, disabled, hasRecorderCallback, transition]);

  const stopRecording = (session: SpeechSession) => {
    if (!current(session)) return;
    clearTimeout(session.timer);
    transition("processing", "Transcribing recording…");
    try { session.recorder?.stop(); session.stream?.getTracks().forEach(track => { track.stop(); }); }
    catch (reason) { fail(session, reason); }
  };
  const activate = async () => {
    const existing = sessionRef.current;
    if (existing) {
      if (state.current === "requesting" || state.current === "processing") { finish(existing, "idle", "Speech input canceled."); return; }
      if (existing.recognition) {
        clearTimeout(existing.timer); transition("processing", "Finishing speech…");
        try { existing.recognition.stop(); } catch (reason) { fail(existing, reason); }
      } else stopRecording(existing);
      return;
    }
    if (!available || disabled) return;
    const session: SpeechSession = { id: ++sequence.current, abort: new AbortController(), chunks: [] };
    sessionRef.current = session; transition("requesting", "Waiting for microphone…");
    const duration = Number.isFinite(maxDuration) && maxDuration > 0 ? Math.min(maxDuration, 3600) : 120;
    try {
      const Constructor = recognitionConstructor();
      const recordingPreferred = mode === "recording" || (mode === "auto" && deviceId && callbacks.current.onAudioRecorded);
      if (Constructor && !recordingPreferred) {
        const recognition = new Constructor(); session.recognition = recognition;
        recognition.lang = lang; recognition.continuous = true; recognition.interimResults = true;
        recognition.onstart = () => { if (current(session)) transition("listening", "Listening…"); };
        recognition.onresult = event => {
          if (!current(session)) return;
          let final = ""; let interim = "";
          for (let index = event.resultIndex; index < event.results.length; index++) {
            const result = event.results[index]; if (!result?.[0]) continue;
            if (result.isFinal) final += result[0].transcript; else interim += result[0].transcript;
          }
          if (final.trim()) callbacks.current.onTranscript(final.trim());
          callbacks.current.onInterimTranscript?.(interim);
        };
        recognition.onend = () => finish(session, "idle", "Speech input stopped.");
        recognition.onerror = event => fail(session, new Error(event.error === "not-allowed" ? "Microphone permission was denied. Allow access and try again." : `Speech recognition stopped: ${event.error}. Try again.`));
        recognition.start();
        session.timer = setTimeout(() => { if (current(session)) { transition("processing", "Finishing speech…"); try { recognition.stop(); } catch (reason) { fail(session, reason); } } }, duration * 1000);
      } else {
        if (!callbacks.current.onAudioRecorded) throw new Error("An application transcription service is required for recording.");
        const stream = await navigator.mediaDevices.getUserMedia({ audio: deviceId ? { deviceId: { exact: deviceId } } : true });
        session.stream = stream;
        if (!current(session)) { stream.getTracks().forEach(track => { track.stop(); }); return; }
        const mimeType = ["audio/webm;codecs=opus", "audio/mp4", "audio/webm"].find(type => typeof MediaRecorder.isTypeSupported === "function" && MediaRecorder.isTypeSupported(type));
        const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined); session.recorder = recorder;
        recorder.ondataavailable = event => { if (current(session) && event.data.size) session.chunks.push(event.data); };
        recorder.onerror = () => fail(session, new Error("The microphone recording failed. Try again."));
        recorder.onstop = async () => {
          if (!current(session)) return;
          clearTimeout(session.timer); stream.getTracks().forEach(track => { track.stop(); });
          transition("processing", "Transcribing recording…");
          try {
            const blob = new Blob(session.chunks, { type: recorder.mimeType || session.chunks[0]?.type || "" });
            if (!blob.size) throw new Error("No audio was recorded. Try again.");
            const text = await callbacks.current.onAudioRecorded!(blob, { signal: session.abort.signal });
            if (!current(session)) return;
            if (text.trim()) callbacks.current.onTranscript(text.trim());
            finish(session, "idle", text.trim() ? "Transcript ready." : "No speech was detected. Try again.");
          } catch (reason) { fail(session, reason); }
        };
        recorder.start(); transition("listening", "Recording…");
        session.timer = setTimeout(() => stopRecording(session), duration * 1000);
      }
    } catch (reason) { fail(session, reason); }
  };
  const root = rs(["rs-speech-input"], styles.root);
  const feedback = rs(["rs-speech-input-message"], styles.message);
  const icon = rs(["rs-speech-input-icon"], styles.icon);
  const active = status === "listening" || status === "requesting" || status === "processing";
  const label = status === "requesting" || status === "processing" ? "Cancel speech input" : status === "listening" ? "Stop speech input" : "Start speech input";
  return <span {...root}><Button variant="subtle" {...props} ref={ref} className={className} style={style} disabled={disabled || !available} aria-label={ariaLabel ?? label} aria-describedby={[describedBy, `${id}-status`].filter(Boolean).join(" ")} aria-pressed={active} onClick={event => { onClick?.(event); if (!event.defaultPrevented) void activate(); }}>
    <svg {...icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">{active ? <rect x="6" y="6" width="12" height="12" rx="1" /> : <><rect x="8" y="2" width="8" height="14" rx="4" /><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8" /></>}</svg>{children ?? label}
  </Button><span {...feedback} id={`${id}-status`} role="status">{message}</span></span>;
});
