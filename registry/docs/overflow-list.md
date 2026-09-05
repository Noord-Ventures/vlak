# Overflow list

Keeps priority actions visible and moves excess actions into a menu.

Category: actions  
Name: `overflow-list`  
Also known as: OverflowList  
Page: https://vlak.dev/components/overflow-list/

## When to use

- Responsive action rows where order also establishes priority.

## When not to

- Hiding critical navigation or a form's only submit action.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { OverflowList } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add overflow-list
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/overflow-list.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-overflow-list" role="group" aria-label="Actions"><button class="rs-btn-ghost">Copy</button><div class="rs-overflow-list-more"><button class="rs-btn-ghost" aria-haspopup="menu">More actions</button></div></div>
```

## Example

```tsx
import { OverflowList } from "@noorddev/vlak-react";

<OverflowList maxVisible={2} items={[{ id: "copy", label: "Copy", onAction: () => {} }, { id: "duplicate", label: "Duplicate", onAction: () => {} }, { id: "archive", label: "Archive", onAction: () => {} }]} />
```

## Props

### OverflowList

Keeps priority actions in order and moves the remainder into a keyboard menu.

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` (required) | `OverflowAction[]` |  |  |
| `label` | `string` | `"Actions"` |  |
| `maxVisible` | `number` | `items.length` | Upper bound on visible priority actions, available width may show fewer. |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab, Enter, Space, arrows, Escape | Native visible buttons activate normally. The overflow uses DropdownMenu keyboard navigation and Escape. |

## Accessibility

- Overflow actions remain in a named menu. Hidden measurement text is excluded from accessibility.

## Classes

`rs-overflow-list`, `rs-overflow-list-measure`, `rs-overflow-list-sample`, `rs-overflow-list-more`

## Dependencies

Registry dependencies: [button](button.md), [dropdown-menu](dropdown-menu.md).  
React: `packages/react/src/components/overflow-list.tsx`  
CSS: `packages/core/css/components/overflow-list.css`
