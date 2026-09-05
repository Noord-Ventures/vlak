# Date picker

Selects a date from a calendar overlay opened by a 1px trigger.

Category: forms  
Name: `date-picker`  
Also known as: Date picker, DatePicker, Date input, Date field  
Page: https://vlak.dev/components/date-picker/

## When to use

- A date field in a form where the calendar should stay out of the way until asked.
- format to render the chosen date your way.

## When not to

- Dates the user knows by heart; use Input type="date".
- Always-visible calendars; use Calendar.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { DatePicker } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add date-picker
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/date-picker.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<button class="rs-dropdown"><span>24 July 2026</span></button>
```

## Example

```tsx
import { useState } from "react";
import { DatePicker } from "@noorddev/vlak-react";

const [date, setDate] = useState<Date>();

<DatePicker value={date} onValueChange={setDate} placeholder="Pick a date" dialogLabel="Choose a date" />
```

## Props

### DatePicker

Hairline trigger that opens a calendar in a non-modal dialog. Focus moves to the selected (or today's) day; Escape, Tab out, and a click outside close it; focus returns to the trigger.

Extends `Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Date` |  |  |
| `defaultValue` | `Date` |  |  |
| `onValueChange` | `(date: Date) => void` |  |  |
| `onChange` | `(date: Date) => void` |  | Deprecated. Use `onValueChange`. |
| `placeholder` | `string` | `"Pick a date"` |  |
| `format` | `(date: Date) => string` | `defaultDateFormat` |  |
| `disabled` | `boolean` |  |  |
| `min` | `Date` |  |  |
| `max` | `Date` |  |  |
| `isDateDisabled` | `(date: Date) => boolean` |  |  |
| `locale` | `string` |  |  |
| `dialogLabel` | `string` | `"Choose a date"` | Accessible name of the calendar dialog. |

## Keyboard

| Keys | Does |
| --- | --- |
| Enter, Space, Arrow down | Opens the calendar |
| Arrow keys, Home, End, Page up, Page down | Move through the calendar |
| Enter, Space | Selects the day and closes |
| Escape | Closes and returns focus to the trigger |
| Tab | Moves through the calendar controls; leaving the picker closes it |

## Accessibility

- The trigger is a <button> with aria-haspopup="dialog", aria-expanded, and aria-controls; the calendar sits in a non-modal role="dialog" named by dialogLabel.
- On open, focus moves to the selected day or today; on close it returns to the trigger.
- min, max, isDateDisabled and locale pass through to Calendar. The native top-layer panel follows its trigger and flips or clamps to the viewport.
- Controlled with value and onValueChange, or uncontrolled with defaultValue.

## Classes

`rs-date-picker-cal-menu`

## Dependencies

Registry dependencies: [dropdown-menu](dropdown-menu.md), [calendar](calendar.md).  
React: `packages/react/src/components/date-picker.tsx`  
CSS: `packages/core/css/components/date-picker.css`
