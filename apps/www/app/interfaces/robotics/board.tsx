"use client";

import * as React from "react";
import { AlarmPanel, Button, Card, Icon, JointPanel, RobotMissionQueue, RobotPose, ToggleGroup } from "@noorddev/vlak-react";
import type { AlarmRecord, JointTargets, RobotMissionStep, RobotPoseRecord } from "@noorddev/vlak-react";

type Screen = "monitor" | "joints" | "mission" | "debug";
type Inspector = "joint" | "pose" | "events" | "alarms";
type DebugEvent = { id: number; title: string; detail: string };
const joints = [
  { id: "shoulder", label: "Shoulder", unit: "deg", minimum: -90, maximum: 90, base: 24 },
  { id: "elbow", label: "Elbow", unit: "deg", minimum: -120, maximum: 120, base: -38 },
  { id: "wrist", label: "Wrist", unit: "deg", minimum: -180, maximum: 180, base: 12 },
];
const initialMission: RobotMissionStep[] = [
  { id: "approach", label: "Approach fixture", detail: "Recorded plan · waypoint 01", status: "Awaiting review", actions: [{ id: "review", label: "Review step" }] },
  { id: "inspect", label: "Inspect surface", detail: "Recorded plan · waypoint 02", status: "Awaiting review", actions: [{ id: "review", label: "Review step" }] },
  { id: "return", label: "Return to rest", detail: "Recorded plan · waypoint 03", status: "Awaiting review", actions: [{ id: "review", label: "Review step" }] },
];
const initialAlarm: AlarmRecord = { id: "sample", label: "Sample camera unavailable", source: "Inspection camera", priority: "Information", condition: "active", acknowledgement: "unacknowledged", shelving: "unshelved", timeLabel: "Sample 000", note: "Synthetic diagnostic record. Acknowledgement keeps the condition active.", actions: ["acknowledge"] };

export function RoboticsBoard() {
  const [running, setRunning] = React.useState(true);
  const [tick, setTick] = React.useState(0);
  const [base, setBase] = React.useState<Record<string, number>>({ shoulder: 24, elbow: -38, wrist: 12 });
  const [targets, setTargets] = React.useState<JointTargets>({ shoulder: 24, elbow: -38, wrist: 12 });
  const [selected, setSelected] = React.useState("shoulder");
  const [screen, setScreen] = React.useState<Screen>("monitor");
  const [inspector, setInspector] = React.useState<Inspector>("joint");
  const [request, setRequest] = React.useState<{ id: string; value: number } | null>(null);
  const [confirmed, setConfirmed] = React.useState<{ id: string; label: string } | null>(null);
  const [mission, setMission] = React.useState(initialMission);
  const [alarms, setAlarms] = React.useState([initialAlarm]);
  const [events, setEvents] = React.useState<DebugEvent[]>([{ id: 1, title: "Sample stream ready", detail: "Three joint records loaded. The local sample clock updates once per second; no controller is connected." }]);
  const [eventId, setEventId] = React.useState<number | null>(null);
  const [announcement, setAnnouncement] = React.useState("");
  const [poseId, setPoseId] = React.useState<string | null>("sample");
  const nextEvent = React.useRef(2);
  const heading = React.useRef<HTMLHeadingElement>(null);
  const jointButtons = React.useRef(new Map<string, HTMLButtonElement>());
  const eventButtons = React.useRef(new Map<number, HTMLButtonElement>());
  const poseButton = React.useRef<HTMLButtonElement>(null);
  const eventHeading = React.useRef<HTMLHeadingElement>(null);
  const confirmButton = React.useRef<HTMLButtonElement>(null);
  const uid = React.useId().replaceAll(":", "");

  React.useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const stop = () => { if (reduced.matches) setRunning(false); };
    stop(); reduced.addEventListener("change", stop);
    return () => reduced.removeEventListener("change", stop);
  }, []);
  React.useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setTick(value => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  const records = joints.map((joint, index) => ({ ...joint, reported: Number(Math.min(joint.maximum, Math.max(joint.minimum, (base[joint.id] ?? joint.base) + Math.sin(tick * Math.PI / 12) * (index + 1) * 0.4)).toFixed(2)) }));
  const joint = records.find(item => item.id === selected)!;
  const shoulder = records[0]!.reported * Math.PI / 180;
  const elbow = records[1]!.reported * Math.PI / 180;
  const a = { x: 195, y: 266 };
  const b = { x: a.x + Math.sin(shoulder) * 130, y: a.y - Math.cos(shoulder) * 130 };
  const c = { x: b.x + Math.cos(elbow) * 120, y: b.y + Math.sin(elbow) * 120 };
  const selectedEvent = events.find(event => event.id === eventId);
  const pose: RobotPoseRecord = { id: "sample", label: "Current sample", frame: "Illustrative base frame", timeLabel: `Sample ${String(tick).padStart(3, "0")}`, status: running ? "Streaming local records" : "Paused local records", translation: { x: Number(c.x.toFixed(2)), y: Number(c.y.toFixed(2)), z: 0, unit: "drawing units" }, orientation: { representation: "Illustration angles, independent named values", components: records.map(record => ({ id: record.id, label: record.label, value: record.reported, unit: "deg" })) } };

  function log(title: string, detail: string) {
    setEvents(current => [{ id: nextEvent.current++, title, detail }, ...current].slice(0, 40));
    setAnnouncement(title);
  }
  function openJoint(id: string) { setSelected(id); setInspector("joint"); setScreen("joints"); setEventId(null); requestAnimationFrame(() => heading.current?.focus({ preventScroll: true })); }
  function backToMonitor() { setScreen("monitor"); setInspector("joint"); requestAnimationFrame(() => jointButtons.current.get(selected)?.focus({ preventScroll: true })); }
  function confirmRequest() {
    if (!request) return;
    setBase(current => ({ ...current, [request.id]: request.value })); setTick(0); setRunning(false);
    setConfirmed({ id: request.id, label: `${request.value} deg accepted by local simulator. Stream paused.` });
    log("Simulated target applied", `${request.id}: ${request.value} deg. Only the local record and drawing changed; no motion command was sent.`);
    setRequest(null);
    requestAnimationFrame(() => heading.current?.focus({ preventScroll: true }));
  }
  function navigate(next: Screen) { setScreen(next); setEventId(null); setInspector(next === "debug" ? "events" : "joint"); }
  const sideTitle = screen === "mission" ? "Inspection plan" : inspector === "pose" ? "Pose record" : screen === "debug" ? "Debug console" : `${joint.label} joint`;

  return <div className="rb-frame"><section className="rb" data-screen={screen} aria-label="Robot telemetry workspace">
    <header className="rb-header"><div className="rb-brand"><Icon name="crosshair" /><div><strong>Inspection arm</strong><span>Cell 04 / commissioning</span></div></div><span className="rb-local"><span />Local simulation</span><Button variant="ghost" size="sm" onClick={() => { setRunning(value => !value); log(running ? "Telemetry paused" : "Telemetry resumed", `Sample clock ${running ? "paused" : "resumed"} at ${tick}.`); }}><Icon name={running ? "pause" : "play"} /><span>{running ? "Pause" : "Resume"}</span></Button></header>
    <div className="rb-body">
      <section className="rb-monitor" aria-label="Robot monitor">
        <div className="rb-view-head"><span><Icon name="move" size={16} />Base frame</span><span className="rb-number">Sample {String(tick).padStart(3, "0")}</span></div>
        <div className="rb-stage"><div className="rb-stage-label"><span>Inspection arm / 03 joints</span><strong>{running ? "Sample stream" : "Stream paused"}</strong></div>
          <svg className="rb-robot" viewBox="0 0 500 350" aria-hidden="true"><defs><pattern id={`${uid}-grid`} width="25" height="25" patternUnits="userSpaceOnUse"><path d="M25 0H0V25" className="rb-grid" /></pattern></defs><rect width="500" height="350" fill={`url(#${uid}-grid)`} /><path d="M65 295H430M100 318H455" className="rb-floor" /><path d="M164 295V268H226V295Z" className="rb-base" /><path d={`M${a.x} ${a.y}L${b.x} ${b.y}L${c.x} ${c.y}`} className="rb-arm-outline" /><path d={`M${a.x} ${a.y}L${b.x} ${b.y}L${c.x} ${c.y}`} className="rb-arm" />{[a, b, c].map((point, index) => <g key={joints[index]!.id}><circle cx={point.x} cy={point.y} r={selected === joints[index]!.id ? 21 : 15} className={selected === joints[index]!.id ? "rb-joint rb-joint-active" : "rb-joint"} /><circle cx={point.x} cy={point.y} r="4" className="rb-joint-core" /></g>)}<path d={`M${c.x + 14} ${c.y}h24v-12m0 12v12m-8-24h14m-14 24h14`} className="rb-gripper" /><path d="M67 264v-40m0 40h40" className="rb-axis" /><text x="112" y="270">x</text><text x="63" y="216">y</text></svg>
          <div className="rb-stage-foot"><span>Illustrative geometry</span><Button variant="ghost" size="sm" ref={poseButton} onClick={() => { setInspector("pose"); setScreen("joints"); requestAnimationFrame(() => heading.current?.focus({ preventScroll: true })); }}><Icon name="layers" size={16} />Inspect pose</Button></div>
        </div>
        <div className="rb-joint-list" role="group" aria-label="Select a joint">{records.map((record, index) => <Button variant="ghost" className="rb-joint-row" key={record.id} ref={node => { if (node) jointButtons.current.set(record.id, node); }} aria-pressed={selected === record.id} onClick={() => openJoint(record.id)}><span className="rb-joint-index">0{index + 1}</span><span>{record.label}<small>Reported position</small></span><strong>{record.reported.toFixed(2)}<small>deg</small></strong><Icon name="chevron-right" size={16} /></Button>)}</div>
        <div className="rb-trace"><span>Sample pattern / 24 steps</span><svg viewBox="0 0 400 44" aria-hidden="true"><polyline points={Array.from({ length: 49 }, (_, i) => `${i * 8.3},${22 - Math.sin((tick - 48 + i) * Math.PI / 12) * 14}`).join(" ")} /></svg><Button variant="ghost" size="sm" disabled={running} onClick={() => { setTick(value => value + 1); log("Advanced one sample", "Manual step of the deterministic local telemetry stream."); }}>Step<Icon name="arrow-right" size={16} /></Button></div>
      </section>
      <section className="rb-inspector" aria-label="Robot inspector"><div className="rb-inspector-head"><Button variant="ghost" className="rb-back" aria-label="Back to monitor" onClick={() => { if (inspector === "pose") { setScreen("monitor"); setInspector("joint"); requestAnimationFrame(() => poseButton.current?.focus()); } else backToMonitor(); }}><Icon name="arrow-left" /></Button><div><span className="rb-eyebrow">{screen === "mission" ? "Local review" : screen === "debug" ? "Diagnostics" : "Inspector"}</span><h2 ref={heading} tabIndex={-1}>{sideTitle}</h2></div></div>
        <div className="rb-desktop-tabs"><ToggleGroup aria-label="Inspector view" value={screen === "mission" ? "mission" : screen === "debug" ? "debug" : "joints"} onValueChange={value => navigate(value as Screen)} options={[{ value: "joints", label: "Joint" }, { value: "mission", label: "Mission" }, { value: "debug", label: "Debug" }]} /></div>
        <div className="rb-inspector-scroll">
          {screen === "mission" ? <RobotMissionQueue label="Sample inspection sequence" steps={mission} onOrderChange={ids => { setMission(current => ids.map(id => current.find(step => step.id === id)!)); log("Plan order updated", "Only the local review order changed. The mission was not executed."); }} onAction={id => { setMission(current => current.map(step => step.id === id ? { ...step, status: "Reviewed locally", confirmedLabel: "Review recorded in this tab", actions: [] } : step)); log("Mission step reviewed", `${id}: local review recorded. No execution was requested.`); }} /> : screen === "debug" ? <>
            <ToggleGroup aria-label="Debug view" value={inspector === "alarms" ? "alarms" : "events"} onValueChange={value => { setInspector(value as Inspector); setEventId(null); }} options={[{ value: "events", label: "Events" }, { value: "alarms", label: "Alarms" }]} />
            {inspector === "alarms" ? <AlarmPanel label="Diagnostic records" alarms={alarms} onAction={id => { setAlarms(current => current.map(alarm => alarm.id === id ? { ...alarm, acknowledgement: "acknowledged", actions: [] } : alarm)); log("Diagnostic acknowledged", "The sample camera condition stays active. Acknowledgement records review only."); }} /> : selectedEvent ? <Card className="rb-event-detail"><Button variant="ghost" size="sm" onClick={() => { setEventId(null); requestAnimationFrame(() => eventButtons.current.get(selectedEvent.id)?.focus()); }}><Icon name="arrow-left" size={16} />All events</Button><span className="rb-eyebrow">Event {String(selectedEvent.id).padStart(3, "0")}</span><h3 ref={eventHeading} tabIndex={-1}>{selectedEvent.title}</h3><p>{selectedEvent.detail}</p></Card> : <><p className="rb-copy">Actions and simulator state changes. Latest first.</p><ol className="rb-events">{events.map(event => <li key={event.id}><Button variant="ghost" className="rb-event" ref={node => { if (node) eventButtons.current.set(event.id, node); }} onClick={() => { setEventId(event.id); requestAnimationFrame(() => eventHeading.current?.focus({ preventScroll: true })); }}><span>{String(event.id).padStart(3, "0")}</span><strong>{event.title}</strong><Icon name="chevron-right" size={16} /></Button></li>)}</ol></>}
          </> : inspector === "pose" ? <RobotPose label="Illustration record" poses={[pose]} value={poseId} onValueChange={setPoseId} /> : <JointPanel label="Target editor" joints={[joint]} value={{ [selected]: targets[selected] ?? null }} onValueChange={next => setTargets(current => ({ ...current, ...next }))} onRequestTargets={next => { setRequest({ id: selected, value: next[selected]! }); log("Target awaiting confirmation", `${selected}: ${next[selected]} deg is a draft. Reported positions are unchanged.`); requestAnimationFrame(() => confirmButton.current?.focus({ preventScroll: true })); }} pending={request != null} timeLabel={`Sample ${String(tick).padStart(3, "0")}`} confirmedLabel={confirmed?.id === selected ? confirmed.label : undefined} />}
        </div>
        {request && <div className="rb-confirm"><span><strong>Apply to simulation?</strong><small>{request.id} → {request.value} deg. Pauses stream.</small></span><div><Button ref={confirmButton} size="sm" onClick={confirmRequest}>Confirm simulation</Button><Button variant="ghost" size="sm" onClick={() => { setRequest(null); log("Target request canceled", "Reported records were kept."); }}>Cancel</Button></div></div>}
      </section>
    </div>
    <footer className="rb-footer"><span><Icon name="terminal" size={12} />Local deterministic stream</span><span>No hardware connected</span></footer>
    <nav className="rb-mobile-nav" aria-label="Robotics screens">{([{ value: "monitor", label: "Monitor", icon: "activity" }, { value: "joints", label: "Joints", icon: "sliders" }, { value: "mission", label: "Mission", icon: "list" }, { value: "debug", label: "Debug", icon: "terminal" }] as const).map(item => <Button key={item.value} variant="ghost" aria-pressed={screen === item.value} onClick={() => navigate(item.value)}><Icon name={item.icon} /><span>{item.label}</span></Button>)}</nav>
    <span className="rb-announcement" role="status">{announcement}</span>
  </section></div>;
}
