"use client";

import { useState } from "react";
import { HabitTracker, type HabitDay } from "@noorddev/vlak-react";
import { UseField, UseType, UseBody, UseStack, UseKicker, UseCopy } from "../use-frame";

const initialDays: HabitDay[] = [
  { date: "2026-09-07", label: "Mon 7", status: "complete" },
  { date: "2026-09-08", label: "Tue 8", status: "complete" },
  { date: "2026-09-09", label: "Wed 9", status: "skipped" },
  { date: "2026-09-10", label: "Thu 10", status: "missed" },
  { date: "2026-09-11", label: "Fri 11", status: "complete" },
  { date: "2026-09-12", label: "Sat 12", status: "unrecorded" },
  { date: "2026-09-13", label: "Sun 13", status: "unrecorded" },
];

export function Use() {
  const [days, setDays] = useState(initialDays);
  return <UseField name="habit-tracker"><UseType>Make room for a walk</UseType><UseBody><UseStack><UseKicker>7–13 September 2026</UseKicker><HabitTracker label="Evening walk" description="Mark a day complete, or clear a completed day." days={days} onDayChange={(date, status) => setDays((current) => current.map((day) => day.date === date ? { ...day, status } : day))} /><UseCopy>This example keeps changes only while the page is open.</UseCopy></UseStack></UseBody></UseField>;
}
