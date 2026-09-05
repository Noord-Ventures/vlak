"use client";
import { useState } from "react";
import { MessageComposer } from "@noorddev/vlak-react";
import { UseField, UseType, UseBody, UseStack, UseCopy } from "../use-frame";
export function Use() {
  const [message, setMessage] = useState("");
  return <UseField name="message-composer"><UseType>Continue the conversation</UseType><UseBody><UseStack>
    <MessageComposer label="Reply to the studio" allowAttachments onSend={({ text, files }) => setMessage(text || files.map(file => file.name).join(", "))} />
    {message && <UseCopy>Sent: {message}</UseCopy>}
  </UseStack></UseBody></UseField>;
}
