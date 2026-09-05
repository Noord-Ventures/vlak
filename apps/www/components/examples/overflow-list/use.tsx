"use client";

import { useState } from "react";
import { OverflowList } from "@noorddev/vlak-react";

export function Use() {
  const [status, setStatus] = useState("Choose an action");
  return <div className="rs-use-stack"><OverflowList maxVisible={2} items={[{ id: "copy", label: "Copy", onAction: () => setStatus("Action selected") }, { id: "duplicate", label: "Duplicate", onAction: () => setStatus("Action selected") }, { id: "archive", label: "Archive", onAction: () => setStatus("Action selected") }]} /><p role="status">{status}</p></div>;
}
