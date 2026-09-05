"use client";

import { useState } from "react";
import { Toolbar } from "@noorddev/vlak-react";

export function Use() {
  const [status, setStatus] = useState("Choose an action");
  return <div className="rs-use-stack"><Toolbar label="Editing" actions={[{ id: "copy", label: "Copy", icon: "copy", onAction: () => setStatus("Action selected") }, { id: "undo", label: "Undo", icon: "undo", onAction: () => setStatus("Action selected") }]} /><p role="status">{status}</p></div>;
}
