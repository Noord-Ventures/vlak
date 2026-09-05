"use client";

import { FilterBar } from "@noorddev/vlak-react";

export function Use() {
  return <FilterBar defaultValue={[{ id: "city", label: "Alkmaar" }, { id: "status", label: "Published" }]} resultCount={12} />;
}
