# Scatter chart

Shows the relationship between two measures. Marks sit on a 1px grid in ink or one spot color.

Category: charts  
Name: `scatter-chart`  
Also known as: Scatter chart, Scatter plot, Dot plot, XY chart  
Page: https://vlak.dev/components/scatter-chart/

## When to use

- Two numeric variables per point; group annotates the legend and accessible data table, not a separate visual mark style.
- xDomain and yDomain pin valid numeric axes; invalid or equal domains fall back to the data extent.

## When not to

- Ordered categories; use BarChart.
- Thousands of points; aggregate first.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { ScatterChart } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add scatter-chart
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/scatter-chart.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-chart"><svg viewBox="0 0 240 64" width="240" height="64"><line class="rs-chart-grid" x1="0" x2="240" y1="56" y2="56"/><circle class="rs-chart-mark" cx="36" cy="40" r="2"/><circle class="rs-chart-mark" cx="88" cy="22" r="2"/><circle class="rs-chart-mark" cx="140" cy="30" r="2"/><circle class="rs-chart-mark" cx="196" cy="14" r="2"/></svg></div>
```

## Example

```tsx
import { ScatterChart } from "@noorddev/vlak-react";

<ScatterChart
  height={204}
  points={[{ x: 12, y: 40 }, { x: 40, y: 22, label: "Press" }, { x: 60, y: 30 }]}
  xLabel="Module"
  yLabel="Density"
  annotations={[{ at: 40, label: "204" }]}
/>
```

## Props

### ScatterChart

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `points` (required) | `ChartPoint[]` |  |  |
| `height` | `number` | `204` |  |
| `unit` | `string` |  |  |
| `xLabel` | `string` |  |  |
| `yLabel` | `string` |  |  |
| `xDomain` | `[number, number]` |  |  |
| `yDomain` | `[number, number]` |  |  |
| `grid` | `boolean` | `true` |  |
| `ticks` | `number` | `4` |  |
| `annotations` | `ChartAnnotation[]` | `[]` |  |
| `valueFormat` | `(n: number) => string` |  |  |
| `spot` | `string \| boolean` |  |  |
| `locale` | `string` |  | BCP 47 tag for number formatting; undefined is the reader's own. |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Focuses the plot |
| Arrow right, Arrow left | Moves the cursor across the points; a status tooltip reads x and y |
| Home, End | First or last point |
| Escape | Clears the cursor |

## Accessibility

- A focusable, named plot with a visually hidden table of x and y per point.
- Non-finite coordinates are excluded. Empty datasets display No data to display without invalid SVG coordinates.

## Classes

`rs-chart-mark`

## Dependencies

Registry dependencies: [chart](chart.md).  
React: `packages/react/src/components/chart.tsx`  
CSS: `packages/core/css/components/chart.css`
