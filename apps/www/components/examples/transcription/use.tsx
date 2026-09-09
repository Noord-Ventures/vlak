"use client";

import { TranscriptionPreview } from "../../previews/ai-voice";
import { UseField, UseType, UseBody } from "../use-frame";

export function Use() {
  return <UseField name="transcription"><UseType>Navigate timed speech</UseType><UseBody><div className="rs-use-stack" style={{ gap: 24 }}><TranscriptionPreview label="Review conversation transcript" /><p className="rs-use-copy">Each phrase has a supplied timestamp and optional speaker. This example updates a local position when selected. Connect onSeek to a media element and currentTime to playback to synchronize a real transcript.</p></div></UseBody></UseField>;
}
