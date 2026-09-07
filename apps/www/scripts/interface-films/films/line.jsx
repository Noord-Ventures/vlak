import { Board } from "../../../app/interfaces/line/board";

const cue = (id, selector, start, from = {}, extra = {}) => ({ id, selector, start, from, sound: "tick", volume: 0.13, ...extra });
const details = (start) => [cue("detail-header", ".ac-detail-head", start, { y: -15 }), cue("detail-question", ".ac-detail-card", start + 0.2, { y: 20 }, { index: 0 }), cue("detail-response", ".ac-detail-card", start + 0.4, { y: 20 }, { index: 1 })];
export default {
  slug: "line", title: "AI chat", Component: Board, rootSelector: ".ac", width: 1180, height: 772, duration: 40,
  hero: { selector: '.ac-message[data-role="assistant"]', scale: 1.8 },
  shots: [{ start: 9.8, end: 12.7, selector: ".ac-details", scale: 1.35 }, { start: 20, end: 23.05, selector: ".ac-composer", scale: 1.8 }, { start: 24, end: 26.5, selector: ".ac-messages", scale: 1.5 }],
  intro: [
    cue("response", '.ac-message[data-role="assistant"]', 0.15, {}, { surface: true, sound: null }),
    cue("response-author", '.ac-message[data-role="assistant"] .ac-author', 0.5, { y: -20 }),
    cue("response-copy", '.ac-message[data-role="assistant"] .ac-prose', 0.8, { y: 20 }),
    cue("response-actions", ".ac-response-actions", 1.1, { y: 20 }),
    cue("header", ".ac-header", 3.2, {}, { surface: true, sound: null }),
    cue("project", ".ac-project", 3.35, { x: -25 }), cue("new", ".ac-new", 3.55, { y: 20 }),
    cue("search", ".ac-search", 3.7, { x: -25 }), cue("list-heading", ".ac-list-head", 3.9, { x: -20 }),
    ...[0, 1, 2].map(index => cue(`conversation-${index}`, ".ac-conversation", 4.1 + index * 0.2, { x: -30 }, { index })),
    cue("conversation-title", ".ac-chat-head", 4.3, { y: -20 }), cue("question", '.ac-message[data-role="you"]', 4.7, { y: 20 }),
    cue("composer", ".ac-composer", 5.7, {}, { surface: true, sound: null }), cue("input", '.ac-composer textarea', 5.9, { y: 20 }), cue("format", ".ac-format", 6.1, { x: -20 }), cue("send", ".ac-send", 6.3, { scale: 0.7 }),
  ],
  actions: [
    { id: "inspect", time: 9.6, kind: "click", selector: ".ac-inspect", assert: { selector: ".ac-detail-head h2", text: "Response details" } },
    { id: "back", time: 13.2, kind: "click", selector: 'button[aria-label="Back to conversation"]', assert: { selector: ".ac-chat" } },
    { id: "new-chat", time: 16.2, kind: "click", selector: ".ac-new", assert: { selector: ".ac-empty h3", text: "What are you working through?" } },
    { id: "write", time: 20.2, end: 21.8, kind: "type", selector: '.ac-composer textarea[aria-label="Message"]', value: "Prepare a research handoff with open questions.", sound: "tick", volume: 0.08 },
    { id: "send", time: 23.2, kind: "click", selector: ".ac-send", assert: { selector: '.ac-message[data-role="you"] .ac-prose', text: "Prepare a research handoff with open questions." } },
    { id: "new-detail", time: 27, kind: "click", selector: ".ac-inspect", assert: { selector: ".ac-detail-scroll", text: "Local writing template" } },
    { id: "save", time: 29, kind: "click", selector: ".ac-detail-actions button", index: 0, assert: { selector: '.ac-detail-actions button[aria-pressed="true"]' } },
    { id: "return", time: 30.5, kind: "click", selector: 'button[aria-label="Back to conversation"]', assert: { selector: '.ac-save[aria-pressed="true"]' } },
  ],
  rebuilds: [{ after: "inspect", cues: details(9.65) }, { after: "new-chat", cues: [cue("empty", ".ac-empty", 16.4, { y: 20 })] }, { after: "send", cues: [cue("sent-question", '.ac-message[data-role="you"]', 23.3, { y: 20 }), cue("template", '.ac-message[data-role="assistant"]', 23.6, { y: 20 })] }, { after: "new-detail", cues: details(27.05) }],
  inspect(root) { return { title: root.querySelector(".ac-chat-head h2")?.textContent.trim(), messages: [...root.querySelectorAll(".ac-message > .ac-prose")].map(element => element.textContent.trim()), source: "Local sample and template responses", saved: root.querySelectorAll('.ac-save[aria-pressed="true"]').length }; },
};
