import { DocumentationBoard } from "../../../app/interfaces/documentation/board";

const cue = (id, selector, start, from = {}, extra = {}) => ({ id, selector, start, from, sound: "tick", volume: .12, ...extra });
export default {
  slug: "documentation", title: "Documentation", Component: DocumentationBoard, rootSelector: ".dc", width: 1180, height: 772, duration: 40,
  hero: { selector: ".dc-hero h2", scale: 2.4 },
  intro: [
    cue("title", ".dc-hero h2", .15, { y: 20, scale: .85 }, { sound: "press", volume: .22 }),
    cue("eyebrow", ".dc-eyebrow", .8, { y: -14 }),
    cue("home", ".dc-home", 2.5, { x: -24 }),
    cue("reader-path", ".dc-reader-path", 2.7, { y: -14 }),
    cue("settings", ".dc-header-actions", 2.9, { x: 20 }),
    ...Array.from({ length: 4 }, (_, index) => cue(`category-${index}`, ".dc-navigation > button", 3.1 + index * .18, { x: -20 }, { index })),
    ...Array.from({ length: 3 }, (_, index) => cue(`guide-${index}`, ".dc-guide-list > li", 4 + index * .28, { y: 20 }, { index, sound: "release" })),
    cue("footer", ".dc-footer", 5.3, {}, { surface: true, sound: null }),
  ],
  actions: [
    { id: "read", time: 9, kind: "click", selector: '.dc-guide-list button[data-guide="reading-order"]', sound: "page", assert: { selector: ".dc-hero h2", text: "Start with the reading order" } },
    { id: "show-contents", time: 13.9, kind: "click", selector: '.dc-outline-toggle[aria-label="Keep guide contents open"]', sound: "release", assert: { selector: '.dc-contents[data-pinned="true"]' } },
    { id: "contents", time: 15, kind: "click", selector: ".dc-section-link", label: "Let secondary things wait", sound: "press", assert: { selector: '.dc-navigation [aria-current="location"]', text: "Let secondary things wait" } },
    { id: "settings", time: 19, kind: "click", selector: ".dc-header-actions > button", label: "Reader settings", sound: "press", assert: { selector: ".dc-settings:popover-open" } },
    { id: "larger", time: 22, kind: "click", selector: 'button[aria-label="Increase text size"]', sound: "release", assert: { selector: '.dc-text-size output', text: "110%" } },
    { id: "close-settings", time: 24, kind: "click", selector: ".dc-header-actions > button", label: "Reader settings", sound: "press" },
    { id: "index", time: 27, kind: "click", selector: '.dc-chrome button[aria-label="Back to all guides"]', sound: "page", assert: { selector: ".dc-hero h2", text: "Guides." } },
    { id: "patterns", time: 30, kind: "click", selector: ".dc-navigation > button", label: "Patterns", sound: "press", assert: { selector: ".dc-hero h2", text: "Patterns." } },
    { id: "small-screen", time: 33, kind: "click", selector: '.dc-guide-list button[data-guide="small-screen"]', sound: "page", assert: { selector: ".dc-hero h2", text: "Make a small screen complete" } },
    { id: "next-guide", time: 36, kind: "click", selector: ".dc-more > button", sound: "page", assert: { selector: ".dc-hero h2", text: "Give actions an honest ending" } },
  ],
  rebuilds: [
    { after: "read", cues: [cue("article-title", ".dc-article-hero", 9.08, { y: 14 }), cue("lead", ".dc-lead", 9.3, { y: 18 }), cue("plate", ".dc-plate", 9.6, { y: 20 }), cue("contents", ".dc-rail", 9.8, { x: -18 })] },
    { after: "settings", cues: [cue("reader-settings", ".dc-settings", 19.05, { y: -8, scale: .95 }, { surface: true, sound: "release" })] },
    { after: "patterns", cues: [cue("patterns-list", ".dc-guide-list", 30.05, { y: 18 })] },
  ],
  shots: [{ start: 10, end: 13.8, selector: ".dc-article-hero", scale: 1.4 }, { start: 19.4, end: 23.7, selector: ".dc-settings", scale: 1.8 }],
  inspect(root) { return { view: root.dataset.view, title: root.querySelector('.dc-hero h2')?.textContent, appearance: root.dataset.appearance, outlineHeadings: root.querySelectorAll(".dc-outline-marks > span").length, outlinePinned: root.querySelector(".dc-contents")?.dataset.pinned, textScale: root.style.getPropertyValue('--dc-scale'), scroll: root.querySelector('.dc-scroll')?.scrollTop, localContent: true }; },
};
