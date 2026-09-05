# Native select

Presents browser-native options inside a 1px control border.

Category: forms  
Name: `native-select`  
Also known as: Native select, Select element, Dropdown, HTML select  
Page: https://vlak.dev/components/native-select/

## When to use

- A short fixed list where the platform picker is fine, especially on phones.
- Forms that post natively; the value travels with the form.

## When not to

- Rich option labels or type-ahead over long lists; use Select or Combobox.
- Fewer than three options; use Radio.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { NativeSelect } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add native-select
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/native-select.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-native-select-control"><select class="rs-native-select" aria-label="City"><option>Alkmaar</option><option>Amsterdam</option><option>Rotterdam</option></select><svg class="rs-native-select-icon rs-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true"><path d="M5.5 3.75 L10.5 8.25 L5.5 12.75" transform="rotate(90 8 8)" vector-effect="non-scaling-stroke" /></svg></div>
```

## Example

```tsx
import { NativeSelect } from "@noorddev/vlak-react";

<NativeSelect label="City" defaultValue="alkmaar">
  <option value="alkmaar">Alkmaar</option>
  <option value="amsterdam">Amsterdam</option>
  <option value="rotterdam">Rotterdam</option>
</NativeSelect>
```

## Props

### NativeSelect

The platform list. Vlak chrome.

Extends `SelectHTMLAttributes<HTMLSelectElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLSelectElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | `ReactNode` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Space, Alt + Arrow down | Opens the platform list |
| Arrow up, Arrow down | Changes the value |
| Type a letter | Jumps to a matching option |

## Accessibility

- Renders a native <select> with a generated id; label renders a <label> pointing at it.
- Inside Field, hint and error reach it through aria-describedby and aria-invalid.

## Classes

`rs-native-select`, `rs-native-select-invalid`, `rs-native-select-field`, `rs-native-select-label`, `rs-native-select-control`, `rs-native-select-icon`

## Dependencies

Registry dependencies: [icons](icons.md).  
React: `packages/react/src/components/native-select.tsx`  
CSS: `packages/core/css/components/native-select.css`
