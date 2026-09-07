"use client";

import { useState } from "react";
import { AcquisitionSequencer } from "@noorddev/vlak-react";
import type { AcquisitionStep } from "@noorddev/vlak-react";
import { UseField, UseType, UseBody, UseStack, UseKicker } from "../use-frame";

export function Use() {
  const [steps, setSteps] = useState<readonly AcquisitionStep[]>([
    { id: "baseline", label: "Baseline", exposure: 10, exposureUnit: "ms", time: 0, timeUnit: "s", depth: -1, depthUnit: "µm", channel: "phase", status: "Not run", actions: [{ id: "review", label: "Record plan review" }] },
    { id: "followup", label: "Follow-up", exposure: 10, exposureUnit: "ms", time: 5, timeUnit: "s", depth: 0, depthUnit: "µm", channel: "phase", status: "Not run", actions: [{ id: "review", label: "Record plan review" }] },
  ]);
  return <UseField name="acquisition-sequencer"><UseType>Prepare a capture plan</UseType><UseBody><UseStack>
    <UseKicker>Optics bench / Draft sequence</UseKicker>
    <AcquisitionSequencer label="Sample 042 capture plan" description="Edit supplied settings and record a plan review. No acquisition is started." steps={steps} channels={[{ id: "phase", label: "Phase" }, { id: "channel2", label: "Channel 2" }]} onStepsChange={setSteps} onAction={id => setSteps(current => current.map(step => step.id === id ? { ...step, confirmedLabel: "Plan review recorded; capture has not run", actions: [] } : step))} />
  </UseStack></UseBody></UseField>;
}
