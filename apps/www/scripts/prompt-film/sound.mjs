// Original Cuelume effects follow the native prompt and interface timelines.
// The separate film score supplies music; this stem contains no tonal bed.
import { pathToFileURL } from "node:url";
import {
	cuelumeCues as agentCues,
	scoreCuts as agentCuts,
	soundSource as agentSoundSource,
} from "../agent-film/sound.mjs";
import { writeCuelumeScore } from "../agent-film/cuelume-offline.mjs";
import {
	beats,
	duration as filmDuration,
	prompt,
	sourceToStory,
} from "./timeline.mjs";

const fps = 30;
const round = (value) => Math.round(value * 1e6) / 1e6;
const ease = (value) => {
	const p = Math.max(0, Math.min(1, value));
	return p * p * p * (p * (p * 6 - 15) + 10);
};
const cue = (time, component, sound, volume, metadata = {}) => ({
	time: round(time),
	component,
	sound,
	volume,
	gain: volume,
	...metadata,
});

export const soundSource = Object.freeze({
	...agentSoundSource,
	tonalBed: false,
	timing:
		"Native prompt frames and the agent interface source-to-story mapping",
});

const interfaceCues = agentCues.map((event) => ({
	...event,
	time: round(sourceToStory(event.time)),
	sourceTime: event.time,
	...(event.start === undefined
		? {}
		: { start: round(sourceToStory(event.start)), sourceStart: event.start }),
}));

// Match film.jsx's actual rounded character count at each 30fps frame, then
// sparsely choose from those insertions. Every audible tick is a visible edit.
export const typingCues = [];
let previousCount = 0;
let lastTypingCue = -Infinity;
for (let frame = 0; frame <= Math.ceil(beats.typeEnd * fps); frame++) {
	const time = frame / fps;
	const characters = Math.round(
		prompt.length *
			ease((time - beats.typeStart) / (beats.typeEnd - beats.typeStart)),
	);
	if (characters === previousCount) continue;
	previousCount = characters;
	if (time - lastTypingCue < 0.12 && characters !== prompt.length) continue;
	lastTypingCue = time;
	typingCues.push(
		cue(time, "Prompt", "tick", 0.075, {
			kind: "typing",
			id: "type-prompt",
			frame,
			characters,
		}),
	);
}

export const narrativeCues = [
	cue(beats.send, "Send prompt", "release", 0.24, {
		kind: "action",
		id: "send-prompt",
	}),
	cue(4.85, "AI thinking", "loading", 0.1, { kind: "state", id: "thinking" }),
	cue(beats.reply, "AI response", "ready", 0.16, {
		kind: "state",
		id: "reply",
	}),
	cue(beats.construct, "Browser entrance", "page", 0.13, {
		kind: "transition",
		id: "construct",
	}),
	cue(
		beats.payoff,
		"Generate instant interface with Vlak.dev",
		"success",
		0.18,
		{
			kind: "transition",
			id: "payoff",
		},
	),
];

export const landingCues = interfaceCues.filter(
	(event) => event.kind === "landing",
);
export const cuelumeCues = [
	...typingCues,
	...narrativeCues,
	...interfaceCues,
].sort((a, b) => a.time - b.time);

// Editorial metadata only; transitions do not introduce independent effects.
export const scoreCuts = [
	...new Set([
		0,
		beats.send,
		beats.reply,
		beats.construct,
		beats.assembled,
		...agentCuts
			.filter((time) => time > 0)
			.map((time) => round(sourceToStory(time))),
		beats.payoff,
		beats.resolve,
	]),
].sort((a, b) => a - b);

/** Unmodified official Cuelume recipes, 48kHz stereo PCM, without music. */
export async function writeScore(file, duration = filmDuration) {
	await writeCuelumeScore(file, cuelumeCues, duration, { bedGain: 0 });
	return file;
}

if (
	process.argv[1] &&
	import.meta.url === pathToFileURL(process.argv[1]).href
) {
	if (!process.argv[2]) throw new Error("Pass an output WAV path");
	console.log(
		await writeScore(
			process.argv[2],
			process.argv[3] ? Number(process.argv[3]) : filmDuration,
		),
	);
}
