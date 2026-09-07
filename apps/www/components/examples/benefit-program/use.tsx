"use client";

import * as React from "react";
import { BenefitProgram, Button } from "@noorddev/vlak-react";
import { UseBody, UseCopy, UseField, UseStack, UseType } from "../use-frame";

export function Use() {
  const [termsOpen, setTermsOpen] = React.useState(false);
  const termsId = React.useId();
  return <UseField name="benefit-program"><UseType>Explore support</UseType><UseBody><UseStack>
    <UseCopy>An example programme. Availability and personal eligibility are separate records.</UseCopy>
    <BenefitProgram programName="Community project grant" provider="Example council" status="Applications open" eligibility="Not assessed" awardLabel="Amount determined by the provider" deadlineLabel="30 September 2026, as supplied" criteria={[{ id: "location", label: "Project location", status: "Not reviewed", description: "The provider reviews the supplied location evidence." }, { id: "plan", label: "Project plan", status: "Evidence requested" }]}>
      <Button variant="ghost" aria-expanded={termsOpen} aria-controls={termsId} onClick={() => setTermsOpen(open => !open)}>{termsOpen ? "Hide programme note" : "View programme note"}</Button>
    </BenefitProgram>
    <div id={termsId} hidden={!termsOpen}><UseCopy>This fictional programme has no real application service. Award terms and eligibility decisions must come from the provider.</UseCopy></div>
  </UseStack></UseBody></UseField>;
}
