# Select

Selects one option from an overlay. The closed trigger carries a chevron.

Category: forms  
Name: `select`  
Also known as: Select, Listbox, Dropdown select, Picker  
Page: https://vlak.dev/components/select/

## When to use

- One choice from a list of five or more when the labels are short.
- Lists that benefit from type-ahead and a consistent overlay across platforms.
- Use fullWidth in compound field layouts. name and form support native submission; required uses native validation and reset restores uncontrolled defaults. readOnly preserves the submitted selection.
- Mark unavailable options disabled; they stay visible and are skipped by keyboard navigation.

## When not to

- Free text or filtering; use Combobox.
- A platform picker when it is specifically preferred; use NativeSelect.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { Select } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add select
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/select.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<button class="rs-dropdown" role="combobox" aria-haspopup="listbox" aria-expanded="true"><span>Alkmaar</span></button>
<div class="rs-menu rs-select-list" role="listbox"><div class="rs-menu-item rs-menu-item-active" role="option" aria-selected="true">Alkmaar</div><div class="rs-menu-item" role="option" aria-selected="false">Amsterdam</div></div>
```

## Example

```tsx
import { useState } from "react";
import { Select } from "@noorddev/vlak-react";

const [city, setCity] = useState("alkmaar");

<Select
  aria-label="City"
  options={[
    { value: "alkmaar", label: "Alkmaar" },
    { value: "amsterdam", label: "Amsterdam" },
    { value: "rotterdam", label: "Rotterdam" },
  ]}
  value={city}
  onValueChange={setCity}
/>
```

## Props

### Select

Select-only combobox: the trigger holds focus and points at the active option with aria-activedescendant; the listbox overlays.

Extends `Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `options` (required) | `SelectOption[]` |  |  |
| `value` | `string` |  |  |
| `defaultValue` | `string` |  |  |
| `placeholder` | `ReactNode` | `"Select…"` |  |
| `onValueChange` | `(value: string) => void` |  |  |
| `disabled` | `boolean` |  |  |
| `fullWidth` | `boolean` | `false` | Fill a compound field without imposing a minimum column width. |
| `name` | `string` |  |  |
| `form` | `string` |  |  |
| `required` | `boolean` | `false` |  |
| `readOnly` | `boolean` | `false` |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Arrow down, Arrow up, Enter, Space | Opens the list on the selected option |
| Home, End | Opens on the first or last option; moves there when open |
| Type letters | Jumps to the next matching option, open or closed |
| Arrow down, Arrow up | Moves the active option |
| Page up, Page down | Moves ten options |
| Enter, Space | Selects the active option and closes |
| Escape | Closes and returns focus to the trigger |
| Tab | Closes and moves on |

## Accessibility

- APG select-only combobox: the trigger is a <button role="combobox"> with aria-haspopup="listbox", aria-expanded, aria-controls, and aria-activedescendant.
- The list is role="listbox" with role="option" rows carrying aria-selected; focus stays on the trigger.
- Pass aria-label or aria-labelledby; the listbox is labelled by the same source.
- Controlled with value and onValueChange, or uncontrolled with defaultValue. A click outside closes it.

## Classes

`rs-select`, `rs-select-list`, `rs-select-fluid`, `rs-select-native`, `rs-select-feedback`

## Dependencies

Registry dependencies: [dropdown-menu](dropdown-menu.md).  
React: `packages/react/src/components/select.tsx`  
CSS: `packages/core/css/components/select.css`
