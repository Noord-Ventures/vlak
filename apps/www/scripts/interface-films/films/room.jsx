import { Board } from "../../../app/interfaces/room/board";

const cue = (id, selector, start, from = {}, extra = {}) => ({
	id,
	selector,
	start,
	from,
	sound: "tick",
	volume: 0.13,
	...extra,
});
const message = (index, start, prefix = "message") => [
	cue(
		`${prefix}-surface-${index}`,
		".sc-room-msg",
		start,
		{},
		{ index, surface: true, sound: null },
	),
	cue(
		`${prefix}-face-${index}`,
		".sc-room-msg > .if-face",
		start + 0.08,
		{ x: -25, scale: 0.6 },
		{ index, sound: "release" },
	),
	// This existing span also owns the message's direct text node. Moving the
	// whole copy unit retains its original line boxes and accessible button.
	cue(
		`${prefix}-copy-${index}`,
		".sc-room-msg > span:not(.if-face)",
		start + 0.2,
		{ y: 24 },
		{ index, sound: "release", volume: 0.16 },
	),
];

export default {
	slug: "room",
	title: "Team chat",
	Component: Board,
	rootSelector: ".sc-room",
	width: 1180,
	height: 772,
	duration: 40,
	hero: { selector: ".sc-room-person", index: 0, scale: 3 },
	shots: [
		{
			start: 9.85,
			end: 11.7,
			selector: ".sc-room-thread-original",
			scale: 2.6,
		},
		{ start: 12, end: 15.75, selector: ".sc-room-reply-dock", scale: 3.2 },
		{ start: 24, end: 28.5, selector: ".sc-room-dock", scale: 1.55 },
	],
	intro: [
		cue(
			"hero-person",
			".sc-room-person",
			0.15,
			{},
			{ index: 0, surface: true, sound: "press", volume: 0.22 },
		),
		cue(
			"hero-avatar",
			".sc-room-person > .if-face",
			0.4,
			{ scale: 0.35, rotate: -20 },
			{ index: 0, sound: "release", volume: 0.22 },
		),
		cue(
			"hero-name",
			".sc-room-person > span:not(.if-face) > b",
			0.7,
			{ x: 24 },
			{ index: 0 },
		),
		cue(
			"hero-presence",
			".sc-room-person > span:not(.if-face) > i",
			1.04,
			{ y: 15 },
			{ index: 0 },
		),
		cue(
			"rail-surface",
			".sc-room-rail",
			3.2,
			{},
			{ surface: true, sound: null },
		),
		cue("brand", ".sc-room-brand .if-app", 3.25, { x: -30 }),
		cue("workspace", ".sc-room-voice", 3.4, { y: 18 }),
		...Array.from({ length: 2 }, (_, i) =>
			cue(
				`rail-label-${i}`,
				".sc-room-rail > .sc-room-label",
				3.56 + i * 0.72,
				{ x: -25 },
				{ index: i },
			),
		),
		...Array.from({ length: 3 }, (_, i) => [
			cue(
				`channel-${i}`,
				".sc-room-ch",
				3.7 + i * 0.17,
				{},
				{ index: i, surface: true, sound: null },
			),
			cue(
				`channel-name-${i}`,
				".sc-room-ch > b",
				3.76 + i * 0.17,
				{ x: -32 },
				{ index: i },
			),
			cue(
				`channel-count-${i}`,
				".sc-room-ch > i",
				3.88 + i * 0.17,
				{ y: 15, scale: 0.65 },
				{ index: i, sound: "release" },
			),
		]).flat(),
		...Array.from({ length: 3 }, (_, i) => [
			cue(
				`person-${i + 1}`,
				".sc-room-person",
				4.42 + i * 0.22,
				{},
				{ index: i + 1, surface: true, sound: null },
			),
			cue(
				`person-face-${i + 1}`,
				".sc-room-person > .if-face",
				4.45 + i * 0.22,
				{ x: -30, scale: 0.6 },
				{ index: i + 1, sound: "release" },
			),
			cue(
				`person-copy-${i + 1}`,
				".sc-room-person > span:not(.if-face)",
				4.57 + i * 0.22,
				{ x: 24 },
				{ index: i + 1 },
			),
		]).flat(),
		cue(
			"channel-head",
			".sc-room-head",
			4.3,
			{},
			{ surface: true, sound: null },
		),
		cue("channel-title", ".sc-room-head > p", 4.4, { y: -22 }),
		cue("channel-members", ".sc-room-head > span", 4.58, { x: 35 }),
		...Array.from({ length: 4 }, (_, i) => message(i, 4.85 + i * 0.37)).flat(),
		cue(
			"dock-surface",
			".sc-room-dock",
			6.5,
			{},
			{ surface: true, sound: null },
		),
		cue(
			"field-border",
			".sc-room-field",
			6.55,
			{},
			{ surface: true, sound: "press", volume: 0.19 },
		),
		cue(
			"field-icon",
			".sc-room-field-mark",
			6.66,
			{ scale: 0.45, rotate: -45 },
			{ sound: "release" },
		),
		cue("field-input", ".sc-room-field input", 6.8, { x: 30 }),
		cue(
			"field-send",
			".sc-room-dock > button",
			7.02,
			{ y: 28, scale: 0.7 },
			{ sound: "release", volume: 0.2 },
		),
	],
	actions: [
		{
			id: "open-thread",
			time: 9.6,
			kind: "click",
			selector: ".sc-room-msg",
			index: 0,
			sound: "press",
			assert: {
				selector: ".sc-room-thread-original",
				text: "The client approved the poster direction.",
			},
		},
		{
			id: "write-reply",
			time: 12.2,
			end: 14.2,
			kind: "type",
			selector: 'input[aria-label="Reply in thread"]',
			value: "I will check both details before the print slot.",
			sound: "tick",
			volume: 0.08,
		},
		{
			id: "send-reply",
			time: 15.3,
			kind: "click",
			selector: '.sc-room-reply-dock button[aria-label="Send reply"]',
			sound: "press",
			assert: {
				selector: ".sc-room-reply:last-child",
				text: "I will check both details before the print slot.",
			},
		},
		{
			id: "close-thread",
			time: 18.6,
			kind: "click",
			selector: ".if-inspect-close",
			label: "Close pane",
			sound: "press",
			assert: { selector: ".if-inspect:not(.is-open)" },
		},
		{
			id: "production",
			time: 21.5,
			kind: "click",
			selector: '.sc-room-ch[data-channel="press"]',
			sound: "press",
			assert: { selector: ".sc-room-head > p", text: "production" },
		},
		{
			id: "write-message",
			time: 24.2,
			end: 26.2,
			kind: "type",
			selector: '.sc-room-field input[aria-label="Message"]',
			value: "The smaller type is clear at actual size.",
			sound: "tick",
			volume: 0.08,
		},
		{
			id: "send-message",
			time: 28.1,
			kind: "click",
			selector: ".sc-room-dock > button",
			label: "Send",
			sound: "press",
			assert: {
				selector: ".sc-room-msg:last-child",
				text: "The smaller type is clear at actual size.",
			},
		},
	],
	rebuilds: [
		{
			after: "open-thread",
			cues: [
				cue(
					"thread-surface",
					".if-inspect.is-open",
					9.65,
					{},
					{ surface: true, sound: null },
				),
				cue(
					"thread-close",
					".if-inspect-close",
					9.72,
					{ scale: 0.65, rotate: -25 },
					{ sound: "release" },
				),
				cue("thread-label", ".sc-room-thread .sc-room-label", 9.78, { y: 18 }),
				cue("thread-original", ".sc-room-thread-original", 9.94, { x: 20 }),
				...Array.from({ length: 2 }, (_, i) => [
					cue(
						`reply-surface-${i}`,
						".sc-room-reply",
						10.18 + i * 0.24,
						{},
						{ index: i, surface: true, sound: null },
					),
					cue(
						`reply-face-${i}`,
						".sc-room-reply > .if-face",
						10.24 + i * 0.24,
						{ scale: 0.6 },
						{ index: i, sound: "release" },
					),
					cue(
						`reply-copy-${i}`,
						".sc-room-reply > span:not(.if-face)",
						10.35 + i * 0.24,
						{ y: 20 },
						{ index: i },
					),
				]).flat(),
				cue(
					"reply-input",
					".sc-room-reply-dock input",
					10.9,
					{ y: 25, scale: 0.93 },
					{ sound: "release" },
				),
				cue(
					"reply-send",
					".sc-room-reply-dock button",
					11.08,
					{ y: 20, scale: 0.6 },
					{ sound: "release" },
				),
			],
		},
		{
			after: "send-reply",
			cues: [
				cue(
					"new-reply-face",
					".sc-room-reply:last-child > .if-face",
					15.35,
					{ scale: 0.6 },
					{ sound: "release" },
				),
				cue(
					"new-reply-copy",
					".sc-room-reply:last-child > span:not(.if-face)",
					15.5,
					{
						y: 24,
					},
				),
				cue(
					"thread-reply-count",
					".sc-room-msg:first-child > span:not(.if-face) > i",
					15.58,
					{ scale: 0.88 },
				),
			],
		},
		{
			after: "production",
			cues: [
				cue("production-title", ".sc-room-head > p", 21.55, { y: 20 }),
				cue("production-members", ".sc-room-head > span", 21.66, { y: 20 }),
				...Array.from({ length: 3 }, (_, i) =>
					message(i, 21.8 + i * 0.22, "production"),
				).flat(),
			],
		},
		{ after: "send-message", cues: message(3, 28.15, "sent") },
	],
	inspect(root) {
		return {
			channel: root
				.querySelector('.sc-room-ch[aria-current="true"]')
				?.getAttribute("data-channel"),
			messages: [
				...root.querySelectorAll(".sc-room-msg > span:not(.if-face)"),
			].map((el) => el.textContent.replace(/\s+/g, " ").trim()),
			thread:
				root.querySelector(".sc-room-thread-original")?.textContent.trim() ??
				null,
			replies: [
				...root.querySelectorAll(".sc-room-reply > span:not(.if-face)"),
			].map((el) => el.textContent.trim()),
		};
	},
};
