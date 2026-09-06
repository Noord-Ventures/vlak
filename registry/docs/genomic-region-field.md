# Genomic region field

Collects a reference, contig and validated integer interval with an explicit one-based inclusive coordinate convention and native form submission.

Category: science  
Name: `genomic-region-field`  
Also known as: Genome interval input, Genomic coordinates, Contig region input, One-based interval, Genomic location field  
Page: https://vlak.dev/components/genomic-region-field/

## When to use

- Integer genomic intervals against a fixed caller-supplied reference and explicit contig lengths.
- The field always uses one-based inclusive positions, including both endpoints. A one-position region has equal start and end.
- name prefixes submitted reference, coordinates, contig, start and end fields. Native form reset restores uncontrolled defaults.
- Changing contig keeps the entered integers and revalidates its bounds; no coordinate conversion occurs.

## When not to

- Silently converting zero-based half-open intervals or moving coordinates between genome assemblies.
- Using guessed contig lengths or clamping invalid coordinates into a different region.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { GenomicRegionField } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add genomic-region-field
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/genomic-region-field.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<fieldset class="rs-genomic-region-field"><legend class="rs-genomic-region-field-legend">Region</legend><p class="rs-genomic-region-field-copy">Reference: Example reference</p><p class="rs-genomic-region-field-copy">1-based, inclusive. Both start and end are included.</p><div class="rs-genomic-region-field-fields"><div class="rs-genomic-region-field-label"><span id="genomic-contig-label">Contig</span><div class="rs-select rs-select-fluid"><button type="button" class="rs-dropdown" role="combobox" aria-labelledby="genomic-contig-label" aria-expanded="false" aria-haspopup="listbox"><span>chr7</span></button></div></div><label class="rs-genomic-region-field-label">Start<input class="rs-input rs-input-full rs-genomic-region-field-control" type="number" min="1" step="1" name="region.start" value="101" /></label><label class="rs-genomic-region-field-label">End<input class="rs-input rs-input-full rs-genomic-region-field-control" type="number" min="1" step="1" name="region.end" value="105" /></label></div></fieldset>
```

## Example

```tsx
import { GenomicRegionField } from "@noorddev/vlak-react";

<GenomicRegionField label="Region" reference="Example reference" name="region" contigs={[{ id: "chr7", length: 100000 }, { id: "chr8", length: 80000 }]} defaultValue={{ contig: "chr7", start: 101, end: 105 }} required />
```

## Props

### GenomicRegionField

A region in one-based inclusive coordinates. No assembly or half-open conversion is performed.

Extends `Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, "defaultValue">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLFieldSetElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `ReactNode` |  |  |
| `reference` (required) | `string` |  | Fixed reference name or accession, submitted with the region. |
| `contigs` (required) | `readonly GenomicContig[]` |  |  |
| `value` | `GenomicRegion` |  |  |
| `defaultValue` | `GenomicRegion` | `emptyRegion` |  |
| `onValueChange` | `(value: GenomicRegion) => void` |  |  |
| `required` | `boolean` | `false` |  |
| `readOnly` | `boolean` | `false` |  |
| `description` | `ReactNode` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves through the contig, start and end controls. |
| Arrow keys, typing | Opens and navigates the Vlak contig selector or edits numeric inputs. Enter or Space confirms a contig; Escape closes its menu. |

## Accessibility

- A legend and visible labels name the group. Vlak Select and Input provide 44px controls; the coordinate convention is always visible.
- Validation rejects partial regions, non-integers, unsafe integers, positions below 1, reversed endpoints and coordinates beyond the supplied contig.
- Errors are linked to the controls and participate in native form validity. Invalid values remain editable without clamping.
- Missing reference metadata and invalid contig catalogs are explicit; zero never becomes position 1 automatically.
- Read-only fields preserve submitted values, disabled fieldsets do not submit, and controlled values remain application-owned.

## Classes

`rs-genomic-region-field`, `rs-genomic-region-field-legend`, `rs-genomic-region-field-fields`, `rs-genomic-region-field-label`, `rs-genomic-region-field-control`, `rs-genomic-region-field-copy`

## Dependencies

Registry dependencies: [input](input.md), [select](select.md), [dropdown-menu](dropdown-menu.md).  
React: `packages/react/src/components/genomic-region-field.tsx`  
CSS: `packages/core/css/components/genomic-region-field.css`
