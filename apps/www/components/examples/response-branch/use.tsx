"use client";

import { useState } from "react";
import { Button, Response, ResponseActions } from "@noorddev/vlak-react";
import { ResponseBranch } from "@noorddev/vlak-react/components/response-branch";
import { UseField } from "../use-frame";

const replies = [
  "Start with the review flow. Give each decision an owner, a next step, and a source.",
  "Make the next decision easy to find: show its owner, due date, and supporting document together.",
  "Keep the first version focused on one review. Add more workflow steps when the team needs them.",
];
export function Use() {
  const [count, setCount] = useState(2);
  const [selected, setSelected] = useState("reply-1");
  return <UseField name="response-branch"><h3 className="rs-use-type">Compare alternatives</h3><div className="rs-use-body"><div className="rs-use-stack">
    <Response from="user" statusLabel="">What should we focus on first?</Response>
    <ResponseBranch value={selected} onValueChange={setSelected} branches={replies.slice(0, count).map((text, index) => ({
      id: `reply-${index + 1}`, label: `Alternative ${index + 1}`,
      content: <Response statusLabel="" actions={<ResponseActions text={text} />}>{text}</Response>,
    }))} />
    <div className="rs-use-row"><Button variant="subtle" disabled={count === replies.length} onClick={() => { setCount(3); setSelected("reply-3"); }}>Add recorded alternative</Button></div>
    <p className="rs-use-kicker">The application keeps every alternative. Navigating does not generate a new response.</p>
  </div></div></UseField>;
}
