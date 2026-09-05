# Tree view

Navigates a hierarchy with expansion, single selection, and roving focus.

Category: navigation  
Name: `tree-view`  
Also known as: TreeView  
Page: https://vlak.dev/components/tree-view/

## When to use

- File trees, nested assets, and hierarchical selection.

## When not to

- A flat list of destination links; use Sidebar.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { TreeView } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add tree-view
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/tree-view.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<ul class="rs-tree-view" role="tree" aria-label="Studies"><li role="none"><div class="rs-tree-view-item rs-tree-view-selected" role="treeitem" aria-selected="true" aria-level="1" tabindex="0">Drive</div></li></ul>
```

## Example

```tsx
import { TreeView } from "@noorddev/vlak-react";

<TreeView label="Studies" defaultExpanded={["studies"]} defaultValue="drive" nodes={[{ id: "studies", label: "Studies", children: [{ id: "drive", label: "Drive" }, { id: "orbit", label: "Orbit" }] }, { id: "archive", label: "Archive" }]} />
```

## Props

### TreeView

Single selection and APG-style roving focus through a hierarchical collection.

Extends `Omit<HTMLAttributes<HTMLUListElement>, "defaultValue" | "onSelect">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLUListElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `nodes` (required) | `TreeNode[]` |  |  |
| `label` (required) | `string` |  |  |
| `value` | `string` |  |  |
| `defaultValue` | `string` |  |  |
| `onValueChange` | `(value: string) => void` |  |  |
| `expanded` | `string[]` |  |  |
| `defaultExpanded` | `string[]` | `[]` |  |
| `onExpandedChange` | `(ids: string[]) => void` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Arrows, Home, End, Enter, Space, letters | Arrows navigate and expand/collapse; Enter or Space selects; typing finds a visible label. |

## Accessibility

- One tree item is in the Tab sequence. Level, position, selected, expanded, and disabled state are explicit.

## Classes

`rs-tree-view`, `rs-tree-view-group`, `rs-tree-view-item`, `rs-tree-view-selected`, `rs-tree-view-disabled`, `rs-tree-view-spacer`, `rs-tree-view-disclosure`

## Dependencies

Registry dependencies: [icons](icons.md).  
React: `packages/react/src/components/tree-view.tsx`  
CSS: `packages/core/css/components/tree-view.css`
