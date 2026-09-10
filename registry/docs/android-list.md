# Android list

Segmented Material list rows with leading content, supporting text and independent trailing controls.

Category: android  
Name: `android-list`  
Also known as: Material list item, Android settings row, Expressive segmented list  
Page: https://vlak.dev/components/android-list/

## When to use

- Grouped Android settings and one-, two- or three-line content rows.
- A row action beside an independent trailing switch.

## When not to

- Tabular data where users compare aligned columns.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { AndroidList, AndroidListRow } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add android-list
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/android-list.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<ul class="rs-android-list" aria-label="Connections"><li class="rs-android-list-row"><button class="rs-android-list-body rs-android-list-action rs-android-list-two-line" type="button"><span class="rs-android-list-copy"><span class="rs-android-list-headline">Wi-Fi</span><span class="rs-android-list-secondary">Studio network</span></span></button><span class="rs-android-list-trailing">Connected</span></li><li class="rs-android-list-row"><div class="rs-android-list-body"><span class="rs-android-list-copy"><span class="rs-android-list-headline">Device name</span></span></div><span class="rs-android-list-trailing">Pixel</span></li></ul>
```

## Example

```tsx
import { AndroidList, AndroidListRow, AndroidSwitch } from "@noorddev/vlak-react";

<AndroidList aria-label="Connections">
  <AndroidListRow headline="Wi-Fi" supportingText="Studio network" onAction={openNetworks} trailing={<AndroidSwitch aria-label="Wi-Fi enabled" defaultChecked />} />
  <AndroidListRow headline="Device name" supportingText="Pixel" />
</AndroidList>
```

## Props

### AndroidList

Extends `HTMLAttributes<HTMLUListElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLUListElement`.

No props of its own.

### AndroidListRow

Extends `Omit<LiHTMLAttributes<HTMLLIElement>, "children">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLLIElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `headline` (required) | `ReactNode` |  |  |
| `supportingText` | `ReactNode` |  |  |
| `overline` | `ReactNode` |  |  |
| `leading` | `ReactNode` |  |  |
| `trailing` | `ReactNode` |  |  |
| `onAction` | `MouseEventHandler<HTMLButtonElement>` |  |  |
| `disabled` | `boolean` |  |  |
| `actionProps` | `Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" \| "className" \| "style" \| "onClick" \| "disabled">` |  | Native attributes for the row's optional button. Trailing controls remain siblings. |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves between row actions and independent trailing controls. |
| Enter or Space | Activates a focused row button. |

## Accessibility

- Native ul and li preserve list structure.
- Only rows with onAction become buttons; static rows add no tab stop.
- Trailing controls are siblings of the row button, so interactive elements are never nested.
- Decorative leading content is hidden from assistive technology.

## Classes

`rs-android-list`, `rs-android-list-row`, `rs-android-list-body`, `rs-android-list-action`, `rs-android-list-two-line`, `rs-android-list-three-line`, `rs-android-list-leading`, `rs-android-list-copy`, `rs-android-list-headline`, `rs-android-list-secondary`, `rs-android-list-trailing`

## Dependencies

Registry dependencies: [android-switch](android-switch.md).  
React: `packages/react/src/components/android-list.tsx`  
CSS: `packages/core/css/components/android-list.css`
