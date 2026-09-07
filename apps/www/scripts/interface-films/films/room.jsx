import { Board } from "../../../app/interfaces/room/board";

const cue = (id, selector, start, from = {}, extra = {}) => ({ id, selector, start, from, sound: "tick", volume: 0.13, ...extra });
export default {
  slug: "room", title: "Team chat", Component: Board, rootSelector: ".tc", width: 1180, height: 772, duration: 40,
  hero: { selector: ".tc-message", index: 0, scale: 2.1 },
  shots: [{ start: 9.85, end: 11.7, selector: ".tc-thread-original", scale: 2.1 }, { start: 12, end: 15.75, selector: ".tc-reply-composer", scale: 2.3 }, { start: 24, end: 28.5, selector: ".tc-composer", scale: 1.55 }],
  intro: [
    cue("first-message", ".tc-message", 0.15, {}, { index: 0, surface: true, sound: null }), cue("first-author", ".tc-message-author", 0.4, { x: -20 }, { index: 0 }), cue("first-copy", ".tc-message > p", 0.7, { y: 20 }, { index: 0 }), cue("first-actions", ".tc-message-actions", 1.04, { y: 20 }, { index: 0 }),
    cue("header", ".tc-header", 3.2, {}, { surface: true, sound: null }), cue("workspace", ".tc-workspace", 3.4, { x: -20 }), cue("new-channel", ".tc-create", 3.6, { y: 20 }),
    cue("search", ".tc-search", 3.7, { x: -20 }), cue("list-title", ".tc-list-head", 3.9, { x: -20 }),
    ...[0, 1, 2].map(index => cue(`channel-${index}`, ".tc-channel-row", 4.1 + index * 0.2, { x: -20 }, { index })),
    cue("team", ".tc-team", 4.7, { x: -20 }), cue("channel-head", ".tc-channel-head", 4.3, { y: -20 }), cue("channel-intro", ".tc-channel-intro", 4.5, { y: 20 }),
    ...[1, 2].map(index => cue(`message-${index}`, ".tc-message", 5 + index * 0.25, { y: 20 }, { index })),
    cue("context", ".tc-context", 5.7, { x: 20 }), cue("composer", ".tc-composer", 6.2, {}, { surface: true, sound: null }), cue("message-input", ".tc-composer textarea", 6.4, { y: 20 }), cue("message-send", ".tc-composer button", 6.6, { scale: 0.7 }),
  ],
  actions: [
    { id: "open-thread", time: 9.6, kind: "click", selector: ".tc-open-thread", index: 0, assert: { selector: ".tc-thread-original", text: "The client approved the poster direction." } },
    { id: "write-reply", time: 12.2, end: 14.2, kind: "type", selector: 'textarea[aria-label="Reply in thread"]', value: "I will check both details before the print slot.", volume: 0.08 },
    { id: "send-reply", time: 15.3, kind: "click", selector: '.tc-reply-composer button[aria-label="Send reply"]', assert: { selector: ".tc-reply:last-child", text: "I will check both details before the print slot." } },
    { id: "close-thread", time: 18.6, kind: "click", selector: 'button[aria-label="Back to channel"]', assert: { selector: '.tc[data-thread="false"]' } },
    { id: "production", time: 21.5, kind: "click", selector: '.tc-channel-row[data-channel="production"]', assert: { selector: ".tc-channel-head h2", text: "production" } },
    { id: "write-message", time: 24.2, end: 26.2, kind: "type", selector: '.tc-composer textarea[aria-label="Message channel"]', value: "The smaller type is clear at actual size.", volume: 0.08 },
    { id: "send-message", time: 28.1, kind: "click", selector: ".tc-composer button", assert: { selector: ".tc-message:last-child", text: "The smaller type is clear at actual size." } },
  ],
  rebuilds: [{ after: "open-thread", cues: [cue("thread-head", ".tc-thread-head", 9.7, { y: -20 }), cue("original", ".tc-thread-original", 9.9, { y: 20 }), cue("replies", ".tc-replies", 10.2, { y: 20 }), cue("reply-input", ".tc-reply-composer", 10.6, { y: 20 })] }, { after: "send-reply", cues: [cue("sent-reply", ".tc-reply:last-child", 15.4, { y: 20 })] }, { after: "production", cues: [cue("production-heading", ".tc-channel-head h2", 21.6, { y: 20 }), cue("production-messages", ".tc-message-measure", 21.8, { y: 20 })] }, { after: "send-message", cues: [cue("sent-message", ".tc-message:last-child", 28.2, { y: 20 })] }],
  inspect(root) { return { channel: root.querySelector('.tc-channel-row[aria-current="true"]')?.getAttribute("data-channel"), messages: [...root.querySelectorAll(".tc-message > p")].map(element => element.textContent.trim()), replies: [...root.querySelectorAll(".tc-reply > p")].map(element => element.textContent.trim()), localOnly: true }; },
};
