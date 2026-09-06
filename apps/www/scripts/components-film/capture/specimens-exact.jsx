import { useLayoutEffect, useRef } from "react";
import {
	MediaScrubber,
	MultiSelect,
	NumberField,
	PlaybackControls,
	QueryBuilder,
	RangeSlider,
	Rating,
	Switch,
	TagInput,
	Waveform,
} from "@noorddev/vlak-react";
import { PlanningSpecimen } from "./planning-exact.jsx";

/**
 * Canonical film specimens. The host loads @noorddev/vlak-react/css and its
 * bundled fonts. This module supplies only real component props and state;
 * all layout, icons, native controls, and paint remain owned by the package.
 * Widths describe the outer film host, never overrides on a component leaf.
 */
export const specimenCatalog = [
	{ id: "switch", name: "Switch", width: 44 },
	{ id: "number", name: "NumberField", width: 360 },
	{ id: "range", name: "RangeSlider", width: 560 },
	{ id: "rating", name: "Rating", width: 260 },
	{ id: "waveform", name: "Waveform", width: 800 },
	{ id: "playback", name: "PlaybackControls", width: 208 },
	{ id: "scrubber", name: "MediaScrubber", width: 800 },
	{ id: "multiselect", name: "MultiSelect", width: 320 },
	{ id: "tags", name: "TagInput", width: 480 },
	{ id: "query", name: "QueryBuilder", width: 860 },
	{ id: "scheduler", name: "Scheduler", width: 1180 },
	{ id: "kanban", name: "KanbanBoard", width: 880 },
];

const noop = () => {};
const clamp = (x) => Math.max(0, Math.min(1, x));
const smooth = (start, end, time) => {
	const p = clamp((time - start) / (end - start));
	return p * p * (3 - 2 * p);
};
const samples = Array.from(
	{ length: 128 },
	(_, index) =>
		0.08 + Math.abs(Math.sin(index * 0.37) * Math.cos(index * 0.13)) * 0.88,
);
const options = [
	{ value: "motion", label: "Motion" },
	{ value: "typography", label: "Typography" },
	{ value: "components", label: "Components" },
	{ value: "accessibility", label: "Accessibility" },
	{ value: "documentation", label: "Documentation" },
	{ value: "tokens", label: "Tokens" },
];
const fields = [{ id: "topic", label: "Topic" }];
const ruleMotion = {
	id: "motion-rule",
	field: "topic",
	operator: "is",
	value: "Motion",
};
const ruleAccessibility = {
	id: "accessibility-rule",
	field: "topic",
	operator: "is",
	value: "Accessibility",
};

function progressAt(time) {
	return (
		0.12 +
		0.33 * smooth(1.65, 3.03, time) +
		0.23 * smooth(3.12, 3.49, time) +
		0.21 * smooth(3.5, 4.65, time) -
		0.73 * smooth(5.17, 5.74, time)
	);
}

function selectionsAt(time, overview) {
	if (overview || time >= 1.73) return ["motion", "accessibility"];
	return time >= 1.25 ? ["motion"] : [];
}

function ExactMultiSelect({ time, overview }) {
	const root = useRef(null);
	const open = !overview && time >= 0.22 && time < 3.15;
	useLayoutEffect(() => {
		// MultiSelect exposes a native details disclosure, but no controlled open
		// prop. Set that native state; do not restyle or replace its implementation.
		const details = root.current?.querySelector("details");
		if (details) details.open = open;
	}, [open]);
	return (
		<MultiSelect
			ref={root}
			label="Topics"
			options={options}
			value={selectionsAt(time, overview)}
			onValueChange={noop}
			data-film-specimen="multiselect"
		/>
	);
}

/** Local chapter time: controls0–6, media0–6.5, selection0–6.5, planning0–7.5. */
export function ExactSpecimen({ id, time = 0, overview = false }) {
	const t = Math.max(0, Number.isFinite(time) ? time : 0);
	switch (id) {
		case "switch":
			return (
				<Switch
					aria-label="Visible"
					checked={overview || t >= 2.6}
					onCheckedChange={noop}
					data-film-specimen={id}
				/>
			);
		case "number": {
			const value =
				overview || t >= 4.14 ? 204 : t >= 3.72 ? 196 : t >= 3.3 ? 188 : 184;
			return (
				<NumberField
					label="Grid module"
					unit="px"
					value={value}
					min={0}
					max={512}
					step={4}
					onValueChange={noop}
					data-film-specimen={id}
				/>
			);
		}
		case "range": {
			const lower = overview ? 37 : Math.round(17 + 20 * smooth(4.1, 4.34, t));
			const upper = overview ? 73 : Math.round(90 - 17 * smooth(4.35, 4.65, t));
			return (
				<RangeSlider
					label="Range"
					value={[lower, upper]}
					min={0}
					max={100}
					step={1}
					onValueChange={noop}
					data-film-specimen={id}
				/>
			);
		}
		case "rating":
			return (
				<Rating
					label="Rating"
					value={4}
					max={5}
					onValueChange={noop}
					data-film-specimen={id}
				/>
			);
		case "waveform":
			return (
				<Waveform
					label="Field recording"
					samples={samples}
					value={overview ? 0.5 : progressAt(t)}
					onValueChange={noop}
					data-film-specimen={id}
				/>
			);
		case "playback":
			return (
				<PlaybackControls
					label="Recording transport"
					playing={!overview && t >= 1.88 && t < 4.79}
					onPlayingChange={noop}
					onPrevious={noop}
					onNext={noop}
					onStop={noop}
					data-film-specimen={id}
				/>
			);
		case "scrubber":
			return (
				<MediaScrubber
					label="Recording position"
					duration={18}
					value={overview ? 9 : Math.floor(progressAt(t) * 18)}
					buffered={16}
					onValueChange={noop}
					data-film-specimen={id}
				/>
			);
		case "multiselect":
			return <ExactMultiSelect time={t} overview={overview} />;
		case "tags": {
			const tags = selectionsAt(t, overview).map(
				(value) => options.find((option) => option.value === value).label,
			);
			return (
				<TagInput
					label="Tags"
					value={tags}
					onValueChange={noop}
					data-film-specimen={id}
				/>
			);
		}
		case "query": {
			const rules =
				overview || t >= 3.95
					? [ruleMotion, ruleAccessibility]
					: t >= 3.65
						? [ruleMotion]
						: [];
			const value = {
				id: "root",
				combinator: "and",
				rules:
					overview || t >= 3.45
						? [{ id: "topics", combinator: "or", rules }]
						: [],
			};
			return (
				<QueryBuilder
					label="Conditions"
					fields={fields}
					value={value}
					onValueChange={noop}
					data-film-specimen={id}
				/>
			);
		}
		case "scheduler":
		case "kanban":
			return <PlanningSpecimen id={id} time={t} overview={overview} />;
		default:
			throw new Error(`Unknown exact Vlak specimen: ${id}`);
	}
}
