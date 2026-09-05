# Menubar

Groups application menus in a compact 1px frame. Text-only triggers keep 44px targets and wrap to fit.

Category: actions  
Name: `menubar`  
Also known as: Menubar, Menu bar, Application menu  
Page: https://vlak.dev/components/menubar/

## When to use

- Desktop-style application menus: File, Edit, View.
- Tools and editors with many commands grouped by verb.

## When not to

- Site navigation; use NavigationMenu.
- One menu; use DropdownMenu.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { Menubar } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add menubar
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/menubar.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-menubar" role="menubar" aria-label="Application menus"><div class="rs-menubar-wrap"><button type="button" class="rs-menubar-trigger" role="menuitem" aria-haspopup="menu" aria-expanded="false" tabindex="0">File</button></div><div class="rs-menubar-wrap"><button type="button" class="rs-menubar-trigger" role="menuitem" aria-haspopup="menu" aria-expanded="false" tabindex="-1">Edit</button></div><div class="rs-menubar-wrap"><button type="button" class="rs-menubar-trigger" role="menuitem" aria-haspopup="menu" aria-expanded="false" tabindex="-1">View</button></div></div>
```

## Example

```tsx
import { Menubar } from "@noorddev/vlak-react";

<Menubar
  aria-label="Application menus"
  menus={[
    { label: "File", items: [{ label: "New", onSelect: create }, { label: "Open…", onSelect: open }] },
    { label: "Edit", items: [{ label: "Undo", onSelect: undo }, { label: "Redo", onSelect: redo }] },
  ]}
/>
```

## Props

### Menubar

Dropdown menus in a hairline strip. The triggers are menuitems with one roving tab stop; ArrowLeft/ArrowRight move between them and an open menu follows.

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `menus` (required) | `{ label: ReactNode; items: DropdownMenuItem[]; }[]` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves focus to the bar (one roving tab stop) |
| Arrow left, Arrow right | Moves between menus; an open menu follows |
| Home, End | First or last menu |
| Arrow down, Enter, Space | Opens the menu on the first item |
| Arrow up | Opens the menu on the last item |
| Escape | Closes the open menu and returns focus to its trigger |

## Accessibility

- Renders role="menubar"; each trigger is a <button role="menuitem"> with aria-haspopup="menu", aria-expanded, and aria-controls.
- Open panels are role="menu" labelled by their trigger, with the same keyboard model as DropdownMenu.
- Text-only triggers have 44px minimum hit targets and wrap inside the bar. The open trigger uses a full-surface fill, never a leading stripe.
- The markup snippet shows the closed appearance only. Use the React component for opening, placement, roving focus, and keyboard interaction.

## Classes

`rs-menubar`, `rs-menubar-wrap`, `rs-menubar-trigger`, `rs-menubar-trigger-open`, `rs-menubar-panel`

## Dependencies

Registry dependencies: [dropdown-menu](dropdown-menu.md).  
React: `packages/react/src/components/menubar.tsx`  
CSS: `packages/core/css/components/menubar.css`
