"use client";

import { useState } from "react";
import type { ComponentType } from "react";
import { AlarmPanel, WorkOffsetPanel } from "@noorddev/vlak-react";
import type { AlarmRecord, WorkOffsetValue } from "@noorddev/vlak-react";

function AlarmPreview() {
  const [alarms, setAlarms] = useState<AlarmRecord[]>([
    { id: "flow", label: "Cooling flow", source: "Circulation loop", priority: "Medium", condition: "cleared", acknowledgement: "unacknowledged", shelving: "unshelved", actions: ["acknowledge", "shelve"] },
    { id: "sensor", label: "Sensor connection", source: "Example instrument", condition: "active", acknowledgement: "acknowledged", shelving: "shelved", shelvedUntilLabel: "15:00, local plant time", actions: ["unshelve"] },
  ]);
  return <AlarmPanel label="Plant alarms" alarms={alarms} onAction={(id, action) => setAlarms(current => current.map(alarm => alarm.id !== id ? alarm : action === "acknowledge" ? { ...alarm, acknowledgement: "acknowledged", actions: alarm.actions?.filter(item => item !== "acknowledge") } : { ...alarm, shelving: action === "shelve" ? "shelved" : "unshelved", shelvedUntilLabel: action === "shelve" ? "15:00, local plant time" : undefined, actions: alarm.actions?.map(item => item === "shelve" ? "unshelve" : item === "unshelve" ? "shelve" : item) }))} />;
}
function WorkOffsetPreview() {
  const [value, setValue] = useState<WorkOffsetValue>({ systemId: "g54", offsets: { x: 125, y: 50, z: 0 } });
  const [requested, setRequested] = useState(false);
  return <WorkOffsetPanel label="Work coordinates" activeSystemId="g54" offsetState="active" axes={[{ id: "x", label: "X", unit: "mm", machine: 145, work: 20 }, { id: "y", label: "Y", unit: "mm", machine: 60, work: 10 }, { id: "z", label: "Z", unit: "mm", machine: 0, work: 0 }]} systems={[{ id: "g54", label: "G54" }, { id: "g55", label: "G55" }]} value={value} onValueChange={next => { setValue(next); setRequested(false); }} onApply={() => setRequested(true)} description={requested ? "Draft received locally. Reported controller readings remain unchanged." : "Recorded positions and editable fixture offsets"} />;
}
export const engineeringPreviews: Record<string, ComponentType> = {
  "alarm-panel": AlarmPreview,
  "work-offset-panel": WorkOffsetPreview,
};
