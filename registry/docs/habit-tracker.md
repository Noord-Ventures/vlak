# Habit tracker

Shows dated complete, missed, skipped, and unrecorded states, with controlled completion actions and a responsive week view.

Category: health  
Name: `habit-tracker`  
Also known as: HabitTracker, Habit calendar, Wellness log, Daily completion, Habit grid  
Page: https://vlak.dev/components/habit-tracker/

## When to use

- A week of application-owned habit records, supplied in the intended order.
- Explicit date labels and stable date keys, with no inferred current day or timezone.
- onDayChange to request complete or clear completion to unrecorded; the application updates days and owns persistence.

## When not to

- Inferring missed days from absent records or calculating a punitive streak.
- Assuming a click has been saved without updating and persisting the supplied data.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { HabitTracker } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add habit-tracker
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/habit-tracker.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-habit-tracker" role="group" aria-labelledby="habit-label"><p class="rs-habit-tracker-label" id="habit-label">Evening walk</p><ul class="rs-habit-tracker-days"><li class="rs-habit-tracker-day"><span class="rs-habit-tracker-date">Mon 7 Sep</span><div class="rs-habit-tracker-control rs-habit-tracker-complete rs-habit-tracker-static"><span class="rs-habit-tracker-mark" aria-hidden="true">✓</span><span>Complete</span></div></li><li class="rs-habit-tracker-day"><span class="rs-habit-tracker-date">Tue 8 Sep</span><div class="rs-habit-tracker-control rs-habit-tracker-static"><span class="rs-habit-tracker-mark" aria-hidden="true">·</span><span>Unrecorded</span></div></li></ul></div>
```

## Example

```tsx
import { useState } from "react";
import { HabitTracker } from "@noorddev/vlak-react";
import type { HabitDay } from "@noorddev/vlak-react";

function WalkingRecord() {
  const [days, setDays] = useState<HabitDay[]>([
    { date: "2026-09-07", label: "Mon 7 Sep", status: "complete" },
    { date: "2026-09-08", label: "Tue 8 Sep", status: "unrecorded" },
  ]);
  return <HabitTracker label="Evening walk" days={days} onDayChange={(date, status) => setDays((records) => records.map((day) => day.date === date ? { ...day, status } : day))} />;
}
```

## Props

### HabitTracker

Dated completion records with caller-owned state and no inferred streak.

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `ReactNode` |  |  |
| `description` | `ReactNode` |  |  |
| `days` (required) | `HabitDay[]` |  | A supplied week or another dated range, rendered in the given order. |
| `onDayChange` | `(date: string, status: HabitStatus) => void` |  | A completion action requests complete, or unrecorded when clearing completion. |
| `disabled` | `boolean` | `false` |  |
| `readOnly` | `boolean` | `false` |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves through enabled completion controls when onDayChange is supplied. |
| Enter, Space | Requests completion, or clears an existing completion to unrecorded. |

## Accessibility

- A named group contains an ordered display of supplied day records; every status remains visible as text.
- Completion controls have stable accessible names, aria-pressed, and descriptions that announce complete, missed, skipped, or unrecorded.
- Controls are at least 44px in each dimension; the responsive grid wraps on narrow screens.
- Without onDayChange or with readOnly, records render as static text. Disabled controls do not call onDayChange.
- The forwarded ref and native attributes reach the root div.

## Classes

`rs-habit-tracker`, `rs-habit-tracker-label`, `rs-habit-tracker-description`, `rs-habit-tracker-days`, `rs-habit-tracker-day`, `rs-habit-tracker-date`, `rs-habit-tracker-control`, `rs-habit-tracker-complete`, `rs-habit-tracker-unavailable`, `rs-habit-tracker-static`, `rs-habit-tracker-mark`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/habit-tracker.tsx`  
CSS: `packages/core/css/components/habit-tracker.css`
