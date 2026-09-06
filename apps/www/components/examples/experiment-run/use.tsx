"use client";

import { useState } from "react";
import { ExperimentRun } from "@noorddev/vlak-react";
import type { ExperimentStep } from "@noorddev/vlak-react";
import { UseField, UseType, UseBody, UseStack, UseKicker } from "../use-frame";

export function Use() {
  const [steps, setSteps] = useState<ExperimentStep[]>([
    { id: "acquisition", label: "Acquire readings", status: "Recorded", details: "Data file attached to the run record" },
    { id: "review", label: "Review acquisition", status: "Not reviewed", actions: [{ id: "review", label: "Record review" }] },
  ]);
  return <UseField name="experiment-run"><UseType>Review acquisition</UseType><UseBody><UseStack>
    <UseKicker>Optics bench / Example run</UseKicker>
    <ExperimentRun label="Optical measurement" runId="042" protocol="Protocol revision 3" status={steps[1]?.status === "Reviewed" ? "Review recorded" : "Awaiting review"} conditions={[{ id: "sample", label: "Sample", value: "042" }, { id: "temperature", label: "Recorded temperature", value: "21.4 °C" }]} steps={steps} onAction={stepId => setSteps(current => current.map(step => step.id === stepId ? { ...step, status: "Reviewed", actions: [] } : step))} />
  </UseStack></UseBody></UseField>;
}
