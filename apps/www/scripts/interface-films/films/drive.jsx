import { Drive } from "../../../app/interfaces/concepts/drive";

const part = (id, selector, start, from = {}, sound = "tick", volume = 0.15, index) => ({ id, selector, start, from, sound, volume, index });
const intro = [
  { ...part("cabin-field", ".ev-temperature", 0.15, { scale: 0.74, rotate: -2 }, "press", 0.3), surface: true },
  part("cabin-label", ".ev-temperature .rs-number-field-label", 0.42, { x: -35 }),
  part("cabin-value", ".ev-temperature .rs-number-field-input", 0.65, { y: 35, scale: 0.5 }, "release", 0.22),
  part("cabin-unit", ".ev-temperature .rs-number-field-unit", 0.86, { y: -20 }),
  part("climate-up", 'button[aria-label="Raise temperature"]', 1.02, { x: 40, scale: 0.6 }, "release", 0.18),
  part("climate-down", 'button[aria-label="Lower temperature"]', 1.2, { x: 40, scale: 0.6 }, "release", 0.18),
  part("system-name", ".ev-context strong", 2.3, { y: -28 }),
  part("outside-temperature", ".ev-outside", 2.45, { x: -40 }),
  part("connection-status", ".ev-header-status .rs-connection-status", 2.6, { x: 45 }, "release", 0.15),
  { ...part("vehicle-surface", ".ev-visual", 3.5, {}, null, 0), surface: true },
  part("model-name", ".ev-view-header h2", 3.2, { x: -50 }),
  part("model-description", ".ev-view-header .ev-eyebrow", 3.36, { y: 20 }, null, 0),
  part("original-vehicle-art", ".ev-scene canvas", 3.6, { x: -80, scale: 0.94 }, "press", 0.2),
  part("vehicle-ground", ".ev-model-footer", 4.06, {}, null, 0),
  part("lock-action", '.ev-model-footer button[aria-label="Door lock"]', 4.55, { x: 55, scale: 0.85 }, "release", 0.18),
  part("light-action", '.ev-model-footer button[aria-label="Lights"]', 4.73, { x: 55, scale: 0.85 }, "release", 0.18),
  part("climate-caption", ".ev-climate > h3", 5.2, { y: 25 }, null, 0),
  part("climate-context", ".ev-climate > .ev-description", 5.38, { y: 20 }, null, 0),
  part("climate-zones", ".ev-zones", 5.6, { y: 25 }, "release", 0.16),
  part("climate-note", ".ev-control-note", 5.85, { y: 18 }, null, 0),
];
for (let i = 0; i < 3; i++) {
  intro.push(part(`vehicle-mode-${i}`, ".ev-modes button", 2.65 + i * 0.17, { y: -30, scale: 0.8 }, "tick", 0.15, i));
  if (i < 2) intro.push(part(`metric-label-${i}`, ".ev-readings .rs-metric-label", 4.08 + i * 0.28, { x: -28 }, "tick", 0.13, i));
  if (i < 2) intro.push(part(`metric-value-${i}`, ".ev-readings .rs-metric-value", 4.25 + i * 0.28, { y: 38, scale: 0.55 }, "release", 0.22, i));
  if (i < 2) intro.push(part(`metric-unit-${i}`, ".ev-readings .rs-metric-unit", 4.42 + i * 0.28, { y: -20 }, "tick", 0.12, i));
  intro.push(part(`control-panel-${i}`, ".ev-readings > button", 6 + i * 0.2, { y: 20 }, "tick", 0.13, i));
}
const journey = [
  part("journey-route", ".ev-scene canvas", 18.05, { x: -25, scale: 0.92 }, "press", 0.22),
  part("destination-name", ".ev-journey .ev-visual-caption", 18.44, { x: 32 }, "release", 0.19),
  ...[0, 1, 2].map(i => part(`journey-metric-${i}`, ".ev-readings > button", 18.58 + i * 0.14, { y: 30 }, "release", 0.15, i)),
  part("route-state", ".ev-state", 19.02, { x: -30 }, "tick", 0.13),
  part("route-action", ".ev-vehicle-actions > button", 19.2, { x: 45, scale: 0.8 }, "release", 0.19),
];
const energy = [
  part("battery-assembly", ".ev-scene canvas", 25.08, { y: 22, scale: 0.9 }, "press", 0.2),
  part("energy-label", ".ev-energy .ev-visual-caption", 25.35, { x: -35 }, "tick", 0.13),
  part("energy-charge", ".ev-energy figcaption strong", 25.54, { y: 35, scale: 0.6 }, "release", 0.2),
  part("energy-capacity", ".ev-energy-labels", 25.76, { y: 20 }, null, 0),
  part("charge-state", ".ev-state", 26.05, { x: -30 }, "tick", 0.13),
  part("schedule-action", ".ev-vehicle-actions > button", 26.2, { x: 45, scale: 0.8 }, "release", 0.19),
  part("charge-settings", ".ev-charging", 26.5, { x: 35 }, "release", 0.18),
];

export default {
  slug: "drive",
  title: "EV controls",
  Component: Drive,
  rootSelector: ".ev",
  width: 1180,
  height: 772,
  duration: 40,
  theme: "dark",
  hero: { selector: ".ev-temperature", scale: 2.6 },
  intro,
  shots: [
    { start: 8.7, end: 13.2, selector: ".ev-vehicle", scale: 1.35 },
    { start: 14.1, end: 16.5, selector: ".ev-temperature", scale: 2 },
    { start: 17.4, end: 22.8, selector: ".ev-vehicle", scale: 1.35 },
    { start: 24.4, end: 30.4, selector: ".ev-vehicle", scale: 1.35 },
  ],
  actions: [
    { id: "unlock", time: 9.25, kind: "click", selector: '.ev-model-footer button[aria-label="Door lock"]', label: "Door lock", sound: "toggle", assert: { selector: ".ev-model-footer", text: "Doors unlocked" } },
    { id: "lights-on", time: 12, kind: "click", selector: '.ev-model-footer button[aria-label="Lights"]', label: "Lights", sound: "toggle", assert: { selector: '.ev-visual[data-lights="true"]' } },
    { id: "raise-cabin", time: 15, kind: "click", selector: 'button[aria-label="Raise temperature"]', label: "Raise temperature", sound: "release", assert: { selector: '.rs-number-field-input[value="21"]' } },
    { id: "journey-view", time: 18, kind: "click", selector: ".ev-modes button", label: "Journey", sound: "page", assert: { selector: '.ev[data-view="journey"] .ev-state', text: "Utrecht Centraal" } },
    { id: "start-route", time: 21, kind: "click", selector: ".ev-vehicle-actions > button", label: "Start route", sound: "success", assert: { selector: ".ev-state", text: "Route active" } },
    { id: "energy-view", time: 25, kind: "click", selector: ".ev-modes button", label: "Energy", sound: "page", assert: { selector: '.ev[data-view="energy"] .ev-state', text: "Next charge" } },
    { id: "charging-pane", time: 26.4, kind: "click", selector: '.ev-reading[data-panel="charging"]', sound: "page", assert: { selector: '.ev[data-control-panel="charging"]' } },
    { id: "schedule-charge", time: 28.5, kind: "click", selector: ".ev-vehicle-actions > button", label: "Schedule charge", sound: "success", assert: { selector: ".ev-state", text: "Scheduled for 23:00" } },
  ],
  rebuilds: [{ after: "journey-view", cues: journey }, { after: "energy-view", cues: energy }],
  async ready(root) {
    root.querySelector('.ev-reading[data-panel="climate"]')?.click();
    const start = performance.now();
    while (root.querySelector('.ev-scene')?.dataset.rendered !== 'true') {
      if (performance.now() - start > 30000) throw new Error('EV 3D scene did not render');
      await new Promise(resolve => requestAnimationFrame(resolve));
    }
  },
  inspect(root) {
    const board = root.matches(".ev") ? root : root.querySelector(".ev");
    return {
      view: board?.dataset.view,
      lights: root.querySelector(".ev-visual")?.dataset.lights,
      temperature: root.querySelector(".rs-number-field-input")?.value,
      state: root.querySelector(".ev-state")?.textContent.trim(),
      playing: board?.dataset.playing,
      threeRenderer: root.querySelector(".ev-scene")?.dataset.rendered === "true",
      wheelAngle: root.querySelector(".ev-scene")?.dataset.wheelAngle,
      batteryModules: root.querySelector(".ev-scene")?.dataset.modules,
      fictionalVehicleData: true,
      mediaAudioStream: false,
    };
  },
};
