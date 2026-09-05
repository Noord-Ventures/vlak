# Small multiples

Compares repeated charts on shared axes. Each panel occupies one 184px column.

Category: charts  
Name: `small-multiples`  
Also known as: Small multiples, Trellis chart, Facet grid, Panel charts  
Page: https://vlak.dev/components/small-multiples/

## When to use

- The same measure across places, products, or periods, one small line chart per panel on a shared value domain by default.
- Set sharedDomain=false only for independent trends; it removes direct magnitude comparison.

## When not to

- Panels with different units; they no longer compare.
- One series; use LineChart.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { SmallMultiples } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add small-multiples
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/small-multiples.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-chart-multi"><div class="rs-chart"><svg viewBox="0 0 184 64" width="184" height="64"><path class="rs-chart-line" d="M0 40 L46 28 L92 34 L138 16 L184 22"/></svg></div><div class="rs-chart"><svg viewBox="0 0 184 64" width="184" height="64"><path class="rs-chart-line" d="M0 30 L46 36 L92 22 L138 28 L184 18"/></svg></div></div>
```

## Example

```tsx
import { SmallMultiples } from "@noorddev/vlak-react";

<SmallMultiples
  height={136}
  panels={[
    { title: "Alkmaar", labels: days, series: [{ name: "Sheets", values: alkmaar }] },
    { title: "Delft", labels: days, series: [{ name: "Sheets", values: delft }] },
  ]}
  unit="sheets"
/>
```

## Props

### SmallMultiples

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `panels` (required) | `SmallMultiple[]` |  |  |
| `height` | `number` | `136` |  |
| `unit` | `string` |  |  |
| `grid` | `boolean` | `true` |  |
| `ticks` | `number` | `3` |  |
| `spot` | `string \| boolean` |  |  |
| `sharedDomain` | `boolean` | `true` | Compare panels on one scale by default. Disable only for independent trends. |
| `locale` | `string` |  | BCP 47 tag for number formatting; undefined is the reader's own. |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Focuses each panel's plot in turn |
| Arrow right, Arrow left, Home, End, Escape | Move and clear the cursor inside the focused panel |

## Accessibility

- Each panel is a <figure> with a caption; its plot is labelled by that caption and carries its own hidden table.

## Classes

`rs-chart-multi`, `rs-chart-multi-item`, `rs-chart-multi-cap`

## Dependencies

Registry dependencies: [chart](chart.md).  
React: `packages/react/src/components/chart.tsx`  
CSS: `packages/core/css/components/chart.css`
