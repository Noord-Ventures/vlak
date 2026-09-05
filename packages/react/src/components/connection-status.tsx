"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../tokens.stylex";
import { rs } from "../rs";
import { Button } from "./button";
import { Icon } from "./icon";

export type ConnectionState = "connecting" | "connected" | "offline" | "reconnecting";
export interface ConnectionStatusProps extends React.HTMLAttributes<HTMLDivElement> {
  state: ConnectionState;
  label?: string;
  description?: React.ReactNode;
  onRetry?: () => void | Promise<void>;
}
const styles = stylex.create({
  root: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.75rem", color: vlak.ink, minWidth: 0 },
  status: { display: "inline-flex", alignItems: "center", gap: "0.5rem", lineHeight: 1.45 },
  detail: { color: vlak.gray, fontSize: "0.875rem", lineHeight: 1.45, margin: 0 },
});

/** Application-supplied connection state. A successful retry does not assume reconnection. */
export const ConnectionStatus = React.forwardRef<HTMLDivElement, ConnectionStatusProps>(function ConnectionStatus({ state, label, description, onRetry, className, style, ...props }, ref) {
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const generation = React.useRef(0);
  React.useEffect(() => { generation.current++; setBusy(false); setError(""); return () => { generation.current++; }; }, [state]);
  const retry = async () => { if (!onRetry || busy) return; const id = ++generation.current; setBusy(true); setError(""); try { await onRetry(); } catch { if (id === generation.current) setError("Could not reconnect. Try again."); } finally { if (id === generation.current) setBusy(false); } };
  const root = rs(["rs-connection-status", className], styles.root);
  const status = rs(["rs-connection-status-label"], styles.status);
  const detail = rs(["rs-connection-status-detail"], styles.detail);
  const names: Record<ConnectionState, string> = { connecting: "Connecting", connected: "Connected", offline: "Offline", reconnecting: "Reconnecting" };
  return <div ref={ref} {...props} className={root.className} style={{ ...root.style, ...style }}>
    <span {...status} role="status"><Icon name={state === "offline" ? "wifi-off" : "wifi"} size={16} />{label ?? names[state]}</span>{description != null && <span {...detail}>{description}</span>}{onRetry && state === "offline" && <Button variant="ghost" disabled={busy} onClick={retry}>{busy ? "Retrying" : "Retry connection"}</Button>}{error && <p {...detail} role="alert">{error}</p>}
  </div>;
});
