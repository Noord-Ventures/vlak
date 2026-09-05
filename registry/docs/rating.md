# Rating

Collects a discrete numeric score with 44px native radio choices and an optional clear action.

Category: forms  
Name: `rating`  
Also known as: Rating, Score input, Rating group  
Page: https://vlak.dev/components/rating/

## When to use

- An explicit score on a short, ordered scale.
- Clearable feedback where no rating is distinct from the lowest score.

## When not to

- Unordered choices; use Radio.
- Large or continuous numeric ranges; use Slider or NumberField.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { Rating } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add rating
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/rating.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<fieldset class="rs-rating"><legend class="rs-rating-legend">Usefulness</legend><div class="rs-rating-choices"><label class="rs-rating-choice">1<input class="rs-rating-input" type="radio" name="usefulness" value="1" aria-label="1 of 3" /></label><label class="rs-rating-choice rs-rating-selected">2<input class="rs-rating-input" type="radio" name="usefulness" value="2" aria-label="2 of 3" checked /></label><label class="rs-rating-choice">3<input class="rs-rating-input" type="radio" name="usefulness" value="3" aria-label="3 of 3" /></label></div></fieldset>
```

## Example

```tsx
import { Rating } from "@noorddev/vlak-react";

<Rating label="How useful was this?" name="usefulness" max={5} defaultValue={4} getLabel={(value, max) => `${value} out of ${max}`} />
```

## Props

### Rating

A discrete score using native radios; zero means no rating.

Extends `Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, "onChange" | "defaultValue">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLFieldSetElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `number` |  |  |
| `defaultValue` | `number` | `0` |  |
| `onValueChange` | `(value: number) => void` |  |  |
| `max` | `number` | `5` |  |
| `label` | `ReactNode` | `"Rating"` |  |
| `getLabel` | `(value: number, max: number) => string` | `(score, total) => \`${score} of ${total}\`` |  |
| `clearable` | `boolean` | `true` |  |
| `clearLabel` | `string` | `"Clear rating"` |  |
| `required` | `boolean` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Enters the native radio group at its current choice and reaches Clear. |
| Arrow keys | Moves and selects among the native radio choices. |
| Space | Selects a focused radio or activates Clear. |

## Accessibility

- The fieldset legend names the score; getLabel gives each choice a complete name such as 3 of 5.
- Selection changes the full choice surface. Each choice is 44px with a 4px corner and a visible focus outline.
- Zero means no rating. max is limited to 1–10 whole choices. required uses native radio-group validation.
- name submits the selected score. The ref reaches the fieldset; uncontrolled values reset with the form.

## Classes

`rs-rating`, `rs-rating-legend`, `rs-rating-choices`, `rs-rating-choice`, `rs-rating-selected`, `rs-rating-input`, `rs-rating-clear`

## Dependencies

Registry dependencies: [button](button.md).  
React: `packages/react/src/components/rating.tsx`  
CSS: `packages/core/css/components/rating.css`
