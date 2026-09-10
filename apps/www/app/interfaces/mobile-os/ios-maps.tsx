"use client";

import { Button, Icon, NativeSelect } from "@noorddev/vlak-react";

type IOSMapsProps = {
  destination: string;
  routing: boolean;
  step: number;
  zoom: number;
  onDestination: (destination: string) => void;
  onZoom: (zoom: number) => void;
  onStart: () => void;
  onNext: () => void;
  onEnd: () => void;
};

/** A map-first local route study. Route steps never claim live navigation. */
export function IOSMaps({ destination, routing, step, zoom, onDestination, onZoom, onStart, onNext, onEnd }: IOSMapsProps) {
  const station = destination === "station";
  const title = station ? "Station" : "Park";
  const steps = station ? ["Leave the studio on Langestraat", "Continue toward the canal", "Arrive at the sample station"] : ["Leave the studio courtyard", "Follow the canal path", "Arrive at the sample park"];
  return <div className="mo-ios-maps-app">
    <div className="mo-ios-map-canvas" role="group" aria-label="Illustrative neighbourhood map">
      <svg viewBox="0 0 360 460" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <g transform={`translate(${180 - 180 * zoom} ${230 - 230 * zoom}) scale(${zoom})`}>
          <path className="mo-ios-map-park" d="M254 140H360V267H290L254 213Z" />
          <path className="mo-ios-map-water" d="M-20 370C50 340 160 320 380 300" />
          <path className="mo-ios-map-minor" d="M0 70H360M0 155H360M0 260H360M0 420H360M55 0V460M160 0V460M300 0V460M0 225L360 180M235 0L285 460" />
          <path className="mo-ios-map-major" d="M-20 310L180 256L380 237M103-10L114 155L134 340L157 480" />
          <path className="mo-ios-map-line" data-active={routing} d={station ? "M114 155L124 254L300 240L300 155" : "M114 155L124 254L253 244L269 190L305 190"} />
          <circle className="mo-ios-map-origin-halo" cx="114" cy="155" r="12" />
          <circle className="mo-ios-map-origin" cx="114" cy="155" r="5" />
          <g transform={`translate(${station ? 300 : 305} ${station ? 155 : 190})`}><path className="mo-ios-map-pin" d="M0 0C-5-7-12-14-12-22a12 12 0 0 1 24 0C12-14 5-7 0 0Z" /><circle className="mo-ios-map-pin-center" cy="-22" r="4" /></g>
        </g>
      </svg>
      <span className="mo-ios-map-disclaimer">Illustrative map</span>
      <div className="mo-ios-map-zoom" role="group" aria-label="Map zoom">
        <Button variant="ghost" aria-label="Zoom in" disabled={zoom >= 2} onClick={() => onZoom(Math.min(2, zoom + .25))}><Icon name="plus" size={24} style={{ width: 24, height: 24 }} /></Button>
        <Button variant="ghost" aria-label="Zoom out" disabled={zoom <= 1} onClick={() => onZoom(Math.max(1, zoom - .25))}><Icon name="minus" size={24} style={{ width: 24, height: 24 }} /></Button>
      </div>
    </div>
    <section className="mo-ios-map-sheet" aria-label="Local route">
      <span className="mo-ios-sheet-grabber" aria-hidden="true" />
      {routing ? <>
        <div className="mo-ios-map-instruction" aria-live="polite"><Icon name={step === 2 ? "map-pin" : "arrow-up"} size={24} style={{ width: 30, height: 30 }} /><div><span>Step {step + 1} of 3 · Local route</span><h3>{steps[step]}</h3></div></div>
        <div className="mo-ios-map-route-actions"><Button variant="ghost" onClick={onEnd}>End route</Button><Button disabled={step === 2} onClick={onNext}>{step === 2 ? "Arrived" : "Next step"}</Button></div>
      </> : <>
        <div className="mo-ios-map-destination"><Icon name="search" size={24} style={{ width: 20, height: 20 }} /><NativeSelect aria-label="Destination" value={destination} onChange={event => onDestination(event.target.value)}><option value="station">Station</option><option value="park">Park</option></NativeSelect></div>
        <div className="mo-ios-map-route-summary"><div><h3>{title}</h3><span>{station ? "1.2 km" : "850 m"} · Sample route</span></div><Button onClick={onStart} aria-label="Start local route"><Icon name="arrow-up" size={24} style={{ width: 20, height: 20 }} />Go</Button></div>
        <p className="mo-caption">Step through a local route. No location service is used.</p>
      </>}
    </section>
  </div>;
}
