# Transfer list

Assigns options between available and selected lists using native checkboxes and explicit move actions.

Category: forms  
Name: `transfer-list`  
Also known as: TransferList, Dual listbox, Assignment lists  
Page: https://vlak.dev/components/transfer-list/

## When to use

- Assigning a visible subset from a manageable option list.
- Work where available and assigned options should stay visible together.

## When not to

- Very large lists; use searchable MultiSelect.
- Ordering selected records; use SortableList.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { TransferList } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add transfer-list
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/transfer-list.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<fieldset class="rs-transfer-list"><legend class="rs-transfer-list-legend">Assign cities</legend><div class="rs-transfer-list-columns"><fieldset class="rs-transfer-list-panel"><legend class="rs-transfer-list-heading">Available</legend><label class="rs-transfer-list-item"><input type="checkbox" /> Alkmaar</label></fieldset><div class="rs-transfer-list-actions"><button class="rs-btn-ghost" type="button">Add selected</button><button class="rs-btn-ghost" type="button">Remove selected</button></div><fieldset class="rs-transfer-list-panel"><legend class="rs-transfer-list-heading">Selected</legend><p class="rs-transfer-list-empty">No options</p></fieldset></div></fieldset>
```

## Example

```tsx
import { TransferList } from "@noorddev/vlak-react";

<TransferList label="Coverage areas" name="areas" options={[{ value: "alkmaar", label: "Alkmaar" }, { value: "bergen", label: "Bergen" }, { value: "castricum", label: "Castricum" }]} defaultValue={["alkmaar"]} />
```

## Props

### TransferList

Extends `Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, "onChange" | "defaultValue">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLFieldSetElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `options` (required) | `TransferListOption[]` |  |  |
| `value` | `string[]` |  |  |
| `defaultValue` | `string[]` | `[]` |  |
| `onValueChange` | `(value: string[]) => void` |  |  |
| `label` | `ReactNode` | `"Assign options"` |  |
| `availableLabel` | `string` | `"Available"` |  |
| `selectedLabel` | `string` | `"Selected"` |  |
| `addLabel` | `string` | `"Add selected"` |  |
| `removeLabel` | `string` | `"Remove selected"` |  |
| `emptyLabel` | `string` | `"No options"` |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab, Space | Moves through and marks native checkbox options. |
| Enter, Space on a move action | Adds or removes the marked options; marked state clears after the move. |

## Accessibility

- A top-level fieldset names the task; available and selected lists have distinct legends and counts.
- Every option and move action has a 44px target. Disabled options stay fixed; unavailable moves are disabled.
- The selected count is a polite status. Hidden fields submit each selected value under name.
- The ref reaches the fieldset. Form reset restores uncontrolled values and clears marked options.

## Classes

`rs-transfer-list`, `rs-transfer-list-legend`, `rs-transfer-list-columns`, `rs-transfer-list-panel`, `rs-transfer-list-heading`, `rs-transfer-list-options`, `rs-transfer-list-item`, `rs-transfer-list-actions`, `rs-transfer-list-action`, `rs-transfer-list-empty`, `rs-transfer-list-status`

## Dependencies

Registry dependencies: [checkbox](checkbox.md), [button](button.md).  
React: `packages/react/src/components/transfer-list.tsx`  
CSS: `packages/core/css/components/transfer-list.css`
