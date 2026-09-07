import { Board } from "../../../app/interfaces/evening/board";

const cue = (id, selector, start, from = {}, index, sound = "tick") => ({ id, selector, start, from, index, sound, volume: sound ? 0.14 : 0 });
export default {
  slug: "evening", title: "Food ordering", Component: Board, rootSelector: ".fo", width: 1180, height: 772, duration: 40,
  async ready(root) { await Promise.all([...root.querySelectorAll("img")].map(image => { image.loading = "eager"; return image.decode(); })); },
  hero: { selector: ".fo-kitchen", index: 0, scale: 1.1 },
  intro: [
    { ...cue("kitchen-surface", ".fo-kitchen", 0.15, { scale: 0.86, rotate: -2 }, 0, "press"), surface: true },
    cue("kitchen-photo", ".fo-kitchen-open > img", 0.42, { y: 25, scale: 0.95 }, 0, "release"),
    cue("kitchen-name", ".fo-kitchen-title", 0.68, { x: -22 }, 0),
    cue("kitchen-dish", ".fo-kitchen-dish", 0.92, { y: 15 }, 0),
    cue("kitchen-location", ".fo-kitchen-meta", 1.13, { y: 15 }, 0),
    { ...cue("header", ".fo-header", 3.2, {}, undefined, null), surface: true },
    cue("address", ".fo-context", 3.48, { y: -20 }),
    cue("search", ".fo-search", 3.68, { y: -25, scale: 0.94 }, undefined, "release"),
    cue("bag-button", ".fo-bag-button", 3.91, { x: 28, scale: 0.88 }, undefined, "release"),
    cue("filters", ".fo-filter-fields", 4.2, { y: 24, scale: 0.94 }, undefined, "release"),
    cue("bag-context", ".fo-empty-bag", 4.5, { x: 28 }),
    ...[1, 2, 3].map((index) => cue(`kitchen-${index}`, ".fo-kitchen", 5 + index * 0.3, { y: 20 }, index, index === 1 ? "release" : null)),
  ],
  shots: [{ start: 9, end: 11.3, selector: ".fo-search", scale: 1.6 }, { start: 15.1, end: 19.3, selector: ".fo-side", scale: 2.1 }, { start: 24.1, end: 28, selector: ".fo-side", scale: 2.1 }],
  actions: [
    { id: "find-kitchen", time: 9.3, end: 10.8, kind: "type", selector: 'input[aria-label="Search kitchens"]', value: "Joe's Kitchen", sound: "tick", volume: 0.08 },
    { id: "open-menu", time: 12, kind: "click", selector: ".fo-kitchen-open", index: 0, sound: "press", assert: { selector: ".fo-menu", text: "Grilled chicken filet large" } },
    { id: "inspect-plate", time: 15, kind: "click", selector: ".fo-item-open", index: 0, sound: "press", assert: { selector: ".fo-dish", text: "Grilled chicken filet large" } },
    { id: "add-chicken", time: 18, kind: "click", selector: ".fo-side-actions > button", sound: "press", assert: { selector: ".fo-total", text: "€17.40" } },
    { id: "close-bag", time: 21, kind: "click", selector: ".fo-back", sound: "press" },
    { id: "add-wings", time: 24, kind: "click", selector: '.fo-quick-add[aria-label="Add BBQ chicken wings with fries to bag"]', sound: "press", assert: { selector: ".fo-total", text: "€31.40" } },
  ],
  rebuilds: [
    { after: "open-menu", cues: [cue("menu-header", ".fo-page-header", 12.05, { y: -20 }), cue("menu-photo", ".fo-menu-photo", 12.2, { y: 28, scale: 0.98 }, undefined, "release"), ...[0, 1, 2].map(index => cue(`menu-item-${index}`, ".fo-menu-item", 12.68 + index * 0.2, { x: -28, y: 12 }, index, "release"))] },
    { after: "inspect-plate", cues: [cue("plate", ".fo-dish", 15.1, { x: 24 }, undefined, "release"), cue("plate-add", ".fo-side-actions", 15.77, { y: 24, scale: 0.9 }, undefined, "release")] },
    { after: "add-chicken", cues: [cue("first-bag", ".fo-bag-lines", 18.05, { x: 20 }, undefined, "release"), cue("first-total", ".fo-totals", 18.4, { y: 20 })] },
    { after: "add-wings", cues: [cue("complete-bag", ".fo-bag-lines", 24.05, { x: 20 }, undefined, "release"), cue("complete-total", ".fo-totals", 24.4, { y: 20 })] },
  ],
  inspect(root) { return { page: root.dataset.page, view: root.dataset.view, bag: [...root.querySelectorAll(".fo-bag-line h3")].map(element => element.textContent), total: root.querySelector(".fo-total > strong:last-child")?.textContent, sampleDeliveryIncluded: true, localOnly: true }; },
};
