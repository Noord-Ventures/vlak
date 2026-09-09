"use client";

import { SnippetPreview } from "../../previews/ai-code";
import { UseField } from "../use-frame";

export function Use() {
  return <UseField name="snippet"><h3 className="rs-use-type">Copy an exact command</h3><div className="rs-use-body"><SnippetPreview /></div></UseField>;
}
