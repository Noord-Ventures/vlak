import { Board } from "../../../app/interfaces/evening/board";

const cue = (id, selector, start, from = {}, index, sound = "tick") => ({
	id,
	selector,
	start,
	from,
	index,
	sound,
	volume: sound ? 0.14 : 0,
});
const shop = (index, start, prefix) => [
	{
		...cue(`${prefix}-surface`, ".sc-evening-store", start, {}, index, null),
		surface: true,
	},
	cue(
		`${prefix}-photo`,
		".sc-evening-store > img",
		start + 0.1,
		{ y: 25, scale: 0.95 },
		index,
		"release",
	),
	cue(
		`${prefix}-name`,
		".sc-evening-store > span > b",
		start + 0.28,
		{ x: -18 },
		index,
	),
	cue(
		`${prefix}-rating`,
		".sc-evening-store > span > i",
		start + 0.4,
		{ y: 12 },
		index,
	),
	cue(
		`${prefix}-location`,
		".sc-evening-store > span > em",
		start + 0.52,
		{ y: 12 },
		index,
	),
];
const bag = (start, count, prefix) => [
	cue(`${prefix}-heading`, ".sc-evening-sheet > .sc-evening-label", start, {
		x: -18,
	}),
	...Array.from({ length: count }, (_, index) => [
		cue(
			`${prefix}-line-${index}`,
			".sc-evening-line",
			start + 0.15 + index * 0.17,
			{ x: 28, y: 12 },
			index,
			"release",
		),
	]).flat(),
	cue(
		`${prefix}-total`,
		".sc-evening-total",
		start + 0.32 + count * 0.17,
		{ y: 20 },
		undefined,
		"release",
	),
];

export default {
	slug: "evening",
	title: "Food ordering",
	Component: Board,
	rootSelector: ".sc-evening",
	width: 1180,
	height: 772,
	duration: 40,
	setup(root) {
		for (const image of root.querySelectorAll("img")) image.loading = "eager";
	},
	hero: { selector: ".sc-evening-store", index: 0, scale: 1.1 },
	intro: [
		{
			...cue(
				"kitchen-surface",
				".sc-evening-store",
				0.15,
				{ scale: 0.86, rotate: -2 },
				0,
				"press",
			),
			surface: true,
		},
		cue(
			"kitchen-photo",
			".sc-evening-store > img",
			0.42,
			{ y: 25, scale: 0.95 },
			0,
			"release",
		),
		cue("kitchen-name", ".sc-evening-store > span > b", 0.68, { x: -22 }, 0),
		cue("kitchen-rating", ".sc-evening-store > span > i", 0.92, { y: 15 }, 0),
		cue(
			"kitchen-location",
			".sc-evening-store > span > em",
			1.13,
			{ y: 15 },
			0,
		),
		{
			...cue("bar", ".sc-evening-bar", 3.2, {}, undefined, null),
			surface: true,
		},
		cue("app", ".sc-evening-bar .if-app", 3.3, { x: -25 }),
		cue("address", ".sc-evening-addr", 3.48, { y: -20 }),
		cue(
			"search",
			".sc-evening-search",
			3.68,
			{ y: -25, scale: 0.94 },
			undefined,
			"release",
		),
		cue(
			"bag-button",
			".sc-evening-bag",
			3.91,
			{ x: 28, scale: 0.88 },
			undefined,
			"release",
		),
		{
			...cue("filters", ".sc-evening-filters", 4.08, {}, undefined, null),
			surface: true,
		},
		...Array.from({ length: 3 }, (_, index) =>
			cue(
				`filter-${index}`,
				".sc-evening-filters > .sc-evening-seg",
				4.2 + index * 0.22,
				{ y: 24, scale: 0.94 },
				index,
				"release",
			),
		),
		...shop(1, 5.04, "canal"),
		// The second row remains in its canonical scroll area, with no offscreen sounds.
		...shop(2, 5.75, "bakery").map((item) => ({
			...item,
			sound: null,
			volume: 0,
		})),
		...shop(3, 6.04, "station").map((item) => ({
			...item,
			sound: null,
			volume: 0,
		})),
	],
	shots: [
		{ start: 9, end: 11.3, selector: ".sc-evening-search", scale: 1.6 },
		{ start: 15.1, end: 19.3, selector: ".sc-evening-sheet", scale: 2.8 },
		{ start: 24.1, end: 28, selector: ".sc-evening-sheet", scale: 2.8 },
	],
	actions: [
		{
			id: "find-kitchen",
			time: 9.3,
			end: 10.8,
			kind: "type",
			selector: '.sc-evening-search input[aria-label="Search kitchens"]',
			value: "De Buren",
			sound: "tick",
			volume: 0.08,
		},
		{
			id: "open-menu",
			time: 12,
			kind: "click",
			selector: ".sc-evening-store",
			index: 0,
			sound: "press",
			volume: 0.28,
			assert: { selector: ".sc-evening-menu", text: "Roast chicken" },
		},
		{
			id: "inspect-plate",
			time: 15,
			kind: "click",
			selector: ".sc-evening-item-open",
			index: 0,
			sound: "press",
			volume: 0.24,
			assert: { selector: ".sc-evening-dish", text: "Roast chicken" },
		},
		{
			id: "add-chicken",
			time: 18,
			kind: "click",
			selector: ".sc-evening-ghost",
			sound: "press",
			volume: 0.3,
			assert: { selector: ".sc-evening-total", text: "€18.00" },
		},
		{
			id: "close-bag",
			time: 21,
			kind: "click",
			selector: ".sc-evening > .if-inspect > .if-inspect-close",
			sound: "press",
			volume: 0.24,
		},
		{
			id: "add-salad",
			time: 24,
			kind: "click",
			selector: ".sc-evening-add",
			index: 1,
			sound: "press",
			volume: 0.3,
			assert: { selector: ".sc-evening-total", text: "€27.00" },
		},
	],
	rebuilds: [
		{
			after: "open-menu",
			cues: [
				cue("menu-header", ".sc-evening-head", 12.05, { y: -20 }),
				cue(
					"menu-photo",
					".sc-evening-hero > img",
					12.18,
					{ y: 28, scale: 0.98 },
					undefined,
					"release",
				),
				cue("menu-caption", ".sc-evening-hero > p", 12.4, { y: 18 }),
				...Array.from({ length: 2 }, (_, index) =>
					cue(
						`menu-category-${index}`,
						".sc-evening-cat > h2",
						12.55 + index * 0.3,
						{ x: -20 },
						index,
					),
				),
				...Array.from({ length: 3 }, (_, index) => [
					cue(
						`menu-item-${index}`,
						".sc-evening-item-open",
						12.68 + index * 0.2,
						{ x: -28, y: 12 },
						index,
						"release",
					),
					cue(
						`menu-add-${index}`,
						".sc-evening-add",
						12.81 + index * 0.2,
						{ x: 24, scale: 0.85 },
						index,
					),
				]).flat(),
			],
		},
		{
			after: "inspect-plate",
			cues: [
				cue("plate-label", ".sc-evening-sheet > .sc-evening-label", 15.05, {
					x: -18,
				}),
				cue(
					"plate-photo",
					".sc-evening-sheet > img",
					15.2,
					{ y: 26, scale: 0.96 },
					undefined,
					"release",
				),
				cue("plate-name", ".sc-evening-dish", 15.43, { y: 18 }),
				cue("plate-description", ".sc-evening-dish + p", 15.58, { y: 14 }),
				cue(
					"plate-add",
					".sc-evening-ghost",
					15.77,
					{ y: 24, scale: 0.9 },
					undefined,
					"release",
				),
			],
		},
		{ after: "add-chicken", cues: bag(18.05, 1, "first-bag") },
		{ after: "add-salad", cues: bag(24.05, 2, "complete-bag") },
	],
	inspect(root) {
		return {
			page: root.getAttribute("data-page"),
			search: root.querySelector(".sc-evening-search input")?.value,
			bag: [...root.querySelectorAll(".sc-evening-line b")].map(
				(element) => element.textContent,
			),
			total: root.querySelector(".sc-evening-total > strong")?.textContent,
		};
	},
};
