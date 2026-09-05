# Donut or share

Shows one part of a whole as a ring or flush share strip. 1px stroke.

Category: charts  
Name: `donut`  
Also known as: Donut, Donut chart, Ring chart, Pie chart, Share strip  
Page: https://vlak.dev/components/donut/

## When to use

- One value against its total as a ring, or a flush strip of shares.
- label under the number in the ring.

## When not to

- Comparing several values; use BarChart.
- More than five slices; the strip stops reading.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { Donut, Share } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add donut
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/donut.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-chart"><svg class="rs-chart-donut" viewBox="0 0 96 96" width="96" height="96"><circle cx="48" cy="48" r="36" fill="none" stroke="currentColor" stroke-width="1"/></svg></div>
```

## Example

```tsx
import { Donut, Share } from "@noorddev/vlak-react";

<Donut value={72} max={100} size={184} label="printed" />
<Share slices={[{ label: "Sheet", value: 72 }, { label: "Proof", value: 18 }, { label: "Waste", value: 10 }]} unit="%" />
```

## Props

### Donut

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` (required) | `number` |  |  |
| `max` | `number` | `100` |  |
| `size` | `number` | `184` |  |
| `label` | `ReactNode` |  |  |
| `unit` | `string` |  |  |
| `valueFormat` | `(value: number) => string` |  |  |
| `spot` | `string \| boolean` |  |  |
| `locale` | `string` |  | BCP 47 tag for number formatting; undefined is the reader's own. |

### Share

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `slices` (required) | `ShareSlice[]` |  |  |
| `unit` | `string` |  |  |
| `valueFormat` | `(n: number) => string` |  |  |
| `spot` | `string \| boolean` |  |  |
| `locale` | `string` |  | BCP 47 tag for number formatting; undefined is the reader's own. |

## Accessibility

- Donut renders role="img" named by the caption or label and the value text; a visually hidden table carries value and max.
- Share renders a named group of slices with a hidden table of label and value per slice.
- Invalid totals do not produce a percentage. Share excludes negative and non-finite slices and explains an empty total.

## Classes

`rs-chart-donut`

## Dependencies

Registry dependencies: [chart](chart.md).  
React: `packages/react/src/components/chart.tsx`  
CSS: `packages/core/css/components/chart.css`
