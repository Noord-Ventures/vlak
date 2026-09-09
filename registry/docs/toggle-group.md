# Toggle group

Selects one visible option. Default joins toggles with an ink active state; subtle uses a gray rail, 3px gaps, and a soft active fill.

Category: actions  
Name: `toggle-group`  
Also known as: Toggle group, Segmented control, Exclusive toggles, Subtle toggle group  
Page: https://vlak.dev/components/toggle-group/

## When to use

- One of two to five options that should all stay visible: alignment, view mode, period.
- Default for joined controls with hairline seams. Subtle uses a soft rail, 3px inset and gaps, 4px corners, and a soft active fill without internal strokes.
- Short labels of equal weight.

## When not to

- Many or long options; use Select.
- Multiple selection; use several Toggle buttons.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { ToggleGroup } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add toggle-group
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/toggle-group.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-toggle-group" role="group" aria-label="Default alignment"><button class="rs-toggle rs-toggle-grouped rs-toggle-pressed rs-toggle-grouped-on" aria-pressed="true">Left</button><button class="rs-toggle rs-toggle-grouped" aria-pressed="false">Center</button><button class="rs-toggle rs-toggle-grouped" aria-pressed="false">Right</button></div>
<div class="rs-toggle-group rs-toggle-group-subtle" role="group" aria-label="Subtle alignment"><button class="rs-toggle rs-toggle-grouped rs-toggle-pressed rs-toggle-grouped-on rs-toggle-subtle rs-toggle-subtle-pressed rs-toggle-grouped-subtle" aria-pressed="true">Left</button><button class="rs-toggle rs-toggle-grouped rs-toggle-subtle rs-toggle-grouped-subtle" aria-pressed="false">Center</button><button class="rs-toggle rs-toggle-grouped rs-toggle-subtle rs-toggle-grouped-subtle" aria-pressed="false">Right</button></div>
```

## Example

```tsx
import { useState } from "react";
import { ToggleGroup } from "@noorddev/vlak-react";

const [align, setAlign] = useState("left");

<ToggleGroup
  variant="subtle"
  aria-label="Alignment"
  options={[
    { value: "left", label: "Left" },
    { value: "center", label: "Center" },
    { value: "right", label: "Right" },
  ]}
  value={align}
  onValueChange={setAlign}
/>
```

## Props

### ToggleGroup

One pressed at a time.

Extends `Omit<HTMLAttributes<HTMLDivElement>, "onChange">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `options` (required) | `{ value: string; label: ReactNode; }[]` |  |  |
| `value` | `string` |  |  |
| `defaultValue` | `string` |  |  |
| `onValueChange` | `(value: string) => void` |  |  |
| `variant` | `"subtle" \| "default"` | `"default"` | Subtle groups use a soft rail and individually rounded selected items. |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves between the options |
| Enter, Space | Selects the focused option |

## Accessibility

- Renders role="group" of native buttons with aria-pressed; pass aria-label to name the group.
- Controlled with value and onValueChange, or uncontrolled with defaultValue.
- Both variants retain a minimum 44px target per option and a visible keyboard focus ring. Tab visits each button; arrow keys do not change selection.

## Classes

`rs-toggle-group`, `rs-toggle-group-subtle`

## Dependencies

Registry dependencies: [toggle](toggle.md).  
React: `packages/react/src/components/toggle-group.tsx`  
CSS: `packages/core/css/components/toggle.css`
