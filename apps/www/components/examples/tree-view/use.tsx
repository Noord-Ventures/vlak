"use client";

import { TreeView } from "@noorddev/vlak-react";

export function Use() {
  return <TreeView label="Studies" defaultExpanded={["studies"]} defaultValue="drive" nodes={[{ id: "studies", label: "Studies", children: [{ id: "drive", label: "Drive" }, { id: "orbit", label: "Orbit" }] }, { id: "archive", label: "Archive" }]} />;
}
