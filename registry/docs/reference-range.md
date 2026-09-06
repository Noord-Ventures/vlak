# Reference range

Positions a supplied numeric reading against caller-supplied reference bounds, with a complete text equivalent.

Category: health  
Name: `reference-range`  
Also known as: Reference interval, Lab range, Result range, Observation range, Biomarker interval  
Page: https://vlak.dev/components/reference-range/

## When to use

- Display numeric bounds supplied by the responsible laboratory or data source.
- Pass valueLabel to format the reading and rangeLabel to identify the source of the interval.
- One-sided intervals are textual; a marker requires two finite, ordered bounds.

## When not to

- Hard-coding a universal normal interval across patients, methods or units.
- Using the marker to indicate a diagnosis, treatment decision or calculated clinical status.
- Comparing a value and bounds expressed in different units.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { ReferenceRange } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add reference-range
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/reference-range.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-reference-range">
  <p class="rs-reference-range-head"><span class="rs-reference-range-label">Reported measurement</span><span class="rs-reference-range-value">24 units</span></p>
  <div class="rs-reference-range-track" aria-hidden="true"><span class="rs-reference-range-interval"></span><span class="rs-reference-range-marker" style="inset-inline-start:44%"></span></div>
  <p class="rs-reference-range-bounds"><span>Supplied reference interval</span><span>20–30 units</span></p>
</div>
```

## Example

```tsx
import { ReferenceRange } from "@noorddev/vlak-react";

<ReferenceRange
  label="Reported measurement"
  value={24}
  minimum={20}
  maximum={30}
  unit="units"
  rangeLabel="Supplied reference interval"
/>
<ReferenceRange label="One-sided interval" value={8} maximum={10} unit="units" />
```

## Props

### ReferenceRange

A supplied numeric reference interval. Position describes arithmetic, never clinical status.

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `string` |  |  |
| `value` | `number \| null` |  |  |
| `minimum` | `number \| null` |  | Caller-supplied lower bound. Omit for an upper bound only. |
| `maximum` | `number \| null` |  | Caller-supplied upper bound. Omit for a lower bound only. |
| `unit` | `string` |  |  |
| `valueLabel` | `string` |  | Display formatting for the supplied numeric value. |
| `rangeLabel` | `string` | `"Reference interval"` | Optional contextual label, such as the laboratory's reference interval. |

## Accessibility

- The reading, unit and reference interval are visible as text; decorative geometry is aria-hidden.
- The reference band spans 20% to 80% of the track from the reading direction's start. Outlying markers clamp to the track and have a textual above or below description.
- Missing, non-finite, equal and reversed bounds never produce an invalid marker position. Missing results are named explicitly.
- A one-sided interval is rendered as at least or up to without inventing a second bound.
- The marker remains visible in forced colors. There is no animation, interactive control or clinical classification.

## Classes

`rs-reference-range`, `rs-reference-range-head`, `rs-reference-range-label`, `rs-reference-range-value`, `rs-reference-range-track`, `rs-reference-range-interval`, `rs-reference-range-marker`, `rs-reference-range-bounds`, `rs-reference-range-description`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/reference-range.tsx`  
CSS: `packages/core/css/components/reference-range.css`
