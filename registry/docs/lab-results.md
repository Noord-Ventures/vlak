# Lab results

A named collection of supplied laboratory results with units, reference intervals, report times and amendment notes.

Category: health  
Name: `lab-results`  
Also known as: Laboratory report, Lab panel, Test results, Patient results, Pathology results, Diagnostic report  
Page: https://vlak.dev/components/lab-results/

## When to use

- Review numeric and qualitative results from an existing report.
- Supply report states and flags from the source; the component never derives them from a reading.
- Attach note to explain an amendment or unavailable result; provide stable result ids.

## When not to

- Calculating diagnoses, critical-result alerts or treatment recommendations.
- Implying that final means clinically normal or that an amended value is the original report.
- Using the synthetic example values as clinical reference intervals.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { LabResults } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add lab-results
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/lab-results.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<ul class="rs-lab-results" aria-label="Latest report">
  <li class="rs-lab-results-item" data-status="amended"><div class="rs-lab-results-head"><p class="rs-lab-results-name">Reported measurement</p><p class="rs-lab-results-status">Amended</p></div><p class="rs-lab-results-reading">24 <span class="rs-lab-results-unit">units</span></p><p class="rs-lab-results-note">Replaces the earlier report</p></li>
  <li class="rs-lab-results-item" data-status="pending"><div class="rs-lab-results-head"><p class="rs-lab-results-name">Additional analysis</p><p class="rs-lab-results-status">Pending</p></div></li>
</ul>
```

## Example

```tsx
import { LabResults } from "@noorddev/vlak-react";

<LabResults label="Latest report" results={[
  { id: "reported", name: "Reported measurement", value: 24, unit: "units", minimum: 20, maximum: 30, status: "amended", note: "Replaces the earlier report" },
  { id: "analysis", name: "Additional analysis", status: "pending" },
  { id: "sample", name: "Sample analysis", status: "unavailable", note: "The laboratory did not release a result" },
]} />
```

## Props

### LabResults

Supplied laboratory results with explicit report states and optional reference intervals.

Extends `Omit<HTMLAttributes<HTMLUListElement>, "results">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLUListElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `string` |  | Accessible collection name. |
| `results` (required) | `readonly LabResult[]` |  |  |
| `emptyLabel` | `string` | `"No results available"` |  |

## Accessibility

- The root is a native list named by label, with one item per result and a forwarded list ref.
- Final, pending, unavailable and amended states are explicit text; caller-supplied flags supplement the report state.
- Pending and unavailable results hide any supplied value. Zero and qualitative result strings remain valid readings.
- Numeric reference intervals reuse ReferenceRange, including its visible text equivalent and invalid-bound handling.
- An amended report without a reading explicitly says result unavailable. No live announcements are added automatically.

## Classes

`rs-lab-results`, `rs-lab-results-item`, `rs-lab-results-head`, `rs-lab-results-name`, `rs-lab-results-status`, `rs-lab-results-reading`, `rs-lab-results-unit`, `rs-lab-results-note`, `rs-lab-results-time`

## Dependencies

Registry dependencies: [reference-range](reference-range.md).  
React: `packages/react/src/components/lab-results.tsx`  
CSS: `packages/core/css/components/lab-results.css`
