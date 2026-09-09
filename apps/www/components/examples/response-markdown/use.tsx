"use client";

import { useEffect, useState } from "react";
import { Button, Response, ResponseActions } from "@noorddev/vlak-react";
import { ResponseMarkdown } from "@noorddev/vlak-react/components/response-markdown";
import { UseField } from "../use-frame";
import "katex/dist/katex.min.css";

const reply = `Start with a small review loop and make its state visible.

### Review checklist

- [x] Name the document owner
- [x] Link the supporting source
- [ ] Record the final decision

| Step | Owner |
| --- | --- |
| Draft | Product |
| Review | Legal |

\`\`\`typescript
const review = { owner: "Legal", status: "ready" };
\`\`\`

The completion ratio is:

$$
\\frac{2}{3} \\approx 0.67
$$

\`\`\`mermaid
flowchart LR
  Draft --> Review
  Review --> Decision
\`\`\``;

export function Use() {
  const [length, setLength] = useState(reply.length);
  const streaming = length < reply.length;
  useEffect(() => {
    if (!streaming) return;
    const timer = window.setTimeout(() => setLength(Math.min(length + 28, reply.length)), 100);
    return () => window.clearTimeout(timer);
  }, [length, streaming]);
  return <UseField name="response-markdown"><h3 className="rs-use-type">A structured answer</h3><div className="rs-use-body"><div className="rs-use-stack">
    <Response from="user" statusLabel="">Show a simple review flow with code and a diagram.</Response>
    <Response status={streaming ? "streaming" : "complete"} actions={!streaming ? <ResponseActions text={reply} /> : undefined}>
      <ResponseMarkdown streaming={streaming}>{reply.slice(0, length)}</ResponseMarkdown>
    </Response>
    <div className="rs-use-row"><Button variant="subtle" disabled={streaming} onClick={() => setLength(1)}>Replay response</Button></div>
    <p className="rs-use-kicker">Recorded text streams locally. Code, math, and the diagram render in your browser.</p>
  </div></div></UseField>;
}
