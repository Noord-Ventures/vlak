import { useLayoutEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import {
	Card,
	CardBody,
	CardLabel,
	CardTitle,
	Callout,
	Icon,
	MessageComposer,
	Spinner,
} from "@noorddev/vlak-react";
import "../agent-film/film.jsx";
import { agentFilmEvents } from "../agent-film/controller.mjs";
import {
	beats,
	duration,
	prompt,
	response,
	storyToSource,
	sourceToStory,
	walkthrough,
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
function layer(name) {
	const element = document.createElement("div");
	element.id = name;
	element.style.cssText =
		"position:absolute;left:0;top:0;transform-origin:0 0;";
	world.append(element);
	return element;
}
const chat = layer("prompt-chat"),
	tour = layer("prompt-tour"),
	payoffLabel = layer("prompt-payoff-label"),
	payoff = layer("prompt-payoff"),
	cursor = layer("prompt-cursor");
const chatRoot = createRoot(chat),
	tourRoot = createRoot(tour),
	labelRoot = createRoot(payoffLabel),
	payoffRoot = createRoot(payoff),
	cursorRoot = createRoot(cursor);
let controls,
	agentFilm,
	time = 0,
	last = -1,
	sent = false,
	typed = 0,
	generation = 0,
	tourIndex = -2,
	responseCount = -1;
const events = [];
function Conversation() {
	const [draft, setDraft] = useState(""),
		[submitted, setSubmitted] = useState(""),
		[reply, setReply] = useState("");
	useLayoutEffect(() => {
		controls = { setReply };
	}, []);
	return (
		<Card style={{ width: 560, maxWidth: "none" }}>
			<CardLabel>Vlak assistant</CardLabel>
			{!submitted ? (
				<>
					<CardTitle>What would you like to build?</CardTitle>
					<MessageComposer
						label="Prompt"
						value={draft}
						onValueChange={setDraft}
						onSend={({ text }) => {
							setSubmitted(text);
							events.push({ id: "send-prompt", time: beats.send, text });
						}}
						sendOnEnter
						placeholder="Describe an interface…"
					/>
				</>
			) : (
				<>
					<Callout>
						<CardLabel>You</CardLabel>
						<CardBody>{submitted}</CardBody>
					</Callout>
					<div style={{ marginTop: 24 }}>
						{!reply ? (
							<div style={{ display: "flex", gap: 12, alignItems: "center" }}>
								<Spinner label="Thinking" />
								<CardBody>Thinking through the interface…</CardBody>
							</div>
						) : (
							<>
								<CardLabel>Vlak assistant</CardLabel>
								<CardBody>{reply}</CardBody>
							</>
						)}
					</div>
				</>
			)}
		</Card>
	);
}
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
		scale = innerWidth / 1920;
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
	tourIndex = -2;
	events.length = 0;
	flushSync(() => chatRoot.render(<Conversation key={generation++} />));
	await raf();
}
async function step(frame) {
	time = frame / 30;
	if (time < last) await mountChat();
	await agentFilm.step(storyToSource(time) * 30);
	const shell = document.querySelector('[data-film-browser="agents"]');
	const constructing = time >= beats.construct,
		entrance = spring((time - beats.construct) * 1.1),
		finish = ease((time - beats.payoff) / 0.8);
	shell.style.visibility = constructing ? "visible" : "hidden";
	shell.style.transformOrigin = "50% 50%";
	shell.style.transform = "";
	const base = shell.getBoundingClientRect(),
		worldScale = innerWidth / 1920,
		shellScale = mix(0.94, 1, entrance) * mix(1, 0.82, finish);
	const naturalTop =
		(base.top + (base.height * (1 - shellScale)) / 2) / worldScale;
	const clearTop = Math.max(
		naturalTop,
		mix(base.top / worldScale, 280, finish),
	);
	shell.style.transform = `translateY(${85 * (1 - entrance) + clearTop - naturalTop}px) scale(${shellScale})`;
	if (!constructing) shell.style.opacity = "0";
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
		if (!chat.textContent.includes(prompt))
			throw Error("Prompt was not submitted");
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
		1.9 * mix(0.9, 1, chatEnter) * mix(1, 0.91, chatExit),
		960 - 170 * chatExit,
		515 - 24 * chatExit,
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
	const index = walkthrough.findIndex(
		(item) => time >= item.start && time < item.end,
	);
	if (index !== tourIndex) {
		flushSync(() =>
			tourRoot.render(
				index < 0 ? null : (
					<Card style={{ width: 760, maxWidth: "none" }}>
						<CardLabel
							style={{ display: "flex", gap: 8, alignItems: "center" }}
						>
							<Icon name="message" size={12} /> Vlak assistant
						</CardLabel>
						<CardBody>{walkthrough[index].text}</CardBody>
					</Card>
				),
			),
		);
		tourIndex = index;
	}
	if (index >= 0) {
		const item = walkthrough[index],
			fade =
				ease((time - item.start) / 0.25) *
				(1 - ease((time - (item.end - 0.22)) / 0.22));
		center(tour, 1.3, 960, 1040 + 8 * (1 - fade));
		sceneOpacity(tour, fade);
	} else sceneOpacity(tour, 0);
	const endEnter = ease((time - (beats.payoff + 0.8)) / 0.6);
	center(payoffLabel, 2.3, 960, 66 - 15 * (1 - endEnter));
	sceneOpacity(payoffLabel, endEnter);
	const wordEnter = spring(time - (beats.payoff + 1));
	center(payoff, 7.6, 960, 200 + 30 * (1 - wordEnter));
	sceneOpacity(payoff, ease((time - (beats.payoff + 1)) / 0.5));
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
			labelRoot.render(<CardBody>Generate instant interface with</CardBody>);
			payoffRoot.render(<CardTitle>Vlak.dev</CardTitle>);
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
				constructionSeconds: beats.assembled - beats.construct,
			},
			inspect: () => ({
				time,
				promptSubmitted: sent,
				typedPrompt: prompt,
				response,
				events,
				agentInterface: agentFilm.inspect(),
				payoff: "Generate instant interface with Vlak.dev",
			}),
			dispose: () => {
				agentFilm.dispose?.();
				chatRoot.unmount();
				tourRoot.unmount();
				labelRoot.unmount();
				payoffRoot.unmount();
				cursorRoot.unmount();
			},
		};
	} catch (error) {
		window.film = { ready: false, error: error.stack };
		console.error(error);
	}
})();
