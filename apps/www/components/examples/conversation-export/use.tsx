"use client";
import { aiWorkPatternPreviews } from "../../previews/ai-work-patterns";
import { UseField } from "../use-frame";
const Example = aiWorkPatternPreviews["conversation-export"]!;
export function Use() { return <UseField name="conversation-export"><h3 className="rs-use-type">Keep a Markdown snapshot</h3><div className="rs-use-body"><Example /></div></UseField>; }
