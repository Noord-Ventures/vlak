"use client";
import { useState } from "react";
import { MediaPlayer } from "@noorddev/vlak-react";
import { UseField, UseType, UseBody } from "../use-frame";
function makeAudio() {
  const rate = 8000, samples = rate * 8;
  const buffer = new ArrayBuffer(44 + samples);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);
  const word = (at: number, value: string) => { for (let i = 0; i < value.length; i++) bytes[at + i] = value.charCodeAt(i); };
  word(0, "RIFF"); view.setUint32(4, samples + 36, true); word(8, "WAVE"); word(12, "fmt ");
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, rate, true); view.setUint32(28, rate, true); view.setUint16(32, 1, true); view.setUint16(34, 8, true);
  word(36, "data"); view.setUint32(40, samples, true);
  for (let i = 0; i < samples; i++) {
    const t = i / rate, envelope = Math.min(1, t * 4, (8 - t) * 4);
    bytes[44 + i] = Math.round(128 + Math.sin(2 * Math.PI * (Math.floor(t / 2) % 2 ? 330 : 220) * t) * 14 * envelope);
  }
  return "data:audio/wav;base64," + btoa(Array.from(bytes, byte => String.fromCharCode(byte)).join(""));
}
export function Use() {
  const [src] = useState(makeAudio);
  return <UseField name="media-player"><UseType>Listen</UseType><UseBody><MediaPlayer kind="audio" src={src} title="Two tones" transcript={<p>An eight-second sequence of alternating low and high tones. No speech.</p>} /></UseBody></UseField>;
}
