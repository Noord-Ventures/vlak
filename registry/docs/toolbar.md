# Toolbar

Groups actions behind one Tab stop with arrow-key navigation.

Category: actions  
Name: `toolbar`  
Also known as: Toolbar  
Page: https://vlak.dev/components/toolbar/

## When to use

- Editor commands and collections of related actions.

## When not to

- A simple joined visual group with independent Tab stops; use ButtonGroup.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { Toolbar } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add toolbar
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/toolbar.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-toolbar" role="toolbar" aria-label="Editing"><button class="rs-btn-ghost" tabindex="0">Copy</button><button class="rs-btn-ghost" tabindex="-1">Undo</button></div>
```

## Example

```tsx
import { Toolbar } from "@noorddev/vlak-react";

<Toolbar label="Editing" actions={[{ id: "copy", label: "Copy", icon: "copy", onAction: () => {} }, { id: "undo", label: "Undo", icon: "undo", onAction: () => {} }]} />
```

## Props

### Toolbar

Named action collection with one Tab stop and roving keyboard focus.

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `string` |  |  |
| `actions` (required) | `ToolbarAction[]` |  |  |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab, arrows, Home, End, Enter, Space | Tab enters once; arrows and Home/End move between enabled actions; Enter/Space activates. |

## Accessibility

- Exposes a named toolbar with orientation and pressed state. Disabled actions are skipped during roving navigation.

## Classes

`rs-toolbar`, `rs-toolbar-vertical`, `rs-toolbar-pressed`

## Dependencies

Registry dependencies: [button](button.md), [icons](icons.md).  
React: `packages/react/src/components/toolbar.tsx`  
CSS: `packages/core/css/components/toolbar.css`
