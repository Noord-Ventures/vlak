"use client";

import { CommitPreview } from "../../previews/ai-code";
import { UseField } from "../use-frame";

export function Use() {
  return <UseField name="commit"><h3 className="rs-use-type">Inspect changed files and copy the commit</h3><div className="rs-use-body"><CommitPreview /></div></UseField>;
}
