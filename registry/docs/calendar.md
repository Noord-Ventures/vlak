# Calendar

Selects a date from a month grid. Selected day fills with ink; today has a 1px outline.

Category: forms  
Name: `calendar`  
Also known as: Calendar, Date grid, Month view, Day picker  
Page: https://vlak.dev/components/calendar/

## When to use

- Picking one day when the month context matters: bookings, deadlines, schedules.
- Inline on the page; DatePicker wraps it in a trigger.

## When not to

- Typing a known date; use Input type="date".
- Ranges; the grid selects one day.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { Calendar } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add calendar
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/calendar.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-cal"><div class="rs-cal-head"><span class="rs-cal-title">July 2026</span><span class="rs-cal-nav"><button class="rs-page"><svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter"><path d="M10.5 3.75 L5.5 8.25 L10.5 12.75" vector-effect="non-scaling-stroke"/></svg></button><button class="rs-page"><svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter"><path d="M5.5 3.75 L10.5 8.25 L5.5 12.75" vector-effect="non-scaling-stroke"/></svg></button></span></div><div class="rs-cal-grid" role="grid"><div class="rs-cal-row" role="row"><span class="rs-cal-dow" role="columnheader">Mo</span><span class="rs-cal-dow" role="columnheader">Tu</span><span class="rs-cal-dow" role="columnheader">We</span><span class="rs-cal-dow" role="columnheader">Th</span><span class="rs-cal-dow" role="columnheader">Fr</span><span class="rs-cal-dow" role="columnheader">Sa</span><span class="rs-cal-dow" role="columnheader">Su</span></div><div class="rs-cal-row" role="row"><button class="rs-cal-day" role="gridcell" tabindex="-1">20</button><button class="rs-cal-day" role="gridcell" tabindex="-1">21</button><button class="rs-cal-day" role="gridcell" tabindex="-1">22</button><button class="rs-cal-day" role="gridcell" tabindex="-1">23</button><button class="rs-cal-day rs-cal-day-selected" role="gridcell" tabindex="0" aria-selected="true">24</button><button class="rs-cal-day rs-cal-day-today" role="gridcell" tabindex="-1" aria-current="date">25</button><button class="rs-cal-day" role="gridcell" tabindex="-1">26</button></div></div></div>
```

## Example

```tsx
import { useState } from "react";
import { Calendar } from "@noorddev/vlak-react";

const [date, setDate] = useState<Date>();

<Calendar value={date} onValueChange={setDate} weekStart={1} />
```

## Props

### Calendar

Month grid with one roving tab stop. Arrows move by day and week, Home/End to the week's ends, PageUp/PageDown by month (Shift: year). Selected is ink; today is a hairline.

Extends `Omit<HTMLAttributes<HTMLDivElement>, "onSelect" | "defaultValue">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Date` |  |  |
| `defaultValue` | `Date` |  |  |
| `onValueChange` | `(date: Date) => void` |  |  |
| `onSelect` | `(date: Date) => void` |  | Deprecated. Use `onValueChange`. |
| `defaultMonth` | `Date` |  |  |
| `weekStart` | `0 \| 1` | `1` | 0 = Sunday, 1 = Monday. |
| `autoFocus` | `boolean` |  | Move focus to the roving day on mount (a date picker opening). |
| `min` | `Date` |  |  |
| `max` | `Date` |  |  |
| `disabled` | `boolean` | `false` |  |
| `isDateDisabled` | `(date: Date) => boolean` |  |  |
| `locale` | `string` | `"en"` |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Focuses the month buttons, then the roving day |
| Arrow left, Arrow right | Previous or next day |
| Arrow up, Arrow down | Same day the week before or after |
| Home, End | First or last day of the week |
| Page up, Page down | Same day the month before or after |
| Shift + Page up, Shift + Page down | Same day the year before or after |
| Enter, Space | Selects the focused available day |

## Accessibility

- Renders role="grid" labelled by the month title, which is aria-live="polite"; rows are role="row" and weekday headers are role="columnheader" with long names.
- Days are <button role="gridcell"> with a full-date aria-label, aria-selected, and aria-current="date" on today; one roving tab stop.
- Previous and next month buttons are labelled. Controlled with value and onValueChange, or uncontrolled with defaultValue.
- Days and month controls are 44px targets. min, max and isDateDisabled prevent selection; unavailable days expose aria-disabled while remaining discoverable with arrows.
- locale formats the month, weekdays and full-date labels; weekStart sets Sunday or Monday independently. disabled removes the day grid from the tab order.

## Classes

`rs-cal`, `rs-cal-head`, `rs-cal-title`, `rs-cal-nav`, `rs-cal-grid`, `rs-cal-row`, `rs-cal-dow`, `rs-cal-day`, `rs-cal-day-out`, `rs-cal-day-today`, `rs-cal-day-selected`, `rs-cal-icon`, `rs-cal-page`

## Dependencies

Registry dependencies: [pagination](pagination.md).  
React: `packages/react/src/components/calendar.tsx`  
CSS: `packages/core/css/components/calendar.css`
