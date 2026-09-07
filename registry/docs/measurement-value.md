# Measurement value

A supplied scientific reading with units, symmetric uncertainty, optional scientific notation and explicit availability.

Category: science  
Name: `measurement-value`  
Also known as: Scientific measurement, Uncertainty display, Measured value, Scientific notation, Metrology reading  
Page: https://vlak.dev/components/measurement-value/

## When to use

- Scientific observations with application-supplied uncertainty and units.
- Pass a string to preserve significant figures such as 1.230; scientific notation formats numeric inputs without selecting a precision.
- Use uncertaintyLabel to name the supplied uncertainty convention.

## When not to

- Inferring significant figures, a confidence level, a distribution or unit conversions.
- Treating zero as missing, or using a negative uncertainty to express asymmetric bounds.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { MeasurementValue } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add measurement-value
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/measurement-value.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-measurement-value"><p class="rs-measurement-value-label">Sample mass</p><p class="rs-measurement-value-reading"><span class="rs-measurement-value-number">1.230</span><span class="rs-measurement-value-uncertainty">± 0.005</span><span class="rs-measurement-value-unit">g</span></p><p class="rs-measurement-value-context">Supplied uncertainty</p></div>
```

## Example

```tsx
import { MeasurementValue } from "@noorddev/vlak-react";

<MeasurementValue label="Sample mass" value="1.230" uncertainty={0.005} unit="g" source="Balance record, sample 042" />
<MeasurementValue label="Small reading" value={0.0000123} notation="scientific" unit="A" />
<MeasurementValue label="Next measurement" status="pending" />
```

## Props

### MeasurementValue

A supplied scientific reading without inferred precision, confidence or unit conversion.

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `ReactNode` |  |  |
| `value` | `string \| number \| null` |  | Strings preserve supplied significant figures. Non-finite numbers are unavailable. |
| `unit` | `string` |  |  |
| `uncertainty` | `number \| null` |  | A supplied symmetric, non-negative uncertainty in the same unit as value. |
| `uncertaintyLabel` | `ReactNode` |  |  |
| `notation` | `"plain" \| "scientific"` | `"plain"` | Scientific notation changes numeric formatting only; supplied strings are unchanged. |
| `status` | `"pending" \| "unavailable" \| "recorded"` | `"recorded"` |  |
| `source` | `ReactNode` |  |  |
| `description` | `ReactNode` |  |  |

## Accessibility

- The reading, plus-minus uncertainty, unit and source remain visible text.
- Pending and unavailable states suppress the numeric reading. Zero is preserved, while empty strings and non-finite values are unavailable.
- Negative or non-finite uncertainty is explicitly unavailable without hiding a valid reading.
- The div ref, native attributes, className and style pass through. No automatic announcements or interactive stops are added.

## Classes

`rs-measurement-value`, `rs-measurement-value-label`, `rs-measurement-value-reading`, `rs-measurement-value-number`, `rs-measurement-value-uncertainty`, `rs-measurement-value-unit`, `rs-measurement-value-context`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/measurement-value.tsx`  
CSS: `packages/core/css/components/measurement-value.css`
