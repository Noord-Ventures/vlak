# Android app bar

A Material app bar with a title, navigation action and trailing actions in Vlak tones.

Category: android  
Name: `android-app-bar`  
Also known as: Material top app bar, Android toolbar, center-aligned top app bar  
Page: https://vlak.dev/components/android-app-bar/

## When to use

- Top-level Android screens with a title and a small set of actions.
- A medium app bar when the screen needs a larger title.

## When not to

- Page navigation with more destinations than fit in an app bar.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { AndroidAppBar, AndroidAppBarAction } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add android-app-bar
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/android-app-bar.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<header class="rs-android-app-bar"><div class="rs-android-app-bar-navigation"><button class="rs-android-app-bar-action" type="button" aria-label="Go back">←</button></div><h2 class="rs-android-app-bar-title">Documents</h2><div class="rs-android-app-bar-actions"><button class="rs-android-app-bar-action" type="button" aria-label="More actions">⋯</button></div></header>
```

## Example

```tsx
import { AndroidAppBar, AndroidAppBarAction, Icon } from "@noorddev/vlak-react";

<AndroidAppBar title="Documents" navigation={<AndroidAppBarAction aria-label="Go back" onClick={goBack}><Icon name="arrow-left" /></AndroidAppBarAction>} />
```

## Props

### AndroidAppBar

Extends `Omit<HTMLAttributes<HTMLElement>, "title">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` (required) | `ReactNode` |  |  |
| `navigation` | `ReactNode` |  |  |
| `actions` | `ReactNode` |  |  |
| `variant` | `"small" \| "medium"` | `"small"` |  |

### AndroidAppBarAction

Extends `ButtonHTMLAttributes<HTMLButtonElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLButtonElement`.

No props of its own.

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves between enabled actions. |
| Enter or Space | Activates the focused action. |

## Accessibility

- Uses a native header and a level-two heading.
- Label icon-only actions with aria-label.
- Action buttons keep a 48-pixel target and a visible keyboard focus indicator.

## Classes

`rs-android-app-bar`, `rs-android-app-bar-medium`, `rs-android-app-bar-navigation`, `rs-android-app-bar-title`, `rs-android-app-bar-leading-title`, `rs-android-app-bar-medium-title`, `rs-android-app-bar-actions`, `rs-android-app-bar-action`

## Dependencies

Registry dependencies: [icons](icons.md).  
React: `packages/react/src/components/android-app-bar.tsx`  
CSS: `packages/core/css/components/android-app-bar.css`
