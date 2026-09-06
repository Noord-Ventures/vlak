// Original deterministic tactile score for the 35-second canonical DOM film.
// All sounds are synthesized here; there are no samples or external recordings.
import { writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { planningMotionTiming } from "./capture/planning-motion.mjs";
import { mediaTiming, mediaTransportEvents } from "./capture/media-timeline.mjs";

// capture/exact-film.jsx: incoming clocks begin at these chapter boundaries.
export const scoreCuts = [0, 6, 12.5, 19, 26];
const contact = (Math.PI / 2 + Math.atan(0.4)) / 10;
const cue = (time, component, gain = 0.55, pan = 0) => ({
	time: Math.round(time * 1e6) / 1e6,
	component,
	gain,
	pan,
});
const components = [
	"Switch",
	"NumberField",
	"RangeSlider",
	"Rating",
	"Waveform",
	"PlaybackControls",
	"MediaScrubber",
	"MultiSelect",
	"TagInput",
	"QueryBuilder",
	"Scheduler",
	"KanbanBoard",
];

/**
 * Cue times follow actual canonical DOM nodes in capture/exact-film.jsx.
 * flight() uses spring(time-start), so its first contact is start+contact.
 * Whole hosts run at .85 speed; overview tiles run at .8.
 * Minor labels travel with their controls and do not need separate loud hits.
 */
export const landingCues = [
	// Host arrivals. The subparts below retain their own softer contact ticks.
	...[0, 2.05, 3.2, 4.1, 6, 6.38, 6.72, 12.5, 13.75, 15.85, 19, 22.35].map(
		(start, i) =>
			cue(
				start + contact / 0.85,
				components[i] + " host",
				0.4,
				((i % 3) - 1) * 0.1,
			),
	),
	cue(0.28 + contact, "Switch thumb initial contact", 0.43),
	cue(2.6 + contact / 1.6, "Switch thumb reaches on position", 0.31, -0.15),
	...["input", "unit", "decrement", "increment"].map((name, i) =>
		cue(2.14 + i * 0.06 + contact, "NumberField " + name, 0.4, 0.16),
	),
	...["legend", "From row", "To row"].map((name, i) =>
		cue(3.28 + i * 0.12 + contact, "RangeSlider " + name, 0.4, -0.1 + i * 0.1),
	),
	...[
		"legend",
		"choice 1",
		"choice 2",
		"choice 3",
		"choice 4",
		"choice 5",
		"clear control",
	].map((name, i) =>
		cue(
			4.1 + i * 0.085 + contact,
			"Rating " + name,
			i ? 0.34 : 0.21,
			0.14 + i * 0.015,
		),
	),
	cue(4.34, "From value settles", 0.36, -0.14),
	cue(4.65, "To value settles", 0.36, 0.14),

	...["Previous", "Play", "Next", "Stop"].map((name, i) =>
		cue(
			6.38 + i * 0.11 + contact,
			"PlaybackControls " + name,
			0.44,
			(i - 1.5) * 0.12,
		),
	),
	cue(6.72 + contact, "MediaScrubber track", 0.42),
	cue(6.83 + contact, "MediaScrubber times", 0.25),
	cue(mediaTiming.seekEnd, "MediaScrubber seek reaches 9 seconds", 0.38, 0.08),

	// The details panel opens at12.72; all six real option rows already exist.
	cue(12.68 + contact, "MultiSelect trigger", 0.42, -0.2),
	cue(12.74 + contact, "MultiSelect panel", 0.37, -0.2),
	...[
		"Motion",
		"Typography",
		"Components",
		"Accessibility",
		"Documentation",
		"Tokens",
	].map((name, i) =>
		cue(
			12.8 + i * 0.06 + contact,
			"MultiSelect " + name + " option",
			0.28,
			-0.2,
		),
	),
	cue(13.75 + contact, "Motion TagInput tag", 0.49, 0.1),
	cue(14.23 + contact, "Accessibility TagInput tag", 0.49, 0.22),

	// Final QueryBuilder DOM order: legends/labels/selects, two seven-node rules,
	// then nested actions, outer actions and the canonical query summary.
	// Rules appear at16.15 and16.45, before their listed first contacts.
	...[
		[0, "root legend"],
		[2, "root match select"],
		[3, "nested legend"],
		[5, "nested match select"],
		[7, "first field"],
		[9, "first operator"],
		[11, "first value"],
		[12, "first remove"],
		[14, "second field"],
		[16, "second operator"],
		[18, "second value"],
		[19, "second remove"],
		[20, "nested add condition"],
		[21, "nested add group"],
		[22, "remove group"],
		[23, "add condition"],
		[24, "add group"],
		[25, "summary"],
	].map(([index, name]) =>
		cue(
			15.88 + index * 0.035 + contact,
			"QueryBuilder " + name,
			0.27,
			((index % 4) - 1.5) * 0.08,
		),
	),

	// Scheduler selector order: two toolbars, then each day and its actual events.
	...[
		"navigation toolbar",
		"view toolbar",
		"Monday",
		"Type study",
		"Collect ideas",
		"Tuesday",
		"Motion study",
		"Wednesday",
		"Layout review",
		"Thursday",
		"Component craft",
		"Build & test",
		"Friday",
		"Icon family",
		"Saturday",
		"Documentation",
		"Sunday",
		"Release notes",
	].map((name, i) =>
		cue(
			19.04 + i * 0.035 + contact,
			"Scheduler " + name,
			0.27,
			(i / 17 - 0.5) * 0.4,
		),
	),
	cue(20.65 + contact / 1.2, "Native reschedule dialog contact", 0.46),
	// Native Kanban columns and cards are selected together, in DOM order.
	...[
		"Planned column",
		"Type study",
		"Build & test",
		"Release notes",
		"In progress column",
		"Motion study",
		"Icon family",
		"Collect ideas",
		"Complete column",
		"Layout review",
		"Documentation",
		"Component craft",
	].map((name, i) =>
		cue(
			22.35 + i * 0.05 + contact,
			"KanbanBoard " + name,
			0.32,
			(Math.floor(i / 4) - 1) * 0.18,
		),
	),

	cue(
		planningMotionTiming.typeContact,
		"Type study reaches In progress",
		0.48,
		0.12,
	),
	cue(
		planningMotionTiming.motionContact,
		"Motion study reaches Planned",
		0.48,
		-0.12,
	),
	// Exact overview: Kanban moves first, followed by indices0–10 in reading order.
	cue(26.5 + contact, "Overview Vlak.dev wordmark", 0.49),
	...components.map((name, i) =>
		cue(
			26.55 + (i === 11 ? 0 : i + 1) * 0.085 + contact / 0.8,
			"Overview " + name + " tile",
			0.5,
			((i % 4) - 1.5) * 0.13,
		),
	),
].sort((a, b) => a.time - b.time);

export const landingCueTimes = landingCues.map(({ time }) => time);

// These follow controlled React state changes and native-dialog interaction.
// The reschedule dialog opens20.65, edits21.05, commits21.65, closes21.72.
const pressCues = [
	cue(2.6, "Switch checked state", 0.6, -0.2),
	...[3.3, 3.72, 4.14].map((time) =>
		cue(time, "NumberField increment", 0.66, 0.25),
	),
	...mediaTransportEvents.map(({ action, time }) =>
		cue(time, "PlaybackControls " + action + " press", 0.58, -0.06),
	),
	cue(13.75, "Select Motion", 0.48, -0.2),
	cue(14.23, "Select Accessibility", 0.48, -0.2),
	cue(20.65, "Open native reschedule dialog", 0.45),
	cue(21.05, "Native date and time change", 0.4),
	cue(21.65, "Controlled schedule change commits", 0.57, 0.15),
	cue(21.72, "Native dialog closes", 0.24),
	cue(25.04, "Controlled Kanban destinations change", 0.52),
];
const notes = [
	220, 293.6648, 329.6276, 440, 329.6276, 246.9417, 293.6648, 164.8138,
];
const clamp = (x) => Math.max(0, Math.min(1, x));

/** 48 kHz stereo PCM; dry paper contacts, no reverb, generous mix headroom. */
export async function writeScore(file, duration = 35) {
	if (!Number.isFinite(duration) || duration <= 0 || duration > 3600)
		throw new Error("Score duration must be between zero and one hour");
	const rate = 48000,
		length = Math.round(duration * rate);
	const wav = Buffer.alloc(44 + length * 4);
	wav.write("RIFF", 0);
	wav.writeUInt32LE(wav.length - 8, 4);
	wav.write("WAVEfmt ", 8);
	wav.writeUInt32LE(16, 16);
	wav.writeUInt16LE(1, 20);
	wav.writeUInt16LE(2, 22);
	wav.writeUInt32LE(rate, 24);
	wav.writeUInt32LE(rate * 4, 28);
	wav.writeUInt16LE(4, 32);
	wav.writeUInt16LE(16, 34);
	wav.write("data", 36);
	wav.writeUInt32LE(length * 4, 40);
	const contacts = [
		...landingCues.map((event) => ({ ...event, press: false, length: 0.08 })),
		...pressCues.map((event) => ({ ...event, press: true, length: 0.1 })),
	].sort((a, b) => a.time - b.time);
	let seed = 6090635,
		low = 0,
		air = 0,
		firstContact = 0;
	const tau = Math.PI * 2;
	for (let i = 0; i < length; i++) {
		const t = i / rate;
		seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
		const noise = seed / 2147483648 - 1;
		low += (noise - low) * 0.035;
		air += (noise - air) * 0.19;
		const grain = air - low;
		const envelope = clamp(t / 0.6) * clamp((duration - t) / 1.5);
		// The grid holds through 35s. Let its clicks lead, then resolve gently.
		const calm = 1 - clamp((t - 28.45) / 4.35) * 0.62;
		const beatIndex = Math.floor(t / 0.65),
			beat = t % 0.65;
		const frequency = notes[beatIndex % notes.length];
		const pluck =
			0.008 *
			Math.exp(-beat * 4.6) *
			clamp(beat * 180) *
			(Math.sin(tau * frequency * beat) +
				0.17 * Math.sin(tau * frequency * 2.005 * beat));
		const pad =
			0.019 *
			(Math.sin(tau * 110 * t) + 0.26 * Math.sin(tau * 164.8138 * t)) *
			(0.74 + 0.26 * Math.sin(t * 0.33));
		const pulse =
			0.038 *
			(1 - clamp((t - 28.1) / 1.4)) *
			Math.exp(-beat * 16) *
			Math.sin(tau * (48 * beat + 1.8 * (1 - Math.exp(-beat * 45))));
		let impact = 0,
			swish = 0,
			contactLeft = 0,
			contactRight = 0;
		for (let n = 0; n < scoreCuts.length; n++) {
			const d = t - scoreCuts[n];
			if (d >= 0 && d < 0.4) {
				impact +=
					clamp(d * 180) *
					(0.022 *
						Math.sin(tau * (83 * d + 0.28 * (1 - Math.exp(-d * 60)))) *
						Math.exp(-d * 20) +
						0.026 * low * Math.exp(-d * 24));
			}
			if (d > -0.46 && d < 0.52) {
				const u = (d + 0.46) / 0.98;
				swish +=
					0.037 *
					grain *
					Math.sin(Math.PI * clamp(u)) ** 2 *
					(n === 0 ? 0.3 : 1);
			}
		}
		while (
			firstContact < contacts.length &&
			t - contacts[firstContact].time > contacts[firstContact].length
		)
			firstContact++;
		for (
			let n = firstContact;
			n < contacts.length && contacts[n].time <= t;
			n++
		) {
			const event = contacts[n],
				d = t - event.time;
			if (d > event.length) continue;
			let sound;
			if (event.press) {
				sound =
					0.057 * grain * Math.exp(-d * 520) +
					0.023 * Math.sin(tau * 1730 * d) * Math.exp(-d * 340) +
					0.05 * Math.sin(tau * 146 * d) * Math.exp(-d * 78) * clamp(d * 2400);
			} else {
				// A filtered-noise edge and damped paper body, without a resonant ping,
				// bass thump or delayed echo. The short dry tick marks actual contact.
				sound =
					0.047 * grain * Math.exp(-d * 390) +
					0.023 * Math.sin(tau * 910 * d) * Math.exp(-d * 215) +
					0.041 *
						Math.sin(tau * 305 * d) *
						Math.exp(-d * 115) *
						clamp(d * 3200);
			}
			contactLeft += sound * event.gain * (1 - event.pan);
			contactRight += sound * event.gain * (1 + event.pan);
		}
		const stereo = Math.sin(beatIndex * 1.3) * 0.18;
		const bed = (pad + pulse + swish) * calm + impact;
		const left =
			Math.tanh((bed + contactLeft + pluck * (1 - stereo) * calm) * 1.35) *
			envelope;
		const right =
			Math.tanh((bed + contactRight + pluck * (1 + stereo) * calm) * 1.35) *
			envelope;
		wav.writeInt16LE(
			Math.round(Math.max(-1, Math.min(1, left)) * 32767),
			44 + i * 4,
		);
		wav.writeInt16LE(
			Math.round(Math.max(-1, Math.min(1, right)) * 32767),
			46 + i * 4,
		);
	}
	await writeFile(file, wav);
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
			process.argv[3] ? Number(process.argv[3]) : 35,
		),
	);
}
