"use client";

import { SpeechInputPreview } from "../../previews/ai-voice";
import { UseField, UseType, UseBody } from "../use-frame";

export function Use() {
  return <UseField name="speech-input"><UseType>Add text by speaking</UseType><UseBody><div className="rs-use-stack" style={{ gap: 24 }}><SpeechInputPreview /><p className="rs-use-copy">Activate speech input to use this browser’s recognition when available. Final text stays in this example. Applications can provide onAudioRecorded to transcribe a recording in browsers that need a fallback.</p></div></UseBody></UseField>;
}
