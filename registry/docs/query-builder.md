# Query builder

Builds nested filter conditions from fields, operators, and values.

Category: patterns  
Name: `query-builder`  
Also known as: QueryBuilder  
Page: https://vlak.dev/components/query-builder/

## When to use

- User-defined filters and conditional rule sets.

## When not to

- Executing SQL or trusting the summary as a database query.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { describeQuery, QueryBuilder } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add query-builder
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/query-builder.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-query-builder"><fieldset class="rs-query-builder-group"><legend class="rs-query-builder-legend">Filter conditions</legend><p class="rs-query-builder-summary">Name contains "Drive"</p></fieldset></div>
```

## Example

```tsx
import { QueryBuilder } from "@noorddev/vlak-react";

<QueryBuilder fields={[{ id: "name", label: "Name" }, { id: "range", label: "Range", type: "number" }]} defaultValue={{ id: "root", combinator: "and", rules: [{ id: "rule", field: "name", operator: "contains", value: "Drive" }] }} />
```

## Props

### QueryBuilder

A structured filter expression with nested groups and native field editors.

Extends `Omit<HTMLAttributes<HTMLDivElement>, "defaultValue">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `fields` (required) | `QueryField[]` |  |  |
| `value` | `QueryGroup` |  |  |
| `defaultValue` | `QueryGroup` |  |  |
| `onValueChange` | `(query: QueryGroup) => void` |  |  |
| `label` | `string` | `"Filter conditions"` |  |
| `maxDepth` | `number` | `3` | Maximum group nesting, capped at eight. |

### Functions

- `describeQuery` (function): Human-readable summary only. This is not SQL and never executes a query.

## Keyboard

| Keys | Does |
| --- | --- |
| Tab, Enter, Space, native select keys | Native fields handle entry and selection; buttons add or remove rules/groups. |

## Accessibility

- Fieldsets name nested groups. Every editor has a label and a human-readable expression summary is available.

## Classes

`rs-query-builder`, `rs-query-builder-group`, `rs-query-builder-legend`, `rs-query-builder-rule`, `rs-query-builder-actions`, `rs-query-builder-summary`

## Dependencies

Registry dependencies: [button](button.md), [input](input.md), [native-select](native-select.md).  
React: `packages/react/src/components/query-builder.tsx`  
CSS: `packages/core/css/components/query-builder.css`
