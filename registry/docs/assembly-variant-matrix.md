# Assembly variant matrix

Edits independent population, bill-of-materials, and placement flags per reference and assembly variant, preserving unspecified choices.

Category: electronics  
Name: `assembly-variant-matrix`  
Also known as: AssemblyVariantMatrix, Assembly options, Population matrix, Bill of materials variants, Placement options, Reference variant table  
Page: https://vlak.dev/components/assembly-variant-matrix/

## When to use

- Caller-owned assembly references, part labels, and named build variants.
- Three independent boolean-or-null flags: population, bill-of-materials inclusion, and placement-file inclusion.
- value/defaultValue/onValueChange to receive the proposed cell array; editing one flag leaves the other flags unchanged.
- Missing cells begin unspecified. Conflicting duplicate cells and unavailable references remain visible rather than being silently merged.

## When not to

- Inferring bill-of-materials or placement policy from the populated flag.
- Assuming the component generates manufacturing files or changes a board design.
- Treating unspecified flags as excluded or not populated.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { AssemblyVariantMatrix } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add assembly-variant-matrix
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/assembly-variant-matrix.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<fieldset class="rs-assembly-variant-matrix"><legend class="rs-assembly-variant-matrix-legend">Assembly options</legend><div class="rs-assembly-variant-matrix-viewport"><table class="rs-assembly-variant-matrix-table"><thead><tr><th class="rs-assembly-variant-matrix-header" scope="col">Reference / variant</th><th class="rs-assembly-variant-matrix-header" scope="col">Pilot</th></tr></thead><tbody><tr><th class="rs-assembly-variant-matrix-header" scope="row">R1<span class="rs-assembly-variant-matrix-part">10 kΩ resistor</span></th><td class="rs-assembly-variant-matrix-cell"><details class="rs-assembly-variant-matrix-details"><summary class="rs-assembly-variant-matrix-summary">Edit R1 in Pilot<span class="rs-assembly-variant-matrix-part">Not specified</span></summary><div class="rs-assembly-variant-matrix-editor"><div class="rs-assembly-variant-matrix-field"><span>Populated</span><div class="rs-select rs-select-fluid rs-assembly-variant-matrix-select"><button class="rs-dropdown" role="combobox" aria-label="Populated, R1 in Pilot" aria-haspopup="listbox" aria-expanded="false" type="button">Unspecified</button></div></div></div></details></td></tr></tbody></table></div></fieldset>
```

## Example

```tsx
import { AssemblyVariantMatrix } from "@noorddev/vlak-react";

<AssemblyVariantMatrix label="Assembly options" name="assembly"
  references={[{ id: "r1", label: "R1", partLabel: "10 kΩ resistor" }]}
  variants={[{ id: "pilot", label: "Pilot" }, { id: "production", label: "Production" }]}
  defaultValue={[{ referenceId: "r1", variantId: "pilot", populated: true, includeInBom: true, includeInPlacement: true }, { referenceId: "r1", variantId: "production", populated: false, includeInBom: true, includeInPlacement: false }]} />
```

## Props

### AssemblyVariantMatrix

Independent fitted, bill-of-materials and placement choices per reference and variant.

Extends `Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, "defaultValue" | "onChange">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLFieldSetElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `ReactNode` |  |  |
| `references` (required) | `AssemblyReference[]` |  |  |
| `variants` (required) | `AssemblyVariant[]` |  |  |
| `value` | `AssemblyVariantState[]` |  |  |
| `defaultValue` | `AssemblyVariantState[]` | `[]` |  |
| `onValueChange` | `(cells: AssemblyVariantState[]) => void` |  |  |
| `readOnly` | `boolean` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves through native cell summaries and controls in expanded editors. |
| Enter, Space | Opens or closes the focused cell's native details editor. |
| Arrow keys | Opens and navigates the Vlak selector between Unspecified, Yes, and No; Enter confirms the highlighted choice. |

## Accessibility

- Native row and column headers identify each reference and variant; cell editor summaries repeat that context.
- Each independent Vlak Select has a flag-specific name including its reference and variant, and a 44px target.
- Compact summaries expose all three flags in text; no color or population shortcut carries policy.
- Native details reveal the editor without focus traps; Vlak Select supplies the choice menu, and overflow remains inside the matrix.
- Named controls submit each flag separately. Read-only values and native form reset are supported; the ref reaches the fieldset.

## Classes

`rs-assembly-variant-matrix`, `rs-assembly-variant-matrix-legend`, `rs-assembly-variant-matrix-viewport`, `rs-assembly-variant-matrix-table`, `rs-assembly-variant-matrix-header`, `rs-assembly-variant-matrix-part`, `rs-assembly-variant-matrix-cell`, `rs-assembly-variant-matrix-details`, `rs-assembly-variant-matrix-summary`, `rs-assembly-variant-matrix-editor`, `rs-assembly-variant-matrix-field`, `rs-assembly-variant-matrix-select`, `rs-assembly-variant-matrix-note`

## Dependencies

Registry dependencies: [select](select.md), [dropdown-menu](dropdown-menu.md).  
React: `packages/react/src/components/assembly-variant-matrix.tsx`  
CSS: `packages/core/css/components/assembly-variant-matrix.css`
