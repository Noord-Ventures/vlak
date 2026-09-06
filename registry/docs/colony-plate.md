# Colony plate

A bounded plate diagram and keyboard-selectable list of supplied colony markers, with the source count kept separate from annotation totals.

Category: microbiology  
Name: `colony-plate`  
Also known as: Colony annotations, Petri dish map, Colony record viewer, Agar plate annotations, Plate colony inspector  
Page: https://vlak.dev/components/colony-plate/

## When to use

- Inspect supplied colony annotations and source counts without running an image analysis algorithm.
- recordedCount is the original source count. The exact number of supplied marker records and positioned records are labelled separately; neither substitutes for the source count.
- Supply unique marker identifiers and normalized x/y percentages from the upper left. The circular plate has center 50, 50 and radius 50.
- Select a record using value and onValueChange, or use defaultValue for local selection. Native form reset restores uncontrolled selection. readOnly keeps the same record list without selection controls.

## When not to

- Inferring a colony count from marker records, missing annotations or a blank diagram.
- Identifying organisms, segmenting images or suggesting culture procedures from these records.
- Supplying more than 256 markers; the component reports the bound without showing a partial list.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { ColonyPlate } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add colony-plate
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/colony-plate.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<figure class="rs-colony-plate"><figcaption class="rs-colony-plate-title">Colony annotations</figcaption><p class="rs-colony-plate-count">Source count: 12</p><p class="rs-colony-plate-copy">1 marker records supplied; 1 positioned</p><ol class="rs-colony-plate-list" aria-label="Supplied marker records"><li class="rs-colony-plate-record"><div class="rs-colony-plate-static">1. Colony 01</div><p class="rs-colony-plate-copy">x 28%, y 32%</p></li></ol></figure>
```

## Example

```tsx
import { ColonyPlate } from "@noorddev/vlak-react";

<ColonyPlate label="Colony annotations" plateId="P-042" recordedCount={12} source="Imported source count and four annotated records" markers={[
  { id: "c1", label: "Colony 01", x: 28, y: 32, description: "Source annotation: circular outline" },
  { id: "c2", label: "Colony 02", x: 62, y: 26, description: "Source annotation: raised center" },
  { id: "c3", label: "Colony 03", x: 55, y: 68 },
  { id: "c4", label: "Colony 04", x: null, y: null },
]} defaultValue="c2" />
```

## Props

### ColonyPlate

A supplied plate record. Marker positions and source count are never detected or inferred.

Extends `Omit<HTMLAttributes<HTMLElement>, "defaultValue">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `string` |  |  |
| `markers` (required) | `readonly ColonyMarker[]` |  |  |
| `plateId` | `string` |  |  |
| `source` | `ReactNode` |  |  |
| `recordedCount` | `number \| null` |  | The source's recorded count, independent of the number of supplied marker records. |
| `value` | `string \| null` |  |  |
| `defaultValue` | `string \| null` | `null` |  |
| `onValueChange` | `(id: string \| null) => void` |  |  |
| `readOnly` | `boolean` | `false` |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves through enabled record-selection buttons and the clear-selection button. |
| Enter, Space | Selects the focused supplied record or clears the selection; controlled selection waits for the host. |

## Accessibility

- The figure caption names the plate. The decorative diagram is paired with a complete ordered list of record labels, exact coordinates and supplied descriptions.
- Missing, non-finite and out-of-dish positions retain their list records and have explicit availability text. Only positioned markers are drawn; their exact number is shown.
- Every control is at least 44px with a visible focus ring. Selected record buttons use a full fill and aria-pressed, including in forced colors.
- Source count zero remains zero. Missing source counts and invalid negative or unsafe counts receive separate text; no count is inferred from the diagram.
- Duplicate or empty identifiers and oversized inputs produce an explanation. Native attributes, figure ref, className and style pass through. Selection buttons do not submit forms.

## Classes

`rs-colony-plate`, `rs-colony-plate-title`, `rs-colony-plate-copy`, `rs-colony-plate-count`, `rs-colony-plate-body`, `rs-colony-plate-graphic`, `rs-colony-plate-dish`, `rs-colony-plate-list`, `rs-colony-plate-record`, `rs-colony-plate-static`, `rs-colony-plate-details`, `rs-colony-plate-clear`, `rs-colony-plate-marker`, `rs-colony-plate-chosen`, `rs-colony-plate-control`, `rs-colony-plate-selected`

## Dependencies

Registry dependencies: [button](button.md).  
React: `packages/react/src/components/colony-plate.tsx`  
CSS: `packages/core/css/components/colony-plate.css`
