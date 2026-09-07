import { TransitBoard } from "../../../app/interfaces/concepts/transit";
const cue = (id, selector, start, from = {}, extra = {}) => ({ id, selector, start, from, sound: "tick", volume: 0.13, ...extra });
export default {
  slug: "platforms", title: "Transit app", Component: TransitBoard, rootSelector: ".tr", width: 1180, height: 772, duration: 40,
  hero: { selector: ".tr-trip", index: 0, scale: 2.2 },
  shots: [{ start: 9.8, end: 13.8, selector: ".tr-journey-times", scale: 1.8 }, { start: 15.8, end: 19.8, selector: ".tr-day-scroll", scale: 1.6 }, { start: 23.4, end: 27.8, selector: ".tr-profile-form", scale: 1.8 }],
  intro: [cue("first-route", ".tr-trip", 0.15, {}, { index: 0, surface: true, sound: null }), cue("first-time", ".tr-trip-times", 0.5, { y: 20 }, { index: 0 }), cue("first-detail", ".tr-trip-sub", 0.8, { y: 20 }, { index: 0 }), cue("header", ".tr-header", 3.2, {}, { surface: true, sound: null }), cue("brand", ".tr-brand", 3.4, { x: -20 }), cue("sidebar", ".tr-sidebar", 3.8, { x: -20 }), cue("heading", ".tr-view-head", 4.2, { y: -20 }), cue("stations", ".tr-station-fields", 4.5, { y: 20 }), cue("date", ".tr-time-fields", 4.8, { y: 20 }), cue("results", ".tr-results > header", 5.1, { y: 20 }), ...[1, 2].map(index => cue(`route-${index}`, ".tr-trip", 5.2 + index * 0.3, { y: 20 }, { index }))],
  actions: [
    { id: "open-route", time: 9.6, kind: "click", selector: ".tr-trip", index: 0, assert: { selector: ".tr-journey-heading h2", text: "Rotterdam Centraal" } },
    { id: "save", time: 12, kind: "click", selector: ".tr-save", assert: { selector: '.tr-save[aria-pressed="true"]' } },
    { id: "today", time: 15, kind: "click", selector: ".tr-detail-actions button", index: 1, assert: { selector: ".tr-day-summary", text: "1 saved journey" } },
    { id: "profile", time: 22, kind: "click", selector: ".tr-desktop-nav button", index: 2, assert: { selector: ".tr-view-head h2", text: "Your profile" } },
    { id: "name", time: 24.2, end: 25.4, kind: "type", selector: ".tr-profile-form input", value: "Noor", volume: 0.08 },
    { id: "save-profile", time: 26, kind: "click", selector: ".tr-profile-form button", assert: { selector: ".tr-profile-person", text: "Noor" } },
    { id: "plan", time: 30, kind: "click", selector: ".tr-desktop-nav button", index: 0, assert: { selector: ".tr-view-head h2", text: "Where to next?" } },
  ],
  rebuilds: [{ after: "open-route", cues: [cue("route-heading", ".tr-journey-heading", 9.7, { y: -20 }), cue("route-time", ".tr-journey-times", 9.9, { y: 20 }), cue("stops", ".tr-stops", 10.2, { y: 20 })] }, { after: "today", cues: [cue("travel-day", ".tr-today", 15.1, { y: 20 })] }, { after: "profile", cues: [cue("profile-name", ".tr-profile-person", 22.1, { y: 20 }), cue("profile-form", ".tr-profile-form", 22.3, { y: 20 })] }],
  inspect(root) { return { view: root.dataset.view, saved: root.querySelector(".tr-side-foot")?.textContent.trim(), traveler: root.querySelector(".tr-traveler strong")?.textContent.trim(), timetable: "Illustrative sample only" }; },
};
