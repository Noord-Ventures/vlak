"use client";

import * as React from "react";
import { AlarmPanel, Button, Card, Icon, JointPanel, RobotMissionQueue, RobotPose, Select, ToggleGroup } from "@noorddev/vlak-react";
import type { AlarmRecord, JointTargets, RobotMissionStep, RobotPoseRecord } from "@noorddev/vlak-react";

import { ArmScene, type ArmView } from "./arm-scene";
import { armPose, initialAngles, jointDefinitions as joints, sampleArm, type ArmAngles, type ArmClock, type JointId } from "./simulation";

type Screen = "monitor" | "joints" | "mission" | "debug";
type Inspector = "joint" | "pose" | "events" | "alarms";
type DebugEvent = { id: number; title: string; detail: string };
const initialMission: RobotMissionStep[] = [
  { id: "approach", label: "Approach fixture", detail: "Recorded plan · waypoint 01", status: "Awaiting review", actions: [{ id: "review", label: "Review step" }] },
  { id: "inspect", label: "Inspect surface", detail: "Recorded plan · waypoint 02", status: "Awaiting review", actions: [{ id: "review", label: "Review step" }] },
  { id: "return", label: "Return to rest", detail: "Recorded plan · waypoint 03", status: "Awaiting review", actions: [{ id: "review", label: "Review step" }] },
];
const initialAlarm: AlarmRecord = { id: "sample", label: "Sample camera unavailable", source: "Inspection camera", priority: "Information", condition: "active", acknowledgement: "unacknowledged", shelving: "unshelved", timeLabel: "Sample 000", note: "Synthetic diagnostic record. Acknowledgement keeps the condition active.", actions: ["acknowledge"] };

export function RoboticsBoard() {
  const [running, setRunning] = React.useState(true);
  const [phase, setPhase] = React.useState(0);
  const tick = Math.floor(phase);
  const [base, setBase] = React.useState<ArmAngles>(initialAngles);
  const [speed, setSpeed] = React.useState("1");
  const [view, setView] = React.useState<ArmView>("perspective");
  const [zoom, setZoom] = React.useState(1);
  const [pathVisible, setPathVisible] = React.useState(false);
  const [aperture, setAperture] = React.useState(100);
  const [edited, setEdited] = React.useState<JointId | null>(null);
  const clock = React.useRef<ArmClock>({ time: 0, running: true, speed: 1, base: initialAngles });
  clock.current.base = base; clock.current.running = running; clock.current.speed = Number(speed);
  const [targets, setTargets] = React.useState<JointTargets>({ shoulder: 24, elbow: -38, wrist: 12 });
  const [selected, setSelected] = React.useState<JointId>("shoulder");
  const [screen, setScreen] = React.useState<Screen>("monitor");
  const [inspector, setInspector] = React.useState<Inspector>("joint");
  const [request, setRequest] = React.useState<{ id: JointId; value: number } | null>(null);
  const [confirmed, setConfirmed] = React.useState<{ id: string; label: string } | null>(null);
  const [mission, setMission] = React.useState(initialMission);
  const [alarms, setAlarms] = React.useState([initialAlarm]);
  const [events, setEvents] = React.useState<DebugEvent[]>([{ id: 1, title: "Sample stream ready", detail: "Three joint records loaded. A continuous local simulation supplies the articulated view and telemetry; no controller is connected." }]);
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

  React.useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const stop = () => { if (reduced.matches) { clock.current.running = false; setRunning(false); setPhase(clock.current.time); } };
    stop(); reduced.addEventListener("change", stop);
    return () => reduced.removeEventListener("change", stop);
  }, []);
  React.useEffect(() => {
    if (!running) return;
    let frame = 0, previous = performance.now(), published = previous;
    const advance = (now: number) => {
      const elapsed = Math.min((now - previous) / 1000, .05); previous = now;
      if (clock.current.running && !document.hidden) clock.current.time += elapsed * clock.current.speed;
      if (now - published >= 100) { setPhase(clock.current.time); published = now; }
      frame = requestAnimationFrame(advance);
    };
    frame = requestAnimationFrame(advance);
    return () => cancelAnimationFrame(frame);
  }, [running]);

  const angles = sampleArm(base, phase);
  const records = joints.map(joint => ({ ...joint, reported: Number(angles[joint.id].toFixed(2)) }));
  const joint = records.find(item => item.id === selected)!;
  const selectedEvent = events.find(event => event.id === eventId);
  const tip = armPose(angles);
  const cameraAvailable = alarms.every(alarm => alarm.condition !== "active");
  const draftValue = targets[selected];
  const draft = edited === selected && typeof draftValue === "number" && Number.isFinite(draftValue) && draftValue >= joint.minimum && draftValue <= joint.maximum ? { ...angles, [selected]: draftValue } : null;
  const pose: RobotPoseRecord = { id: "sample", label: "Current sample", frame: "Illustrative base frame", timeLabel: `Sample ${String(tick).padStart(3, "0")}`, status: running ? "Streaming local records" : "Paused local records", translation: { x: Number(tip.x.toFixed(4)), y: Number(tip.y.toFixed(4)), z: 0, unit: "m" }, orientation: { representation: "Tool pitch from base +y toward +x; elbow has a 90 deg mounting offset", components: [{ id: "pitch", label: "Tool pitch", value: Number(tip.toolPitch.toFixed(2)), unit: "deg" }] } };

  function log(title: string, detail: string) {
    setEvents(current => [{ id: nextEvent.current++, title, detail }, ...current].slice(0, 40));
    setAnnouncement(title);
  }
  function openJoint(id: JointId) { setSelected(id); setInspector("joint"); setScreen("joints"); setEventId(null); requestAnimationFrame(() => heading.current?.focus({ preventScroll: true })); }
  function backToMonitor() { setScreen("monitor"); setInspector("joint"); requestAnimationFrame(() => jointButtons.current.get(selected)?.focus({ preventScroll: true })); }
  function confirmRequest() {
    if (!request) return;
    const next = { ...sampleArm(clock.current.base, clock.current.time), [request.id]: request.value };
    clock.current = { ...clock.current, base: next, time: 0, running: false };
    setBase(next); setPhase(0); setRunning(false); setEdited(null);
    setConfirmed({ id: request.id, label: `${request.value} deg accepted by local simulator. Stream paused.` });
    log("Simulated target applied", `${request.id}: ${request.value} deg. Only the local record and articulated model changed; no motion command was sent.`);
    setRequest(null);
    requestAnimationFrame(() => heading.current?.focus({ preventScroll: true }));
  }
  function togglePlayback() {
    clock.current.running = !running; setPhase(clock.current.time); setRunning(value => !value);
    log(running ? "Telemetry paused" : "Telemetry resumed", `Local playback ${running ? "paused" : "resumed"} at sample ${tick}.`);
  }
  function navigate(next: Screen) { setScreen(next); setEventId(null); setInspector(next === "debug" ? "events" : "joint"); }
  const sideTitle = screen === "mission" ? "Inspection plan" : inspector === "pose" ? "Pose record" : screen === "debug" ? "Debug console" : `${joint.label} joint`;

  return <div className="rb-frame"><section className="rb" data-screen={screen} data-running={running} data-speed={speed} aria-label="Robot telemetry workspace">
    <header className="rb-header"><div className="rb-brand"><Icon name="crosshair" /><div><strong>Inspection arm</strong><span>Cell 04 / commissioning</span></div></div><span className="rb-local"><span />Local simulation</span><Button variant="ghost" size="sm" onClick={togglePlayback}><Icon name={running ? "pause" : "play"} /><span>{running ? "Pause" : "Resume"}</span></Button></header>
    <div className="rb-body">
      <section className="rb-monitor" aria-label="Robot monitor">
        <div className="rb-view-head"><span><Icon name="move" size={16} />Base frame / metres</span><span className="rb-number">Sample {String(tick).padStart(3, "0")}</span></div>
        <div className="rb-stage"><div className="rb-stage-label"><span>Articulated inspection / 03 axes</span><strong>{running ? "Streaming" : "Paused"}</strong></div>
          <ArmScene clock={clock} selected={selected} draft={draft} aperture={aperture} cameraAvailable={cameraAvailable} pathVisible={pathVisible} view={view} zoom={zoom} />
          <div className="rb-scene-camera" data-available={cameraAvailable}><Icon name="camera" size={12} /><span>{cameraAvailable ? "Camera ready" : "Camera fault"}</span></div>
          <div className="rb-stage-foot"><span>{draft ? "Dashed outline / draft only" : "Solid arm / measured pose"}</span><Button variant="ghost" size="sm" ref={poseButton} onClick={() => { setInspector("pose"); setScreen("joints"); requestAnimationFrame(() => heading.current?.focus({ preventScroll: true })); }}><Icon name="layers" size={16} />Inspect pose</Button></div>
        </div>
        <div className="rb-scene-tools"><Select aria-label="Arm viewpoint" value={view} onValueChange={value => setView(value as ArmView)} options={[{ value: "perspective", label: "Three-quarter" }, { value: "front", label: "Front" }, { value: "top", label: "Top" }]} /><div><Button variant="ghost" aria-label="Zoom out arm" disabled={zoom <= .7} onClick={() => setZoom(value => Math.max(.7, Number((value - .15).toFixed(2))))}><Icon name="minus" size={16} /></Button><Button variant="ghost" aria-label="Zoom in arm" disabled={zoom >= 1.6} onClick={() => setZoom(value => Math.min(1.6, Number((value + .15).toFixed(2))))}><Icon name="plus" size={16} /></Button><Button variant="ghost" aria-label="Show sample path" aria-pressed={pathVisible} onClick={() => setPathVisible(value => !value)}><Icon name="activity" size={16} /></Button></div></div>
        <div className="rb-mechanism"><span><strong>Tool centre</strong><small className="rb-tip">x {tip.x.toFixed(3)} · y {tip.y.toFixed(3)} · z 0.000 m</small></span><Button variant="ghost" aria-label={aperture === 0 ? "Open gripper" : "Close gripper"} data-closed={aperture === 0} onClick={() => { setAperture(value => value === 0 ? 100 : 0); log(aperture === 0 ? "Gripper opened locally" : "Gripper closed locally", "Only the simulated fingers moved. No grasp or contact is inferred."); }}><Icon name="move" size={16} /><span>{aperture === 0 ? "Open gripper" : "Close gripper"}</span></Button></div>
        <div className="rb-joint-list" role="group" aria-label="Select a joint">{records.map((record, index) => <Button variant="ghost" className="rb-joint-row" key={record.id} ref={node => { if (node) jointButtons.current.set(record.id, node); }} aria-pressed={selected === record.id} onClick={() => openJoint(record.id)}><span className="rb-joint-index">0{index + 1}</span><span>{record.label}<small>Reported position</small></span><strong>{record.reported.toFixed(2)}<small>deg</small></strong><Icon name="chevron-right" size={16} /></Button>)}</div>
        <div className="rb-trace"><div><span>Sample cycle / 24 seconds</span><Select aria-label="Playback speed" value={speed} onValueChange={setSpeed} options={[{ value: "0.5", label: "0.5×" }, { value: "1", label: "1×" }, { value: "2", label: "2×" }]} /></div><svg viewBox="0 0 400 44" aria-hidden="true"><polyline points={Array.from({ length: 49 }, (_, i) => `${i * 8.3},${22 - Math.sin((tick - 48 + i) * Math.PI / 12) * 14}`).join(" ")} /></svg><Button variant="ghost" size="sm" disabled={running} onClick={() => { clock.current.time = Math.floor(clock.current.time) + 1; setPhase(clock.current.time); log("Advanced one sample", "Advanced the deterministic local mechanism by one simulation second."); }}>Step<Icon name="arrow-right" size={16} /></Button></div>
      </section>
      <section className="rb-inspector" aria-label="Robot inspector"><div className="rb-inspector-head"><Button variant="ghost" className="rb-back" aria-label="Back to monitor" onClick={() => { if (inspector === "pose") { setScreen("monitor"); setInspector("joint"); requestAnimationFrame(() => poseButton.current?.focus()); } else backToMonitor(); }}><Icon name="arrow-left" /></Button><div><span className="rb-eyebrow">{screen === "mission" ? "Local review" : screen === "debug" ? "Diagnostics" : "Inspector"}</span><h2 ref={heading} tabIndex={-1}>{sideTitle}</h2></div></div>
        <div className="rb-desktop-tabs"><ToggleGroup aria-label="Inspector view" value={screen === "mission" ? "mission" : screen === "debug" ? "debug" : "joints"} onValueChange={value => navigate(value as Screen)} options={[{ value: "joints", label: "Joint" }, { value: "mission", label: "Mission" }, { value: "debug", label: "Debug" }]} /></div>
        <div className="rb-inspector-scroll">
          {screen === "mission" ? <RobotMissionQueue label="Sample inspection sequence" steps={mission} onOrderChange={ids => { setMission(current => ids.map(id => current.find(step => step.id === id)!)); log("Plan order updated", "Only the local review order changed. The mission was not executed."); }} onAction={id => { setMission(current => current.map(step => step.id === id ? { ...step, status: "Reviewed locally", confirmedLabel: "Review recorded in this tab", actions: [] } : step)); log("Mission step reviewed", `${id}: local review recorded. No execution was requested.`); }} /> : screen === "debug" ? <>
            <ToggleGroup aria-label="Debug view" value={inspector === "alarms" ? "alarms" : "events"} onValueChange={value => { setInspector(value as Inspector); setEventId(null); }} options={[{ value: "events", label: "Events" }, { value: "alarms", label: "Alarms" }]} />
            {inspector === "alarms" ? <><AlarmPanel label="Diagnostic records" alarms={alarms} onAction={id => { setAlarms(current => current.map(alarm => alarm.id === id ? { ...alarm, acknowledgement: "acknowledged", actions: [] } : alarm)); log("Diagnostic acknowledged", "The sample camera condition stays active. Acknowledgement records review only."); }} /><Button variant="ghost" onClick={() => { setAlarms(current => current.map(alarm => ({ ...alarm, condition: cameraAvailable ? "active" : "cleared", acknowledgement: "unacknowledged", actions: cameraAvailable ? ["acknowledge"] : [], note: cameraAvailable ? "Locally injected camera fault. Acknowledgement keeps the condition active." : "Sample camera restored locally. No hardware is connected." }))); log(cameraAvailable ? "Camera fault injected" : "Sample camera restored", cameraAvailable ? "The simulated scan volume is unavailable. Joint motion continues independently." : "The camera lens indicator and scan volume are available in the local model."); }}>{cameraAvailable ? "Inject camera fault" : "Restore sample camera"}</Button></> : selectedEvent ? <Card className="rb-event-detail"><Button variant="ghost" size="sm" onClick={() => { setEventId(null); requestAnimationFrame(() => eventButtons.current.get(selectedEvent.id)?.focus()); }}><Icon name="arrow-left" size={16} />All events</Button><span className="rb-eyebrow">Event {String(selectedEvent.id).padStart(3, "0")}</span><h3 ref={eventHeading} tabIndex={-1}>{selectedEvent.title}</h3><p>{selectedEvent.detail}</p></Card> : <><p className="rb-copy">Actions and simulator state changes. Latest first.</p><ol className="rb-events">{events.map(event => <li key={event.id}><Button variant="ghost" className="rb-event" ref={node => { if (node) eventButtons.current.set(event.id, node); }} onClick={() => { setEventId(event.id); requestAnimationFrame(() => eventHeading.current?.focus({ preventScroll: true })); }}><span>{String(event.id).padStart(3, "0")}</span><strong>{event.title}</strong><Icon name="chevron-right" size={16} /></Button></li>)}</ol></>}
          </> : inspector === "pose" ? <RobotPose label="Articulated tool record" poses={[pose]} value={poseId} onValueChange={setPoseId} /> : <JointPanel label="Target editor" joints={[joint]} value={{ [selected]: targets[selected] ?? null }} onValueChange={next => { setTargets(current => ({ ...current, ...next })); setEdited(selected); }} onRequestTargets={next => { setRequest({ id: selected, value: next[selected]! }); log("Target awaiting confirmation", `${selected}: ${next[selected]} deg is a draft. Reported positions are unchanged.`); requestAnimationFrame(() => confirmButton.current?.focus({ preventScroll: true })); }} pending={request != null} timeLabel={`Sample ${String(tick).padStart(3, "0")}`} confirmedLabel={confirmed?.id === selected ? confirmed.label : undefined} />}
        </div>
        {request && <div className="rb-confirm"><span><strong>Apply to simulation?</strong><small>{request.id} → {request.value} deg. Pauses stream.</small></span><div><Button ref={confirmButton} size="sm" onClick={confirmRequest}>Confirm simulation</Button><Button variant="ghost" size="sm" onClick={() => { setRequest(null); log("Target request canceled", "Reported records were kept."); }}>Cancel</Button></div></div>}
      </section>
    </div>
    <footer className="rb-footer"><span><Icon name="terminal" size={12} />Local kinematic model</span><span>No hardware connected</span></footer>
    <nav className="rb-mobile-nav" aria-label="Robotics screens">{([{ value: "monitor", label: "Monitor", icon: "activity" }, { value: "joints", label: "Joints", icon: "sliders" }, { value: "mission", label: "Mission", icon: "list" }, { value: "debug", label: "Debug", icon: "terminal" }] as const).map(item => <Button key={item.value} variant="ghost" aria-pressed={screen === item.value} onClick={() => navigate(item.value)}><Icon name={item.icon} /><span>{item.label}</span></Button>)}</nav>
    <span className="rb-announcement" role="status">{announcement}</span>
  </section></div>;
}
