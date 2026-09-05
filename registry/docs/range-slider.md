# Range slider

Sets an ordered numeric interval with two named native range controls and visible endpoint values.

Category: forms  
Name: `range-slider`  
Also known as: RangeSlider, Interval selector, Min max slider, Dual range  
Page: https://vlak.dev/components/range-slider/

## When to use

- A numeric lower and upper bound such as budget or duration.
- Separate labeled tracks when each endpoint needs clear keyboard and touch access.

## When not to

- A single setting; use Slider.
- Time-based seeking with buffered media; use MediaScrubber.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { RangeSlider } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add range-slider
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/range-slider.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<fieldset class="rs-range-slider"><legend class="rs-range-slider-legend">Budget</legend><div class="rs-range-slider-row"><label class="rs-range-slider-label" for="budget-from">From</label><input class="rs-range-slider-input" id="budget-from" type="range" min="0" max="800" value="120" /><output class="rs-range-slider-output" for="budget-from">120</output></div><div class="rs-range-slider-row"><label class="rs-range-slider-label" for="budget-to">To</label><input class="rs-range-slider-input" id="budget-to" type="range" min="120" max="800" value="420" /><output class="rs-range-slider-output" for="budget-to">420</output></div></fieldset>
```

## Example

```tsx
import { RangeSlider } from "@noorddev/vlak-react";

<RangeSlider label="Budget" name="budget" defaultValue={[120, 420]} min={0} max={800} step={20} formatValue={(value) => `€${value}`} />
```

## Props

### RangeSlider

Extends `Omit<HTMLAttributes<HTMLFieldSetElement>, "onChange" | "defaultValue">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLFieldSetElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `[number, number]` |  |  |
| `defaultValue` | `[number, number]` |  |  |
| `onValueChange` | `(value: [number, number]) => void` |  |  |
| `min` | `number` | `0` |  |
| `max` | `number` | `100` |  |
| `step` | `number` | `1` |  |
| `label` | `ReactNode` | `"Range"` |  |
| `lowerLabel` | `string` | `"From"` |  |
| `upperLabel` | `string` | `"To"` |  |
| `name` | `string` |  |  |
| `disabled` | `boolean` |  |  |
| `formatValue` | `(value: number) => string` | `String` |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves between the lower and upper native range inputs. |
| Arrow keys, Home, End | Uses the browser's native range stepping within the other endpoint's bounds. |

## Accessibility

- Uses a fieldset and legend with a separate label and visible output for each endpoint; each input has a 44px-high target.
- Each endpoint's native min/max prevents crossing. formatValue also supplies aria-valuetext.
- With name, native form values are submitted as name[0] and name[1]. Uncontrolled values reset with the form.
- The ref reaches the fieldset; Field hint and error descriptions reach the group.

## Classes

`rs-range-slider`, `rs-range-slider-legend`, `rs-range-slider-row`, `rs-range-slider-label`, `rs-range-slider-input`, `rs-range-slider-output`

## Dependencies

Registry dependencies: [field](field.md).  
React: `packages/react/src/components/range-slider.tsx`  
CSS: `packages/core/css/components/range-slider.css`
