"use client";

import { WebPreviewPreview } from "../../previews/ai-code-tools";
import { UseField } from "../use-frame";

export function Use() {
  return <UseField name="web-preview"><h3 className="rs-use-type">Navigate a local page preview</h3><div className="rs-use-body"><WebPreviewPreview title="Calendar navigation example" /></div></UseField>;
}
