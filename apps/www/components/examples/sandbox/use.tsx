"use client";

import { SandboxPreview } from "../../previews/ai-code-tools";
import { UseField } from "../use-frame";

export function Use() {
  return <UseField name="sandbox"><h3 className="rs-use-type">Compare supplied code and output</h3><div className="rs-use-body"><SandboxPreview /></div></UseField>;
}
