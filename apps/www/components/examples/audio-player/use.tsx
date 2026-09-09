"use client";

import { AudioPlayerPreview } from "../../previews/ai-voice";
import { UseField, UseType, UseBody } from "../use-frame";

export function Use() {
  return <UseField name="audio-player"><UseType>Compose audio playback</UseType><UseBody><div className="rs-use-stack" style={{ gap: 24 }}><AudioPlayerPreview title="Generated audio playback" /><p className="rs-use-copy">This example plays a local eight-second tone file through the same base64 and mediaType adapter used for generated speech. Supply a transcript for spoken content. Replace the controls through useAudioPlayer when the surrounding interface needs a different composition.</p></div></UseBody></UseField>;
}
