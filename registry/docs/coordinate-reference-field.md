# Coordinate reference field

Two or three numeric coordinate axes with supplied units and a reference selector that preserves entered values when assigning a reference.

Category: geospatial  
Name: `coordinate-reference-field`  
Also known as: Coordinate input, Reference system selector, Survey point field, Projected coordinate, Latitude longitude field  
Page: https://vlak.dev/components/coordinate-reference-field/

## When to use

- Survey points and imported coordinates whose reference, axis order and units are supplied by the application.
- Supply two or three axes in coordinate order with unique, non-empty identifiers; reference values must also be unique and non-empty.
- Use value and onValueChange for application-owned conversion. Changing the reference requests only a new identifier and preserves the numeric coordinates.
- name submits reference as name.reference and each axis as name.coordinates followed by its identifier. null represents a missing coordinate or reference.

## When not to

- Inferring a reference from numeric ranges, treating a reference assignment as reprojection or guessing axis units.
- Using a latitude or longitude bound for a projected axis unless the application supplies that constraint.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { CoordinateReferenceField } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add coordinate-reference-field
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/coordinate-reference-field.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<fieldset class="rs-coordinate-reference-field"><legend class="rs-coordinate-reference-field-legend">Survey point</legend><p class="rs-coordinate-reference-field-note">Assigning a reference keeps the entered coordinates.</p><div class="rs-coordinate-reference-field-label"><span id="geo-coordinate-reference-label">Coordinate reference</span><div class="rs-select rs-select-fluid rs-coordinate-reference-field-control"><button type="button" class="rs-dropdown" role="combobox" aria-labelledby="geo-coordinate-reference-label" aria-expanded="false" aria-haspopup="listbox">Site grid</button></div></div><div class="rs-coordinate-reference-field-axes"><label class="rs-coordinate-reference-field-label">Easting (m)<input class="rs-input rs-input-full rs-coordinate-reference-field-control" name="point.coordinates.east" type="number" step="any" value="120.5" /></label><label class="rs-coordinate-reference-field-label">Northing (m)<input class="rs-input rs-input-full rs-coordinate-reference-field-control" name="point.coordinates.north" type="number" step="any" value="48.25" /></label></div></fieldset>
```

## Example

```tsx
import { CoordinateReferenceField } from "@noorddev/vlak-react";

<CoordinateReferenceField
  label="Recorded survey point"
  name="point"
  axes={[{ id: "east", label: "Easting", unit: "m" }, { id: "north", label: "Northing", unit: "m" }]}
  references={[{ value: "site", label: "Site grid" }, { value: "project", label: "Project grid" }]}
  defaultValue={{ reference: "site", coordinates: { east: 120.5, north: 48.25 } }}
/>
```

## Props

### CoordinateReferenceField

Numeric coordinates and an explicitly assigned reference, without implicit conversion.

Extends `Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, "defaultValue">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLFieldSetElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `ReactNode` |  |  |
| `axes` (required) | `readonly CoordinateReferenceAxis[]` |  | Two or three axes in the supplied coordinate order. Units are never inferred. |
| `references` (required) | `readonly CoordinateReferenceOption[]` |  |  |
| `value` | `CoordinateReferenceValue` |  |  |
| `defaultValue` | `CoordinateReferenceValue` | `initial` |  |
| `onValueChange` | `(value: CoordinateReferenceValue) => void` |  | Assigning a reference preserves every numeric value. The host owns reprojection. |
| `description` | `ReactNode` |  |  |
| `referenceLabel` | `string` | `"Coordinate reference"` |  |
| `unknownReferenceLabel` | `string` | `"Unknown reference"` |  |
| `required` | `boolean` |  |  |
| `readOnly` | `boolean` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves through the reference selector and coordinate inputs in supplied axis order. |
| Arrow keys, Home, End | Opens and navigates the Vlak selector. Enter or Space chooses a reference without converting numeric values; Escape closes the menu. |
| Typing | Edits numeric coordinates using the native number inputs. |

## Accessibility

- The fieldset legend names the coordinate group. Vlak Select and Input provide shared control paint; every numeric input has a visible axis label, supplied unit and 44px target.
- Unknown references, missing coordinates and non-finite numbers have explicit text. Zero is retained. Invalid supplied values participate in native form validation.
- Required and supplied axis bounds use native validation. No geographic constraints are inferred.
- Uncontrolled values follow native form reset, including external forms; controlled values remain with the application.
- Read-only valid values still submit. Disabled fields do not submit. The fieldset ref, native attributes, className and style pass through.

## Classes

`rs-coordinate-reference-field`, `rs-coordinate-reference-field-legend`, `rs-coordinate-reference-field-axes`, `rs-coordinate-reference-field-label`, `rs-coordinate-reference-field-control`, `rs-coordinate-reference-field-note`

## Dependencies

Registry dependencies: [select](select.md), [input](input.md), [dropdown-menu](dropdown-menu.md).  
React: `packages/react/src/components/coordinate-reference-field.tsx`  
CSS: `packages/core/css/components/coordinate-reference-field.css`
