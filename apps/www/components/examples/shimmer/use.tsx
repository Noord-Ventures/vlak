"use client";
import { aiWorkPatternPreviews } from "../../previews/ai-work-patterns";
import { UseField } from "../use-frame";
const Example = aiWorkPatternPreviews["shimmer"]!;
export function Use() { return <UseField name="shimmer"><h3 className="rs-use-type">Indicate activity</h3><div className="rs-use-body"><Example /></div></UseField>; }
