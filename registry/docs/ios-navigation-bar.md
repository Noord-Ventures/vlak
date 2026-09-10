# iOS navigation bar

Compact or large-title navigation with circular actions and an optional vertical rail.

Category: ios  
Name: `ios-navigation-bar`  
Also known as: UIKit navigation bar, UINavigationBar, iOS toolbar, Duo vertical toolbar  
Page: https://vlak.dev/components/ios-navigation-bar/

## When to use

- A compact app title, a large root-screen title, or a trailing vertical action rail.
- Pass native button properties to actions, including disabled, form and type.

## When not to

- Primary destination switching; use the iOS tab bar.
- More actions than fit comfortably in the available width.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { IOSNavigationBar } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add ios-navigation-bar
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/ios-navigation-bar.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<header class="rs-ios-navigation-bar"><div class="rs-ios-navigation-bar-row"><button class="rs-ios-navigation-bar-button rs-ios-navigation-bar-back" type="button" aria-label="Back">←</button><h2 class="rs-ios-navigation-bar-title">Notes</h2><div class="rs-ios-navigation-bar-actions"><button class="rs-ios-navigation-bar-button" type="button">Done</button></div></div></header>
```

## Example

```tsx
import { IOSNavigationBar } from "@noorddev/vlak-react";

<IOSNavigationBar title="Notes" onBack={() => history.back()} actions={[{ id: "done", label: "Done", type: "submit", form: "note-editor" }]} />
```

## Props

### IOSNavigationBar

Compact and large-title navigation, with an optional trailing Duo action rail.

Extends `Omit<HTMLAttributes<HTMLElement>, "title" | "children">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` (required) | `ReactNode` |  |  |
| `onBack` | `() => void` |  |  |
| `backLabel` | `string` | `"Back"` |  |
| `actions` | `IOSNavigationBarAction[]` | `[]` |  |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` |  |
| `largeTitle` | `boolean` | `false` |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab, Shift+Tab | Moves through enabled Back and action buttons. |
| Enter, Space | Activates a focused action with native button behavior. |

## Accessibility

- Back and icon actions have accessible labels. Each target is at least 44px.
- Instance-scoped action IDs avoid collisions; buttonId permits explicit references.

## Classes

`rs-ios-navigation-bar`, `rs-ios-navigation-bar-vertical`, `rs-ios-navigation-bar-row`, `rs-ios-navigation-bar-leading`, `rs-ios-navigation-bar-rail`, `rs-ios-navigation-bar-actions`, `rs-ios-navigation-bar-actions-vertical`, `rs-ios-navigation-bar-title`, `rs-ios-navigation-bar-large-title`, `rs-ios-navigation-bar-vertical-title`, `rs-ios-navigation-bar-button`, `rs-ios-navigation-bar-back`, `rs-ios-navigation-bar-icon-button`, `rs-ios-navigation-bar-disabled`

## Dependencies

Registry dependencies: [icons](icons.md).  
React: `packages/react/src/components/ios-navigation-bar.tsx`  
CSS: `packages/core/css/components/ios-navigation-bar.css`
