"use client";
import { aiWorkPatternPreviews } from "../../previews/ai-work-patterns";
import { UseField } from "../use-frame";
const Example = aiWorkPatternPreviews["checkpoint"]!;
export function Use() { return <UseField name="checkpoint"><h3 className="rs-use-type">Restore a saved conversation</h3><div className="rs-use-body"><Example /></div></UseField>; }
