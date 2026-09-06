"use client";

import { useState } from "react";
import { WorkOffsetPanel } from "@noorddev/vlak-react";
import type { WorkOffsetValue } from "@noorddev/vlak-react";
import { UseField, UseType, UseBody, UseStack, UseKicker } from "../use-frame";

export function Use() {
  const [draft, setDraft] = useState<WorkOffsetValue>({ systemId: "g54", offsets: { x: 125, y: 50 } });
  const [request, setRequest] = useState<WorkOffsetValue | null>(null);
  return <UseField name="work-offset-panel"><UseType>Prepare fixture offsets</UseType><UseBody><UseStack><UseKicker>Setup record / Example controller readings</UseKicker><WorkOffsetPanel label="Fixture A" activeSystemId="g54" offsetState="active" systems={[{ id: "g54", label: "G54" }]} axes={[{ id: "x", label: "X", unit: "mm", machine: 145, work: 20 }, { id: "y", label: "Y", unit: "mm", machine: 60, work: 10 }]} value={draft} onValueChange={next => { setDraft(next); setRequest(null); }} onApply={setRequest} description={request ? `Draft received: X ${request.offsets.x} mm, Y ${request.offsets.y} mm. Controller acceptance is still unconfirmed.` : "Edit the draft and send a local apply request."} /></UseStack></UseBody></UseField>;
}
