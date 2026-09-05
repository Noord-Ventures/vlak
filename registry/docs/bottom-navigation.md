# Bottom navigation

Presents mobile destinations with current state and safe-area spacing.

Category: navigation  
Name: `bottom-navigation`  
Also known as: BottomNavigation  
Page: https://vlak.dev/components/bottom-navigation/

## When to use

- Three to five primary destinations in a mobile product.

## When not to

- Action commands or large collections of destinations.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { BottomNavigation } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add bottom-navigation
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/bottom-navigation.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<nav class="rs-bottom-navigation" aria-label="Primary navigation"><ul class="rs-bottom-navigation-list"><li><a class="rs-bottom-navigation-link rs-bottom-navigation-current" href="/" aria-current="page">Home</a></li><li><a class="rs-bottom-navigation-link" href="/docs/">Docs</a></li></ul></nav>
```

## Example

```tsx
import { BottomNavigation } from "@noorddev/vlak-react";

<BottomNavigation current="interfaces" items={[{ id: "components", label: "Components", href: "/components/", icon: "grid" }, { id: "interfaces", label: "Interfaces", href: "/interfaces/", icon: "layout" }, { id: "docs", label: "Docs", href: "/docs/", icon: "file-text" }]} />
```

## Props

### BottomNavigation

Mobile destinations with safe-area padding and native links. Keep to five items.

Extends `HTMLAttributes<HTMLElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` (required) | `BottomNavigationItem[]` |  |  |
| `current` | `string` |  |  |
| `label` | `string` | `"Primary navigation"` |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab, Enter | Tab moves through native links; Enter follows the destination. |

## Accessibility

- A named navigation landmark and aria-current page indicate the active destination. Count badges are readable text.

## Classes

`rs-bottom-navigation`, `rs-bottom-navigation-list`, `rs-bottom-navigation-link`, `rs-bottom-navigation-current`

## Dependencies

Registry dependencies: [icons](icons.md).  
React: `packages/react/src/components/bottom-navigation.tsx`  
CSS: `packages/core/css/components/bottom-navigation.css`
