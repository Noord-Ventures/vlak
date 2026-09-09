"use client";

import { TerminalPreview } from "../../previews/ai-code-tools";
import { UseField } from "../use-frame";

export function Use() {
  return <UseField name="terminal"><h3 className="rs-use-type">Follow recorded console output</h3><div className="rs-use-body"><TerminalPreview title="Recorded composer checks" /></div></UseField>;
}
