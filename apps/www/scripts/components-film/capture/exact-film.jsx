import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { ExactSpecimen, specimenCatalog } from "./specimens-exact.jsx";
import { applyPlanningMotion } from "./planning-motion.mjs";

// Only the film hosts and motion transforms are authored here. Every visible
// control, label, icon, native input and component border belongs to Vlak.
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const mix = (a, b, p) => a + (b - a) * p;
const ease = (v) => {
	const p = clamp(v);
	return p * p * p * (p * (p * 6 - 15) + 10);
};
const spring = (v) => {
	const p = Math.max(0, v);
	return 1 - Math.exp(-7.8 * p) * (Math.cos(10 * p) + 0.4 * Math.sin(10 * p));
};
const contact = (Math.PI / 2 + Math.atan(0.4)) / 10;
const chapter = {
	switch: 0,
	number: 0,
	range: 0,
	rating: 0,
	waveform: 6,
	playback: 6,
	scrubber: 6,
	multiselect: 12.5,
	tags: 12.5,
	query: 12.5,
	scheduler: 19,
	kanban: 19,
};
const entry = {
	switch: 0,
	number: 2.05,
	range: 3.2,
	rating: 4.1,
	waveform: 6,
	playback: 6.38,
	scrubber: 6.72,
	multiselect: 12.5,
	tags: 13.75,
	query: 15.85,
	scheduler: 19,
	kanban: 22.35,
};
const exit = {
	switch: 6,
	number: 6,
	range: 6,
	rating: 6,
	waveform: 12.5,
	playback: 12.5,
	scrubber: 12.5,
	multiselect: 15.8,
	tags: 16.35,
	query: 19,
	scheduler: 22.6,
	kanban: 26,
};
const overviewWidths = { range: 360, waveform: 360, scrubber: 360, tags: 360 };
const root = createRoot(document.getElementById("world"));
const viewScale = () => innerWidth / 1920;
const modified = new Map();
let lastTime = -1;

function Composition({ time }) {
	return (
		<>
			<div id="film-grid" aria-hidden="true">
				<div id="film-wordmark">Vlak.dev</div>
				<div id="film-grid-note">Components, in motion</div>
				<svg viewBox="0 0 1920 1080">
					{[0, 1, 2, 3, 4].map((i) => (
						<line
							key={"v" + i}
							data-grid-rule={i}
							x1={72 + i * 444}
							x2={72 + i * 444}
							y1="238"
							y2="988"
						/>
					))}
					{[0, 1, 2, 3].map((i) => (
						<line
							key={"h" + i}
							data-grid-rule={i + 5}
							x1="72"
							x2="1848"
							y1={238 + i * 250}
							y2={238 + i * 250}
						/>
					))}
				</svg>
			</div>
			{specimenCatalog.map((spec) => {
				const final = time >= 26;
				const width = final
					? (overviewWidths[spec.id] ?? spec.width)
					: spec.width;
				return (
					<section key={spec.id} data-film-host={spec.id} style={{ width }}>
						<div className="exact-source">
							<ExactSpecimen
								id={spec.id}
								time={Math.max(0, time - chapter[spec.id])}
								overview={final}
							/>
						</div>
					</section>
				);
			})}
			{specimenCatalog.map((spec, index) => (
				<div key={spec.id} className="film-name" data-film-name={spec.id}>
					<span className="film-index">
						{String(index + 1).padStart(2, "0")}
					</span>
					{spec.name}
				</div>
			))}
		</>
	);
}

function modify(element, values) {
	if (!element) return;
	if (!modified.has(element)) modified.set(element, {});
	const saved = modified.get(element);
	for (const [property, value] of Object.entries(values)) {
		if (!(property in saved)) saved[property] = element.style[property];
		element.style[property] = value;
	}
}
function resetMotion() {
	for (const [element, values] of modified)
		for (const [key, value] of Object.entries(values))
			element.style[key] = value;
	modified.clear();
}
function flight(element, time, start, index = 0, amount = 1) {
	if (time < start) {
		modify(element, { opacity: "0" });
		return;
	}
	const p = spring(time - start),
		lift = Math.abs(1 - p);
	modify(element, {
		transformOrigin: "50% 50%",
		transformStyle: "preserve-3d",
		transform: `translate3d(${(1 - p) * (index % 2 ? 8 : -8) * amount}px,${(1 - p) * 12 * amount}px,${lift * (22 + index * 3) * amount}px) rotateX(${(1 - p) * -9}deg) rotateZ(${(1 - p) * (index % 2 ? 2 : -2)}deg)`,
		opacity: String(ease((time - start) / 0.13)),
	});
}
function parts(host, selector, time, start, stagger = 0.045, amount = 1) {
	host.querySelectorAll(selector).forEach((element, i) => {
		flight(element, time, start + i * stagger, i, amount);
	});
}

function place(id, time, height) {
	if (id === "switch") {
		const p = ease((time - 2.2) / 1.4);
		return { x: mix(960, 480, p), y: mix(475, 340, p), scale: mix(18, 7, p) };
	}
	if (id === "number") return { x: 1195, y: 350, scale: 1.85 };
	if (id === "range") return { x: 760, y: 718, scale: 1.65 };
	if (id === "rating") return { x: 1500, y: 745, scale: 1.25 };
	if (id === "waveform") return { x: 960, y: 340, scale: 1.8 };
	if (id === "playback") return { x: 960, y: 790, scale: 2.6 };
	if (id === "scrubber") return { x: 960, y: 585, scale: 1.8 };
	if (id === "multiselect") return { x: 510, y: 515, scale: 1.55 };
	if (id === "tags") return { x: 1300, y: 520, scale: 1.45 };
	if (id === "query")
		return { x: 960, y: 560, scale: Math.min(1.55, 790 / height) };
	if (id === "scheduler") {
		const p = ease((time - 19) / 1.35);
		return {
			x: mix(810, 960, p),
			y: mix(530, 565, p),
			scale: mix(1.4, 1.04, p),
		};
	}
	return { x: 960, y: 575, scale: 1.5 };
}

function overviewPlace(index, width, height, time) {
	const col = index % 4,
		row = Math.floor(index / 4);
	const scale = Math.min(3.4, 376 / width, 176 / height);
	const target = { x: 294 + col * 444, y: 382 + row * 250, scale };
	const order = index === 11 ? 0 : index + 1;
	const start = 26.55 + order * 0.085;
	const p = spring((time - start) * 0.8),
		bounce = Math.abs(1 - p);
	const source =
		index === 11
			? { x: 960, y: 575, scale: 1.5 }
			: {
					x: target.x + (col - 1.5) * 52,
					y: target.y + 105,
					scale: scale * 0.9,
				};
	return {
		...target,
		x: mix(source.x, target.x, p),
		y: mix(source.y, target.y, p),
		scale: mix(source.scale, scale, p),
		z: index === 11 ? Math.sin(Math.PI * clamp(p)) * 65 : bounce * 160,
		tilt: index === 11 ? Math.sin(Math.PI * clamp(p)) * -3 : (1 - p) * -7,
		roll: index === 11 ? 0 : (1 - p) * (col - 1.5) * 2,
		alpha: index === 11 ? 1 : ease((time - start + 0.08) / 0.24),
	};
}

function animateHost(host, spec, index, time) {
	const source = host.querySelector(".exact-source");
	const final = time >= 26;
	const width = final ? (overviewWidths[spec.id] ?? spec.width) : spec.width;
	// Paint components at capture density before applying motion. The native
	// 44px Switch needs extra density for its macro. Inverse camera scaling
	// preserves exact geometry and avoids GPU upsampling of text and curves.
	const density = spec.id === "switch" ? 18 : 3;
	source.style.width = `${width}px`;
	source.style.zoom = String(density);
	host.style.width = `${width * density}px`;
	const height = source.offsetHeight;
	let pose,
		alpha,
		z = 0,
		tilt = 0,
		roll = 0;
	if (final) {
		pose = overviewPlace(index, width, height, time);
		({ alpha, z, tilt, roll } = pose);
	} else {
		pose = place(spec.id, time, height);
		const arrived = spring((time - entry[spec.id]) * 0.85);
		const enter =
			spec.id === "switch"
				? ease(time / 0.35)
				: ease((time - entry[spec.id] + 0.12) / 0.48);
		const leave =
			spec.id === "kanban" ? 0 : ease((time - exit[spec.id] + 0.38) / 0.7);
		alpha = enter * (1 - leave);
		pose.x += (1 - arrived) * 65 - leave * 90;
		pose.y += (1 - arrived) * 22 - leave * 8;
		z = Math.abs(1 - arrived) * 105 - leave * 35;
		tilt = (1 - arrived) * -5;
		roll = (1 - arrived) * ((index % 3) - 1) * 1.5;
	}
	host.style.visibility = alpha > 0.0001 ? "visible" : "hidden";
	host.style.opacity = String(alpha);
	host.style.zIndex = String(
		final ? (spec.id === "kanban" ? 1 : 2) : index + 2,
	);
	host.style.transform = `translate3d(${pose.x}px,${pose.y}px,${z}px) rotateX(${tilt}deg) rotateZ(${roll}deg) scale(${pose.scale / density}) translate(-50%,-50%)`;
	const name = document.querySelector(`[data-film-name="${spec.id}"]`);
	name.style.opacity = String(
		final ? ease((time - 26.4 - index * 0.035) / 0.5) : alpha * 0.85,
	);
	name.style.transform = final
		? `translate(${96 + (index % 4) * 444}px,${259 + Math.floor(index / 4) * 250}px)`
		: `translate(${pose.x - (width * pose.scale) / 2}px,${pose.y - (height * pose.scale) / 2 - 42}px)`;
	name.querySelector(".film-index").style.display = final
		? "inline-block"
		: "none";
	if (final || alpha <= 0.0001) return;
	const local = time - chapter[spec.id];
	switch (spec.id) {
		case "switch": {
			const thumb = host.querySelector(".rs-switch-thumb");
			const initial = Math.abs(1 - spring(time - 0.28)) * 5;
			const slide = time >= 2.6 ? (spring((time - 2.6) * 1.6) - 1) * 20 : 0;
			modify(thumb, {
				transform: `translate3d(${slide}px,${-initial * 0.18}px,${initial}px)`,
				transformStyle: "preserve-3d",
			});
			break;
		}
		case "number": {
			parts(host, "input,button,.rs-number-field-unit", time, 2.14, 0.06);
			const buttons = host.querySelectorAll("button");
			const press = [3.25, 3.67, 4.09].reduce(
				(sum, at) =>
					sum +
					(time >= at
						? Math.sin((time - at) * 18) * Math.exp(-(time - at) * 13)
						: 0),
				0,
			);
			if (time > 3.15)
				modify(buttons[1], {
					transform: `translateZ(${-Math.max(0, press) * 3}px) scale(${1 - Math.max(0, press) * 0.025})`,
				});
			break;
		}
		case "range":
			parts(
				host,
				".rs-range-slider-legend,.rs-range-slider-row",
				time,
				3.28,
				0.12,
			);
			break;
		case "rating":
			parts(
				host,
				".rs-rating-legend,.rs-rating-choice,.rs-rating-clear",
				time,
				4.1,
				0.085,
			);
			break;
		case "waveform": {
			const bars = host.querySelectorAll(".rs-waveform-bar");
			bars.forEach((bar, i) => {
				const f = i / Math.max(1, bars.length - 1),
					p = spring((local - 0.24 - f * 0.55) * 0.8),
					r = 10 + f * 62,
					a = f * Math.PI * 5;
				const x = Number(bar.getAttribute("x")) + 1,
					y = 24;
				modify(bar, {
					transformBox: "fill-box",
					transformOrigin: "center",
					transform: `translate(${(1 - p) * (256 + Math.cos(a) * r - x)}px,${(1 - p) * (24 + Math.sin(a) * r * 0.55 - y)}px) rotate(${(1 - p) * ((a * 180) / Math.PI + 90)}deg)`,
				});
			});
			break;
		}
		case "playback": {
			parts(host, "button", time, 6.38, 0.11);
			const times = [0, 7.72, 9.12, 10.62, 11.17];
			const buttons = host.querySelectorAll("button");
			buttons.forEach((button, i) => {
				const at = times[[4, 1, 2, 3][i]],
					d = time - at;
				if (d >= 0 && d < 0.35)
					modify(button, {
						transform: `translateZ(${-Math.sin((Math.PI * d) / 0.35) * 3}px) scale(${1 - Math.sin((Math.PI * d) / 0.35) * 0.02})`,
					});
			});
			break;
		}
		case "scrubber":
			parts(
				host,
				".rs-media-scrubber-track,.rs-media-scrubber-times",
				time,
				6.72,
				0.11,
			);
			break;
		case "multiselect":
			parts(
				host,
				".rs-multi-select-trigger,.rs-multi-select-panel,.rs-multi-select-option,.rs-multi-select-clear",
				time,
				12.68,
				0.06,
				0.5,
			);
			break;
		case "tags":
			parts(host, ".rs-tag-input-tag", time, 13.75, 0.48, 1.8);
			break;
		case "query":
			parts(
				host,
				"select,input,button,legend,label,.rs-query-builder-summary",
				time,
				15.88,
				0.035,
				0.55,
			);
			break;
		case "scheduler":
			parts(
				host,
				".rs-scheduler-toolbar,.rs-scheduler-day,.rs-scheduler-event",
				time,
				19.04,
				0.035,
				0.5,
			);
			break;
		case "kanban":
			parts(host, ".rs-kanban-column,.rs-kanban-card", time, 22.35, 0.05, 0.7);
			applyPlanningMotion(host, time, modify);
			break;
	}
}

function setDialogDraft(dialog, edited) {
	for (const [selector, value] of [
		['input[type="date"]', edited ? "2026-09-10" : "2026-09-09"],
		['input[type="time"]', edited ? "11:30" : "09:00"],
	]) {
		const input = dialog.querySelector(selector);
		if (input && input.value !== value) {
			Object.getOwnPropertyDescriptor(
				HTMLInputElement.prototype,
				"value",
			).set.call(input, value);
			input.dispatchEvent(new Event("input", { bubbles: true }));
			input.dispatchEvent(new Event("change", { bubbles: true }));
		}
	}
}

function syncDialog(time) {
	const shouldOpen = time >= 20.65 && time < 21.72;
	let dialog = document.querySelector("dialog[open]");
	if (shouldOpen && !dialog) {
		flushSync(() =>
			document
				.querySelector(
					'[data-film-planning="scheduler"] button[aria-label="Reschedule Layout review"]',
				)
				?.click(),
		);
	}
	dialog = document.querySelector("dialog[open]");
	if (!shouldOpen && dialog) {
		const commit = lastTime >= 20.65 && lastTime < 21.72 && time >= 21.72;
		// A seek may skip the edit interval. Commit the same native draft that
		// sequential playback submits, after React processes the input events.
		if (commit) flushSync(() => setDialogDraft(dialog, true));
		flushSync(() =>
			dialog
				.querySelector(
					commit ? 'button[type="submit"]' : '[aria-label="Cancel reschedule"]',
				)
				?.click(),
		);
		dialog = document.querySelector("dialog[open]");
	}
	if (dialog) {
		flushSync(() => setDialogDraft(dialog, time >= 21.05));
		const p = spring((time - 20.65) * 1.2);
		const density = Number(dialog.closest(".exact-source")?.style.zoom ?? 1);
		modify(dialog, {
			transform: `translateY(${((1 - p) * 32) / density}px) scale(${(viewScale() * mix(1.35, 1.55, p)) / density})`,
			transformOrigin: "center",
		});
		const press = Math.sin(Math.PI * ease((time - 21.52) / 0.2));
		modify(dialog.querySelector('button[type="submit"]'), {
			transform: `scale(${1 - press * 0.025})`,
		});
	}
	document.activeElement?.blur?.();
}

async function step(frame) {
	const time = frame / 30;
	resetMotion();
	flushSync(() => root.render(<Composition time={time} />));
	document.getElementById("world").style.transform = `scale(${viewScale()})`;
	for (let index = 0; index < specimenCatalog.length; index++) {
		const spec = specimenCatalog[index];
		animateHost(
			document.querySelector(`[data-film-host="${spec.id}"]`),
			spec,
			index,
			time,
		);
	}
	syncDialog(time);
	const grid = document.getElementById("film-grid");
	grid.style.opacity = String(ease((time - 26.2) / 0.7));
	grid.querySelectorAll("[data-grid-rule]").forEach((line, i) => {
		line.style.strokeDasharray = "1900";
		line.style.strokeDashoffset = String(
			1900 * (1 - ease((time - 26.3 - i * 0.05) / 0.85)),
		);
	});
	const p = spring(time - 26.5);
	document.getElementById("film-wordmark").style.transform =
		`translateY(${(1 - p) * 20}px)`;
	lastTime = time;
	await new Promise((resolve) => requestAnimationFrame(resolve));
}

async function initialise() {
	await step(0);
	await document.fonts.ready;
	window.film = {
		ready: true,
		step,
		stats: {
			source: "@noorddev/vlak-react",
			componentCount: 12,
			screenTextures: 0,
			handDrawnControls: 0,
			overviewLandingTimes: specimenCatalog.map(
				(_, index) =>
					26.55 + (index === 11 ? 0 : index + 1) * 0.085 + contact / 0.8,
			),
			featured: specimenCatalog.map((spec) => spec.name),
		},
		inspect: () => ({
			time: lastTime,
			hosts: specimenCatalog.map((spec) => {
				const root = document.querySelector(
					`[data-film-host="${spec.id}"] .exact-source`,
				);
				return {
					id: spec.id,
					width: root.offsetWidth,
					height: root.offsetHeight,
				};
			}),
		}),
		dispose: () => root.unmount(),
	};
}
initialise().catch((error) => {
	window.film = { ready: false, error: error.stack ?? String(error) };
});
