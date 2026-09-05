"use client";

import { MasterDetail } from "@noorddev/vlak-react";

export function Use() {
  return <MasterDetail label="Studies" items={[{ id: "drive", label: "Drive", description: "Vehicle controls", detail: <p>Range, energy, and media in one shared grid.</p> }, { id: "orbit", label: "Orbit", description: "Observation network", detail: <p>Track assets and their current passes.</p> }]} />;
}
