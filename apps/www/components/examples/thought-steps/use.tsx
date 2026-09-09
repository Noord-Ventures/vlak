"use client";
import { aiWorkPatternPreviews } from "../../previews/ai-work-patterns";
import { UseField } from "../use-frame";
const Example = aiWorkPatternPreviews["thought-steps"]!;
export function Use() { return <UseField name="thought-steps"><h3 className="rs-use-type">Inspect the supplied evidence</h3><div className="rs-use-body"><Example /></div></UseField>; }
