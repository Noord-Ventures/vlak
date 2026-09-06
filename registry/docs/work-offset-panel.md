# Work offset panel

Reported machine and work coordinates alongside editable draft offsets, explicit axis units and a host-owned apply request.

Category: engineering  
Name: `work-offset-panel`  
Also known as: Machine coordinates, Work coordinate system, Fixture offsets, Machining offsets, Coordinate readout  
Page: https://vlak.dev/components/work-offset-panel/

## When to use

- Editing a supplied offset record while keeping actual machine and work readings visible.
- Supply both reported coordinate sets independently; rotations and additional offsets belong to the controller, so no machine-to-work subtraction is inferred.
- value and onValueChange let the host load offsets for a chosen draft system. Uncontrolled system changes retain the entered offsets; they do not fetch another system's record.
- onApply requests a complete finite draft containing only the listed axes and a known enabled system. activeSystemId, offsetState and actual readings change only when supplied by the host.
- name submits name.system and name.axisId values. External form association and native reset are supported.

## When not to

- Interpreting an apply request as controller acceptance, machine movement or persistence.
- Treating missing coordinates as zero, or suspended offsets as zeroed offsets. The host owns controller access, validation and interlocks.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { WorkOffsetPanel } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add work-offset-panel
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/work-offset-panel.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<fieldset class="rs-work-offset-panel"><legend class="rs-work-offset-panel-legend">Work coordinates</legend><p class="rs-work-offset-panel-copy">Active system: G54 · Offsets active</p><div class="rs-work-offset-panel-field"><span id="work-offset-system-label">Draft coordinate system</span><div class="rs-select rs-select-fluid"><button type="button" class="rs-dropdown" role="combobox" aria-labelledby="work-offset-system-label" aria-expanded="false" aria-haspopup="listbox"><span>G54</span></button></div></div><label class="rs-work-offset-panel-field">X offset (mm)<input class="rs-input rs-input-full rs-work-offset-panel-control" type="number" step="any" value="125" /></label></fieldset>
```

## Example

```tsx
import { WorkOffsetPanel } from "@noorddev/vlak-react";

<WorkOffsetPanel label="Work coordinates" name="fixture" activeSystemId="g54" offsetState="active" systems={[{ id: "g54", label: "G54" }, { id: "g55", label: "G55" }]} axes={[
  { id: "x", label: "X", unit: "mm", machine: 145, work: 20 },
  { id: "y", label: "Y", unit: "mm", machine: 60, work: 10 },
]} defaultValue={{ systemId: "g54", offsets: { x: 125, y: 50 } }} />
```

## Props

### WorkOffsetPanel

Edit a proposed offset while retaining independently supplied machine and work positions.

Extends `Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, "defaultValue">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLFieldSetElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `string` |  |  |
| `axes` (required) | `readonly WorkOffsetAxis[]` |  |  |
| `systems` (required) | `readonly WorkOffsetSystem[]` |  |  |
| `activeSystemId` (required) | `string \| null` |  | Actual active system reported by the controller, independent of the draft selection. |
| `value` | `WorkOffsetValue` |  |  |
| `defaultValue` | `WorkOffsetValue` | `{ systemId: null, offsets: {} }` |  |
| `onValueChange` | `(value: WorkOffsetValue) => void` |  |  |
| `onApply` | `(value: WorkOffsetValue) => void` |  | Request a complete offset update; machine control and coordinate calculations belong to the host. |
| `offsetState` | `"active" \| "suspended" \| "unknown"` | `"unknown"` |  |
| `pending` | `boolean` | `false` |  |
| `readOnly` | `boolean` | `false` |  |
| `description` | `ReactNode` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves through the system selector, scroll region, axis offset inputs and apply action. |
| Arrow keys | Opens and navigates the Vlak system selector, steps number inputs or scrolls the focused table region. Escape closes the selector. |
| Enter, Space | Confirms a highlighted system or requests the focused Apply offsets action when a complete draft is available. |

## Accessibility

- A fieldset and legend name the editor. A captioned table separates actual readings from draft values, with axis units in each accessible input name.
- Unknown, unavailable and zero readings remain distinct. Invalid supplied offsets are marked and prevent apply.
- Vlak Select, Input and Button retain 44px targets; narrow layouts scroll the table inside a focusable, uniquely named region.
- Read-only values remain submittable; disabled or pending controls do not submit. Native reset restores uncontrolled defaults without overwriting controlled values.
- The fieldset ref, native attributes, className and style pass through.

## Classes

`rs-work-offset-panel`, `rs-work-offset-panel-legend`, `rs-work-offset-panel-copy`, `rs-work-offset-panel-field`, `rs-work-offset-panel-control`, `rs-work-offset-panel-viewport`, `rs-work-offset-panel-table`, `rs-work-offset-panel-caption`, `rs-work-offset-panel-cell`, `rs-work-offset-panel-axis`, `rs-work-offset-panel-offset`, `rs-work-offset-panel-button`

## Dependencies

Registry dependencies: [input](input.md), [select](select.md), [button](button.md), [dropdown-menu](dropdown-menu.md).  
React: `packages/react/src/components/work-offset-panel.tsx`  
CSS: `packages/core/css/components/work-offset-panel.css`
