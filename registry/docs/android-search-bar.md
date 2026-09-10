# Android search bar

A rounded Material search field with a leading icon and a clear action.

Category: android  
Name: `android-search-bar`  
Also known as: Material search bar, Android search field, search input  
Page: https://vlak.dev/components/android-search-bar/

## When to use

- Searching a collection within an Android screen.
- A 56-pixel search surface with a clear action.

## When not to

- Selecting an option from autocomplete suggestions; use a combobox for that behavior.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { AndroidSearchBar } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add android-search-bar
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/android-search-bar.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-android-search-bar"><span class="rs-android-search-icon" aria-hidden="true">⌕</span><input class="rs-android-search-input" type="search" aria-label="Search documents" placeholder="Search documents" /></div>
```

## Example

```tsx
import { AndroidSearchBar } from "@noorddev/vlak-react";

<AndroidSearchBar aria-label="Search documents" placeholder="Search documents" value={query} onValueChange={setQuery} />
```

## Props

### AndroidSearchBar

Extends `Omit< InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "defaultValue" | "size" >`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLInputElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` |  |  |
| `defaultValue` | `string` | `""` |  |
| `onValueChange` | `(value: string) => void` |  |  |
| `clearLabel` | `string` | `"Clear search"` |  |
| `containerClassName` | `string` |  |  |
| `containerStyle` | `CSSProperties` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Focuses the search field and its clear action when present. |
| Escape | Clears an editable query and keeps focus in the field. |
| Enter | Uses the enclosing form's native submit behavior. |

## Accessibility

- Uses input type search with native input attributes and ref.
- Provide a visible label or aria-label; a placeholder is not a label.
- The clear action follows the input onChange path, also calls onValueChange and returns focus to the field.
- Uncontrolled values follow native form reset.

## Classes

`rs-android-search-bar`, `rs-android-search-bar-disabled`, `rs-android-search-input`, `rs-android-search-icon`, `rs-android-search-clear`

## Dependencies

Registry dependencies: [icons](icons.md).  
React: `packages/react/src/components/android-search-bar.tsx`  
CSS: `packages/core/css/components/android-search-bar.css`
