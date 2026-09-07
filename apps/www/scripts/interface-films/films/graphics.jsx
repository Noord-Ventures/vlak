import { WallpaperGenerator } from "../../../app/interfaces/concepts/wallpaper-generator";
const cue = (id, selector, start, from = {}, index) => ({ id, selector, start, from, index, sound: "tick", volume: .14 });
export default {
  slug: "graphics", title: "Wallpaper generator", Component: WallpaperGenerator, rootSelector: ".wg", width: 1180, height: 772, duration: 40,
  hero: { selector: ".wg-stage", scale: 1.05 },
  intro: [
    { ...cue("canvas", ".wg-stage", .15, { scale: .96 }), surface: true },
    cue("art", ".wg-stage svg", .5, { y: 20 }),
    cue("project", ".wg-project", 3.2, { y: -18 }),
    cue("export", ".wg-export", 3.45, { y: -18 }),
    cue("direction", ".wg-panel-head", 3.7, { x: -20 }),
    cue("seed", ".wg-direction-scroll .rs-textarea-field", 4, { y: 20 }),
    cue("format", ".wg-format", 4.3, { y: 20 }),
    cue("variation", ".wg-variation", 4.6, { y: 20 }),
    cue("generate", ".wg-generate", 4.9, { y: 20 }),
    ...[0, 1, 2].map(i => cue(`choice-${i}`, ".wg-compositions > button", 5.2 + i * .15, { y: 20 }, i)),
  ],
  shots: [{ start: 9, end: 12.3, selector: ".wg-direction-scroll textarea", scale: 2.6 }, { start: 12.5, end: 14.5, selector: ".wg-variation", scale: 3 }, { start: 29.6, end: 32, selector: ".wg-stage", scale: 1.35 }],
  actions: [
    { id: "direction", time: 9.4, end: 11.6, kind: "type", selector: ".wg-direction-scroll textarea", value: "An architectural grid, warm paper, and one vermilion signal." },
    { id: "variation", time: 13, kind: "range", selector: ".wg-variation input", value: "67" },
    { id: "generate", time: 16, kind: "click", selector: ".wg-generate button", assert: { selector: ".wg-footer", text: "Three new wallpapers ready." } },
    { id: "open-structure", time: 20, kind: "click", selector: '.wg-compositions button[aria-label="Open structure"]', assert: { selector: ".wg-viewbar", text: "Open structure" } },
    { id: "desktop-format", time: 24, kind: "select", selector: ".wg-format select", value: "desktop", assert: { selector: ".wg-output-size", text: "3840" } },
    { id: "generate-again", time: 27, kind: "click", selector: ".wg-generate button", assert: { selector: ".wg-footer", text: "Three new wallpapers ready." } },
    { id: "signal-study", time: 30, kind: "click", selector: '.wg-compositions button[aria-label="Signal study"]', assert: { selector: ".wg-viewbar", text: "Signal study" } },
  ],
  rebuilds: [],
  inspect(root) { return { direction: root.querySelector("textarea")?.value, variation: root.querySelector('input[type="range"]')?.value, dimensions: root.querySelector(".wg-output-size")?.textContent, selected: root.querySelector(".wg-viewbar strong")?.textContent }; },
};
