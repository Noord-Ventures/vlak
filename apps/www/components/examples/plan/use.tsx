"use client";
import { aiWorkPatternPreviews } from "../../previews/ai-work-patterns";
import { UseField } from "../use-frame";
const Example = aiWorkPatternPreviews["plan"]!;
export function Use() { return <UseField name="plan"><h3 className="rs-use-type">Approve a proposed review</h3><div className="rs-use-body"><Example /></div></UseField>; }
