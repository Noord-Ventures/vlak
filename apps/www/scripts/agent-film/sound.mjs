// Original 34-second score for the real AgentsBoard interface film.
// Synthesized tones and filtered noise only; no samples or agent-service audio.
import { writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { agentFilmEvents } from "./controller.mjs";

// Broad story beats; action clicks below come directly from the controller.
export const scoreCuts = [0, 6.4, 14.3, 20, 28.5];
const cue = (time, component, gain = 0.4, pan = 0) => ({
	time: Math.round(time * 1e6) / 1e6,
	component,
	gain,
	pan,
});

// film.jsx uses 1 - exp(-7.8t) * (cos(10t) + 0.4sin(10t)).
// Its first physical contact is the first crossing of the resting position.
// Keep these flight starts in sync with introductoryMotion/stateMotion there.
export const firstContact = (Math.PI / 2 + Math.atan(0.4)) / 10;
const land = (start, component, gain = 0.24, pan = 0) =>
	cue(start + firstContact, component, gain, pan);

export const landingCues = [
	// Opening: the selected row is index 1, so it is not repeated in the ripple.
	land(0.18, "Selected task 013", 0.5, -0.18),
	land(2.12, "Workspace header", 0.12),
	...["Active agents", "Needs review", "In queue"].map((label, i) =>
		land(2.25 + i * 0.075, label, 0.23, (i - 1) * 0.11),
	),
	land(2.4, "Queue controls", 0.12, -0.18),
	...[0, 2, 3, 4].map((index) =>
		land(2.47 + index * 0.09, `Task ${14 - index}`, 0.25, -0.18),
	),
	land(2.65, "Review task heading", 0.23, 0.12),
	land(2.78, "Review task brief", 0.09, 0.12),
	land(2.86, "Task information tabs", 0.14, 0.12),
	...[0, 1, 2].map((i) =>
		land(2.98 + i * 0.085, `Review activity ${i + 1}`, 0.13, 0.12),
	),
	land(3.3, "Review actions", 0.22, 0.12),
	// Output heading precedes the two genuine file cards in DOM order.
	land(6.42, "Output heading", 0.1, 0.1),
	land(6.52, "Navigation output file", 0.29, 0.1),
	land(6.62, "Dialog output file", 0.29, 0.1),
	land(10.72, "Work accepted message", 0.1, 0.1),
	land(10.76, "Accepted review mark", 0.23, 0.1),
	land(14.32, "Task 014 heading", 0.25, 0.1),
	land(14.4, "Task 014 brief", 0.09, 0.1),
	land(14.48, "Task 014 information tabs", 0.14, 0.1),
	...[0, 1, 2].map((i) =>
		land(14.57 + i * 0.07, `Task 014 activity ${i + 1}`, 0.12, 0.1),
	),
	land(14.92, "Task 014 progress and action", 0.18, 0.1),
	land(16.41, "Paused activity entry", 0.17, 0.1),
	land(18.01, "Resumed activity entry", 0.17, 0.1),
	land(20.02, "New task heading", 0.12, 0.1),
	// The form's paragraph is child 0; fields are children 1 and 2.
	land(20.185, "Task name field", 0.29, 0.08),
	land(20.27, "Task brief field", 0.29, 0.08),
	land(20.355, "Builder assignment", 0.1, 0.08),
	land(20.4, "New task actions", 0.2, 0.08),
	// New queue row and detail heading share their first contact.
	land(25.12, "Queued task 015 and heading", 0.38),
	land(25.19, "Queued task brief", 0.09, 0.1),
	land(25.26, "Queued task information tabs", 0.14, 0.1),
	land(25.33, "Queued task activity entry", 0.18, 0.1),
	land(26.12, "Started task activity entry", 0.22, 0.1),
	land(28.55, "Vlak.dev wordmark", 0.34),
].sort((a, b) => a.time - b.time);

export const actionCues = agentFilmEvents
	.filter((event) => event.kind === "click")
	.map((event, i) =>
		cue(event.time, event.label ?? event.id, 0.6, Math.sin(i * 1.17) * 0.1),
	);

// Use a sparse subset of real character insertions, never a synthetic typing
// clock that can continue after the field stops changing.
let lastTypingCue = -Infinity;
export const typingCues = agentFilmEvents
	.filter((event) => event.kind === "input")
	.filter((event) => {
		if (event.time - lastTypingCue < 0.085 && event.index !== event.length - 1)
			return false;
		lastTypingCue = event.time;
		return true;
	})
	.map((event, i) =>
		cue(
			event.time,
			event.label ?? "Task text insertion",
			0.27,
			Math.sin(i * 2.1) * 0.08,
		),
	);

const clamp = (value) => Math.max(0, Math.min(1, value));
const notes = [
	220, 293.6648, 329.6276, 440, 329.6276, 246.9417, 293.6648, 164.8138,
];

/** Deterministic 48 kHz stereo PCM, with quiet dry contacts and mix headroom. */
export async function writeScore(file, duration = 34) {
	if (!Number.isFinite(duration) || duration <= 0 || duration > 3600)
		throw new Error("Score duration must be between zero and one hour");
	const rate = 48000;
	const length = Math.round(duration * rate);
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
	const events = [
		...landingCues.map((event) => ({
			...event,
			kind: "landing",
			length: 0.08,
		})),
		...actionCues.map((event) => ({ ...event, kind: "action", length: 0.1 })),
		...typingCues.map((event) => ({ ...event, kind: "typing", length: 0.04 })),
	].sort((a, b) => a.time - b.time);
	let seed = 731034;
	let low = 0;
	let air = 0;
	let firstEvent = 0;
	const tau = Math.PI * 2;
	for (let i = 0; i < length; i++) {
		const t = i / rate;
		seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
		const noise = seed / 2147483648 - 1;
		low += (noise - low) * 0.035;
		air += (noise - air) * 0.19;
		const grain = air - low;
		const envelope = clamp(t / 0.7) * clamp((duration - t) / 1.8);
		const calm = 1 - clamp((t - 28.5) / 4.2) * 0.68;
		const beatIndex = Math.floor(t / 0.68);
		const beat = t % 0.68;
		const frequency = notes[beatIndex % notes.length];
		const pluck =
			0.0075 *
			Math.exp(-beat * 4.8) *
			clamp(beat * 180) *
			(Math.sin(tau * frequency * beat) +
				0.15 * Math.sin(tau * frequency * 2.005 * beat));
		const pad =
			0.018 *
			(Math.sin(tau * 110 * t) + 0.26 * Math.sin(tau * 164.8138 * t)) *
			(0.76 + 0.24 * Math.sin(t * 0.31));
		const pulse =
			0.032 *
			(1 - clamp((t - 28.2) / 1.2)) *
			Math.exp(-beat * 17) *
			Math.sin(tau * (48 * beat + 1.8 * (1 - Math.exp(-beat * 45))));
		let accent = 0;
		let swish = 0;
		for (const cut of scoreCuts) {
			const age = t - cut;
			if (age >= 0 && age < 0.35) {
				accent +=
					clamp(age * 180) *
					(0.018 * Math.sin(tau * 83 * age) * Math.exp(-age * 22) +
						0.02 * low * Math.exp(-age * 25));
			}
			if (age > -0.42 && age < 0.48) {
				swish +=
					0.029 * grain * Math.sin(Math.PI * clamp((age + 0.42) / 0.9)) ** 2;
			}
		}
		while (
			firstEvent < events.length &&
			t - events[firstEvent].time > events[firstEvent].length
		)
			firstEvent++;
		let contactLeft = 0;
		let contactRight = 0;
		for (let n = firstEvent; n < events.length && events[n].time <= t; n++) {
			const event = events[n];
			const age = t - event.time;
			if (age > event.length) continue;
			let sound;
			if (event.kind === "typing") {
				sound =
					0.033 * (noise - low) * Math.exp(-age * 490) +
					0.016 * Math.sin(tau * 990 * age) * Math.exp(-age * 310);
			} else if (event.kind === "action") {
				sound =
					0.055 * grain * Math.exp(-age * 520) +
					0.022 * Math.sin(tau * 1730 * age) * Math.exp(-age * 340) +
					0.047 *
						Math.sin(tau * 146 * age) *
						Math.exp(-age * 78) *
						clamp(age * 2400);
			} else {
				sound =
					0.044 * grain * Math.exp(-age * 390) +
					0.022 * Math.sin(tau * 910 * age) * Math.exp(-age * 215) +
					0.038 *
						Math.sin(tau * 305 * age) *
						Math.exp(-age * 115) *
						clamp(age * 3200);
			}
			contactLeft += sound * event.gain * (1 - event.pan);
			contactRight += sound * event.gain * (1 + event.pan);
		}
		const stereo = Math.sin(beatIndex * 1.3) * 0.15;
		const bed = (pad + pulse + swish) * calm + accent;
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
			process.argv[3] ? Number(process.argv[3]) : 34,
		),
	);
}
