# iOS slider

A native range input with a quiet track, pill thumb and synchronized stepped values.

Category: ios  
Name: `ios-slider`  
Also known as: UISlider, iOS volume slider  
Page: https://vlak.dev/components/ios-slider/

## When to use

- A bounded numeric level such as volume, brightness or playback intensity.
- Provide min, max and step when the range is discrete.

## When not to

- Values that need precise text entry without an accompanying numeric field.
- Multiple independent values; use separate labeled sliders.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { IOSSlider } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add ios-slider
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/ios-slider.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-ios-slider"><span class="rs-ios-slider-track" aria-hidden="true"><span class="rs-ios-slider-fill" style="width:50%"></span><span class="rs-ios-slider-thumb" style="inset-inline-start:50%"></span></span><input class="rs-ios-slider-input" type="range" min="0" max="100" value="50" aria-label="Volume" /></div>
```

## Example

```tsx
import { IOSSlider } from "@noorddev/vlak-react";

<IOSSlider name="volume" aria-label="Volume" min={0} max={100} defaultValue={40} onValueChange={value => console.log(value)} />
```

## Props

### IOSSlider

Native range keyboard and form behavior beneath the iOS pill thumb.

Extends `Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "defaultValue" | "min" | "max" | "step" | "children">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLInputElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `number` |  |  |
| `defaultValue` | `number` | `50` |  |
| `min` | `number` | `0` |  |
| `max` | `number` | `100` |  |
| `step` | `number \| "any"` | `1` |  |
| `onValueChange` | `(value: number) => void` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab, Shift+Tab | Moves focus to or away from the native range input. |
| Arrows, Home, End | Uses the browser’s native range stepping and boundary behavior. |

## Accessibility

- The ref reaches the native range input, with min, max, step, name and disabled attributes.
- Value and fill are normalized to the same valid step. The invisible native input keeps a 44px target.

## Classes

`rs-ios-slider`, `rs-ios-slider-disabled`, `rs-ios-slider-track`, `rs-ios-slider-fill`, `rs-ios-slider-thumb`, `rs-ios-slider-input`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/ios-slider.tsx`  
CSS: `packages/core/css/components/ios-slider.css`
