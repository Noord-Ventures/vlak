import { Board } from "../../../app/interfaces/press/board";

const cue = (id, selector, start, from = {}, extra = {}) => ({
	id,
	selector,
	start,
	from,
	sound: "tick",
	volume: 0.13,
	...extra,
});
const metric = (start) => [
	...Array.from({ length: 3 }, (_, i) =>
		cue(
			`metric-value-${i}`,
			".sc-dash-metric > strong",
			start + i * 0.12,
			{ y: 28, scale: 0.75 },
			{ index: i, sound: "release", volume: 0.18 },
		),
	),
	cue(
		"chart-update",
		".sc-dash-chart",
		start + 0.28,
		{ y: 15, scale: 0.98 },
		{ sound: "release" },
	),
];
const sheet = (start) => [
	cue(
		"sheet-surface",
		".if-inspect.is-open",
		start,
		{},
		{ surface: true, sound: null },
	),
	cue(
		"sheet-close",
		".if-inspect-close",
		start + 0.06,
		{ y: -15, scale: 0.75 },
		{ sound: "release" },
	),
	cue("sheet-title", ".sc-dash-inspect h2", start + 0.1, { y: 22 }),
	...Array.from({ length: 4 }, (_, i) =>
		cue(
			`sheet-line-${i}`,
			".sc-dash-inspect p",
			start + 0.22 + i * 0.11,
			{ x: 22 },
			{ index: i },
		),
	),
];

export default {
	slug: "press",
	title: "Dashboard",
	Component: Board,
	rootSelector: ".sc-dash",
	width: 1180,
	height: 772,
	duration: 40,
	hero: { selector: ".sc-dash-metric", index: 0, scale: 2.5 },
	shots: [
		{ start: 9.15, end: 11.9, selector: ".sc-dash-metrics", scale: 1.45 },
		{ start: 13.25, end: 16.55, selector: ".sc-dash-inspect", scale: 2.5 },
		{ start: 23.25, end: 26.95, selector: ".sc-dash-inspect", scale: 2.5 },
	],
	intro: [
		cue(
			"hero-metric",
			".sc-dash-metric",
			0.15,
			{ scale: 0.8 },
			{ index: 0, surface: true, sound: "press", volume: 0.26 },
		),
		cue("hero-label", ".sc-dash-metric:first-child > p", 0.46, { x: -28 }),
		cue("hero-icon", ".sc-dash-metric:first-child .rs-icon", 0.67, {
			rotate: -70,
			scale: 0.45,
		}),
		cue(
			"hero-number",
			".sc-dash-metric:first-child > strong",
			0.92,
			{ y: 35, scale: 0.55 },
			{ sound: "release", volume: 0.25 },
		),
		cue(
			"rail-surface",
			".sc-dash-rail",
			3.2,
			{},
			{ surface: true, sound: null },
		),
		cue("brand", ".sc-dash-brand .if-app", 3.25, { x: -50 }),
		cue("brand-context", ".sc-dash-voice", 3.42, { y: 15 }),
		cue("floor-label", ".sc-dash-label", 3.6, { x: -28 }),
		...Array.from({ length: 3 }, (_, i) =>
			cue(
				`navigation-${i}`,
				".sc-dash-nav",
				3.75 + i * 0.16,
				{ x: -75, scale: 0.95 },
				{ index: i, sound: "release" },
			),
		),
		cue(
			"head-surface",
			".sc-dash-head",
			3.4,
			{},
			{ surface: true, sound: null },
		),
		cue("head-title", ".sc-dash-head h2", 3.55, { y: -24 }),
		cue(
			"range-frame",
			".sc-dash-range",
			3.7,
			{},
			{ surface: true, sound: null },
		),
		...Array.from({ length: 2 }, (_, i) =>
			cue(
				`range-${i}`,
				".sc-dash-range button",
				3.82 + i * 0.17,
				{ y: -25, scale: 0.78 },
				{ index: i, sound: "release" },
			),
		),
		cue(
			"metric-rule",
			".sc-dash-metrics",
			4.1,
			{},
			{ surface: true, sound: null },
		),
		...Array.from({ length: 2 }, (_, i) => [
			cue(
				`metric-${i + 1}`,
				".sc-dash-metric",
				4.2 + i * 0.25,
				{},
				{ index: i + 1, surface: true, sound: null },
			),
			cue(
				`metric-label-${i + 1}`,
				".sc-dash-metric > p",
				4.3 + i * 0.25,
				{ x: 26 },
				{ index: i + 1 },
			),
			cue(
				`metric-count-${i + 1}`,
				".sc-dash-metric > strong",
				4.45 + i * 0.25,
				{ y: 28, scale: 0.6 },
				{ index: i + 1, sound: "release" },
			),
		]).flat(),
		cue(
			"throughput-surface",
			".sc-dash-split > .sc-dash-card:first-child",
			4.7,
			{},
			{ surface: true, sound: null },
		),
		cue(
			"throughput-title",
			".sc-dash-split > .sc-dash-card:first-child h2",
			4.85,
			{ y: 22 },
		),
		cue(
			"throughput-line",
			".sc-dash-chart",
			5.08,
			{ y: 28, scale: 0.95 },
			{ sound: "release", volume: 0.22 },
		),
		cue(
			"jobs-surface",
			".sc-dash-jobs",
			5.1,
			{},
			{ surface: true, sound: null },
		),
		cue("jobs-title", ".sc-dash-jobs > h2", 5.18, { x: 30 }),
		...Array.from({ length: 4 }, (_, i) =>
			cue(
				`job-${i}`,
				".sc-dash-job",
				5.4 + i * 0.22,
				{ x: 45, scale: 0.98 },
				{ index: i, sound: "release", volume: 0.14 },
			),
		),
		cue("job-note", ".sc-dash-detail p", 6.5, { y: 25 }),
		cue(
			"open-sheet",
			".sc-dash-detail button",
			6.75,
			{ y: 20, scale: 0.8 },
			{ sound: "release" },
		),
	],
	actions: [
		{
			id: "month",
			time: 9.6,
			kind: "click",
			selector: ".sc-dash-range button",
			label: "Month",
			sound: "press",
			assert: { selector: ".sc-dash-metric:first-child strong", text: "142" },
		},
		{
			id: "proof-sheet",
			time: 13.1,
			kind: "click",
			selector: ".sc-dash-job",
			index: 1,
			sound: "press",
			assert: { selector: ".sc-dash-inspect h2", text: "Exhibition guide" },
		},
		{
			id: "close-proof",
			time: 17,
			kind: "click",
			selector: ".if-inspect-close",
			label: "Close pane",
			sound: "press",
			assert: { selector: ".if-inspect:not(.is-open)" },
		},
		{
			id: "invoices",
			time: 20,
			kind: "click",
			selector: ".sc-dash-nav",
			index: 2,
			sound: "press",
			assert: { selector: ".sc-dash-head h2", text: "Invoices" },
		},
		{
			id: "invoice-sheet",
			time: 23.1,
			kind: "click",
			selector: ".sc-dash-job",
			index: 0,
			sound: "press",
			assert: { selector: ".sc-dash-inspect h2", text: "September invoice" },
		},
		{
			id: "overview",
			time: 27.4,
			kind: "click",
			selector: ".sc-dash-nav",
			index: 0,
			sound: "press",
			assert: { selector: ".sc-dash-head h2", text: "Overview" },
		},
		{
			id: "week",
			time: 30.2,
			kind: "click",
			selector: ".sc-dash-range button",
			label: "Week",
			sound: "press",
			assert: { selector: ".sc-dash-metric:first-child strong", text: "38" },
		},
	],
	rebuilds: [
		{ after: "month", cues: metric(9.65) },
		{ after: "proof-sheet", cues: sheet(13.15) },
		{
			after: "invoices",
			cues: [
				cue("invoice-heading", ".sc-dash-jobs > h2", 20.05, { y: 18 }),
				cue("invoice-row", ".sc-dash-job", 20.17, { x: 40 }),
			],
		},
		{ after: "invoice-sheet", cues: sheet(23.15) },
		{
			after: "overview",
			cues: Array.from({ length: 4 }, (_, i) =>
				cue(
					`restored-job-${i}`,
					".sc-dash-job",
					27.45 + i * 0.12,
					{ y: 22 },
					{ index: i },
				),
			),
		},
		{ after: "week", cues: metric(30.25) },
	],
	inspect(root) {
		return {
			page: root.getAttribute("data-page"),
			range: root
				.querySelector('.sc-dash-range button[aria-pressed="true"]')
				?.textContent.trim(),
			metrics: [...root.querySelectorAll(".sc-dash-metric strong")].map((el) =>
				el.textContent.trim(),
			),
			jobs: root.querySelectorAll(".sc-dash-job").length,
			sheet:
				root.querySelector(".if-inspect.is-open h2")?.textContent.trim() ??
				null,
		};
	},
};
