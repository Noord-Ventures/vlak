import { Board } from "../../../app/interfaces/night/board";

const cue = (id, selector, start, from = {}, extra = {}) => ({ id, selector, start, from, sound: "tick", volume: .13, ...extra });
const trip = (prefix, start) => [
  cue(`${prefix}-pane`, ".fm-trip", start, {}, { surface: true, sound: null }),
  cue(`${prefix}-back`, ".fm-trip-head", start + .1, { y: -12 }),
  cue(`${prefix}-title`, ".fm-trip-scroll > h2", start + .2, { y: 20 }),
  cue(`${prefix}-copy`, ".fm-trip-copy", start + .3, { x: 20 }),
  cue(`${prefix}-metrics`, ".fm-trip-metrics", start + .4, { y: 20 }),
  ...Array.from({ length: 3 }, (_, index) => cue(`${prefix}-stop-${index}`, ".fm-stops li", start + .5 + index * .15, { x: 20 }, { index })),
  cue(`${prefix}-actions`, ".fm-trip-actions", start + 1, { y: 20 }, { sound: "release" }),
];
export default {
  slug: "night", title: "Fleet management", Component: Board, rootSelector: ".fm", width: 1180, height: 772, duration: 40, theme: "light",
  async ready(root) {
    const map = root.querySelector(".fm-map-view");
    if (map?.dataset.mapStatus !== "loading") return;
    await new Promise((resolve, reject) => {
      const observer = new MutationObserver(() => {
        if (map.dataset.mapStatus === "loading") return;
        clearTimeout(timeout); observer.disconnect(); resolve();
      });
      const timeout = setTimeout(() => { observer.disconnect(); reject(new Error("Fleet map did not settle before recording")); }, 37000);
      observer.observe(map, { attributes: true, attributeFilter: ["data-map-status"] });
    });
  },
  hero: { selector: '.fm-vehicle[aria-pressed="true"]', scale: 2.7 },
  intro: [
    cue("selected-vehicle", '.fm-vehicle[aria-pressed="true"]', .15, { scale: .8 }, { surface: true, sound: "press", volume: .25 }),
    cue("vehicle-name", '.fm-vehicle[aria-pressed="true"] .fm-vehicle-top', .5, { x: -25 }),
    cue("vehicle-place", '.fm-vehicle[aria-pressed="true"] .fm-vehicle-place', .8, { y: 18 }),
    cue("header", ".fm-header", 3.2, {}, { surface: true, sound: null }),
    cue("brand", ".fm-brand", 3.35, { x: -30 }),
    cue("fleet-head", ".fm-fleet-head", 3.5, { y: -20 }),
    cue("fleet-filters", ".fm-filters", 3.65, { y: 18 }),
    ...Array.from({ length: 3 }, (_, index) => cue(`vehicle-${index + 1}`, ".fm-vehicle", 3.9 + index * .2, { x: -30 }, { index: index + 1 })),
    cue("map-head", ".fm-map-head", 4.2, { y: -18 }),
    cue("map", ".fm-map-stage", 4.4, { scale: .98 }, { surface: true, sound: "bloom" }),
    cue("route-context", ".fm-map-key", 4.7, {}, { surface: true, sound: "scan" }),
    ...Array.from({ length: 4 }, (_, index) => cue(`marker-${index}`, ".fm-map-marker", 4.9 + index * .15, { scale: .7 }, { index })),
    cue("summary", ".fm-map-summary", 5.6, { y: 20 }),
    cue("map-tools", ".fm-map-tools", 5.8, { y: 18 }),
  ],
  actions: [
    { id: "hold", time: 9.2, kind: "click", selector: ".fm-vehicle", index: 1, sound: "toggle", assert: { selector: ".fm-map-head h2", text: "Truck 19" } },
    { id: "hold-trip", time: 12.4, kind: "click", selector: ".fm-map-head > button", label: "View trip", sound: "page", assert: { selector: ".fm-trip h2", text: "Illinois → Tennessee" } },
    { id: "note", time: 14.5, end: 16.2, kind: "type", selector: ".fm-trip textarea", value: "Loading bay call recorded locally.", sound: "tick", volume: .08 },
    { id: "save", time: 17, kind: "click", selector: ".fm-trip-actions button", label: "Save note", sound: "success", assert: { selector: ".fm-note-status", text: "Note saved locally" } },
    { id: "back", time: 19.5, kind: "click", selector: 'button[aria-label="Back to map"]', sound: "release", assert: { selector: '.fm[data-screen="map"]' } },
    { id: "moving", time: 22, kind: "click", selector: ".fm-vehicle", index: 3, sound: "toggle", assert: { selector: ".fm-map-head h2", text: "Bicycle 11" } },
    { id: "moving-trip", time: 25, kind: "click", selector: ".fm-map-head > button", label: "View trip", sound: "page", assert: { selector: ".fm-trip h2", text: "Esprit park → 20th street" } },
    { id: "back-moving", time: 28.2, kind: "click", selector: 'button[aria-label="Back to map"]', sound: "release", assert: { selector: '.fm[data-screen="map"]' } },
    { id: "yard", time: 31, kind: "click", selector: ".fm-vehicle", index: 2, sound: "toggle", assert: { selector: ".fm-map-head h2", text: "Car 03" } },
    { id: "zoom", time: 34, kind: "click", selector: '.fm-map-tools button[aria-label="Zoom in"]', sound: "press", assert: { selector: ".rs-canvas-zoom", text: "125%" } },
  ],
  rebuilds: [{ after: "hold-trip", cues: trip("hold", 12.45) }, { after: "save", cues: [cue("saved-note", ".fm-note-status", 17.05, { y: 12 })] }, { after: "moving-trip", cues: trip("moving", 25.05) }],
  shots: [{ start: 12.8, end: 14.3, selector: ".fm-trip", scale: 1.8 }, { start: 25.6, end: 27.8, selector: ".fm-trip", scale: 1.8 }],
  inspect(root) { return { selected: root.dataset.selected, tripOpen: root.dataset.screen === "trip", trip: root.querySelector('.fm-trip h2')?.textContent ?? null, mapStatus: root.querySelector('.fm-map-view')?.dataset.mapStatus ?? null, zoom: root.querySelector('.rs-canvas-zoom')?.textContent, localNotes: root.querySelector('.fm-footer > span:last-child')?.textContent, illustrativePositions: true }; },
};
