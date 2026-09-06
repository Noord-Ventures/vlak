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
const phone = (platform, start) => {
	const root = `.cx-phone.${platform}`;
	return [
		{
			...cue(`${platform}-shell`, root, start, {}, undefined, null),
			surface: true,
		},
		cue(`${platform}-status`, `${root} .cx-phone-status`, start + 0.1, {
			y: -16,
		}),
		cue(
			`${platform}-heading`,
			`${root} > header`,
			start + 0.28,
			{ y: -22 },
			undefined,
			"release",
		),
		{
			...cue(
				`${platform}-trip`,
				`${root} .cx-trip-card`,
				start + 0.47,
				{},
				undefined,
				null,
			),
			surface: true,
		},
		cue(`${platform}-departure`, `${root} .cx-trip-card > span`, start + 0.56, {
			x: -18,
		}),
		cue(`${platform}-train`, `${root} .cx-trip-card > div`, start + 0.67, {
			y: 18,
		}),
		cue(`${platform}-punctuality`, `${root} .cx-trip-card > em`, start + 0.78, {
			x: 18,
		}),
		cue(`${platform}-today`, `${root} .cx-phone-content > h2`, start + 0.92, {
			y: 16,
		}),
		...Array.from({ length: 3 }, (_, index) =>
			cue(
				`${platform}-stop-${index}`,
				`${root} .cx-agenda`,
				start + 1.04 + index * 0.12,
				{ x: index % 2 ? 22 : -22, y: 12 },
				index,
				"release",
			),
		),
		...Array.from({ length: 3 }, (_, index) =>
			cue(
				`${platform}-tab-${index}`,
				`${root} > nav > button`,
				start + 1.45 + index * 0.12,
				{ y: 22, scale: 0.9 },
				index,
			),
		),
		...(platform === "android"
			? [
					cue(
						"android-save",
						`${root} .cx-android-action`,
						start + 1.83,
						{ y: 26, scale: 0.75 },
						undefined,
						"release",
					),
				]
			: []),
	];
};
const profile = (platform, start) => [
	cue(
		`${platform}-profile-icon`,
		`.cx-phone.${platform} .cx-phone-profile > svg`,
		start,
		{ y: -22, scale: 0.8 },
		undefined,
		"release",
	),
	cue(
		`${platform}-profile-name`,
		`.cx-phone.${platform} .cx-phone-profile > h2`,
		start + 0.16,
		{ y: 18 },
	),
	cue(
		`${platform}-profile-saved`,
		`.cx-phone.${platform} .cx-phone-profile > p`,
		start + 0.28,
		{ y: 14 },
	),
	cue(
		`${platform}-profile-return`,
		`.cx-phone.${platform} .cx-phone-profile > button`,
		start + 0.42,
		{ y: 22, scale: 0.9 },
		undefined,
		"release",
	),
];

export default {
	slug: "platforms",
	title: "Mobile platforms",
	Component: ConceptBoard,
	props: { kind: "platforms" },
	rootSelector: ".cx-platforms",
	width: 1180,
	height: 772,
	duration: 40,
	hero: { selector: ".cx-phone.ios .cx-trip-card", scale: 2.4 },
	intro: [
		{
			...cue(
				"ios-hero-card",
				".cx-phone.ios .cx-trip-card",
				0.15,
				{ scale: 0.8, rotate: -2 },
				undefined,
				"press",
			),
			surface: true,
		},
		cue("ios-hero-time", ".cx-phone.ios .cx-trip-card > span", 0.42, {
			x: -22,
		}),
		cue(
			"ios-hero-train",
			".cx-phone.ios .cx-trip-card > div",
			0.66,
			{ y: 24 },
			undefined,
			"release",
		),
		cue("ios-hero-state", ".cx-phone.ios .cx-trip-card > em", 0.96, { x: 22 }),
		{
			...cue("header", ".cx-platforms > header", 3.2, {}, undefined, null),
			surface: true,
		},
		cue("heading", ".cx-platforms > header > b", 3.3, { x: -24 }),
		cue("shared-content", ".cx-platforms > header > span", 3.48, { x: 24 }),
		cue("ios-label", ".cx-platforms [data-phone=ios] > p", 3.62, { y: -18 }),
		...phone("ios", 3.75).filter(
			(item) => !/ios-(trip|departure|train|punctuality)$/.test(item.id),
		),
		cue("android-label", ".cx-platforms [data-phone=android] > p", 4.9, {
			y: -18,
		}),
		...phone("android", 5.04),
	],
	shots: [
		{ start: 9.1, end: 16.8, selector: ".cx-phone.ios", scale: 1.45 },
		{ start: 18.5, end: 23.3, selector: ".cx-phone.android", scale: 1.45 },
		{ start: 25.5, end: 28.2, selector: ".cx-phone.android", scale: 1.45 },
	],
	actions: [
		{
			id: "ios-options",
			time: 9.6,
			kind: "click",
			selector: '.cx-phone.ios button[aria-label="More options"]',
			sound: "press",
			volume: 0.24,
			assert: {
				selector: ".cx-phone.ios .cx-phone-options",
				text: "Save this trip",
			},
		},
		{
			id: "ios-save",
			time: 12,
			kind: "click",
			selector: ".cx-phone.ios .cx-phone-options > button",
			sound: "press",
			volume: 0.28,
			assert: { selector: ".cx-phone.ios .cx-trip-card > em", text: "Saved" },
		},
		{
			id: "ios-profile",
			time: 15,
			kind: "click",
			selector: ".cx-phone.ios > nav > button",
			index: 2,
			sound: "press",
			volume: 0.24,
			assert: {
				selector: ".cx-phone.ios .cx-phone-profile > p",
				text: "Rotterdam trip saved",
			},
		},
		{
			id: "android-save",
			time: 19,
			kind: "click",
			selector: ".cx-phone.android .cx-android-action",
			sound: "press",
			volume: 0.28,
			assert: {
				selector: ".cx-phone.android .cx-trip-card > em",
				text: "Saved",
			},
		},
		{
			id: "android-plan",
			time: 22,
			kind: "click",
			selector: ".cx-phone.android > nav > button",
			index: 0,
			sound: "press",
			volume: 0.24,
			assert: {
				selector: ".cx-phone.android .cx-phone-content > h2",
				text: "Your itinerary",
			},
		},
		{
			id: "android-profile",
			time: 26,
			kind: "click",
			selector: ".cx-phone.android > nav > button",
			index: 2,
			sound: "press",
			volume: 0.24,
			assert: {
				selector: ".cx-phone.android .cx-phone-profile > p",
				text: "Rotterdam trip saved",
			},
		},
		{
			id: "ios-today",
			time: 30,
			kind: "click",
			selector: ".cx-phone.ios .cx-phone-profile > button",
			sound: "press",
			volume: 0.24,
			assert: {
				selector: ".cx-phone.ios .cx-phone-content > h2",
				text: "Today",
			},
		},
	],
	rebuilds: [
		{
			after: "ios-options",
			cues: [
				cue(
					"ios-save-option",
					".cx-phone.ios .cx-phone-options > button",
					9.65,
					{ y: -20, scale: 0.9 },
					undefined,
					"release",
				),
			],
		},
		{ after: "ios-profile", cues: profile("ios", 15.05) },
		{
			after: "android-plan",
			cues: [
				cue(
					"android-itinerary",
					".cx-phone.android .cx-phone-content > h2",
					22.05,
					{ y: 15 },
				),
			],
		},
		{ after: "android-profile", cues: profile("android", 26.05) },
		{
			after: "ios-today",
			cues: phone("ios", 30.05).filter((item) =>
				/ios-(trip|departure|train|punctuality|today|stop-\d)$/.test(item.id),
			),
		},
	],
	inspect(root) {
		return Object.fromEntries(
			["ios", "android"].map((platform) => {
				const phone = root.querySelector(`.cx-phone.${platform}`);
				return [
					platform,
					{
						tab: phone
							?.querySelector("nav button[aria-pressed=true]")
							?.textContent.trim(),
						saved: /Saved|trip saved/.test(phone?.textContent ?? ""),
						visible: (phone?.getBoundingClientRect().width ?? 0) > 0,
					},
				];
			}),
		);
	},
};
