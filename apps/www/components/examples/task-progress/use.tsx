"use client";

import { useState } from "react";
import { TaskProgress } from "@noorddev/vlak-react";

export function Use() {
  const [cancelled, setCancelled] = useState(false);
  return <TaskProgress label="Exporting study" state={cancelled ? "cancelled" : "running"} value={42} elapsedSeconds={12} onCancel={() => setCancelled(true)} onRetry={() => setCancelled(false)} phases={[{ id: "prepare", label: "Prepare", state: "complete" }, { id: "render", label: "Render", state: "active" }]} />;
}
