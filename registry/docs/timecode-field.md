# Timecode field

Edits hours, minutes, seconds, and frames with native form validation for a supplied integer non-drop frame rate.

Category: creative  
Name: `timecode-field`  
Also known as: TimecodeField, Timecode input, Frame address, In point, Out point, Non-drop timecode  
Page: https://vlak.dev/components/timecode-field/

## When to use

- Integer non-drop rates from 1 through 99, supplied explicitly by the application.
- Two-digit hours, minutes, seconds, and frames separated by colons.
- onValueChange receives editable text, including incomplete input; check native validity before committing.

## When not to

- Drop-frame, fractional frame rates, or automatic conversion between timecode standards.
- Coercing invalid frame numbers into a different timestamp without user intent.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { TimecodeField } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add timecode-field
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/timecode-field.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-timecode-field"><label class="rs-timecode-field-label" for="in-point">In point</label><input class="rs-input rs-input-full rs-timecode-field-input" id="in-point" type="text" value="00:01:24:12" pattern="[0-9]{2}:[0-5][0-9]:[0-5][0-9]:[0-9]{2}" aria-describedby="in-point-hint" /><p class="rs-timecode-field-hint" id="in-point-hint">24 fps, non-drop. Hours:minutes:seconds:frames.</p></div>
```

## Example

```tsx
import { TimecodeField } from "@noorddev/vlak-react";

<TimecodeField label="In point" name="inPoint" frameRate={24} defaultValue="00:01:24:12" required />
```

## Props

### TimecodeField

Editable hours, minutes, seconds and frames for integer non-drop timecode.

Extends `Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "defaultValue" | "onChange" | "pattern">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLInputElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `ReactNode` |  |  |
| `frameRate` (required) | `number` |  | Integer non-drop frame rate from 1 to 99. |
| `value` | `string` |  |  |
| `defaultValue` | `string` | `""` |  |
| `onValueChange` | `(value: string) => void` |  | Receives editable text, including incomplete or invalid input. |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Focuses the native text input. |
| Text editing keys | Edits and selects timecode text using native input behavior. |

## Accessibility

- A visible label names the input, and the frame-rate hint or validation error is linked as its description.
- The format pattern and custom validity reject out-of-range frames and unsupported rates; required uses native form validation.
- A 44px input target and focus ring accompany aria-invalid on invalid timecode.
- The ref and native input attributes reach the input; uncontrolled form reset restores the default text.

## Classes

`rs-timecode-field`, `rs-timecode-field-label`, `rs-timecode-field-input`, `rs-timecode-field-hint`

## Dependencies

Registry dependencies: [input](input.md).  
React: `packages/react/src/components/timecode-field.tsx`  
CSS: `packages/core/css/components/timecode-field.css`
