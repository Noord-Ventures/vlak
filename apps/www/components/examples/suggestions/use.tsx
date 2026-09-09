"use client";
import { aiWorkPatternPreviews } from "../../previews/ai-work-patterns";
import { UseField } from "../use-frame";
const Example = aiWorkPatternPreviews["suggestions"]!;
export function Use() { return <UseField name="suggestions"><h3 className="rs-use-type">Choose a prompt</h3><div className="rs-use-body"><Example /></div></UseField>; }
