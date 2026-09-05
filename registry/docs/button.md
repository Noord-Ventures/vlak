# Button

Triggers an action. Solid primary or 1px ghost, with a minimum 44px target at every size.

Category: actions  
Name: `button`  
Also known as: Button, Primary button, Ghost button, Secondary button  
Page: https://vlak.dev/components/button/

## When to use

- One primary action per view, with ghost for the secondary action.
- Submitting a form or answering a dialog.

## When not to

- Navigation that changes the URL; use Link or a nav component.
- On and off state; use Toggle or Switch, which carry aria-pressed and aria-checked.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { Button } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add button
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/button.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<button class="rs-btn-primary">Primary action</button>
<button class="rs-btn-ghost">Secondary</button>
```

## Example

```tsx
import { Button } from "@noorddev/vlak-react";

<Button>Primary action</Button>
<Button variant="ghost" size="sm">Secondary</Button>
<Button disabled>Saving…</Button>
```

## Props

### Button

Extends `ButtonHTMLAttributes<HTMLButtonElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLButtonElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | `"primary" \| "ghost"` | `"primary"` | Solid ink primary or hairline ghost. One primary per view. |
| `size` | `"default" \| "sm"` | `"default"` |  |
| `grouped` | `boolean` | `false` | Flush into a ButtonGroup: no own stroke, one ink seam. |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves focus to the button |
| Enter, Space | Activates it |

## Accessibility

- Renders a native <button>; type defaults to "button", so pass type="submit" inside a form.
- The visible text is the name. Give icon-only buttons an aria-label.
- 2px ink focus ring on :focus-visible. disabled uses the native attribute and 40% opacity; forced colors keep system colors.

## Classes

`rs-btn-primary`, `rs-btn-ghost`, `rs-btn-sm`, `rs-btn-grouped`, `rs-btn-grouped-ghost`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/button.tsx`  
CSS: `packages/core/css/components/button.css`
