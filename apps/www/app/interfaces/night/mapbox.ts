// The viewer is loaded only by the Fleet study, after a public token is configured.
export type LngLat = readonly [number, number];
export type StreetRoute = { geometry: { type: "LineString"; coordinates: LngLat[] }; profile: "driving" | "cycling"; distance: number };
type MapLayer = { id: string; type: string; paint?: Record<string, unknown>; layout?: Record<string, unknown> };
export type MapInstance = {
  on: (event: string, callback: (event?: { fleetControl?: boolean }) => void) => void;
  remove: () => void;
  resize: () => void;
  project: (point: LngLat) => { x: number; y: number };
  getZoom: () => number;
  easeTo: (options: { center?: LngLat; zoom?: number; duration?: number }, eventData?: { fleetControl?: boolean }) => void;
  setStyle: (style: string, options?: { diff?: boolean }) => void;
  isStyleLoaded: () => boolean;
  getSource: (id: string) => { setData: (data: unknown) => void } | undefined;
  addSource: (id: string, source: unknown) => void;
  addLayer: (layer: unknown, beforeId?: string) => void;
  setPaintProperty: (id: string, property: string, value: unknown) => void;
  getStyle: () => { layers?: MapLayer[] };
  getCanvas: () => HTMLCanvasElement;
};

const coordinate = (value: unknown): value is LngLat => Array.isArray(value) && value.length >= 2 && typeof value[0] === "number" && typeof value[1] === "number" && Number.isFinite(value[0]) && Number.isFinite(value[1]) && Math.abs(value[0]) <= 180 && Math.abs(value[1]) <= 90;

/** Route geometry comes from the street network; supplied points only define the endpoints. */
export async function loadStreetRoute(start: LngLat, end: LngLat, profile: StreetRoute["profile"], token: string, signal: AbortSignal): Promise<StreetRoute> {
  if (!coordinate(start) || !coordinate(end)) throw new Error("Route endpoints unavailable");
  const url = new URL(`https://api.mapbox.com/directions/v5/mapbox/${profile}/${start.join(",")};${end.join(",")}`);
  url.search = new URLSearchParams({ access_token: token, geometries: "geojson", overview: "full", steps: "false", alternatives: "false", radiuses: "100;100" }).toString();
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error("Street route unavailable");
  const data = await response.json();
  const route = data?.routes?.[0];
  const points: unknown = route?.geometry?.coordinates;
  if (data?.code !== "Ok" || route?.geometry?.type !== "LineString" || !Array.isArray(points) || points.length < 2 || points.length > 16000 || !points.every(coordinate) || !Number.isFinite(route.distance) || route.distance < 0) throw new Error("Street route unavailable");
  return { profile, distance: route.distance, geometry: { type: "LineString", coordinates: points.map(point => [point[0], point[1]]) } };
}

/** Apply the same resolved tokens as the surrounding workspace to every vector paint layer. */
export function applyFleetPalette(map: MapInstance, element: HTMLElement) {
  const style = getComputedStyle(element);
  const read = (name: string, fallback: string) => style.getPropertyValue(name).trim() || fallback;
  const palette = {
    paper: read("--bg", "#FAF8F2"), ink: read("--text", "#1A1A1A"), gray: read("--text-secondary", "#6B6B6B"),
    fill: read("--control-fill", "#E4E2DC"), divider: read("--divider", "rgba(0,0,0,.08)"),
  };
  for (const layer of map.getStyle().layers ?? []) {
    if (layer.id.startsWith("fleet-")) continue;
    const paint = (name: string, value: unknown) => map.setPaintProperty(layer.id, name, value);
    if (layer.type === "background") paint("background-color", palette.paper);
    else if (layer.type === "fill") {
      paint("fill-color", /water|building/.test(layer.id) ? palette.fill : palette.paper);
      if (layer.paint?.["fill-outline-color"] !== undefined) paint("fill-outline-color", palette.divider);
    } else if (layer.type === "line") {
      const road = /road|bridge|tunnel|aeroway/.test(layer.id);
      paint("line-color", /casing|outline/.test(layer.id) ? palette.divider : road && !/rail/.test(layer.id) ? palette.fill : palette.gray);
    } else if (layer.type === "symbol") {
      if (layer.layout?.["text-field"] !== undefined) {
        paint("text-color", /place|settlement/.test(layer.id) ? palette.ink : palette.gray);
        paint("text-halo-color", palette.paper);
        paint("text-halo-width", 1.5);
      }
      // Colored sprite shields and place icons do not belong to the Vlak palette.
      // Keep their text labels; fleet markers use the library's own icon family.
      if (layer.layout?.["icon-image"] !== undefined) paint("icon-opacity", 0);
    } else if (layer.type === "circle") {
      paint("circle-color", palette.gray); paint("circle-stroke-color", palette.paper);
    } else if (layer.type === "fill-extrusion") paint("fill-extrusion-color", palette.fill);
    else if (layer.type === "hillshade") {
      paint("hillshade-shadow-color", palette.gray); paint("hillshade-highlight-color", palette.paper); paint("hillshade-accent-color", palette.fill);
    }
  }
  return palette;
}
type MapboxSDK = { Map: new (options: Record<string, unknown>) => MapInstance };
declare global { interface Window { mapboxgl?: MapboxSDK } }
let loading: Promise<MapboxSDK> | undefined;
export function loadMapbox(): Promise<MapboxSDK> {
  if (window.mapboxgl) return Promise.resolve(window.mapboxgl);
  if (loading) return loading;
  const version = "v3.30.0";
  if (!document.querySelector('[data-fleet-mapbox="css"]')) {
    const link = document.createElement("link"); link.rel = "stylesheet";
    link.href = `https://api.mapbox.com/mapbox-gl-js/${version}/mapbox-gl.css`;
    link.dataset.fleetMapbox = "css"; document.head.append(link);
  }
  loading = new Promise<MapboxSDK>((resolve, reject) => {
    const script = document.createElement("script"); script.async = true;
    script.src = `https://api.mapbox.com/mapbox-gl-js/${version}/mapbox-gl.js`;
    const timeout = window.setTimeout(() => { script.remove(); reject(new Error("Map viewer timed out")); }, 15000);
    script.onload = () => { window.clearTimeout(timeout); if (window.mapboxgl) resolve(window.mapboxgl); else reject(new Error("Map viewer unavailable")); };
    script.onerror = () => { window.clearTimeout(timeout); script.remove(); reject(new Error("Map viewer unavailable")); };
    document.head.append(script);
  }).catch(error => { loading = undefined; throw error; });
  return loading;
}
