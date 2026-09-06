"use client";

import * as React from "react";
import { Button, TaxSummary } from "@noorddev/vlak-react";
import { UseBody, UseCopy, UseField, UseStack, UseType } from "../use-frame";

export function Use() {
  const [noteOpen, setNoteOpen] = React.useState(false);
  const noteId = React.useId();
  return <UseField name="tax-summary"><UseType>Review the assessment</UseType><UseBody><UseStack>
    <UseCopy>Fictional amounts supplied by an example authority. The summary does not calculate tax.</UseCopy>
    <TaxSummary label="Annual assessment" periodLabel="2025" reference="Example 204" status="Provisional" items={[{ id: "assessment", label: "Assessed amount", amount: "€ 300.00", detail: "As stated on the assessment" }, { id: "paid", label: "Payment received", amount: "− € 60.00" }]} totals={[{ id: "payable", label: "Amount payable", amount: "€ 240.00" }]} dueLabel="Payment date not supplied">
      <Button variant="ghost" aria-expanded={noteOpen} aria-controls={noteId} onClick={() => setNoteOpen(open => !open)}>{noteOpen ? "Hide assessment note" : "View assessment note"}</Button>
    </TaxSummary>
    <div id={noteId} hidden={!noteOpen}><UseCopy>This example statement is provisional. The displayed total comes from the supplied record.</UseCopy></div>
  </UseStack></UseBody></UseField>;
}
