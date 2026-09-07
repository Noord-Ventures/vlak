"use client";

import * as React from "react";
import { CarePlan, type CarePlanTask } from "@noorddev/vlak-react";
import { UseBody, UseCopy, UseField, UseStack, UseType } from "../use-frame";

const initialTasks: CarePlanTask[] = [
  { id: "questions", title: "Prepare questions for the visit", owner: "Robin Ellis", dueLabel: "17 September", status: "Open", completed: false },
  { id: "documents", title: "Review the visit documents", owner: "Care coordinator", dueLabel: "18 September", status: "Awaiting coordinator", completed: false, disabled: true },
  { id: "contact", title: "Confirm the preferred contact method", owner: "Robin Ellis", dueLabel: "At the next visit", status: "Completion not reviewed" },
];

export function Use() {
  const [tasks, setTasks] = React.useState(initialTasks);
  return <UseField name="care-plan"><UseType>Getting ready together</UseType><UseBody><UseStack>
    <UseCopy>Fictional coordination tasks. Changes stay in this example; unknown completion stays unmarked.</UseCopy>
    <CarePlan tasks={tasks} onCompletedChange={(taskId, completed) => setTasks(current => current.map(task => task.id === taskId ? { ...task, completed, status: completed ? "Complete, in this example" : "Open" } : task))} />
  </UseStack></UseBody></UseField>;
}
