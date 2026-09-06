# Coverage inspector

Shows supplied per-locus depth, base and strand counts with an exact position selector, bounded plot and complete depth table.

Category: science  
Name: `coverage-inspector`  
Also known as: Read depth inspector, Per-base coverage, Strand count inspector, Locus coverage, Genomic depth plot  
Page: https://vlak.dev/components/coverage-inspector/

## When to use

- A bounded window of up to 512 unique one-based loci with caller-supplied counts.
- Inspect base and strand counts independently; the component does not sum them or reconcile them with depth.
- Use null for missing counts. Zero means an explicitly recorded count of zero.

## When not to

- Calling variants, assigning significance, or applying coverage thresholds.
- Treating absent counts as zero, or supplying fractional and negative counts as valid depth.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { CoverageInspector } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add coverage-inspector
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/coverage-inspector.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<figure class="rs-coverage-inspector"><figcaption class="rs-coverage-inspector-title">Coverage window</figcaption><p class="rs-coverage-inspector-copy">chr7 · 1-based positions</p><div class="rs-coverage-inspector-label"><span id="coverage-position-label">Inspect position</span><div class="rs-select rs-select-fluid rs-coverage-inspector-select"><button type="button" class="rs-dropdown" role="combobox" aria-labelledby="coverage-position-label" aria-expanded="false" aria-haspopup="listbox"><span>101 · Depth 0</span></button></div></div><dl class="rs-coverage-inspector-counts"><div><dt>Depth</dt><dd class="rs-coverage-inspector-value">0</dd></div></dl></figure>
```

## Example

```tsx
import { CoverageInspector } from "@noorddev/vlak-react";

<CoverageInspector label="Coverage window" contig="chr7" reference="Example reference" loci={[
  { position: 101, depth: 0, bases: { A: 0, C: 0 }, forward: 0, reverse: 0 },
  { position: 102, depth: null },
  { position: 103, depth: 24, bases: { A: 20, C: 4 }, forward: 12, reverse: 12 },
]} defaultValue={103} />
```

## Props

### CoverageInspector

Supplied coverage and counts, with missing depth distinct from recorded zero and no variant calls.

Extends `Omit<HTMLAttributes<HTMLElement>, "defaultValue">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `string` |  |  |
| `contig` (required) | `string` |  |  |
| `reference` | `string` |  |  |
| `loci` (required) | `readonly CoverageLocus[]` |  |  |
| `value` | `number \| null` |  | A supplied one-based position, not an array index. |
| `defaultValue` | `number \| null` |  |  |
| `onValueChange` | `(position: number \| null) => void` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Focuses the Vlak position selector and native depth-table disclosure. |
| Arrow keys, typing | Opens and navigates the Vlak position selector by arrow keys and typeahead. Escape closes its menu. |
| Enter, Space | Chooses a highlighted locus or opens and closes the focused native depth disclosure. |

## Accessibility

- The decorative plot has a complete visible depth table; open markers distinguish unavailable depth from recorded zero.
- Vlak Select provides a 44px trigger and listbox for exact supplied genomic positions. Selected depth, base and strand counts use description lists.
- Non-finite, negative and non-integer counts are unavailable; missing counts are explicitly not supplied.
- At most 16 base symbols are displayed per selected locus. Invalid or oversized locus windows are reported without truncation.
- The figure ref and native attributes pass through; selection supports controlled values and native form reset.

## Classes

`rs-coverage-inspector`, `rs-coverage-inspector-title`, `rs-coverage-inspector-copy`, `rs-coverage-inspector-plot`, `rs-coverage-inspector-stem`, `rs-coverage-inspector-point`, `rs-coverage-inspector-missing`, `rs-coverage-inspector-axis`, `rs-coverage-inspector-label`, `rs-coverage-inspector-select`, `rs-coverage-inspector-counts`, `rs-coverage-inspector-value`, `rs-coverage-inspector-summary`, `rs-coverage-inspector-table`, `rs-coverage-inspector-cell`

## Dependencies

Registry dependencies: [select](select.md), [dropdown-menu](dropdown-menu.md).  
React: `packages/react/src/components/coverage-inspector.tsx`  
CSS: `packages/core/css/components/coverage-inspector.css`
