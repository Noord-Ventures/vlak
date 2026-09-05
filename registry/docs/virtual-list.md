# Virtual list

Windows large fixed-height collections while preserving focused rows.

Category: content  
Name: `virtual-list`  
Also known as: VirtualList  
Page: https://vlak.dev/components/virtual-list/

## When to use

- Large collections where fixed-height rows are an acceptable constraint.

## When not to

- Short lists or variable-height content without a fixed row contract.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { VirtualList } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add virtual-list
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/virtual-list.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-virtual-list" role="list" aria-label="Records" style="height:264px"><div class="rs-virtual-list-canvas" role="none" style="height:44px"><div class="rs-virtual-list-item" role="listitem" tabindex="0" aria-posinset="1" aria-setsize="1" style="height:44px">Record 1</div></div></div>
```

## Example

```tsx
import { VirtualList } from "@noorddev/vlak-react";

<VirtualList label="Records" height={264} items={Array.from({ length: 200 }, (_, index) => ({ id: String(index), label: `Record ${index + 1}` }))} />
```

## Props

### VirtualList

Fixed-height windowing with a retained focused row and keyboard navigation.

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` (required) | `VirtualItem[]` |  |  |
| `label` (required) | `string` |  |  |
| `rowHeight` | `number` | `44` | Fixed row height, at least 44px. |
| `height` | `number` | `352` |  |
| `overscan` | `number` | `4` |  |
| `emptyLabel` | `string` | `"No items"` |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab, Arrow up/down, Home, End | A row enters the Tab sequence; arrows and Home/End scroll and focus rows. Nested controls keep their own keys. |

## Accessibility

- List items expose total size and position. Focused rows are retained when outside the visible window.

## Classes

`rs-virtual-list`, `rs-virtual-list-canvas`, `rs-virtual-list-item`, `rs-virtual-list-empty`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/virtual-list.tsx`  
CSS: `packages/core/css/components/virtual-list.css`
