# Dropdown menu

Presents a compact list of actions. Menu roles and arrow-key navigation are built in.

Category: actions  
Name: `dropdown-menu`  
Also known as: Dropdown menu, Menu, Action menu, Overflow menu  
Page: https://vlak.dev/components/dropdown-menu/

## When to use

- Three or more actions on one object behind a single trigger.
- Separators to group destructive actions at the end.

## When not to

- Choosing a value; use Select.
- Navigation links; use NavigationMenu.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { DropdownMenu } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add dropdown-menu
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/dropdown-menu.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-menu" role="menu"><button class="rs-menu-item" role="menuitem">Rename</button><button class="rs-menu-item" role="menuitem">Duplicate</button><hr class="rs-menu-sep" /><button class="rs-menu-item" role="menuitem">Delete</button></div>
```

## Example

```tsx
import { DropdownMenu } from "@noorddev/vlak-react";

<DropdownMenu
  label="Actions"
  items={[
    { label: "Rename", onSelect: rename },
    { label: "Duplicate", onSelect: duplicate },
    { separator: true },
    { label: "Delete", onSelect: remove },
    { label: "Archive", disabled: true },
  ]}
/>
```

## Props

### DropdownMenu

Action menu with menu semantics and keyboard navigation.

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `ReactNode` |  |  |
| `items` (required) | `DropdownMenuItem[]` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Arrow down, Enter, Space | Opens the menu on the first item |
| Arrow up | Opens the menu on the last item |
| Arrow down, Arrow up | Moves between items and wraps |
| Arrow right, Arrow left | Opens a child menu or returns to its parent; directions reverse in RTL |
| Home, End | First or last item |
| Type letters | Moves to the next item starting with them |
| Enter, Space | Selects the item and closes |
| Escape | Closes and returns focus to the trigger |
| Tab | Closes and moves on |

## Accessibility

- The trigger is a <button> with aria-haspopup="menu", aria-expanded, and aria-controls; label is its name.
- The panel is role="menu" labelled by the trigger; items are <button role="menuitem"> with one roving tab stop.
- Disabled items carry aria-disabled and are skipped; separators are <hr>. A click outside closes without moving focus.
- items opens a named nested menu. checked and onCheckedChange expose controlled menuitemcheckbox state. Escape returns to the immediate parent before closing the root menu.

## Classes

`rs-menu`, `rs-dropdown`, `rs-menu-item`, `rs-menu-item-indicator`, `rs-menu-item-label`, `rs-menu-item-active`, `rs-menu-item-disabled`, `rs-menu-sep`, `rs-menu-nested`

## Dependencies

Registry dependencies: [button](button.md).  
React: `packages/react/src/components/dropdown-menu.tsx`  
CSS: `packages/core/css/components/dropdown-menu.css`
