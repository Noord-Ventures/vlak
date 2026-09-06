"use client";

import { useState } from "react";
import { AlarmPanel } from "@noorddev/vlak-react";
import type { AlarmRecord } from "@noorddev/vlak-react";
import { UseField, UseType, UseBody, UseStack, UseKicker } from "../use-frame";

export function Use() {
  const [alarms, setAlarms] = useState<AlarmRecord[]>([{ id: "flow", label: "Cooling flow", source: "Circulation loop / Example event", priority: "Medium", condition: "cleared", acknowledgement: "unacknowledged", shelving: "unshelved", timeLabel: "14:32, plant time", actions: ["acknowledge"] }]);
  return <UseField name="alarm-panel"><UseType>Review a cleared event</UseType><UseBody><UseStack><UseKicker>Operator log / Local demonstration</UseKicker><AlarmPanel label="Circulation events" description="The condition cleared before the operator reviewed it." alarms={alarms} onAction={id => setAlarms(current => current.map(alarm => alarm.id === id ? { ...alarm, acknowledgement: "acknowledged", actions: [] } : alarm))} /></UseStack></UseBody></UseField>;
}
