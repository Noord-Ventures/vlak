# Well plate

A labelled laboratory plate with supplied well states, 44px selection controls and keyboard navigation across up to 1536 wells.

Category: science  
Name: `well-plate`  
Also known as: Microplate, Plate map, Microtiter plate, Sample plate, Assay plate, Well grid  
Page: https://vlak.dev/components/well-plate/

## When to use

- Sample placement and plate inspection with application-supplied rows, columns and well states.
- Unique row and column labels and at most one record per coordinate. Missing records are labelled Unrecorded.
- Use value and onValueChange for application-owned selection; readOnly provides a static plate.

## When not to

- Inferring empty wells, assay outcomes or sample identities from missing records.
- Layouts larger than 1536 wells; the component reports the limit instead of silently truncating a plate.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { WellPlate } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add well-plate
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/well-plate.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-well-plate"><p class="rs-well-plate-label">Plate 042</p><div class="rs-well-plate-scroll"><table class="rs-well-plate-table"><caption>Supplied well records</caption><thead><tr><th class="rs-well-plate-heading" scope="col">Well</th><th class="rs-well-plate-heading" scope="col">1</th></tr></thead><tbody><tr><th class="rs-well-plate-heading" scope="row">A</th><td class="rs-well-plate-cell"><div class="rs-well-plate-well rs-well-plate-static"><span class="rs-well-plate-coordinate">A1</span><span>Loaded</span></div></td></tr></tbody></table></div></div>
```

## Example

```tsx
import { WellPlate } from "@noorddev/vlak-react";

<WellPlate label="Plate 042" rows={["A", "B", "C"]} columns={["1", "2", "3", "4"]} wells={[
  { row: "A", column: "1", status: "Loaded", label: "Control" },
  { row: "A", column: "2", status: "Loaded", label: "Sample 042" },
  { row: "B", column: "1", status: "Reserved", disabled: true },
]} defaultValue={{ row: "A", column: "1" }} />
```

## Props

### WellPlate

A plate of up to 1536 wells, with roving keyboard focus and explicit unrecorded cells.

Extends `Omit<HTMLAttributes<HTMLDivElement>, "defaultValue">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `string` |  |  |
| `rows` (required) | `readonly string[]` |  |  |
| `columns` (required) | `readonly string[]` |  |  |
| `wells` (required) | `readonly WellRecord[]` |  |  |
| `value` | `WellPosition \| null` |  |  |
| `defaultValue` | `WellPosition \| null` | `null` |  |
| `onValueChange` | `(value: WellPosition) => void` |  |  |
| `description` | `ReactNode` |  |  |
| `disabled` | `boolean` | `false` |  |
| `readOnly` | `boolean` | `false` | Static well cells add no tab stops; their scroll container remains focusable. |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Enters the plate at one enabled well and then leaves the grid. |
| Arrow keys | Moves focus along a row or column, skipping disabled wells without changing selection. |
| Home, End | Moves to the first or last enabled well in the current row. |
| Ctrl+Home, Ctrl+End | Moves to the first or last enabled well in the plate. |
| Enter, Space | Selects the focused well. Controlled selection waits for the caller's updated value. |

## Accessibility

- A named grid uses row and column headers, roving button focus and aria-selected cells. Every well name includes its coordinates and supplied state.
- Selected wells use a full fill and controls retain 44px targets. Large plates scroll inside their own container.
- Arrow navigation respects the document reading direction. Disabled wells are skipped; static and fully disabled plates provide one focusable scroll region.
- Duplicate or unknown coordinates and invalid layouts produce a visible explanation instead of an ambiguous plate.
- The root div forwards its ref and native attributes. Selection does not submit a form.

## Classes

`rs-well-plate`, `rs-well-plate-label`, `rs-well-plate-description`, `rs-well-plate-scroll`, `rs-well-plate-table`, `rs-well-plate-heading`, `rs-well-plate-cell`, `rs-well-plate-well`, `rs-well-plate-selected`, `rs-well-plate-unavailable`, `rs-well-plate-static`, `rs-well-plate-coordinate`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/well-plate.tsx`  
CSS: `packages/core/css/components/well-plate.css`
