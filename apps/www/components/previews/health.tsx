"use client";

import { useState, type ComponentType } from "react";
import {
  ActivityGoal, AppointmentCard, CarePlan, CheckIn, HabitTracker, HealthMetric,
  LabResults, MedicationSchedule, PatientBanner, ReferenceRange, SleepTimeline,
  SymptomDiary, type CarePlanTask, type HabitDay, type MedicationScheduleItem,
} from "@noorddev/vlak-react";

function HabitPreview() {
  const [days, setDays] = useState<HabitDay[]>([
    { date: "2026-09-04", label: "Friday", status: "complete" },
    { date: "2026-09-05", label: "Saturday", status: "skipped" },
    { date: "2026-09-06", label: "Sunday", status: "unrecorded" },
  ]);
  return <HabitTracker label="Evening walk" days={days} onDayChange={(date, status) => setDays(current => current.map(day => day.date === date ? { ...day, status } : day))} />;
}

function MedicationPreview() {
  const [items, setItems] = useState<MedicationScheduleItem[]>([
    { id: "morning", name: "Morning medication", dose: "Dose as prescribed", timeLabel: "08:00", status: "Not recorded", actions: [{ id: "record", label: "Record as taken" }] },
  ]);
  return <MedicationSchedule items={items} timeZone="Europe/Amsterdam" dateLabel="6 September" onAction={id => setItems(current => current.map(item => item.id === id ? { ...item, status: "Recorded as taken", actions: [] } : item))} />;
}

function CarePlanPreview() {
  const [tasks, setTasks] = useState<CarePlanTask[]>([
    { id: "journal", title: "Complete the daily journal", owner: "You", dueLabel: "This evening", status: "To do", completed: false },
  ]);
  return <CarePlan tasks={tasks} onCompletedChange={(id, completed) => setTasks(current => current.map(task => task.id === id ? { ...task, completed, status: completed ? "Completed" : "To do" } : task))} />;
}

export const healthPreviews: Record<string, ComponentType> = {
  "health-metric": () => <HealthMetric label="Resting heart rate" value={64} unit="bpm" timeLabel="Today, 08:30 CEST" dateTime="2026-09-06T06:30:00Z" source="Wearable" />,
  "reference-range": () => <ReferenceRange label="Example result" value={4.2} minimum={3} maximum={5} unit="units" rangeLabel="Supplied reference interval" />,
  "lab-results": () => <LabResults label="Results" results={[
    { id: "received", name: "Example result", value: 4.2, unit: "units", status: "final", minimum: 3, maximum: 5 },
    { id: "pending", name: "Additional result", status: "pending" },
  ]} />,
  "symptom-diary": () => <SymptomDiary entries={[
    { id: "entry", symptom: "Headache", dateTime: "2026-09-06T14:00:00Z", timeLabel: "6 September, 16:00 CEST", intensity: "Mild, self-reported", notes: "Recorded after the afternoon walk.", details: "Lasted around twenty minutes." },
  ]} />,
  "check-in": () => <CheckIn label="How is your energy?" options={[
    { value: "low", label: "Low" }, { value: "steady", label: "Steady" }, { value: "high", label: "High" },
  ]} />,
  "habit-tracker": HabitPreview,
  "sleep-timeline": () => <SleepTimeline label="Last night" start={0} end={480} startLabel="22:30" endLabel="06:30" intervals={[
    { id: "sleep", start: 0, end: 210, startLabel: "22:30", endLabel: "02:00", state: "asleep" },
    { id: "awake", start: 210, end: 225, startLabel: "02:00", endLabel: "02:15", state: "awake" },
    { id: "rest", start: 225, end: 480, startLabel: "02:15", endLabel: "06:30", state: "asleep" },
  ]} />,
  "activity-goal": () => <ActivityGoal label="Walking" current={18} target={30} unit="minutes" />,
  "patient-banner": () => <PatientBanner patientName="Alex Morgan" identifiers={[{ id: "record", label: "Record", value: "DEMO-204" }]} contextItems={[{ id: "allergies", label: "Allergies", value: "Not yet reviewed" }]} />,
  "medication-schedule": MedicationPreview,
  "appointment-card": () => <AppointmentCard appointmentTitle="Care check-in" dateLabel="10 September" timeLabel="10:30–11:00" timeZone="Europe/Amsterdam" clinician="Robin Lee" location="Video appointment" status="Confirmed" />,
  "care-plan": CarePlanPreview,
};
