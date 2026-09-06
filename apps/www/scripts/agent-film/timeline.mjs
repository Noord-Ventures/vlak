// One deterministic clock for native interactions, component motion and sound.
export const filmDuration = 40;
export const firstContact = (Math.PI / 2 + Math.atan(0.4)) / 10;
export const actionTimes = Object.freeze({
	output: 9.6,
	approve: 13.6,
	select: 16,
	pause: 18.6,
	resume: 20.2,
	compose: 23,
	titleStart: 24.65,
	titleEnd: 26.1,
	briefStart: 26.3,
	briefEnd: 28.6,
	queue: 29.6,
	start: 31.25,
});
const cues = [];
function layer(
	phase,
	id,
	selector,
	start,
	from = {},
	cue = "tick",
	gain = 0.16,
	index,
) {
	cues.push({
		phase,
		id,
		selector,
		start,
		from: { x: 0, y: 0, scale: 1, rotate: 0, ...from },
		cue,
		gain,
		index,
	});
}
const hero = '.am-task[aria-current="true"]';
layer(
	"intro",
	"task-surface",
	hero,
	0.15,
	{ scale: 0.72, rotate: -3 },
	"press",
	0.35,
);
layer(
	"intro",
	"task-agent",
	`${hero} .am-task-meta > span:first-child`,
	0.45,
	{ x: -60 },
	"tick",
	0.2,
);
layer(
	"intro",
	"task-number",
	`${hero} .am-task-number`,
	0.58,
	{ y: -40, rotate: 12 },
	"release",
	0.22,
);
layer("intro", "task-title", `${hero} > strong`, 0.76, { y: 36 }, "tick", 0.2);
layer(
	"intro",
	"task-status",
	`${hero} .am-status`,
	0.96,
	{ x: -35 },
	"tick",
	0.16,
);
layer(
	"intro",
	"task-status-mark",
	`${hero} .am-status-mark`,
	1.08,
	{ scale: 0.1, rotate: -80 },
	"release",
	0.2,
);
layer(
	"intro",
	"task-arrow",
	`${hero} .am-task-foot > .rs-icon`,
	1.2,
	{ x: -30, scale: 0.5 },
	"tick",
	0.18,
);
layer("intro", "workspace-rule", ".am-header", 3.2, {}, null, 0);
layer(
	"intro",
	"workspace-mark",
	".am-workspace-mark",
	3.2,
	{ y: -80, rotate: -18, scale: 0.5 },
	"release",
	0.2,
);
layer(
	"intro",
	"workspace-icon",
	".am-workspace-mark .rs-icon",
	3.36,
	{ rotate: 90, scale: 0.35 },
	"tick",
	0.1,
);
layer(
	"intro",
	"workspace-title",
	".am-workspace strong",
	3.35,
	{ x: -70 },
	"tick",
	0.15,
);
layer(
	"intro",
	"workspace-context",
	".am-workspace > div > span",
	3.48,
	{ y: 20 },
	null,
	0,
);
layer(
	"intro",
	"new-task-button",
	".am-new-task",
	3.55,
	{ x: 200, rotate: 4, scale: 0.8 },
	"release",
	0.22,
);
layer(
	"intro",
	"new-task-plus",
	".am-new-task .rs-icon",
	3.73,
	{ rotate: -90, scale: 0.3 },
	"tick",
	0.13,
);
layer(
	"intro",
	"summary-surface",
	".am-summary",
	3.75,
	{ y: -24, scale: 0.97 },
	"press",
	0.22,
);
for (let i = 0; i < 3; i++) {
	layer(
		"intro",
		`summary-card-${i}`,
		".am-summary-card",
		3.87 + i * 0.14,
		{ y: -15 },
		null,
		0,
		i,
	);
	layer(
		"intro",
		`summary-label-${i}`,
		".am-summary-card > span",
		3.94 + i * 0.14,
		{ x: -30 },
		"tick",
		0.12,
		i,
	);
	layer(
		"intro",
		`summary-number-${i}`,
		".am-summary-card > strong",
		4.08 + i * 0.14,
		{ y: 35, scale: 0.45, rotate: i % 2 ? -8 : 8 },
		"release",
		0.23,
		i,
	);
	layer(
		"intro",
		`queue-tab-${i}`,
		".am-filter button",
		3.78 + i * 0.12,
		{ y: -35, scale: 0.7 },
		"tick",
		0.16,
		i,
	);
}
layer(
	"intro",
	"summary-dot",
	".am-running-dot",
	4.21,
	{ scale: 0 },
	"tick",
	0.1,
);
layer("intro", "queue-tabs-frame", ".am-queue-controls", 3.7, {}, null, 0);
for (let i = 0; i < 5; i++) {
	if (i === 1) continue;
	const row = `.am-task:nth-child(${i + 1})`;
	const t = 4.08 + i * 0.14;
	layer(
		"intro",
		`queue-row-${i}`,
		row,
		t,
		{ x: -170, scale: 0.98 },
		"press",
		0.2,
	);
	layer(
		"intro",
		`queue-meta-${i}`,
		`${row} .am-task-meta`,
		t + 0.13,
		{ x: -25 },
		null,
		0,
	);
	layer(
		"intro",
		`queue-title-${i}`,
		`${row} > strong`,
		t + 0.2,
		{ x: -25 },
		"tick",
		0.1,
	);
	layer(
		"intro",
		`queue-status-${i}`,
		`${row} .am-task-foot`,
		t + 0.3,
		{ y: 18 },
		"tick",
		0.12,
	);
}
function detail(phase, start, speed = 1) {
	const at = (d) => start + d * speed;
	layer(phase, `${phase}-head`, ".am-detail-head", at(0), {}, null, 0);
	layer(
		phase,
		`${phase}-id`,
		".am-detail-id",
		at(0.05),
		{ y: -26 },
		"tick",
		0.1,
	);
	layer(
		phase,
		`${phase}-status`,
		".am-detail-topline .am-status",
		at(0.16),
		{ x: 90 },
		"tick",
		0.14,
	);
	layer(
		phase,
		`${phase}-title`,
		".am-detail-head h2",
		at(0.25),
		{ y: 40 },
		"release",
		0.22,
	);
	layer(
		phase,
		`${phase}-avatar`,
		".am-agent-avatar",
		at(0.43),
		{ scale: 0.3, rotate: -35 },
		"release",
		0.19,
	);
	layer(
		phase,
		`${phase}-agent-label`,
		".am-agent-line > span:not(.am-agent-avatar):not(.am-agent-scope)",
		at(0.54),
		{ x: 45 },
		"tick",
		0.12,
	);
	layer(
		phase,
		`${phase}-scope`,
		".am-agent-scope",
		at(0.61),
		{ x: 35 },
		null,
		0,
	);
	layer(
		phase,
		`${phase}-brief`,
		".am-brief",
		at(0.69),
		{ y: 28 },
		"tick",
		0.11,
	);
	layer(
		phase,
		`${phase}-view-frame`,
		".am-view-filter",
		at(0.82),
		{ scale: 0.93 },
		null,
		0,
	);
	for (let i = 0; i < 2; i++)
		layer(
			phase,
			`${phase}-view-${i}`,
			".am-view-filter button",
			at(0.9 + i * 0.11),
			{ y: 25, scale: 0.78 },
			"toggle",
			0.12,
			i,
		);
	layer(
		phase,
		`${phase}-output-count`,
		".am-output-count",
		at(1.12),
		{ scale: 0.1 },
		"tick",
		0.1,
	);
	layer(
		phase,
		`${phase}-progress-label`,
		".am-progress-label",
		at(1.08),
		{ x: 30 },
		null,
		0,
	);
}
function activity(phase, start, rows, gap = 0.16) {
	for (let i = 0; i < rows; i++) {
		const row = `.am-activity li:nth-child(${i + 1})`,
			t = start + i * gap;
		layer(phase, `${phase}-activity-${i}`, row, t, {}, null, 0);
		layer(
			phase,
			`${phase}-marker-${i}`,
			`${row} .am-activity-marker`,
			t,
			{ scale: 0.15, rotate: -40 },
			"tick",
			0.17,
		);
		layer(
			phase,
			`${phase}-activity-text-${i}`,
			`${row} p`,
			t + 0.1,
			{ x: 65 },
			"tick",
			0.1,
		);
		layer(
			phase,
			`${phase}-time-${i}`,
			`${row} time`,
			t + 0.2,
			{ y: 15 },
			null,
			0,
		);
	}
}
function actions(phase, start) {
	layer(
		phase,
		`${phase}-action-surface`,
		".am-detail-actions",
		start,
		{ y: 28, scale: 0.98 },
		"press",
		0.2,
	);
	layer(
		phase,
		`${phase}-action-title`,
		".am-detail-actions > div > strong",
		start + 0.15,
		{ y: 28 },
		"tick",
		phase === "intro" ? 0.11 : 0,
	);
	layer(
		phase,
		`${phase}-action-context`,
		".am-detail-actions > div > span",
		start + 0.24,
		{ y: 20 },
		null,
		0,
	);
	layer(
		phase,
		`${phase}-action-button`,
		".am-detail-actions > button",
		start + 0.22,
		{ x: 90, scale: 0.7, rotate: 3 },
		"release",
		0.24,
	);
	layer(
		phase,
		`${phase}-action-icon`,
		".am-detail-actions > button .rs-icon",
		start + 0.4,
		{ rotate: -75, scale: 0.3 },
		"tick",
		0.12,
	);
	layer(
		phase,
		`${phase}-progress-head`,
		".am-run-progress .rs-progress-head",
		start + 0.15,
		{ y: 22 },
		"tick",
		phase === "intro" ? 0 : 0.14,
	);
	layer(
		phase,
		`${phase}-progress-track`,
		".am-run-progress .rs-progress",
		start + 0.28,
		{},
		"release",
		phase === "intro" ? 0 : 0.16,
	);
	layer(
		phase,
		`${phase}-progress-fill`,
		".am-run-progress .rs-progress-fill",
		start + 0.4,
		{},
		"tick",
		phase === "selected" ? 0.13 : 0,
	);
}
detail("intro", 4.65);
activity("intro", 6.02, 3);
actions("intro", 6.65);
layer("intro", "queue-count", ".am-queue-count", 7.1, { y: 14 }, "tick", 0.1);
layer("intro", "footer", ".am-footer", 7.2, { y: 18 }, null, 0);
layer("intro", "queue-rule", ".am-queue", 7.3, {}, null, 0);
layer(
	"output",
	"output-heading",
	".am-output-heading",
	9.64,
	{ y: 24 },
	"page",
	0.25,
);
for (let i = 0; i < 2; i++) {
	const t = 9.8 + i * 0.32;
	layer("output", `file-${i}`, ".am-output-file", t, {}, null, 0, i);
	layer(
		"output",
		`file-icon-${i}`,
		".am-output-file > .rs-icon",
		t + 0.04,
		{ x: -55, rotate: -15, scale: 0.4 },
		"release",
		0.18,
		i,
	);
	layer(
		"output",
		`file-name-${i}`,
		".am-output-file > div",
		t + 0.16,
		{ y: 30 },
		"tick",
		0.14,
		i,
	);
	layer(
		"output",
		`file-description-${i}`,
		".am-output-file p",
		t + 0.28,
		{ x: 55 },
		"tick",
		0.1,
		i,
	);
}
layer(
	"approved",
	"accepted-check",
	".am-complete-mark",
	13.65,
	{ scale: 0.2, rotate: -80 },
	"success",
	0.3,
);
layer(
	"approved",
	"accepted-title",
	".am-detail-actions strong",
	13.72,
	{ y: 20 },
	null,
	0,
);
layer(
	"approved",
	"accepted-context",
	".am-detail-actions > div > span",
	13.84,
	{ y: 16 },
	null,
	0,
);
layer(
	"approved",
	"accepted-status",
	".am-detail-topline .am-status-mark",
	13.7,
	{ scale: 0.2, rotate: -40 },
	"tick",
	0.13,
);
detail("selected", 16.02, 0.55);
activity("selected", 16.7, 3, 0.11);
actions("selected", 17.1);
activity("paused", 18.64, 1);
activity("resumed", 20.24, 1);
layer(
	"form",
	"form-title",
	".am-compose-heading h2",
	23.05,
	{ y: -36 },
	"page",
	0.22,
);
layer(
	"form",
	"form-close",
	".am-compose-heading button",
	23.16,
	{ x: 60, rotate: 12, scale: 0.5 },
	"release",
	0.18,
);
layer(
	"form",
	"form-description",
	".am-compose-fields > p",
	23.24,
	{ y: 25 },
	"tick",
	0.11,
);
for (let i = 0; i < 2; i++) {
	layer(
		"form",
		`field-label-${i}`,
		".am-compose .rs-field-label",
		23.43 + i * 0.3,
		{ x: 40 },
		"tick",
		0.16,
		i,
	);
}
layer(
	"form",
	"task-input",
	".am-compose .rs-input",
	23.54,
	{ y: 40, scale: 0.92 },
	"release",
	0.22,
);
layer(
	"form",
	"task-textarea",
	".am-compose .rs-textarea",
	23.86,
	{ y: 50, scale: 0.92 },
	"release",
	0.23,
);
layer(
	"form",
	"assignee-avatar",
	".am-compose-assignee .am-agent-avatar",
	24.06,
	{ x: -45, rotate: -35, scale: 0.4 },
	"tick",
	0.18,
);
layer(
	"form",
	"assignee-name",
	".am-compose-assignee strong",
	24.17,
	{ x: 40 },
	"tick",
	0.12,
);
layer(
	"form",
	"assignee-context",
	".am-compose-assignee small",
	24.27,
	{ y: 20 },
	null,
	0,
);
layer(
	"form",
	"queue-button",
	".am-compose-actions button",
	24.33,
	{ y: 38, scale: 0.75 },
	"release",
	0.2,
	0,
);
layer(
	"form",
	"cancel-button",
	".am-compose-actions button",
	24.46,
	{ x: 45, scale: 0.8 },
	"tick",
	0.15,
	1,
);
layer(
	"queued",
	"new-row",
	hero,
	29.62,
	{ x: -210, scale: 0.94 },
	"release",
	0.3,
);
layer(
	"queued",
	"new-row-title",
	`${hero} > strong`,
	29.83,
	{ x: -35 },
	"tick",
	0.14,
);
layer(
	"queued",
	"new-row-status",
	`${hero} .am-task-foot`,
	29.94,
	{ y: 20 },
	"tick",
	0.12,
);
detail("queued", 29.65, 0.45);
activity("queued", 30.21, 1);
actions("queued", 30.3);
activity("started", 31.29, 1);
layer(
	"started",
	"started-progress-head",
	".am-run-progress .rs-progress-head",
	31.3,
	{ y: 20 },
	"tick",
	0.14,
);
layer(
	"started",
	"started-progress-track",
	".am-run-progress .rs-progress",
	31.4,
	{},
	"release",
	0.18,
);
layer(
	"started",
	"started-progress-fill",
	".am-run-progress .rs-progress-fill",
	31.51,
	{},
	"tick",
	0.12,
);
layer("ending", "wordmark", "#film-wordmark", 36, { y: 80 }, "arrival", 0.32);
export const motionCues = Object.freeze(cues.map(Object.freeze));
