const text = (element) =>
	element?.textContent.replace(/\s+/g, " ").trim() ?? "";

/**
 * Read the original AgentsBoard after resetMotion and before camera motion.
 * Rectangles are host-local CSS pixels: the film's zoom:3 and camera scale:1/3
 * cancel naturally. Nothing is cloned, reparented, restyled or measured by
 * temporarily changing layout. Recollect after each native state change.
 */
export function collectAgentParts(host) {
	const board = host?.matches?.(".am") ? host : host?.querySelector(".am");
	if (!board)
		throw new Error("collectAgentParts requires the original .am board");
	const bounds = host.getBoundingClientRect();
	const scaleX = bounds.width / host.offsetWidth || 1;
	const scaleY = bounds.height / host.offsetHeight || scaleX;
	const parts = [];
	const byId = new Map();
	const byElement = new Map();

	function add(id, selector, group, kind, context = board) {
		const element =
			typeof selector === "string"
				? context?.querySelector(selector)
				: selector;
		if (!element || byElement.has(element))
			return byElement.get(element) ?? null;
		const rect = element.getBoundingClientRect();
		// Display:none mobile controls remain absent. Temporary visibility/opacity
		// masks do not affect this inventory, so it can also be inspected mid-shot.
		if (!rect.height || (!rect.width && kind !== "fill")) return null;
		const part = {
			id,
			group,
			kind,
			element,
			selector: typeof selector === "string" ? selector : null,
			parentId: null,
			children: [],
			order: parts.length,
			rect: {
				x: (rect.left - bounds.left) / scaleX,
				y: (rect.top - bounds.top) / scaleY,
				width: rect.width / scaleX,
				height: rect.height / scaleY,
			},
		};
		parts.push(part);
		byId.set(id, part);
		byElement.set(element, part);
		return part;
	}

	add("header/surface", ".am-header", "header", "surface");
	add("header/mark", ".am-workspace-mark", "header", "icon");
	add("header/title", ".am-workspace > div > strong", "header", "text");
	add("header/context", ".am-workspace .am-desktop-context", "header", "text");
	add(
		"header/mobile-context",
		".am-workspace .am-mobile-context",
		"header",
		"text",
	);
	add("header/new-task", ".am-new-task", "header", "control");

	add("summary/surface", ".am-summary", "summary", "surface");
	board.querySelectorAll(".am-summary-card").forEach((card, index) => {
		const id = `summary/${["active", "review", "queued"][index] ?? index}`;
		add(`${id}/surface`, card, "summary", "surface");
		add(`${id}/label`, ":scope > span", "summary", "text", card);
		add(`${id}/value`, ":scope > strong", "summary", "text", card);
	});

	add("queue/surface", ".am-queue", "queue", "surface");
	add("queue/toolbar", ".am-queue-controls", "queue", "surface");
	add("queue/filter-frame", ".am-filter", "queue", "surface");
	board.querySelectorAll(".am-filter button").forEach((button, index) => {
		add(
			`queue/filter/${["all", "active", "review"][index] ?? index}`,
			button,
			"queue",
			"control",
		);
	});
	board.querySelectorAll(".am-task").forEach((task, index) => {
		const id = `task/${text(task.querySelector(".am-task-number")) || index}`;
		add(`${id}/surface`, task, "task", "surface");
		add(
			`${id}/agent`,
			".am-task-meta > span:first-child",
			"task",
			"text",
			task,
		);
		add(`${id}/number`, ".am-task-number", "task", "text", task);
		add(`${id}/title`, ":scope > strong", "task", "text", task);
		// Status contains a direct text node. Keep its actual label and mark as one
		// native unit; splitting it would require replacement markup or paint.
		add(`${id}/status`, ".am-status", "task", "status", task);
		add(`${id}/progress`, ".am-task-percent", "task", "text", task);
		add(`${id}/chevron`, ".am-task-foot > .rs-icon", "task", "icon", task);
	});
	add("queue/count", ".am-queue-count", "queue", "text");

	add("detail/surface", ".am-detail", "detail", "surface");
	add("detail/head-surface", ".am-detail-head", "detail", "surface");
	add("detail/back", ".am-back", "detail", "control");
	add("detail/id", ".am-detail-id", "detail", "text");
	add("detail/status", ".am-detail-topline > .am-status", "detail", "status");
	add("detail/title", ".am-detail-head > h2", "detail", "text");
	add("detail/avatar", ".am-agent-line > .am-agent-avatar", "detail", "icon");
	add("detail/agent", ".am-agent-line > span:nth-child(2)", "detail", "text");
	add("detail/scope", ".am-agent-scope", "detail", "text");
	add("detail/brief", ".am-brief", "detail", "text");
	add("detail/view-frame", ".am-view-filter", "detail", "surface");
	board.querySelectorAll(".am-view-filter button").forEach((button, index) => {
		add(
			`detail/view/${index === 0 ? "activity" : "output"}`,
			button,
			"detail",
			"control",
		);
	});
	add("detail/progress-caption", ".am-progress-label", "detail", "text");

	board.querySelectorAll(".am-activity li").forEach((row, index) => {
		const id = `activity/${index}`;
		// The native row's ::before paints its connecting rule. Reveal that body
		// independently while the original marker, sentence and time arrive.
		add(`${id}/rule`, row, "activity", "surface");
		add(`${id}/marker`, ".am-activity-marker", "activity", "icon", row);
		add(`${id}/text`, "p", "activity", "text", row);
		add(`${id}/time`, "time", "activity", "text", row);
	});

	add("output/surface", ".am-outputs", "output", "surface");
	add("output/heading", ".am-output-heading", "output", "text");
	board.querySelectorAll(".am-output-file").forEach((card, index) => {
		const id = `output/${index}`;
		add(`${id}/surface`, card, "output", "surface");
		add(`${id}/icon`, ":scope > .rs-icon", "output", "icon", card);
		// The filename is a non-transformable inline strong. Move its existing
		// copy div so filename/description retain their original line boxes.
		add(`${id}/copy`, ":scope > div", "output", "text", card);
	});
	add("output/empty", ".am-output-empty", "output", "text");

	add("actions/surface", ".am-detail-actions", "actions", "surface");
	add("actions/title", ".am-detail-actions > div > strong", "actions", "text");
	add(
		"actions/description",
		".am-detail-actions > div > span",
		"actions",
		"text",
	);
	add("actions/button", ".am-detail-actions > button", "actions", "control");
	add("actions/complete", ".am-complete-mark", "actions", "icon");
	add(
		"progress/label",
		".am-run-progress .rs-progress-head > span:first-child",
		"progress",
		"text",
	);
	add(
		"progress/value",
		".am-run-progress .rs-progress-head > span:last-child",
		"progress",
		"text",
	);
	add("progress/track", ".am-run-progress .rs-progress", "progress", "surface");
	// Keep the native width/aria-valuenow. Its parent clips the fill by design;
	// draw this part with transform scaleX if desired, rather than changing value.
	add(
		"progress/fill",
		".am-run-progress .rs-progress-fill",
		"progress",
		"fill",
	);

	add("form/title", ".am-compose-heading > h2", "form", "text");
	add("form/close", ".am-compose-heading > button", "form", "control");
	add("form/description", ".am-compose-fields > p", "form", "text");
	board
		.querySelectorAll(".am-compose input, .am-compose textarea")
		.forEach((input) => {
			const id =
				input.tagName === "TEXTAREA" ? "form/brief" : "form/title-input";
			const label = [...(input.labels ?? [])][0];
			add(`${id}/label`, label, "form", "text");
			add(`${id}/control`, input, "form", "control");
		});
	add("form/avatar", ".am-compose-assignee > .am-agent-avatar", "form", "icon");
	add("form/agent", ".am-compose-assignee strong", "form", "text");
	add("form/assignment", ".am-compose-assignee small", "form", "text");
	board
		.querySelectorAll(".am-compose-actions button")
		.forEach((button, index) => {
			add(
				`form/${index === 0 ? "queue" : "cancel"}`,
				button,
				"form",
				"control",
			);
		});

	add("footer/surface", ".am-footer", "footer", "surface");
	add("footer/demo", ".am-footer > span:first-child", "footer", "text");
	add("footer/persistence", ".am-footer > span:last-child", "footer", "text");

	for (const part of parts) {
		for (
			let parent = part.element.parentElement;
			parent && parent !== host;
			parent = parent.parentElement
		) {
			const ancestor = byElement.get(parent);
			if (!ancestor) continue;
			part.parentId = ancestor.id;
			ancestor.children.push(part.id);
			break;
		}
	}
	return {
		board,
		parts,
		byId,
		leaves: parts.filter((part) => part.children.length === 0),
	};
}

/** Select only deepest candidates so the same motion never compounds twice. */
export function independentAgentParts(parts) {
	const unique = [
		...new Map(parts.map((part) => [part.element, part])).values(),
	];
	return unique.filter(
		(part) =>
			!unique.some(
				(other) => other !== part && part.element.contains(other.element),
			),
	);
}

/**
 * Mask native ancestor backgrounds/rules without hiding independently moving
 * descendants. Visibility (unlike opacity) can be overridden by a child.
 * Use the film's reversible `modify` recorder and restore it every frame.
 * Never add opacity:0 to a parent with separately visible descendants.
 * When assembly is finished, stop calling this and restore native visibility.
 */
export function setAgentPartVisibility(inventory, visibleIds, modify) {
	const shown = visibleIds instanceof Set ? visibleIds : new Set(visibleIds);
	modify(inventory.board, { visibility: "hidden" });
	for (const part of inventory.parts) {
		modify(part.element, {
			visibility: shown.has(part.id) ? "visible" : "hidden",
		});
	}
}
