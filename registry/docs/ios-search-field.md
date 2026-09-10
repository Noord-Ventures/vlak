# iOS search field

A 48px search capsule with a native input and a separate clear action.

Category: ios  
Name: `ios-search-field`  
Also known as: UISearchBar, UISearchTextField, iOS search input  
Page: https://vlak.dev/components/ios-search-field/

## When to use

- Search within a list, app or document.
- Use onValueChange to respond to both typing and the clear button.

## When not to

- Treating a placeholder as the only accessible label.
- A noneditable search launcher; use a button.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { IOSSearchField } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add ios-search-field
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/ios-search-field.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-ios-search-field"><input class="rs-ios-search-field-input" type="search" aria-label="Search notes" placeholder="Search" /></div>
```

## Example

```tsx
import { IOSSearchField } from "@noorddev/vlak-react";

<IOSSearchField name="q" aria-label="Search notes" placeholder="Search" onValueChange={query => console.log(query)} />
```

## Props

### IOSSearchField

A 48px search capsule with a native input and an explicit clear target.

Extends `Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "defaultValue" | "children">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLInputElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` |  |  |
| `defaultValue` | `string` | `""` |  |
| `onValueChange` | `(value: string) => void` |  | Fires when typing or using the clear action. |
| `clearLabel` | `string` | `"Clear search"` |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab, Shift+Tab | Moves between the native search input and the clear button when text is present. |
| Enter, Space on Clear | Clears the text and returns focus to the input. |
| Enter in the input | Uses the enclosing form’s native submit behavior. |

## Accessibility

- A native search input accepts labels, form attributes, required, disabled and readOnly.
- Clearing is a 44px action; native form reset is supported and canceled reset is respected.

## Classes

`rs-ios-search-field`, `rs-ios-search-field-disabled`, `rs-ios-search-field-symbol`, `rs-ios-search-field-input`, `rs-ios-search-field-clear`

## Dependencies

Registry dependencies: [icons](icons.md).  
React: `packages/react/src/components/ios-search-field.tsx`  
CSS: `packages/core/css/components/ios-search-field.css`
