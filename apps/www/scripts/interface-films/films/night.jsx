import { Board } from "../../../app/interfaces/night/board";

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
			"selected-vehicle",
			'.sc-night-unit[aria-current="true"]',
			0.15,
			{ scale: 0.76, rotate: -2 },
			"press",
			0.3,
		),
		surface: true,
	},
	part("vehicle-name", '.sc-night-unit[aria-current="true"] b', 0.48, {
		x: -42,
	}),
	part("vehicle-state", '.sc-night-unit[aria-current="true"] i', 0.74, {
		y: -20,
	}),
	part("vehicle-location", '.sc-night-unit[aria-current="true"] em', 0.96, {
		y: 24,
	}),
	part(
		"vehicle-symbol",
		'.sc-night-unit[aria-current="true"] b > .rs-icon',
		1.12,
		{ scale: 0.2, rotate: -50 },
		"release",
		0.18,
	),
	part("dispatch-mark", ".sc-night-brand > :first-child", 2.4, { y: -32 }),
	part("dispatch-context", ".sc-night-voice", 2.65, { x: -25 }, null, 0),
	part("fleet-label", ".sc-night-rail > .sc-night-label", 2.83, { x: -30 }),
	part("map-header", ".sc-night-head > p", 3.12, { y: -25 }),
	part(
		"trip-button",
		".sc-night-head > button",
		3.3,
		{ x: 60, scale: 0.8 },
		"release",
		0.2,
	),
	{
		...part(
			"live-city",
			".sc-night-map",
			3.62,
			{ y: 38, scale: 0.95 },
			"press",
			0.23,
		),
		surface: true,
	},
	part("map-caption", ".sc-night-map-label", 4.15, { y: 20 }, null, 0),
];
for (let i = 1; i < 4; i++) {
	intro.push({
		...part(
			`fleet-row-${i}`,
			".sc-night-unit",
			3.4 + i * 0.2,
			{ x: -90, scale: 0.95 },
			"press",
			0.2,
			i,
		),
		surface: true,
	});
	intro.push(
		part(
			`fleet-name-${i}`,
			".sc-night-unit b",
			3.59 + i * 0.2,
			{ x: -24 },
			"tick",
			0.12,
			i,
		),
	);
	intro.push(
		part(
			`fleet-location-${i}`,
			".sc-night-unit em",
			3.75 + i * 0.2,
			{ y: 18 },
			"tick",
			0.1,
			i,
		),
	);
}
const tripParts = (prefix, start) => [
	part(`${prefix}-heading`, ".sc-night-inspect > .sc-night-label", start, {
		y: -20,
	}),
	part(
		`${prefix}-route`,
		".sc-night-trip",
		start + 0.16,
		{ x: 40 },
		"release",
		0.22,
	),
	part(
		`${prefix}-copy`,
		".sc-night-inspect > p:not(.sc-night-label):not(.sc-night-trip)",
		start + 0.3,
		{ y: 20 },
		null,
		0,
	),
	...[0, 1, 2].flatMap((i) => [
		part(
			`${prefix}-label-${i}`,
			".sc-night-inspect dl dt",
			start + 0.43 + i * 0.14,
			{ x: -24 },
			"tick",
			0.12,
			i,
		),
		part(
			`${prefix}-value-${i}`,
			".sc-night-inspect dl dd",
			start + 0.5 + i * 0.14,
			{ x: 30 },
			"release",
			0.14,
			i,
		),
	]),
	part(
		`${prefix}-close`,
		".if-inspect-close",
		start + 0.25,
		{ scale: 0.4, rotate: -45 },
		"tick",
		0.15,
	),
];

export default {
	slug: "night",
	title: "Fleet management",
	Component: Board,
	rootSelector: ".sc-night",
	width: 1180,
	height: 772,
	duration: 40,
	theme: "light",
	hero: { selector: '.sc-night-unit[aria-current="true"]', scale: 2.7 },
	intro,
	shots: [
		{ start: 12.5, end: 15.9, selector: ".sc-night-inspect", scale: 1.6 },
		{ start: 22, end: 25.9, selector: ".sc-night-inspect", scale: 1.6 },
	],
	actions: [
		{
			id: "select-hold",
			time: 9.2,
			kind: "click",
			selector: ".sc-night-unit",
			index: 1,
			sound: "toggle",
			assert: { selector: ".sc-night-head > p", text: "Van 19" },
		},
		{
			id: "hold-trip",
			time: 12.5,
			kind: "click",
			selector: ".sc-night-head > button",
			label: "Open trip",
			sound: "page",
			assert: { selector: ".sc-night-trip", text: "Ferry → Folsom" },
		},
		{
			id: "close-hold-trip",
			time: 16,
			kind: "click",
			selector: ".if-inspect-close",
			label: "Close pane",
			sound: "release",
			assert: { selector: '.sc-night[data-trip="false"]' },
		},
		{
			id: "select-moving",
			time: 19,
			kind: "click",
			selector: ".sc-night-unit",
			index: 3,
			sound: "toggle",
			assert: { selector: ".sc-night-head > p", text: "Van 11" },
		},
		{
			id: "moving-trip",
			time: 22,
			kind: "click",
			selector: ".sc-night-head > button",
			label: "Open trip",
			sound: "page",
			assert: { selector: ".sc-night-trip", text: "Civic → Geary" },
		},
		{
			id: "close-moving-trip",
			time: 26,
			kind: "click",
			selector: ".if-inspect-close",
			label: "Close pane",
			sound: "release",
			assert: { selector: '.sc-night[data-trip="false"]' },
		},
		{
			id: "select-yard",
			time: 29.5,
			kind: "click",
			selector: ".sc-night-unit",
			index: 2,
			sound: "toggle",
			assert: { selector: ".sc-night-head > p", text: "Van 03" },
		},
	],
	rebuilds: [
		{ after: "hold-trip", cues: tripParts("hold", 12.55) },
		{ after: "moving-trip", cues: tripParts("moving", 22.05) },
	],
	async ready(root) {
		const deadline = Date.now() + 12000;
		while (Date.now() < deadline) {
			const canvas = root.querySelector(".sc-night-map canvas");
			if (canvas?.width > 0 && canvas?.height > 0) {
				const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
				if (!gl || gl.isContextLost())
					throw new Error("Fleet map WebGL context failed");
				// Keep the renderer's high-resolution backing buffer inside its
				// native viewport instead of displaying twice as large at DPR2.
				canvas.style.width = "100%";
				canvas.style.height = "100%";
				await new Promise((resolve) =>
					requestAnimationFrame(() => requestAnimationFrame(resolve)),
				);
				return;
			}
			await new Promise((resolve) => setTimeout(resolve, 50));
		}
		throw new Error("The original Three.js fleet map did not become ready");
	},
	inspect(root) {
		const canvas = root.querySelector(".sc-night-map canvas");
		return {
			selected: root
				.querySelector('.sc-night-unit[aria-current="true"] b')
				?.textContent.trim(),
			tripOpen: !!root.querySelector(".if-inspect.is-open"),
			trip: root.querySelector(".sc-night-trip")?.textContent.trim(),
			canvas: canvas ? { width: canvas.width, height: canvas.height } : null,
			illustrativePositions: true,
		};
	},
};
