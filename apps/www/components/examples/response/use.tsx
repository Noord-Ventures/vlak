"use client";

import { useEffect, useState } from "react";
import { Button, Response, ResponseActions } from "@noorddev/vlak-react";
import type { ResponseStatus } from "@noorddev/vlak-react";
import { AiAvatar } from "@/components/ai-avatar";
import { UseField } from "../use-frame";
import "@/app/ai/demo.css";

const answer = "Start with the review flow. Give each decision an owner and a dated next step, then link the source behind each recommendation.";

export function Use() {
  const [length, setLength] = useState(answer.length);
  const [status, setStatus] = useState<ResponseStatus>("complete");
  const [reading, setReading] = useState(false);

  useEffect(() => {
    if (status !== "streaming") return;
    if (length >= answer.length) { setStatus("complete"); return; }
    const timer = window.setTimeout(() => setLength((current) => Math.min(current + 12, answer.length)), 180);
    return () => window.clearTimeout(timer);
  }, [length, status]);

  return (
    <UseField name="response" className="ai-chat-demo">
      <h3 className="rs-use-type">A response as it arrives</h3>
      <div className="rs-use-body"><div className="rs-use-stack">
        <Response className="ai-chat-user" from="user">What should we focus on first?</Response>
        <div className="ai-chat-assistant">
          <span className="ai-chat-avatar"><AiAvatar size={20} state={reading ? "speaking" : status === "streaming" ? "thinking" : "idle"} /></span>
          <div className="ai-chat-answer"><Response className="ai-chat-reply" aria-label="Assistant" status={status}
            actions={status !== "streaming" && length > 0 ? <ResponseActions text={answer.slice(0, length)} onReadingChange={setReading} /> : undefined}
          ><p>{answer.slice(0, length) || (status === "stopped" ? "Stopped before the reply started." : "Reviewing the brief…")}</p></Response></div>
        </div>
        <div className="rs-use-row">
          <Button variant="subtle" disabled={status === "streaming"} onClick={() => { setReading(false); setLength(0); setStatus("streaming"); }}>Replay reply</Button>
          {status === "streaming" && <Button variant="subtle" onClick={() => setStatus("stopped")}>Stop</Button>}
        </div>
        <p className="rs-use-kicker">Recorded reply · Replay streams the same text locally</p>
      </div></div>
    </UseField>
  );
}
