"use client";

import { ModelSelectorPreview } from "../../previews/ai-chat-controls";
import { UseField, UseType, UseBody } from "../use-frame";

export function Use() {
  return <UseField name="model-selector"><UseType>Choose a model from your catalog</UseType><UseBody><div className="rs-use-stack" style={{ gap: 24 }}><ModelSelectorPreview /><p className="rs-use-copy">Search names, providers, and capabilities in this example catalog. Selecting a model changes local state. The application supplies current model availability, context limits, and price labels.</p></div></UseBody></UseField>;
}
