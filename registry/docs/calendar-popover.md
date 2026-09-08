# Calendar popover

Types or picks a date and optional local time. A 1px field opens a calendar in the native top layer.

Category: forms  
Name: `calendar-popover`  
Also known as: Calendar popover, CalendarPopover, Date input, Date field, Date time picker, Local date and time, shadcn date picker  
Page: https://vlak.dev/components/calendar-popover/

## When to use

- Form dates that can be typed or chosen from a month grid.
- type="datetime-local" for a date with hour and minute controls; the value has no time zone.
- String values such as 2026-07-24 or 2026-07-24T10:30; min and max use the same format.

## When not to

- A permanently visible month grid; use Calendar.
- Date ranges; use DateRangePicker.
- An absolute timestamp shared across time zones; resolve the local value and its time zone in the application.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { CalendarPopover } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add calendar-popover
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/calendar-popover.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-calendar-popover"><label class="rs-calendar-popover-label" for="deadline">Deadline</label><div class="rs-calendar-popover-control"><input id="deadline" class="rs-input rs-input-grouped rs-calendar-popover-input" type="text" value="2026-07-24" /><button class="rs-btn-ghost rs-calendar-popover-trigger" type="button" aria-label="Open calendar" aria-haspopup="dialog" aria-expanded="false"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true"><path d="M3 3.5h10v10H3zM3 6.5h10M5.5 1.5v4M10.5 1.5v4" /></svg></button></div><input type="hidden" name="deadline" value="2026-07-24" /></div>
```

## Example

```tsx
import { useState } from "react";
import { CalendarPopover } from "@noorddev/vlak-react";

const [date, setDate] = useState("2026-07-24");
const [review, setReview] = useState("2026-07-23T10:30");

<CalendarPopover label="Print date" name="printDate" value={date} onValueChange={setDate} required />
<CalendarPopover
  label="Proof review"
  name="review"
  type="datetime-local"
  value={review}
  onValueChange={setReview}
  hint="Local date and time, without a time zone."
/>
```

## Props

### CalendarPopover

Editable civil dates with native form validation and a top-layer calendar.

Extends `InputHTMLAttributes<HTMLInputElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLInputElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | `"date" \| "datetime-local"` | `"date"` |  |
| `value` | `string` |  | Local canonical value. Typed partial drafts are emitted too. |
| `defaultValue` | `string` | `""` |  |
| `onValueChange` | `(value: string) => void` |  |  |
| `min` | `string` |  |  |
| `max` | `string` |  |  |
| `weekStart` | `0 \| 1` | `1` |  |
| `locale` | `string` | `"en"` |  |
| `triggerLabel` | `string` | `"Open calendar"` |  |
| `dialogLabel` | `string` |  |  |
| `label` | `ReactNode` |  | Label rendered above the field at 12px. |
| `ok` | `boolean` |  | Marks the field as validated: ink border and ink feedback text. |
| `feedback` | `ReactNode` |  | Quiet feedback line under the field. |
| `hint` | `ReactNode` |  | Hint under the field; it describes the control. |
| `error` | `ReactNode` |  | Error under the field; it describes the control and marks it invalid. |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves through the date field, calendar trigger, and open panel controls; leaving closes the panel |
| Enter, Space on the trigger | Opens the calendar |
| Arrow down in the field or on the trigger | Opens the calendar and focuses the selected day |
| Arrow keys, Home, End | Moves between calendar days or to the ends of the week |
| Page up, Page down | Moves by month; hold Shift to move by year |
| Enter, Space on a day | Selects the date; local date and time fields wait for Done |
| Escape | Closes the panel and discards unconfirmed date and time changes |

## Accessibility

- An editable input keeps its native label, hint, error, required, disabled and readOnly behavior. The ref resolves to this input.
- Typing emits partial drafts as well as complete values. Invalid dates and values outside min or max fail native form validation; local date and time fields display a space and emit a T between date and time.
- The named calendar trigger opens a non-modal dialog using the native Popover API, above surrounding overflow and dialogs.
- Calendar supplies a roving day grid, full-date names, selected and today states, and 44px day controls.
- The local date and time panel has separately labelled hour and minute inputs. Done confirms the draft; Escape and outside dismissal cancel it.
- A named hidden input submits the canonical string. Controlled with value and onValueChange, or uncontrolled with defaultValue.

## Classes

`rs-calendar-popover`, `rs-calendar-popover-label`, `rs-calendar-popover-control`, `rs-calendar-popover-input`, `rs-calendar-popover-trigger`, `rs-calendar-popover-panel`, `rs-calendar-popover-grid`, `rs-calendar-popover-time`, `rs-calendar-popover-actions`, `rs-calendar-popover-feedback`, `rs-calendar-popover-error`

## Dependencies

Registry dependencies: [calendar](calendar.md), [input](input.md), [button](button.md), [icons](icons.md).  
React: `packages/react/src/components/calendar-popover.tsx`  
CSS: `packages/core/css/components/calendar-popover.css`
