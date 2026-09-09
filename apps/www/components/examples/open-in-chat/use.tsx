"use client";

import { OpenInChatPreview } from "../../previews/ai-chat-controls";
import { UseField, UseType, UseBody } from "../use-frame";

export function Use() {
  return <UseField name="open-in-chat"><UseType>Continue with another provider</UseType><UseBody><div className="rs-use-stack" style={{ gap: 24 }}><OpenInChatPreview /><p className="rs-use-copy">Choose a provider link to open this example prompt in a new tab. Rendering the component does not contact the provider or submit a conversation. The destination application controls what happens next.</p></div></UseBody></UseField>;
}
