# Switch

Turns one setting on or off. A slim 44×24px track sits inside a 44px touch target.

Category: forms  
Name: `switch`  
Also known as: Switch, Toggle switch  
Page: https://vlak.dev/components/switch/

## When to use

- A setting that applies as soon as it flips.
- Binary state with a clear on and off.

## When not to

- Choices that need a submit button; use Checkbox.
- More than two states; use ToggleGroup.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { Switch } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add switch
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/switch.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<button type="button" class="rs-switch rs-switch-on" role="switch" aria-checked="true" aria-label="Notifications"><i class="rs-switch-thumb rs-switch-thumb-on" aria-hidden="true"></i></button>
```

## Example

```tsx
import { useState } from "react";
import { Switch } from "@noorddev/vlak-react";

const [enabled, setEnabled] = useState(false);

<Switch checked={enabled} onCheckedChange={setEnabled} aria-label="Notifications" />
```

## Props

### Switch

A button with role="switch".

Extends `Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLButtonElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `checked` | `boolean` |  |  |
| `defaultChecked` | `boolean` |  |  |
| `onCheckedChange` | `(checked: boolean) => void` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves focus to the switch |
| Space, Enter | Toggles it |

## Accessibility

- A native <button> with role="switch" and aria-checked.
- It has no visible text; pass aria-label or aria-labelledby.
- Controlled with checked and onCheckedChange, or uncontrolled with defaultChecked.

## Classes

`rs-switch`, `rs-switch-on`, `rs-switch-thumb`, `rs-switch-thumb-on`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/switch.tsx`  
CSS: `packages/core/css/components/switch.css`
