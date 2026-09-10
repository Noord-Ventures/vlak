# Android floating action button

A Material floating action button with an optional extended text label.

Category: android  
Name: `android-fab`  
Also known as: Material FAB, Android extended FAB, floating action button  
Page: https://vlak.dev/components/android-fab/

## When to use

- The principal creation action on an Android screen.

## When not to

- Several equally prominent actions on one screen.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { AndroidFab } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add android-fab
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/android-fab.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<button class="rs-android-fab rs-android-fab-extended" type="button"><span class="rs-android-fab-icon" aria-hidden="true">+</span>New document</button>
```

## Example

```tsx
import { AndroidFab, Icon } from "@noorddev/vlak-react";

<AndroidFab icon={<Icon name="plus" size={24} />} onClick={createDocument}>New document</AndroidFab>
```

## Props

### AndroidFab

Extends `ButtonHTMLAttributes<HTMLButtonElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLButtonElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `icon` (required) | `ReactNode` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Focuses the enabled action. |
| Enter or Space | Activates the action. |

## Accessibility

- Uses a native button with a target of at least 56 pixels.
- Provide aria-label when omitting the visible text label.
- Does not submit a form unless type submit is explicit.

## Classes

`rs-android-fab`, `rs-android-fab-extended`, `rs-android-fab-icon`

## Dependencies

Registry dependencies: [icons](icons.md).  
React: `packages/react/src/components/android-fab.tsx`  
CSS: `packages/core/css/components/android-fab.css`
