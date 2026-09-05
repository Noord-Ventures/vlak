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
<button type="button" class="rs-theme-toggle rs-theme-toggle-inline" aria-label="Switch to dark scheme"><svg class="rs-icon rs-theme-moon" aria-hidden="true" viewBox="0 0 16 16" width="24" height="24" fill="currentColor" stroke="none"><path d="M13.5 8.5 A5.5 5.5 0 1 1 7.5 2.5 A4.5 4.5 0 0 0 13.5 8.5 Z"/></svg></button>
```

## Example

```tsx
import { ThemeToggle } from "@noorddev/vlak-react";

<ThemeToggle storageKey="vlak-theme" onThemeChange={(dark) => track(dark)} />
```

## Props

### ThemeToggle

One filled family mark on a 24px square, about 18–20px of drawn ink. Moon on paper, sun on black. The button sets data-theme="dark" on <html> and persists the choice. Apps pin it top-right; catalog and previews use the inline modifier. The name states the action ("Switch to dark scheme"), so it changes with the state.

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
- The target mode is shown with the filled Vlak moon or sun, on a 24px icon square inside a 44px target.
- Sets an explicit data-theme="light" or data-theme="dark" on <html> and stores the choice under storageKey; read it early in your document to avoid a flash.

## Classes

`rs-theme-toggle`, `rs-theme-toggle-inline`, `rs-theme-sun`, `rs-theme-moon`

## Dependencies

Registry dependencies: [icons](icons.md).  
React: `packages/react/src/components/theme-toggle.tsx`  
CSS: `packages/core/css/components/theme-toggle.css`
