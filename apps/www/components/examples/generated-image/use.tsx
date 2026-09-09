"use client";
import { aiWorkPatternPreviews } from "../../previews/ai-work-patterns";
import { UseField } from "../use-frame";
const Example = aiWorkPatternPreviews["generated-image"]!;
export function Use() { return <UseField name="generated-image"><h3 className="rs-use-type">Display a generated result</h3><div className="rs-use-body"><Example /></div></UseField>; }
