"use client";

import { SchemaDisplayPreview } from "../../previews/ai-code";
import { UseField } from "../use-frame";

export function Use() {
  return <UseField name="schema-display"><h3 className="rs-use-type">Explore a request and response schema</h3><div className="rs-use-body"><SchemaDisplayPreview /></div></UseField>;
}
