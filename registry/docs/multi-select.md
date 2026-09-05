# Multi-select

Selects multiple predefined options from a searchable native disclosure with named checkboxes.

Category: forms  
Name: `multi-select`  
Also known as: MultiSelect, Multiple select, Checkbox picker  
Page: https://vlak.dev/components/multi-select/

## When to use

- Multiple values from a known option set.
- A compact summary that expands to filterable checkbox choices.

## When not to

- Freeform values; use TagInput.
- One option only; use Select or NativeSelect.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { MultiSelect } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add multi-select
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/multi-select.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<fieldset class="rs-multi-select"><legend class="rs-multi-select-legend">Cities</legend><details><summary class="rs-multi-select-trigger">Select options</summary><div class="rs-multi-select-panel"><label class="rs-multi-select-option"><input type="checkbox" name="cities" value="alkmaar" /> Alkmaar</label><label class="rs-multi-select-option"><input type="checkbox" name="cities" value="bergen" /> Bergen</label></div></details></fieldset>
```

## Example

```tsx
import { MultiSelect } from "@noorddev/vlak-react";

<MultiSelect label="Cities" name="cities" options={[{ value: "alkmaar", label: "Alkmaar" }, { value: "bergen", label: "Bergen" }, { value: "castricum", label: "Castricum" }]} defaultValue={["alkmaar"]} />
```

## Props

### MultiSelect

A native disclosure containing named checkboxes; selections remain visible when collapsed.

Extends `Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, "onChange" | "defaultValue">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLFieldSetElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `options` (required) | `MultiSelectOption[]` |  |  |
| `value` | `string[]` |  |  |
| `defaultValue` | `string[]` | `[]` |  |
| `onValueChange` | `(value: string[]) => void` |  |  |
| `label` | `ReactNode` | `"Options"` |  |
| `placeholder` | `string` | `"Select options"` |  |
| `searchable` | `boolean` | `true` |  |
| `searchLabel` | `string` | `"Filter options"` |  |
| `emptyLabel` | `ReactNode` | `"No matching options"` |  |
| `clearLabel` | `string` | `"Clear selection"` |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Enter, Space | Opens or closes the native summary, or toggles the focused checkbox. |
| Tab | Moves through search, available checkboxes, and clear selection. |
| Escape | Closes the disclosure and returns focus to its summary. |

## Accessibility

- Uses native details and checkboxes instead of exposing an incomplete listbox interaction.
- The legend names the field; each checkbox has its own visible name. Selected rows change fill across the full surface.
- Disabled options cannot change; clear preserves disabled selections. Empty search results are announced politely.
- With name, selected values are submitted as repeated fields. The ref reaches the fieldset; uncontrolled selections reset with the form.

## Classes

`rs-multi-select`, `rs-multi-select-legend`, `rs-multi-select-trigger`, `rs-multi-select-panel`, `rs-multi-select-options`, `rs-multi-select-option`, `rs-multi-select-selected`, `rs-multi-select-empty`, `rs-multi-select-clear`

## Dependencies

Registry dependencies: [input](input.md), [button](button.md), [checkbox](checkbox.md), [icons](icons.md), [field](field.md).  
React: `packages/react/src/components/multi-select.tsx`  
CSS: `packages/core/css/components/multi-select.css`
