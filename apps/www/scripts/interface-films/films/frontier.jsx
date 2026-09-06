import { ConceptBoard } from "../../../app/interfaces/concepts/board";

const cue = (id, selector, start, from = {}, index, sound = "tick") => ({
	id,
	selector,
	start,
	from,
	index,
	sound,
	volume: sound ? 0.14 : 0,
});
const cards = (start, prefix) =>
	Array.from({ length: 3 }, (_, index) => [
		{
			...cue(
				`${prefix}-card-${index}`,
				".cx-frontier > section > .rs-card",
				start + index * 0.13,
				{},
				index,
				null,
			),
			surface: true,
		},
		cue(
			`${prefix}-label-${index}`,
			".cx-frontier > section .rs-card-label",
			start + 0.08 + index * 0.13,
			{ x: -18 },
			index,
		),
		cue(
			`${prefix}-title-${index}`,
			".cx-frontier > section .rs-card-title",
			start + 0.18 + index * 0.13,
			{ y: 20 },
			index,
			"release",
		),
		cue(
			`${prefix}-body-${index}`,
			".cx-frontier > section .rs-card-body",
			start + 0.28 + index * 0.13,
			{ y: 12 },
			index,
		),
	]).flat();

export default {
	slug: "frontier",
	title: "Frontier model company",
	Component: ConceptBoard,
	props: { kind: "frontier" },
	rootSelector: ".cx-frontier",
	width: 1180,
	height: 772,
	duration: 40,
	hero: { selector: ".cx-frontier > section > .rs-card", index: 0, scale: 2.4 },
	intro: [
		{
			...cue(
				"model-card",
				".cx-frontier > section > .rs-card",
				0.15,
				{ scale: 0.8, rotate: -2 },
				0,
				"press",
			),
			surface: true,
		},
		cue(
			"model-label",
			".cx-frontier > section .rs-card-label",
			0.42,
			{ x: -22 },
			0,
		),
		cue(
			"model-title",
			".cx-frontier > section .rs-card-title",
			0.66,
			{ y: 24 },
			0,
			"release",
		),
		cue(
			"model-description",
			".cx-frontier > section .rs-card-body",
			0.94,
			{ y: 18 },
			0,
		),
		{
			...cue("header", ".cx-frontier > header", 3.2, {}, undefined, null),
			surface: true,
		},
		cue("brand", ".cx-frontier > header > b", 3.3, { x: -28 }),
		...Array.from({ length: 3 }, (_, index) =>
			cue(
				`section-${index}`,
				".cx-frontier header nav button",
				3.46 + index * 0.12,
				{ y: -22, scale: 0.9 },
				index,
			),
		),
		cue(
			"header-action",
			".cx-frontier-header-action",
			3.88,
			{ x: 35, scale: 0.9 },
			undefined,
			"release",
		),
		{
			...cue(
				"workspace",
				".cx-frontier > .cx-workspace",
				4.08,
				{},
				undefined,
				null,
			),
			surface: true,
		},
		// The original artwork owns its transforms and animation; reveal it as one piece.
		{
			...cue(
				"original-artwork",
				".cx-frontier-graphic",
				4.14,
				{},
				undefined,
				null,
			),
			surface: true,
		},
		cue("origin", ".cx-frontier > .cx-workspace > p:first-of-type", 4.3, {
			x: -25,
		}),
		cue(
			"headline",
			".cx-frontier > .cx-workspace > h2",
			4.52,
			{ y: 34 },
			undefined,
			"release",
		),
		cue("introduction", ".cx-frontier-intro", 4.74, { y: 18 }),
		cue(
			"explore",
			".cx-frontier > .cx-workspace > div:not(.cx-frontier-graphic) > button",
			4.96,
			{ y: 25, scale: 0.9 },
			0,
			"release",
		),
		cue("system-card", ".cx-frontier .cx-text-link", 5.1, { x: 25 }),
		...cards(5.5, "remaining").filter((item) => item.index !== 0),
		{
			...cue("footer", ".cx-frontier > footer", 6.4, {}, undefined, null),
			surface: true,
		},
		cue(
			"fictional-company",
			".cx-frontier > footer > span",
			6.55,
			{ y: 12 },
			0,
			null,
		),
		cue(
			"study-credit",
			".cx-frontier > footer > span",
			6.7,
			{ y: 12 },
			1,
			null,
		),
	],
	shots: [
		{ start: 9.7, end: 12.8, selector: ".cx-frontier > section", scale: 1.4 },
		{ start: 15.1, end: 18.4, selector: ".cx-frontier > section", scale: 1.4 },
		{ start: 26.5, end: 30, selector: ".cx-frontier > section", scale: 1.4 },
	],
	actions: [
		{
			id: "system-card",
			time: 9.6,
			kind: "click",
			selector: ".cx-text-link",
			sound: "press",
			volume: 0.28,
			assert: {
				selector: ".cx-frontier > section .rs-card-title",
				text: "Evaluate first",
			},
		},
		{
			id: "company",
			time: 15,
			kind: "click",
			selector: ".cx-frontier header nav button",
			index: 2,
			sound: "press",
			volume: 0.28,
			assert: {
				selector: ".cx-frontier > section .rs-card-title",
				text: "Built together",
			},
		},
		{
			id: "explore-model",
			time: 21,
			kind: "click",
			selector:
				".cx-frontier > .cx-workspace > div:not(.cx-frontier-graphic) > button",
			index: 0,
			sound: "press",
			volume: 0.28,
			assert: {
				selector: ".cx-frontier > section .rs-card-title",
				text: "Aster 2",
			},
		},
		{
			id: "research",
			time: 27,
			kind: "click",
			selector: ".cx-frontier header nav button",
			index: 1,
			sound: "press",
			volume: 0.28,
			assert: {
				selector: ".cx-frontier > section .rs-card-title",
				text: "Evaluate first",
			},
		},
	],
	rebuilds: [
		{ after: "system-card", cues: cards(9.65, "research") },
		{ after: "company", cues: cards(15.05, "company") },
		{ after: "explore-model", cues: cards(21.05, "models") },
		{ after: "research", cues: cards(27.05, "research-return") },
	],
	inspect(root) {
		return {
			section: root
				.querySelector(":scope > section")
				?.getAttribute("aria-label"),
			titles: [...root.querySelectorAll(":scope > section .rs-card-title")].map(
				(element) => element.textContent.trim(),
			),
		};
	},
};
