# Bar chart

Compares values with vertical or horizontal bars. Thin ink marks, square ends, optional stacks.

Category: charts  
Name: `bar-chart`  
Also known as: Bar chart, Column chart, Stacked bar chart, Horizontal bar chart  
Page: https://vlak.dev/components/bar-chart/

## When to use

- Comparing categories; data for one series, series plus labels for up to four grouped series.
- stacked separates positive and negative totals; orientation="horizontal" and inverted work with either grouping mode.

## When not to

- Continuous time; use LineChart.
- Parts of one whole; use Donut or Share.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { BarChart } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add bar-chart
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/bar-chart.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-chart"><svg viewBox="0 0 240 64" width="240" height="64"><line class="rs-chart-grid" x1="0" x2="240" y1="56" y2="56"/><rect class="rs-chart-bar" x="20" y="18" width="8" height="38"/><rect class="rs-chart-bar" x="48" y="10" width="8" height="46"/><rect class="rs-chart-bar" x="76" y="24" width="8" height="32"/></svg></div>
```

## Example

```tsx
import { BarChart } from "@noorddev/vlak-react";

<BarChart
  height={204}
  orientation="horizontal"
  data={[
    { label: "Alkmaar", value: 42 },
    { label: "Delft", value: 28 },
  ]}
  unit="issues"
/>

<BarChart
  labels={["Q1", "Q2", "Q3"]}
  series={[
    { name: "Sheets", values: [12, 18, 9] },
    { name: "Proofs", values: [4, 6, 3] },
  ]}
  stacked
/>
```

## Props

### BarChart

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `data` | `{ label: string; value: number; }[]` |  |  |
| `series` | `ChartSeries[]` |  |  |
| `labels` | `string[]` |  |  |
| `height` | `number` | `204` |  |
| `orientation` | `BarOrientation` | `"vertical"` |  |
| `stacked` | `boolean` |  |  |
| `inverted` | `boolean` |  |  |
| `grid` | `boolean` | `true` |  |
| `ticks` | `number` | `4` |  |
| `unit` | `string` |  |  |
| `yLabel` | `string` |  |  |
| `spot` | `string \| boolean` |  |  |
| `valueFormat` | `(value: number) => string` |  |  |
| `locale` | `string` |  | BCP 47 tag for number formatting; undefined is the reader's own. |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Focuses the plot |
| Arrow right, Arrow left | Moves the cursor across the bars; a status tooltip reads the values |
| Home, End | First or last bar |
| Escape | Clears the cursor |

## Accessibility

- The plot is a focusable <svg role="group"> with aria-roledescription="interactive chart", named by aria-label, aria-labelledby, yLabel, or the series names.
- A visually hidden table carries every value; the legend is aria-hidden because the table names the series.
- Every series renders. Null and non-finite bars are omitted and read as No data; signed bars retain nonzero geometry when inverted.

## Classes

`rs-chart-bar`

## Dependencies

Registry dependencies: [chart](chart.md).  
React: `packages/react/src/components/chart.tsx`  
CSS: `packages/core/css/components/chart.css`
