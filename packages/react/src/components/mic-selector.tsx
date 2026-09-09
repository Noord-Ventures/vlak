"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../tokens.stylex";
import { rs } from "../rs";
import { Button } from "./button";
import { Combobox } from "./combobox";

export type AudioDeviceStatus = "loading" | "ready" | "denied" | "unavailable" | "error";
export interface AudioDevicesState {
  devices: readonly MediaDeviceInfo[];
  status: AudioDeviceStatus;
  error: string | null;
  requestAccess: () => Promise<void>;
  refresh: () => Promise<void>;
}

/** Enumerates inputs without opening a microphone; requestAccess is an explicit user action. */
export function useAudioDevices(): AudioDevicesState {
  const [devices, setDevices] = React.useState<MediaDeviceInfo[]>([]);
  const [status, setStatus] = React.useState<AudioDeviceStatus>("loading");
  const [error, setError] = React.useState<string | null>(null);
  const mounted = React.useRef(false);
  const version = React.useRef(0);
  const requesting = React.useRef(false);
  const load = React.useCallback(async (permission: boolean) => {
    if (!mounted.current || requesting.current) return;
    const media = navigator.mediaDevices;
    if (!media?.enumerateDevices || (permission && !media.getUserMedia)) {
      setStatus("unavailable"); setError("Microphone selection is unavailable in this browser."); return;
    }
    const request = ++version.current;
    requesting.current = permission;
    setStatus("loading"); setError(null);
    let stream: MediaStream | undefined;
    try {
      if (permission) stream = await media.getUserMedia({ audio: true });
      if (!mounted.current || request !== version.current) return;
      const next = (await media.enumerateDevices()).filter(device => device.kind === "audioinput");
      if (mounted.current && request === version.current) { setDevices(next); setStatus("ready"); }
    } catch (reason) {
      if (!mounted.current || request !== version.current) return;
      const denied = typeof reason === "object" && reason !== null && "name" in reason && reason.name === "NotAllowedError";
      setStatus(denied ? "denied" : "error");
      setError(denied ? "Microphone permission was denied. Allow access in your browser and try again." : "Microphones could not be loaded. Try again.");
    } finally {
      stream?.getTracks().forEach(track => { track.stop(); });
      if (request === version.current) requesting.current = false;
    }
  }, []);
  React.useEffect(() => {
    mounted.current = true;
    const refresh = () => { void load(false); };
    refresh();
    navigator.mediaDevices?.addEventListener?.("devicechange", refresh);
    return () => {
      mounted.current = false; version.current++; requesting.current = false;
      navigator.mediaDevices?.removeEventListener?.("devicechange", refresh);
    };
  }, [load]);
  return { devices, status, error, refresh: React.useCallback(() => load(false), [load]), requestAccess: React.useCallback(() => load(true), [load]) };
}

export interface MicSelectorProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (deviceId: string) => void;
  label?: string;
  disabled?: boolean;
}
const styles = stylex.create({
  root: { display: "grid", gap: "0.5rem", minWidth: 0, width: "100%", color: vlak.ink },
  label: { fontSize: vlak.controlFs, fontWeight: 500, lineHeight: 1.45 },
  actions: { display: "flex", flexWrap: "wrap", gap: "0.5rem" },
  message: { margin: 0, fontSize: vlak.controlLabel, color: vlak.gray, lineHeight: 1.45 },
});

/** Searchable microphone choice. The application owns capture and the selected device's use. */
export const MicSelector = React.forwardRef<HTMLDivElement, MicSelectorProps>(function MicSelector({ value, defaultValue = "", onValueChange, label = "Microphone", disabled = false, className, style, ...props }, ref) {
  const { devices, status, error, requestAccess, refresh } = useAudioDevices();
  const [inner, setInner] = React.useState(defaultValue);
  const selected = value ?? inner;
  const id = React.useId();
  const missing = Boolean(selected && status === "ready" && !devices.some(device => device.deviceId === selected));
  const options = devices.filter(device => device.deviceId).map((device, index) => ({ value: device.deviceId, label: device.label || `Microphone ${index + 1}` }));
  if (missing) options.unshift({ value: selected, label: "Selected microphone unavailable" });
  const root = rs(["rs-mic-selector", className], styles.root);
  const heading = rs(["rs-mic-selector-label"], styles.label);
  const actions = rs(["rs-mic-selector-actions"], styles.actions);
  const message = rs(["rs-mic-selector-message"], styles.message);
  const needsPermission = !devices.length || devices.some(device => !device.label);
  return <div ref={ref} {...props} className={root.className} style={{ ...root.style, ...style }}>
    <span {...heading} id={`${id}-label`}>{label}</span>
    <Combobox options={options} value={selected} onValueChange={next => { if (value === undefined) setInner(next); onValueChange?.(next); }} aria-labelledby={`${id}-label`} aria-describedby={`${id}-status`} placeholder="Select microphone…" emptyLabel="No microphones found" disabled={disabled || status === "loading" || status === "unavailable"} />
    <div {...actions}>
      {needsPermission && status !== "unavailable" && <Button variant="subtle" size="sm" disabled={disabled || status === "loading"} onClick={() => { void requestAccess(); }}>Allow microphone access</Button>}
      <Button variant="subtle" size="sm" disabled={disabled || status === "loading" || status === "unavailable"} onClick={() => { void refresh(); }}>Refresh microphones</Button>
    </div>
    <p {...message} id={`${id}-status`} role="status">{error ?? (status === "loading" ? "Loading microphones…" : missing ? "The selected microphone is disconnected. Choose another input." : devices.length === 0 ? "No microphones available. Allow access to discover inputs." : "Selecting an input does not start recording.")}</p>
  </div>;
});
