"use client";

import { RobotPose } from "@noorddev/vlak-react";

export function RobotPoseUse() {
  return <RobotPose label="Recorded tool poses" description="Two independent records supplied by the host" poses={[
    { id: "base", label: "Tool in base", frame: "base", timeLabel: "12:00:00.125", status: "Recorded", translation: { x: 0.125, y: 0, z: 0.25, unit: "m" }, orientation: { representation: "Quaternion, x y z w", components: [{ id: "qx", label: "qx", value: 0 }, { id: "qy", label: "qy", value: 0 }, { id: "qz", label: "qz", value: 0 }, { id: "qw", label: "qw", value: 1 }] } },
    { id: "station", label: "Tool in station", frame: "station", timeLabel: "12:00:00.125", status: "Recorded", translation: { x: 0.025, y: -0.125, z: 0.25, unit: "m" }, orientation: { representation: "Euler, intrinsic x-y-z", components: [{ id: "rx", label: "x", value: 0, unit: "deg" }, { id: "ry", label: "y", value: 0, unit: "deg" }, { id: "rz", label: "z", value: 90, unit: "deg" }] } },
  ]} />;
}
