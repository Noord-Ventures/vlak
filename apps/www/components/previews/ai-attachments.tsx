"use client";

import { useState, type ComponentType } from "react";
import { Attachment, Attachments, Button } from "@noorddev/vlak-react";

function AttachmentPreview() {
  const [visible, setVisible] = useState(true);
  return visible ? <Attachments variant="inline"><Attachment data={{ id: "brief", name: "Project brief.txt", mediaType: "text/plain", size: 342 }} onRemove={() => setVisible(false)} /></Attachments> : <Button variant="subtle" onClick={() => setVisible(true)}>Reset file</Button>;
}
export const aiAttachmentPreviews: Record<string, ComponentType> = {
  attachments: AttachmentPreview,
};
