# Health, wellness, and care

Compose readings, daily routines, and care workflows from the health collection. Each component is available as React, CSS, and a registry item.

## Readings and observations

Keep a reading with its unit, source, collection time, and result status. Compare only against the reference interval supplied with that result.

- [Health metric](https://vlak.dev/docs/health-metric.md): A supplied health reading, unit, time and source with explicit pending, unavailable and stale states.
- [Reference range](https://vlak.dev/docs/reference-range.md): Positions a supplied numeric reading against caller-supplied reference bounds, with a complete text equivalent.
- [Lab results](https://vlak.dev/docs/lab-results.md): A named collection of supplied laboratory results with units, reference intervals, report times and amendment notes.
- [Symptom diary](https://vlak.dev/docs/symptom-diary.md): A chronological record of supplied symptoms and intensity descriptions, with notes and 44px native detail disclosures.

## Daily wellbeing

Collect a check-in, record a routine, review a sleep period, and follow personal goals as a bar or concentric rings. Keep unrecorded days and gaps visible.

- [Check-in](https://vlak.dev/docs/check-in.md): Collects one supplied text answer with native radio controls, 44px targets, and an explicit unanswered state.
- [Habit tracker](https://vlak.dev/docs/habit-tracker.md): Shows dated complete, missed, skipped, and unrecorded states, with controlled completion actions and a responsive week view.
- [Sleep timeline](https://vlak.dev/docs/sleep-timeline.md): Displays supplied sleep, wake, and unknown intervals with explicit time labels, monochrome segments, and a complete text record.
- [Activity goal](https://vlak.dev/docs/activity-goal.md): Shows a supplied activity amount and target with native progress, visible units, and distinct missing-data states.
- [Activity rings](https://vlak.dev/docs/activity-rings.md): Shows one to six personal goals as concentric rings with a staggered entrance, gentle rotating encouragement, named progress and explicit missing-data states.

## Care workflows

Keep patient identity and recorded context together. Show the supplied medication schedule, appointment details, and care tasks with explicit action states.

- [Patient banner](https://vlak.dev/docs/patient-banner.md): Keeps a supplied patient identity, identifiers, and recorded context together in a responsive band.
- [Medication schedule](https://vlak.dev/docs/medication-schedule.md): Lists supplied medication, dose, time, and recorded status with controlled 44px recording actions.
- [Appointment card](https://vlak.dev/docs/appointment-card.md): Groups supplied appointment time, timezone, clinician, location, and status with an optional action slot.
- [Care plan](https://vlak.dev/docs/care-plan.md): Lists supplied care tasks, owners, due labels, and statuses with controlled completion requests.

## Data and action contracts

### Preserve missing information

Zero is a reading. Missing, pending, unavailable, skipped, and not recorded describe different states. Pass the state explicitly and retain the original value.

### Keep context with a value

Supply units, source, collection time, display labels, and the relevant time zone. Format dates in the application so the server and browser show the same appointment or measurement time.

### Supply clinical meaning

The application supplies result flags, reference intervals, medication instructions, and care priorities. These components present that information; they do not calculate diagnoses, recommend doses, or classify a person from a reading.

### Confirm recorded actions

Medication and care-plan callbacks express a requested action. Keep the item pending while saving, show the confirmed state after success, and preserve the prior record when saving fails.

### Use text as well as geometry

Status is written in words. Ranges and timelines include text equivalents. Check-ins use named native choices, and controls retain keyboard access and 44px targets.

### Connect the product boundary

The host application owns identity, access control, persistence, audit history, and any health-record integration. Examples use fictional records and local demonstration state.

## Compose with the wider system

Use NumberField and Field for measurement entry, DateRangePicker for reporting periods, Scheduler for booking, MessageComposer for care conversations, and ErrorSummary for a submission that needs attention.

## Install

```sh
npm install @noorddev/vlak-react
# Or vendor an individual component
npx @noorddev/vlak-cli add check-in
# Or use the registry
npx shadcn add https://vlak.dev/r/check-in.json
```
