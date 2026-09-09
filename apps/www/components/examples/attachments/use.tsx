"use client";

import { useState } from "react";
import { Attachment, Attachments, Button } from "@noorddev/vlak-react";
import type { AttachmentData } from "@noorddev/vlak-react";
import { UseField } from "../use-frame";

const examples: AttachmentData[] = [
  { id: "sketch", name: "Concept sketch.png", mediaType: "image/png", url: "/interfaces/concepts/braun-t3-line-preview-light-v1.png" },
  { id: "film", name: "Product walkthrough.mp4", mediaType: "video/mp4", url: "/review/vlak-openai-plugin-demo.mp4" },
  { id: "brief", name: "Project brief.txt", mediaType: "text/plain", size: 342, status: "error", error: "The upload was interrupted." },
];
export function Use() {
  const [items, setItems] = useState(examples);
  return <UseField name="attachments"><h3 className="rs-use-type">Files in context</h3><div className="rs-use-body"><div className="rs-use-stack">
    <Attachments>{items.map((data) => <Attachment key={data.id} data={data}
      onRemove={() => setItems((current) => current.filter((item) => item.id !== data.id))}
      onRetry={() => setItems((current) => current.map((item) => item.id === data.id ? { ...item, status: "ready", error: undefined } : item))}
    />)}</Attachments>
    <div className="rs-use-row"><Button variant="subtle" onClick={() => setItems(examples)}>Reset files</Button></div>
    <p className="rs-use-kicker">Local image and video files. Retry updates the example state without uploading a document.</p>
  </div></div></UseField>;
}
