"use client";

import * as React from "react";
import { EvidenceChecklist } from "@noorddev/vlak-react";
import { UseBody, UseCopy, UseField, UseStack, UseType } from "../use-frame";

export function Use() {
  const [recordOpen, setRecordOpen] = React.useState(false);
  return <UseField name="evidence-checklist"><UseType>Prepare your evidence</UseType><UseBody><UseStack>
    <UseCopy>Fictional file records. Viewing a record does not submit or approve evidence.</UseCopy>
    <EvidenceChecklist label="Application evidence" summary="Evidence review is not complete" items={[{ id: "address", label: "Proof of address", requirement: "Required by the provider", fileName: "Example-address.pdf", receivedLabel: "Received 12 September", status: "Awaiting review", actions: [{ id: "view", label: recordOpen ? "Hide file record" : "View file record" }] }, { id: "plan", label: "Project plan", requirement: "Required by the provider", status: "Not provided", description: "Provide the document requested by the case team." }]} onAction={(itemId, actionId) => { if (itemId === "address" && actionId === "view") setRecordOpen(open => !open); }} />
    {recordOpen && <div role="region" aria-label="Proof of address file record"><UseCopy>Example-address.pdf · supplied record reference 204-A · awaiting review by the provider</UseCopy></div>}
  </UseStack></UseBody></UseField>;
}
