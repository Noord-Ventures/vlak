# iOS tab bar

Floating peer tabs with icon labels, roving focus and horizontal or vertical placement.

Category: ios  
Name: `ios-tab-bar`  
Also known as: UITabBar, iOS bottom navigation, Duo tab rail  
Page: https://vlak.dev/components/ios-tab-bar/

[iOS component index](https://vlak.dev/docs/ios.md) · [Interactive component catalog](https://vlak.dev/components/#ios) · [Related iOS interface study](https://vlak.dev/interfaces/ios/)

## When to use

- A small set of peer views in an app, with content managed by the parent.
- Provide panelId and optional buttonId to associate tabs with tabpanels.

## When not to

- Unrelated commands; use iOS navigation bar actions.
- Hiding labels on a vertical rail without recognizable icons.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { IOSTabBar } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add ios-tab-bar
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/ios-tab-bar.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-ios-tab-bar" role="tablist" aria-label="Music"><button class="rs-ios-tab-bar-tab rs-ios-tab-bar-active" role="tab" aria-selected="true" tabindex="0">Library</button><button class="rs-ios-tab-bar-tab" role="tab" aria-selected="false" tabindex="-1">Search</button></div>
```

## Example

```tsx
import { IOSTabBar } from "@noorddev/vlak-react";

<IOSTabBar defaultValue="library" label="Music" items={[{ id: "library", label: "Library", panelId: "library-panel" }, { id: "search", label: "Search", panelId: "search-panel" }]} />
```

## Props

### IOSTabBar

Automatically activated peer tabs. Supply panelId for the associated content.

Extends `Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange" | "children">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` (required) | `IOSTabBarItem[]` |  |  |
| `value` | `string` |  |  |
| `defaultValue` | `string` |  |  |
| `onValueChange` | `(value: string) => void` |  |  |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` |  |
| `label` | `string` | `"App navigation"` |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab, Shift+Tab | Enters or leaves the tab bar through its selected tab. |
| Arrows, Home, End | Moves and selects enabled tabs, wrapping at the ends; horizontal arrows respect text direction. |
| Enter, Space | Selects the focused tab. |

## Accessibility

- Exposes tablist, tab and selected state. Disabled tabs are skipped.
- Vertical icon tabs retain their labels for assistive technology. IDs are unique per instance.

## Classes

`rs-ios-tab-bar`, `rs-ios-tab-bar-vertical`, `rs-ios-tab-bar-symbol`, `rs-ios-tab-bar-vertical-label`, `rs-ios-tab-bar-tab`, `rs-ios-tab-bar-active`, `rs-ios-tab-bar-tab-vertical`, `rs-ios-tab-bar-disabled`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/ios-tab-bar.tsx`  
CSS: `packages/core/css/components/ios-tab-bar.css`
