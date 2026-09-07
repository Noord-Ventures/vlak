"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Button, Card, DescriptionList, Icon, PropertyGrid, TreeView } from "@noorddev/vlak-react";
import type { PropertyValues } from "@noorddev/vlak-react";

const CarViewport = dynamic(
  () => import("./car-viewport").then(module => module.CarViewport),
  { ssr: false, loading: () => <div className="rw-viewer-loading" role="status">Preparing the model viewport…</div> },
);

type Screen = "viewport" | "inspector";
type Inspector = "vehicle" | "surface" | "viewport";

export function RenderBoard() {
  const [screen, setScreen] = React.useState<Screen>("viewport");
  const [rotating, setRotating] = React.useState(true);
  const [wireframe, setWireframe] = React.useState(false);
  const [material, setMaterial] = React.useState<"clay" | "graphite">("clay");
  const [resetKey, setResetKey] = React.useState(0);
  const [inspector, setInspector] = React.useState<Inspector>("surface");
  const [status, setStatus] = React.useState<"loading" | "ready" | "error">("loading");
  const [reducedMotion, setReducedMotion] = React.useState(false);
  const [announcement, setAnnouncement] = React.useState("");
  const inspectorHeading = React.useRef<HTMLHeadingElement>(null);
  const viewportButton = React.useRef<HTMLButtonElement>(null);
  const treeLabel = React.useId();

  React.useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(preference.matches);
    sync();
    preference.addEventListener("change", sync);
    return () => preference.removeEventListener("change", sync);
  }, []);

  const ready = status === "ready";
  const playing = ready && rotating && !reducedMotion;
  const materialLabel = material === "clay" ? "Fine lines" : "Ink lines";
  const statusLabel = status === "loading" ? "Loading viewer" : status === "error" ? "Viewer unavailable" : "Viewer connected";
  const turntableLabel = status === "loading" ? "Waiting for the model" : status === "error" ? "Viewer unavailable" : reducedMotion ? "Reduced motion is on" : playing ? "Automatic orbit enabled" : "Manual orbit";

  function toggleRotation() {
    if (!ready || reducedMotion) return;
    setRotating(value => !value);
    setAnnouncement(rotating ? "Automatic orbit paused." : "Automatic orbit enabled. Interacting with the viewer pauses its movement.");
  }
  function toggleMesh() {
    if (!ready) return;
    setWireframe(value => !value);
    setAnnouncement(wireframe ? "Line drawing selected." : "Mesh view selected.");
  }
  function updateProperties(values: PropertyValues) {
    if (!ready) return;
    if ((values.material === "clay" || values.material === "graphite") && values.material !== material) {
      setMaterial(values.material);
      setAnnouncement(`${values.material === "clay" ? "Fine lines" : "Ink lines"} line treatment selected.`);
    }
    if (typeof values.wireframe === "boolean" && values.wireframe !== wireframe) {
      setWireframe(values.wireframe);
      setAnnouncement(values.wireframe ? "Mesh view selected." : "Line drawing selected.");
    }
    if (!reducedMotion && typeof values.rotating === "boolean" && values.rotating !== playing) {
      setRotating(values.rotating);
      setAnnouncement(values.rotating ? "Automatic orbit enabled." : "Automatic orbit paused.");
    }
  }
  function showInspector() {
    setScreen("inspector");
    requestAnimationFrame(() => inspectorHeading.current?.focus({ preventScroll: true }));
  }
  function showViewport(restoreFocus = false) {
    setScreen("viewport");
    if (restoreFocus) requestAnimationFrame(() => viewportButton.current?.focus({ preventScroll: true }));
  }

  return <section className="rw" data-screen={screen} data-viewer-status={status} aria-label="Vehicle modeling workspace">
    <header className="rw-header">
      <div className="rw-project"><span className="rw-project-mark"><Icon name="box" size={24} /></span><div><strong>Vehicle study 01</strong><span>Surface and viewport inspection</span></div></div>
      <span className="rw-connection" role="status"><span aria-hidden="true" data-ready={ready} />{statusLabel}</span>
    </header>

    <div className="rw-body">
      <section className="rw-viewport" aria-label="Model viewport">
        <div className="rw-viewbar"><div className="rw-view-label"><strong>Perspective</strong><span>{wireframe ? "Mesh view" : "Line drawing"}</span></div>
          <nav className="rw-tools" aria-label="Viewport tools">
            <Button variant="ghost" className="rw-tool" disabled={!ready || reducedMotion} aria-label="Auto-rotate model" aria-pressed={playing} title="Auto-rotate model" onClick={toggleRotation}><Icon name="refresh" size={16} /></Button>
            <Button variant="ghost" className="rw-tool" disabled={!ready} aria-label="Show mesh" aria-pressed={wireframe} title="Show mesh" onClick={toggleMesh}><Icon name="grid" size={16} /></Button>
            <Button variant="ghost" className="rw-tool" disabled={!ready} aria-label="Reset camera" title="Reset camera" onClick={() => { setResetKey(value => value + 1); setAnnouncement("Camera reset requested."); }}><Icon name="camera" size={16} /></Button>
          </nav>
        </div>
        <div className="rw-model-host"><CarViewport rotating={playing} wireframe={wireframe} material={material} resetKey={resetKey} onStatusChange={setStatus} /></div>
        <div className="rw-transport"><Button variant="ghost" className="rw-tool" disabled={!ready || reducedMotion} aria-label={playing ? "Pause turntable" : "Play turntable"} onClick={toggleRotation}><Icon name={playing ? "pause" : "play"} size={16} /></Button><div><strong>Turntable</strong><span>{turntableLabel}</span></div><span className="rw-current-material">{materialLabel}</span></div>
      </section>

      <aside className="rw-inspector" aria-label="Vehicle inspector">
        <header className="rw-inspector-head"><Button variant="ghost" className="rw-back rw-tool" aria-label="Back to viewport" onClick={() => showViewport(true)}><Icon name="arrow-left" size={16} /></Button><div><span className="rw-eyebrow">Vehicle study 01</span><h2 ref={inspectorHeading} tabIndex={-1}>Model inspector</h2></div><Icon name="settings" size={16} /></header>
        <div className="rw-inspector-scroll">
          <div className="rw-scene-tree"><h3 id={treeLabel}>Scene collection</h3><TreeView label="Model inspector" value={inspector} onValueChange={value => { if (value === "vehicle" || value === "surface" || value === "viewport") setInspector(value); }} defaultExpanded={["vehicle"]} nodes={[{ id: "vehicle", label: "Vehicle study 01", children: [{ id: "surface", label: "Surface" }, { id: "viewport", label: "Viewport" }] }]} /></div>
          <section className="rw-properties" aria-labelledby={`${treeLabel}-properties`}>
            <h3 id={`${treeLabel}-properties`}>{inspector === "viewport" ? "Viewport settings" : inspector === "surface" ? "Surface properties" : "Model overview"}</h3>
            {inspector === "vehicle" ? <p className="rw-panel-copy">A complete vehicle asset. Choose Surface to compare line treatments, or Viewport to inspect its mesh and orbit settings.</p> : <PropertyGrid label={inspector === "viewport" ? "Viewport" : "Surface"} value={{ material, wireframe, rotating: playing }} onValueChange={updateProperties} fields={inspector === "viewport" ? [{ id: "wireframe", label: "Show mesh", type: "switch", disabled: !ready }, { id: "rotating", label: "Auto-rotate", type: "switch", disabled: !ready || reducedMotion }] : [{ id: "material", label: "Line treatment", type: "select", disabled: !ready, options: [{ value: "clay", label: "Fine lines" }, { value: "graphite", label: "Ink lines" }] }]} />}
            {reducedMotion && inspector === "viewport" && <p className="rw-panel-copy">Automatic orbit is off while reduced motion is enabled. Camera keys and dragging remain available.</p>}
          </section>
          <Card className="rw-model-facts"><h3>Asset details</h3><DescriptionList items={[{ id: "triangles", label: "Triangles", value: "204,453" }, { id: "vertices", label: "Vertices", value: "147,374" }, { id: "materials", label: "Materials", value: "21" }]} /></Card>
          <p className="rw-panel-copy">Drag the model to orbit, or focus the viewport and use the left and right arrow keys. The turntable pauses while you interact with the viewer.</p>
        </div>
        <footer className="rw-inspector-foot"><Icon name="info" size={16} /><span>Live viewer controls. Geometry editing is outside this study.</span></footer>
      </aside>
    </div>

    <footer className="rw-footer"><span><Icon name="box" size={12} />204,453 triangles · 21 materials</span><span>{wireframe ? "Mesh" : "Line drawing"} · {materialLabel}</span></footer>
    <nav className="rw-mobile-nav" aria-label="Model workspace"><Button ref={viewportButton} variant="ghost" aria-pressed={screen === "viewport"} onClick={() => showViewport()}><Icon name="grid" size={16} /><span>Viewport</span></Button><Button variant="ghost" aria-pressed={screen === "inspector"} onClick={showInspector}><Icon name="settings" size={16} /><span>Inspector</span></Button></nav>
    <p className="rw-announcement" role="status">{announcement}</p>
  </section>;
}
