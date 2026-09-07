# Quantity field

A 44px Vlak numeric input and styled unit selector with controlled quantity values, form submission and reset support.

Category: science  
Name: `quantity-field`  
Also known as: Unit input, Scientific input, Dimensioned number, Amount and unit, Measurement input  
Page: https://vlak.dev/components/quantity-field/

## When to use

- Dimensioned quantities with explicit unit choices and native numeric constraints.
- name submits the amount and unitName submits the unit, defaulting to name followed by .unit.
- Supply value and onValueChange when the application converts units or persists the result; unit selection alone keeps the supplied amount unchanged.
- null represents a missing amount or unit. Unit option values must be unique and non-empty.

## When not to

- Assuming that choosing a different unit automatically converts the amount.
- Relying on formatting to establish scientific precision or dimensional compatibility.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { QuantityField } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add quantity-field
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/quantity-field.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<fieldset class="rs-quantity-field"><legend class="rs-quantity-field-legend">Sample volume</legend><div class="rs-quantity-field-row"><label class="rs-quantity-field-label">Amount<input class="rs-input rs-input-full rs-quantity-field-control" name="volume" type="number" step="any" value="250" /></label><div class="rs-quantity-field-label"><span id="quantity-unit-label">Unit</span><div class="rs-select rs-select-fluid"><button type="button" class="rs-dropdown" role="combobox" aria-labelledby="quantity-unit-label" aria-expanded="false" aria-haspopup="listbox"><span>µL</span></button></div></div></div></fieldset>
```

## Example

```tsx
import { QuantityField } from "@noorddev/vlak-react";

<QuantityField label="Sample volume" name="volume" units={[{ value: "ul", label: "µL" }, { value: "ml", label: "mL" }]} defaultValue={{ amount: 250, unit: "ul" }} min={0} required description="Enter the amount and its unit" />
```

## Props

### QuantityField

A native numeric input and unit selector. Selection never converts the amount.

Extends `Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, "defaultValue">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLFieldSetElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `ReactNode` |  |  |
| `units` (required) | `readonly QuantityUnit[]` |  |  |
| `value` | `QuantityValue` |  |  |
| `defaultValue` | `QuantityValue` | `{ amount: null, unit: null }` |  |
| `onValueChange` | `(value: QuantityValue) => void` |  | Requests a quantity change. A unit change preserves the amount; the host owns conversion. |
| `description` | `ReactNode` |  |  |
| `unitName` | `string` | `name ? \`${name}.unit\` : undefined` | Input names: name submits the amount; unitName defaults to name + '.unit'. |
| `amountLabel` | `string` | `"Amount"` |  |
| `unitLabel` | `string` | `"Unit"` |  |
| `unitPlaceholder` | `string` | `"Choose unit"` |  |
| `min` | `number` |  |  |
| `max` | `number` |  |  |
| `step` | `number \| "any"` | `"any"` |  |
| `required` | `boolean` |  |  |
| `readOnly` | `boolean` | `false` |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves between the amount input and unit selector. |
| Arrow keys | Uses native number stepping or opens and navigates the Vlak unit selector. Enter or Space confirms a unit; Escape closes its menu. |

## Accessibility

- A fieldset and legend name the quantity. Vlak Input and Select have visible labels, descriptions and 44px targets.
- Required, min, max and step use native validation. Invalid supplied numbers and unknown units have explicit text states.
- Native form reset restores uncontrolled defaults and leaves controlled values with the application.
- Read-only quantities preserve the submitted amount and unit while preventing edits. Disabled quantities do not submit.
- The fieldset ref and native attributes pass through; no unit is chosen implicitly.

## Classes

`rs-quantity-field`, `rs-quantity-field-legend`, `rs-quantity-field-row`, `rs-quantity-field-label`, `rs-quantity-field-control`, `rs-quantity-field-description`

## Dependencies

Registry dependencies: [input](input.md), [select](select.md), [dropdown-menu](dropdown-menu.md).  
React: `packages/react/src/components/quantity-field.tsx`  
CSS: `packages/core/css/components/quantity-field.css`
