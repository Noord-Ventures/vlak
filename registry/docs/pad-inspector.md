# Pad inspector

Circuit-board pad selection with supplied footprint references, net and layer records, pad types and a dimension table with explicit units.

Category: electronics  
Name: `pad-inspector`  
Also known as: Footprint pad, Circuit board pad properties, Pad geometry, Copper pad inspector, Board pad selector  
Page: https://vlak.dev/components/pad-inspector/

## When to use

- Inspecting a bounded collection of pad records supplied by a board editor or manufacturing export.
- Supply unique, non-empty pad ids and unique measurement ids within each pad. Pad numbers may repeat; ids identify the actual records.
- Use value and onValueChange for host-owned selection and board or schematic cross-highlighting. No connectivity or geometry calculation runs in the component.
- Supply geometry values as strings to preserve significant figures. Null fields remain explicitly missing; an empty layers array means none recorded.

## When not to

- Inferring that a missing net means unconnected, a missing drill means no hole, or an unknown layer list means every copper layer.
- Treating selection as a board edit or inferring dimensions from the shape name.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { PadInspector } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add pad-inspector
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/pad-inspector.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<fieldset class="rs-pad-inspector"><legend class="rs-pad-inspector-legend">Connector pads</legend><div class="rs-pad-inspector-label"><span id="pad-choice-label">Pad</span><div class="rs-select rs-select-fluid rs-pad-inspector-control"><button type="button" class="rs-dropdown" role="combobox" aria-labelledby="pad-choice-label" aria-expanded="false" aria-haspopup="listbox">J1 / Pad 1 · pad-a</button></div></div><dl class="rs-pad-inspector-properties"><div><dt class="rs-pad-inspector-term">Net</dt><dd class="rs-pad-inspector-detail">Supply</dd></div><div><dt class="rs-pad-inspector-term">Layers</dt><dd class="rs-pad-inspector-detail">Front copper, Back copper</dd></div></dl><table class="rs-pad-inspector-table"><caption class="rs-pad-inspector-caption">Supplied geometry</caption><thead><tr><th class="rs-pad-inspector-cell" scope="col">Dimension</th><th class="rs-pad-inspector-cell" scope="col">Value</th><th class="rs-pad-inspector-cell" scope="col">Unit</th></tr></thead><tbody><tr><th class="rs-pad-inspector-cell" scope="row">Pad diameter</th><td class="rs-pad-inspector-cell">1.80</td><td class="rs-pad-inspector-cell">mm</td></tr></tbody></table></fieldset>
```

## Example

```tsx
import { PadInspector } from "@noorddev/vlak-react";

<PadInspector label="Connector pads" name="pad" boardLabel="Example board, revision C" defaultValue="pad-a" pads={[
  { id: "pad-a", reference: "J1", number: "1", net: "Supply", layers: ["Front copper", "Back copper"], type: "Through hole", shape: "Circle", geometry: [
    { id: "diameter", label: "Pad diameter", value: "1.80", unit: "mm" },
    { id: "drill", label: "Drill diameter", value: "0.90", unit: "mm" },
  ] },
  { id: "pad-b", reference: "J1", number: "2", net: "Return", layers: ["Front copper"], type: "Surface mount", shape: "Rectangle" },
]} />
```

## Props

### PadInspector

Inspects supplied pad records without inferring connectivity, shape or dimensions.

Extends `Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, "defaultValue">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLFieldSetElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `ReactNode` |  |  |
| `pads` (required) | `readonly PadInspectorPad[]` |  |  |
| `value` | `string \| null` |  |  |
| `defaultValue` | `string \| null` | `null` |  |
| `onValueChange` | `(id: string \| null) => void` |  | Requests pad selection only. The host owns board and schematic cross-highlighting. |
| `boardLabel` | `ReactNode` |  |  |
| `description` | `ReactNode` |  |  |
| `selectionLabel` | `string` | `"Pad"` |  |
| `required` | `boolean` |  |  |
| `readOnly` | `boolean` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Focuses the Vlak pad selector. |
| Arrow keys, Home, End | Opens or moves through available pad choices. |
| Enter, Space | Chooses the focused pad. Controlled selection waits for a host update. |
| Escape | Closes the selector and keeps the current choice. |

## Accessibility

- A fieldset legend names the inspector. Pad choices include their record id, so repeated pad numbers remain distinguishable.
- Vlak Select supplies the 44px trigger, keyboard listbox and disabled choices. Pad properties use a description list and dimensions use a captioned table with row and column headers.
- Missing records, unavailable selections, non-finite measurements and missing units have explicit text. Numeric zero and string precision are retained.
- Native form association and reset are supported. Read-only valid selection remains submittable, while disabled selection is omitted.
- The fieldset ref, native attributes, className and style pass through.

## Classes

`rs-pad-inspector`, `rs-pad-inspector-legend`, `rs-pad-inspector-label`, `rs-pad-inspector-control`, `rs-pad-inspector-properties`, `rs-pad-inspector-term`, `rs-pad-inspector-detail`, `rs-pad-inspector-table`, `rs-pad-inspector-caption`, `rs-pad-inspector-cell`, `rs-pad-inspector-note`

## Dependencies

Registry dependencies: [select](select.md), [dropdown-menu](dropdown-menu.md).  
React: `packages/react/src/components/pad-inspector.tsx`  
CSS: `packages/core/css/components/pad-inspector.css`
