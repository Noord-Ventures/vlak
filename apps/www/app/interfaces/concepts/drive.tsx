"use client";

import * as React from "react";
import { Button, Card, CardLabel, ConnectionStatus, Icon, MediaScrubber, Metric, NumberField, PlaybackControls, Progress, ToggleGroup } from "@noorddev/vlak-react";
import "./drive.css";
import { DriveVehicle } from "./drive-vehicle";

type DriveMode = "vehicle" | "journey" | "energy";
type ControlPanel = "climate" | "charging" | "media";
const views = [{ value: "vehicle", label: "Vehicle" }, { value: "journey", label: "Journey" }, { value: "energy", label: "Energy" }];

export function Drive() {
  const [mode, setMode] = React.useState<DriveMode>("vehicle");
  const [panel, setPanel] = React.useState<ControlPanel | null>(null);
  const [temp, setTemp] = React.useState(20);
  const [playing, setPlaying] = React.useState(true);
  const [locked, setLocked] = React.useState(true);
  const [lights, setLights] = React.useState(false);
  const [navigating, setNavigating] = React.useState(false);
  const [scheduled, setScheduled] = React.useState(false);
  const [connected, setConnected] = React.useState(true);
  const [charge, setCharge] = React.useState(84);
  const [charging, setCharging] = React.useState(false);
  const [chargeLimit, setChargeLimit] = React.useState(90);
  const [playhead, setPlayhead] = React.useState(90);
  const [notice, setNotice] = React.useState("Settings stay in this tab");
  const vehicleHeading = React.useRef<HTMLHeadingElement>(null);
  const controlHeading = React.useRef<HTMLHeadingElement>(null);
  const controlsScroll = React.useRef<HTMLDivElement>(null);
  const previousTheme = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!charging) return;
    if (charge >= chargeLimit) { setCharging(false); return; }
    const timer = window.setTimeout(() => setCharge(value => Math.min(chargeLimit, Math.round((value + .1) * 10) / 10)), 800);
    return () => window.clearTimeout(timer);
  }, [charging, charge, chargeLimit]);

  React.useEffect(() => {
    if (panel === null) return;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented || !(event.target instanceof Node) || !controlHeading.current?.closest(".ev")?.contains(event.target)) return;
      event.preventDefault();
      setPanel(null);
      document.querySelector<HTMLButtonElement>(`.ev-reading[data-panel="${panel}"]`)?.focus();
    };
    document.addEventListener("keydown", dismiss);
    return () => document.removeEventListener("keydown", dismiss);
  }, [panel]);

  function togglePanel(next: ControlPanel) {
    const nextPanel = panel === next ? null : next;
    setPanel(nextPanel);
    controlsScroll.current?.scrollTo({ top: 0 });
    if (nextPanel) requestAnimationFrame(() => controlHeading.current?.focus({ preventScroll: true }));
  }
  function changeView(next: DriveMode) { setMode(next); }
  function toggleLights() {
    let scheme = "dark";
    try {
      if (!lights) previousTheme.current = localStorage.getItem("vlak-theme");
      else scheme = previousTheme.current ?? "auto";
      if (lights && previousTheme.current === null) localStorage.removeItem("vlak-theme");
      else localStorage.setItem("vlak-theme", scheme);
    } catch {
      if (!lights) previousTheme.current = document.documentElement.dataset.theme ?? "auto";
      scheme = lights ? previousTheme.current ?? "auto" : "dark";
    }
    const dark = scheme === "dark" || (scheme === "auto" && matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    window.dispatchEvent(new CustomEvent("vlak:theme", { detail: scheme }));
    setLights(value => !value);
    setNotice(lights ? "Lights off. Previous appearance restored." : "Headlights on. Night mode across Vlak.");
  }
  function toggleLock() {
    setLocked(value => !value);
    setNotice(locked ? "Doors unlocked in this local example." : "Doors locked in this local example.");
  }
  function toggleConnection() {
    setConnected(value => !value);
    if (connected) setPlaying(false);
    setNotice(connected ? "Sample phone disconnected. Media is paused." : "Sample phone connected. Media is ready.");
  }
  function toggleSchedule() {
    setScheduled(value => !value);
    setNotice(scheduled ? "Local charge schedule cancelled." : `Local charge schedule set for 23:00, up to ${chargeLimit}%.`);
  }
  function changeLimit() {
    const next = chargeLimit === 90 ? 100 : 90;
    setChargeLimit(next);
    setNotice(`Local charge limit changed to ${next}%.`);
  }

  return <section className="ev" aria-label="Electric vehicle workspace" data-view={mode} data-control-panel={panel ?? "closed"} data-panel-open={panel !== null} data-playing={playing && connected}>
    <header className="ev-header"><div className="ev-context"><span className="ev-mark"><Icon name="truck" size={24} /></span><div><strong>Home garage</strong><span>Vehicle 01 · Electric concept</span></div></div><div className="ev-header-status"><span className="ev-outside">Outside 18°C</span><ConnectionStatus state={connected ? "connected" : "offline"} label={connected ? "Phone connected" : "Phone offline"} /></div></header>
    <div className="ev-body">
      <section className="ev-vehicle" aria-label="Vehicle overview">
        <div className="ev-view-header"><div><span className="ev-eyebrow">{navigating ? "Journey in progress" : "Parked at home"}</span><h2 ref={vehicleHeading} tabIndex={-1}>{mode === "vehicle" ? "Your vehicle" : mode === "journey" ? "Next journey" : "Battery & charging"}</h2></div><ToggleGroup className="ev-modes" aria-label="Vehicle view" value={mode} options={views} onValueChange={value => changeView(value as DriveMode)} /></div>
        <div className="ev-vehicle-scroll" tabIndex={0} role="region" aria-label="Vehicle scene and readings"><div className="ev-visual" data-lights={lights}>
          <DriveVehicle mode={mode} lights={lights} locked={locked} navigating={navigating} charge={charge} charging={charging} onToggleLights={toggleLights} onToggleLock={toggleLock} load={Math.round(((charging ? -7.2 : navigating ? 18.6 : 2.4) + Math.abs(temp - 20) * .25 + (lights ? .2 : 0)) * 10) / 10} />
        </div>
        </div>{mode !== "vehicle" && <div className="ev-vehicle-actions">
          {mode === "journey" && <><div className="ev-state"><Icon name="compass" /><div><strong>Utrecht Centraal</strong><span>{navigating ? "Route active · 31 km · 24 min · Sample journey" : "31 km · 24 min · Arrival 10:05 · Sample journey"}</span></div></div><Button variant={navigating ? "ghost" : "primary"} onClick={() => { setNavigating(value => !value); setNotice(navigating ? "Local route ended." : "Local route started to Utrecht Centraal."); }}>{navigating ? "End route" : "Start route"}<Icon name={navigating ? "close" : "arrow-right"} /></Button></>}
          {mode === "energy" && <><div className="ev-state"><Icon name="clock" /><div><strong>{scheduled ? "Scheduled for 23:00" : "Next charge"}</strong><span>Home charger · Limit {chargeLimit}%</span></div></div><Button variant={scheduled ? "ghost" : "primary"} onClick={toggleSchedule}>{scheduled ? "Cancel schedule" : "Schedule charge"}<Icon name={scheduled ? "close" : "clock"} /></Button></>}
        </div>}
      </section>
      <section className="ev-controls" id="ev-detail-pane" aria-label="Vehicle controls" aria-hidden={panel === null} inert={panel === null}><div className="ev-controls-inner">
        <div className="ev-controls-header"><div><span className="ev-eyebrow">Your vehicle, your settings</span><h2 ref={controlHeading} tabIndex={-1}>{panel === "media" ? "Your media" : panel === "charging" ? "Range & battery" : "Cabin comfort"}</h2></div><Button variant="ghost" aria-label="Close vehicle details" onClick={() => { setPanel(null); requestAnimationFrame(() => document.querySelector<HTMLButtonElement>(`.ev-reading[data-panel="${panel}"]`)?.focus()); }}><Icon name="close" /></Button></div>
        <div className="ev-controls-scroll" ref={controlsScroll}>
          <Card className="ev-climate"><CardLabel>Climate</CardLabel><h3>Settle into your temperature</h3><p className="ev-description">One target for both front zones.</p><NumberField className="ev-temperature" label="Cabin" value={temp} min={16} max={28} step={1} unit="°C" incrementLabel="Raise temperature" decrementLabel="Lower temperature" onValueChange={value => { setTemp(Math.min(28, Math.max(16, value ?? 20))); setNotice("Cabin target updated locally."); }} /><div className="ev-zones"><div><Icon name="user" /><span>Driver</span><strong>{temp}°</strong></div><div><Icon name="user" /><span>Passenger</span><strong>{temp}°</strong></div></div><div className="ev-control-note"><Icon name="sun" /><span>Climate on · Outside 18°C<br /><span>Sample settings, no vehicle connected</span></span></div></Card>
          <Card className="ev-charging"><CardLabel>Charging</CardLabel><h3>Ready for the next day</h3><div className="ev-charge-reading"><strong>{charge.toFixed(1)}<span>%</span></strong><span>Current charge<br /><span>{charging ? "Charging simulation" : "Not charging"}</span></span></div><Progress value={charge} aria-label="Battery charge" /><div className="ev-setting-row"><div><strong>Charge simulation</strong><span>Local accelerated example</span></div><Button variant="ghost" disabled={!charging && charge >= chargeLimit} onClick={() => setCharging(value => !value)}>{charging ? "Stop simulation" : "Run charge simulation"}</Button></div><div className="ev-setting-row"><div><strong>Charge limit</strong><span>Local target</span></div><Button variant="ghost" onClick={changeLimit} aria-label={`Charge limit ${chargeLimit} percent. Change to ${chargeLimit === 90 ? 100 : 90} percent`}>Limit {chargeLimit}%<Icon name="chevron-right" /></Button></div><div className="ev-charge-schedule"><div><Icon name="clock" /><span><strong>{scheduled ? "Charge scheduled" : "Off-peak schedule"}</strong><span>23:00 · Home charger</span></span></div><Button variant={scheduled ? "ghost" : "primary"} onClick={toggleSchedule}>{scheduled ? "Cancel charging schedule" : "Schedule charging"}</Button></div><p className="ev-description">{scheduled ? `Local schedule saved, up to ${chargeLimit}%. No charger was contacted.` : "Schedule changes stay in this tab."}</p></Card>
          <Card className="ev-media"><CardLabel>Simulated media</CardLabel><div className="ev-album" aria-hidden="true"><div className="ev-album-lines" /><Icon name="music" size={24} /><span>Now playing</span></div><div className="ev-track"><h3>Fortress Down</h3><span>Loathe</span></div><div className="ev-playback"><PlaybackControls playing={playing && connected} disabled={!connected} onPlayingChange={value => { setPlaying(value); setNotice(value ? "Sample media playing. No audio is streamed." : "Sample media paused."); }} previousLabel="Restart track" nextLabel="Skip ahead" onPrevious={() => setPlayhead(0)} onNext={() => setPlayhead(value => Math.min(237, value + 15))} /><span className="ev-playback-state">{playing && connected ? "Playing" : "Paused"}</span></div><MediaScrubber className="ev-playhead" duration={237} value={playhead} onValueChange={setPlayhead} disabled={!connected} label="Track position" /><div className="ev-phone"><div><Icon name="smartphone" /><span><strong>Mara’s phone</strong><span>{connected ? "Sample connection active" : "Disconnected"}</span></span></div><Button variant="ghost" onClick={toggleConnection} aria-label={connected ? "Disconnect Mara’s phone" : "Connect Mara’s phone"}>{connected ? "Disconnect" : "Connect"}</Button></div><p className="ev-description">Playback and seeking are local controls. No audio is streamed.</p></Card>
        </div>
      </div></section>
    </div>
    <div className="ev-readings" role="group" aria-label="Vehicle details">
      <Button variant="ghost" className="ev-reading" data-panel="charging" aria-label="Range and battery" aria-controls="ev-detail-pane" aria-expanded={panel === "charging"} onClick={() => togglePanel("charging")}><Metric label="Range & battery" value={navigating ? 355 : 386} unit="km" /><span className="ev-reading-detail">{charge.toFixed(1)}% <span>· {charging ? "Charging" : "Available charge"}</span></span></Button>
      <Button variant="ghost" className="ev-reading" data-panel="climate" aria-label="Cabin comfort" aria-controls="ev-detail-pane" aria-expanded={panel === "climate"} onClick={() => togglePanel("climate")}><Metric label="Cabin" value={temp} unit="°C" /><span className="ev-reading-detail">Both front zones</span></Button>
      <Button variant="ghost" className="ev-reading ev-media-reading" data-panel="media" aria-label="Media" aria-controls="ev-detail-pane" aria-expanded={panel === "media"} onClick={() => togglePanel("media")}><span className="ev-reading-label">Media</span><strong>Fortress Down</strong><span className="ev-reading-detail">Loathe <span>· {playing && connected ? "Playing" : "Paused"}</span></span></Button>
    </div>
    <footer className="ev-footer"><span role="status">{notice}</span><span>Local demo · No vehicle connection</span></footer>
  </section>;
}
