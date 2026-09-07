"use client";

import { useState } from "react";
import { RobotMissionQueue } from "@noorddev/vlak-react";
import type { RobotMissionStep } from "@noorddev/vlak-react";

export function RobotMissionQueueUse() {
  const [steps, setSteps] = useState<readonly RobotMissionStep[]>([
    { id: "inspect", label: "Inspect station", detail: "Station 4, supplied inspection plan", status: "Not started", actions: [{ id: "review", label: "Record plan review", description: "Records a local planning review without executing a mission" }] },
    { id: "return", label: "Return to dock", detail: "Dock A", status: "Not started" },
  ]);
  return <RobotMissionQueue label="Inspection mission" steps={steps} onOrderChange={ids => setSteps(current => ids.map(id => current.find(step => step.id === id)!))} onAction={id => setSteps(current => current.map(step => step.id === id ? { ...step, confirmedLabel: "Plan review recorded; mission has not run", actions: [] } : step))} />;
}
