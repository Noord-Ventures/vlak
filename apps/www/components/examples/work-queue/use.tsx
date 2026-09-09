"use client";
import { WorkQueuePreview } from "../../previews/ai-work-patterns";
import { UseField } from "../use-frame";
export function Use() { return <UseField name="work-queue"><h3 className="rs-use-type">Review queued work</h3><div className="rs-use-body"><WorkQueuePreview label="Project review queue" /></div></UseField>; }
