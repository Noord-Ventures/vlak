# Histogram

Shows a distribution in adjacent bins with 1px gaps.

Category: charts  
Name: `histogram`  
Also known as: Histogram, Distribution chart, Frequency chart  
Page: https://vlak.dev/components/histogram/

## When to use

- The distribution of one variable across ordered bins.
- Adjacent bins with a 1px seam; the order is the axis.

## When not to

- Unordered categories; use BarChart.
- Time series; use LineChart.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { Histogram } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add histogram
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/histogram.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-chart"><svg viewBox="0 0 240 64" width="240" height="64"><rect class="rs-chart-hist" x="8" y="36" width="36" height="20"/><rect class="rs-chart-hist" x="45" y="20" width="36" height="36"/><rect class="rs-chart-hist" x="82" y="8" width="36" height="48"/><rect class="rs-chart-hist" x="119" y="24" width="36" height="32"/></svg></div>
```

## Example

```tsx
import { Histogram } from "@noorddev/vlak-react";

<Histogram
  height={204}
  bins={[
    { label: "0–1", count: 4 },
    { label: "1–2", count: 11 },
    { label: "2–3", count: 18 },
  ]}
  yLabel="Sessions"
/>
```

## Props

### Histogram

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `bins` (required) | `HistogramBin[]` |  |  |
| `height` | `number` | `204` |  |
| `unit` | `string` |  |  |
| `yLabel` | `string` |  |  |
| `grid` | `boolean` | `true` |  |
| `ticks` | `number` | `4` |  |
| `valueFormat` | `(n: number) => string` |  |  |
| `spot` | `string \| boolean` |  |  |
| `locale` | `string` |  | BCP 47 tag for number formatting; undefined is the reader's own. |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Focuses the plot |
| Arrow right, Arrow left | Moves the cursor across the bins; a status tooltip reads the count |
| Home, End | First or last bin |
| Escape | Clears the cursor |

## Accessibility

- A focusable, named plot with a visually hidden table of label and count per bin.
- Counts must be finite and non-negative; invalid bins are excluded, and an empty dataset is announced.

## Classes

`rs-chart-hist`

## Dependencies

Registry dependencies: [chart](chart.md).  
React: `packages/react/src/components/chart.tsx`  
CSS: `packages/core/css/components/chart.css`
