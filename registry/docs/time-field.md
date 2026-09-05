# Time field

Edits a time using the platform's localized time control with native bounds and second-based steps.

Category: forms  
Name: `time-field`  
Also known as: TimeField, Time input, Time picker  
Page: https://vlak.dev/components/time-field/

## When to use

- A time of day with browser-native locale and keyboard behavior.
- Minutes or seconds, with the native step measured in seconds.

## When not to

- An elapsed duration; use NumberField with units.
- A calendar date; use DatePicker.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { TimeField } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add time-field
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/time-field.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<label>Start time<input class="rs-input rs-time-field" type="time" name="start-time" value="09:30" min="09:00" max="18:00" step="900" /></label>
```

## Example

```tsx
import { TimeField } from "@noorddev/vlak-react";

<TimeField label="Start time" name="start-time" defaultValue="09:30" min="09:00" max="18:00" step={900} hint="Appointments start every 15 minutes" />
```

## Props

### TimeField

The platform time editor, including its locale, keyboard and step validation.

Extends `Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "defaultValue" | "onChange">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLInputElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` |  | A 24-hour HTML time value, HH:mm or HH:mm:ss. The browser localizes editing. |
| `defaultValue` | `string` | `""` |  |
| `onValueChange` | `(value: string) => void` |  |  |
| `label` | `ReactNode` |  |  |
| `hint` | `ReactNode` |  |  |
| `error` | `ReactNode` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab, arrow keys | Uses the browser's time segment navigation and native stepping. |
| Typing | Edits the active hour, minute, or second segment according to the platform. |

## Accessibility

- Wraps Input, preserving label, hint, error, native form attributes, disabled/readOnly and the forwarded input ref.
- Values use HH:mm or HH:mm:ss; the visible editor follows the browser's locale and 12/24-hour preference.
- No date or time-zone conversion is performed. Controlled/uncontrolled state and form reset are supported.

## Classes

`rs-time-field`

## Dependencies

Registry dependencies: [input](input.md).  
React: `packages/react/src/components/time-field.tsx`  
CSS: `packages/core/css/components/time-field.css`
