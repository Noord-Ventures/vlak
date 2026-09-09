"use client";

import { useState } from "react";
import { Button, Confirmation, Response, type ConfirmationStatus } from "@noorddev/vlak-react";
import { AiAvatar } from "@/components/ai-avatar";
import { UseField } from "../use-frame";
import "@/app/ai/demo.css";

export function Use() {
  const [status, setStatus] = useState<ConfirmationStatus>("pending");
  const recordDecision = () => new Promise<void>((resolve) => window.setTimeout(resolve, 650));
  return <UseField name="confirmation" className="ai-chat-demo">
    <h3 className="rs-use-type">Review before continuing</h3>
    <div className="rs-use-body"><div className="rs-use-stack">
      <Response className="ai-chat-user" from="user">Prepare an action list for the project notes.</Response>
      <div className="ai-chat-assistant">
        <span className="ai-chat-avatar"><AiAvatar size={20} /></span>
        <div className="ai-chat-answer"><Response className="ai-chat-reply" aria-label="Assistant">
          <p>Start with the review flow, assign an owner, and link the supporting sources.</p>
          <Confirmation className="ai-chat-confirmation" title="Add this draft to the notes?" status={status} onStatusChange={setStatus} onConfirm={recordDecision} onReject={recordDecision} confirmLabel="Approve draft" rejectLabel="Keep in chat">
            <p>Review the proposed action list before approving it.</p>
          </Confirmation>
        </Response></div>
      </div>
      {status !== "pending" && <Button variant="subtle" style={{ alignSelf: "flex-start", width: "auto" }} onClick={() => setStatus("pending")}>Review again</Button>}
      <p className="rs-use-kicker">Local decision only · Approval does not write a file or execute a tool</p>
    </div></div>
  </UseField>;
}
