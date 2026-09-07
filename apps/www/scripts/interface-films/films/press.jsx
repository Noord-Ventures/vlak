import { Board } from "../../../app/interfaces/press/board";

const cue = (id, selector, start, from = {}, extra = {}) => ({ id, selector, start, from, sound: "tick", volume: 0.13, ...extra });
const metrics = start => [
  ...Array.from({ length: 3 }, (_, index) => cue(`metric-${index}`, ".pd-metric > strong", start + index * .12, { y: 20 }, { index, sound: "release" })),
  cue("chart", ".pd-chart", start + .3, { y: 16 }),
];
const detail = start => [
  cue("record-pane", ".pd-detail", start, {}, { surface: true, sound: null }),
  cue("record-back", ".pd-detail-head", start + .08, { y: -12 }),
  cue("record-title", ".pd-detail-scroll > h2", start + .18, { y: 20 }),
  cue("record-copy", ".pd-detail-lead", start + .28, { y: 16 }),
  cue("record-note", ".pd-detail-scroll > .rs-field", start + .42, { y: 18 }),
  cue("record-review", ".pd-detail-action", start + .6, { y: 16 }, { sound: "release" }),
];
export default {
  slug: "press", title: "Dashboard", Component: Board, rootSelector: ".pd", width: 1180, height: 772, duration: 40,
  hero: { selector: ".pd-metric", index: 0, scale: 2.5 },
  intro: [
    cue("hero", ".pd-metric", .15, { scale: .8 }, { index: 0, surface: true, sound: "press", volume: .24 }),
    cue("hero-label", ".pd-metric:first-child > p", .46, { x: -24 }),
    cue("hero-number", ".pd-metric:first-child > strong", .9, { y: 30, scale: .6 }, { sound: "release" }),
    cue("header", ".pd-header", 3.2, {}, { surface: true, sound: null }),
    cue("brand", ".pd-brand", 3.35, { x: -30 }),
    cue("rail", ".pd-rail", 3.4, {}, { surface: true, sound: null }),
    ...Array.from({ length: 3 }, (_, index) => cue(`navigation-${index}`, ".pd-nav-item", 3.5 + index * .16, { x: -30 }, { index })),
    cue("view", ".pd-view-head", 3.8, { y: -18 }),
    cue("period", ".pd-period", 4, { x: 20 }),
    ...Array.from({ length: 2 }, (_, index) => cue(`metric-card-${index + 1}`, ".pd-metric", 4.15 + index * .2, { y: 20 }, { index: index + 1 })),
    cue("chart-panel", ".pd-chart-panel", 4.5, {}, { surface: true, sound: null }),
    cue("chart", ".pd-chart", 4.7, { y: 24 }, { sound: "release" }),
    ...Array.from({ length: 2 }, (_, index) => cue(`job-${index}`, ".pd-job", 5.1 + index * .2, { x: 32 }, { index })),
    cue("footer", ".pd-footer", 5.6, {}, { surface: true, sound: null }),
  ],
  actions: [
    { id: "month", time: 9.6, kind: "click", selector: ".pd-range button", label: "Month", sound: "press", assert: { selector: ".pd-metric:first-child strong", text: "214" } },
    { id: "proof", time: 13.1, kind: "click", selector: ".pd-job", index: 1, sound: "press", assert: { selector: ".pd-detail h2", text: "Exhibition guide" } },
    { id: "review", time: 16.8, kind: "click", selector: ".pd-detail-action button", label: "Mark reviewed", sound: "success", assert: { selector: ".pd-detail-action", text: "Reviewed locally" } },
    { id: "back", time: 19, kind: "click", selector: 'button[aria-label="Back to work"]', sound: "press", assert: { selector: '.pd[data-detail="false"] .pd-main' } },
    { id: "invoices", time: 21, kind: "click", selector: ".pd-nav-item", index: 2, sound: "press", assert: { selector: ".pd-view-head h2", text: "Invoices" } },
    { id: "invoice", time: 24, kind: "click", selector: ".pd-invoice", index: 1, sound: "press", assert: { selector: ".pd-detail h2", text: "September invoice" } },
    { id: "linked-job", time: 27.6, kind: "click", selector: ".pd-detail-scroll > button", label: "Open linked job", sound: "page", assert: { selector: ".pd-detail h2", text: "Exhibition guide" } },
    { id: "overview", time: 31, kind: "click", selector: ".pd-nav-item", index: 0, sound: "press", assert: { selector: ".pd-view-head h2", text: "Overview" } },
    { id: "week", time: 34.2, kind: "click", selector: ".pd-range button", label: "Week", sound: "press", assert: { selector: ".pd-metric:first-child strong", text: "115" } },
  ],
  rebuilds: [
    { after: "month", cues: metrics(9.65) }, { after: "proof", cues: detail(13.15) },
    { after: "review", cues: [cue("review-saved", ".pd-detail-action", 16.85, { scale: .95 }, { sound: "release" })] },
    { after: "invoices", cues: [cue("balance", ".pd-balance", 21.05, { y: 20 }), ...Array.from({ length: 3 }, (_, index) => cue(`invoice-${index}`, ".pd-invoice", 21.2 + index * .15, { x: 25 }, { index }))] },
    { after: "invoice", cues: detail(24.05) }, { after: "linked-job", cues: detail(27.65) }, { after: "week", cues: metrics(34.25) },
  ],
  shots: [{ start: 13.7, end: 16.2, selector: ".pd-detail", scale: 2.3 }, { start: 24.5, end: 27, selector: ".pd-detail", scale: 2.3 }],
  inspect(root) { return { page: root.dataset.page, range: root.querySelector('.pd-range [aria-pressed="true"]')?.textContent.trim(), metrics: [...root.querySelectorAll('.pd-metric > strong')].map(el => el.textContent), jobs: root.querySelectorAll('.pd-job').length, detail: root.querySelector('.pd-detail h2')?.textContent ?? null, reviewedRows: [...root.querySelectorAll('.pd-job')].filter(el => el.textContent.includes('Reviewed')).length }; },
};
