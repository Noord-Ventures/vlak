"use client";

import * as React from "react";
import { Button, Card, Icon } from "@noorddev/vlak-react";
import { Brand } from "../mark";
import dynamic from "next/dynamic";
import { interfaceBySlug } from "../catalog";
import { InspectorClose } from "../inspector-close";

const WHAT = interfaceBySlug("night")!.what;

/* three.js only loads when the night board mounts, never on the index. */
const Scene = dynamic(() => import("./map").then((m) => m.Scene), { ssr: false });

const UNITS = [
  { id: "04", name: "Van 04", state: "Moving", where: "Market / 3rd", trip: "Pier 70 → Mission", mark: "activity" as const },
  { id: "19", name: "Van 19", state: "Hold", where: "Embarcadero", trip: "Ferry → Folsom", mark: "pause" as const },
  { id: "03", name: "Van 03", state: "Yard", where: "16th / Rhode Island", trip: "Potrero loop", mark: "building" as const },
  { id: "11", name: "Van 11", state: "Moving", where: "Van Ness", trip: "Civic → Geary", mark: "activity" as const },
];

export function Board() {
  const [unit, setUnit] = React.useState("04");
  const [pane, setPane] = React.useState<"none" | "trip">("none");
  const [phonePane, setPhonePane] = React.useState<"map" | "fleet">("fleet");
  const item = UNITS.find((row) => row.id === unit) ?? UNITS[0]!;
  const tripTrigger = React.useRef<HTMLButtonElement | null>(null);
  const tripTitle = React.useRef<HTMLHeadingElement>(null);
  const mapTitle = React.useRef<HTMLHeadingElement>(null);
  const route = item.trip.split(" → ");
  function openTrip(trigger: HTMLButtonElement) {
    tripTrigger.current = trigger;
    setPane("trip");
    requestAnimationFrame(() => tripTitle.current?.focus({ preventScroll: true }));
  }
  function closeTrip() {
    setPane("none");
    requestAnimationFrame(() => tripTrigger.current?.focus({ preventScroll: true }));
  }

  return (
    <section className="if-board sc-night" data-pane={phonePane} data-trip={pane === "trip"} aria-label={WHAT} style={{ ["--if-spot" as string]: "#E30613" }}>
      <header className="sc-night-mobile-header">{pane === "trip" ? <Button variant="ghost" size="sm" onClick={closeTrip}><Icon name="arrow-left" size={16} />Back</Button> : <span><Icon name="truck" size={16} />Dispatch</span>}<span>{pane === "trip" ? "Trip details" : "San Francisco"}</span></header>
      <aside className="sc-night-rail" aria-label="Fleet">
        <div className="sc-night-brand">
          <Brand slug="night" />
          <p className="sc-night-voice">Live dispatch</p>
        </div>
        <p className="sc-night-label if-ico-row">
          <Icon name="truck" size={12} />
          Fleet
        </p>
        <div className="sc-night-mobile-intro"><p>Fleet overview</p><h2>Vehicles on the road</h2><div><span><strong>4</strong> vehicles</span><span><strong>2</strong> moving</span></div></div>
        {UNITS.map((row) => (
          <button
            key={row.id}
            type="button"
            className="sc-night-unit"
            aria-current={unit === row.id}
            onClick={() => {
              setUnit(row.id);
              setPane("none");
              setPhonePane("map");
              requestAnimationFrame(() => mapTitle.current?.focus({ preventScroll: true }));
            }}
          >
            <b className="if-ico-row">
              <Icon name="truck" size={16} />
              {row.name}
              <span className="sc-night-v1-mid"> · {row.state}</span>
            </b>
            <i className="if-ico-row sc-night-desk-state">
              <Icon name={row.mark} size={12} />
              {row.state}
            </i>
            <em className="if-ico-row">
              <Icon name="map-pin" size={12} />
              {row.where}
            </em>
          </button>
        ))}
      </aside>

      <section className="sc-night-field">
        <header className="sc-night-head">
          <p className="if-ico-row">
            <Icon name="truck" size={16} />
            {item.name}
            <Icon name={item.mark} size={12} />
            {item.state}
          </p>
          <Button type="button" variant="ghost" size="sm" className="sc-night-ghost" onClick={() => setPane("trip")}>
            <Icon name="compass" size={12} />
            Open trip
          </Button>
        </header>
        <div className="sc-night-map" role="img" aria-label={`Illustrative map showing ${item.name} near ${item.where}`}>
          <Scene selected={unit} />
          <span className="sc-night-map-label">Illustrative vehicle positions</span>
        </div>
        <Card className="sc-night-mobile-vehicle"><div><h2 ref={mapTitle} tabIndex={-1}>{item.name}</h2><span><Icon name={item.mark} size={16} />{item.state}</span></div><p><Icon name="map-pin" size={16} />{item.where}</p><Button onClick={(event) => openTrip(event.currentTarget)}>View trip<Icon name="arrow-right" size={16} /></Button></Card>
      </section>

      <nav className="sc-night-mobile-nav" aria-label="Dispatch sections">
        <Button
          variant="ghost"
          aria-current={phonePane === "map"}
          onClick={() => { setPhonePane("map"); setPane("none"); }}
        >
          <Icon name="map" size={16} />
          Map
        </Button>
        <Button
          variant="ghost"
          aria-current={phonePane === "fleet"}
          onClick={() => {
            setPhonePane("fleet");
            setPane("none");
          }}
        >
          <Icon name="truck" size={16} />
          Vehicles
        </Button>
      </nav>

      <aside className={`if-inspect${pane === "trip" ? " is-open" : ""}`} aria-label="Trip">
        {pane === "trip" ? <InspectorClose onClick={closeTrip} /> : null}
        {pane === "trip" ? (
          <div key={item.id} className="sc-night-inspect sc-fresh">
            <p className="sc-night-label if-ico-row">
              <Icon name="map" size={12} />
              Trip
            </p>
            <p className="sc-night-trip if-ico-row">
              <Icon name="flag" size={12} />
              {item.trip}
            </p>
            <div className="sc-night-mobile-trip-heading"><p>{item.name} · {item.state}</p><h2 ref={tripTitle} tabIndex={-1}>{item.trip}</h2></div>
            <p className="if-ico-row">
              <Icon name="globe" size={12} />
              San Francisco delivery route. Select a vehicle to inspect its location and current trip.
            </p>
            <dl>
              <div>
                <dt className="if-ico-row">
                  <Icon name="truck" size={12} />
                  Unit
                </dt>
                <dd>{item.name}</dd>
              </div>
              <div>
                <dt className="if-ico-row">
                  <Icon name={item.mark} size={12} />
                  Status
                </dt>
                <dd>{item.state}</dd>
              </div>
              <div>
                <dt className="if-ico-row">
                  <Icon name="map-pin" size={12} />
                  Location
                </dt>
                <dd>{item.where}</dd>
              </div>
            </dl>
            <div className="sc-night-mobile-itinerary"><h3>Route</h3><ol><li><span>Collected</span><strong>{route[0]}</strong><p>Departure confirmed</p></li><li><span>Current location</span><strong>{item.where}</strong><p>{item.state === "Moving" ? "En route to the next stop" : item.state === "Hold" ? "Waiting for the loading bay" : "Vehicle is at the depot"}</p></li><li><span>Next stop</span><strong>{route[1] ?? "Return to depot"}</strong><p>{item.state === "Moving" ? "Estimated arrival in 12 minutes" : "Arrival updates after departure"}</p></li></ol><Button variant="ghost" onClick={() => { setPane("none"); setPhonePane("map"); requestAnimationFrame(() => mapTitle.current?.focus({ preventScroll: true })); }}><Icon name="map" size={16} />Show on map</Button></div>
          </div>
        ) : null}
      </aside>
    </section>
  );
}
