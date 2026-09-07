"use client";

import { useState } from "react";
import type { ComponentType } from "react";
import { PadInspector, DesignRuleResults } from "@noorddev/vlak-react";
import type { DesignRuleViolation } from "@noorddev/vlak-react";

function PadPreview() {
  const [pad, setPad] = useState<string | null>("pad-a");
  return <PadInspector label="Connector pads" boardLabel="Example board, revision C" value={pad} onValueChange={setPad} pads={[
    { id: "pad-a", reference: "J1", number: "1", net: "Supply", layers: ["Front copper", "Back copper"], type: "Through hole", shape: "Circle", geometry: [{ id: "diameter", label: "Pad diameter", value: "1.80", unit: "mm" }, { id: "drill", label: "Drill diameter", value: "0.90", unit: "mm" }] },
    { id: "pad-b", reference: "J1", number: "2", net: "Return", layers: ["Front copper", "Back copper"], type: "Through hole", shape: "Oval", geometry: [{ id: "width", label: "Pad width", value: "2.20", unit: "mm" }, { id: "height", label: "Pad height", value: "1.80", unit: "mm" }] },
  ]} />;
}

function RulePreview() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [results, setResults] = useState<DesignRuleViolation[]>([
    { id: "clearance-1", title: "Copper clearance", severity: "error", status: "open", rule: "Supplied clearance rule", layer: "Front copper", net: "Supply", location: { x: 24.5, y: 18, unit: "mm" }, objects: ["J1 pad 1", "Track 17"] },
    { id: "label-2", title: "Silkscreen overlap", severity: "warning", status: "excluded", layer: "Front silkscreen", location: { x: 31, y: 22.4, unit: "mm" }, objects: ["J1 reference", "J1 outline"] },
  ]);
  return <DesignRuleResults label="Reported design rules" runLabel="Synthetic check run 042" violations={results} selectedId={selectedId} onSelect={setSelectedId} onResolve={id => setResults(current => current.map(result => result.id === id ? { ...result, pending: true } : result))} />;
}

export const electronicsPreviews: Record<string, ComponentType> = {
  "pad-inspector": PadPreview,
  "design-rule-results": RulePreview,
};
