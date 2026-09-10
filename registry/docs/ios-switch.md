# iOS switch

A native checkbox with a 64px pill track, translating thumb and a 44px hit height.

Category: ios  
Name: `ios-switch`  
Also known as: UISwitch, iOS toggle  
Page: https://vlak.dev/components/ios-switch/

## When to use

- An immediately applied on/off preference.
- Associate it with a visible label or an aria-label.

## When not to

- A choice among several alternatives; use the iOS segmented control.
- A submit command that needs a button.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { IOSSwitch } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add ios-switch
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/ios-switch.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<span class="rs-ios-switch"><span class="rs-ios-switch-track" aria-hidden="true"></span><span class="rs-ios-switch-thumb" aria-hidden="true"></span><input class="rs-ios-switch-input" type="checkbox" role="switch" aria-label="Wi-Fi" /></span>
```

## Example

```tsx
import { IOSSwitch } from "@noorddev/vlak-react";

<IOSSwitch name="wifi" aria-label="Wi-Fi" defaultChecked onCheckedChange={checked => console.log(checked)} />
```

## Props

### IOSSwitch

The native checkbox owns focus, form submission and Space activation.

Extends `Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "checked" | "defaultChecked" | "children">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLInputElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `checked` | `boolean` |  |  |
| `defaultChecked` | `boolean` | `false` |  |
| `onCheckedChange` | `(checked: boolean) => void` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab, Shift+Tab | Moves focus to or away from an enabled switch. |
| Space | Toggles the native checkbox. |

## Accessibility

- A native checkbox with switch semantics retains form submission, required and disabled behavior.
- Fill and thumb position both communicate state. Reduced motion removes thumb travel; forced colors keeps the boundary visible.

## Classes

`rs-ios-switch`, `rs-ios-switch-disabled`, `rs-ios-switch-track`, `rs-ios-switch-on`, `rs-ios-switch-thumb`, `rs-ios-switch-thumb-on`, `rs-ios-switch-input`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/ios-switch.tsx`  
CSS: `packages/core/css/components/ios-switch.css`
