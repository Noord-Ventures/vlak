# Kanban board

Moves and reorders cards across named columns with drag and keyboard alternatives.

Category: patterns  
Name: `kanban-board`  
Also known as: KanbanBoard, Task board, Workflow board  
Page: https://vlak.dev/components/kanban-board/

## When to use

- Finite work items moving through named states.
- Column changes and ordering that should remain keyboard accessible.

## When not to

- A large virtualised issue tracker or automatic workflow rules.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { KanbanBoard } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add kanban-board
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/kanban-board.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-kanban-board" role="region" aria-label="Board"><div class="rs-kanban-columns"><section class="rs-kanban-column"><h3 class="rs-kanban-heading">In progress</h3><p class="rs-kanban-card">Review the proof</p></section></div></div>
```

## Example

```tsx
import { KanbanBoard } from "@noorddev/vlak-react";

<KanbanBoard columns={[{ id: "todo", label: "To do" }, { id: "doing", label: "In progress" }, { id: "done", label: "Done" }]} value={cards} onValueChange={setCards} />
```

## Props

### KanbanBoard

Movable cards with drag, keyboard reordering, and named destination selectors.

Extends `Omit<HTMLAttributes<HTMLDivElement>, "defaultValue">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `columns` (required) | `readonly KanbanColumn[]` |  |  |
| `value` | `KanbanCard[]` |  |  |
| `defaultValue` | `KanbanCard[]` | `[]` |  |
| `onValueChange` | `(cards: KanbanCard[]) => void` |  |  |
| `label` | `string` | `"Board"` |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Alt+Arrow up, Alt+Arrow down | Reorders the focused card handle within its column. |
| Tab, Enter, Space | Operates move up and down buttons and each card's native destination selector. |

## Accessibility

- Every column is a named section; card counts are visible.
- A native destination selector is the keyboard alternative to dragging across columns.
- Moves are announced and disabled cards remain immovable.

## Classes

`rs-kanban-board`, `rs-kanban-columns`, `rs-kanban-column`, `rs-kanban-heading`, `rs-kanban-card`, `rs-kanban-title`, `rs-kanban-detail`, `rs-kanban-status`

## Dependencies

Registry dependencies: [native-select](native-select.md), [sortable-list](sortable-list.md).  
React: `packages/react/src/components/kanban-board.tsx`  
CSS: `packages/core/css/components/kanban-board.css`
