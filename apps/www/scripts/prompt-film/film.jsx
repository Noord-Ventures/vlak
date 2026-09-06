import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { CardTitle, Icon } from "@noorddev/vlak-react";
import "../agent-film/film.jsx";
import { Conversation } from "./conversation.jsx";
import { agentFilmEvents } from "../agent-film/controller.mjs";
import {
	beats,
	duration,
	prompt,
	response,
	storyToSource,
	sourceToStory,
	themeAt,
	themeChanges,
} from "./timeline.mjs";

const clamp = (value) => Math.max(0, Math.min(1, value));
const mix = (a, b, p) => a + (b - a) * p;
const ease = (value) => {
	const p = clamp(value);
	return p * p * p * (p * (p * 6 - 15) + 10);
};
const spring = (value) => {
	const t = Math.max(0, value);
	return 1 - Math.exp(-7.8 * t) * (Math.cos(10 * t) + 0.4 * Math.sin(10 * t));
};
const raf = () => new Promise((resolve) => requestAnimationFrame(resolve));
const world = document.getElementById("world");
const reel = window.agentFilmFormat === "reel";
const frameWidth = reel ? 1080 : 1920;
function layer(name) {
	const element = document.createElement("div");
	element.id = name;
	element.style.cssText =
		"position:absolute;left:0;top:0;transform-origin:0 0;";
	world.append(element);
	return element;
}
const chat = layer("prompt-chat"),
	payoff = layer("prompt-payoff"),
	cursor = layer("prompt-cursor");
const chatRoot = createRoot(chat),
	payoffRoot = createRoot(payoff),
	cursorRoot = createRoot(cursor);
let controls,
	agentFilm,
	time = 0,
	last = -1,
	sent = false,
	typed = 0,
	generation = 0,
	responseCount = -1;
const events = [];

function nativeType(value) {
	const textarea = chat.querySelector("textarea");
	if (!textarea) throw Error("Native Vlak prompt missing");
	flushSync(() => {
		Object.getOwnPropertyDescriptor(
			HTMLTextAreaElement.prototype,
			"value",
		).set.call(textarea, value);
		textarea.dispatchEvent(
			new InputEvent("input", {
				bubbles: true,
				inputType: "insertText",
				data: value.at(-1),
			}),
		);
	});
}
function sceneOpacity(element, value) {
	element.style.opacity = String(clamp(value));
	element.style.visibility = value > 0 ? "visible" : "hidden";
}
function center(element, scale, cx, cy) {
	const width = element.offsetWidth,
		height = element.offsetHeight;
	element.style.transform = `translate(${cx - (width * scale) / 2}px,${cy - (height * scale) / 2}px) scale(${scale})`;
}
function matchAction(action) {
	return [
		...document.querySelectorAll(`#agent-interface ${action.selector}`),
	].find((element) => {
		if (action.taskId)
			return (
				element.querySelector(".am-task-number")?.textContent.trim() ===
				action.taskId
			);
		const label = (element.getAttribute("aria-label") ?? element.textContent)
			.replace(/\s+/g, " ")
			.trim();
		return action.id === "show-output"
			? /^Output\s*\d*$/.test(label)
			: label === action.label;
	});
}
function point(element) {
	const bounds = element.getBoundingClientRect(),
		scale = innerWidth / frameWidth;
	return {
		x: (bounds.x + bounds.width * 0.62) / scale,
		y: (bounds.y + bounds.height * 0.6) / scale,
	};
}
function pointer(t) {
	let action, target, start, end;
	if (t >= beats.send - 0.75 && t < beats.send) {
		target = chat.querySelector('button[type="submit"]');
		start = beats.send - 0.75;
		end = beats.send;
	} else {
		action = agentFilmEvents
			.filter((item) => item.kind === "click")
			.find((item) => {
				const at = sourceToStory(item.time);
				return t >= at - 0.62 && t < at + 0.12;
			});
		if (action) {
			target = matchAction(action);
			start = sourceToStory(action.time) - 0.62;
			end = sourceToStory(action.time);
		}
	}
	if (!target) {
		sceneOpacity(cursor, 0);
		return;
	}
	const p = point(target),
		travel = ease((t - start) / Math.max(0.01, end - start - 0.16)),
		fade = ease((t - start) / 0.1) * (1 - ease((t - end) / 0.1));
	cursor.style.transform = `translate(${p.x + 110 * (1 - travel)}px,${p.y + 80 * (1 - travel)}px) scale(${1.7 - 0.16 * Math.sin(Math.PI * clamp((t - (end - 0.18)) / 0.18))})`;
	sceneOpacity(cursor, fade);
}
async function mountChat() {
	typed = 0;
	sent = false;
	responseCount = -1;
	events.length = 0;
	flushSync(() =>
		chatRoot.render(
			<Conversation
				key={generation++}
				onReady={(api) => {
					controls = api;
				}}
				onSubmit={(text) =>
					events.push({ id: "send-prompt", time: beats.send, text })
				}
			/>,
		),
	);
	await raf();
}
async function step(frame) {
	time = frame / 30;
	document.documentElement.dataset.theme = themeAt(time);
	if (time < last) await mountChat();
	await agentFilm.step(storyToSource(time) * 30);
	world.style.transform = `scale(${innerWidth / frameWidth})`;
	const shell = document.querySelector('[data-film-browser="agents"]');
	const constructing = time >= beats.construct;
	const entrance = spring((time - beats.construct) * 1.1);
	const finish = ease((time - beats.payoff) / 0.9);
	shell.style.visibility = constructing ? "visible" : "hidden";
	shell.style.transformOrigin = "50% 50%";
	shell.style.transform = `translateY(${85 * (1 - entrance)}px) scale(${mix(0.94, 1, entrance) * mix(1, 0.97, finish)})`;
	shell.style.opacity = constructing
		? String(ease((time - beats.construct) / 0.16) * mix(1, 0.22, finish))
		: "0";
	document.getElementById("film-type").style.display = "none";
	const count = Math.round(
		prompt.length *
			ease((time - beats.typeStart) / (beats.typeEnd - beats.typeStart)),
	);
	if (!sent && count !== typed) {
		nativeType(prompt.slice(0, count));
		typed = count;
		events.push({ id: "type-prompt", time, characters: count });
	}
	if (!sent && time >= beats.send) {
		const button = chat.querySelector('button[type="submit"]');
		if (!button || button.disabled)
			throw Error("Native Vlak Send is unavailable");
		flushSync(() => button.click());
		sent = true;
		await Promise.resolve();
		await raf();
		const bubble = chat.querySelector("textarea");
		if (
			bubble?.value !== prompt ||
			!bubble.readOnly ||
			!controls.inspect().sameTextarea
		)
			throw Error("Prompt did not become a message bubble in the same field");
	}
	const replyLength =
		time >= beats.reply
			? Math.round(
					response.length *
						clamp((time - beats.reply) / (beats.replyEnd - beats.reply)),
				)
			: 0;
	if (sent && replyLength !== responseCount) {
		flushSync(() => controls.setReply(response.slice(0, replyLength)));
		responseCount = replyLength;
	}
	const chatExit = ease((time - 8.95) / 0.62),
		chatEnter = spring(time - 0.12);
	center(
		chat,
		(reel ? 1.65 : 1.9) * mix(0.9, 1, chatEnter) * mix(1, 0.91, chatExit),
		frameWidth / 2 - (reel ? 90 : 170) * chatExit,
		(reel ? 870 : 515) - 24 * chatExit,
	);
	sceneOpacity(chat, ease(time / 0.28) * (1 - chatExit));
	const sendButton = chat.querySelector('button[type="submit"]');
	if (sendButton) {
		const d = time - (beats.send - 0.18);
		sendButton.style.transform =
			d >= 0 && d < 0.18
				? `scale(${1 - 0.05 * Math.sin((Math.PI * d) / 0.18)})`
				: "";
	}
	// Keep the original Vlak loading ring; its rotation follows exact film time.
	const spinner = chat.querySelector(".rs-spinner-ring");
	if (spinner) {
		spinner.style.animation = "none";
		spinner.style.transform = `rotate(${((time - beats.send) / 0.7) * 360}deg)`;
	}
	// The closing words intentionally overprint the whole interface. Short,
	// irregular cut-ins give the payoff a graphic flash, then a readable hold.
	const titleTime = time - beats.payoff;
	const flashes = [
		[0, 0.1],
		[0.16, 0.38],
		[0.44, 0.58],
		[0.68, 2.5],
		[2.62, 4.1],
		[4.2, 8.2],
	];
	const flash = flashes.some(
		([start, end]) => titleTime >= start && titleTime < end,
	)
		? 1
		: 0;
	const jitter =
		titleTime < 0.68
			? [0, -8, 6, 0][Math.floor(Math.max(0, titleTime) * 30) % 4]
			: 0;
	const textScale = reel ? 12.8 : 13.4;
	payoff.style.transform = `translate(${(reel ? 60 : 64) + jitter}px,${reel ? 320 : 156}px) scale(${textScale})`;
	sceneOpacity(payoff, flash);
	pointer(time);
	document.activeElement?.blur?.();
	document.scrollingElement.scrollTop = 0;
	document.scrollingElement.scrollLeft = 0;
	last = time;
	await raf();
}
window.film = { ready: false, error: null };
(async () => {
	try {
		while (!window.agentFilm?.ready) {
			if (window.agentFilm?.error) throw Error(window.agentFilm.error);
			await raf();
		}
		agentFilm = window.agentFilm;
		flushSync(() => {
			payoffRoot.render(
				<CardTitle
					style={{ whiteSpace: "nowrap", margin: 0, lineHeight: 1.08 }}
				>
					{(reel
						? ["Generate", "instant", "interface", "with", "Vlak.dev"]
						: ["Generate instant", "interface with", "Vlak.dev"]
					).map((line) => (
						<span key={line} style={{ display: "block" }}>
							{line}
						</span>
					))}
				</CardTitle>,
			);
			cursorRoot.render(
				<Icon
					name="send"
					variant="filled"
					size={24}
					style={{ transform: "rotate(-135deg)" }}
				/>,
			);
		});
		await mountChat();
		await document.fonts.ready;
		await step(0);
		window.film = {
			ready: true,
			step,
			stats: {
				nativeComponents: true,
				sourceInterface: "AgentsBoard",
				duration,
				narrative:
					"Prompt → thinking → reply → browser assembly → AI walkthrough → payoff",
				browserFrame: true,
				format: reel ? "reel" : "landscape",
				wholeBrowserCamera: true,
				visiblePromptLabels: false,
				walkthroughCaptions: false,
				uniformPayoffTypography: true,
				themeChanges,
				constructionSeconds: beats.assembled - beats.construct,
			},
			inspect: () => ({
				time,
				theme: themeAt(time),
				conversation: controls.inspect(),
				payoffTypography: [...payoff.querySelectorAll("span")].map((line) => {
					const paint = getComputedStyle(line);
					return {
						text: line.textContent,
						fontFamily: paint.fontFamily,
						fontSize: paint.fontSize,
						fontWeight: paint.fontWeight,
						lineHeight: paint.lineHeight,
					};
				}),
				promptSubmitted: sent,
				typedPrompt: prompt,
				response,
				events,
				agentInterface: agentFilm.inspect(),
				payoff: "Generate instant interface with Vlak.dev",
				payoffStyle:
					"Uniform left-aligned overprint with equal line height and light/dark switches",
			}),
			dispose: () => {
				agentFilm.dispose?.();
				chatRoot.unmount();
				payoffRoot.unmount();
				cursorRoot.unmount();
			},
		};
	} catch (error) {
		window.film = { ready: false, error: error.stack };
		console.error(error);
	}
})();
