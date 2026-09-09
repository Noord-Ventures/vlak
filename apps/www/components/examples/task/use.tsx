"use client";
import { aiWorkPatternPreviews } from "../../previews/ai-work-patterns";
import { UseField } from "../use-frame";
const Example = aiWorkPatternPreviews["task"]!;
export function Use() { return <UseField name="task"><h3 className="rs-use-type">Inspect task progress</h3><div className="rs-use-body"><Example /></div></UseField>; }
