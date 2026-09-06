import { KanbanBoard, Scheduler } from "@noorddev/vlak-react";

const noop = () => {};
const selectedDate = new Date("2026-09-09T12:00:00Z");
const columns = [
	{ id: "planned", label: "Planned" },
	{ id: "active", label: "In progress" },
	{ id: "complete", label: "Complete" },
];

// These are application data, shared by the two actual Vlak components.
// Every instant is explicit UTC; rescheduling preserves the event's duration.
const work = [
	["type", "Type study", 7, "09:00", "09:30"],
	["motion", "Motion study", 8, "11:00", "11:30"],
	["layout", "Layout review", 9, "09:00", "10:00"],
	["build", "Build & test", 10, "14:00", "15:00"],
	["icons", "Icon family", 11, "11:00", "12:00"],
	["documentation", "Documentation", 12, "09:00", "10:00"],
	["release", "Release notes", 13, "11:00", "12:00"],
	["ideas", "Collect ideas", 7, "14:00", "14:30"],
	["craft", "Component craft", 10, "09:00", "10:00"],
];

const initialEvents = work.map(([id, title, day, start, end]) => {
	const date = `2026-09-${String(day).padStart(2, "0")}`;
	return {
		id,
		title,
		start: new Date(`${date}T${start}:00Z`),
		end: new Date(`${date}T${end}:00Z`),
	};
});
const rescheduledEvents = initialEvents.map((event) =>
	event.id === "layout"
		? {
				...event,
				start: new Date("2026-09-10T11:30:00Z"),
				end: new Date("2026-09-10T12:30:00Z"),
			}
		: event,
);

const initialCards = work.map(([id, title], index) => ({
	id,
	title,
	columnId: columns[index % columns.length].id,
}));
const transferredCards = initialCards.map((card) =>
	card.id === "type"
		? {
				...card,
				columnId: "active",
			}
		: card.id === "motion"
			? {
					...card,
					columnId: "planned",
				}
			: card,
);

const localTime = (time, overview) =>
	overview ? 7.5 : Math.max(0, Number.isFinite(time) ? time : 0);

/** Exact Scheduler markup and paint, with a deterministic application fixture. */
export function ExactScheduler({ time = 0, overview = false }) {
	const rescheduled = localTime(time, overview) >= 2.65;
	return (
		<Scheduler
			data-film-planning="scheduler"
			data-film-state={rescheduled ? "rescheduled" : "original"}
			label="Studio schedule"
			locale="en-GB"
			timeZone="UTC"
			weekStart={1}
			value={selectedDate}
			onValueChange={noop}
			view="week"
			onViewChange={noop}
			events={rescheduled ? rescheduledEvents : initialEvents}
			onEventSelect={noop}
			onEventMove={noop}
		/>
	);
}

/** The native destination selects and column counts come from KanbanBoard. */
export function ExactKanban({ time = 0, overview = false }) {
	const transferred = localTime(time, overview) >= 6.04;
	return (
		<KanbanBoard
			data-film-planning="kanban"
			data-film-state={transferred ? "transferred" : "original"}
			label="Studio production"
			columns={columns}
			value={transferred ? transferredCards : initialCards}
			onValueChange={noop}
		/>
	);
}

export function PlanningSpecimen({ id, time = 0, overview = false }) {
	return id === "scheduler" ? (
		<ExactScheduler time={time} overview={overview} />
	) : id === "kanban" ? (
		<ExactKanban time={time} overview={overview} />
	) : null;
}
