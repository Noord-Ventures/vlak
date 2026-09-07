"use client";

import * as React from "react";
import { Badge, Button, CanvasControls, Card, CardBody, CardLabel, CardTitle, Icon, Item, Progress, ToggleGroup } from "@noorddev/vlak-react";
import "./orbit.css";

const assets = [
  { name: "Asteria-3", region: "North Sea pass", coords: "52.37° N · 4.90° E", window: "11:42–11:49", altitude: "612 km", velocity: "7.54 km/s", downlink: "94 Mbps", cloud: 18, x: "48%", y: "46%" },
  { name: "Helios-7", region: "Alpine corridor", coords: "46.82° N · 8.23° E", window: "12:06–12:13", altitude: "584 km", velocity: "7.58 km/s", downlink: "88 Mbps", cloud: 9, x: "66%", y: "66%" },
  { name: "Northwatch-2", region: "Baltic coast", coords: "57.70° N · 11.97° E", window: "12:22–12:30", altitude: "638 km", velocity: "7.51 km/s", downlink: "91 Mbps", cloud: 24, x: "70%", y: "28%" },
  { name: "Copernia-5", region: "Atlantic approach", coords: "48.39° N · 4.49° W", window: "12:41–12:48", altitude: "601 km", velocity: "7.56 km/s", downlink: "96 Mbps", cloud: 31, x: "24%", y: "62%" },
] as const;
const layers = ["Base map", "Moisture", "Thermal"] as const;
type Screen = "map" | "assets" | "pass";

const coastlines = [
  "M397 0L386 25 372 48 357 66 365 85 353 102 343 107 335 128 344 139 336 150 342 171 353 189 371 202 390 194 407 175 417 151 438 139 445 119 458 107 472 89 481 62 495 33 512 0Z",
  "M640 176L583 173 555 186 532 195 509 195 491 204 481 225 467 229 456 244 435 249 421 268 409 273 394 267 380 275 366 281 353 299 337 307 315 307 298 316 281 319 264 310 253 318 265 333 285 340 297 356 291 377 307 390 321 399 333 417 330 431 308 438 286 434 268 439 247 431 230 445 214 442 206 460 203 480 219 493 221 507 242 516 273 522 299 509 321 509 333 494 345 482 354 461 372 447 389 447 406 454 419 471 430 480 438 477 431 466 421 454 414 439 410 424 422 410 438 416 450 433 463 450 481 469 496 471 502 487 514 497 520 486 514 469 527 455 537 450 546 462 558 476 576 483 594 504 617 518 640 520Z",
  "M233 125L248 122 244 139 256 147 250 166 261 171 259 187 268 196 263 213 274 226 282 230 288 246 280 259 292 269 297 284 287 296 263 294 248 301 229 303 217 298 230 285 222 276 229 265 223 252 233 246 226 229 229 215 218 207 228 194 219 177 228 169 218 157 231 149Z",
  "M195 192L211 190 220 202 211 213 220 224 212 240 198 247 187 242 182 251 168 248 162 238 175 230 168 218 181 215 179 203Z",
  "M409 211L419 205 428 213 431 231 421 238 410 229Z",
  "M434 244L446 239 453 246 448 254 437 254Z",
  "M397 472L402 484 399 495 391 493 389 481Z",
  "M451 496L472 500 480 512 469 517 453 509Z",
];
const observationPoints = [{ x: 378, y: 273 }, { x: 428, y: 406 }, { x: 477, y: 145 }, { x: 237, y: 374 }];

/** An illustrative line map; overlays are visual sample layers, not measured imagery. */
function ObservationDrawing({ layer, selected }: { layer: (typeof layers)[number]; selected: number }) {
  const uid = React.useId().replaceAll(":", "");
  const point = observationPoints[selected]!;
  const track = `M${point.x - 170} 580Q${point.x - 60} ${point.y + 140} ${point.x} ${point.y}T${point.x + 150} -20`;
  return <svg className="so-map-art" viewBox="0 0 640 560" role="img" aria-labelledby={`${uid}-title ${uid}-description`}>
    <title id={`${uid}-title`}>{`${layer} schematic of Western Europe`}</title>
    <desc id={`${uid}-description`}>Simplified coastline and supplied observation points. {assets[selected]!.name} is selected. The scan path and {layer === "Base map" ? "geography are illustrative" : `${layer.toLowerCase()} overlay are synthetic samples`}; they are not measured satellite imagery.</desc>
    <defs>
      <pattern id={`${uid}-grid`} width="64" height="56" patternUnits="userSpaceOnUse"><path d="M64 0H0V56" className="so-graticule" /></pattern>
      <pattern id={`${uid}-moisture`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-25)"><path d="M0 0V8" className="so-moisture-hatch" /></pattern>
      <clipPath id={`${uid}-land`}>{coastlines.map((d, index) => <path key={index} d={d} />)}</clipPath>
      <clipPath id={`${uid}-acquisition-window`}><rect width="640" height="560" /></clipPath>
    </defs>
    <rect width="640" height="560" className="so-ocean" />
    <g className="so-land">{coastlines.map((d, index) => <path key={index} d={d} />)}</g>
    <rect className="so-grid" width="640" height="560" fill={`url(#${uid}-grid)`} />
    <g className="so-boundaries"><path d="M354 300L362 324 348 339 347 356 363 375 386 385 408 380 425 366 447 371 466 358M323 399L351 410 371 401 389 405 410 424M447 371L465 327 457 302 471 276 467 229M338 439L354 427 375 423 391 430" /><path d="M511 215L525 245 518 283 529 305 544 334 554 358 576 370" /></g>
    <g className="so-rivers"><path d="M402 389C377 369 390 347 372 328S369 296 380 275M319 336Q344 347 356 332M450 390Q480 383 500 406T552 421" /></g>
    {layer === "Moisture" && <g className="so-moisture-overlay" clipPath={`url(#${uid}-land)`}><path d="M160 210C245 135 301 216 328 296S452 406 431 477 281 503 256 410 193 343 160 210Z" fill={`url(#${uid}-moisture)`} /><path d="M329 33C423 76 460 169 431 251S363 311 352 252 307 162 329 33Z" fill={`url(#${uid}-moisture)`} /><path className="so-overlay-edge" d="M225 284C275 257 288 341 326 362S390 407 381 450M359 92Q396 174 379 235" /></g>}
    {layer === "Thermal" && <g className="so-thermal-overlay" clipPath={`url(#${uid}-land)`}>{[0,1,2,3,4].map(index => <ellipse key={index} cx="315" cy="481" rx={46 + index * 34} ry={24 + index * 22} transform="rotate(-17 315 481)" />)}{[0,1,2].map(index => <ellipse key={index} cx="494" cy="366" rx={30 + index * 27} ry={23 + index * 21} transform="rotate(24 494 366)" />)}</g>}
    <g className="so-geographic-labels"><text x="171" y="165">Ireland</text><text x="238" y="321">Channel</text><text x="317" y="197">North Sea</text><text x="323" y="382">France</text><text x="456" y="303">Germany</text><text x="471" y="83">Sweden</text><text x="250" y="481">Spain</text><text x="450" y="466">Italy</text></g>
    <g className="so-track"><path className="so-track-corridor" d={track} /><path className="so-track-line" d={track} /></g>
    <g className="so-observation-points">{observationPoints.map((item,index) => <g key={index} transform={`translate(${item.x} ${item.y})`} className={selected === index ? "so-point so-point-selected" : "so-point"}><circle r="4" /><text x="10" y="-8">0{index + 1}</text></g>)}</g>
    <g className="so-target" transform={`translate(${point.x} ${point.y})`}><path d="M-18 -9V-18H-9M9 -18H18V-9M18 9V18H9M-9 18H-18V9M0 -25V-10M0 10V25M-25 0H-10M10 0H25" /></g>
    <g clipPath={`url(#${uid}-acquisition-window)`}>
      <g className="so-sweep" style={{ offsetPath: `path("${track}")` }}>
        <path className="so-acquisition-ticks" d="M-11 0H-6M6 0H11M0 8V15" />
        <circle className="so-acquisition-ring" r="4" />
        <circle className="so-acquisition-center" r="1.5" />
      </g>
    </g>
    <g className="so-coordinate-labels"><text x="12" y="548">10° W</text><text x="311" y="548">10° E</text><text x="583" y="548">30° E</text><text x="607" y="28">60° N</text><text x="607" y="275">50° N</text></g>
  </svg>;
}

export function OrbitBoard() {
  const [screen, setScreen] = React.useState<Screen>("map");
  const [zoom, setZoom] = React.useState(1);
  const [layer, setLayer] = React.useState<(typeof layers)[number]>("Base map");
  const [selected, setSelected] = React.useState(0);
  const [queued, setQueued] = React.useState<string[]>([]);
  const [animated, setAnimated] = React.useState(true);
  const [reducedMotion, setReducedMotion] = React.useState(false);
  const [announcement, setAnnouncement] = React.useState("");
  const heading = React.useRef<HTMLHeadingElement>(null);
  const assetButtons = React.useRef(new Map<number, HTMLButtonElement>());
  const asset = assets[selected]!;
  const isQueued = queued.includes(asset.name);
  const moving = animated && !reducedMotion;

  React.useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(preference.matches);
    sync(); preference.addEventListener("change", sync);
    return () => preference.removeEventListener("change", sync);
  }, []);

  function openPass(index = selected) {
    setSelected(index); setScreen("pass");
    requestAnimationFrame(() => heading.current?.focus({ preventScroll: true }));
  }
  function showAssets() {
    setScreen("assets");
    requestAnimationFrame(() => assetButtons.current.get(selected)?.focus({ preventScroll: true }));
  }
  function queueCapture() {
    setQueued(current => current.includes(asset.name) ? current : [...current, asset.name]);
    setAnnouncement(`${asset.name} capture queued locally. No satellite command was sent.`);
  }

  return <div className="so-frame"><section className="so" data-screen={screen} aria-label="Satellite observation console">
    <header className="so-header">
      <div className="so-brand"><Icon name="crosshair" /><div><strong>European survey</strong><span>Observation plan / 04 assets</span></div></div>
      <span className="so-local"><span />Local sample</span>
      <Button size="sm" disabled={isQueued} onClick={queueCapture}><Icon name={isQueued ? "check" : "camera"} size={16} /><span>{isQueued ? "Capture queued" : "Queue capture"}</span></Button>
    </header>

    <div className="so-body">
      <aside className="so-assets" aria-label="Observation assets">
        <div className="so-panel-head"><span className="so-eyebrow">Observation network</span><h2>Assets <span>04</span></h2><p>Four supplied pass records</p></div>
        <div className="so-asset-list">{assets.map((item, index) => <Button key={item.name} variant="ghost" className="so-asset" aria-pressed={selected === index} onClick={() => openPass(index)} ref={node => { if (node) assetButtons.current.set(index, node); else assetButtons.current.delete(index); }}>
          <span className="so-asset-top"><span className="so-asset-number">0{index + 1}</span><Icon name={queued.includes(item.name) ? "check" : "crosshair"} size={16} /></span>
          <strong>{item.name}</strong><span>{item.region}</span><small>{queued.includes(item.name) ? "Capture queued" : `${item.window} CET`}</small>
        </Button>)}</div>
        <div className="so-assets-foot"><Icon name="layers" size={16} /><span>{queued.length} of 4 captures queued<br /><small>Saved in this tab</small></span></div>
      </aside>

      <section className="so-map" aria-label="Observation map" data-layer={layer.toLowerCase().replace(" ", "-")} data-asset={selected} data-motion={moving ? "playing" : "paused"}>
        <div className="so-layer-bar"><ToggleGroup className="so-layers" aria-label="Observation layer" value={layer} onValueChange={value => setLayer(value as (typeof layers)[number])} options={layers.map(value => ({ value, label: value }))} /></div>
        <div className="so-stage">
          <div className="so-visual" style={{ transform: `scale(${zoom})` }}><ObservationDrawing layer={layer} selected={selected} /></div>
          <div className="so-map-tag"><span>Western Europe</span><small>{layer === "Base map" ? "Schematic coastline" : `${layer} / sample overlay`}</small></div>
          <div className="so-scale"><span aria-hidden="true" />{Math.round(zoom * 100)}% · illustrative map</div>
        </div>
        <div className="so-map-selection"><div><strong>{asset.name}</strong><span>{asset.coords}</span></div><div className="so-selection-actions"><Button className="so-motion" variant="ghost" disabled={reducedMotion} aria-label={reducedMotion ? "Pass animation disabled for reduced motion" : moving ? "Pause pass animation" : "Resume pass animation"} onClick={() => setAnimated(value => !value)}><Icon name={moving ? "pause" : "play"} size={16} /><span>{reducedMotion ? "Still frame" : moving ? "Pause" : "Resume"}</span></Button><Button variant="ghost" size="sm" onClick={() => openPass()} aria-label={`Inspect ${asset.name} pass`}><Icon name="arrow-right" size={16} /></Button></div></div>
        <div className="so-map-tools"><CanvasControls zoom={zoom} onZoomChange={setZoom} minZoom={1} maxZoom={2.5} step={0.25} label="Observation view controls" /></div>
      </section>

      <section className="so-pass" aria-label={`${asset.name} pass details`}>
        <div className="so-pass-head"><Button className="so-back" variant="ghost" aria-label="Back to assets" onClick={showAssets}><Icon name="arrow-left" size={16} /></Button><div><span className="so-eyebrow">Selected pass / 0{selected + 1}</span><h2 ref={heading} tabIndex={-1}>{asset.region}</h2></div></div>
        <div className="so-pass-scroll" role="region" aria-label="Pass telemetry and capture state" tabIndex={0}>
          <Card className="so-window"><CardLabel>Acquisition window</CardLabel><CardTitle>{asset.window}<span>CET</span></CardTitle><CardBody>Sample schedule for {asset.name}.<br />{asset.coords}</CardBody></Card>
          <div className="so-telemetry"><span className="so-eyebrow">Supplied telemetry</span>{[["Altitude", asset.altitude], ["Velocity", asset.velocity], ["Downlink", asset.downlink]].map(([label, value]) => <Item key={label} title={label} meta={value} />)}</div>
          <div className="so-cloud"><Progress value={asset.cloud} label="Cloud cover" aria-label={`${asset.name} cloud cover`} /><p>Recorded cover for this sample pass.</p></div>
          <Card className="so-tasking"><Icon name={isQueued ? "check" : "camera"} size={24} /><CardLabel>Capture request</CardLabel><Badge variant={isQueued ? "solid" : "outline"}>{isQueued ? "Capture queued" : "Ready to queue"}</Badge><CardBody>{isQueued ? "This asset has a capture in the local queue. Other assets retain their own request state." : "Queue this asset's sample acquisition using the capture action above."}</CardBody><p>No uplink or satellite command is sent.</p></Card>
        </div>
      </section>
    </div>

    <footer className="so-footer"><span><Icon name="terminal" size={12} />Local sample · no satellite connection</span><span>{queued.length} queued / 4 assets</span></footer>
    <nav className="so-mobile-nav" aria-label="Observation workspace">{([{ value: "map", label: "Map", icon: "map" }, { value: "assets", label: "Assets", icon: "layers" }, { value: "pass", label: "Pass details", icon: "activity" }] as const).map(item => <Button key={item.value} variant="ghost" aria-pressed={screen === item.value} onClick={() => setScreen(item.value)}><Icon name={item.icon} size={16} /><span>{item.label}</span></Button>)}</nav>
    <span className="so-announcement" role="status">{announcement}</span>
  </section></div>;
}
