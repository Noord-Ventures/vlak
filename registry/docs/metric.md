# Metric

Displays a numeric reading with tabular figures and aligned units.

Category: content  
Name: `metric`  
Also known as: Metric  
Page: https://vlak.dev/components/metric/

## When to use

- Dashboard readings, vehicle status, and concise numeric comparisons.

## When not to

- Full data series; use Charts.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { Metric } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add metric
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/metric.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-metric"><p class="rs-metric-label">Estimated range</p><div class="rs-metric-reading"><span class="rs-metric-value">386</span><span class="rs-metric-unit">km</span></div></div>
```

## Example

```tsx
import { Metric } from "@noorddev/vlak-react";

<Metric label="Estimated range" value={386} unit="km" description="Ready for your next journey" comparison="18 km more than yesterday" />
```

## Props

### Metric

A numeric reading with stable baseline, tabular figures, and an explicit unit.

Extends `Omit<HTMLAttributes<HTMLDivElement>, "children">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `ReactNode` |  |  |
| `value` (required) | `string \| number` |  |  |
| `unit` | `ReactNode` |  |  |
| `description` | `ReactNode` |  |  |
| `comparison` | `ReactNode` |  |  |
| `trend` | `ReactNode` |  | Optional trend visualization, for example an existing Sparkline. |
| `locale` | `string` | `"en"` |  |
| `formatOptions` | `Intl.NumberFormatOptions` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| None | Static reading; no additional keyboard stop. |

## Accessibility

- The label, formatted value, and unit are readable text. Provide a text equivalent for an optional trend graphic.

## Classes

`rs-metric`, `rs-metric-label`, `rs-metric-reading`, `rs-metric-value`, `rs-metric-unit`, `rs-metric-detail`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/metric.tsx`  
CSS: `packages/core/css/components/metric.css`
