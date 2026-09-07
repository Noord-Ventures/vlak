# Parameter knob

Displays a rotary parameter over a native horizontal range input, with named values, units, and a 64px control.

Category: creative  
Name: `parameter-knob`  
Also known as: ParameterKnob, Rotary control, Dial, Audio knob, Parameter dial  
Page: https://vlak.dev/components/parameter-knob/

## When to use

- A compact bounded parameter with an explicit label, step, and unit.
- value/defaultValue/onValueChange and native form attributes; the ref reaches the range input.
- Horizontal pointer movement and the browser's native range keyboard behavior.

## When not to

- Implying circular pointer dragging; the dial is a visual representation of a horizontal range.
- Non-finite values or invalid bounds; they render an unavailable disabled control.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { ParameterKnob } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add parameter-knob
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/parameter-knob.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-parameter-knob"><label class="rs-parameter-knob-label" for="mix-knob">Mix</label><div class="rs-parameter-knob-control"><span class="rs-parameter-knob-pointer" aria-hidden="true" style="transform:rotate(0deg)"></span><input class="rs-parameter-knob-input" id="mix-knob" type="range" min="0" max="100" step="1" value="50" aria-valuetext="50%" /></div><span class="rs-parameter-knob-value">50%</span></div>
```

## Example

```tsx
import { ParameterKnob } from "@noorddev/vlak-react";

<ParameterKnob label="Mix" name="mix" min={0} max={100} step={1} defaultValue={35} unit="%" />
```

## Props

### ParameterKnob

A rotary display driven by a native horizontal range input.

Extends `Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "defaultValue" | "onChange" | "min" | "max" | "step">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLInputElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `ReactNode` |  |  |
| `value` | `number` |  |  |
| `defaultValue` | `number` |  |  |
| `onValueChange` | `(value: number) => void` |  |  |
| `min` | `number` | `0` |  |
| `max` | `number` | `100` |  |
| `step` | `number` | `1` |  |
| `unit` | `string` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Focuses the native range input and its visible dial ring. |
| Arrow keys, Home, End | Uses native range stepping and bounds unless read-only. |

## Accessibility

- The native range uses the visible label and exposes min, max, step, and value text including the unit.
- The full 64px dial is the input target; the pointer graphic is decorative.
- Form reset restores uncontrolled defaults and preserves controlled values.
- The ref, native input attributes, className, and style reach the range input.

## Classes

`rs-parameter-knob`, `rs-parameter-knob-label`, `rs-parameter-knob-control`, `rs-parameter-knob-pointer`, `rs-parameter-knob-input`, `rs-parameter-knob-value`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/parameter-knob.tsx`  
CSS: `packages/core/css/components/parameter-knob.css`
