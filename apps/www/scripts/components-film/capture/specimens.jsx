import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ActivityTimeline, CanvasControls, ConnectionStatus, FileBrowser, KanbanBoard,
  MediaScrubber, MessageComposer, Metric, MultiSelect, PlaybackControls,
  PropertyGrid, QueryBuilder, Scheduler, Sparkline, TaskProgress, TransferList,
  Waveform,
} from "@noorddev/vlak-react";

const noop = () => {};
const stack = (children, gap = 24) => <div style={{ display: "grid", gap }}>{children}</div>;

function Kanban() {
  return <KanbanBoard label="Studio production" columns={[
    { id: "planned", label: "Planned" }, { id: "active", label: "In progress" }, { id: "complete", label: "Complete" },
  ]} defaultValue={[
    { id: "type", title: "Refine the type scale", description: "Optical spacing, from labels to display.", columnId: "planned" },
    { id: "states", title: "Map the interaction states", columnId: "planned" },
    { id: "motion", title: "Tune the motion", description: "Direct response. A quieter finish.", columnId: "active" },
    { id: "layout", title: "Test the small screen", columnId: "active" },
    { id: "grid", title: "Set the grid", description: "204 modules. One shared rhythm.", columnId: "complete" },
    { id: "icons", title: "Draw the icon family", columnId: "complete" },
  ]} />;
}

function Audio() {
  const samples = Array.from({ length: 128 }, (_, i) => 0.08 + Math.abs(Math.sin(i * 0.37) * Math.cos(i * 0.13)) * 0.88);
  return stack([
    <Waveform key="wave" label="Field recording" samples={samples} value={0.38} onValueChange={noop} />,
    <MediaScrubber key="scrub" label="Recording position" duration={224} value={85} buffered={176} onValueChange={noop} />,
    <PlaybackControls key="play" label="Recording transport" playing onPlayingChange={noop} onPrevious={noop} onNext={noop} onStop={noop} />,
  ], 20);
}

function Schedule() {
  const names = ["Layout review", "Prototype", "Type review", "Motion study", "Studio review", "Documentation", "Release notes"];
  const events = names.flatMap((title, i) => {
    const day = 7 + i;
    const date = `2026-09-${String(day).padStart(2, "0")}`;
    return [
      { id: `am-${day}`, title, start: new Date(`${date}T09:00:00Z`), end: new Date(`${date}T10:00:00Z`) },
      { id: `pm-${day}`, title: i % 2 ? "Build & test" : "Work session", start: new Date(`${date}T13:30:00Z`), end: new Date(`${date}T15:00:00Z`) },
    ];
  });
  return <Scheduler label="Studio schedule" locale="en-GB" timeZone="UTC" defaultValue={new Date("2026-09-09T12:00:00Z")} defaultView="week" events={events} onEventSelect={noop} onEventMove={noop} />;
}

function Files() {
  return <FileBrowser label="Project files" rootLabel="Studio" defaultFolder="release" defaultValue="system" onOpen={noop} entries={[
    { id: "release", name: "Vlak 0.4", kind: "folder", children: [
      { id: "system", name: "Design system.fig", kind: "file", size: "8.4 MB", modified: "Today" },
      { id: "components", name: "Components.tsx", kind: "file", size: "124 KB", modified: "Today" },
      { id: "motion", name: "Motion study.blend", kind: "file", size: "42 MB", modified: "Yesterday" },
      { id: "notes", name: "Release notes.md", kind: "file", size: "12 KB", modified: "Yesterday" },
    ]},
    { id: "reference", name: "References", kind: "folder", children: [{ id: "grid", name: "Grid systems.pdf", kind: "file" }] },
    { id: "archive", name: "Archive", kind: "folder", children: [] },
  ]} />;
}

function Properties() {
  return stack([
    <PropertyGrid key="fields" label="Object properties" defaultValue={{ name: "Surface 01", material: "paper", width: 850, height: 500, radius: 4, visible: true, shadows: true }} fields={[
      { id: "name", label: "Name" },
      { id: "material", label: "Material", type: "select", options: [{ value: "paper", label: "Paper" }, { value: "ink", label: "Ink" }, { value: "silver", label: "Silver" }] },
      { id: "width", label: "Width", type: "number", unit: "px", min: 0 },
      { id: "height", label: "Height", type: "number", unit: "px", min: 0 },
      { id: "radius", label: "Radius", type: "number", unit: "px", min: 0 },
      { id: "visible", label: "Visible", type: "switch" },
      { id: "shadows", label: "Cast shadows", type: "switch" },
    ]} />,
    <CanvasControls key="canvas" label="Canvas view" zoom={1} onZoomChange={noop} onFit={noop} onReset={noop} />,
  ], 28);
}

function Query() {
  return <QueryBuilder label="Find matching projects" fields={[
    { id: "status", label: "Status" }, { id: "name", label: "Project" }, { id: "progress", label: "Progress", type: "number" },
  ]} defaultValue={{ id: "root", combinator: "and", rules: [
    { id: "ready", field: "status", operator: "is", value: "In progress" },
    { id: "complete", field: "progress", operator: "greater-than", value: "60" },
  ]}} />;
}

function Composer() {
  return <MessageComposer label="Message to the studio" defaultValue={"The new components are ready for review.\nI’ve attached the interaction notes and the latest motion study."} allowAttachments onSend={noop} />;
}

function Progress() {
  return stack([
    <TaskProgress key="task" label="Rendering the component study" state="running" value={72} elapsedSeconds={96} remainingSeconds={38}
      phases={[{ id: "prepare", label: "Prepare geometry", state: "complete" }, { id: "light", label: "Resolve lighting", state: "complete" }, { id: "render", label: "Render frames", state: "active" }]} onCancel={noop} />,
    <ActivityTimeline key="events" events={[
      { id: "start", title: "Render started", dateTime: "2026-09-06T09:42:00Z", timeLabel: "09:42", actor: "Studio / Surface 01" },
      { id: "assets", title: "All assets prepared", dateTime: "2026-09-06T09:41:00Z", timeLabel: "09:41", description: "40 components · 114 in the system" },
    ]} />,
  ], 16);
}

function Metrics() {
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: "28px 32px" }}>
    <Metric label="Components" value={114} comparison="40 new additions" trend={<Sparkline label="Component catalog" values={[74, 74, 78, 84, 87, 94, 102, 114]} width={175} height={32} />} />
    <Metric label="Grid module" value={204} unit="px" description="184 column · 20 gutter" />
    <Metric label="Interactive target" value={44} unit="px" description="Room for every action" />
    <Metric label="Control radius" value={4} unit="px" description="A measured corner" />
  </div>;
}

function Selection() {
  const options = ["Research", "Typography", "Interaction", "Motion", "Engineering", "Documentation"].map(label => ({ label, value: label.toLowerCase() }));
  return stack([
    <MultiSelect key="select" label="Project disciplines" options={options} defaultValue={["typography", "interaction", "motion"]} />,
    <TransferList key="transfer" label="Build the release team" availableLabel="Available" selectedLabel="Assigned" options={[
      { value: "maya", label: "Maya · Design" }, { value: "ren", label: "Ren · Engineering" },
      { value: "jo", label: "Jo · Motion" }, { value: "luca", label: "Luca · Research" },
      { value: "sam", label: "Sam · Typography" }, { value: "lee", label: "Lee · Production" },
    ]} defaultValue={["maya", "ren", "jo"]} />,
    <ConnectionStatus key="connection" state="connected" />,
  ], 24);
}

const specimens = { kanban: Kanban, audio: Audio, scheduler: Schedule, files: Files, properties: Properties, query: Query, composer: Composer, progress: Progress, metrics: Metrics, selection: Selection };
function App() {
  const [id, setId] = useState("kanban");
  useEffect(() => {
    window.setSpecimen = (next) => setId(next);
    window.captureReady = true;
  }, []);
  const Specimen = specimens[id];
  return <div id="content" data-specimen={id}><Specimen key={id} /></div>;
}
createRoot(document.getElementById("plate")).render(<App />);
