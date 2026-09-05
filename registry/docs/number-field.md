# Number field

Edits a numeric value with native validation, units, and bounded 44px increase and decrease actions.

Category: forms  
Name: `number-field`  
Also known as: NumberField, Number input, Numeric stepper, Quantity field  
Page: https://vlak.dev/components/number-field/

## When to use

- Numeric quantities that need visible stepping, native bounds, or a unit.
- Stacked controls when increase belongs above decrease at the end of a reading.

## When not to

- A continuous interval with two endpoints; use RangeSlider.
- Codes and identifiers, which may have leading zeroes; use Input.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { NumberField } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add number-field
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/number-field.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-number-field"><label class="rs-number-field-label" for="cabin-temperature">Cabin temperature</label><div class="rs-number-field-row"><input class="rs-input rs-number-field-input" id="cabin-temperature" type="number" min="16" max="28" value="20" aria-describedby="cabin-unit" /><span class="rs-number-field-unit" id="cabin-unit">°C</span><div class="rs-number-field-controls"><button class="rs-btn-ghost rs-number-field-action" type="button" aria-label="Decrease value">−</button><button class="rs-btn-ghost rs-number-field-action" type="button" aria-label="Increase value">+</button></div></div></div>
```

## Example

```tsx
import { NumberField } from "@noorddev/vlak-react";

<NumberField label="Cabin temperature" name="temperature" defaultValue={20} min={16} max={28} step={0.5} unit="°C" controlsPlacement="stacked" />
```

## Props

### NumberField

Numeric input with native validation and bounded increment/decrement actions.

Extends `Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "defaultValue" | "onChange" | "size" | "min" | "max" | "step">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLInputElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `number \| null` |  |  |
| `defaultValue` | `number \| null` | `null` |  |
| `onValueChange` | `(value: number \| null) => void` |  |  |
| `min` | `number` |  |  |
| `max` | `number` |  |  |
| `step` | `number` | `1` |  |
| `label` | `ReactNode` |  |  |
| `unit` | `string` |  |  |
| `incrementLabel` | `string` | `"Increase value"` |  |
| `decrementLabel` | `string` | `"Decrease value"` |  |
| `controlsPlacement` | `"inline" \| "stacked"` | `"inline"` | Stack the increase button above decrease at the end of the field. |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves between the number field and available step actions. |
| Arrow up, Arrow down | Uses the browser's native numeric stepping while the input is focused. |
| Enter, Space | Activates a focused increase or decrease button. |

## Accessibility

- The forwarded ref reaches the native number input; label, native form attributes, and name reach that input.
- min, max, and step use native validity. The buttons clamp at bounds; typed values retain native validation feedback.
- A cleared field reports null. value/defaultValue/onValueChange support controlled and uncontrolled use; form reset restores uncontrolled defaults.
- The unit is linked as a description. Each step action has a name and a 44px target.

## Classes

`rs-number-field`, `rs-number-field-label`, `rs-number-field-row`, `rs-number-field-input`, `rs-number-field-unit`, `rs-number-field-action`, `rs-number-field-controls`, `rs-number-field-controls-stacked`

## Dependencies

Registry dependencies: [input](input.md), [button](button.md).  
React: `packages/react/src/components/number-field.tsx`  
CSS: `packages/core/css/components/number-field.css`
