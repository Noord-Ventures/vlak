# Datum transform picker

A Vlak transformation selector with source and destination references, supplied accuracy and area, and visible support-grid availability.

Category: geospatial  
Name: `datum-transform-picker`  
Also known as: Datum transformation, Coordinate operation, Projection operation picker, Support grid selector, Reprojection choice  
Page: https://vlak.dev/components/datum-transform-picker/

## When to use

- Comparing operations supplied by a projection engine or survey provider before the application transforms coordinates.
- Supply unique, non-empty operation identifiers and explicit available values. false or null disables an operation; listed grids must all be available.
- Use an empty grids array to state that no support grids are required. Omit grids when the requirements were not supplied.
- null means no operation selected. Unknown current identifiers stay visible as unavailable. The application owns candidate generation, accuracy, compatibility and persistence.

## When not to

- Automatically picking the smallest reported error, assuming an unlisted grid is installed or silently falling back to a different operation.
- Presenting illustrative accuracy or area labels as calculated guarantees.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { DatumTransformPicker } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add datum-transform-picker
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/datum-transform-picker.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<fieldset class="rs-datum-transform-picker"><legend class="rs-datum-transform-picker-legend">Coordinate operation</legend><dl class="rs-datum-transform-picker-context"><div><dt class="rs-datum-transform-picker-term">Source reference</dt><dd class="rs-datum-transform-picker-detail">Site grid</dd></div><div><dt class="rs-datum-transform-picker-term">Destination reference</dt><dd class="rs-datum-transform-picker-detail">Project grid</dd></div></dl><div class="rs-datum-transform-picker-label"><span id="geo-transformation-label">Transformation</span><div class="rs-select rs-select-fluid rs-datum-transform-picker-control"><button type="button" class="rs-dropdown" role="combobox" aria-labelledby="geo-transformation-label" aria-expanded="false" aria-haspopup="listbox">Parameter transform</button></div></div><ul class="rs-datum-transform-picker-list"><li class="rs-datum-transform-picker-item rs-datum-transform-picker-selected"><p class="rs-datum-transform-picker-title">Parameter transform · Selected</p><p class="rs-datum-transform-picker-note">Available</p><dl class="rs-datum-transform-picker-context"><div><dt class="rs-datum-transform-picker-term">Reported accuracy</dt><dd class="rs-datum-transform-picker-detail">1.5 m</dd></div><div><dt class="rs-datum-transform-picker-term">Area of use</dt><dd class="rs-datum-transform-picker-detail">Project extent</dd></div></dl><p class="rs-datum-transform-picker-note">Support grids: None required</p></li></ul></fieldset>
```

## Example

```tsx
import { DatumTransformPicker } from "@noorddev/vlak-react";

<DatumTransformPicker
  label="Coordinate operation"
  sourceReference="Site grid"
  destinationReference="Project grid"
  name="operation"
  defaultValue="parameter"
  transformations={[
    { id: "grid", label: "Grid correction", available: true, accuracy: "0.05 m", area: "Site survey extent", grids: [{ id: "site", label: "Site correction grid", available: false }], unavailableReason: "Attach the supplied grid" },
    { id: "parameter", label: "Parameter transform", available: true, accuracy: "1.5 m", area: "Project extent", grids: [] },
  ]}
/>
```

## Props

### DatumTransformPicker

Compares host-supplied operations and keeps unavailable alternatives visible.

Extends `Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, "defaultValue">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLFieldSetElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `ReactNode` |  |  |
| `sourceReference` (required) | `ReactNode` |  |  |
| `destinationReference` (required) | `ReactNode` |  |  |
| `transformations` (required) | `readonly DatumTransformation[]` |  |  |
| `value` | `string \| null` |  | null means no operation selected; an unknown identifier stays explicitly unavailable. |
| `defaultValue` | `string \| null` | `null` |  |
| `onValueChange` | `(value: string \| null) => void` |  |  |
| `description` | `ReactNode` |  |  |
| `selectionLabel` | `string` | `"Transformation"` |  |
| `noneLabel` | `string` | `"No transformation selected"` |  |
| `required` | `boolean` |  |  |
| `readOnly` | `boolean` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Focuses the Vlak transformation selector. |
| Arrow keys, Home, End | Navigates the Vlak selector. Enter or Space chooses an available operation or the no-selection option; Escape closes the menu. Unavailable alternatives are skipped. |

## Accessibility

- Source and destination references have visible labels; null references are explicitly unknown.
- Every candidate retains visible accuracy, area, grid requirements and availability text, including disabled alternatives.
- The selected candidate uses a full-surface fill and a visible Selected label; forced colors retain a distinct border.
- A currently unavailable operation is marked invalid and fails native validation. Required selection uses the native required attribute.
- Vlak Select supplies the 44px trigger, menu, disabled choices and native form value. Read-only valid selections submit through a hidden value; disabled selections do not submit.
- Uncontrolled state follows native form reset, including external forms. Controlled state, native fieldset attributes, ref and consumer styles remain with the caller.

## Classes

`rs-datum-transform-picker`, `rs-datum-transform-picker-legend`, `rs-datum-transform-picker-context`, `rs-datum-transform-picker-term`, `rs-datum-transform-picker-detail`, `rs-datum-transform-picker-label`, `rs-datum-transform-picker-control`, `rs-datum-transform-picker-list`, `rs-datum-transform-picker-item`, `rs-datum-transform-picker-selected`, `rs-datum-transform-picker-title`, `rs-datum-transform-picker-note`

## Dependencies

Registry dependencies: [select](select.md), [dropdown-menu](dropdown-menu.md).  
React: `packages/react/src/components/datum-transform-picker.tsx`  
CSS: `packages/core/css/components/datum-transform-picker.css`
