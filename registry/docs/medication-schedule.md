# Medication schedule

Lists supplied medication, dose, time, and recorded status with controlled 44px recording actions.

Category: health  
Name: `medication-schedule`  
Also known as: MedicationSchedule, Medication list, Medication record, Dose log, Medication administration record  
Page: https://vlak.dev/components/medication-schedule/

## When to use

- Displaying an existing medication schedule and requesting explicit record updates.
- Supply timezone, dosing text, instructions, action labels, and recorded statuses from the application.

## When not to

- Calculating doses, suggesting medication, guessing overdue entries, or declaring a record saved from a click alone.
- Treating an empty list as evidence that a patient takes no medication.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { MedicationSchedule } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add medication-schedule
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/medication-schedule.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-medication-schedule" role="group" aria-label="Medication schedule"><div class="rs-medication-schedule-header"><span>14 September</span><span class="rs-medication-schedule-zone">Europe/Amsterdam, UTC+02:00</span></div><ol class="rs-medication-schedule-list"><li class="rs-medication-schedule-row"><span class="rs-medication-schedule-time">08:00</span><div class="rs-medication-schedule-body"><p class="rs-medication-schedule-name">Example medication</p><p class="rs-medication-schedule-detail">Dose supplied by the care team</p><p class="rs-medication-schedule-status">Not recorded</p></div></li></ol></div>
```

## Example

```tsx
import { MedicationSchedule } from "@noorddev/vlak-react";

<MedicationSchedule dateLabel="14 September" timeZone="Europe/Amsterdam, UTC+02:00" items={[{ id: "morning", name: "Example medication", dose: "Dose supplied by the care team", timeLabel: "08:00", status: "Not recorded", instructions: "Instructions supplied by the care team" }]} />

// For editing, pass explicit item.actions and onAction(itemId, actionId).
// The caller persists the choice, sets item.pending, and supplies the new status.
```

## Props

### MedicationSchedule

A controlled record of supplied medication rows, not a dosing or reminder engine.

Extends `Omit<HTMLAttributes<HTMLDivElement>, "onAction">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` (required) | `readonly MedicationScheduleItem[]` |  |  |
| `timeZone` (required) | `ReactNode` |  | Display label supplied by the application, including any relevant UTC offset. |
| `dateLabel` | `ReactNode` |  |  |
| `emptyLabel` | `ReactNode` | `"No medication entries supplied"` |  |
| `onAction` | `(itemId: string, actionId: string) => void` |  | Requests a record change. The caller persists it and supplies updated items. |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves between enabled recording buttons when onAction and item actions are supplied. |
| Enter, Space | Requests the selected recording action. Pending or disabled rows cannot request changes. |

## Accessibility

- Rows remain in supplied order in an ordered list. Optional dateTime values are passed through unchanged.
- Action names include the visible action label and medication name. Each action is described by its scheduled time, dose, and recorded status to distinguish repeated doses. Buttons have at least 44px targets.
- Pending state remains visible alongside the existing status, uses aria-busy and a polite status region, and disables recording actions.
- No internal persistence or automatic success state. Without onAction the schedule is read-only.

## Classes

`rs-medication-schedule`, `rs-medication-schedule-header`, `rs-medication-schedule-zone`, `rs-medication-schedule-list`, `rs-medication-schedule-row`, `rs-medication-schedule-time`, `rs-medication-schedule-body`, `rs-medication-schedule-name`, `rs-medication-schedule-detail`, `rs-medication-schedule-status`, `rs-medication-schedule-actions`, `rs-medication-schedule-action`, `rs-medication-schedule-empty`

## Dependencies

Registry dependencies: [button](button.md).  
React: `packages/react/src/components/medication-schedule.tsx`  
CSS: `packages/core/css/components/medication-schedule.css`
