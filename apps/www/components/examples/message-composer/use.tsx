"use client";

import { useState } from "react";
import { Attachment, Attachments, Button, MessageComposer, Toggle, useFileAttachments, useMessageComposer } from "@noorddev/vlak-react";
import type { ComposedMessage } from "@noorddev/vlak-react";
import { UseField, UseType, UseBody, UseStack, UseCopy } from "../use-frame";

const sketch = '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120" viewBox="0 0 160 120"><rect width="160" height="120" fill="#ffffff"/><rect x="20" y="20" width="120" height="80" rx="4" fill="#f5f5f5" stroke="#777777"/><path d="M36 42h72M36 60h88M36 78h54" stroke="#111111" stroke-width="3"/></svg>';
function ExampleFiles() {
  const composer = useMessageComposer();
  return <Button variant="subtle" disabled={!composer.canAttach || composer.files.length > 2} onClick={() => composer.addFiles([new File(["Review the owner, source, and next decision."], "project-brief.txt", { type: "text/plain" }), new File([sketch], "concept-sketch.svg", { type: "image/svg+xml" })])}>Add example files</Button>;
}
export function Use() {
  const [files, setFiles] = useState<File[]>([]);
  const [includeSources, setIncludeSources] = useState(true);
  const [sent, setSent] = useState<ComposedMessage | null>(null);
  const sentFiles = useFileAttachments(sent?.files ?? []);
  return <UseField name="message-composer"><UseType>Continue the conversation</UseType><UseBody><UseStack>
    <MessageComposer compact maxRows={6} sendOnEnter label="Message" placeholder="Ask about your files…" allowAttachments allowScreenshot
      files={files} onFilesChange={setFiles} maxFiles={4} maxFileSize={10 * 1024 * 1024}
      accept="image/*,audio/*,video/*,.pdf,.txt" onSend={setSent}
      tools={<><Toggle variant="subtle" pressed={includeSources} onPressedChange={setIncludeSources}>Include sources</Toggle><ExampleFiles /></>}
    />
    {sent && <><UseCopy>Sent: {sent.text || "Files for review"}</UseCopy>{sentFiles.length > 0 && <Attachments>{sentFiles.map((data) => <Attachment key={data.id} data={data} />)}</Attachments>}</>}
    <p className="rs-use-kicker">Paste or drop files, or choose them from your device. Up to four files, 10 MB each. Sending is local to this example.</p>
  </UseStack></UseBody></UseField>;
}
