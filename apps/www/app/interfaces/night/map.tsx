"use client";

import * as React from "react";
import { Button, Icon, type IconName } from "@noorddev/vlak-react";
import { applyFleetPalette, loadMapbox, loadStreetRoute, type LngLat, type MapInstance, type StreetRoute } from "./mapbox";

export type MapVehicle = { id: string; name: string; icon: IconName; status: string; position: LngLat; route: readonly LngLat[] };
const center: LngLat = [-122.3886, 37.7581];
const baseZoom = 14.5;
export const fleetZoomLimits = { min: 2 ** (12 - baseZoom), max: 2 ** (18 - baseZoom) };
const publicToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const styleURL = (dark: boolean) => `mapbox://styles/mapbox/${dark ? "dark" : "light"}-v11`;
const routeData = (route?: StreetRoute) => ({ type: "FeatureCollection", features: route ? [{ type: "Feature", properties: { profile: route.profile, source: "Mapbox Directions" }, geometry: route.geometry }] : [] });
function sketchPoint([lng, lat]: LngLat): [number, number] { return [(lng + 122.397) / .018 * 660, (37.766 - lat) / .016 * 500]; }

export function FleetMap({ vehicles, selected, zoom, onZoomChange, onSelect }: { vehicles: readonly MapVehicle[]; selected?: string; zoom: number; onZoomChange: (zoom: number) => void; onSelect: (id: string) => void }) {
  const host = React.useRef<HTMLDivElement>(null);
  const viewer = React.useRef<MapInstance | null>(null);
  const dispatchingCamera = React.useRef(false);
  const [status, setStatus] = React.useState<"preview" | "loading" | "ready" | "error">(publicToken.startsWith("pk.") ? "loading" : "preview");
  const [retry, setRetry] = React.useState(0);
  const [points, setPoints] = React.useState<Record<string, { x: number; y: number }>>({});
  const active = vehicles.find(vehicle => vehicle.id === selected);
  const [routeRetry, setRouteRetry] = React.useState(0);
  const [routeState, setRouteState] = React.useState<{ key: string; status: "loading" | "ready" | "error"; route?: StreetRoute }>({ key: "", status: "loading" });
  const routeCache = React.useRef(new Map<string, StreetRoute>());
  const profile = active?.icon === "bicycle" ? "cycling" : "driving";
  const start = active?.route[0];
  const end = active?.route.at(-1);
  const routeKey = active && start && end ? `${profile}:${start.join(",")};${end.join(",")}` : "";
  const route = routeState.key === routeKey && routeState.status === "ready" ? routeState.route : undefined;
  const routeStatus = !routeKey ? "idle" : routeState.key === routeKey ? routeState.status : "loading";
  const state = React.useRef({ vehicles, selected, zoom, onZoomChange, route }); state.current = { vehicles, selected, zoom, onZoomChange, route };
  const ready = status === "ready";
  // biome-ignore lint/correctness/useExhaustiveDependencies: stable endpoint keys avoid new requests when unrelated notes or filters render
  React.useEffect(() => {
    if (!publicToken.startsWith("pk.") || !start || !end || !routeKey) return;
    const cached = routeCache.current.get(routeKey);
    if (cached) { setRouteState({ key: routeKey, status: "ready", route: cached }); return; }
    const controller = new AbortController();
    let cancelled = false;
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    setRouteState({ key: routeKey, status: "loading" });
    loadStreetRoute(start, end, profile, publicToken, controller.signal).then(result => {
      if (cancelled) return;
      if (routeCache.current.size >= 32) routeCache.current.delete(routeCache.current.keys().next().value!);
      routeCache.current.set(routeKey, result);
      setRouteState({ key: routeKey, status: "ready", route: result });
    }).catch(() => { if (!cancelled) setRouteState({ key: routeKey, status: "error" }); }).finally(() => window.clearTimeout(timeout));
    return () => { cancelled = true; controller.abort(); window.clearTimeout(timeout); };
  }, [routeKey, routeRetry]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: A retry deliberately replaces the failed viewer.
  React.useEffect(() => {
    if (!publicToken.startsWith("pk.") || !host.current) return;
    let cancelled = false;
    let map: MapInstance | undefined;
    let timeout = 0;
    let themeObserver: MutationObserver | undefined;
    let resizeObserver: ResizeObserver | undefined;
    let appliedStyle = "";
    let loaded = false;
    const theme = window.matchMedia("(prefers-color-scheme: dark)");
    const isDark = () => document.documentElement.dataset.theme === "dark" || (document.documentElement.dataset.theme !== "light" && theme.matches);
    const project = () => { if (map && !cancelled) setPoints(Object.fromEntries(state.current.vehicles.map(vehicle => [vehicle.id, map!.project(vehicle.position)]))); };
    const setTheme = () => {
      const nextStyle = styleURL(isDark());
      if (map && nextStyle !== appliedStyle) { appliedStyle = nextStyle; map.setStyle(nextStyle, { diff: false }); }
      else if (map?.isStyleLoaded() && host.current) {
        const palette = applyFleetPalette(map, host.current);
        if (map.getSource("fleet-route")) {
          map.setPaintProperty("fleet-route-halo", "line-color", palette.paper);
          map.setPaintProperty("fleet-route-line", "line-color", palette.ink);
        }
      }
    };
    setStatus("loading");
    loadMapbox().then(sdk => {
      if (cancelled || !host.current) return;
      appliedStyle = styleURL(isDark());
      map = new sdk.Map({ container: host.current, accessToken: publicToken, style: appliedStyle, center, zoom: baseZoom + Math.log2(state.current.zoom), minZoom: 12, maxZoom: 18, attributionControl: true, logoPosition: "bottom-left", cooperativeGestures: true, trackResize: false, dragRotate: false, pitchWithRotate: false, fadeDuration: reduced() ? 0 : 150 });
      viewer.current = map;
      map.getCanvas().setAttribute("aria-label", "Map of Dogpatch, San Francisco. Use arrow keys to pan, plus and minus to zoom.");
      timeout = window.setTimeout(() => { if (!cancelled) setStatus("error"); }, 20000);
      map.on("load", () => { loaded = true; window.clearTimeout(timeout); if (!cancelled) { setStatus("ready"); project(); } });
      map.on("move", project);
      map.on("zoomend", event => { if (map && !cancelled && !dispatchingCamera.current && !event?.fleetControl) state.current.onZoomChange(Number((2 ** (map.getZoom() - baseZoom)).toFixed(6))); });
      map.on("style.load", () => {
        if (!map || cancelled) return;
        if (!host.current) return;
        const palette = applyFleetPalette(map, host.current);
        const beforeLabels = map.getStyle().layers?.find(layer => layer.type === "symbol")?.id;
        map.addSource("fleet-route", { type: "geojson", data: routeData(state.current.route) });
        map.addLayer({ id: "fleet-route-halo", type: "line", source: "fleet-route", layout: { "line-join": "round", "line-cap": "round" }, paint: { "line-color": palette.paper, "line-width": 6 } }, beforeLabels);
        map.addLayer({ id: "fleet-route-line", type: "line", source: "fleet-route", layout: { "line-join": "round", "line-cap": "round" }, paint: { "line-color": palette.ink, "line-width": 2.5 } }, beforeLabels);
        if (loaded) setStatus("ready");
        project();
      });
      map.on("error", () => { if (!cancelled && !map?.isStyleLoaded()) setStatus("error"); });
      resizeObserver = new ResizeObserver(() => { if (host.current?.clientWidth && host.current.clientHeight) { map?.resize(); project(); } }); resizeObserver.observe(host.current);
      themeObserver = new MutationObserver(setTheme); themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class", "style"] }); theme.addEventListener("change", setTheme);
    }).catch(() => { if (!cancelled) setStatus("error"); });
    return () => { cancelled = true; window.clearTimeout(timeout); resizeObserver?.disconnect(); themeObserver?.disconnect(); theme.removeEventListener("change", setTheme); map?.remove(); viewer.current = null; };
  }, [retry]);
  React.useEffect(() => {
    const map = viewer.current;
    if (!map || !ready) return;
    map.getSource("fleet-route")?.setData(routeData(route));
    setPoints(Object.fromEntries(vehicles.map(vehicle => [vehicle.id, map.project(vehicle.position)])));
  }, [vehicles, ready, route]);
  const longitude = active?.position[0];
  const latitude = active?.position[1];
  React.useEffect(() => {
    if (!viewer.current || !ready || !selected || longitude === undefined || latitude === undefined) return;
    dispatchingCamera.current = true;
    try { viewer.current.easeTo({ center: [longitude, latitude], zoom: baseZoom + Math.log2(state.current.zoom), duration: reduced() ? 0 : 380 }, { fleetControl: true }); }
    finally { dispatchingCamera.current = false; }
  }, [selected, longitude, latitude, ready]);
  React.useEffect(() => {
    const map = viewer.current;
    const next = baseZoom + Math.log2(zoom);
    if (!map || !ready || Math.abs(map.getZoom() - next) <= 0.00001) return;
    // Stopping a native camera animation can synchronously emit its final zoom event.
    dispatchingCamera.current = true;
    try { map.easeTo({ zoom: next, duration: reduced() ? 0 : 240 }, { fleetControl: true }); }
    finally { dispatchingCamera.current = false; }
  }, [zoom, ready]);
  return <div className="fm-map-view" data-map-status={status} data-route-status={routeStatus} data-route-profile={route?.profile} data-zoom={zoom}>
    <div ref={host} className="fm-mapbox" aria-hidden={!ready} />
    {!ready && <div className="fm-map-preview" style={{ transform: `scale(${zoom})` }}><svg className="fm-map-drawing" viewBox="0 0 660 500" preserveAspectRatio="none" aria-label="Schematic preview of supplied Dogpatch vehicle positions. Street routes appear when the map connects." role="img">
      <rect className="fm-land" width="660" height="500" /><path className="fm-water" d="M475 0H660V500H487L490 402H526V360H493L489 295H540V230H475Z" /><path className="fm-shore" d="M475 0V230H540V295H489L493 360H526V402H490L487 500" />
      <g className="fm-blocks">{Array.from({ length: 6 }, (_, row) => Array.from({ length: 5 }, (_, column) => <rect key={`${row}-${column}`} x={24 + column * 91} y={22 + row * 81} width={68} height={57} />))}</g>
      <g className="fm-roads"><path d="M101 0V500M192 0V500M283 0V500M374 0V500M465 0V500M0 92H479M0 173H479M0 254H505M0 335H495M0 416H495" /></g>
      <g className="fm-street-labels"><text x="25" y="165">20th street</text><text x="25" y="246">22nd street</text><text x="25" y="327">23rd street</text><text x="363" y="475" transform="rotate(-90 363 475)">Third street</text></g>
      <g className="fm-neighborhoods"><text x="223" y="62">Dogpatch</text><text x="495" y="172">Pier 70</text><text x="514" y="451">San Francisco Bay</text></g>
    </svg></div>}
    <div className="fm-marker-layer" style={ready ? undefined : { transform: `scale(${zoom})` }}>{vehicles.map(vehicle => {
      const point = ready ? points[vehicle.id] : undefined;
      const [x, y] = sketchPoint(vehicle.position);
      if (ready && !point) return null;
      return <Button key={vehicle.id} variant={selected === vehicle.id ? "primary" : "ghost"} className="fm-map-marker" data-vehicle={vehicle.id} style={{ left: point ? point.x : `${x / 6.6}%`, top: point ? point.y : `${y / 5}%` }} aria-label={`Select ${vehicle.name} on map`} aria-pressed={selected === vehicle.id} onClick={() => onSelect(vehicle.id)}><span className="fm-pin-symbol"><Icon name={vehicle.icon} size={24} /></span><span className="fm-pin-id">{vehicle.id}</span><span className="fm-pin-anchor" aria-hidden="true" /></Button>;
    })}</div>
    {(!ready || routeStatus !== "error") && <div className="fm-map-readout" role="status"><span>{ready ? route ? `${route.profile === "cycling" ? "Cycling" : "Driving"} route · ${(route.distance / 1000).toFixed(1)} km` : routeStatus === "idle" ? "No selected route" : "Finding street route…" : status === "loading" ? "Loading map" : "Position preview"}</span><span>{ready ? "Mapbox Directions" : "Supplied positions"}</span></div>}
    {ready && routeStatus === "error" && <div className="fm-map-notice" style={{ insetBlockEnd: 58 }} role="status"><Icon name="map" size={16} /><span>Street route unavailable</span><Button variant="ghost" onClick={() => setRouteRetry(value => value + 1)}>Retry route</Button></div>}
    {(status === "preview" || status === "error") && <div className="fm-map-notice"><Icon name="map" size={16} /><span>{status === "preview" ? "Mapbox connection pending" : "Base map unavailable"}</span>{status === "error" && <Button variant="ghost" onClick={() => setRetry(value => value + 1)}>Retry</Button>}</div>}
  </div>;
}
