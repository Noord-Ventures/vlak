# Checkbox

Selects any number of options. A 44px target surrounds the check mark; indeterminate uses a minus.

Category: forms  
Name: `checkbox`  
Also known as: Checkbox, Check box, Tick box  
Page: https://vlak.dev/components/checkbox/

## When to use

- Independent on and off choices, alone or in a list.
- Consent and acknowledgement lines.

## When not to

- A setting that takes effect immediately; use Switch.
- One choice from many; use Radio.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { Checkbox } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add checkbox
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/checkbox.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<label class="rs-choice"><span class="rs-check rs-check-on"><svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter"><path d="M3.5 8.5 L6.5 11.5 L12.5 4.5" vector-effect="non-scaling-stroke"/></svg></span>Brand</label>
```

## Example

```tsx
import { useState } from "react";
import { Checkbox } from "@noorddev/vlak-react";

const [opted, setOpted] = useState(false);

<Checkbox label="Brand" defaultChecked />
<Checkbox label="Send me the newsletter" checked={opted} onChange={(e) => setOpted(e.target.checked)} />
```

## Props

### Checkbox

A real native checkbox; the visible 16px box mirrors its state.

Extends `Omit<InputHTMLAttributes<HTMLInputElement>, "type">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLInputElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | `ReactNode` |  |  |
| `indeterminate` | `boolean` | `false` |  |
| `onCheckedChange` | `(checked: boolean) => void` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves focus to the checkbox |
| Space | Toggles it |

## Accessibility

- A native <input type="checkbox"> hidden from view inside a <label>; the 16px box mirrors its state.
- label is the accessible name. Without one, pass aria-label.
- Controlled with checked and onCheckedChange or native onChange, or uncontrolled with defaultChecked. indeterminate sets the native mixed state.

## Classes

`rs-choice`, `rs-check`, `rs-check-on`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/checkbox.tsx`  
CSS: `packages/core/css/components/checkbox.css`
