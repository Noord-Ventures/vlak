# Button

Triggers an action with solid primary, 1px ghost, or borderless subtle styling. Every target is at least 44px; icon size is a 44px square.

Category: actions  
Name: `button`  
Also known as: Button, Primary button, Ghost button, Secondary button, Subtle button, Icon button  
Page: https://vlak.dev/components/button/

## When to use

- One primary action per view, with ghost for the secondary action.
- Subtle for supporting actions in a toolbar or response. Its transparent surface stays unchanged while muted text turns to ink on hover.
- Inside ButtonGroup, subtle buttons use an opaque paper surface and a soft fill for application-supplied aria-pressed selection.
- Icon size for an icon-only action with a 44px square target and an accessible label.
- Submitting a form or answering a dialog.

## When not to

- Navigation that changes the URL; use Link or a nav component.
- Standalone persistent settings; use Toggle or Switch. ButtonGroup can present application-owned selection with aria-pressed.

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
<button class="rs-btn-subtle">Details</button>
<button class="rs-btn-subtle" disabled>Unavailable</button>
<button class="rs-btn-subtle rs-btn-icon" aria-label="Download"><svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" aria-hidden="true"><path d="M3.5 11.5V13h9v-1.5M8 3.5v7M5.5 8 8 10.5 10.5 8" /></svg></button>
```

## Example

```tsx
import { Button, Icon } from "@noorddev/vlak-react";

<Button>Primary action</Button>
<Button variant="ghost" size="sm">Secondary</Button>
<Button variant="subtle">Details</Button>
<Button variant="subtle" disabled>Unavailable</Button>
<Button variant="subtle" size="icon" aria-label="Download">
  <Icon name="download" />
</Button>
```

## Props

### Button

Extends `ButtonHTMLAttributes<HTMLButtonElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLButtonElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | `"primary" \| "ghost" \| "subtle"` | `"primary"` | Solid ink primary, hairline ghost, or borderless subtle. One primary per view. |
| `size` | `"default" \| "sm" \| "icon"` | `"default"` | Icon buttons stay square at every breakpoint. Supply an accessible name. |
| `grouped` | `boolean` | `false` | Flush into a ButtonGroup: no own stroke, one ink seam. |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves focus to the button |
| Enter, Space | Activates it |

## Accessibility

- Renders a native <button>; type defaults to "button", so pass type="submit" inside a form.
- The visible text is the name. Icon size changes the shape, not the accessible name; give icon-only buttons an aria-label and hide decorative icons.
- 2px ink focus ring on :focus-visible. disabled uses the native attribute and 40% opacity; forced colors keep system colors.

## Classes

`rs-btn-primary`, `rs-btn-ghost`, `rs-btn-subtle`, `rs-btn-sm`, `rs-btn-icon`, `rs-btn-grouped`, `rs-btn-grouped-ghost`, `rs-btn-grouped-subtle`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/button.tsx`  
CSS: `packages/core/css/components/button.css`
