"use client";

import { useEffect, useState } from "react";
import { Button, Response, ToolCall, type ToolCallState } from "@noorddev/vlak-react";
import { AiAvatar } from "@/components/ai-avatar";
import { UseField } from "../use-frame";
import "@/app/ai/demo.css";

export function Use() {
  const [state, setState] = useState<ToolCallState>("complete");
  useEffect(() => {
    if (state !== "running") return;
    const timer = window.setTimeout(() => setState("complete"), 900);
    return () => window.clearTimeout(timer);
  }, [state]);
  return <UseField name="tool-call" className="ai-chat-demo">
    <h3 className="rs-use-type">Inspect a tool result</h3>
    <div className="rs-use-body"><div className="rs-use-stack">
      <Response className="ai-chat-user" from="user">Find the decisions in the project brief.</Response>
      <div className="ai-chat-assistant">
        <span className="ai-chat-avatar"><AiAvatar size={20} state={state === "running" ? "thinking" : "idle"} /></span>
        <div className="ai-chat-answer"><Response className="ai-chat-reply" aria-label="Assistant" status={state === "running" ? "streaming" : "complete"}>
          <p>{state === "running" ? "Searching the recorded brief…" : state === "error" ? "The example search failed. Retry to replay the result." : "The brief has three matching sections."}</p>
          <ToolCall title="Search project brief" state={state} defaultOpen style={{ marginTop: 24 }}
            input={JSON.stringify({ query: "Decisions", document: "project-brief.md" }, null, 2)}
            output={state === "complete" ? "3 matches\n\nScope, section 1\nOwners and next steps, section 2\nSupporting sources, section 3" : undefined}
            error={state === "error" ? "The recorded source was unavailable. Try again." : undefined}
          />
        </Response></div>
      </div>
      <div className="rs-use-row">
        <Button variant="subtle" disabled={state === "running"} onClick={() => setState("running")}>{state === "error" ? "Retry search" : "Replay search"}</Button>
        <Button variant="subtle" disabled={state === "running" || state === "error"} onClick={() => setState("error")}>Show error</Button>
      </div>
      <p className="rs-use-kicker">Recorded result · No document search is performed</p>
    </div></div>
  </UseField>;
}
