# Sortable list

Reorders items with drag handles, move buttons, and keyboard shortcuts.

Category: content  
Name: `sortable-list`  
Also known as: SortableList  
Page: https://vlak.dev/components/sortable-list/

## When to use

- Ordering tasks, workflow steps, and priority lists.

## When not to

- Cross-column status changes alone; use KanbanBoard.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { SortableList } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add sortable-list
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/sortable-list.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<ol class="rs-sortable-list" aria-label="Reorder items"><li class="rs-sortable-list-item"><div class="rs-sortable-list-content">Research</div><div class="rs-sortable-list-actions"><button class="rs-btn-ghost" aria-label="Move Research down">Move down</button></div></li></ol>
```

## Example

```tsx
import { SortableList } from "@noorddev/vlak-react";

<SortableList defaultValue={[{ id: "research", label: "Research" }, { id: "design", label: "Design" }, { id: "build", label: "Build" }]} />
```

## Props

### SortableList

Reordering through drag, named move buttons, or Alt and the arrow keys.

Extends `Omit<HTMLAttributes<HTMLOListElement>, "defaultValue">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLOListElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `SortableItem[]` |  |  |
| `defaultValue` | `SortableItem[]` | `[]` |  |
| `onValueChange` | `(items: SortableItem[]) => void` |  |  |
| `label` | `string` | `"Reorder items"` |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab, Enter, Space, Alt+Arrow up/down | Move buttons work with Enter/Space; Alt with Up/Down on a handle changes its position. |

## Accessibility

- Each move action names the item; position changes are announced and focus stays with the moved item.

## Classes

`rs-sortable-list`, `rs-sortable-list-item`, `rs-sortable-list-content`, `rs-sortable-list-actions`, `rs-sortable-list-status`

## Dependencies

Registry dependencies: [button](button.md), [icons](icons.md).  
React: `packages/react/src/components/sortable-list.tsx`  
CSS: `packages/core/css/components/sortable-list.css`
