import { flushSync } from "react-dom";
import { actionTimes as at } from "./timeline.mjs";

const normalText = (value) => value?.replace(/\s+/g, " ").trim() ?? "";

function typing(id, field, text, start, end, selector) {
	const characters = Array.from(text);
	return characters.map((character, index) => ({
		id: `${id}-${String(index + 1).padStart(2, "0")}`,
		kind: "input",
		time: start + ((end - start) * index) / Math.max(1, characters.length - 1),
		label: field,
		selector,
		character,
		value: characters.slice(0, index + 1).join(""),
		index,
		length: characters.length,
	}));
}

/** Pure, frozen global film timing metadata, also safe to import in Node. */
export const agentFilmEvents = Object.freeze(
	[
		{
			id: "show-output",
			kind: "click",
			time: at.output,
			label: "Output",
			selector: ".am-view-filter button",
		},
		{
			id: "approve-review",
			kind: "click",
			time: at.approve,
			label: "Approve review",
			selector: ".am-detail-actions button",
		},
		{
			id: "select-task-014",
			kind: "click",
			time: at.select,
			label: "Refine account settings",
			selector: ".am-task",
			taskId: "014",
		},
		{
			id: "pause-task",
			kind: "click",
			time: at.pause,
			label: "Pause",
			selector: ".am-detail-actions button",
		},
		{
			id: "resume-task",
			kind: "click",
			time: at.resume,
			label: "Resume",
			selector: ".am-detail-actions button",
		},
		{
			id: "new-task",
			kind: "click",
			time: at.compose,
			label: "New task",
			selector: ".am-new-task",
		},
		...typing(
			"task-name",
			"Task name",
			"Test the search flow",
			at.titleStart,
			at.titleEnd,
			".am-compose input",
		),
		...typing(
			"task-brief",
			"Brief",
			"Check keyboard navigation and clear empty states.",
			at.briefStart,
			at.briefEnd,
			".am-compose textarea",
		),
		{
			id: "queue-task",
			kind: "click",
			time: at.queue,
			label: "Queue task",
			selector: ".am-compose-actions button",
		},
		{
			id: "start-task",
			kind: "click",
			time: at.start,
			label: "Start task",
			selector: ".am-detail-actions button",
		},
	]
		.sort((a, b) => a.time - b.time)
		.map(Object.freeze),
);

/** Narrow layouts navigate through the board's own queue and detail screens. */
export const agentMobileFilmEvents = Object.freeze(
	[
		...agentFilmEvents,
		{
			id: "mobile-filter-review",
			mobile: true,
			kind: "click",
			time: 8.35,
			label: "Review",
			selector: ".am-mobile-nav button",
		},
		{
			id: "mobile-select-task-013",
			mobile: true,
			kind: "click",
			time: 9.05,
			label: "Audit keyboard navigation",
			selector: ".am-task",
			taskId: "013",
		},
		{
			id: "mobile-back-after-review",
			mobile: true,
			kind: "click",
			time: 14.65,
			label: "Tasks",
			selector: ".am-back",
		},
		{
			id: "mobile-filter-active",
			mobile: true,
			kind: "click",
			time: 15.15,
			label: "Active",
			selector: ".am-mobile-nav button",
		},
		{
			id: "mobile-back-before-compose",
			mobile: true,
			kind: "click",
			time: 22.15,
			label: "Tasks",
			selector: ".am-back",
		},
		{
			id: "mobile-filter-all",
			mobile: true,
			kind: "click",
			time: 22.55,
			label: "All tasks",
			selector: ".am-mobile-nav button",
		},
	]
		.sort((a, b) => a.time - b.time)
		.map(Object.freeze),
);

export function agentFilmEventsFor({ mobile = false } = {}) {
	return mobile ? agentMobileFilmEvents : agentFilmEvents;
}

/**
 * Drive an original AgentsBoard through its real controls. `rootElement` is a
 * stable host containing .am; `remount` must restore the original React fixture
 * in that same host and resolve after its DOM commit. It is called on rewinds.
 * Calls are serialized. No animation state, component paint or text is replaced.
 */
export function createAgentController(
	rootElement,
	{ remount, mobile = false } = {},
) {
	if (!rootElement?.querySelector || typeof remount !== "function") {
		throw new TypeError(
			"An AgentsBoard host and async remount callback are required",
		);
	}
	const document = rootElement.ownerDocument;
	const window = document.defaultView;
	const events = agentFilmEventsFor({ mobile });
	let time = -1;
	let eventIndex = 0;
	let previousBoard = null;
	let failed = false;
	let pending = Promise.resolve();

	function board() {
		const element = rootElement.matches(".am")
			? rootElement
			: rootElement.querySelector(".am");
		if (!element?.isConnected)
			throw new Error("The original .am AgentsBoard is not mounted");
		return element;
	}

	function matchingButton(current, event) {
		return [...current.querySelectorAll(event.selector)].find((button) => {
			if (button.tagName !== "BUTTON") return false;
			if (mobile && button.getClientRects().length === 0) return false;
			if (event.taskId)
				return (
					normalText(button.querySelector(".am-task-number")?.textContent) ===
					event.taskId
				);
			const name = normalText(
				button.getAttribute("aria-label") || button.textContent,
			);
			return event.id === "show-output"
				? /^Output\s*\d*$/.test(name)
				: name === event.label;
		});
	}

	function matchingField(current, event) {
		return [...current.querySelectorAll(event.selector)].find(
			(input) =>
				(!mobile || input.getClientRects().length > 0) &&
				[...(input.labels ?? [])].some(
					(label) => normalText(label.textContent) === event.label,
				),
		);
	}

	function execute(event) {
		const current = board();
		if (event.kind === "click") {
			const button = matchingButton(current, event);
			if (
				!button ||
				button.disabled ||
				button.getAttribute("aria-disabled") === "true"
			) {
				throw new Error(
					`Cannot perform ${event.id} at ${event.time}s: ${event.label} is unavailable`,
				);
			}
			flushSync(() => button.click());
			return;
		}
		const input = matchingField(current, event);
		if (!input || input.disabled || input.readOnly) {
			throw new Error(
				`Cannot perform ${event.id}: the native ${event.label} field is unavailable`,
			);
		}
		if (input.value === event.value) return;
		const prototype =
			input.tagName === "TEXTAREA"
				? window.HTMLTextAreaElement.prototype
				: window.HTMLInputElement.prototype;
		const setValue = Object.getOwnPropertyDescriptor(prototype, "value").set;
		// Using the platform setter preserves React's value tracking, so its real
		// onChange callback owns the next value, validation and submit readiness.
		flushSync(() => {
			setValue.call(input, event.value);
			input.dispatchEvent(
				new window.InputEvent("input", {
					bubbles: true,
					inputType: "insertText",
					data: event.character,
				}),
			);
			input.dispatchEvent(new window.Event("change", { bubbles: true }));
		});
		if (input.value !== event.value)
			throw new Error(`React rejected the ${event.label} fixture value`);
	}

	function inspect() {
		const current = board();
		const tasks = [...current.querySelectorAll(".am-task")].map((task) => ({
			id: normalText(task.querySelector(".am-task-number")?.textContent),
			title: normalText(task.querySelector("strong")?.textContent),
			status: task.querySelector(".am-status")?.dataset.status ?? null,
			selected: task.getAttribute("aria-current") === "true",
			progress:
				normalText(task.querySelector(".am-task-percent")?.textContent) || null,
		}));
		const composing = Boolean(current.querySelector(".am-compose"));
		const fieldValue = (selector) =>
			current.querySelector(selector)?.value ?? "";
		return {
			time,
			completedEvents: eventIndex,
			mobile,
			mobileScreen: mobile ? current.dataset.mobileScreen : null,
			queueFilter: mobile
				? normalText(
						current
							.querySelector('.am-mobile-nav button[aria-pressed="true"]')
							?.getAttribute("aria-label") ||
							current.querySelector(
								'.am-mobile-nav button[aria-pressed="true"]',
							)?.textContent,
					)
				: null,
			mode: composing ? "compose" : "detail",
			selectedId:
				tasks.find((task) => task.selected)?.id ??
				(mobile && !composing && current.dataset.mobileScreen === "detail"
					? normalText(
							current.querySelector(".am-detail-id")?.textContent,
						).replace(/^Task\s+/, "") || null
					: null),
			detailTitle: normalText(
				current.querySelector(".am-detail-head h2, .am-compose-heading h2")
					?.textContent,
			),
			status:
				current.querySelector(".am-detail-topline .am-status")?.dataset
					.status ?? null,
			view: composing
				? null
				: current.querySelector(".am-outputs")
					? "output"
					: "activity",
			summary: [...current.querySelectorAll(".am-summary-card")].map(
				(card) => ({
					label: normalText(card.querySelector("span")?.textContent),
					count: Number(card.querySelector("strong")?.textContent),
				}),
			),
			tasks,
			outputFiles: [...current.querySelectorAll(".am-output-file strong")].map(
				(file) => normalText(file.textContent),
			),
			activity: [...current.querySelectorAll(".am-activity li p")].map((item) =>
				normalText(item.textContent),
			),
			draft: {
				title: fieldValue(".am-compose input"),
				brief: fieldValue(".am-compose textarea"),
			},
			detailBrief: normalText(current.querySelector(".am-brief")?.textContent),
			actions: [
				...current.querySelectorAll(
					".am-detail-actions button, .am-compose-actions button",
				),
			].map((button) => ({
				label: normalText(button.textContent),
				disabled: button.disabled,
			})),
			announcement: normalText(
				current.querySelector(".am-announcement")?.textContent,
			),
		};
	}

	async function renderAt(nextTime) {
		const target = Math.max(0, Number.isFinite(nextTime) ? nextTime : 0);
		try {
			let changed = false;
			const existing = rootElement.matches(".am")
				? rootElement
				: rootElement.querySelector(".am");
			if (
				failed ||
				target < time ||
				(previousBoard && existing !== previousBoard)
			) {
				await remount();
				eventIndex = 0;
				time = -1;
				failed = false;
				changed = true;
			}
			previousBoard = board();
			while (
				eventIndex < events.length &&
				events[eventIndex].time <= target + 1e-9
			) {
				execute(events[eventIndex]);
				eventIndex++;
				changed = true;
			}
			// Let the board's own preventScroll focus callbacks complete, then remove
			// the focus/caret for the captured frame. The controller never scrolls.
			if (changed)
				await new Promise((resolve) => window.requestAnimationFrame(resolve));
			if (board().contains(document.activeElement))
				document.activeElement?.blur?.();
			time = target;
			return inspect();
		} catch (error) {
			failed = true;
			throw error;
		}
	}

	return {
		events,
		inspect,
		step(nextTime) {
			const operation = pending.then(
				() => renderAt(nextTime),
				() => renderAt(nextTime),
			);
			pending = operation;
			return operation;
		},
	};
}
