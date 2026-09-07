import { RoboticsBoard } from "../../../app/interfaces/robotics/board";

const cue = (id, selector, start, from = {}, extra = {}) => ({ id, selector, start, from, sound: "tick", volume: .12, ...extra });
export default {
  slug: "robotics", title: "Robot debugging", Component: RoboticsBoard, rootSelector: ".rb",
  width: 1180, height: 772, duration: 40, theme: "light",
  hero: { selector: ".rs-joint-panel-reading", scale: 3 },
  intro: [
    cue("reported-reading", ".rs-joint-panel-reading", .15, { y: 20, scale: .8 }, { sound: "press", surface: true }),
    cue("joint-title", ".rs-joint-panel-title", .5, { y: -20 }),
    cue("draft-input", ".rs-joint-panel-field", .8, { x: 25 }),
    cue("inspector", ".rb-inspector-head", 2.4, { y: -30 }, { surface: true }),
    cue("header", ".rb-header", 3.2, { y: -25 }, { surface: true }),
    cue("articulated-scene", ".rb-stage", 3.5, { scale: .93 }, { surface: true, sound: "release" }),
    cue("camera-controls", ".rb-scene-tools", 4.2, { y: 20 }),
    cue("joint-records", ".rb-joint-list", 4.6, { y: 24 }),
    cue("tool-record", ".rb-mechanism", 5, { x: -20 }),
    cue("sample-clock", ".rb-trace", 5.4, { y: 15 }),
  ],
  shots: [{ start: 8, end: 13, selector: ".rb-stage", scale: 1.5 }, { start: 15, end: 22, selector: ".rb-inspector", scale: 1.45 }, { start: 23, end: 29, selector: ".rb-stage", scale: 1.45 }, { start: 31, end: 37, selector: ".rb-inspector", scale: 1.3 }],
  actions: [
    { id: "hold-pose", time: 10, kind: "click", selector: ".rb-header button", label: "Pause", sound: "toggle", assert: { selector: '.rb[data-running="false"]' } },
    { id: "select-elbow", time: 14, kind: "click", selector: ".rb-joint-row", label: "Elbow", sound: "page", assert: { selector: ".rb-inspector-head h2", text: "Elbow joint" } },
    { id: "edit-target", time: 16, kind: "type", selector: 'input[aria-label="Elbow draft target (deg)"]', value: "-25", sound: "tick" },
    { id: "request-target", time: 19, kind: "click", selector: ".rs-joint-panel button", label: "Request targets", sound: "press", assert: { selector: ".rb-confirm", text: "Apply to simulation?" } },
    { id: "confirm-target", time: 22, kind: "click", selector: ".rb-confirm button", label: "Confirm simulation", sound: "success", assert: { selector: ".rs-joint-panel-reading", text: "Reported: -25 deg" } },
    { id: "close-gripper", time: 26, kind: "click", selector: 'button[aria-label="Close gripper"]', sound: "toggle", assert: { selector: 'button[aria-label="Open gripper"][data-closed="true"]' } },
    { id: "debug-view", time: 30, kind: "click", selector: ".rb-desktop-tabs button", label: "Debug", sound: "page" },
    { id: "camera-diagnostic", time: 32, kind: "click", selector: ".rb-inspector-scroll button", label: "Alarms", sound: "page" },
    { id: "restore-camera", time: 35, kind: "click", selector: ".rb-inspector-scroll > button", label: "Restore sample camera", sound: "success", assert: { selector: '.rb-scene-camera[data-available="true"]' } },
  ],
  rebuilds: [],
  async ready(root) {
    const deadline = performance.now() + 10000;
    while (root.querySelector(".rb-scene")?.dataset.status === "loading" && performance.now() < deadline) await new Promise(resolve => setTimeout(resolve, 30));
    if (!root.querySelector('.rb-scene[data-status="ready"] canvas')) throw new Error("Articulated Three scene is unavailable");
  },
  inspect(root) {
    const canvas = root.querySelector(".rb-scene canvas");
    return { renderer: canvas?.dataset.renderer, shoulder: canvas?.dataset.shoulder, elbow: canvas?.dataset.elbow, wrist: canvas?.dataset.wrist, tool: canvas?.dataset.tip, draft: canvas?.dataset.draft, camera: canvas?.dataset.camera, gripperAperture: canvas?.dataset.aperture, localSimulation: true };
  },
};
