"use client";

import { useState } from "react";
import { Response, ResponseActions, type ResponseFeedback } from "@noorddev/vlak-react";
import { UseField } from "../use-frame";

const answer = "The brief is ready for review. It names Mina as the owner, gives the next step a date, and links three supporting sources.";

export function Use() {
  const [feedback, setFeedback] = useState<ResponseFeedback>(null);

  return <UseField name="response-actions">
    <h3 className="rs-use-type">Act on an assistant response</h3>
    <div className="rs-use-body"><div className="rs-use-stack" style={{ gap: 24 }}>
      <Response actions={<ResponseActions text={answer} feedback={feedback} onFeedback={setFeedback} />}>
        <p>{answer}</p>
      </Response>
      <p className="rs-use-copy">Four quiet controls keep the response in focus: copy, read aloud, rate, and share. The combined thumbs icon opens helpful and unhelpful choices; choose the checked item again to clear it.</p>
      <p className="rs-use-copy">The action bar composes subtle icon buttons from the library. Reading aloud uses browser speech when available. Feedback stays in this example, and sharing uses the browser share sheet or copies the response.</p>
    </div></div>
  </UseField>;
}
