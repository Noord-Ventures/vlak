"use client";

import { InlineCitationPreview } from "../../previews/ai-chat-controls";
import { UseField, UseType, UseBody } from "../use-frame";

export function Use() {
  return <UseField name="inline-citation"><UseType>Inspect the sources behind a claim</UseType><UseBody><div className="rs-use-stack" style={{ gap: 24 }}><InlineCitationPreview /><p className="rs-use-copy">Open the quiet source trigger, then move between references with the arrow buttons or keyboard. The dialog shows its position, a description, and the supplied quote. Escape returns to the claim.</p></div></UseBody></UseField>;
}
