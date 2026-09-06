# Sequence alignment

Displays a bounded window of already aligned reference and read strings, with supplied genomic positions, gaps and keyboard region selection.

Category: science  
Name: `sequence-alignment`  
Also known as: Aligned sequence viewer, Read alignment window, Genomic alignment, Base selection, Sequence window  
Page: https://vlak.dev/components/sequence-alignment/

## When to use

- Inspecting up to 120 pre-aligned columns and 32 reads with explicit reference and read labels.
- Supply one one-based genomic position per aligned column; null represents a reference gap.
- Selection uses one-based aligned column indexes, which are distinct from genomic positions. Use value and onValueChange for host-owned selection.

## When not to

- Running an alignment algorithm or inferring mismatches, insertions, variant calls or genomic positions.
- Passing inconsistent sequence lengths or silently clipping longer alignments. Supply the intended window.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { SequenceAlignment } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add sequence-alignment
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/sequence-alignment.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-sequence-alignment"><p class="rs-sequence-alignment-title">Read alignment</p><p class="rs-sequence-alignment-copy">chr7 · 1-based reference positions; aligned columns include gaps</p><div class="rs-sequence-alignment-scroll"><table class="rs-sequence-alignment-table" aria-label="Reference and reads"><thead><tr><th class="rs-sequence-alignment-heading" scope="col">Reference position</th><th class="rs-sequence-alignment-column" scope="col">101</th><th class="rs-sequence-alignment-column" scope="col">102</th></tr></thead><tbody><tr><th class="rs-sequence-alignment-heading" scope="row">Reference</th><td class="rs-sequence-alignment-base">A</td><td class="rs-sequence-alignment-base">C</td></tr></tbody></table></div></div>
```

## Example

```tsx
import { SequenceAlignment } from "@noorddev/vlak-react";

<SequenceAlignment label="Read alignment" contig="chr7" referenceLabel="Example reference" referenceSequence="AC-GT" positions={[101, 102, null, 103, 104]} reads={[
  { id: "read-1", label: "Read 1", sequence: "ACAGT" },
  { id: "read-2", label: "Read 2", sequence: "AC-GT" },
]} defaultValue={{ startColumn: 1, endColumn: 2 }} />
```

## Props

### SequenceAlignment

A bounded window of already aligned strings; reference positions and gaps are caller-supplied.

Extends `Omit<HTMLAttributes<HTMLDivElement>, "defaultValue">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `string` |  |  |
| `contig` (required) | `string` |  |  |
| `referenceLabel` (required) | `string` |  |  |
| `referenceSequence` (required) | `string` |  |  |
| `positions` (required) | `readonly (number \| null)[]` |  | One supplied one-based reference position per column; null means a reference gap. |
| `reads` (required) | `readonly AlignedRead[]` |  |  |
| `value` | `AlignmentSelection \| null` |  |  |
| `defaultValue` | `AlignmentSelection \| null` | `null` |  |
| `onValueChange` | `(value: AlignmentSelection \| null) => void` |  |  |
| `readOnly` | `boolean` | `false` |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Enters the column controls at one focus stop and then reaches the selection actions. |
| Arrow keys, Home, End | Moves focus between columns in sequence order without changing selection. |
| Shift+Arrow keys | Extends the selected column region from its anchor. |
| Enter, Space | Selects the focused base column or activates a selection action. |

## Accessibility

- A native table supplies row labels and reference-position column headers; every base and gap remains visible text.
- Column buttons have 44px targets and full-column selected fills, with aria-pressed and explicit coordinate names.
- Long windows scroll inside their container. Read-only tables provide a focusable scroll region.
- The selection summary lists supplied positions, including gaps, without inventing genomic coordinates.
- The root div forwards its ref and native attributes; inconsistent or oversized windows have explicit unavailable states.
- Selection actions compose the shared Button primitive; the aligned column controls retain their dedicated table interaction.

## Classes

`rs-sequence-alignment`, `rs-sequence-alignment-title`, `rs-sequence-alignment-copy`, `rs-sequence-alignment-scroll`, `rs-sequence-alignment-table`, `rs-sequence-alignment-heading`, `rs-sequence-alignment-control`, `rs-sequence-alignment-actions`, `rs-sequence-alignment-action`, `rs-sequence-alignment-column`, `rs-sequence-alignment-selected`, `rs-sequence-alignment-base`

## Dependencies

Registry dependencies: [button](button.md).  
React: `packages/react/src/components/sequence-alignment.tsx`  
CSS: `packages/core/css/components/sequence-alignment.css`
