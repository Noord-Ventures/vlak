export type JointId = "shoulder" | "elbow" | "wrist";
export type ArmAngles = Record<JointId, number>;
export type ArmClock = { time: number; running: boolean; speed: number; base: ArmAngles };
export const jointDefinitions = [
  { id: "shoulder", label: "Shoulder", unit: "deg", minimum: -90, maximum: 90, base: 24 },
  { id: "elbow", label: "Elbow", unit: "deg", minimum: -120, maximum: 120, base: -38 },
  { id: "wrist", label: "Wrist", unit: "deg", minimum: -180, maximum: 180, base: 12 },
] as const;
export const armDimensions = { baseX: -.85, shoulderHeight: .68, upper: 1.38, forearm: 1.16, tool: .38 };
export const initialAngles: ArmAngles = { shoulder: 24, elbow: -38, wrist: 12 };

/** Illustrative local mechanism, metres. Elbow zero is a clockwise 90° mounting offset. */
export function armPose(angles: ArmAngles) {
  const radians = Math.PI / 180;
  const shoulder = angles.shoulder * radians;
  const forearm = (angles.shoulder + 90 + angles.elbow) * radians;
  const tool = forearm + angles.wrist * radians;
  const { baseX, shoulderHeight, upper, forearm: length, tool: tip } = armDimensions;
  return {
    x: baseX + upper * Math.sin(shoulder) + length * Math.sin(forearm) + tip * Math.sin(tool),
    y: shoulderHeight + upper * Math.cos(shoulder) + length * Math.cos(forearm) + tip * Math.cos(tool),
    z: 0,
    toolPitch: angles.shoulder + 90 + angles.elbow + angles.wrist,
  };
}

export function sampleArm(base: ArmAngles, time: number): ArmAngles {
  const wave = Math.sin(time * Math.PI / 12);
  const offset = [16, 23, 18];
  return Object.fromEntries(jointDefinitions.map((joint, index) => [joint.id,
    Math.min(joint.maximum, Math.max(joint.minimum, base[joint.id] + wave * offset[index]!)),
  ])) as ArmAngles;
}
