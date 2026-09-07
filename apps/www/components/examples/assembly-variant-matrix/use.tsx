"use client";

import { AssemblyVariantMatrix } from "@noorddev/vlak-react";
import { UseField, UseType, UseBody, UseStack, UseKicker } from "../use-frame";

export function Use() {
  return <UseField name="assembly-variant-matrix"><UseType>Specify each build</UseType><UseBody><UseStack><UseKicker>Sensor board · assembly review</UseKicker><AssemblyVariantMatrix label="Assembly options" references={[{ id: "r1", label: "R1", partLabel: "10 kΩ resistor" }, { id: "c1", label: "C1", partLabel: "100 nF capacitor" }]} variants={[{ id: "pilot", label: "Pilot" }, { id: "production", label: "Production" }]} defaultValue={[{ referenceId: "r1", variantId: "pilot", populated: true, includeInBom: true, includeInPlacement: true }, { referenceId: "r1", variantId: "production", populated: false, includeInBom: true, includeInPlacement: false }, { referenceId: "c1", variantId: "production", populated: true, includeInBom: true, includeInPlacement: true }]} /></UseStack></UseBody></UseField>;
}
