"use client";

import { JSXPreviewPreview } from "../../previews/ai-code-tools";
import { UseField } from "../use-frame";

export function Use() {
  return <UseField name="jsx-preview"><h3 className="rs-use-type">Render registered widgets from supplied JSX</h3><div className="rs-use-body"><JSXPreviewPreview title="Generated review widget" /></div></UseField>;
}
