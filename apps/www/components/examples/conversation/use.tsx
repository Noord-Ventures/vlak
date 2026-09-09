"use client";

import { useState } from "react";
import { Button, Conversation, Response, ResponseActions } from "@noorddev/vlak-react";
import { AiAvatar } from "@/components/ai-avatar";
import { UseField } from "../use-frame";
import "@/app/ai/demo.css";

const exchanges = [
  { question: "What changed in the project brief?", answer: "The brief now names the owner and next step for each decision." },
  { question: "Are the sources still included?", answer: "Yes. Each decision keeps its supporting source beside the summary." },
  { question: "What should we finish before sharing it?", answer: "Confirm the owner for the launch review and add a date to the next step." },
  { question: "Can you summarize that as a checklist?", answer: "Check the owner, confirm the date, and review the source for each decision." },
];

export function Use() {
  const [count, setCount] = useState(exchanges.length);
  const [reading, setReading] = useState(false);
  return <UseField name="conversation" className="ai-chat-demo">
    <h3 className="rs-use-type">History</h3>
    <div className="rs-use-body">
      <p className="rs-use-copy">Scroll back, then add a reply. Your place stays fixed until you choose Jump to latest.</p>
      <Conversation label="Project brief conversation" maxHeight="24rem">
        {Array.from({ length: count }, (_, index) => {
          const exchange = exchanges[index] ?? {
            question: "What should we check in the next revision?",
            answer: `Use the same checklist for the next revision: owner, date, and supporting source. This is appended exchange ${index - exchanges.length + 1}.`,
          };
          return <div className="ai-chat-exchange" key={index}>
            <Response className="ai-chat-user" from="user">{exchange.question}</Response>
            <div className="ai-chat-assistant">
              <span className="ai-chat-avatar">{index === count - 1 && <AiAvatar size={20} state={reading ? "speaking" : "idle"} />}</span>
              <div className="ai-chat-answer"><Response className="ai-chat-reply" aria-label="Assistant"
                actions={index === count - 1 ? <ResponseActions text={exchange.answer} onReadingChange={setReading} /> : undefined}
              ><p>{exchange.answer}</p></Response></div>
            </div>
          </div>;
        })}
      </Conversation>
      <Button variant="subtle" style={{ alignSelf: "flex-start", width: "auto" }} onClick={() => { setReading(false); setCount(value => value + 1); }}>Add reply</Button>
      <p className="rs-use-kicker">Recorded messages · No model connected</p>
    </div>
  </UseField>;
}
