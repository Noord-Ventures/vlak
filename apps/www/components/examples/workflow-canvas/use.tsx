"use client";
import { WorkflowExample } from "../../ai-workflow-example";
import { UseField } from "../use-frame";
export function Use() { return <UseField name="workflow-canvas"><h3 className="rs-use-type">Review workflow</h3><div className="rs-use-body"><WorkflowExample formLabel="Connect review workflow steps" /></div></UseField>; }
