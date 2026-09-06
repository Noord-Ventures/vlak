import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import config from "film:config";

// Paint and state belong to the original board. This transport only supplies
// reversible motion, a camera, and deterministic native input events.
const host = document.getElementById("film-interface");
const camera = document.getElementById("film-camera");
const world = document.getElementById("world");
const root = createRoot(host);
const width = config.width ?? 1180,
	height = config.height ?? 772,
	density = 3;
const clamp = (v) => Math.max(0, Math.min(1, v));
const mix = (a, b, p) => a + (b - a) * p;
const ease = (v) => {
	const p = clamp(v);
	return p * p * p * (p * (p * 6 - 15) + 10);
};
const spring = (t) => {
	const p = Math.max(0, t);
	return 1 - Math.exp(-7.8 * p) * (Math.cos(10 * p) + 0.4 * Math.sin(10 * p));
};
const contact = (Math.PI / 2 + Math.atan(0.4)) / 10;
const changed = new Map(),
	events = [],
	sounds = new Map(),
	warnings = new Set();
const real = {
	timeout: window.setTimeout.bind(window),
	clearTimeout: window.clearTimeout.bind(window),
	interval: window.setInterval.bind(window),
	clearInterval: window.clearInterval.bind(window),
	now: Date.now,
};
let time = 0,
	last = -1,
	generation = 0,
	actionIndex = 0,
	timerId = 1000000,
	board,
	heroRect,
	animationClock = new WeakMap();
const timers = new Map();
const raf = () => new Promise((resolve) => requestAnimationFrame(resolve));
const actions = config.actions
	.flatMap((action) => {
		if (action.kind !== "type") return [action];
		return Array.from(action.value, (_, i) => ({
			...action,
			id: `${action.id}/${i}`,
			time: mix(
				action.time,
				action.end ?? action.time + 1,
				(i + 1) / action.value.length,
			),
			kind: "input",
			value: action.value.slice(0, i + 1),
			sound: i % 3 === 0 ? "tick" : null,
			volume: 0.045,
		}));
	})
	.sort((a, b) => a.time - b.time);
function matches(cue, scope = host) {
	let elements = [...scope.querySelectorAll(cue.selector)];
	if (cue.label !== undefined)
		elements = elements.filter((el) =>
			[el.getAttribute("aria-label"), el.textContent].some(
				(v) => v?.replace(/\s+/g, " ").trim() === cue.label,
			),
		);
	return cue.index === undefined
		? elements
		: elements.slice(cue.index, cue.index + 1);
}
function modify(el, values) {
	if (!el) return;
	if (!changed.has(el)) changed.set(el, {});
	const original = changed.get(el);
	for (const [key, value] of Object.entries(values)) {
		if (!(key in original)) original[key] = el.style[key];
		el.style[key] = value;
	}
}
function resetMotion() {
	for (const [el, values] of changed)
		for (const [key, value] of Object.entries(values)) el.style[key] = value;
	changed.clear();
}
function restoreClock() {
	window.setTimeout = real.timeout;
	window.clearTimeout = real.clearTimeout;
	window.setInterval = real.interval;
	window.clearInterval = real.clearInterval;
	Date.now = real.now;
	timers.clear();
}
function filmClock() {
	Date.now = () => 1788652800000 + Math.round(time * 1000);
	window.setTimeout = (fn, ms = 0, ...args) => {
		const id = timerId++;
		timers.set(id, {
			at: time + Math.max(0, ms) / 1000,
			fn: () => fn(...args),
		});
		return id;
	};
	window.clearTimeout = (id) => {
		timers.delete(id);
		real.clearTimeout(id);
	};
	window.setInterval = (fn, ms = 0, ...args) => {
		const id = timerId++;
		timers.set(id, {
			at: time + Math.max(1, ms) / 1000,
			interval: Math.max(1, ms) / 1000,
			fn: () => fn(...args),
		});
		return id;
	};
	window.clearInterval = (id) => {
		timers.delete(id);
		real.clearInterval(id);
	};
}
async function advanceTimers(until) {
	let count = 0;
	while (true) {
		const next = [...timers.entries()]
			.filter(([, v]) => v.at <= until + 1e-8)
			.sort((a, b) => a[1].at - b[1].at)[0];
		if (!next) break;
		if (++count > 10000) throw new Error("Runaway native timer");
		const [id, timer] = next;
		time = timer.at;
		timers.delete(id);
		flushSync(timer.fn);
		if (timer.interval) timers.set(id, { ...timer, at: time + timer.interval });
		await Promise.resolve();
	}
	time = until;
}
function rect(el) {
	const a = el.getBoundingClientRect(),
		b = host.getBoundingClientRect(),
		s = b.width / width;
	return {
		x: (a.x - b.x) / s,
		y: (a.y - b.y) / s,
		width: a.width / s,
		height: a.height / s,
	};
}
async function mount() {
	events.length = 0;
	sounds.clear();
	warnings.clear();
	resetMotion();
	restoreClock();
	time = 0;
	actionIndex = 0;
	animationClock = new WeakMap();
	flushSync(() =>
		root.render(<config.Component {...config.props} key={generation++} />),
	);
	await raf();
	await raf();
	board = host.querySelector(config.rootSelector);
	if (!board) throw new Error(`Missing board ${config.rootSelector}`);
	await config.setup?.(board);
	for (const img of host.querySelectorAll("img")) img.loading = "eager";
	await config.ready?.(board);
	await Promise.all(
		[...host.querySelectorAll("img")].map((img) =>
			img.decode().catch(() => {
				throw new Error(`Missing image ${img.src}`);
			}),
		),
	);
	await document.fonts.ready;
	world.style.transform = `scale(${innerWidth / 1920})`;
	camera.style.transform = `scale(${1 / density})`;
	heroRect = rect(matches(config.hero)[0]);
	filmClock();
}
function assertNative(action) {
	if (!action.assert) return;
	const found = matches(action.assert);
	if (
		!found.length ||
		(action.assert.text !== undefined &&
			!found.some((el) => el.textContent.includes(action.assert.text)))
	)
		throw new Error(
			`${config.slug}/${action.id}: native assertion failed: ${JSON.stringify(action.assert)}`,
		);
}
async function act(action) {
	const target = matches(action)[0];
	if (!target)
		throw new Error(
			`${config.slug}/${action.id}: missing ${action.selector} ${action.label ?? ""}`,
		);
	if (target.disabled)
		throw new Error(`${config.slug}/${action.id}: disabled control`);
	const box = target.getBoundingClientRect();
	if (!box.width || !box.height)
		throw new Error(`${config.slug}/${action.id}: hidden control`);
	flushSync(() => {
		if (action.kind === "click") target.click();
		else if (["input", "range", "select"].includes(action.kind)) {
			const proto =
				target instanceof HTMLTextAreaElement
					? HTMLTextAreaElement.prototype
					: target instanceof HTMLSelectElement
						? HTMLSelectElement.prototype
						: HTMLInputElement.prototype;
			Object.getOwnPropertyDescriptor(proto, "value").set.call(
				target,
				String(action.value),
			);
			target.dispatchEvent(
				new InputEvent("input", {
					bubbles: true,
					inputType: "insertText",
					data: String(action.value),
				}),
			);
			target.dispatchEvent(new Event("change", { bubbles: true }));
		} else if (action.kind === "key") {
			target.dispatchEvent(
				new KeyboardEvent("keydown", { key: action.key, bubbles: true }),
			);
			target.dispatchEvent(
				new KeyboardEvent("keyup", { key: action.key, bubbles: true }),
			);
		} else throw new Error(`Unsupported action ${action.kind}`);
	});
	await raf();
	if (action.settleMs ?? config.settleMs)
		await new Promise((resolve) =>
			real.timeout(resolve, action.settleMs ?? config.settleMs),
		);
	document.activeElement?.blur?.();
	assertNative(action);
	if (action.sound)
		sounds.set(`action/${action.id}`, {
			id: action.id,
			time: action.time,
			sound: action.sound,
			volume: action.volume ?? 0.24,
			kind: "native-action",
		});
	events.push({
		id: action.id,
		time: action.time,
		kind: action.kind,
		state: config.inspect?.(board),
	});
}
function audible(cue, el, t) {
	const key = `${cue.phase}/${cue.id}`;
	if (
		!cue.sound ||
		sounds.has(key) ||
		t < cue.start + contact ||
		t > cue.start + 1.4
	)
		return;
	const a = el.getBoundingClientRect(),
		s = getComputedStyle(el);
	if (
		a.width < 1 ||
		a.height < 1 ||
		s.visibility !== "visible" ||
		Number(s.opacity) < 0.8
	)
		return;
	const visible = {
		left: a.left,
		top: a.top,
		right: a.right,
		bottom: a.bottom,
	};
	for (let p = el.parentElement; p; p = p.parentElement) {
		const style = getComputedStyle(p);
		if (Number(style.opacity) < 0.8) return;
		const bounds = p.getBoundingClientRect();
		if (["hidden", "auto", "scroll", "clip"].includes(style.overflowX)) {
			visible.left = Math.max(visible.left, bounds.left);
			visible.right = Math.min(visible.right, bounds.right);
		}
		if (["hidden", "auto", "scroll", "clip"].includes(style.overflowY)) {
			visible.top = Math.max(visible.top, bounds.top);
			visible.bottom = Math.min(visible.bottom, bounds.bottom);
		}
		if (p === host) break;
	}
	if (visible.right - visible.left < 1 || visible.bottom - visible.top < 1)
		return;
	sounds.set(key, {
		id: key,
		time: cue.start + contact,
		sound: cue.sound,
		volume: cue.volume ?? 0.13,
		kind: "component-contact",
	});
}
function cueMotion(cue, t) {
	const elapsed = t - cue.start,
		p = elapsed > 1.3 ? 1 : spring(elapsed),
		from = { x: 0, y: 0, scale: 1, rotate: 0, ...cue.from };
	const stationary =
		from.x === 0 && from.y === 0 && from.scale === 1 && from.rotate === 0;
	const targets = matches(cue);
	if (!targets.length && elapsed >= 0 && elapsed < 0.25)
		warnings.add(`No visible target: ${cue.phase}/${cue.id}: ${cue.selector}`);
	for (const el of targets) {
		const values = { visibility: elapsed >= 0 ? "visible" : "hidden" };
		if (!stationary)
			values.opacity = String(
				Number(getComputedStyle(el).opacity) * ease(elapsed / 0.14),
			);
		if (!stationary)
			Object.assign(values, {
				transformOrigin: "50% 50%",
				transform: `translate(${(1 - p) * from.x}px,${(1 - p) * from.y}px) rotate(${(1 - p) * from.rotate}deg) scale(${mix(from.scale, 1, p)})`,
			});
		modify(el, values);
		audible(cue, el, t);
	}
}
function paint(t) {
	resetMotion();
	const ending = ease((t - 33) / 2.5);
	let scale = mix(1.14, 1.04, ending),
		screenY = mix(560, 635, ending),
		centerX = width / 2,
		centerY = height / 2;
	for (const shot of config.shots ?? []) {
		if (t < shot.start || t >= shot.end) continue;
		const target = matches(shot)[0];
		if (!target) continue;
		const bounds = rect(target);
		if (!bounds.width || !bounds.height) continue;
		const enter = ease((t - shot.start - 0.18) / 0.72),
			leave = ease((shot.end - t - 0.18) / 0.72);
		const outside = actions.filter(
			(action) =>
				action.kind !== "input" &&
				action.time >= shot.start &&
				action.time < shot.end &&
				!matches(action).some((el) => target === el || target.contains(el)),
		);
		const distance = Math.min(
			...outside.map((action) => Math.abs(t - action.time)),
		);
		const p = Math.min(enter, leave, ease((distance - 0.25) / 0.8));
		const desired = Math.min(
			shot.scale ?? 1.55,
			1680 / (bounds.width + 32),
			850 / (bounds.height + 32),
		);
		scale = mix(scale, desired, p);
		centerX = mix(centerX, bounds.x + bounds.width / 2, p);
		centerY = mix(centerY, bounds.y + bounds.height / 2, p);
		// Fade unrelated native branches before the camera approaches an isolated
		// panel. Restore them after it returns, avoiding fragments of clipped text.
		const fade =
			1 -
			Math.min(
				ease((t - shot.start) / 0.18),
				ease((shot.end - t) / 0.18),
				ease((distance - 0.3) / 0.2),
			);
		for (let node = target; node && node !== board; node = node.parentElement) {
			for (const sibling of node.parentElement.children)
				if (sibling !== node) modify(sibling, { opacity: String(fade) });
		}
		const top = Math.max(0, bounds.y - 1),
			right = Math.max(0, width - bounds.x - bounds.width - 1),
			bottom = Math.max(0, height - bounds.y - bounds.height - 1),
			left = Math.max(0, bounds.x - 1);
		modify(host, {
			clipPath: `inset(${top * p}px ${right * p}px ${bottom * p}px ${left * p}px)`,
		});
	}
	world.style.transform = `scale(${innerWidth / 1920})`;
	camera.style.transform = `translate(${960 - centerX * scale}px,${screenY - centerY * scale}px) scale(${scale / density})`;
	if (t < 8.15) {
		modify(board, {
			visibility: t < 3.2 ? "hidden" : "visible",
		});
		// Keep the original board's own backdrop beneath screen-blended artwork.
		// Child branches retain independent reveal timing over that native surface.
		if (t >= 3.2)
			for (const child of board.children)
				modify(child, { visibility: "hidden" });
		if (t < 3.5)
			for (const el of host.querySelectorAll("*")) {
				const style = getComputedStyle(el);
				if (
					!el.matches(".rs-avatar,.if-face") &&
					style.textOverflow !== "ellipsis" &&
					(style.overflow === "hidden" || style.overflow === "auto")
				)
					modify(el, { overflow: "visible" });
			}
		for (const cue of config.intro) cueMotion({ ...cue, phase: "intro" }, t);
		const hero = matches(config.hero)[0],
			dock = ease((t - 2.25) / 1.25),
			birth = spring(t - 0.15);
		const x = (width / 2 - heroRect.x - heroRect.width / 2) * (1 - dock),
			y = (height / 2 - heroRect.y - heroRect.height / 2) * (1 - dock);
		modify(hero, {
			transformOrigin: "50% 50%",
			transform: `translate(${x}px,${y}px) scale(${mix(config.hero.scale ?? 2.4, 1, dock) * mix(0.8, 1, birth)})`,
		});
	}
	for (const rebuild of config.rebuilds ?? []) {
		const action = actions.find((a) => a.id === rebuild.after);
		const start = rebuild.start ?? action?.time ?? 0;
		const next =
			actions.find((a) => a.time > start + 0.001)?.time ?? config.duration;
		const end = Math.min(
			Math.max(...rebuild.cues.map((c) => c.start)) + 1.3,
			next,
		);
		if (t >= start && t < end)
			for (const cue of rebuild.cues)
				cueMotion({ ...cue, phase: rebuild.after }, t);
	}
	// The native button remains visible as the press physically compresses it.
	for (const action of actions) {
		if (action.kind !== "click") continue;
		const d = t - (action.time - 0.18);
		if (d < 0 || d >= 0.18) continue;
		const target = matches(action)[0];
		modify(target, {
			transformOrigin: "50% 50%",
			transform: `scale(${1 - 0.045 * Math.sin((Math.PI * d) / 0.18)})`,
		});
	}
	const name = document.getElementById("film-name"),
		wordmark = document.getElementById("film-wordmark"),
		path = document.getElementById("film-path");
	name.style.opacity = String(ease(t / 0.6) * (1 - ease((t - 32.8) / 0.6)));
	wordmark.style.opacity = path.style.opacity = String(ease((t - 34.1) / 0.75));
	wordmark.style.transform = `translateY(${24 * (1 - ease((t - 34.1) / 0.75))}px)`;
	// Pause original CSS keyframes on film time; component paint is untouched.
	for (const animation of host.getAnimations({ subtree: true })) {
		if (!animationClock.has(animation)) animationClock.set(animation, t);
		animation.pause();
		animation.currentTime =
			Math.max(0, t - animationClock.get(animation)) * 1000;
	}
}
window.film = {
	ready: false,
	error: null,
	config: {
		slug: config.slug,
		title: config.title,
		width,
		height,
		duration: config.duration,
		introCues: config.intro.length,
		actions: actions.length,
	},
	async step(frame) {
		const target = frame / 30;
		if (target < last) {
			await mount();
			events.length = 0;
		}
		resetMotion();
		while (
			actionIndex < actions.length &&
			actions[actionIndex].time <= target + 1e-8
		) {
			const action = actions[actionIndex++];
			await advanceTimers(action.time);
			await act(action);
		}
		await advanceTimers(target);
		paint(target);
		last = target;
		await raf();
	},
	inspect: () => ({
		state: config.inspect?.(board),
		events,
		sounds: [...sounds.values()].sort((a, b) => a.time - b.time),
		warnings: [...warnings],
		images: [...host.querySelectorAll("img")].map((img) => ({
			src: img.getAttribute("src"),
			loaded: img.complete && img.naturalWidth > 0,
		})),
	}),
	dispose: restoreClock,
};
(async () => {
	try {
		document.getElementById("film-name").textContent = config.title;
		document.getElementById("film-path").textContent =
			`/interfaces/${config.slug}`;
		host.style.width = `${width}px`;
		host.style.height = `${height}px`;
		document.documentElement.dataset.theme = config.theme ?? "light";
		await mount();
		await window.film.step(0);
		window.film.ready = true;
	} catch (error) {
		window.film.error = error.stack;
		console.error(error);
	}
})();
