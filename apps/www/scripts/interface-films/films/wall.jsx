import { Board } from "../../../app/interfaces/wall/board";

const cue = (id, selector, start, from = {}, index, sound = "tick") => ({ id, selector, start, from, index, sound, volume: sound ? 0.13 : 0 });
const hero = '.sf-post[data-post="m2"]';
export default {
  slug: "wall", title: "Social feed", Component: Board, rootSelector: ".sf", width: 1180, height: 772, duration: 40,
  async ready(root) { await Promise.all([...root.querySelectorAll("img")].map(image => { image.loading = "eager"; return image.decode(); })); },
  hero: { selector: hero, scale: 2.1 },
  shots: [{ start: 12.85, end: 15, selector: ".sf-original", scale: 2.75 }, { start: 15.25, end: 19.8, selector: ".sf-comment-dock", scale: 3.2 }, { start: 25.75, end: 29, selector: ".sf-profile", scale: 2.5 }],
  intro: [
    { ...cue("hero-card", hero, 0.15, {}, undefined, "press"), surface: true },
    cue("hero-avatar", `${hero} .if-face`, 0.4, { scale: 0.4, rotate: -18 }, undefined, "release"),
    cue("hero-author", `${hero} .sf-author strong`, 0.58, { x: 22 }),
    cue("hero-time", `${hero} .sf-author > span > span`, 0.72, { y: -18 }),
    cue("hero-post", `${hero} .sf-post-copy`, 0.88, { y: 28 }, undefined, "release"),
    cue("hero-like", `${hero} .sf-post-actions > button`, 1.13, { y: 18, scale: 0.6 }, 0, "release"),
    cue("hero-comments", `${hero} .sf-post-actions > button`, 1.33, { y: 18, scale: 0.6 }, 1, "release"),
    { ...cue("header", ".sf-header", 3.2, {}, undefined, null), surface: true },
    cue("studio", ".sf-context", 3.3, { x: -25 }),
    cue("compose", ".sf-create", 3.6, { y: -20 }, undefined, "release"),
    cue("feed-title", ".sf-main-header", 3.9, { y: -22 }),
    cue("filters", ".sf-filters", 4.2, { y: -20 }),
    cue("context-title", ".sf-context-scroll > h2", 4.5, { x: 25 }),
    ...Array.from({ length: 4 }, (_, index) => cue(`person-${index}`, ".sf-context-scroll .sf-person", 4.7 + index * 0.2, { x: 25 }, index, "release")),
    ...["m1", "m3", "m4", "m5", "m6", "m7"].map((id, index) => cue(`post-${id}`, `.sf-post[data-post="${id}"]`, 4.8 + index * 0.25, { y: 20 }, undefined, null)),
  ],
  actions: [
    { id: "like-post", time: 9.6, kind: "click", selector: `${hero} .sf-post-actions > button`, index: 0, sound: "press", assert: { selector: `${hero} button[aria-pressed="true"]`, text: "9" } },
    { id: "open-comments", time: 12.6, kind: "click", selector: `${hero} .sf-post-actions > button`, index: 1, sound: "press", assert: { selector: ".sf-original", text: "Taking the posters outside this afternoon" } },
    { id: "write-comment", time: 15.4, end: 17, kind: "type", selector: 'input[aria-label="Add a comment"]', value: "I will bring the smaller version for comparison.", sound: "tick", volume: 0.08 },
    { id: "post-comment", time: 18.5, kind: "click", selector: '.sf-comment-dock button[aria-label="Post comment"]', sound: "press", assert: { selector: ".sf-comment:last-child", text: "I will bring the smaller version for comparison." } },
    { id: "close-comments", time: 22.1, kind: "click", selector: ".sf-back", label: "Back", sound: "press", assert: { selector: '.sf[data-detail="none"]' } },
    { id: "visit-profile", time: 25.5, kind: "click", selector: ".sf-context-scroll .sf-person", index: 0, sound: "press", assert: { selector: ".sf-profile h3", text: "Mara" } },
    { id: "return-to-feed", time: 29.5, kind: "click", selector: ".sf-back", label: "Back", sound: "press", assert: { selector: '.sf[data-detail="none"]' } },
  ],
  rebuilds: [
    { after: "open-comments", cues: [cue("comments-title", ".sf-detail-header", 12.65, { x: 20 }), cue("original", ".sf-original", 12.85, { x: 20 }), cue("comments", ".sf-comments", 13.15, { y: 20 }), cue("comment-dock", ".sf-comment-dock", 13.8, { y: 20 }, undefined, "release")] },
    { after: "post-comment", cues: [cue("new-comment", ".sf-comment:last-child", 18.55, { y: 20 }, undefined, "release")] },
    { after: "visit-profile", cues: [cue("profile", ".sf-profile", 25.6, { x: 20 }, undefined, "release")] },
  ],
  inspect(root) { return { detail: root.dataset.detail, likes: [...root.querySelectorAll('.sf-post-actions button[aria-pressed="true"]')].map(element => element.textContent.trim()), comments: [...root.querySelectorAll(".sf-comment p")].map(element => element.textContent), commentCount: root.querySelector(`${hero} .sf-post-actions > button:last-child`)?.textContent.trim(), localOnly: true }; },
};
