"use client";

import { VoiceSelectorPreview } from "../../previews/ai-voice";
import { UseField, UseType, UseBody } from "../use-frame";

export function Use() {
  return <UseField name="voice-selector"><UseType>Choose from a supplied voice catalog</UseType><UseBody><div className="rs-use-stack" style={{ gap: 24 }}><VoiceSelectorPreview /><p className="rs-use-copy">Search names, languages, and metadata in this example catalog. The application supplies its provider’s voices. A previewSrc and previewText enable a real sample with a readable text alternative; selection alone does not generate speech.</p></div></UseBody></UseField>;
}
