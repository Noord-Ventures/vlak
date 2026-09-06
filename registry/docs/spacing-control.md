# Spacing control

Edits top, right, bottom, and left spacing with linked or independent native number fields and explicit units.

Category: creative  
Name: `spacing-control`  
Also known as: SpacingControl, Spacing inspector, Padding editor, Margin editor, Inset controls, Box model  
Page: https://vlak.dev/components/spacing-control/

## When to use

- Padding, margin, inset, or other four-sided numeric values in a caller-specified unit.
- Link sides to apply the next edit to every side; linking alone preserves existing values.
- value/defaultValue/onValueChange and linked/defaultLinked/onLinkedChange control the values and link state independently.

## When not to

- Converting between units or assuming CSS semantics beyond the supplied numeric fields.
- Treating cleared values as zero; a cleared side is null.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { SpacingControl } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add spacing-control
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/spacing-control.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<fieldset class="rs-spacing-control"><legend class="rs-spacing-control-label">Padding</legend><div class="rs-spacing-control-fields"><label class="rs-spacing-control-field">Top (px)<input class="rs-spacing-control-input" type="number" value="16" /></label><label class="rs-spacing-control-field">Right (px)<input class="rs-spacing-control-input" type="number" value="24" /></label><label class="rs-spacing-control-field">Bottom (px)<input class="rs-spacing-control-input" type="number" value="16" /></label><label class="rs-spacing-control-field">Left (px)<input class="rs-spacing-control-input" type="number" value="24" /></label></div></fieldset>
```

## Example

```tsx
import { SpacingControl } from "@noorddev/vlak-react";

<SpacingControl label="Padding" name="padding" unit="px" min={0} defaultValue={{ top: 16, right: 24, bottom: 16, left: 24 }} />
```

## Props

### SpacingControl

Four native numeric fields; linking applies the next edit to every side.

Extends `Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, "defaultValue" | "onChange">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLFieldSetElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `ReactNode` |  |  |
| `value` | `SpacingValue` |  |  |
| `defaultValue` | `SpacingValue` | `initial` |  |
| `onValueChange` | `(value: SpacingValue) => void` |  |  |
| `linked` | `boolean` |  |  |
| `defaultLinked` | `boolean` | `false` |  |
| `onLinkedChange` | `(linked: boolean) => void` |  |  |
| `unit` | `string` | `"px"` |  |
| `min` | `number` |  |  |
| `max` | `number` |  |  |
| `step` | `number` | `1` |  |
| `readOnly` | `boolean` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves through four number inputs and the link action. |
| Arrow up, Arrow down | Uses native number stepping with supplied min, max, and step. |
| Enter, Space | Toggles Link sides on the focused action. |

## Accessibility

- A fieldset and legend name the spacing group; each native number field includes its side and unit.
- Link sides has a stable name and aria-pressed, plus text explaining the next-edit behavior.
- Inputs and the link action have 44px targets; native bounds and step support form validation.
- Named fields submit separately; reset restores uncontrolled values and link state. The ref reaches the fieldset.

## Classes

`rs-spacing-control`, `rs-spacing-control-label`, `rs-spacing-control-fields`, `rs-spacing-control-field`, `rs-spacing-control-input`, `rs-spacing-control-link`, `rs-spacing-control-linked`, `rs-spacing-control-note`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/spacing-control.tsx`  
CSS: `packages/core/css/components/spacing-control.css`
