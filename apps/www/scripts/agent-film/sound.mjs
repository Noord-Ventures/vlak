// Film-only Cuelume effects. Native UI actions stay in the demo controller;
// component contacts and their cue choices share the visual motion timeline.
import { pathToFileURL } from "node:url";
import { agentFilmEvents } from "./controller.mjs";
import { filmDuration, firstContact, motionCues } from "./timeline.mjs";
import { cuelumeVersion, writeCuelumeScore } from "./cuelume-offline.mjs";

export { firstContact };
export const soundSource = Object.freeze({
	name: "Cuelume",
	version: cuelumeVersion,
	url: "https://cuelume.dev/",
	license: "MIT",
	copyright: "Copyright (c) 2026 Daniel Belyi",
	synthesis: "Unmodified official WebAudio engine in Chrome OfflineAudioContext",
	deterministicNoise: true,
	provenance: "apps/www/scripts/agent-film/vendor/cuelume/provenance.json",
});

const cue = (time, component, sound, volume, metadata = {}) => ({
	time: Math.round(time * 1e6) / 1e6,
	component,
	sound,
	volume,
	gain: volume,
	...metadata,
});

// All geometry first contacts come from the same starts used by film.jsx.
export const landingCues = motionCues
	.filter((motion) => motion.cue && motion.gain > 0)
	.map((motion) => cue(motion.start + firstContact, motion.id, motion.cue, motion.gain, {
		kind: "landing",
		phase: motion.phase,
		selector: motion.selector,
		index: motion.index,
		start: motion.start,
	}))
	.sort((a, b) => a.time - b.time);

const actionSounds = {
	"show-output": ["toggle", 0.34],
	// The accepted-check landing supplies success, once the check locks in.
	"approve-review": ["release", 0.3],
	"select-task-014": ["page", 0.3],
	"pause-task": ["toggle", 0.34],
	"resume-task": ["loading", 0.3],
	"new-task": ["bloom", 0.28],
	"queue-task": ["success", 0.32],
	"start-task": ["loading", 0.35],
};

export const actionCues = agentFilmEvents
	.filter((event) => event.kind === "click")
	.map((event) => {
		const [sound, volume] = actionSounds[event.id] ?? ["release", 0.3];
		return cue(event.time, event.label, sound, volume, { kind: "action", id: event.id });
	});

// Sparse cues are real character insertions, including each field's final one.
let lastTypingCue = -Infinity;
export const typingCues = agentFilmEvents
	.filter((event) => event.kind === "input")
	.filter((event) => {
		if (event.time - lastTypingCue < 0.09 && event.index !== event.length - 1)
			return false;
		lastTypingCue = event.time;
		return true;
	})
	.map((event) => cue(event.time, event.label, "tick", 0.095, { kind: "typing", id: event.id }));

export const cuelumeCues = [...landingCues, ...actionCues, ...typingCues]
	.sort((a, b) => a.time - b.time);

// Metadata only. Scene transitions use the Cuelume cues in the shared timeline,
// rather than adding an independent synthetic impact or whoosh at these beats.
export const scoreCuts = [0, ...actionCues
	.filter((event) => ["show-output", "select-task-014", "new-task"].includes(event.id))
	.map((event) => event.time), filmDuration - 4];

/** Original Cuelume effects and a separate quiet tone bed, 48 kHz stereo WAV. */
export async function writeScore(file, duration = filmDuration) {
	await writeCuelumeScore(file, cuelumeCues, duration);
	return file;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	if (!process.argv[2]) throw new Error("Pass an output WAV path");
	console.log(await writeScore(process.argv[2], process.argv[3] ? Number(process.argv[3]) : filmDuration));
}
