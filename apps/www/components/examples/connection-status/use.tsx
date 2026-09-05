"use client";

import { useState } from "react";
import { ConnectionStatus } from "@noorddev/vlak-react";

export function Use() {
  const [connected, setConnected] = useState(false);
  return <ConnectionStatus state={connected ? "connected" : "offline"} description={connected ? "Changes are synchronized" : "Your work is saved on this device"} onRetry={() => setConnected(true)} />;
}
