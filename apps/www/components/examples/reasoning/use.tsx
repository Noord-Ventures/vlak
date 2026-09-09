"use client";

import { useState } from "react";
import { Button, Reasoning, Response } from "@noorddev/vlak-react";
import { AiAvatar } from "@/components/ai-avatar";
import { UseField } from "../use-frame";
import "@/app/ai/demo.css";

const steps = ["Read the proposed scope.", "Checked the owner and next step for each decision.", "Reviewed the supporting sources."];

export function Use() {
  const [completed, setCompleted] = useState(1);
  return (
    <UseField name="reasoning" className="ai-chat-demo">
      <h3 className="rs-use-type">Follow a review</h3>
      <div className="rs-use-body"><div className="rs-use-stack">
        <Response className="ai-chat-user" from="user">Review the brief and show what you checked.</Response>
        <div className="ai-chat-assistant">
          <span className="ai-chat-avatar"><AiAvatar size={20} state={completed < steps.length ? "thinking" : "idle"} /></span>
          <div className="ai-chat-answer"><Response className="ai-chat-reply" aria-label="Assistant" status={completed < steps.length ? "streaming" : "complete"}>
            <p>{completed < steps.length ? "The review checks scope, ownership, and sources." : "The brief is ready for an owner and date check."}</p>
            <Reasoning className="ai-chat-activity" variant="inline" title={completed < steps.length ? "Reviewing the brief" : "Reviewed the brief"} status={completed < steps.length ? "streaming" : "complete"} statusLabel={`${completed} of ${steps.length} steps`} defaultOpen>
              <ol>{steps.slice(0, completed).map((step) => <li key={step}>{step}</li>)}</ol>
            </Reasoning>
          </Response></div>
        </div>
        <Button variant="subtle" style={{ alignSelf: "flex-start", width: "auto" }} onClick={() => setCompleted((current) => current < steps.length ? current + 1 : 1)}>
          {completed < steps.length ? "Next step" : "Restart review"}
        </Button>
        <p className="rs-use-kicker">Recorded progress · Advancing a step preserves your disclosure choice</p>
      </div></div>
    </UseField>
  );
}
