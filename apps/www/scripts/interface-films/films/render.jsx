import { RenderBoard } from "../../../app/interfaces/concepts/render";

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
			"mesh-control",
			'.rw-tools button[aria-label="Show mesh"]',
			0.15,
			{ scale: 0.65, rotate: -8 },
			"press",
			0.3,
		),
		surface: true,
	},
	part(
		"mesh-icon",
		'.rw-tools button[aria-label="Show mesh"] .rs-icon',
		0.55,
		{ scale: 0.15, rotate: -80 },
		"release",
		0.2,
	),
	part(
		"rotate-control",
		'.rw-tools button[aria-label="Auto-rotate model"]',
		0.82,
		{ y: -50, scale: 0.72 },
		"release",
		0.18,
	),
	part(
		"camera-control",
		'.rw-tools button[aria-label="Reset camera"]',
		1.1,
		{ y: 50, scale: 0.72 },
		"release",
		0.18,
	),
	part("project-name", ".rw-project strong", 2.4, {
		x: -55,
	}),
	part("mesh-count", ".rw-footer > span:first-child", 2.65, { x: 45 }),
	{
		...part(
			"live-vehicle",
			".rw-vehicle-viewport",
			3.15,
			{ y: 25, scale: 0.97 },
			"press",
			0.22,
		),
		surface: true,
	},
	part(
		"view-label",
		".rw-view-label > strong",
		3.34,
		{ y: -24 },
		"tick",
		0.12,
		0,
	),
	part(
		"shading-label",
		".rw-view-label > span",
		3.48,
		{ x: 35 },
		"tick",
		0.12,
		0,
	),
	part(
		"turntable-control",
		".rw-transport > button",
		3.7,
		{ scale: 0.6 },
		"release",
		0.18,
	),
	part(
		"turntable-label",
		".rw-transport > div > strong",
		3.87,
		{ x: -25 },
		"tick",
		0.1,
		0,
	),
	part(
		"turntable-status",
		".rw-transport > div > span",
		4.02,
		{ x: 25 },
		"tick",
		0.1,
		0,
	),
	part("material-label", ".rs-property-grid-label", 5.42, { x: -28 }),
	part(
		"material-control",
		".rs-property-grid select",
		5.65,
		{ y: 24, scale: 0.9 },
		"release",
		0.2,
	),
	part("inspector-guidance", ".rw-inspector-scroll > .rw-panel-copy", 6.1, { y: 22 }, null, 0),
];
for (let i = 0; i < 3; i++) {
	intro.push(
		part(
			`tree-item-${i}`,
			'.rs-tree-view [role="treeitem"]',
			3.7 + i * 0.2,
			{ x: 60 },
			"tick",
			0.14,
			i,
		),
	);
	intro.push(
		part(
			`model-property-label-${i}`,
			".rw-model-facts dt",
			4.45 + i * 0.2,
			{ x: -20 },
			"tick",
			0.1,
			i,
		),
	);
	intro.push(
		part(
			`model-property-value-${i}`,
			".rw-model-facts dd",
			4.55 + i * 0.2,
			{ y: 18 },
			"release",
			0.13,
			i,
		),
	);
}

export default {
	slug: "render",
	title: "3D workspace",
	Component: RenderBoard,
	props: {},
	rootSelector: ".rw",
	width: 1180,
	height: 772,
	duration: 40,
	theme: "dark",
	reducedMotion: "no-preference",
	settleMs: 150,
	hero: {
		selector: '.rw-tools button[aria-label="Show mesh"]',
		scale: 3.2,
	},
	intro,
	shots: [
		{ start: 9, end: 14.2, selector: ".rw-viewport", scale: 1.22 },
		{ start: 15, end: 18.8, selector: ".rs-property-grid", scale: 1.8 },
		{ start: 19.3, end: 21.9, selector: ".rw-inspector", scale: 1.18 },
		{ start: 22.8, end: 31.5, selector: ".rw-viewport", scale: 1.22 },
	],
	actions: [
		{
			id: "show-mesh",
			time: 9.5,
			kind: "click",
			selector: '.rw-tools button[aria-label="Show mesh"]',
			label: "Show mesh",
			sound: "toggle",
			assert: { selector: ".rw-view-label", text: "Mesh view" },
		},
		{
			id: "shade-model",
			time: 13,
			kind: "click",
			selector: '.rw-tools button[aria-label="Show mesh"]',
			label: "Show mesh",
			sound: "toggle",
			assert: { selector: ".rw-view-label", text: "Line drawing" },
		},
		{
			id: "graphite-finish",
			time: 16,
			kind: "select",
			selector: 'select[aria-label="Line treatment"]',
			value: "graphite",
			sound: "release",
			assert: {
				selector:
					'select[aria-label="Line treatment"] option[value="graphite"]:checked',
			},
		},
		{
			id: "inspect-viewport",
			time: 20,
			kind: "click",
			selector: '[role="treeitem"][aria-label="Viewport"]',
			label: "Viewport",
			sound: "page",
			assert: {
				selector: '.rs-property-grid [role="switch"][aria-label="Auto-rotate"]',
			},
		},
		{
			id: "start-turntable",
			time: 23.5,
			kind: "click",
			selector: '.rw-tools button[aria-label="Auto-rotate model"]',
			label: "Auto-rotate model",
			sound: "toggle",
			assert: { selector: ".rw-transport", text: "Automatic orbit enabled" },
		},
		{
			id: "pause-turntable",
			time: 27,
			kind: "click",
			selector: '.rw-transport button[aria-label="Pause turntable"]',
			label: "Pause turntable",
			sound: "toggle",
			assert: { selector: ".rw-transport", text: "Manual orbit" },
		},
		{
			id: "reset-camera",
			time: 30.2,
			kind: "click",
			selector: '.rw-tools button[aria-label="Reset camera"]',
			label: "Reset camera",
			sound: "release",
			assert: { selector: '.rw-vehicle-viewport[data-viewer-status="ready"]' },
		},
	],
	rebuilds: [
		{
			after: "inspect-viewport",
			cues: [
				part(
					"mesh-property-label",
					".rs-property-grid-label",
					20.05,
					{ x: -28 },
					"tick",
					0.14,
					0,
				),
				part(
					"mesh-property-switch",
					'.rs-property-grid [role="switch"]',
					20.19,
					{ x: 34, scale: 0.75 },
					"release",
					0.18,
					0,
				),
				part(
					"rotation-property-label",
					".rs-property-grid-label",
					20.33,
					{ x: -28 },
					"tick",
					0.14,
					1,
				),
				part(
					"rotation-property-switch",
					'.rs-property-grid [role="switch"]',
					20.47,
					{ x: 34, scale: 0.75 },
					"release",
					0.18,
					1,
				),
			],
		},
	],
	async ready(root) {
		const deadline = Date.now() + 50000;
		while (Date.now() < deadline) {
			const viewer = root.querySelector(".rw-vehicle-viewport");
			if (viewer?.dataset.viewerStatus === "error")
				throw new Error(
					"The local vehicle model failed to load. A working WebGL context is required; do not capture an unavailable-model frame.",
				);
			if (viewer?.dataset.viewerStatus === "ready") {
				// Establish a stable view of the loaded licensed geometry.
				root
					.querySelector('.rw-transport button[aria-label="Pause turntable"]')
					?.click();
				// Let the paused camera and control state settle before recording.
				await new Promise((resolve) => setTimeout(resolve, 150));
				if (viewer.dataset.viewerStatus !== "ready")
					throw new Error("Vehicle viewer became unavailable during warm-up");
				return;
			}
			await new Promise((resolve) => setTimeout(resolve, 100));
		}
		throw new Error(
			"Local vehicle model readiness timed out after 50 seconds",
		);
	},
	inspect(root) {
		return {
			viewerStatus: root.querySelector(".rw-vehicle-viewport")?.dataset
				.viewerStatus,
			modelUrl: root.querySelector(".rw-vehicle-canvas")?.dataset.modelUrl,
			triangles: root.querySelector(".rw-vehicle-canvas")?.dataset.triangles,
			mesh: root
				.querySelector('.rw-tools button[aria-label="Show mesh"]')
				?.getAttribute("aria-pressed"),
			turntable: root.querySelector(".rw-transport")?.textContent.trim(),
			inspector: root
				.querySelector('[role="treeitem"][aria-selected="true"]')
				?.getAttribute("aria-label"),
			material: root.querySelector('select[aria-label="Line treatment"]')?.value,
			renderer: root.querySelector(".rw-vehicle-canvas")?.dataset.renderer,
		};
	},
};
