# Charts

Plots one or more lines on a 204px field. 1px grid, textured series, and one optional spot color.

Category: charts  
Name: `chart`  
Also known as: Chart, Line chart, Sparkline, Trend line  
Page: https://vlak.dev/components/chart/

## When to use

- Up to four series over time on one field; solid, dashed, gray, and dotted keep them apart without hue.
- spot for the one accent the chart is allowed; Sparkline for a trend inside a row.

## When not to

- Categories; use BarChart.
- More than four series; split them into SmallMultiples.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { LineChart, Sparkline } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add chart
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/chart.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-chart"><svg viewBox="0 0 240 64" width="240" height="64"><line class="rs-chart-grid" x1="0" x2="240" y1="56" y2="56"/><path class="rs-chart-line" d="M0 44 L40 36 L80 40 L120 22 L160 26 L200 12 L240 16"/></svg></div>
```

## Example

```tsx
import { LineChart, Sparkline } from "@noorddev/vlak-react";

<LineChart
  height={204}
  labels={days}
  series={[
    { name: "Sheets", values: sheets },
    { name: "Proofs", values: proofs },
  ]}
  unit="sheets"
  yLabel="Output"
  annotations={[{ at: 3, label: "Press" }]}
  spot
/>

<Sparkline values={[3, 5, 4, 8, 7, 9]} label="Sheets" unit="k" />
```

## Props

### LineChart

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `series` (required) | `ChartSeries[]` |  |  |
| `labels` | `string[]` |  |  |
| `height` | `number` | `204` |  |
| `area` | `boolean` |  | Fill under the first series. Prefer AreaChart for a dedicated area. |
| `stacked` | `boolean` |  |  |
| `inverted` | `boolean` |  |  |
| `grid` | `boolean` | `true` |  |
| `ticks` | `number` | `4` |  |
| `unit` | `string` |  |  |
| `yLabel` | `string` |  |  |
| `xLabel` | `string` |  |  |
| `annotations` | `ChartAnnotation[]` |  |  |
| `domain` | `[number, number]` |  |  |
| `spot` | `string \| boolean` |  |  |
| `valueFormat` | `(value: number) => string` |  |  |
| `locale` | `string` |  | BCP 47 tag for number formatting; undefined is the reader's own. |

### Sparkline

Extends `HTMLAttributes<HTMLSpanElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLSpanElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `values` (required) | `(number \| null)[]` |  |  |
| `width` | `number` | `120` |  |
| `height` | `number` | `28` |  |
| `spot` | `string \| boolean` |  |  |
| `label` | `string` |  | What the trend is of; leads the accessible name and the table. |
| `unit` | `string` |  |  |
| `locale` | `string` |  | BCP 47 tag for number formatting; undefined is the reader's own. |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Focuses the plot |
| Arrow right, Arrow left | Moves the cursor across the points; a status tooltip reads the values |
| Home, End | First or last point |
| Escape | Clears the cursor |

## Accessibility

- The plot is a focusable <svg role="group"> with aria-roledescription="interactive chart", named by aria-label, aria-labelledby, yLabel, or the series names.
- A visually hidden table carries every value, so the data reads without the picture; the tooltip is role="status".
- Sparkline is role="img" with a name built from label, the count, and the last value, plus the same hidden table.
- Numbers format through Intl.NumberFormat; locale picks the reader's own by default. Marks stay visible in forced colors.
- Null or non-finite samples create gaps instead of fabricated zeros. Missing values read as No data; empty plots announce their state, and an empty Sparkline has no invented last point.
- Explicit domains generate ticks within their bounds and clip marks to the plot. Without a domain, negative values remain visible.

## Classes

`rs-chart`, `rs-chart-canvas`, `rs-chart-line`, `rs-chart-grid`, `rs-chart-axis`, `rs-chart-bar`, `rs-spark`, `rs-chart-legend-svg`, `rs-chart-svg`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/chart.tsx`  
CSS: `packages/core/css/components/chart.css`
