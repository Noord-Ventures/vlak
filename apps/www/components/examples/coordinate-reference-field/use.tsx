"use client";

import { useState } from "react";
import { CoordinateReferenceField } from "@noorddev/vlak-react";
import type { CoordinateReferenceValue } from "@noorddev/vlak-react";
import { UseField, UseType, UseBody, UseStack, UseKicker, UseCopy } from "../use-frame";

export function Use() {
  const [point, setPoint] = useState<CoordinateReferenceValue>({ reference: "site", coordinates: { east: 120.5, north: 48.25 } });
  return <UseField name="coordinate-reference-field"><UseType>Assign the survey reference</UseType><UseBody><UseStack>
    <UseKicker>Survey import / Point 042</UseKicker>
    <CoordinateReferenceField label="Recorded point" name="point" value={point} onValueChange={setPoint} axes={[{ id: "east", label: "Easting", unit: "m" }, { id: "north", label: "Northing", unit: "m" }]} references={[{ value: "site", label: "Site grid", description: "Local reference supplied with the survey" }, { value: "project", label: "Project grid", description: "Project reference supplied by the coordinator" }]} />
    <UseCopy>The record now uses {point.reference === "site" ? "the site grid" : point.reference === "project" ? "the project grid" : "an unknown reference"}. Assigning a reference preserves the entered numbers.</UseCopy>
  </UseStack></UseBody></UseField>;
}
