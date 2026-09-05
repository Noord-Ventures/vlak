"use client";
import { useState } from "react";
import { Scheduler, type SchedulerEvent } from "@noorddev/vlak-react";
import { UseField, UseType, UseBody, UseStack, UseCopy } from "../use-frame";
export function Use() {
  const [events, setEvents] = useState<SchedulerEvent[]>([{ id: "review", title: "Proof review", start: new Date(2026, 8, 7, 9), end: new Date(2026, 8, 7, 9, 30) }, { id: "press", title: "Press check", start: new Date(2026, 8, 9, 11), end: new Date(2026, 8, 9, 12) }]);
  const [selected, setSelected] = useState("");
  return <UseField name="scheduler"><UseType>The week ahead</UseType><UseBody><UseStack><Scheduler events={events} defaultValue={new Date(2026, 8, 7)} onEventSelect={event => setSelected(event.title)} onSlotSelect={start => setEvents([...events, { id: "new-" + events.length, title: "Studio session", start, end: new Date(start.getTime() + 30 * 60000) }])} onEventMove={(event, next) => setEvents(events.map(item => item.id === event.id ? { ...item, ...next } : item))} />{selected && <UseCopy>Selected: {selected}</UseCopy>}</UseStack></UseBody></UseField>;
}
