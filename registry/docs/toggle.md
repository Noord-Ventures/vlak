# Toggle

Turns one persistent option on or off with aria-pressed. Default uses an ink fill when pressed; subtle uses a soft fill and stronger text.

Category: actions  
Name: `toggle`  
Also known as: Toggle, Toggle button, Press button, Subtle toggle  
Page: https://vlak.dev/components/toggle/

## When to use

- A formatting or filter option that is on or off and stays in view.
- Default for a bordered toggle with an ink pressed state. Subtle stays transparent on hover while muted text turns to ink; pressing adds a soft fill and stronger text.
- Several independent toggles in a row.

## When not to

- A setting that applies immediately to the app; use Switch.
- One of several; use ToggleGroup.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { Toggle, ToggleGroup } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add toggle
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/toggle.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<button class="rs-toggle rs-toggle-pressed" aria-pressed="true">Bold</button>
<button class="rs-toggle rs-toggle-subtle" aria-pressed="false">Italic</button>
<button class="rs-toggle rs-toggle-pressed rs-toggle-subtle rs-toggle-subtle-pressed" aria-pressed="true">Underline</button>
<button class="rs-toggle rs-toggle-subtle" aria-pressed="false" disabled>Strikethrough</button>
```

## Example

```tsx
import { useState } from "react";
import { Toggle } from "@noorddev/vlak-react";

const [bold, setBold] = useState(false);
const [italic, setItalic] = useState(false);

<Toggle pressed={bold} onPressedChange={setBold}>Bold</Toggle>
<Toggle variant="subtle" pressed={italic} onPressedChange={setItalic}>Italic</Toggle>
<Toggle variant="subtle" defaultPressed>Underline</Toggle>
<Toggle variant="subtle" disabled>Strikethrough</Toggle>
```

## Props

### Toggle

Press switch; state lives in aria-pressed.

Extends `Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLButtonElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `pressed` | `boolean` |  |  |
| `defaultPressed` | `boolean` |  |  |
| `onPressedChange` | `(pressed: boolean) => void` |  |  |
| `variant` | `"subtle" \| "default"` | `"default"` | Subtle uses a quiet hover and a soft selected fill. |

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
| Tab | Moves focus to the toggle |
| Enter, Space | Presses or releases it |

## Accessibility

- A native <button> with aria-pressed.
- Give icon-only toggles an aria-label. Controlled with pressed and onPressedChange, or uncontrolled with defaultPressed.
- Both variants keep a minimum 44px target, a visible keyboard focus ring, and system colors in forced colors. Native disabled prevents activation.

## Classes

`rs-toggle`, `rs-toggle-group`, `rs-toggle-grouped`, `rs-toggle-grouped-on`, `rs-toggle-pressed`, `rs-toggle-subtle`, `rs-toggle-subtle-pressed`, `rs-toggle-group-subtle`, `rs-toggle-grouped-subtle`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/toggle.tsx`  
CSS: `packages/core/css/components/toggle.css`
