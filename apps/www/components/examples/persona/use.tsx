"use client";

import { PersonaPreview } from "../../previews/ai-voice";
import { UseField, UseType, UseBody } from "../use-frame";

export function Use() {
  return <UseField name="persona"><UseType>Show the assistant’s current state</UseType><UseBody><div className="rs-use-stack" style={{ gap: 24 }}><PersonaPreview /><p className="rs-use-copy">The native monochrome visual represents idle, listening, thinking, speaking, and asleep states. It respects reduced motion and visibility. Supply children for an application-owned visual such as the original monochrome orb avatar.</p></div></UseBody></UseField>;
}
