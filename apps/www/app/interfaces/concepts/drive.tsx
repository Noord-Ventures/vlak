"use client";

import * as React from "react";
import { Button, Card, CardLabel, Icon, Progress, ToggleGroup, Metric, NumberField, PlaybackControls, MediaScrubber, ConnectionStatus } from "@noorddev/vlak-react";

type DriveMode = "vehicle" | "journey" | "energy";

const views = [
  { value: "vehicle", label: "Vehicle" },
  { value: "journey", label: "Journey" },
  { value: "energy", label: "Energy" },
];

export function Drive() {
  const [mode, setMode] = React.useState<DriveMode>("vehicle");
  const [temp, setTemp] = React.useState(20);
  const [playing, setPlaying] = React.useState(true);
  const [locked, setLocked] = React.useState(true);
  const [lights, setLights] = React.useState(false);
  const [navigating, setNavigating] = React.useState(false);
  const [scheduled, setScheduled] = React.useState(false);
  const [connected, setConnected] = React.useState(true);
  const [chargeLimit, setChargeLimit] = React.useState(90);
  const [playhead, setPlayhead] = React.useState(90);

  function toggleConnection() {
    setConnected((value) => !value);
    if (connected) setPlaying(false);
  }

  return (
    <div className="cx cx-drive" data-view={mode} data-playing={playing && connected}>
      <header>
        <span className="cx-ev-time">09:41</span>
        <b>Vehicle systems</b>
        <span className="cx-ev-connection"><span>18°C</span><ConnectionStatus state={connected ? "connected" : "offline"} /></span>
      </header>

      <section className="cx-ev-vehicle" aria-label="Electric vehicle concept">
        <div className="cx-ev-overview">
          <div className="cx-ev-model"><b>Vehicle 01</b><span>Electric concept</span></div>
          <ToggleGroup className="cx-ev-modes" style={{ height: "auto", borderRadius: "var(--radius-sm)" }} aria-label="Vehicle view" value={mode} options={views} onValueChange={(value) => setMode(value as DriveMode)} />
        </div>

        <div className="cx-ev-illustration" data-lights={lights}>
          <div className="cx-ev-vehicle-art">
            <div className="cx-ev-ground" aria-hidden="true" />
            <img src="/interfaces/concepts/vehicle-line-v5.png" alt="Electric vehicle concept, side-profile line illustration" draggable="false" />
            <span className="cx-ev-headlight" aria-hidden="true" />
          </div>
          <div className="cx-ev-journey-map" role="img" aria-label="Perspective route map to Utrecht Centraal">
            <div className="cx-ev-map-plane" aria-hidden="true" />
            <svg viewBox="0 0 800 360" aria-hidden="true"><path className="cx-ev-map-road" d="M36 332 C176 280 202 206 322 200 S482 238 566 146 692 78 786 34"/><path className="cx-ev-map-route" d="M36 332 C176 280 202 206 322 200 S482 238 566 146 692 78 786 34"/><circle cx="322" cy="200" r="5"/><circle cx="566" cy="146" r="5"/><circle cx="748" cy="55" r="8"/></svg>
            <div className="cx-ev-map-destination"><small>Destination</small><b>Utrecht Centraal</b></div>
            <div className="cx-ev-map-hud"><span><b>31</b> km</span><span><b>24</b> min</span><span><b>10:05</b> ETA</span></div>
          </div>
          <div className="cx-ev-energy-cutaway" role="img" aria-label="Vehicle cutaway showing an 84 percent charged battery pack">
            <img src="/interfaces/concepts/vehicle-line-v5.png" alt="" draggable="false" />
            <div className="cx-ev-battery-pack" aria-hidden="true">{Array.from({ length: 12 }, (_, index) => <i key={index} data-charged={index < 10}/>)}</div>
            <div className="cx-ev-energy-readout"><small>Traction battery</small><strong>84<span>%</span></strong><p>72.4 kWh available</p></div>
            <div className="cx-ev-energy-flow" aria-hidden="true"><i/><i/><i/></div>
          </div>
        </div>

        <div className="cx-ev-view-detail" key={mode}>
          {mode === "vehicle" && (
            <>
              <div className="cx-ev-state" aria-live="polite"><span className="cx-ev-status-dot" /><div><b>{locked ? "Ready when you are" : "Vehicle unlocked"}</b><span>{locked ? "Doors locked · parked" : "Doors unlocked · parked"}</span></div></div>
              <div className="cx-ev-view-actions">
                <Button variant="ghost" aria-pressed={locked} onClick={() => setLocked((value) => !value)}><Icon name={locked ? "lock" : "unlock"} size={16} />{locked ? "Locked" : "Unlocked"}</Button>
                <Button variant="ghost" aria-pressed={lights} onClick={() => setLights((value) => !value)}><Icon name="sun" size={16} />{lights ? "Lights on" : "Lights off"}</Button>
              </div>
            </>
          )}
          {mode === "journey" && (
            <>
              <div className="cx-ev-state" aria-live="polite"><Icon name="compass" size={16} /><div><b>Utrecht Centraal</b><span>{navigating ? "Route active · 24 min · 31 km" : "Via A2 · 24 min · arrive 10:05"}</span></div></div>
              <Button variant="ghost" className="cx-ev-view-action" aria-pressed={navigating} onClick={() => setNavigating((value) => !value)}>{navigating ? "End route" : "Start route"}<Icon name={navigating ? "close" : "arrow-right"} size={16} /></Button>
            </>
          )}
          {mode === "energy" && (
            <>
              <div className="cx-ev-state" aria-live="polite"><Icon name="activity" size={16} /><div><b>{scheduled ? "Charge scheduled for 23:00" : "Set your next charge"}</b><span>{scheduled ? `Home charger · limit ${chargeLimit}%` : "Home charger · off-peak from 23:00"}</span></div></div>
              <Button variant="ghost" className="cx-ev-view-action" aria-pressed={scheduled} onClick={() => setScheduled((value) => !value)}>{scheduled ? "Cancel schedule" : "Schedule charge"}<Icon name={scheduled ? "close" : "clock"} size={16} /></Button>
            </>
          )}
        </div>
      </section>

      <section className="cx-ev-panels" aria-label="Vehicle controls">
        <Card className="cx-ev-card">
          <Metric label="Range" value={386} unit="km" description={navigating ? "355 km after arrival" : "Estimated range"} comparison={<span className="cx-ev-footnote"><Icon name="compass" size={12} />{navigating ? "31 km to destination" : "Ready for your next journey"}</span>} />
        </Card>

        <Card className="cx-ev-card">
          <Metric label="Battery" value={84} unit="%" />
          <div className="cx-ev-battery-detail">
            <Progress className="cx-ev-battery" value={84} aria-label="Battery charge" />
            <Button variant="ghost" className="cx-ev-text-control" onClick={() => setChargeLimit((value) => value === 90 ? 100 : 90)} aria-label={`Charge limit ${chargeLimit} percent. Change to ${chargeLimit === 90 ? 100 : 90} percent`}>Limit {chargeLimit}%<Icon name="chevron-right" size={12} /></Button>
          </div>
        </Card>

        <Card className="cx-ev-card">
          <NumberField className="cx-ev-cabin-field" label="Cabin" value={temp} min={16} max={28} step={1} unit="°" controlsPlacement="stacked" incrementLabel="Raise temperature" decrementLabel="Lower temperature" onValueChange={(value) => setTemp(Math.min(28, Math.max(16, value ?? 20)))} />
          <div className="cx-ev-card-content">
            <span className="cx-ev-caption">Climate on · both zones</span>
            <span className="cx-ev-footnote"><Icon name="sun" size={12} />Comfort temperature</span>
          </div>
        </Card>

        <Card className="cx-ev-card cx-ev-media">
          <CardLabel>Media</CardLabel>
          <div className="cx-ev-card-content">
            <div className="cx-ev-track"><b>Fortress Down</b><span>Loathe</span></div>
            <div className="cx-ev-player">
              <PlaybackControls playing={playing && connected} disabled={!connected} onPlayingChange={setPlaying} previousLabel="Restart track" nextLabel="Skip ahead" onPrevious={() => setPlayhead(0)} onNext={() => setPlayhead((value) => Math.min(237, value + 15))} />
              <span className="cx-ev-audio-level" role="img" aria-label={playing && connected ? "Playing" : "Paused"}><i /><i /><i /><i /></span>
            </div>
            <MediaScrubber className="cx-ev-playhead" duration={237} value={playhead} onValueChange={setPlayhead} disabled={!connected} label="Track position" />
            <Button variant="ghost" className="cx-ev-text-control" onClick={toggleConnection} aria-label={connected ? "Disconnect Mara’s phone" : "Connect Mara’s phone"}><Icon name="smartphone" size={12} />{connected ? "Mara’s phone" : "Connect phone"}</Button>
          </div>
        </Card>
      </section>
    </div>
  );
}
