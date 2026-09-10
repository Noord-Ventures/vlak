# Android chip

A Material filter chip with a filled selection state and a checkmark.

Category: android  
Name: `android-chip`  
Also known as: Material filter chip, Android filter chip, selectable chip  
Page: https://vlak.dev/components/android-chip/

## When to use

- Independent filters that users can select and clear.

## When not to

- Mutually exclusive navigation or status labels with no action.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { AndroidChip } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add android-chip
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/android-chip.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<button class="rs-android-chip rs-android-chip-selected" type="button" aria-pressed="true"><span class="rs-android-chip-icon" aria-hidden="true">✓</span>Unread</button>
```

## Example

```tsx
import { AndroidChip } from "@noorddev/vlak-react";

<AndroidChip selected={unread} onSelectedChange={setUnread}>Unread</AndroidChip>
```

## Props

### AndroidChip

Extends `ButtonHTMLAttributes<HTMLButtonElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLButtonElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `selected` | `boolean` |  |  |
| `defaultSelected` | `boolean` | `false` |  |
| `onSelectedChange` | `(selected: boolean) => void` |  |  |
| `icon` | `ReactNode` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Focuses each enabled filter. |
| Enter or Space | Toggles the focused filter. |

## Accessibility

- A native button exposes selection through aria-pressed.
- The checkmark and filled surface distinguish selection without hue.
- The compact chip keeps a 48-pixel hit area.

## Classes

`rs-android-chip`, `rs-android-chip-selected`, `rs-android-chip-icon`

## Dependencies

Registry dependencies: [icons](icons.md).  
React: `packages/react/src/components/android-chip.tsx`  
CSS: `packages/core/css/components/android-chip.css`
