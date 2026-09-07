"use client";

import { useState } from "react";
import type { ComponentType } from "react";
import { ApplicationStatus, BenefitProgram, EvidenceChecklist, IdentityDocument, TaxSummary } from "@noorddev/vlak-react";
import type { EvidenceChecklistItem } from "@noorddev/vlak-react";

function EvidencePreview() {
  const [items, setItems] = useState<EvidenceChecklistItem[]>([
    { id: "address", label: "Proof of address", requirement: "Required", fileName: "Example-address.pdf", status: "Awaiting review", actions: [{ id: "replace", label: "Mark for replacement" }] },
    { id: "plan", label: "Project plan", requirement: "Required", status: "Not supplied" },
  ]);
  return <EvidenceChecklist label="Application evidence" summary="Example records; changes last in this preview only" items={items} onAction={(itemId, actionId) => {
    if (actionId === "replace") setItems(current => current.map(item => item.id === itemId ? { ...item, status: "Marked for replacement, in this example", actions: [] } : item));
  }} />;
}

export const civicPreviews: Record<string, ComponentType> = {
  "identity-document": () => <IdentityDocument documentTitle="Residence document" holderName="Robin Ellis" maskedIdentifier="•••• 2048" issuer="Example civic office" issuedLabel="12 June 2025" expiresLabel="12 June 2030" status="Verification pending" />,
  "tax-summary": () => <TaxSummary label="Annual assessment" periodLabel="2025" reference="Example 204" status="Provisional" items={[{ id: "assessment", label: "Assessed amount", amount: "€ 300.00" }, { id: "paid", label: "Payment received", amount: "− € 60.00" }]} totals={[{ id: "payable", label: "Amount payable", amount: "€ 240.00" }]} dueLabel="Payment date not supplied" />,
  "benefit-program": () => <BenefitProgram programName="Community project grant" provider="Example council" status="Applications open" eligibility="Not assessed" awardLabel="Amount determined by provider" deadlineLabel="30 September, as supplied" criteria={[{ id: "location", label: "Project location", status: "Not reviewed" }, { id: "plan", label: "Project plan", status: "Evidence requested" }]} />,
  "application-status": () => <ApplicationStatus applicationTitle="Community grant application" reference="Example 204" status="Under review" updatedLabel="Updated 14 September, as supplied" milestones={[{ id: "received", label: "Application received", status: "Recorded", dateLabel: "12 September" }, { id: "review", label: "Evidence review", status: "In progress", current: true }, { id: "decision", label: "Decision", status: "Not issued" }]} nextStep="Wait for the review update" />,
  "evidence-checklist": EvidencePreview,
};
