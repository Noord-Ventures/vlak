# Master detail

Links selection to a detail panel with a mobile back path.

Category: patterns  
Name: `master-detail`  
Also known as: MasterDetail  
Page: https://vlak.dev/components/master-detail/

## When to use

- Inboxes, asset browsers, and list/detail workspaces.

## When not to

- Independent panels without a selection relationship; use Split.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { MasterDetail } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add master-detail
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/master-detail.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-master-detail"><div class="rs-master-detail-list" role="group" aria-label="Studies"><button class="rs-master-detail-button rs-master-detail-selected" aria-pressed="true">Drive</button></div><section class="rs-master-detail-panel" aria-label="Drive details"><h2 class="rs-master-detail-title">Drive</h2><p>Vehicle controls</p></section></div>
```

## Example

```tsx
import { MasterDetail } from "@noorddev/vlak-react";

<MasterDetail label="Studies" items={[{ id: "drive", label: "Drive", description: "Vehicle controls", detail: <p>Range, energy, and media in one shared grid.</p> }, { id: "orbit", label: "Orbit", description: "Observation network", detail: <p>Track assets and their current passes.</p> }]} />
```

## Props

### MasterDetail

List/detail selection with a mobile back path and preserved item focus.

Extends `Omit<HTMLAttributes<HTMLDivElement>, "defaultValue">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` (required) | `MasterDetailItem[]` |  |  |
| `label` | `string` | `"Items"` |  |
| `value` | `string \| null` |  |  |
| `defaultValue` | `string \| null` | `null` |  |
| `onValueChange` | `(id: string \| null) => void` |  |  |
| `emptyLabel` | `string` | `"Select an item to see its details"` |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab, Enter, Space | Select an item with its button; focus moves to the detail heading. Mobile Back restores focus to its list item. |

## Accessibility

- Native selected buttons and a named detail region. Mobile layout preserves an explicit return path.

## Classes

`rs-master-detail`, `rs-master-detail-list`, `rs-master-detail-list-hidden`, `rs-master-detail-panel`, `rs-master-detail-panel-hidden`, `rs-master-detail-title`, `rs-master-detail-description`, `rs-master-detail-back`, `rs-master-detail-button`, `rs-master-detail-selected`

## Dependencies

Registry dependencies: [button](button.md), [icons](icons.md).  
React: `packages/react/src/components/master-detail.tsx`  
CSS: `packages/core/css/components/master-detail.css`
