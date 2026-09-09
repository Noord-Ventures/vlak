"use client";

import { EnvironmentVariablesPreview } from "../../previews/ai-code";
import { UseField } from "../use-frame";

export function Use() {
  return <UseField name="environment-variables"><h3 className="rs-use-type">Reveal and copy selected values</h3><div className="rs-use-body"><EnvironmentVariablesPreview title="Workspace model configuration" /></div></UseField>;
}
