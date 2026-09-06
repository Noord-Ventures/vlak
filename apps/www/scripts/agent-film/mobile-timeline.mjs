import { motionCues } from "./timeline.mjs";
import { agentMobileFilmEvents } from "./controller.mjs";

export const mobileDetailOpenTime = agentMobileFilmEvents.find(
	(event) => event.id === "mobile-select-task-013",
).time;

// Reuse the native parts' motion, with the queue and detail assembled as the
// separate screens that the compact AgentsBoard actually presents.
export const mobileMotionCues = motionCues
	.filter(
		(cue) =>
			!/^summary-|^workspace-(mark|icon)$|^footer$/.test(cue.id) &&
			!cue.selector.includes(".am-detail-id") &&
			!cue.selector.includes(".am-agent-scope") &&
			!cue.selector.includes(".am-progress-label"),
	)
	.map((cue) => {
		if (cue.id === "queue-tabs-frame")
			return { ...cue, selector: ".am-mobile-nav" };
		if (cue.id.startsWith("queue-tab-"))
			return { ...cue, selector: ".am-mobile-nav button" };
		if (cue.phase === "intro" && cue.id.startsWith("intro-"))
			return {
				...cue,
				phase: "mobile-detail",
				start: mobileDetailOpenTime + (cue.start - 4.65) * 0.14,
			};
		return cue;
	});
