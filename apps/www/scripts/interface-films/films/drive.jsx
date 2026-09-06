import { ConceptBoard } from "../../../app/interfaces/concepts/board";

const part = (
	id,
	selector,
	start,
	from = {},
	sound = "tick",
	volume = 0.15,
	index,
) => ({ id, selector, start, from, sound, volume, index });
const intro = [
	{
		...part(
			"cabin-field",
			".cx-ev-cabin-field",
			0.15,
			{ scale: 0.74, rotate: -2 },
			"press",
			0.3,
		),
		surface: true,
	},
	part("cabin-label", ".rs-number-field-label", 0.42, { x: -35 }),
	part(
		"cabin-value",
		".rs-number-field-input",
		0.65,
		{ y: 35, scale: 0.5 },
		"release",
		0.22,
	),
	part("cabin-unit", ".rs-number-field-unit", 0.86, { y: -20 }),
	part(
		"climate-up",
		'button[aria-label="Raise temperature"]',
		1.02,
		{ x: 40, scale: 0.6 },
		"release",
		0.18,
	),
	part(
		"climate-down",
		'button[aria-label="Lower temperature"]',
		1.2,
		{ x: 40, scale: 0.6 },
		"release",
		0.18,
	),
	part("system-name", ".cx-drive > header > b", 2.3, { y: -28 }),
	part("system-time", ".cx-ev-time", 2.45, { x: -40 }),
	part(
		"connection-status",
		".cx-ev-connection",
		2.6,
		{ x: 45 },
		"release",
		0.15,
	),
	// Keep the original isolated vehicle backdrop beneath its screen-blended art.
	{
		...part("vehicle-surface", ".cx-ev-vehicle", 3.5, {}, null, 0),
		surface: true,
	},
	part("model-name", ".cx-ev-model > b", 3.2, { x: -50 }),
	part("model-description", ".cx-ev-model > span", 3.36, { y: 20 }, null, 0),
	part(
		"original-vehicle-art",
		".cx-ev-vehicle-art > img",
		3.6,
		{ x: -80, scale: 0.94 },
		"press",
		0.2,
	),
	part("vehicle-ground", ".cx-ev-ground", 4.06, {}, null, 0),
	part(
		"vehicle-state-dot",
		".cx-ev-status-dot",
		4.2,
		{ scale: 0.1 },
		"release",
		0.17,
	),
	part("vehicle-state-title", ".cx-ev-state b", 4.3, { y: 22 }),
	part(
		"vehicle-state-context",
		".cx-ev-state > div > span",
		4.44,
		{ y: 18 },
		null,
		0,
	),
	part(
		"lock-action",
		".cx-ev-view-actions button",
		4.55,
		{ x: 55, scale: 0.85 },
		"release",
		0.18,
		0,
	),
	part(
		"light-action",
		".cx-ev-view-actions button",
		4.73,
		{ x: 55, scale: 0.85 },
		"release",
		0.18,
		1,
	),
	part("battery-rail", ".cx-ev-battery", 5.08, { scale: 0.85 }, "press", 0.15),
	part(
		"charge-limit",
		".cx-ev-battery-detail > button",
		5.26,
		{ x: 35 },
		"tick",
		0.15,
	),
	part("climate-caption", ".cx-ev-caption", 5.2, { y: 25 }, null, 0),
	part(
		"climate-context",
		".cx-ev-cabin-field + .cx-ev-card-content .cx-ev-footnote",
		5.38,
		{ y: 20 },
		null,
		0,
	),
	part("media-label", ".cx-ev-media > .rs-card-label", 5.45, { x: -30 }),
	part("track-title", ".cx-ev-track > b", 5.6, { x: 45 }),
	part("track-artist", ".cx-ev-track > span", 5.75, { y: 20 }, null, 0),
	part(
		"playhead-rail",
		".cx-ev-playhead .rs-media-scrubber-track",
		6.5,
		{ scale: 0.8 },
		"release",
		0.16,
	),
	part(
		"playhead-times",
		".cx-ev-playhead .rs-media-scrubber-times",
		6.68,
		{ y: 18 },
		"tick",
		0.1,
	),
	part(
		"phone-connection",
		".cx-ev-media .cx-ev-text-control",
		6.86,
		{ x: 35 },
		"release",
		0.18,
	),
];
for (let i = 0; i < 3; i++)
	intro.push(
		part(
			`vehicle-mode-${i}`,
			".cx-ev-modes button",
			2.65 + i * 0.17,
			{ y: -30, scale: 0.8 },
			"tick",
			0.15,
			i,
		),
	);
for (let i = 0; i < 2; i++) {
	intro.push(
		part(
			`metric-label-${i}`,
			".cx-ev-card .rs-metric-label",
			4.08 + i * 0.28,
			{ x: -28 },
			"tick",
			0.13,
			i,
		),
	);
	intro.push(
		part(
			`metric-value-${i}`,
			".cx-ev-card .rs-metric-value",
			4.25 + i * 0.28,
			{ y: 38, scale: 0.55 },
			"release",
			0.22,
			i,
		),
	);
	intro.push(
		part(
			`metric-unit-${i}`,
			".cx-ev-card .rs-metric-unit",
			4.42 + i * 0.28,
			{ y: -20 },
			"tick",
			0.12,
			i,
		),
	);
}
for (let i = 0; i < 3; i++)
	intro.push(
		part(
			`playback-${i}`,
			".cx-ev-player .rs-playback-action",
			5.92 + i * 0.16,
			{ y: 30, scale: 0.65 },
			"release",
			0.16,
			i,
		),
	);

const journey = [
	part(
		"journey-route",
		".cx-ev-journey-map svg",
		18.05,
		{ x: -25, scale: 0.92 },
		"press",
		0.22,
	),
	part(
		"destination-label",
		".cx-ev-map-destination small",
		18.27,
		{ y: -18 },
		"tick",
		0.12,
	),
	part(
		"destination-name",
		".cx-ev-map-destination b",
		18.44,
		{ x: 32 },
		"release",
		0.19,
	),
	...[0, 1, 2].map((i) =>
		part(
			`journey-metric-${i}`,
			".cx-ev-map-hud > span",
			18.58 + i * 0.14,
			{ y: 30 },
			"release",
			0.15,
			i,
		),
	),
	part("route-state", ".cx-ev-state", 19.02, { x: -30 }, "tick", 0.13),
	part(
		"route-action",
		".cx-ev-view-action",
		19.2,
		{ x: 45, scale: 0.8 },
		"release",
		0.19,
	),
];
const energy = [
	...Array.from({ length: 12 }, (_, i) =>
		part(
			`battery-cell-${i}`,
			".cx-ev-battery-pack > i",
			25.08 + i * 0.065,
			{ y: 22, scale: 0.65 },
			"tick",
			0.08,
			i,
		),
	),
	part(
		"energy-label",
		".cx-ev-energy-readout small",
		25.35,
		{ x: -35 },
		"tick",
		0.13,
	),
	part(
		"energy-charge",
		".cx-ev-energy-readout strong",
		25.54,
		{ y: 35, scale: 0.6 },
		"release",
		0.2,
	),
	part("energy-capacity", ".cx-ev-energy-readout p", 25.76, { y: 20 }, null, 0),
	part("charge-state", ".cx-ev-state", 26.05, { x: -30 }, "tick", 0.13),
	part(
		"schedule-action",
		".cx-ev-view-action",
		26.2,
		{ x: 45, scale: 0.8 },
		"release",
		0.19,
	),
];

export default {
	slug: "drive",
	title: "EV controls",
	Component: ConceptBoard,
	props: { kind: "drive" },
	rootSelector: ".cx-drive",
	width: 1180,
	height: 772,
	duration: 40,
	theme: "dark",
	hero: { selector: ".cx-ev-cabin-field", scale: 2.6 },
	intro,
	shots: [
		{ start: 8.7, end: 13.2, selector: ".cx-ev-vehicle", scale: 1.35 },
		{ start: 14.1, end: 16.5, selector: ".cx-ev-cabin-field", scale: 2 },
		{ start: 17.4, end: 22.8, selector: ".cx-ev-vehicle", scale: 1.35 },
		{ start: 24.4, end: 30.4, selector: ".cx-ev-vehicle", scale: 1.35 },
	],
	actions: [
		{
			id: "unlock",
			time: 9.25,
			kind: "click",
			selector: ".cx-ev-view-actions button",
			label: "Locked",
			sound: "toggle",
			assert: { selector: ".cx-ev-state", text: "Vehicle unlocked" },
		},
		{
			id: "lights-on",
			time: 12,
			kind: "click",
			selector: ".cx-ev-view-actions button",
			label: "Lights off",
			sound: "toggle",
			assert: { selector: '.cx-ev-illustration[data-lights="true"]' },
		},
		{
			id: "raise-cabin",
			time: 15,
			kind: "click",
			selector: 'button[aria-label="Raise temperature"]',
			label: "Raise temperature",
			sound: "release",
			assert: { selector: '.rs-number-field-input[value="21"]' },
		},
		{
			id: "journey-view",
			time: 18,
			kind: "click",
			selector: ".cx-ev-modes button",
			label: "Journey",
			sound: "page",
			assert: {
				selector: '.cx-drive[data-view="journey"] .cx-ev-state',
				text: "Utrecht Centraal",
			},
		},
		{
			id: "start-route",
			time: 21,
			kind: "click",
			selector: ".cx-ev-view-action",
			label: "Start route",
			sound: "success",
			assert: { selector: ".cx-ev-state", text: "Route active" },
		},
		{
			id: "energy-view",
			time: 25,
			kind: "click",
			selector: ".cx-ev-modes button",
			label: "Energy",
			sound: "page",
			assert: {
				selector: '.cx-drive[data-view="energy"] .cx-ev-state',
				text: "Set your next charge",
			},
		},
		{
			id: "schedule-charge",
			time: 28.5,
			kind: "click",
			selector: ".cx-ev-view-action",
			label: "Schedule charge",
			sound: "success",
			assert: { selector: ".cx-ev-state", text: "Charge scheduled for 23:00" },
		},
	],
	rebuilds: [
		{ after: "journey-view", cues: journey },
		{ after: "energy-view", cues: energy },
	],
	async ready(root) {
		const images = [...root.querySelectorAll(".cx-ev-illustration img")];
		if (!images.length) throw new Error("EV concept artwork is missing");
		await Promise.all(
			images.map(async (image) => {
				await image.decode();
				if (!image.naturalWidth)
					throw new Error(`EV illustration failed to load: ${image.src}`);
			}),
		);
	},
	inspect(root) {
		const board = root.matches(".cx-drive")
			? root
			: root.querySelector(".cx-drive");
		return {
			view: board?.dataset.view,
			lights: root.querySelector(".cx-ev-illustration")?.dataset.lights,
			temperature: root.querySelector(".rs-number-field-input")?.value,
			state: root.querySelector(".cx-ev-state")?.textContent.trim(),
			playing: board?.dataset.playing,
			originalArtwork: [
				...root.querySelectorAll(".cx-ev-illustration img"),
			].every((image) => image.complete && image.naturalWidth > 0),
			fictionalVehicleData: true,
			mediaAudioStream: false,
		};
	},
};
