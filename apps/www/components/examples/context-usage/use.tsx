"use client";

import { ContextUsagePreview } from "../../previews/ai-chat-controls";
import { UseField, UseType, UseBody } from "../use-frame";

export function Use() {
  return <UseField name="context-usage"><UseType>Read the supplied context budget</UseType><UseBody><div className="rs-use-stack" style={{ gap: 24 }}><ContextUsagePreview /><p className="rs-use-copy">Token usage and limits come from the application. Optional prices are supplied per million tokens; cached input and reasoning remain subsets of input and output. Unknown counts and rates stay unavailable.</p></div></UseBody></UseField>;
}
