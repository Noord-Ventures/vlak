# Android navigation

Material destination indicators for a bottom navigation bar or vertical rail.

Category: android  
Name: `android-navigation`  
Also known as: Material navigation bar, Android navigation rail, bottom navigation  
Page: https://vlak.dev/components/android-navigation/

## When to use

- Three to five destinations at the bottom of a compact Android layout.
- A vertical destination rail beside a wider workspace.

## When not to

- Tabs that switch between panels within the same page.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { AndroidNavigation } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add android-navigation
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/android-navigation.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<nav class="rs-android-navigation" aria-label="Workspace"><ul class="rs-android-navigation-list"><li class="rs-android-navigation-item"><button class="rs-android-navigation-control rs-android-navigation-current" type="button" aria-current="page"><span class="rs-android-navigation-indicator rs-android-navigation-active-indicator" aria-hidden="true">⌂</span><span class="rs-android-navigation-label">Home</span></button></li><li class="rs-android-navigation-item"><button class="rs-android-navigation-control" type="button"><span class="rs-android-navigation-indicator" aria-hidden="true">□</span><span class="rs-android-navigation-label">Files</span></button></li></ul></nav>
```

## Example

```tsx
import { AndroidNavigation } from "@noorddev/vlak-react";

<AndroidNavigation aria-label="Workspace" items={[{ value: "home", label: "Home" }, { value: "files", label: "Files" }, { value: "settings", label: "Settings" }]} defaultValue="home" onValueChange={setScreen} />
```

## Props

### AndroidNavigation

Extends `Omit<HTMLAttributes<HTMLElement>, "defaultValue" | "onChange">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` (required) | `AndroidNavigationItem[]` |  |  |
| `value` | `string` |  |  |
| `defaultValue` | `string` |  |  |
| `onValueChange` | `(value: string) => void` |  |  |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves between enabled destinations. |
| Left or Right arrow | Moves focus in a horizontal bar, respecting text direction. |
| Up or Down arrow | Moves focus in a vertical rail. |
| Home or End | Focuses the first or last enabled destination. |
| Enter or Space | Activates a button destination; native links use Enter. |

## Accessibility

- A labelled nav contains native buttons or links in a list.
- aria-current marks the active destination; arrow keys only move focus.
- Disabled destinations cannot activate and are skipped by arrow keys.

## Classes

`rs-android-navigation`, `rs-android-navigation-list`, `rs-android-navigation-rail`, `rs-android-navigation-item`, `rs-android-navigation-control`, `rs-android-navigation-current`, `rs-android-navigation-disabled`, `rs-android-navigation-indicator`, `rs-android-navigation-active-indicator`, `rs-android-navigation-label`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/android-navigation.tsx`  
CSS: `packages/core/css/components/android-navigation.css`
