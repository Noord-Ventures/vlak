"use client";

import { SourcesPreview } from "../../previews/ai-chat-controls";
import { UseField, UseType, UseBody } from "../use-frame";

export function Use() {
  return <UseField name="sources"><UseType>Keep references beside the answer</UseType><UseBody><div className="rs-use-stack" style={{ gap: 24 }}><SourcesPreview /><p className="rs-use-copy">A native disclosure counts the supplied references and presents their descriptions and quotes. These example.com links are illustrative source records.</p></div></UseBody></UseField>;
}
