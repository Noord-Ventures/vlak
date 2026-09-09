"use client";

import { TestResultsPreview } from "../../previews/ai-code";
import { UseField } from "../use-frame";

export function Use() {
  return <UseField name="test-results"><h3 className="rs-use-type">Inspect failures and retry a recorded result</h3><div className="rs-use-body"><TestResultsPreview title="Draft recovery checks" /></div></UseField>;
}
