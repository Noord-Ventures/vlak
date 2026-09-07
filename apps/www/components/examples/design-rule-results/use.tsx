"use client";

import { useState } from "react";
import { Button, DesignRuleResults } from "@noorddev/vlak-react";
import type { DesignRuleViolation } from "@noorddev/vlak-react";
import { UseField, UseType, UseBody, UseStack, UseKicker, UseActions, UseCopy } from "../use-frame";

export function Use() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [results, setResults] = useState<DesignRuleViolation[]>([
    { id: "clearance-1", title: "Copper clearance", severity: "error", status: "open", rule: "Supplied clearance rule", layer: "Front copper", net: "Supply", location: { x: 24.5, y: 18, unit: "mm" }, objects: ["J1 pad 1", "Track 17"], description: "The supplied check marks these objects for review." },
    { id: "label-2", title: "Silkscreen overlap", severity: "warning", status: "excluded", rule: "Supplied text clearance rule", layer: "Front silkscreen", location: { x: 31, y: 22.4, unit: "mm" }, objects: ["J1 reference", "J1 outline"] },
  ]);
  const pending = results.some(result => result.pending);
  return <UseField name="design-rule-results"><UseType>Review the board check</UseType><UseBody><UseStack>
    <UseKicker>Example board / Check run 042</UseKicker>
    <DesignRuleResults label="Reported design rules" runLabel="Synthetic results, revision C" violations={results} selectedId={selectedId} onSelect={setSelectedId} onResolve={id => setResults(current => current.map(result => result.id === id ? { ...result, pending: true } : result))} />
    {pending && <UseActions><Button variant="ghost" onClick={() => setResults(current => current.map(result => result.pending ? { ...result, pending: false, status: "resolved" } : result))}>Confirm example resolution</Button></UseActions>}
    <UseCopy>{pending ? "The resolution request is pending. The reported result remains open until the example host confirms it." : selectedId ? `Selected result: ${selectedId}` : "Select a result to identify the corresponding board objects."}</UseCopy>
  </UseStack></UseBody></UseField>;
}
