# Stage position list

Reviews supplied named stage positions with an explicit coordinate frame, per-axis units, inclusion state and controlled selection, reorder and removal requests.

Category: science  
Name: `stage-position-list`  
Also known as: stage positions, position list, microscopy positions, multi-position acquisition, waypoint list  
Page: https://vlak.dev/components/stage-position-list/

## When to use

- Reviewing a microscopy stage-position plan with explicit frame identity, supplied coordinates and per-axis units.
- Selection requires value and onValueChange; there is no uncontrolled selection. Inclusion, order and removal are controlled requests. The host supplies accepted records; no optimistic edits or instrument commands occur.
- Names may repeat; immutable unique IDs distinguish rows and actions. At most 128 positions are rendered. Invalid identifiers or excess records produce an explicit unavailable state.
- Missing coordinates show Not supplied; nonfinite coordinates show Unavailable. Zero, negative zero and signed finite values retain their supplied representation. Missing frame or units stay explicit.
- readOnly locks record edits while inspection selection remains available. pending locks edits to a record and swaps across it. disabled uses a native fieldset and locks every control.
- An optional name submits the selected record ID; form associates the selection with an external form. Coordinates and inclusion records remain host-owned data. Controlled values survive native form reset.

## When not to

- Moving a stage, calculating travel, transforming coordinate frames or converting physical units.
- Treating selection as an instrument position, missing coordinates as zero, or an edit request as an accepted plan.
- Large position inventories that need pagination or virtualization; use a bounded window instead.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { StagePositionList } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add stage-position-list
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/stage-position-list.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<fieldset class="rs-stage-position-list"><legend class="rs-stage-position-list-legend">Slide positions</legend><p class="rs-stage-position-list-copy">Coordinate frame: Recorded stage (stage-01)</p><ol class="rs-stage-position-list-items"><li class="rs-stage-position-list-row"><p class="rs-stage-position-list-identity">Overview (field-01)</p><dl class="rs-stage-position-list-coordinates"><div class="rs-stage-position-list-coordinate"><dt class="rs-stage-position-list-axis">X (µm)</dt><dd class="rs-stage-position-list-number">0</dd></div><div class="rs-stage-position-list-coordinate"><dt class="rs-stage-position-list-axis">Y (µm)</dt><dd class="rs-stage-position-list-number">-12.5</dd></div><div class="rs-stage-position-list-coordinate"><dt class="rs-stage-position-list-axis">Z (µm)</dt><dd class="rs-stage-position-list-number">Not supplied</dd></div></dl><p class="rs-stage-position-list-copy">Included in plan</p></li></ol></fieldset>
```

## Example

```tsx
import { useState } from "react";
import { StagePositionList } from "@noorddev/vlak-react";
import type { StagePosition } from "@noorddev/vlak-react";

export function PositionPlan() {
  const [positions, setPositions] = useState<readonly StagePosition[]>([
    { id: "field-01", name: "Overview", x: 0, y: -12.5, z: null, enabled: true },
    { id: "field-02", name: "Edge detail", x: 120.25, y: 36, z: 0, enabled: false },
  ]);
  const [selected, setSelected] = useState<string | null>(null);
  return <StagePositionList
    label="Slide positions"
    coordinateFrame={{ id: "stage-01", label: "Recorded stage" }}
    units={{ x: "µm", y: "µm", z: "µm" }}
    positions={positions}
    value={selected}
    onValueChange={setSelected}
    onEnabledChange={(id, enabled) => setPositions(current => current.map(position => position.id === id ? { ...position, enabled } : position))}
    onOrderChange={ids => setPositions(current => ids.map(id => current.find(position => position.id === id)!))}
    onRemove={id => { setPositions(current => current.filter(position => position.id !== id)); if (selected === id) setSelected(null); }}
  />;
}
```

## Props

### StagePositionList

Supplied stage coordinates and controlled plan edits. No stage motion or coordinate conversion occurs.

Extends `Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, "defaultValue">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLFieldSetElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `ReactNode` |  |  |
| `coordinateFrame` (required) | `StageCoordinateFrame \| null` |  |  |
| `units` (required) | `StagePositionUnits` |  |  |
| `positions` (required) | `readonly StagePosition[]` |  |  |
| `value` | `string \| null` | `null` | Controlled selected record identifier; pair with onValueChange for inspection. Missing or unknown identifiers never select a fallback. |
| `onValueChange` | `(id: string) => void` |  |  |
| `onEnabledChange` | `(id: string, enabled: boolean) => void` |  |  |
| `onOrderChange` | `(ids: readonly string[]) => void` |  | Requests an order of existing identifiers without changing records. |
| `onRemove` | `(id: string) => void` |  |  |
| `description` | `ReactNode` |  |  |
| `readOnly` | `boolean` | `false` | Prevents record edits; inspection selection remains available. |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab, Shift+Tab | Moves between the native radio group, inclusion checkboxes and enabled move/remove buttons. |
| Arrow keys | Changes the focused native radio selection and requests its record ID; the host controls the accepted selection. |
| Space | Selects a focused radio or requests a focused inclusion checkbox change. |
| Enter, Space | Activates a move or remove button. Reorder focus follows the same ID; accepted removal focuses an adjacent surviving row or the empty fieldset without stealing focus from elsewhere. |

## Accessibility

- A fieldset legend names the position list; frame context, selection status and optional host descriptions are associated with it.
- Native radios, checkboxes and buttons retain keyboard behavior, visible focus and at least 44px targets. Coordinates use a labelled definition list with explicit axis units.
- Visible immutable IDs keep repeated names distinguishable. Unknown selected IDs leave every radio unselected and produce an explicit message.
- A polite announcement reports only host-accepted reorder or removal, not the initial request. Pending and inclusion states have text equivalents.
- The fieldset ref and native attributes pass through; className, style, children and aria-describedby merge with component context.
- Logical spacing, wrapping actions and bounded coordinate columns support narrow layouts. Forced-colors styling preserves native control states and focus.

## Classes

`rs-stage-position-list`, `rs-stage-position-list-legend`, `rs-stage-position-list-copy`, `rs-stage-position-list-items`, `rs-stage-position-list-row`, `rs-stage-position-list-selected`, `rs-stage-position-list-head`, `rs-stage-position-list-identity`, `rs-stage-position-list-coordinates`, `rs-stage-position-list-coordinate`, `rs-stage-position-list-axis`, `rs-stage-position-list-number`, `rs-stage-position-list-actions`, `rs-stage-position-list-action`, `rs-stage-position-list-status`

## Dependencies

Registry dependencies: [button](button.md), [checkbox](checkbox.md), [radio](radio.md).  
React: `packages/react/src/components/stage-position-list.tsx`  
CSS: `packages/core/css/components/stage-position-list.css`
