# Slider

Selects one value from a range. A fine track sits inside a 44px hit area.

Category: forms  
Name: `slider`  
Also known as: Slider, Range, Range input  
Page: https://vlak.dev/components/slider/

## When to use

- A number inside a known range where the position matters more than the digits.
- Volume, opacity, zoom, and similar live values.

## When not to

- Exact values; use Input type="number".
- Ranges with two thumbs; the component has one.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { Slider } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add slider
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/slider.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-slider"><span class="rs-slider-fill" style="width:62%"></span><span class="rs-slider-thumb" style="left:62%"></span></div>
```

## Example

```tsx
import { useState } from "react";
import { Slider } from "@noorddev/vlak-react";

const [volume, setVolume] = useState(62);

<Slider value={volume} onValueChange={setVolume} min={0} max={100} step={1} aria-label="Volume" />
```

## Props

### Slider

A native range input drives the ink track.

Extends `Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "defaultValue" | "onChange">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLInputElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `number` |  |  |
| `defaultValue` | `number` | `50` |  |
| `min` | `number` | `0` |  |
| `max` | `number` | `100` |  |
| `step` | `number` | `1` |  |
| `onValueChange` | `(value: number) => void` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves focus to the slider |
| Arrow right, Arrow up | Increases by step |
| Arrow left, Arrow down | Decreases by step |
| Home, End | Jumps to min or max |

## Accessibility

- A native <input type="range"> drives the ink track; the platform exposes value, min, and max.
- It has no visible text; pass aria-label or aria-labelledby.
- The visible thumb sits on a 44px hit area and shows a focus ring on :focus-visible.

## Classes

`rs-slider`, `rs-slider-fill`, `rs-slider-thumb`, `rs-slider-thumb-focused`, `rs-slider-range`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/slider.tsx`  
CSS: `packages/core/css/components/slider.css`
