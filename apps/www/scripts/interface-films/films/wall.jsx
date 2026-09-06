import { Board } from "../../../app/interfaces/wall/board";

const cue = (id, selector, start, from = {}, extra = {}) => ({
	id,
	selector,
	start,
	from,
	sound: "tick",
	volume: 0.13,
	...extra,
});
const hero = ".sc-wall-stream > article:nth-child(2) .sc-wall-card";

export default {
	slug: "wall",
	title: "Social feed",
	Component: Board,
	rootSelector: ".sc-wall",
	width: 1180,
	height: 772,
	duration: 40,
	async ready(root) {
		// Load the original offscreen photographs before freezing layout. This
		// changes loading priority only; the real images and their paint stay intact.
		await Promise.all(
			[...root.querySelectorAll("img")].map((image) => {
				image.loading = "eager";
				return image.decode();
			}),
		);
	},
	hero: { selector: hero, scale: 2.1 },
	shots: [
		{ start: 12.85, end: 15, selector: ".sc-wall-original", scale: 2.75 },
		{ start: 15.25, end: 19.8, selector: ".sc-wall-comment-dock", scale: 3.2 },
		{ start: 25.75, end: 29, selector: ".sc-wall-inspect", scale: 2.5 },
	],
	intro: [
		cue(
			"hero-card",
			hero,
			0.15,
			{},
			{ surface: true, sound: "press", volume: 0.24 },
		),
		cue(
			"hero-avatar",
			`${hero} .sc-wall-who > .if-face`,
			0.4,
			{ scale: 0.4, rotate: -18 },
			{ sound: "release" },
		),
		cue("hero-author", `${hero} .sc-wall-who > b`, 0.58, { x: 22 }),
		cue("hero-time", `${hero} .sc-wall-who > i`, 0.72, { y: -18 }),
		cue(
			"hero-post",
			`${hero} .sc-wall-open > p`,
			0.88,
			{ y: 28 },
			{ sound: "release", volume: 0.2 },
		),
		cue(
			"hero-like",
			`${hero} .sc-wall-actions > button`,
			1.13,
			{ y: 18, scale: 0.6 },
			{ index: 0, sound: "release" },
		),
		cue(
			"hero-comments",
			`${hero} .sc-wall-actions > button`,
			1.33,
			{ y: 18, scale: 0.6 },
			{ index: 1, sound: "release" },
		),
		cue(
			"rail-surface",
			".sc-wall-rail",
			3.2,
			{},
			{ surface: true, sound: null },
		),
		cue("brand", ".sc-wall-brand .if-app", 3.25, { x: -30 }),
		cue("brand-context", ".sc-wall-voice", 3.43, { y: 17 }),
		cue("people-label", ".sc-wall-rail > .sc-wall-label", 3.61, { x: -25 }),
		...Array.from({ length: 4 }, (_, i) => [
			cue(
				`person-surface-${i}`,
				".sc-wall-rail > .sc-wall-person",
				3.8 + i * 0.2,
				{},
				{ index: i, surface: true, sound: null },
			),
			cue(
				`person-face-${i}`,
				".sc-wall-rail > .sc-wall-person > .if-face",
				3.86 + i * 0.2,
				{ x: -25, scale: 0.5 },
				{ index: i, sound: "release" },
			),
			cue(
				`person-name-${i}`,
				".sc-wall-rail > .sc-wall-person > span > b",
				3.98 + i * 0.2,
				{ x: 24 },
				{ index: i },
			),
			cue(
				`person-role-${i}`,
				".sc-wall-rail > .sc-wall-person > span > i",
				4.07 + i * 0.2,
				{ y: 12 },
				{ index: i, sound: null },
			),
		]).flat(),
		cue("feed-head", ".sc-wall-head", 4.2, {}, { surface: true, sound: null }),
		cue("feed-title", ".sc-wall-head > p", 4.32, { y: -22 }),
		...[0, 2, 3, 4, 5, 6].flatMap((i, order) => {
			const card = `.sc-wall-stream > article:nth-child(${i + 1}) .sc-wall-card`;
			const start = 4.6 + order * 0.28;
			return [
				cue(
					`post-surface-${i}`,
					card,
					start,
					{},
					{ surface: true, sound: null },
				),
				...([0, 2, 4, 6].includes(i)
					? [
							cue(
								`post-photo-${i}`,
								`${card} .sc-wall-open > img`,
								start + 0.06,
								{ y: 20, scale: 0.97 },
								{ sound: "release", volume: 0.17 },
							),
						]
					: []),
				cue(`post-author-${i}`, `${card} .sc-wall-who`, start + 0.16, {
					x: 24,
				}),
				cue(`post-copy-${i}`, `${card} .sc-wall-open > p`, start + 0.29, {
					y: 20,
				}),
				cue(
					`post-like-${i}`,
					`${card} .sc-wall-actions > button`,
					start + 0.4,
					{ y: 16, scale: 0.8 },
					{ index: 0, sound: "release", volume: 0.1 },
				),
				cue(
					`post-comments-${i}`,
					`${card} .sc-wall-actions > button`,
					start + 0.5,
					{ y: 16, scale: 0.8 },
					{ index: 1, sound: null },
				),
			];
		}),
	],
	actions: [
		{
			id: "like-post",
			time: 9.6,
			kind: "click",
			selector: `${hero} .sc-wall-actions > button`,
			index: 0,
			sound: "press",
			assert: {
				selector: `${hero} .sc-wall-actions > button[aria-pressed="true"]`,
				text: "9",
			},
		},
		{
			id: "open-comments",
			time: 12.6,
			kind: "click",
			selector: `${hero} .sc-wall-actions > button`,
			index: 1,
			sound: "press",
			assert: {
				selector: ".sc-wall-original",
				text: "Taking the posters outside this afternoon",
			},
		},
		{
			id: "write-comment",
			time: 15.4,
			end: 17,
			kind: "type",
			selector: 'input[aria-label="Add a comment"]',
			value: "I will bring the smaller version for comparison.",
			sound: "tick",
			volume: 0.08,
		},
		{
			id: "post-comment",
			time: 18.5,
			kind: "click",
			selector: '.sc-wall-comment-dock button[aria-label="Post comment"]',
			sound: "press",
			assert: {
				selector: ".sc-wall-note:last-child",
				text: "I will bring the smaller version for comparison.",
			},
		},
		{
			id: "close-comments",
			time: 22.1,
			kind: "click",
			selector: ".if-inspect-close",
			label: "Close pane",
			sound: "press",
			assert: { selector: ".if-inspect:not(.is-open)" },
		},
		{
			id: "visit-profile",
			time: 25.5,
			kind: "click",
			selector: ".sc-wall-rail > .sc-wall-person",
			index: 0,
			sound: "press",
			assert: { selector: ".sc-wall-face > b", text: "Mara" },
		},
		{
			id: "return-to-feed",
			time: 29.5,
			kind: "click",
			selector: ".if-inspect-close",
			label: "Close pane",
			sound: "press",
			assert: { selector: ".if-inspect:not(.is-open)" },
		},
	],
	rebuilds: [
		{
			after: "like-post",
			cues: [
				cue(
					"like-reaction",
					`${hero} .sc-wall-actions > button .rs-icon`,
					9.64,
					{ rotate: -15, scale: 0.68 },
					{ index: 0, sound: "release" },
				),
			],
		},
		{
			after: "open-comments",
			cues: [
				cue(
					"comments-surface",
					".if-inspect.is-open",
					12.65,
					{},
					{ surface: true, sound: null },
				),
				cue(
					"comments-close",
					".if-inspect-close",
					12.71,
					{ scale: 0.65, rotate: -25 },
					{ sound: "release" },
				),
				cue("comments-label", ".sc-wall-comments .sc-wall-label", 12.82, {
					y: 18,
				}),
				cue("comments-original", ".sc-wall-original", 12.98, { x: 20 }),
				...Array.from({ length: 2 }, (_, i) => [
					cue(
						`comment-face-${i}`,
						".sc-wall-note > .if-face",
						13.22 + i * 0.24,
						{ scale: 0.55 },
						{ index: i, sound: "release" },
					),
					cue(
						`comment-copy-${i}`,
						".sc-wall-note > span:not(.if-face)",
						13.34 + i * 0.24,
						{ y: 20 },
						{ index: i },
					),
				]).flat(),
				cue(
					"comment-input",
					".sc-wall-comment-dock input",
					13.92,
					{ y: 24, scale: 0.94 },
					{ sound: "release" },
				),
				cue(
					"comment-send",
					".sc-wall-comment-dock button",
					14.12,
					{ y: 24, scale: 0.65 },
					{ sound: "release" },
				),
			],
		},
		{
			after: "post-comment",
			cues: [
				cue(
					"new-comment-face",
					".sc-wall-note:last-child > .if-face",
					18.55,
					{ scale: 0.55 },
					{ sound: "release" },
				),
				cue(
					"new-comment-copy",
					".sc-wall-note:last-child > span:not(.if-face)",
					18.68,
					{
						y: 24,
					},
				),
			],
		},
		{
			after: "visit-profile",
			cues: [
				cue(
					"profile-surface",
					".if-inspect.is-open",
					25.55,
					{},
					{ surface: true, sound: null },
				),
				cue(
					"profile-close",
					".if-inspect-close",
					25.61,
					{ scale: 0.65, rotate: -25 },
					{ sound: "release" },
				),
				cue("profile-label", ".sc-wall-inspect > .sc-wall-label", 25.72, {
					y: 18,
				}),
				cue(
					"profile-face",
					".sc-wall-face > .if-face",
					25.87,
					{ scale: 0.45 },
					{ sound: "release", volume: 0.2 },
				),
				cue("profile-name", ".sc-wall-face > b", 26.04, { x: 22 }),
				cue("profile-role", ".sc-wall-face > i", 26.17, { y: 17 }),
				cue("profile-context", ".sc-wall-inspect > p:last-child", 26.34, {
					y: 22,
				}),
			],
		},
	],
	inspect(root) {
		return {
			liked: [
				...root.querySelectorAll(
					'.sc-wall-actions button[aria-pressed="true"]',
				),
			].map((el) => ({
				label: el.getAttribute("aria-label"),
				count: el.textContent.trim(),
			})),
			selectedPost: [...root.querySelectorAll(".sc-wall-card")].findIndex(
				(el) => el.classList.contains("is-on"),
			),
			inspector:
				root.querySelector(".if-inspect.is-open")?.getAttribute("aria-label") ??
				null,
			comments: [
				...root.querySelectorAll(".sc-wall-note > span:not(.if-face)"),
			].map((el) => el.textContent.trim()),
			commentCount: root
				.querySelector(`${hero} .sc-wall-actions > button:last-child`)
				?.textContent.trim(),
		};
	},
};
