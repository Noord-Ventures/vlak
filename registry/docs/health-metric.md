# Health metric

A supplied health reading, unit, time and source with explicit pending, unavailable and stale states.

Category: health  
Name: `health-metric`  
Also known as: Vital sign, Vital metric, Health reading, Patient observation, Biometric card, Wellness metric  
Page: https://vlak.dev/components/health-metric/

## When to use

- Patient summaries and wellness dashboards with a known source for each reading.
- Pass status from the application's data policy; the component does not infer freshness.
- Pass timeLabel with the relevant timezone when a human-readable time is needed.

## When not to

- Deriving a diagnosis, clinical flag or urgency from the number.
- Using zero as a placeholder for missing data; omit value instead.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { HealthMetric } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add health-metric
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/health-metric.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-health-metric" data-status="stale">
  <p class="rs-health-metric-label">Resting heart rate</p>
  <p class="rs-health-metric-reading"><span class="rs-health-metric-value">64</span> <span class="rs-health-metric-unit">bpm</span></p>
  <p class="rs-health-metric-status">Last recorded, stale</p>
  <p class="rs-health-metric-meta"><time datetime="2026-09-05T07:20:00+02:00">5 Sep, 07:20 CEST</time><span>Wrist sensor</span></p>
</div>
```

## Example

```tsx
import { HealthMetric } from "@noorddev/vlak-react";

<HealthMetric
  label="Resting heart rate"
  value={64}
  unit="bpm"
  status="stale"
  dateTime="2026-09-05T07:20:00+02:00"
  timeLabel="5 Sep, 07:20 CEST"
  source="Wrist sensor"
  description="Waiting for the next device sync"
/>
<HealthMetric label="Sleep duration" status="pending" />
```

## Props

### HealthMetric

A sourced reading with explicit data availability, without clinical interpretation.

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `ReactNode` |  |  |
| `value` | `string \| number \| null` |  | A supplied reading. Zero is a reading; empty strings and non-finite numbers are missing. |
| `unit` | `string` |  |  |
| `status` | `HealthMetricStatus` | `"available"` | Supplied by the application. Freshness is never inferred from the timestamp. |
| `statusLabel` | `ReactNode` |  |  |
| `dateTime` | `string` |  |  |
| `timeLabel` | `string` |  | Human-readable time, including the relevant timezone. Falls back to dateTime. |
| `source` | `ReactNode` |  |  |
| `description` | `ReactNode` |  |  |

## Accessibility

- Visible labels, units, status, source and time accompany the reading.
- Zero is preserved; empty strings and non-finite values become unavailable. Pending and unavailable states suppress any supplied reading.
- Stale values remain visible with a textual stale label. No clinical status is calculated.
- A native time element preserves the supplied machine-readable timestamp. Native attributes and the div ref pass through.
- The component adds no live region or tab stop. The application can announce updates in context.

## Classes

`rs-health-metric`, `rs-health-metric-label`, `rs-health-metric-reading`, `rs-health-metric-value`, `rs-health-metric-unit`, `rs-health-metric-status`, `rs-health-metric-meta`, `rs-health-metric-description`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/health-metric.tsx`  
CSS: `packages/core/css/components/health-metric.css`
