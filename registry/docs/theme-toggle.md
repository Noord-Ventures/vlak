# Theme toggle

Switches between light and dark schemes. The icon changes and the choice persists locally.

Category: actions  
Name: `theme-toggle`  
Also known as: Theme toggle, Dark mode toggle, Color scheme switch, Mode toggle  
Page: https://vlak.dev/components/theme-toggle/

## When to use

- Letting the reader pick light or dark and remembering it.
- Top-right of the page chrome; rs-theme-toggle-inline for a spot in the flow.

## When not to

- Pages that should follow the system only; leave it out and the system preference applies.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { ThemeToggle } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add theme-toggle
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/theme-toggle.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<button class="rs-theme-toggle rs-theme-toggle-inline" aria-label="Toggle color scheme"><svg class="rs-theme-moon" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter"><path d="M10.5 3.5 A5.5 5.5 0 1 0 10.5 12.5 A4 4 0 1 1 10.5 3.5" vector-effect="non-scaling-stroke"/></svg></button>
```

## Example

```tsx
import { ThemeToggle } from "@noorddev/vlak-react";

<ThemeToggle storageKey="vlak-theme" onThemeChange={(dark) => track(dark)} />
```

## Props

### ThemeToggle

One mark. Moon on paper, sun on black. The button sets data-theme="dark" on <html> and persists the choice. Apps pin it top-right; catalog and previews use the inline modifier. The name states the action ("Switch to dark scheme"), so it changes with the state.

Extends `Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLButtonElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `storageKey` | `string` | `"vlak-theme"` | localStorage key the choice persists under. |
| `onThemeChange` | `(dark: boolean) => void` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves focus to the button |
| Enter, Space | Switches the scheme |

## Accessibility

- A native <button> whose aria-label states the action ("Switch to dark scheme" or "Switch to light scheme").
- Sets an explicit data-theme="light" or data-theme="dark" on <html> and stores the choice under storageKey; read it early in your document to avoid a flash.

## Classes

`rs-theme-toggle`, `rs-theme-toggle-inline`, `rs-theme-sun`, `rs-theme-moon`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/theme-toggle.tsx`  
CSS: `packages/core/css/components/theme-toggle.css`
