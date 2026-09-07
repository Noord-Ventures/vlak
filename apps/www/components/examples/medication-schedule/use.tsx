"use client";

import * as React from "react";
import { MedicationSchedule, type MedicationScheduleItem } from "@noorddev/vlak-react";
import { UseBody, UseCopy, UseField, UseStack, UseType } from "../use-frame";

const initialItems: MedicationScheduleItem[] = [
  { id: "morning", name: "Example medication A", dose: "Dose supplied by the care team", timeLabel: "08:00", status: "Not recorded", instructions: "Instructions supplied by the care team", actions: [{ id: "taken", label: "Record as taken" }, { id: "not-taken", label: "Record as not taken" }] },
  { id: "evening", name: "Example medication B", dose: "Dose supplied by the care team", timeLabel: "20:00", status: "Awaiting review", disabled: true, actions: [{ id: "taken", label: "Record as taken" }] },
];

export function Use() {
  const [items, setItems] = React.useState(initialItems);
  return <UseField name="medication-schedule"><UseType>Today's record</UseType><UseBody><UseStack>
    <UseCopy>Fictional entries. Choices update this example only; they are not saved to a patient record.</UseCopy>
    <MedicationSchedule dateLabel="14 September 2026" timeZone="Europe/Amsterdam, UTC+02:00" items={items} onAction={(itemId, actionId) => setItems(current => current.map(item => item.id === itemId ? { ...item, status: actionId === "taken" ? "Taken, in this example" : "Not taken, in this example" } : item))} />
  </UseStack></UseBody></UseField>;
}
