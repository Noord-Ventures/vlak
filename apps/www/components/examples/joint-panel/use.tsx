"use client";

import { useState } from "react";
import { JointPanel } from "@noorddev/vlak-react";
import type { JointTargets } from "@noorddev/vlak-react";

export function JointPanelUse() {
  const [targets, setTargets] = useState<JointTargets>({ shoulder: 15, slide: 0 });
  const [confirmation, setConfirmation] = useState<string>();
  return <JointPanel label="Inspection arm" timeLabel="12:00:00.125, controller time" description="Recorded positions and a local target draft" joints={[{ id: "shoulder", label: "Shoulder", unit: "deg", reported: 12.5, minimum: -90, maximum: 90 }, { id: "slide", label: "Slide", unit: "m", reported: 0, minimum: 0, maximum: 0.5 }]} value={targets} onValueChange={next => { setTargets(next); setConfirmation(undefined); }} onRequestTargets={() => setConfirmation("Draft received locally; no motion executed")} confirmedLabel={confirmation} />;
}
