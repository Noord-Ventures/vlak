"use client";

import { useState } from "react";
import type { ComponentType } from "react";
import { JointPanel, RobotPose, RobotMissionQueue } from "@noorddev/vlak-react";
import type { JointTargets, RobotMissionStep } from "@noorddev/vlak-react";

function JointPreview() {
  const [targets, setTargets] = useState<JointTargets>({ shoulder: 15, slide: 0 });
  const [confirmation, setConfirmation] = useState<string>();
  return <JointPanel label="Joint targets" timeLabel="12:00:00.125" joints={[{ id: "shoulder", label: "Shoulder", unit: "deg", reported: 12.5, minimum: -90, maximum: 90 }, { id: "slide", label: "Slide", unit: "m", reported: 0, minimum: 0, maximum: 0.5 }]} value={targets} onValueChange={next => { setTargets(next); setConfirmation(undefined); }} onRequestTargets={() => setConfirmation("Draft received locally; no motion executed")} confirmedLabel={confirmation} />;
}
function MissionPreview() {
  const [steps, setSteps] = useState<readonly RobotMissionStep[]>([{ id: "inspect", label: "Inspect station", status: "Not started", actions: [{ id: "review", label: "Record plan review" }] }, { id: "return", label: "Return to dock", status: "Not started" }]);
  return <RobotMissionQueue label="Inspection mission" steps={steps} onOrderChange={ids => setSteps(current => ids.map(id => current.find(step => step.id === id)!))} onAction={id => setSteps(current => current.map(step => step.id === id ? { ...step, confirmedLabel: "Plan review recorded; mission has not run", actions: [] } : step))} />;
}
export const roboticsPreviews: Record<string, ComponentType> = {
  "joint-panel": JointPreview,
  "robot-pose": () => <RobotPose label="Recorded poses" poses={[
    { id: "tool", label: "Tool in base", frame: "base", timeLabel: "12:00:00.125", status: "Recorded", translation: { x: 0.125, y: 0, z: 0.25, unit: "m" }, orientation: { representation: "Quaternion, x y z w", components: [{ id: "qx", label: "qx", value: 0 }, { id: "qy", label: "qy", value: 0 }, { id: "qz", label: "qz", value: 0 }, { id: "qw", label: "qw", value: 1 }] } },
    { id: "map", label: "Base in map", frame: "map", timeLabel: "12:00:00.125", status: "Recorded", translation: { x: 1.25, y: 0, z: 0, unit: "m" }, orientation: { representation: "Euler, intrinsic x-y-z", components: [{ id: "rx", label: "x", value: 0, unit: "deg" }, { id: "ry", label: "y", value: 0, unit: "deg" }, { id: "rz", label: "z", value: 90, unit: "deg" }] } },
  ]} />,
  "robot-mission-queue": MissionPreview,
};
