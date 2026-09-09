"use client";

import { ArtifactPreview } from "../../previews/ai-code";
import { UseField } from "../use-frame";

export function Use() {
  return <UseField name="artifact"><h3 className="rs-use-type">Review and revise a generated draft</h3><div className="rs-use-body"><ArtifactPreview title="Draft review notes" /></div></UseField>;
}
