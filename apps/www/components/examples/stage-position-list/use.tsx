"use client";

import { useState } from "react";
import { Button, StagePositionList } from "@noorddev/vlak-react";
import type { StagePosition } from "@noorddev/vlak-react";
import { UseField, UseType, UseBody, UseStack, UseKicker } from "../use-frame";

const sample: readonly StagePosition[] = [
  { id: "field-01", name: "Overview", x: 0, y: -12.5, z: 0, enabled: true },
  { id: "field-02", name: "Edge detail", x: 120.25, y: 36, z: null, enabled: false },
  { id: "field-03", name: "Repeat field", x: -48, y: 0, z: 2.5, enabled: true },
];

export function Use() {
  const [positions, setPositions] = useState(sample);
  const [selected, setSelected] = useState<string | null>("field-01");
  return <UseField name="stage-position-list"><UseType>Review a position list</UseType><UseBody><UseStack>
    <UseKicker>Microscopy / Local plan</UseKicker>
    <StagePositionList label="Slide 042 positions" coordinateFrame={{ id: "stage-01", label: "Recorded stage frame" }} units={{ x: "µm", y: "µm", z: "µm" }} positions={positions} value={selected} onValueChange={setSelected} description="Choose a record, include it in the plan, or change its order. Coordinates remain supplied records; no instrument is connected."
      onEnabledChange={(id, enabled) => setPositions(current => current.map(position => position.id === id ? { ...position, enabled } : position))}
      onOrderChange={ids => setPositions(current => ids.map(id => current.find(position => position.id === id)!))}
      onRemove={id => { setPositions(current => current.filter(position => position.id !== id)); if (selected === id) setSelected(null); }} />
    <Button variant="ghost" onClick={() => { setPositions(sample); setSelected("field-01"); }}>Restore sample positions</Button>
  </UseStack></UseBody></UseField>;
}
