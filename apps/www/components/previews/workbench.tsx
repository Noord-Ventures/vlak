"use client";

import type { ComponentType } from "react";
import { Patchbay, KerningPairEditor, AssemblyVariantMatrix } from "@noorddev/vlak-react";

export const workbenchPreviews: Record<string, ComponentType> = {
  patchbay: () => <Patchbay label="Output connections" sources={[{ id: "mix", label: "Mix", group: "Bus", signalType: "audio" }]} destinations={[{ id: "monitor", label: "Monitor", group: "Outputs", signalType: "audio" }, { id: "clock", label: "Clock", group: "Sync", signalType: "control" }]} defaultValue={[{ sourceId: "mix", destinationId: "monitor" }]} />,
  "kerning-pair-editor": () => <KerningPairEditor label="Pair spacing" fontFamily="Georgia, serif" unitsPerEm={1000} pairs={[{ id: "av", left: "A", right: "V" }, { id: "to", left: "T", right: "o" }]} baselineOffsets={{ av: -60, to: -40 }} defaultValue={{ av: -80, to: -50 }} />,
  "assembly-variant-matrix": () => <AssemblyVariantMatrix label="Assembly options" references={[{ id: "r1", label: "R1", partLabel: "10 kΩ resistor" }]} variants={[{ id: "pilot", label: "Pilot" }, { id: "production", label: "Production" }]} defaultValue={[{ referenceId: "r1", variantId: "pilot", populated: true, includeInBom: true, includeInPlacement: true }, { referenceId: "r1", variantId: "production", populated: false, includeInBom: true, includeInPlacement: false }]} />,
};
