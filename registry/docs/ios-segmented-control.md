# iOS segmented control

A pill-shaped single choice with a full selected fill, radio semantics and arrow-key selection.

Category: ios  
Name: `ios-segmented-control`  
Also known as: UISegmentedControl, iOS segmented picker  
Page: https://vlak.dev/components/ios-segmented-control/

## When to use

- A small set of mutually exclusive modes or filters.
- Use name to include the selected value in form data.

## When not to

- Navigation among independent application destinations; use the iOS tab bar.
- Many options that require a long horizontal scroll.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { IOSSegmentedControl } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add ios-segmented-control
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/ios-segmented-control.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-ios-segmented-control" role="radiogroup" aria-label="Calendar view"><button class="rs-ios-segmented-control-item rs-ios-segmented-control-selected" role="radio" aria-checked="true" tabindex="0">Day</button><button class="rs-ios-segmented-control-item" role="radio" aria-checked="false" tabindex="-1">Month</button></div>
```

## Example

```tsx
import { IOSSegmentedControl } from "@noorddev/vlak-react";

<IOSSegmentedControl name="view" label="Calendar view" defaultValue="day" items={[{ id: "day", label: "Day" }, { id: "week", label: "Week" }, { id: "month", label: "Month" }]} />
```

## Props

### IOSSegmentedControl

A mutually exclusive choice with one Tab stop and arrow-key selection.

Extends `Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange" | "children">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` (required) | `IOSSegmentedControlItem[]` |  |  |
| `value` | `string` |  |  |
| `defaultValue` | `string` |  |  |
| `onValueChange` | `(value: string) => void` |  |  |
| `name` | `string` |  |  |
| `form` | `string` |  |  |
| `disabled` | `boolean` |  |  |
| `label` | `string` | `"View"` |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab, Shift+Tab | Enters or leaves the group through its selected option. |
| Arrows, Home, End | Moves and selects enabled options; horizontal arrows respect text direction. |
| Enter, Space | Selects the focused option. |

## Accessibility

- Named radiogroup with one tab stop, explicit checked state and disabled options.
- Native form reset is supported; reduced motion and forced colors retain readable selection.

## Classes

`rs-ios-segmented-control`, `rs-ios-segmented-control-item`, `rs-ios-segmented-control-selected`, `rs-ios-segmented-control-disabled`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/ios-segmented-control.tsx`  
CSS: `packages/core/css/components/ios-segmented-control.css`
