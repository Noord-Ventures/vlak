"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Badge, Button, Card, CardBody, CardLabel, CardTitle, Icon, Item, Progress, ToggleGroup, CanvasControls, TreeView, PropertyGrid, DescriptionList } from "@noorddev/vlak-react";
import { WallpaperGenerator } from "./wallpaper-generator";
import { Drive } from "./drive";

const CarViewport = dynamic(
  () => import("./car-viewport").then((module) => module.CarViewport),
  { ssr: false },
);

function Render() {
  const [rotating, setRotating] = React.useState(true);
  const [wireframe, setWireframe] = React.useState(false);
  const [material, setMaterial] = React.useState<"clay" | "graphite">("clay");
  const [view, setView] = React.useState(0);
  const [inspector, setInspector] = React.useState("surface");
  const [status, setStatus] = React.useState<"loading" | "ready" | "error">("loading");
  const [reducedMotion, setReducedMotion] = React.useState(false);
  React.useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(preference.matches);
    sync();
    preference.addEventListener("change", sync);
    return () => preference.removeEventListener("change", sync);
  }, []);
  const ready = status === "ready";
  const playing = ready && rotating && !reducedMotion;
  return <div className="cx cx-render">
    <header><span>Production vehicle</span><span className="cx-header-note">204,461 triangles</span></header>
    <nav aria-label="Viewport tools">
      <Button variant="ghost" disabled={!ready || reducedMotion} className={playing ? "on" : ""} aria-label="Auto-rotate model" aria-pressed={playing} onClick={() => setRotating(!rotating)} title="Auto-rotate"><Icon name="refresh" size={16}/></Button>
      <Button variant="ghost" disabled={!ready} className={wireframe ? "on" : ""} aria-label="Show mesh" aria-pressed={wireframe} onClick={() => setWireframe(!wireframe)} title="Show mesh"><Icon name="grid" size={16}/></Button>
      <Button variant="ghost" disabled={!ready} aria-label="Reset camera" onClick={() => setView(view + 1)} title="Reset camera"><Icon name="camera" size={16}/></Button>
    </nav>
    <div className="cx-workspace">
      <div className="cx-render-meta"><span>Perspective · drag to orbit</span><span>{wireframe ? "Mesh view" : "Shaded view"}</span></div>
      <CarViewport rotating={playing} wireframe={wireframe} material={material} resetKey={view} onStatusChange={setStatus}/>
      <div className="cx-timeline"><Button variant="ghost" disabled={!ready || reducedMotion} aria-label={playing ? "Pause turntable" : "Play turntable"} onClick={() => setRotating(!rotating)}><Icon name={playing ? "pause" : "play"} size={12}/></Button><span>Turntable</span><i/><span>{status === "loading" ? "Loading model" : status === "error" ? "Unavailable" : reducedMotion ? "Reduced motion" : playing ? "Playing" : "Paused"}</span></div>
    </div>
    <aside>
      <TreeView label="Model inspector" value={inspector} onValueChange={setInspector} defaultExpanded={["vehicle"]} nodes={[{ id: "vehicle", label: "Vehicle study 01", children: [{ id: "surface", label: "Surface" }, { id: "viewport", label: "Viewport" }] }]} />
      <DescriptionList items={[{ id: "triangles", label: "Triangles", value: "204,461" }, { id: "vertices", label: "Vertices", value: "114,716" }, { id: "materials", label: "Materials", value: "21" }]} />
      <PropertyGrid label={inspector === "viewport" ? "Viewport" : "Surface"} value={{ material, wireframe, rotating }} onValueChange={(values) => { setMaterial(values.material === "graphite" ? "graphite" : "clay"); setWireframe(Boolean(values.wireframe)); setRotating(Boolean(values.rotating)); }} fields={inspector === "viewport" ? [{ id: "wireframe", label: "Show mesh", type: "switch", disabled: !ready }, { id: "rotating", label: "Auto-rotate", type: "switch", disabled: !ready || reducedMotion }] : [{ id: "material", label: "Body material", type: "select", disabled: !ready, options: [{ value: "clay", label: "Warm clay" }, { value: "graphite", label: "Graphite" }] }]} />
      <p className="cx-panel-hint">Inspect the full vehicle mesh, change the paint, or drag to orbit. The turntable pauses while you use the viewer.</p>
    </aside>
  </div>;
}

const assets = [
  { name: "Asteria-3", region: "North Sea pass", coords: "52.37° N · 4.90° E", window: "11:42–11:49", altitude: "612 km", velocity: "7.54 km/s", downlink: "94 Mbps", cloud: "18%" },
  { name: "Helios-7", region: "Alpine corridor", coords: "46.82° N · 8.23° E", window: "12:06–12:13", altitude: "584 km", velocity: "7.58 km/s", downlink: "88 Mbps", cloud: "9%" },
  { name: "Northwatch-2", region: "Baltic coast", coords: "57.70° N · 11.97° E", window: "12:22–12:30", altitude: "638 km", velocity: "7.51 km/s", downlink: "91 Mbps", cloud: "24%" },
  { name: "Copernia-5", region: "Atlantic approach", coords: "48.39° N · 4.49° W", window: "12:41–12:48", altitude: "601 km", velocity: "7.56 km/s", downlink: "96 Mbps", cloud: "31%" },
];
const layers = ["True colour", "Moisture", "Thermal"] as const;

function Orbit() {
  const [zoom, setZoom] = React.useState(1);
  const [layer, setLayer] = React.useState<(typeof layers)[number]>("True colour");
  const [selected, setSelected] = React.useState(0);
  const [queued, setQueued] = React.useState<string[]>([]);
  const asset = assets[selected]!;
  const isQueued = queued.includes(asset.name);
  return <div className="cx cx-orbit">
    <header><span>European Observation Network</span><Button size="sm" disabled={isQueued} onClick={() => setQueued([...queued, asset.name])}><Icon name={isQueued ? "check" : "camera"} size={12}/>{isQueued ? "Capture queued" : "Queue capture"}</Button></header>
    <aside aria-label="Observation assets"><p className="cx-label">Assets</p>{assets.map((item, index) => <Button variant="ghost" aria-pressed={selected === index} className={`cx-orbit-asset${selected === index ? " on" : ""}`} key={item.name} onClick={() => setSelected(index)}><span><i className={selected === index ? "live" : ""}/>{item.name}</span><small>{queued.includes(item.name) ? "Capture queued" : item.region}</small></Button>)}</aside>
    <div className="cx-workspace" data-layer={layer.toLowerCase().replace(" ", "-")} data-asset={selected}>
      <div className="cx-orbit-visual" style={{ transform: `scale(${zoom})` }}>
      <img src="/interfaces/concepts/europe-observation-v1.jpg" alt={"Illustrative " + layer.toLowerCase() + " observation of Western Europe"}/>
      <div className="cx-orbit-grid"/><svg className="cx-pass-track" viewBox="0 0 600 560" aria-hidden="true"><path d="M-30 530 C 120 410, 190 390, 270 280 S 430 135, 640 40"/><circle cx="270" cy="280" r="5"/><circle cx="435" cy="134" r="4"/></svg><div className="cx-sweep"/><div className="cx-target cx-target-a"/><div className="cx-target cx-target-b"/><div className="cx-reticle"/>
      </div>
      <div className="cx-coords"><i/>{asset.name}<br/>{asset.coords}<br/>Simulated pass · {Math.round(10 / zoom)} m / px</div>
      <ToggleGroup className="cx-layers" aria-label="Observation layer" value={layer} onValueChange={(value) => setLayer(value as (typeof layers)[number])} options={layers.map((value) => ({ value, label: value }))}/>
      <CanvasControls className="cx-orbit-controls" zoom={zoom} onZoomChange={setZoom} minZoom={1} maxZoom={2.5} step={0.25} label="Observation view controls" />
    </div>
    <Card className="cx-orbit-inspector" role="region" aria-label={`${asset.name} pass details`}>
      <CardLabel>{asset.name}</CardLabel>
      <CardTitle>{asset.region}</CardTitle>
      <CardBody>Acquisition window<br/><b>{asset.window} CET</b></CardBody>
      <div className="cx-orbit-telemetry">{[["Altitude", asset.altitude], ["Velocity", asset.velocity], ["Downlink", asset.downlink]].map(([label, value]) => <Item key={label} title={label} meta={value}/>)}</div>
      <Progress className="cx-orbit-progress" value={Number.parseInt(asset.cloud, 10)} label="Cloud cover"/>
      <Badge className="cx-status" variant={isQueued ? "solid" : "outline"} aria-live="polite">{isQueued ? "Capture queued" : "Telemetry nominal"}</Badge>
    </Card>
  </div>;
}

type FrontierSection = "Models" | "Research" | "Company";
const frontierContent: Record<FrontierSection, [string, string, string][]> = {
  Models: [["Model", "Aster 2", "Reason across research, technical documents, and code."], ["Context", "512k tokens", "Keep source material and working notes in one conversation."], ["Deployment", "Your environment", "A hosted service in Europe or a private deployment."]],
  Research: [["System card", "Evaluate first", "Test a model against the questions your work depends on."], ["Method", "Show the evidence", "Inspect references, compare answers, and retain the source material."], ["Scope", "Known limitations", "Model answers still need review, especially when evidence is incomplete."]],
  Company: [["Based in Europe", "Built together", "A fictional research lab studying useful reasoning systems."], ["Focus", "Applied research", "Tools for the people working through difficult, open-ended questions."], ["This example", "A design study", "Explore the page structure, typography, and components with Vlak."]],
};

function Frontier() {
  const [section, setSection] = React.useState<FrontierSection>("Models");
  const contentRef = React.useRef<HTMLElement>(null);
  function reveal(value: FrontierSection) {
    setSection(value);
    contentRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
  return <div className="cx cx-frontier">
    <header><b>Aster Labs</b><nav aria-label="Company sections">{(["Models", "Research", "Company"] as const).map(value => <button type="button" key={value} aria-pressed={section === value} className={section === value ? "on" : ""} onClick={() => reveal(value)}>{value}</button>)}</nav><Button size="sm" onClick={() => reveal("Models")}>Explore models</Button></header>
    <div className="cx-workspace">
      <div className="cx-frontier-graphic" aria-hidden="true">
        <span className="cx-frontier-glow"/>
        <span className="cx-frontier-ring cx-frontier-ring-a"/>
        <span className="cx-frontier-ring cx-frontier-ring-b"/>
        <span className="cx-frontier-ring cx-frontier-ring-c"/>
        <span className="cx-frontier-core"><i/><i/><i/><i/><i/><i/></span>
        <span className="cx-frontier-node cx-frontier-node-a"/>
        <span className="cx-frontier-node cx-frontier-node-b"/>
        <span className="cx-frontier-node cx-frontier-node-c"/>
      </div>
      <p>Built in Europe. Available everywhere.</p><h2>Reasoning models for research and engineering.</h2><p className="cx-frontier-intro">Work through complex questions with your documents, data, and code in view.</p><div><Button onClick={() => reveal("Models")}>Explore Aster 2</Button><button type="button" className="cx-text-link" onClick={() => reveal("Research")}>Read the system card <span aria-hidden="true">→</span></button></div>
    </div>
    <section ref={contentRef} aria-label={section}>{frontierContent[section].map(([label, title, body]) => <Card key={label}><CardLabel>{label}</CardLabel><CardTitle>{title}</CardTitle><CardBody>{body}</CardBody></Card>)}</section>
    <footer><span>Aster Labs is a fictional company</span><span>Interface study · Vlak</span></footer>
  </div>;
}

const agenda = [["11:08", "Walk to Depot Noord", "18 min"], ["12:00", "Design review", "Studio 2"], ["15:42", "Train to Amsterdam", "Platform 6"]];

function Phone({ platform }: { platform: "iOS" | "Android" }) {
  const android = platform === "Android";
  const [tab, setTab] = React.useState("Today");
  const [options, setOptions] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  return <article className={"cx-phone " + (android ? "android" : "ios")} aria-label={platform + " travel app"}>
    {!android && <span className="cx-ios-island" aria-hidden="true" />}
    <div className="cx-phone-status"><span>9:41</span><i>{android ? "5G · 82%" : "● ● ▰"}</i></div>
    <header>{android && <button type="button" aria-label="Back to today" onClick={() => setTab("Today")}><Icon name="chevron-left" size={16}/></button>}<div><small>{android ? "Travel plan" : "Saturday, 12 September"}</small><b>{tab === "You" ? "Your profile" : "Rotterdam"}</b></div><button type="button" aria-label="More options" aria-expanded={options} onClick={() => setOptions(!options)}>{android ? "⋮" : "•••"}</button></header>
    <div className="cx-phone-content">
      {options && <div className="cx-phone-options"><button type="button" onClick={() => { setSaved(!saved); setOptions(false); }}>{saved ? "Remove saved trip" : "Save this trip"}</button></div>}
      {tab === "You" ? <div className="cx-phone-profile"><Icon name="user" size={24}/><h2>Mara</h2><p>{saved ? "Rotterdam trip saved" : "No saved trips yet"}</p><button type="button" onClick={() => setTab("Today")}>View today’s plan →</button></div> : <>
        <Card className="cx-trip-card"><span>10:24</span><div><b>Intercity 1135</b><p>Amsterdam Centraal → Rotterdam Centraal</p></div><em>On time{saved ? " · Saved" : ""}</em></Card>
        <h2>{tab === "Plan" ? "Your itinerary" : "Today"}</h2>
        {agenda.map((row, index) => <div className="cx-agenda" key={row[0]}>{android && <Icon name={index === 0 ? "map" : index === 1 ? "calendar" : "arrow-right"} size={16}/>}<span>{row[0]}</span><div><b>{row[1]}</b><small>{row[2]}</small></div></div>)}
        {tab === "Plan" && <p className="cx-phone-note">Three stops. Your return train leaves from platform 6.</p>}
        {android && <button type="button" className="cx-android-action" aria-label={saved ? "Trip saved" : "Save trip"} aria-pressed={saved} onClick={() => setSaved(!saved)}><Icon name={saved ? "check" : "plus"} size={16}/></button>}
      </>}
    </div>
    <nav aria-label={platform + " app navigation"}>{([["Plan", "map"], ["Today", "calendar"], ["You", "user"]] as const).map(([label, icon]) => <button type="button" key={label} className={tab === label ? "on" : ""} aria-pressed={tab === label} onClick={() => setTab(label)}><Icon name={icon} size={16}/><span>{label}</span></button>)}</nav>
    {android && <div className="cx-android-home" aria-hidden="true">━</div>}
  </article>;
}

function Platforms() {
  return <div className="cx cx-platforms"><header><b>One trip, two platforms</b><span>The same content in native patterns</span></header><div className="cx-workspace"><div><p>iOS <span>Large titles · tab bar</span></p><Phone platform="iOS"/></div><div><p>Android <span>App bar · navigation bar</span></p><Phone platform="Android"/></div></div></div>;
}

export function ConceptBoard({ kind }: { kind: "graphics" | "render" | "drive" | "orbit" | "frontier" | "platforms" }) {
  if (kind === "graphics") return <WallpaperGenerator/>;
  if (kind === "render") return <Render/>;
  if (kind === "drive") return <Drive/>;
  if (kind === "orbit") return <Orbit/>;
  if (kind === "frontier") return <Frontier/>;
  return <Platforms/>;
}
