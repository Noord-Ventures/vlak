"use client";

import { useState } from "react";
import { PadInspector } from "@noorddev/vlak-react";
import { UseField, UseType, UseBody, UseStack, UseKicker, UseCopy } from "../use-frame";

export function Use() {
  const [pad, setPad] = useState<string | null>("pad-a");
  return <UseField name="pad-inspector"><UseType>Inspect a footprint pad</UseType><UseBody><UseStack>
    <UseKicker>Example board / Revision C</UseKicker>
    <PadInspector label="Connector pads" boardLabel="Synthetic connector record" name="pad" value={pad} onValueChange={setPad} pads={[
      { id: "pad-a", reference: "J1", number: "1", net: "Supply", layers: ["Front copper", "Back copper"], type: "Through hole", shape: "Circle", geometry: [{ id: "diameter", label: "Pad diameter", value: "1.80", unit: "mm" }, { id: "drill", label: "Drill diameter", value: "0.90", unit: "mm" }] },
      { id: "pad-b", reference: "J1", number: "2", net: "Return", layers: ["Front copper", "Back copper"], type: "Through hole", shape: "Oval", geometry: [{ id: "width", label: "Pad width", value: "2.20", unit: "mm" }, { id: "height", label: "Pad height", value: "1.80", unit: "mm" }, { id: "drill", label: "Drill diameter", value: "0.90", unit: "mm" }] },
    ]} />
    <UseCopy>{pad ? `Selected board object: ${pad}` : "No board object selected"}. The example supplies each dimension; selecting a pad does not change the board.</UseCopy>
  </UseStack></UseBody></UseField>;
}
