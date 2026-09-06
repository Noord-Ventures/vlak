# Check-in

Collects one supplied text answer with native radio controls, 44px targets, and an explicit unanswered state.

Category: health  
Name: `check-in`  
Also known as: CheckIn, Mood check-in, Energy check-in, Wellness check-in, Text rating, Self report  
Page: https://vlak.dev/components/check-in/

## When to use

- A daily mood, comfort, or energy check-in with application-owned wording.
- Unique option values and explicit labels for every answer.
- value, defaultValue, and onValueChange with null for an unanswered check-in; name and form submit the selected string.

## When not to

- Inventing a clinical questionnaire, diagnostic interpretation, or score from the selected position.
- Treating an unanswered check-in as a negative answer.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { CheckIn } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add check-in
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/check-in.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<fieldset class="rs-check-in"><legend class="rs-check-in-legend">How is your energy?</legend><p class="rs-check-in-description">Choose the answer that fits right now.</p><div class="rs-check-in-choices"><label class="rs-check-in-choice"><span>Low</span><input class="rs-check-in-input" type="radio" name="energy" value="low" /></label><label class="rs-check-in-choice rs-check-in-selected"><span>Steady</span><input class="rs-check-in-input" type="radio" name="energy" value="steady" checked /></label><label class="rs-check-in-choice"><span>High</span><input class="rs-check-in-input" type="radio" name="energy" value="high" /></label></div></fieldset>
```

## Example

```tsx
import { CheckIn } from "@noorddev/vlak-react";

<CheckIn label="How is your energy?" description="Choose the answer that fits right now." name="energy" options={[{ value: "low", label: "Low" }, { value: "steady", label: "Steady" }, { value: "high", label: "High" }]} defaultValue={null} />
```

## Props

### CheckIn

A named text choice without an inferred clinical score.

Extends `Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, "onChange" | "defaultValue">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLFieldSetElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `ReactNode` |  |  |
| `description` | `ReactNode` |  |  |
| `options` (required) | `CheckInOption[]` |  | Text answers supplied by the application. Values must be unique. |
| `value` | `string \| null` |  | null is an unanswered check-in. |
| `defaultValue` | `string \| null` | `null` |  |
| `onValueChange` | `(value: string \| null) => void` |  |  |
| `required` | `boolean` |  |  |
| `readOnly` | `boolean` | `false` |  |
| `clearable` | `boolean` | `true` |  |
| `clearLabel` | `string` | `"Clear answer"` |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves into the native radio group and then to the available clear action. |
| Arrow keys, Space | Uses native radio selection; read-only answers prevent changes. |
| Enter, Space | Activates the focused clear action. |

## Accessibility

- A fieldset and legend name the answer group; native radios use visible text labels and share a name.
- Every answer covers at least 44px in each dimension, with a focus ring and full-fill selection.
- Descriptions reach the group and each answer. Read-only controls retain the submitted value and announce their unavailable state.
- Disabled controls do not submit; required uses native radio validation. Form reset restores uncontrolled defaults and preserves controlled values.
- The forwarded ref reaches the fieldset; native fieldset attributes, className, and style pass through.

## Classes

`rs-check-in`, `rs-check-in-legend`, `rs-check-in-description`, `rs-check-in-choices`, `rs-check-in-choice`, `rs-check-in-selected`, `rs-check-in-unavailable`, `rs-check-in-input`, `rs-check-in-clear`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/check-in.tsx`  
CSS: `packages/core/css/components/check-in.css`
