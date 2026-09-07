"use client";

import * as React from "react";
import { ApplicationStatus, Button } from "@noorddev/vlak-react";
import { UseBody, UseCopy, UseField, UseStack, UseType } from "../use-frame";

export function Use() {
  const [messageOpen, setMessageOpen] = React.useState(false);
  const messageId = React.useId();
  return <UseField name="application-status"><UseType>Follow your case</UseType><UseBody><UseStack>
    <UseCopy>A fictional case timeline. Dates, steps, and status come from the supplied case record.</UseCopy>
    <ApplicationStatus applicationTitle="Community grant application" reference="Example 204" status="Under review" updatedLabel="Updated 14 September 2026, 10:00 UTC+02:00" milestones={[{ id: "received", label: "Application received", status: "Recorded", dateLabel: "12 September" }, { id: "review", label: "Evidence review", status: "In progress", dateLabel: "Since 14 September", current: true }, { id: "decision", label: "Decision", status: "Not issued" }]} nextStep="Wait for the review update">
      <Button variant="ghost" aria-expanded={messageOpen} aria-controls={messageId} onClick={() => setMessageOpen(open => !open)}>{messageOpen ? "Hide case message" : "View case message"}</Button>
    </ApplicationStatus>
    <div id={messageId} hidden={!messageOpen}><UseCopy>Example message: Your evidence is being reviewed. No decision date has been supplied.</UseCopy></div>
  </UseStack></UseBody></UseField>;
}
