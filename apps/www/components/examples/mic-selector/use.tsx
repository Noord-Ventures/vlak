"use client";

import { MicSelectorPreview } from "../../previews/ai-voice";
import { UseField, UseType, UseBody } from "../use-frame";

export function Use() {
  return <UseField name="mic-selector"><UseType>Choose an audio input</UseType><UseBody><div className="rs-use-stack" style={{ gap: 24 }}><MicSelectorPreview /><p className="rs-use-copy">Inputs are discovered without starting a recording. Allow microphone access reveals available device names, then releases the temporary stream. The application owns how the selected input is used.</p></div></UseBody></UseField>;
}
