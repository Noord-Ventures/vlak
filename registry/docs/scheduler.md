# Scheduler

Plans events in agenda, week, or month views with date navigation and accessible rescheduling.

Category: patterns  
Name: `scheduler`  
Also known as: Scheduler, Event calendar, Agenda  
Page: https://vlak.dev/components/scheduler/

## When to use

- An event collection in agenda, week, or month views, using a named timeZone or the browser zone.
- Selecting a new event time or rescheduling while preserving duration.

## When not to

- Recurrence expansion or conflict enforcement; prepare those in the application.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { Scheduler } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add scheduler
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/scheduler.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-scheduler" role="region" aria-label="Schedule"><h3 class="rs-scheduler-title">Monday, 7 September</h3><ol class="rs-scheduler-list"><li class="rs-scheduler-event"><span>Review</span><span class="rs-scheduler-time">09:00–09:30</span></li></ol></div>
```

## Example

```tsx
import { Scheduler } from "@noorddev/vlak-react";

<Scheduler events={events} defaultValue={new Date("2026-09-07T12:00:00Z")} timeZone="Europe/Amsterdam" defaultView="week" onSlotSelect={createEvent} onEventSelect={openEvent} onEventMove={rescheduleEvent} />
```

## Props

### Scheduler

Agenda, week, and month planning in an explicit or browser-local zone. Mutations are callbacks.

Extends `Omit<HTMLAttributes<HTMLDivElement>, "defaultValue">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `events` (required) | `readonly SchedulerEvent[]` |  |  |
| `value` | `Date` |  |  |
| `defaultValue` | `Date` |  |  |
| `onValueChange` | `(day: Date) => void` |  |  |
| `view` | `SchedulerView` |  |  |
| `defaultView` | `SchedulerView` | `"week"` |  |
| `onViewChange` | `(view: SchedulerView) => void` |  |  |
| `onEventSelect` | `(event: SchedulerEvent) => void` |  |  |
| `onSlotSelect` | `(start: Date) => void` |  |  |
| `onEventMove` | `(event: SchedulerEvent, next: { start: Date; end: Date; }) => void` |  |  |
| `weekStart` | `0 \| 1` | `1` |  |
| `locale` | `string` | `"en"` |  |
| `timeZone` | `string` |  | IANA zone, for example Europe/Amsterdam. Defaults to the browser zone. |
| `label` | `string` | `"Schedule"` |  |
| `disabled` | `boolean` | `false` |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab, Enter, Space | Operates date navigation, event buttons, scheduling actions, and view selection. |
| Escape | Closes the rescheduling dialog and returns focus to the triggering action. |

## Accessibility

- Month view is a native table with weekday headers.
- Week columns and navigation are named; native date and time inputs retain platform behavior.
- Rescheduling uses a named native dialog and announces the new time.
- Event Date values and callbacks are instants; date and time inputs use the displayed zone. Invalid intervals and nonexistent daylight-saving times are rejected. Repeated times choose the earlier occurrence.
- Server rendering uses a stable loading shell until hydration so browser time zones and the current date cannot cause a hydration mismatch.

## Classes

`rs-scheduler`, `rs-scheduler-toolbar`, `rs-scheduler-action`, `rs-scheduler-title`, `rs-scheduler-scroll`, `rs-scheduler-week`, `rs-scheduler-date`, `rs-scheduler-month`, `rs-scheduler-weekday`, `rs-scheduler-list`, `rs-scheduler-event`, `rs-scheduler-event-button`, `rs-scheduler-time`, `rs-scheduler-empty`, `rs-scheduler-form`, `rs-scheduler-day`, `rs-scheduler-selected`, `rs-scheduler-cell`, `rs-scheduler-outside`

## Dependencies

Registry dependencies: [button](button.md), [icons](icons.md), [input](input.md), [native-select](native-select.md), [dialog](dialog.md).  
React: `packages/react/src/components/scheduler.tsx`  
CSS: `packages/core/css/components/scheduler.css`
