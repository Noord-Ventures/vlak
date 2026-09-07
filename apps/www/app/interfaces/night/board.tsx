"use client";

import * as React from "react";
import { Badge, Button, CanvasControls, Card, Icon, Input, Progress, Select, Textarea } from "@noorddev/vlak-react";
import { FleetMap, fleetZoomLimits } from "./map";

const vehicles = [
  { id: "04", name: "Van 04", icon: "van", status: "Moving", where: "Third / 20th", trip: "Pier 70 → Minnesota", driver: "Jules", load: "3 of 6 drops", battery: 74, distance: "1.8 km", arrival: "11:54", departure: "Pier 70", next: "Minnesota studio", updated: "11:42", detail: "Three deliveries remain in the supplied Dogpatch route. Loading access is recorded for the Minnesota street stop.", position: [-122.3886, 37.7607], route: [[-122.3849,37.7603],[-122.3886,37.7603],[-122.3886,37.7580],[-122.3905,37.7580],[-122.3905,37.7568]] },
  { id: "19", name: "Truck 19", icon: "truck", status: "Hold", where: "Illinois / 22nd", trip: "Illinois → Tennessee", driver: "Robin", load: "2 of 5 drops", battery: 63, distance: "1.2 km", arrival: "Not supplied", departure: "Illinois loading bay", next: "Tennessee workshop", updated: "11:40", detail: "The sample record shows a loading-bay hold in Dogpatch. No revised arrival time has been supplied.", position: [-122.3869,37.7570], route: [[-122.3869,37.7570],[-122.3869,37.7593],[-122.3894,37.7593],[-122.3894,37.7570]] },
  { id: "03", name: "Car 03", icon: "car", status: "Yard", where: "Indiana / 23rd", trip: "Dogpatch neighborhood loop", driver: "Sam", load: "0 of 4 drops", battery: 96, distance: "2.1 km", arrival: "Not supplied", departure: "Indiana street depot", next: "Third street store", updated: "11:38", detail: "The car is at the neighborhood depot in this snapshot. The supplied route is prepared; departure has not been recorded.", position: [-122.3913,37.7544], route: [[-122.3913,37.7544],[-122.3913,37.7570],[-122.3886,37.7570],[-122.3886,37.7552]] },
  { id: "11", name: "Bicycle 11", icon: "bicycle", status: "Moving", where: "Minnesota / 19th", trip: "Esprit park → 20th street", driver: "Alex", load: "4 of 7 drops", battery: 58, distance: "0.9 km", arrival: "11:51", departure: "Esprit park", next: "20th street gallery", updated: "11:41", detail: "The local courier route crosses the north end of Dogpatch. Three stops remain after the current recorded location.", position: [-122.3906,37.7621], route: [[-122.3906,37.7615],[-122.3906,37.7621],[-122.3894,37.7621],[-122.3894,37.7603]] },
] as const;
type Screen = "vehicles" | "map" | "trip";
const statusIcon = (status: string) => status === "Moving" ? "activity" : status === "Hold" ? "pause" : "building";

export function Board() {
  const [selected, setSelected] = React.useState<string | undefined>("04");
  const [screen, setScreen] = React.useState<Screen>("vehicles");
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [zoom, setZoom] = React.useState(1);
  const [drafts, setDrafts] = React.useState<Record<string, string>>({});
  const [notes, setNotes] = React.useState<Record<string, string>>({});
  const [announcement, setAnnouncement] = React.useState("");
  const mapHeading = React.useRef<HTMLHeadingElement>(null);
  const tripHeading = React.useRef<HTMLHeadingElement>(null);
  const tripButton = React.useRef<HTMLButtonElement>(null);
  const vehicleButtons = React.useRef(new Map<string, HTMLButtonElement>());
  const visible = vehicles.filter(vehicle => (status === "all" || vehicle.status === status) && `${vehicle.name} ${vehicle.driver} ${vehicle.where}`.toLowerCase().includes(query.trim().toLowerCase()));
  const vehicle = visible.find(item => item.id === selected);
  const dirty = vehicle ? (drafts[vehicle.id] ?? "") !== (notes[vehicle.id] ?? "") : false;

  function filter(nextQuery: string, nextStatus: string) {
    setQuery(nextQuery); setStatus(nextStatus);
    const next = vehicles.filter(item => (nextStatus === "all" || item.status === nextStatus) && `${item.name} ${item.driver} ${item.where}`.toLowerCase().includes(nextQuery.trim().toLowerCase()));
    if (!next.some(item => item.id === selected)) setSelected(next[0]?.id);
    if (!next.length) setScreen("vehicles");
  }
  function select(id: string, focus = true) {
    setSelected(id); setScreen("map");
    if (focus) requestAnimationFrame(() => mapHeading.current?.focus({ preventScroll: true }));
  }
  function openTrip() {
    if (!vehicle) return;
    setScreen("trip"); requestAnimationFrame(() => tripHeading.current?.focus({ preventScroll: true }));
  }
  function showMap(returnFocus = false) {
    setScreen("map");
    requestAnimationFrame(() => (returnFocus ? tripButton.current : mapHeading.current)?.focus({ preventScroll: true }));
  }
  function showVehicles() {
    setScreen("vehicles");
    requestAnimationFrame(() => { if (selected) vehicleButtons.current.get(selected)?.focus({ preventScroll: true }); });
  }
  function saveNote() {
    if (!vehicle) return;
    setNotes(current => ({ ...current, [vehicle.id]: drafts[vehicle.id] ?? "" }));
    setAnnouncement(`${vehicle.name}: dispatch note saved in this tab.`);
  }

  return <div className="fm-frame"><section className="fm" data-screen={screen} data-selected={selected ?? ""} aria-label="Delivery fleet desk">
    <header className="fm-header"><div className="fm-brand"><Icon name="truck" size={24} /><div><strong>City deliveries</strong><span>Dogpatch / San Francisco</span></div></div><span className="fm-local"><span />Local dispatch desk</span><span className="fm-snapshot">11:42 / supplied records</span></header>
    <div className="fm-body">
      <aside className="fm-fleet" aria-label="Fleet vehicles"><div className="fm-fleet-head"><span className="fm-eyebrow">Dispatch overview</span><h2>Vehicles <span>{vehicles.length}</span></h2><div className="fm-fleet-summary"><span><strong>2</strong> Moving</span><span><strong>1</strong> Hold</span><span><strong>1</strong> Yard</span></div></div><div className="fm-filters"><Input plain aria-label="Search vehicles" placeholder="Search vehicles or drivers" value={query} onChange={event => filter(event.target.value, status)} /><Select aria-label="Vehicle status" fullWidth value={status} onValueChange={value => filter(query, value)} options={[{ value: "all", label: "All statuses" }, ...["Moving", "Hold", "Yard"].map(value => ({ value, label: value }))]} /></div>
        <div className="fm-results-count">{visible.length} {visible.length === 1 ? "vehicle" : "vehicles"} in this view</div><div className="fm-vehicle-list">{visible.map(item => <Button key={item.id} variant="ghost" className="fm-vehicle" aria-pressed={item.id === selected} onClick={() => select(item.id)} ref={node => { if (node) vehicleButtons.current.set(item.id, node); else vehicleButtons.current.delete(item.id); }}><span className="fm-vehicle-top"><strong><Icon name={item.icon} size={16} />{item.name}</strong><span><Icon name={statusIcon(item.status)} size={12} />{item.status}</span></span><span className="fm-vehicle-place">{item.where}</span><small>{item.driver} · {item.load}<Icon name="chevron-right" size={16} /></small></Button>)}</div>{!visible.length && <Card className="fm-empty"><Icon name="search" size={24} /><h3>No matching vehicles</h3><p>Try another name, location, or status.</p><Button variant="ghost" onClick={() => filter("", "all")}>Clear filters</Button></Card>}<div className="fm-fleet-foot"><Icon name="clock" size={16} /><p>Vehicle positions and times are supplied examples. No live feed is connected.</p></div></aside>
      <section className="fm-map-panel" aria-label="Fleet map">{vehicle ? <><div className="fm-map-head"><div><span className="fm-eyebrow">Selected vehicle</span><h2 ref={mapHeading} tabIndex={-1}>{vehicle.name}<span><Icon name={statusIcon(vehicle.status)} size={12} />{vehicle.status}</span></h2></div><Button ref={tripButton} size="sm" variant="ghost" onClick={openTrip}>View trip<Icon name="arrow-right" size={16} /></Button></div><div className="fm-map-stage"><FleetMap vehicles={visible} selected={vehicle.id} zoom={zoom} onZoomChange={setZoom} onSelect={id => select(id, false)} /><div className="fm-map-caption"><span>Dogpatch, San Francisco</span><small>Supplied vehicle positions</small></div><div className="fm-map-key"><span />Selected route</div></div><div className="fm-map-summary"><div><span>Driver</span><strong>{vehicle.driver}</strong></div><div><span>Next stop</span><strong>{vehicle.next}</strong></div><div><span>Recorded arrival</span><strong>{vehicle.arrival}</strong></div></div><div className="fm-map-tools"><CanvasControls label="Fleet map controls" zoom={zoom} onZoomChange={setZoom} minZoom={fleetZoomLimits.min} maxZoom={fleetZoomLimits.max} step={0.25} /><span>Recorded {vehicle.updated}</span></div></> : <Card className="fm-empty"><Icon name="map" size={24} /><h3>No vehicle selected</h3><p>Clear the fleet filters to choose a vehicle.</p><Button variant="ghost" onClick={() => filter("", "all")}>Show all vehicles</Button></Card>}</section>
      {screen === "trip" && vehicle && <section className="fm-trip" aria-label="Selected vehicle trip"><div className="fm-trip-head"><Button variant="ghost" aria-label="Back to map" onClick={() => showMap(true)}><Icon name="arrow-left" size={16} /></Button><span>Trip record / {vehicle.id}</span></div><div className="fm-trip-scroll"><span className="fm-eyebrow">{vehicle.name} · {vehicle.driver}</span><h2 ref={tripHeading} tabIndex={-1}>{vehicle.trip}</h2><Badge>{vehicle.status}</Badge><p className="fm-trip-copy">{vehicle.detail}</p><div className="fm-trip-metrics"><div><span>Planned distance</span><strong>{vehicle.distance}</strong></div><div><span>Recorded arrival</span><strong>{vehicle.arrival}</strong></div></div><div className="fm-battery"><Progress label="Recorded battery" aria-label={`${vehicle.name} recorded battery`} value={vehicle.battery} /></div><div className="fm-stops"><h3>Route record</h3><ol><li><span className="fm-stop-number">01</span><div><small>Departure</small><strong>{vehicle.departure}</strong><p>{vehicle.status === "Yard" ? "Departure not recorded" : "Collected in the sample record"}</p></div></li><li><span className="fm-stop-number">02</span><div><small>Current position</small><strong>{vehicle.where}</strong><p>{vehicle.status} · Sample {vehicle.updated}</p></div></li><li><span className="fm-stop-number">03</span><div><small>Next stop</small><strong>{vehicle.next}</strong><p>{vehicle.arrival === "Not supplied" ? "Arrival time not supplied" : `Supplied arrival ${vehicle.arrival}`}</p></div></li></ol></div><Textarea label="Dispatch note" placeholder="Add a note for this vehicle" rows={3} value={drafts[vehicle.id] ?? ""} onChange={event => setDrafts(current => ({ ...current, [vehicle.id]: event.target.value }))} /><p className="fm-note-status">{dirty ? "Unsaved changes" : Object.hasOwn(notes, vehicle.id) ? "Note saved locally" : "No local note yet"}</p></div><div className="fm-trip-actions"><Button variant="ghost" onClick={() => showMap()}>Show on map<Icon name="map" size={16} /></Button><Button disabled={!dirty} onClick={saveNote}><Icon name="check" size={16} />Save note</Button></div></section>}
    </div>
    <footer className="fm-footer"><span><Icon name="terminal" size={12} />Local snapshot · no vehicle commands</span><span>{Object.keys(notes).length} notes saved in this tab</span></footer>
    <nav className="fm-mobile-nav" aria-label="Dispatch sections"><Button variant="ghost" aria-current={screen === "vehicles" ? "page" : undefined} onClick={showVehicles}><Icon name="truck" size={16} /><span>Vehicles</span></Button><Button variant="ghost" aria-current={screen === "map" ? "page" : undefined} onClick={() => setScreen("map")}><Icon name="map" size={16} /><span>Map</span></Button><Button variant="ghost" disabled={!vehicle} aria-current={screen === "trip" ? "page" : undefined} onClick={openTrip}><Icon name="list" size={16} /><span>Trip</span></Button></nav>
    <span className="fm-announcement" role="status">{announcement}</span>
  </section></div>;
}
