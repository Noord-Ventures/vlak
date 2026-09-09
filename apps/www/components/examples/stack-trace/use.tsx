"use client";

import { StackTracePreview } from "../../previews/ai-code-tools";
import { UseField } from "../use-frame";

export function Use() {
  return <UseField name="stack-trace"><h3 className="rs-use-type">Inspect parsed frames and file locations</h3><div className="rs-use-body"><StackTracePreview /></div></UseField>;
}
