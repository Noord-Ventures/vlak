"use client";
import { useState } from "react";
import { KanbanBoard, type KanbanCard } from "@noorddev/vlak-react";
import { UseField, UseType, UseBody } from "../use-frame";
export function Use() {
  const [cards, setCards] = useState<KanbanCard[]>([{ id: "a", title: "Choose the paper", description: "Compare the two uncoated stocks.", columnId: "todo" }, { id: "b", title: "Review the proof", description: "Final copy and registration.", columnId: "doing" }, { id: "c", title: "Set the type", columnId: "done" }]);
  return <UseField name="kanban-board"><UseType>From proof to press</UseType><UseBody><KanbanBoard label="Print production" columns={[{ id: "todo", label: "To do" }, { id: "doing", label: "In progress" }, { id: "done", label: "Done" }]} value={cards} onValueChange={setCards} /></UseBody></UseField>;
}
