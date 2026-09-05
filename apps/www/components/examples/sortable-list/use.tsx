"use client";

import { SortableList } from "@noorddev/vlak-react";

export function Use() {
  return <SortableList defaultValue={[{ id: "research", label: "Research" }, { id: "design", label: "Design" }, { id: "build", label: "Build" }]} />;
}
