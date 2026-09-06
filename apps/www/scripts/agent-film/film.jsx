import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { AgentsBoard } from "../../app/interfaces/agents/board";
import { createAgentController, agentFilmEvents } from "./controller.mjs";
import { collectAgentParts, independentAgentParts } from "./parts.mjs";
import { actionTimes as at, motionCues, filmDuration } from "./timeline.mjs";
import { createBrowserFrame } from "../interface-films/browser-frame.jsx";

// The actual AgentsBoard DOM supplies every surface, icon, label and control.
// Film-only visibility, framing and reversible transforms provide the motion.
const width = 1180,
	height = 772,
	density = 3;
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
const host = document.getElementById("agent-interface"),
	camera = document.getElementById("agent-camera"),
	world = document.getElementById("world");
const root = createRoot(host),
	changed = new Map();
const browserFrame = createBrowserFrame({
	world,
	camera,
	host,
	slug: "agents",
	title: "Agent management",
	width,
	height,
	density,
});
let generation = 0,
	lastTime = 0,
	lastPose = null,
	lastInventory = null,
	controller;
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
	for (const [element, values] of changed)
		for (const [key, value] of Object.entries(values))
			element.style[key] = value;
	changed.clear();
}
function matches(cue) {
	const elements = [...host.querySelectorAll(cue.selector)];
	return cue.index === undefined
		? elements
		: elements.slice(cue.index, cue.index + 1);
}
function applyCue(cue, time) {
	const elapsed = time - cue.start,
		p = elapsed > 1.3 ? 1 : spring(elapsed),
		{ x, y, scale, rotate } = cue.from;
	const surfaceOnly = x === 0 && y === 0 && scale === 1 && rotate === 0;
	for (const element of matches(cue)) {
		modify(element, {
			visibility: elapsed >= 0 ? "visible" : "hidden",
			// Parent opacity would erase children that arrive before the rule.
			opacity: surfaceOnly ? "1" : String(ease(elapsed / 0.14)),
			transformOrigin: "50% 50%",
			transform: `translate(${(1 - p) * x}px,${(1 - p) * y}px) rotate(${(1 - p) * rotate}deg) scale(${mix(scale, 1, p)})`,
		});
		if (cue.id.includes("progress-track") || cue.id.includes("progress-fill"))
			modify(element, {
				transformOrigin: "0 50%",
				transform: `scaleX(${clamp(p)})`,
			});
	}
}
function phase(name, time) {
	for (const cue of motionCues) if (cue.phase === name) applyCue(cue, time);
}
function interpolate(a, b, time, start, end) {
	const p = ease((time - start) / (end - start));
	return Object.fromEntries(
		Object.keys(a).map((key) => [key, mix(a[key], b[key], p)]),
	);
}
function cameraPose(time) {
	const full = { cropLeft: 0, cropTop: 0, cropRight: 0, cropBottom: 0 },
		panel = { cropLeft: 280, cropTop: 148, cropRight: 0, cropBottom: 30 };
	const wide = {
		x: width / 2,
		y: height / 2,
		scale: 1.14,
		screenY: 560,
		...full,
	};
	const detail = { x: 730, y: 446, scale: 1.48, screenY: 555, ...panel },
		form = { x: 730, y: 395, scale: 1.62, screenY: 570, ...panel };
	const ending = {
		x: width / 2,
		y: height / 2,
		scale: 1,
		screenY: 648,
		...full,
	};
	if (time < 14.8) return interpolate(wide, detail, time, 8.2, 9.25);
	if (time < 16.5) return interpolate(detail, wide, time, 14.8, 15.6);
	if (time < 21.5) return interpolate(wide, detail, time, 16.5, 17.6);
	if (time < 23.15) return interpolate(detail, wide, time, 21.5, 22.45);
	if (time < 28.35) return interpolate(wide, form, time, 23.15, 24.2);
	if (time < 33) return interpolate(form, wide, time, 28.35, 29.12);
	return interpolate(wide, ending, time, 33, 35.5);
}
function intro(time, inventory) {
	if (time >= 8.15) return;
	modify(inventory.board, { visibility: "hidden", overflow: "visible" });
	for (const el of host.querySelectorAll(".am-queue-list,.am-detail-scroll"))
		modify(el, { overflow: "visible" });
	phase("intro", time);
	const hero = host.querySelector('.am-task[aria-current="true"]'),
		dock = ease((time - 2.25) / 1.25),
		birth = spring(time - 0.15);
	// Build one task at reading size, then dock it into its original queue slot.
	modify(hero, {
		transform: `translate(${450.5 * (1 - dock)}px,${-25 * (1 - dock)}px) rotate(${(1 - birth) * -3}deg) scale(${mix(2.55, 1, dock) * mix(0.72, 1, birth)})`,
		transformOrigin: "50% 50%",
	});
}
function exit(time, start, end, groups, inventory) {
	if (time < start || time >= end) return;
	const items = independentAgentParts(
		inventory.parts.filter(
			(p) =>
				groups.includes(p.group) &&
				p.id !== "form/queue" &&
				p.id !== "form/cancel",
		),
	);
	for (const [i, part] of items.entries()) {
		const p = ease((time - start - i * 0.002) / (end - start - i * 0.002));
		modify(part.element, {
			opacity: String(1 - p),
			transform: `translateY(${-22 * p}px) scale(${1 - 0.02 * p})`,
		});
	}
}
function surroundings(time) {
	let opacity = 1;
	if (time >= 8.02 && time < 15.6) opacity = 1 - ease((time - 8.02) / 0.18);
	else if (time < 15.8 && time >= 15.6) opacity = ease((time - 15.6) / 0.2);
	else if (time >= 16.15 && time < 22.45)
		opacity = 1 - ease((time - 16.15) / 0.3);
	else if (time >= 22.45 && time < 22.65) opacity = ease((time - 22.45) / 0.2);
	else if (time >= 23 && time < 29.12) opacity = 1 - ease((time - 23) / 0.15);
	else if (time >= 29.12 && time < 29.32) opacity = ease((time - 29.12) / 0.2);
	if (time < 8.02) return;
	// Fade surrounding panels before a close-up crops their labels. They return
	// only when the whole panel is back inside the frame.
	for (const el of host.querySelectorAll(
		".am-header,.am-summary,.am-queue,.am-footer",
	))
		modify(el, { opacity: String(opacity) });
}
function reactions(time, start, mode) {
	if (time < start || time > start + 1.2) return;
	const p = spring(time - start),
		nudge = (1 - p) * 18;
	for (const el of host.querySelectorAll(
		".am-summary-card > strong,.am-detail-topline .am-status-mark",
	))
		modify(el, {
			transform: `translateY(${-nudge}px) scale(${1 + (1 - p) * 0.15})`,
			transformOrigin: "center",
		});
	if (mode === "activity")
		host.querySelectorAll(".am-activity li:not(:first-child)").forEach((el) => {
			modify(el, { transform: `translateY(${-30 * (1 - p)}px)` });
		});
}
function stateMotion(time, inventory) {
	if (time >= at.output && time < 11.7) phase("output", time);
	if (time >= at.approve && time < 15) {
		phase("approved", time);
		reactions(time, at.approve, "status");
	}
	if (time >= at.select && time < 18.5) phase("selected", time);
	if (time >= at.pause && time < 20) {
		phase("paused", time);
		reactions(time, at.pause, "activity");
	}
	if (time >= at.resume && time < 21.5) {
		phase("resumed", time);
		reactions(time, at.resume, "activity");
	}
	if (time >= at.compose && time < 25.9) phase("form", time);
	if (time >= at.queue && time < at.start) phase("queued", time);
	if (time >= at.start && time < 33) {
		phase("started", time);
		reactions(time, at.start, "activity");
	}
	exit(time, 9.25, at.output, ["activity"], inventory);
	exit(time, 15.65, at.select, ["detail", "output", "actions"], inventory);
	exit(
		time,
		22.65,
		at.compose,
		["detail", "activity", "actions", "progress"],
		inventory,
	);
	exit(time, 29.25, at.queue, ["form"], inventory);
	if (time >= 29.15 && time < at.queue) {
		const p = ease((time - 29.15) / (at.queue - 29.15));
		for (const row of host.querySelectorAll(".am-task"))
			modify(row, { transform: `translateY(${100 * p}px)` });
	}
	for (const event of agentFilmEvents) {
		if (event.kind !== "click") continue;
		const d = time - (event.time - 0.18);
		if (d < 0 || d >= 0.18) continue;
		const target = [...host.querySelectorAll(event.selector)].find((el) => {
			if (event.taskId)
				return (
					el.querySelector(".am-task-number")?.textContent.trim() ===
					event.taskId
				);
			const label = (el.getAttribute("aria-label") || el.textContent)
				.replace(/\s+/g, " ")
				.trim();
			return event.id === "show-output"
				? /^Output\s*\d*$/.test(label)
				: label === event.label;
		});
		modify(target, {
			transform: `scale(${1 - ease(d / 0.18) * 0.035})`,
			transformOrigin: "center",
		});
	}
}
async function step(frame) {
	const time = frame / 30;
	resetMotion();
	await controller.step(time);
	world.style.transform = `scale(${innerWidth / 1920})`;
	camera.style.transform = `scale(${1 / density})`;
	const inventory = collectAgentParts(host),
		pose = cameraPose(time);
	const browserEnding = ease((time - 33) / 2.5);
	const viewport = browserFrame.layout({
		time,
		scale: mix(1.14, 1, browserEnding),
		screenY: mix(560, 648, browserEnding),
	});
	intro(time, inventory);
	stateMotion(time, inventory);
	surroundings(time);
	host.style.clipPath =
		time < 8.15
			? "none"
			: `inset(${pose.cropTop}px ${pose.cropRight}px ${pose.cropBottom}px ${pose.cropLeft}px)`;
	camera.style.transform = `translate(${960 - viewport.left}px,${pose.screenY - viewport.top}px) scale(${pose.scale / density}) translate(${-pose.x * density}px,${-pose.y * density}px)`;
	document.getElementById("film-name").style.display = "none";
	const wordmark = document.getElementById("film-wordmark");
	wordmark.style.opacity = String(ease((time - 36) / 0.4));
	wordmark.style.transform = `translateY(${(1 - spring(time - 36)) * 80}px)`;
	document.getElementById("film-path").style.opacity = String(
		ease((time - 36.25) / 0.5),
	);
	lastTime = time;
	lastPose = pose;
	lastInventory = inventory;
	await new Promise((resolve) => requestAnimationFrame(resolve));
}
async function initialise() {
	await remount();
	controller = createAgentController(host, { remount });
	await document.fonts.ready;
	await step(0);
	window[window.agentFilmTarget ?? "film"] = {
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
			individualMotionLayers: motionCues.length,
			filmDuration,
			events: agentFilmEvents,
			browserFrame: browserFrame.inspect(),
		},
		inspect: () => ({
			time: lastTime,
			camera: lastPose,
			browserFrame: browserFrame.inspect(),
			nativeParts: lastInventory.parts.length,
			...controller.inspect(),
		}),
		dispose: () => {
			root.unmount();
			browserFrame.dispose();
		},
	};
}
initialise().catch((error) => {
	window[window.agentFilmTarget ?? "film"] = {
		ready: false,
		error: error.stack ?? String(error),
	};
});
