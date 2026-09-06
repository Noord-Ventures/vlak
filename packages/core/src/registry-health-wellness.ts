import type { VlakComponent } from "./schema";

/** Caller-owned wellness records, without inferred diagnoses or targets. */
export const healthWellness: VlakComponent[] = [
  {
    name: "check-in",
    title: "Check-in",
    description: "Collects one supplied text answer with native radio controls, 44px targets, and an explicit unanswered state.",
    category: "health",
    classes: ["rs-check-in", "rs-check-in-legend", "rs-check-in-description", "rs-check-in-choices", "rs-check-in-choice", "rs-check-in-selected", "rs-check-in-unavailable", "rs-check-in-input", "rs-check-in-clear"],
    css: ["components/check-in.css"],
    react: "components/check-in.tsx",
    registryDependencies: [],
    snippet: `<fieldset class="rs-check-in"><legend class="rs-check-in-legend">How is your energy?</legend><p class="rs-check-in-description">Choose the answer that fits right now.</p><div class="rs-check-in-choices"><label class="rs-check-in-choice"><span>Low</span><input class="rs-check-in-input" type="radio" name="energy" value="low" /></label><label class="rs-check-in-choice rs-check-in-selected"><span>Steady</span><input class="rs-check-in-input" type="radio" name="energy" value="steady" checked /></label><label class="rs-check-in-choice"><span>High</span><input class="rs-check-in-input" type="radio" name="energy" value="high" /></label></div></fieldset>`,
    example: `import { CheckIn } from "@noorddev/vlak-react";

<CheckIn label="How is your energy?" description="Choose the answer that fits right now." name="energy" options={[{ value: "low", label: "Low" }, { value: "steady", label: "Steady" }, { value: "high", label: "High" }]} defaultValue={null} />`,
    usage: {
      use: ["A daily mood, comfort, or energy check-in with application-owned wording.", "Unique option values and explicit labels for every answer.", "value, defaultValue, and onValueChange with null for an unanswered check-in; name and form submit the selected string."],
      avoid: ["Inventing a clinical questionnaire, diagnostic interpretation, or score from the selected position.", "Treating an unanswered check-in as a negative answer."],
    },
    keyboard: [{ keys: "Tab", does: "Moves into the native radio group and then to the available clear action." }, { keys: "Arrow keys, Space", does: "Uses native radio selection; read-only answers prevent changes." }, { keys: "Enter, Space", does: "Activates the focused clear action." }],
    a11y: ["A fieldset and legend name the answer group; native radios use visible text labels and share a name.", "Every answer covers at least 44px in each dimension, with a focus ring and full-fill selection.", "Descriptions reach the group and each answer. Read-only controls retain the submitted value and announce their unavailable state.", "Disabled controls do not submit; required uses native radio validation. Form reset restores uncontrolled defaults and preserves controlled values.", "The forwarded ref reaches the fieldset; native fieldset attributes, className, and style pass through."],
    aliases: ["CheckIn", "Mood check-in", "Energy check-in", "Wellness check-in", "Text rating", "Self report"],
  },
  {
    name: "habit-tracker",
    title: "Habit tracker",
    description: "Shows dated complete, missed, skipped, and unrecorded states, with controlled completion actions and a responsive week view.",
    category: "health",
    classes: ["rs-habit-tracker", "rs-habit-tracker-label", "rs-habit-tracker-description", "rs-habit-tracker-days", "rs-habit-tracker-day", "rs-habit-tracker-date", "rs-habit-tracker-control", "rs-habit-tracker-complete", "rs-habit-tracker-unavailable", "rs-habit-tracker-static", "rs-habit-tracker-mark"],
    css: ["components/habit-tracker.css"],
    react: "components/habit-tracker.tsx",
    registryDependencies: [],
    snippet: `<div class="rs-habit-tracker" role="group" aria-labelledby="habit-label"><p class="rs-habit-tracker-label" id="habit-label">Evening walk</p><ul class="rs-habit-tracker-days"><li class="rs-habit-tracker-day"><span class="rs-habit-tracker-date">Mon 7 Sep</span><div class="rs-habit-tracker-control rs-habit-tracker-complete rs-habit-tracker-static"><span class="rs-habit-tracker-mark" aria-hidden="true">✓</span><span>Complete</span></div></li><li class="rs-habit-tracker-day"><span class="rs-habit-tracker-date">Tue 8 Sep</span><div class="rs-habit-tracker-control rs-habit-tracker-static"><span class="rs-habit-tracker-mark" aria-hidden="true">·</span><span>Unrecorded</span></div></li></ul></div>`,
    example: `import { useState } from "react";
import { HabitTracker } from "@noorddev/vlak-react";
import type { HabitDay } from "@noorddev/vlak-react";

function WalkingRecord() {
  const [days, setDays] = useState<HabitDay[]>([
    { date: "2026-09-07", label: "Mon 7 Sep", status: "complete" },
    { date: "2026-09-08", label: "Tue 8 Sep", status: "unrecorded" },
  ]);
  return <HabitTracker label="Evening walk" days={days} onDayChange={(date, status) => setDays((records) => records.map((day) => day.date === date ? { ...day, status } : day))} />;
}`,
    usage: {
      use: ["A week of application-owned habit records, supplied in the intended order.", "Explicit date labels and stable date keys, with no inferred current day or timezone.", "onDayChange to request complete or clear completion to unrecorded; the application updates days and owns persistence."],
      avoid: ["Inferring missed days from absent records or calculating a punitive streak.", "Assuming a click has been saved without updating and persisting the supplied data."],
    },
    keyboard: [{ keys: "Tab", does: "Moves through enabled completion controls when onDayChange is supplied." }, { keys: "Enter, Space", does: "Requests completion, or clears an existing completion to unrecorded." }],
    a11y: ["A named group contains an ordered display of supplied day records; every status remains visible as text.", "Completion controls have stable accessible names, aria-pressed, and descriptions that announce complete, missed, skipped, or unrecorded.", "Controls are at least 44px in each dimension; the responsive grid wraps on narrow screens.", "Without onDayChange or with readOnly, records render as static text. Disabled controls do not call onDayChange.", "The forwarded ref and native attributes reach the root div."],
    aliases: ["HabitTracker", "Habit calendar", "Wellness log", "Daily completion", "Habit grid"],
  },
  {
    name: "sleep-timeline",
    title: "Sleep timeline",
    description: "Displays supplied sleep, wake, and unknown intervals with explicit time labels, monochrome segments, and a complete text record.",
    category: "health",
    classes: ["rs-sleep-timeline", "rs-sleep-timeline-caption", "rs-sleep-timeline-label", "rs-sleep-timeline-description", "rs-sleep-timeline-chart", "rs-sleep-timeline-segment", "rs-sleep-timeline-asleep", "rs-sleep-timeline-awake", "rs-sleep-timeline-unknown", "rs-sleep-timeline-axis", "rs-sleep-timeline-list", "rs-sleep-timeline-interval", "rs-sleep-timeline-period"],
    css: ["components/sleep-timeline.css"],
    react: "components/sleep-timeline.tsx",
    registryDependencies: [],
    snippet: `<figure class="rs-sleep-timeline"><figcaption class="rs-sleep-timeline-caption"><span class="rs-sleep-timeline-label">Last night</span></figcaption><div class="rs-sleep-timeline-chart" aria-hidden="true"><span class="rs-sleep-timeline-segment rs-sleep-timeline-asleep" style="width:75%"></span><span class="rs-sleep-timeline-segment rs-sleep-timeline-awake" style="width:25%"></span></div><div class="rs-sleep-timeline-axis"><span>22:30</span><span>06:30</span></div><ul class="rs-sleep-timeline-list"><li class="rs-sleep-timeline-interval"><span>Asleep</span><span class="rs-sleep-timeline-period">22:30 to 04:30</span></li><li class="rs-sleep-timeline-interval"><span>Awake</span><span class="rs-sleep-timeline-period">04:30 to 06:30</span></li></ul></figure>`,
    example: `import { SleepTimeline } from "@noorddev/vlak-react";

<SleepTimeline label="Last night" description="Recorded intervals, local time" start={0} end={480} startLabel="22:30" endLabel="06:30" intervals={[
  { id: "sleep-1", start: 0, end: 240, startLabel: "22:30", endLabel: "02:30", state: "asleep" },
  { id: "wake-1", start: 240, end: 255, startLabel: "02:30", endLabel: "02:45", state: "awake" },
  { id: "sleep-2", start: 270, end: 480, startLabel: "03:00", endLabel: "06:30", state: "asleep" },
]} />`,
    usage: {
      use: ["Display-only sleep records from a caller-owned source, using minute offsets on a single timeline.", "Explicit boundary labels that include the date and timezone when needed.", "Gaps remain unrecorded; supplied unknown intervals retain their unknown state."],
      avoid: ["Inferring sleep stages, diagnosis, or sleep quality from the supplied intervals.", "Silently clipping out-of-window records, merging overlaps, or filling missing time with sleep."],
    },
    keyboard: [],
    a11y: ["A native figure and caption introduce the record. The decorative chart is hidden from assistive technology.", "Every supplied interval and unrecorded gap has a visible text equivalent with start and end labels.", "Overlapping, invalid, or out-of-window intervals produce a visible explanation and suppress the chart while preserving supplied text.", "Sleep, wake, and unknown segments use distinct monochrome fills and boundaries; forced-colors retains a dotted unknown marker.", "The forwarded ref and native attributes reach the figure."],
    aliases: ["SleepTimeline", "Sleep log", "Sleep chart", "Sleep interval", "Sleep record", "Wellness timeline"],
  },
  {
    name: "activity-goal",
    title: "Activity goal",
    description: "Shows a supplied activity amount and target with native progress, visible units, and distinct missing-data states.",
    category: "health",
    classes: ["rs-activity-goal", "rs-activity-goal-label", "rs-activity-goal-description", "rs-activity-goal-value", "rs-activity-goal-target", "rs-activity-goal-progress"],
    css: ["components/activity-goal.css"],
    react: "components/activity-goal.tsx",
    registryDependencies: [],
    snippet: `<div class="rs-activity-goal"><p class="rs-activity-goal-label" id="walking-goal">Walking</p><p class="rs-activity-goal-description">Your personal goal for today</p><p class="rs-activity-goal-value">24 <span class="rs-activity-goal-target">of 30 min</span></p><progress class="rs-activity-goal-progress" value="24" max="30" aria-labelledby="walking-goal" aria-valuetext="24 of 30 min">24 of 30 min</progress></div>`,
    example: `import { ActivityGoal } from "@noorddev/vlak-react";

<ActivityGoal label="Walking" description="Your personal goal for today" current={24} target={30} unit="min" />
<ActivityGoal label="Water recorded" current={null} target={null} unit="ml" />`,
    usage: {
      use: ["Movement, hydration, or another activity with a caller-supplied amount, unit, and positive target.", "null for missing current data or an unset target; zero remains a valid recorded amount.", "Actual values above the target remain visible while the native bar stops at its maximum."],
      avoid: ["Adding default health recommendations or interpreting goal completion as a clinical outcome.", "An indeterminate loading state; missing data is explicitly labelled and has no progress bar."],
    },
    keyboard: [],
    a11y: ["The native progress element is named by the visible label, aria-label, or aria-labelledby; aria-valuetext includes the actual amount, target, and unit.", "Missing, non-finite, negative amounts and non-positive targets have explicit text states and never produce a misleading bar or NaN attributes.", "Goal reached and goal exceeded remain text, with no color-only completion signal.", "The forwarded ref and native attributes reach the root div; descriptions are linked to progress."],
    aliases: ["ActivityGoal", "Activity progress", "Movement goal", "Hydration goal", "Step goal", "Wellness goal"],
  },
];
