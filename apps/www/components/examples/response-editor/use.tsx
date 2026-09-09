"use client";
import { ResponseEditorPreview } from "../../previews/ai-work-patterns";
import { UseField } from "../use-frame";
export function Use() { return <UseField name="response-editor"><h3 className="rs-use-type">Edit and regenerate a reply</h3><div className="rs-use-body"><ResponseEditorPreview label="Edit the review request" /></div></UseField>; }
