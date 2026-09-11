# Android switch

A Material switch with a 52-by-32 track and an expanding thumb, built on a native checkbox.

Category: android  
Name: `android-switch`  
Also known as: Material switch, Android toggle, Expressive switch, Material 3 switch  
Page: https://vlak.dev/components/android-switch/

[Android component index](https://vlak.dev/docs/android.md) · [Interactive component catalog](https://vlak.dev/components/#android) · [Related Android interface study](https://vlak.dev/interfaces/android/)

## When to use

- A binary Android preference that takes effect immediately.

## When not to

- Selecting one option from a mutually exclusive group.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { AndroidSwitch } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add android-switch
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/android-switch.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<label for="android-sync">Background sync</label> <input class="rs-android-switch rs-android-switch-checked" id="android-sync" name="sync" type="checkbox" role="switch" checked aria-checked="true" />
```

## Example

```tsx
import { AndroidSwitch } from "@noorddev/vlak-react";

<label htmlFor="sync">Background sync</label>
<AndroidSwitch id="sync" name="sync" checked={enabled} onCheckedChange={setEnabled} />
```

## Props

### AndroidSwitch

Extends `Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLInputElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `onCheckedChange` | `(checked: boolean) => void` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Focuses the switch when enabled. |
| Space | Toggles the switch. |

## Accessibility

- Uses a native checkbox with role switch and a 52-by-48 target.
- Associate a visible label using htmlFor, or provide aria-label.
- Supports native names, values, required state, disabled state and form reset.
- The thumb changes position and size in addition to the filled track.

## Classes

`rs-android-switch`, `rs-android-switch-checked`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/android-switch.tsx`  
CSS: `packages/core/css/components/android-switch.css`
