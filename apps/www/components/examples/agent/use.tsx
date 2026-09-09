"use client";

import { AgentPreview } from "../../previews/ai-code";
import { UseField } from "../use-frame";

export function Use() {
  return <UseField name="agent"><h3 className="rs-use-type">Inspect model, instructions and tool schemas</h3><div className="rs-use-body"><AgentPreview /></div></UseField>;
}
