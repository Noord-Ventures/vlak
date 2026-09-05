# Filter bar

Shows active filters with individual removal, reset, and a result count.

Category: patterns  
Name: `filter-bar`  
Also known as: FilterBar  
Page: https://vlak.dev/components/filter-bar/

## When to use

- Search results and data views with multiple active filters.

## When not to

- Editing complex logic directly; use QueryBuilder.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { FilterBar } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add filter-bar
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/filter-bar.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-filter-bar" role="group" aria-label="Active filters"><button class="rs-btn-ghost" aria-label="Remove Alkmaar filter">Alkmaar ×</button><span class="rs-filter-bar-count" role="status">12 results</span></div>
```

## Example

```tsx
import { FilterBar } from "@noorddev/vlak-react";

<FilterBar defaultValue={[{ id: "city", label: "Alkmaar" }, { id: "status", label: "Published" }]} resultCount={12} />
```

## Props

### FilterBar

Removable active filters and result count. Supply filter editors as children.

Extends `Omit<HTMLAttributes<HTMLDivElement>, "defaultValue">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `ActiveFilter[]` |  |  |
| `defaultValue` | `ActiveFilter[]` | `[]` |  |
| `onValueChange` | `(filters: ActiveFilter[]) => void` |  |  |
| `resultCount` | `number` |  |  |
| `label` | `string` | `"Active filters"` |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab, Enter, Space | Tab reaches remove/reset actions; Enter or Space applies changes and returns focus to the group. |

## Accessibility

- Removal buttons name their filters. Result count is a polite status; children can supply labeled filter editors.

## Classes

`rs-filter-bar`, `rs-filter-bar-count`

## Dependencies

Registry dependencies: [button](button.md), [icons](icons.md).  
React: `packages/react/src/components/filter-bar.tsx`  
CSS: `packages/core/css/components/filter-bar.css`
