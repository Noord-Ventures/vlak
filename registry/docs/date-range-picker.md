# Date range picker

Collects start and end dates with two native date editors, shared constraints, and 44px controls.

Category: forms  
Name: `date-range-picker`  
Also known as: DateRangePicker, Date interval, Start and end dates  
Page: https://vlak.dev/components/date-range-picker/

## When to use

- A start/end date range that should use the platform's date editor and calendar picker.
- Forms that submit ISO calendar dates without time-zone conversion.

## When not to

- A single date; use DatePicker or Calendar.
- Time-of-day selection; use TimeField.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { DateRangePicker } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add date-range-picker
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/date-range-picker.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<fieldset class="rs-date-range-picker"><legend class="rs-date-range-picker-legend">Stay</legend><div class="rs-date-range-picker-fields"><label>Start date<input class="rs-input rs-date-range-picker-input" type="date" name="stay[start]" value="2026-09-08" /></label><label>End date<input class="rs-input rs-date-range-picker-input" type="date" name="stay[end]" min="2026-09-08" value="2026-09-12" /></label></div></fieldset>
```

## Example

```tsx
import { DateRangePicker } from "@noorddev/vlak-react";

<DateRangePicker label="Stay" name="stay" defaultValue={{ start: "2026-09-08", end: "2026-09-12" }} min="2026-09-01" required />
```

## Props

### DateRangePicker

Two native date editors share bounds; changing the start beyond the end clears the end.

Extends `Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, "onChange" | "defaultValue">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLFieldSetElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `DateRangeValue` |  | ISO calendar dates, YYYY-MM-DD; no time zone conversion. |
| `defaultValue` | `DateRangeValue` | `{ start: "", end: "" }` |  |
| `onValueChange` | `(value: DateRangeValue) => void` |  |  |
| `label` | `ReactNode` | `"Date range"` |  |
| `startLabel` | `string` | `"Start date"` |  |
| `endLabel` | `string` | `"End date"` |  |
| `min` | `string` |  |  |
| `max` | `string` |  |  |
| `required` | `boolean` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves through the two native date editors and their platform picker controls. |
| Arrow keys | Edits the active date segment according to the browser's native behavior. |

## Accessibility

- Uses a fieldset/legend and a separately labeled native date input for each endpoint. The browser owns each date popup.
- Values use year-month-day strings, for example 2026-09-06. A new start after the old end clears the end; end's minimum follows the start.
- min, max, and required use native constraint validation. A supplied inverted controlled range is marked invalid.
- With name, form fields are name[start] and name[end]. The ref reaches the fieldset; uncontrolled values reset with the form.

## Classes

`rs-date-range-picker`, `rs-date-range-picker-legend`, `rs-date-range-picker-fields`, `rs-date-range-picker-input`

## Dependencies

Registry dependencies: [input](input.md), [field](field.md).  
React: `packages/react/src/components/date-range-picker.tsx`  
CSS: `packages/core/css/components/date-range-picker.css`
