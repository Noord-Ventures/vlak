import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { AgentsBoard } from "../../app/interfaces/agents/board";
import { createAgentController, agentFilmEvents } from "./controller.mjs";

// The interface and its paint come directly from the site. Film code controls
// the camera, reversible motion on actual elements, and external title cards.
const width = 1180;
const height = 772;
const density = 3;
const clamp = (v) => Math.max(0, Math.min(1, v));
const mix = (a, b, p) => a + (b - a) * p;
const ease = (v) => {
	const p = clamp(v);
	return p ** 3 * (p * (p * 6 - 15) + 10);
};
const spring = (v) => {
	const p = Math.max(0, v);
	return 1 - Math.exp(-7.8 * p) * (Math.cos(10 * p) + 0.4 * Math.sin(10 * p));
};
const viewScale = () => innerWidth / 1920;
const host = document.getElementById("agent-interface");
const camera = document.getElementById("agent-camera");
const world = document.getElementById("world");
const root = createRoot(host);
const changed = new Map();
let generation = 0;
let lastTime = 0;
let lastPose = null;
let controller;

async function remount() {
	flushSync(() => root.render(<AgentsBoard key={generation++} />));
}

function modify(element, values) {
	if (!element) return;
	if (!changed.has(element)) changed.set(element, {});
	const original = changed.get(element);
	for (const [key, value] of Object.entries(values)) {
		if (!(key in original)) original[key] = element.style[key];
		element.style[key] = value;
	}
}

function resetMotion() {
	for (const [element, values] of changed) {
		for (const [key, value] of Object.entries(values))
			element.style[key] = value;
	}
	changed.clear();
}

function flight(element, time, start, { x = 0, y = 8, scale = 0.99 } = {}) {
	if (!element || time > start + 1.25) return;
	const p = spring(time - start);
	modify(element, {
		opacity: String(ease((time - start) / 0.24)),
		transformOrigin: "50% 50%",
		transform: `translate(${(1 - p) * x}px,${(1 - p) * y}px) scale(${mix(scale, 1, p)})`,
	});
}

function parts(selector, time, start, stagger = 0.075, motion) {
	host.querySelectorAll(selector).forEach((element, index) => {
		flight(element, time, start + index * stagger, motion);
	});
}

function nodeRect(selector, fallback) {
	const element = host.querySelector(selector);
	if (!element) return fallback;
	const rect = element.getBoundingClientRect();
	const scale = viewScale();
	return {
		x: rect.x / scale,
		y: rect.y / scale,
		width: rect.width / scale,
		height: rect.height / scale,
	};
}

function interpolate(a, b, time, start, end) {
	const p = ease((time - start) / (end - start));
	return Object.fromEntries(
		Object.keys(a).map((key) => [key, mix(a[key], b[key], p)]),
	);
}

function cameraPose(time) {
	const selected = nodeRect('.am-task[aria-current="true"]', {
		x: 0,
		y: 312,
		width: 279,
		height: 100,
	});
	const hero = {
		x: selected.x + selected.width / 2,
		y: selected.y + selected.height / 2,
		scale: 2.8,
		screenY: 545,
		cropLeft: selected.x,
		cropTop: selected.y,
		cropRight: width - selected.x - selected.width,
		cropBottom: height - selected.y - selected.height,
	};
	const fullBoard = { cropLeft: 0, cropTop: 0, cropRight: 0, cropBottom: 0 };
	const detailPanel = {
		cropLeft: 280,
		cropTop: 148,
		cropRight: 0,
		cropBottom: 30,
	};
	const overview = {
		x: width / 2,
		y: height / 2,
		scale: 1.1,
		screenY: 574,
		...fullBoard,
	};
	const detail = { x: 730, y: 446, scale: 1.48, screenY: 555, ...detailPanel };
	const form = { x: 730, y: 395, scale: 1.62, screenY: 570, ...detailPanel };
	const ending = {
		x: width / 2,
		y: height / 2,
		scale: 1.04,
		screenY: 635,
		...fullBoard,
	};
	if (time < 5) return interpolate(hero, overview, time, 2.05, 4.55);
	if (time < 12.8) return interpolate(overview, detail, time, 5, 6.1);
	if (time < 14.7) return interpolate(detail, overview, time, 12.8, 14.05);
	if (time < 18.75) return interpolate(overview, detail, time, 14.7, 15.7);
	if (time < 20.2) return interpolate(detail, overview, time, 18.75, 19.75);
	if (time < 24.65) return interpolate(overview, form, time, 20.2, 20.95);
	if (time < 27.2) return interpolate(form, detail, time, 24.65, 25.5);
	return interpolate(detail, ending, time, 27.2, 29.15);
}

function introductoryMotion(time) {
	if (time > 4.5) return;
	const hero = host.querySelector('.am-task[aria-current="true"]');
	flight(hero, time, 0.18, { y: 0, scale: 0.96 });
	parts(".am-header", time, 2.12, 0, { y: -8 });
	parts(".am-summary", time, 2.22, 0, { y: 0, scale: 1 });
	parts(".am-summary-card", time, 2.25, 0.075, { y: 6 });
	parts(".am-queue-controls", time, 2.4, 0, { y: 0, x: -12 });
	host.querySelectorAll(".am-task").forEach((row, index) => {
		if (row !== hero)
			flight(row, time, 2.47 + index * 0.09, { x: -18, y: 0, scale: 0.99 });
	});
	modify(host.querySelector(".am-detail"), {
		opacity: String(ease((time - 2.4) / 0.3)),
	});
	parts(".am-detail-head", time, 2.65, 0, { x: 8, y: 0 });
	parts(".am-brief", time, 2.78);
	parts(".am-view-controls", time, 2.86);
	parts(".am-activity li", time, 2.98, 0.085, { y: 6 });
	parts(".am-detail-actions", time, 3.3, 0, { y: 6 });
	parts(".am-footer,.am-queue-count", time, 3.4, 0.06, { y: 0 });
}

function stateMotion(time) {
	if (time >= 6.4 && time < 8)
		parts(".am-output-heading,.am-output-file", time, 6.42, 0.1, { y: 7 });
	if (time >= 10.7 && time < 12.1)
		parts(".am-detail-actions > *", time, 10.72, 0.04, { y: 3, scale: 0.97 });
	if (time >= 14.3 && time < 15.95) {
		parts(".am-detail-head", time, 14.32, 0, { x: 8, y: 0 });
		parts(".am-brief,.am-view-controls", time, 14.4, 0.08);
		parts(".am-activity li", time, 14.57, 0.07, { y: 6 });
		parts(".am-detail-actions", time, 14.92, 0, { y: 4 });
	}
	for (const start of [16.41, 18.01, 26.12]) {
		if (time >= start - 0.01 && time < start + 1.2)
			parts(".am-activity li:first-child", time, start, 0, { y: 5 });
	}
	if (time >= 20 && time < 21.6) {
		parts(".am-compose-heading", time, 20.02, 0, { y: 6 });
		parts(".am-compose-fields > *", time, 20.1, 0.085, { y: 8 });
		parts(".am-compose-actions", time, 20.4, 0, { y: 6 });
	}
	if (time >= 25.1 && time < 26.5) {
		flight(host.querySelector('.am-task[aria-current="true"]'), time, 25.12, {
			x: -14,
			y: 0,
		});
		parts(
			".am-detail-head,.am-brief,.am-view-controls,.am-activity li",
			time,
			25.12,
			0.07,
			{ y: 5 },
		);
	}
	for (const event of agentFilmEvents) {
		if (event.kind !== "click") continue;
		const d = time - (event.time - 0.18);
		if (d < 0 || d >= 0.18) continue;
		const target = [...host.querySelectorAll(event.selector)].find(
			(element) => {
				if (event.taskId)
					return (
						element.querySelector(".am-task-number")?.textContent.trim() ===
						event.taskId
					);
				const label = (
					element.getAttribute("aria-label") || element.textContent
				)
					.replace(/\s+/g, " ")
					.trim();
				return event.id === "show-output"
					? /^Output\s*\d*$/.test(label)
					: label === event.label;
			},
		);
		const p = ease(d / 0.18);
		modify(target, {
			transformOrigin: "center",
			transform: `scale(${1 - p * 0.024})`,
		});
	}
}

async function step(frame) {
	const time = frame / 30;
	resetMotion();
	await controller.step(time);
	world.style.transform = `scale(${viewScale()})`;
	// Read geometry in logical interface pixels, before the film camera moves.
	camera.style.transform = `scale(${1 / density})`;
	const pose = cameraPose(time);
	introductoryMotion(time);
	stateMotion(time);
	// The film aperture follows the native panel edges, so close-ups never
	// leave fragments of neighbouring labels along the edge of the frame.
	host.style.clipPath = `inset(${pose.cropTop}px ${pose.cropRight}px ${pose.cropBottom}px ${pose.cropLeft}px)`;
	camera.style.transform = `translate(960px,${pose.screenY}px) scale(${pose.scale / density}) translate(${-pose.x * density}px,${-pose.y * density}px)`;
	const final = ease((time - 28.45) / 0.75);
	document.getElementById("film-name").style.opacity = String(
		ease(time / 0.5) * (1 - ease((time - 1.85) / 0.65)),
	);
	const wordmark = document.getElementById("film-wordmark");
	wordmark.style.opacity = String(final);
	wordmark.style.transform = `translateY(${(1 - spring(time - 28.55)) * 20}px)`;
	document.getElementById("film-path").style.opacity = String(final);
	lastTime = time;
	lastPose = pose;
	await new Promise((resolve) => requestAnimationFrame(resolve));
}

async function initialise() {
	await remount();
	controller = createAgentController(host, { remount });
	await document.fonts.ready;
	await step(0);
	window.film = {
		ready: true,
		step,
		stats: {
			source: "apps/www/app/interfaces/agents/board.tsx",
			exactInterface: true,
			originalStylesheet: true,
			screenshotPlates: 0,
			handDrawnControls: 0,
			liveAgentBackend: false,
			componentCount: 7,
			featured: [
				"Button",
				"Card",
				"Icon",
				"Input",
				"Progress",
				"Textarea",
				"ToggleGroup",
			],
			events: agentFilmEvents,
		},
		inspect: () => ({
			time: lastTime,
			camera: lastPose,
			...controller.inspect(),
		}),
		dispose: () => root.unmount(),
	};
}

initialise().catch((error) => {
	window.film = { ready: false, error: error.stack ?? String(error) };
});
