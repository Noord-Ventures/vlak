# Data table

Sorts, filters and selects structured records. Native controls expose sort and selection state.

Category: content  
Name: `data-table`  
Also known as: Data table, Sortable table, Grid  
Page: https://vlak.dev/components/data-table/

## When to use

- Rows from data with controlled or default sorting, selection keys and text filtering.
- render for rich cells, sortValue for sort keys, filterRow for custom filtering, and a stable rowKey to keep selection attached to records.

## When not to

- Hand-written rows; use Table.
- Inline editing or pagination; compose those around it. Large datasets need windowing or server-side data management.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { DataTable } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add data-table
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/data-table.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<table class="rs-table"><thead><tr><th><button class="rs-datatable-sort">Phase</button></th><th>Weeks</th></tr></thead><tbody><tr><td>Identity</td><td>4</td></tr><tr><td>Strategy</td><td>2</td></tr></tbody></table>
```

## Example

```tsx
import { DataTable } from "@noorddev/vlak-react";

<DataTable
  columns={[
    { key: "phase", header: "Phase", sortable: true },
    { key: "weeks", header: "Weeks", sortable: true },
    { key: "owner", header: "Owner", render: (row) => row.owner.name },
  ]}
  rows={rows}
  rowKey={(row) => row.id}
  emptyLabel="No phases yet."
/>
```

## Props

### Functions

- `DataTable` (function): Sortable rows over the plain rs-table.

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves through the optional filter, sort buttons and selection checkboxes |
| Enter, Space | Sorts ascending, then descending, then clears |

## Accessibility

- Sortable headers hold a native <button>; the <th> carries aria-sort while sorted.
- Filter and sort have value/callback pairs: filter/onFilterChange and sort/onSortChange, with defaultFilter/defaultSort for local state.
- selectable adds native checkboxes; selectedKeys/onSelectionChange controls selection, with defaultSelectedKeys for local state. Select all affects visible filtered rows and exposes mixed state.
- A horizontal scroll container keeps the table inside its grid; caption names the data. Empty filtered results are a live status. Interactive targets are at least 44px.

## Classes

`rs-datatable-sort`, `rs-datatable-empty`, `rs-datatable-sort-icon`, `rs-datatable-sort-icon-on`, `rs-datatable-table`, `rs-datatable-td`, `rs-datatable-td-alt`, `rs-datatable-th`, `rs-datatable-scroll`, `rs-datatable-td-selected`

## Dependencies

Registry dependencies: [table](table.md), [input](input.md), [checkbox](checkbox.md).  
React: `packages/react/src/components/data-table.tsx`  
CSS: `packages/core/css/components/data-table.css`
