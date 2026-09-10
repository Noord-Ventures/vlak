# iOS list

Inset list groups with labels, descriptions, leading symbols and independent trailing controls.

Category: ios  
Name: `ios-list`  
Also known as: UITableView grouped, iOS settings list, Inset grouped list  
Page: https://vlak.dev/components/ios-list/

## When to use

- Grouped settings, preferences and navigation rows.
- Omit onClick for rows containing an interactive trailing input.

## When not to

- Nesting a switch or another interactive element inside an action row.
- Using a clickable row for plain informational content.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { IOSList, IOSListRow } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add ios-list
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/ios-list.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<section class="rs-ios-list" aria-labelledby="settings-heading"><h3 class="rs-ios-list-title" id="settings-heading">Settings</h3><div class="rs-ios-list-group"><button class="rs-ios-list-row rs-ios-list-row-action" type="button"><span class="rs-ios-list-row-copy">General</span></button></div></section>
```

## Example

```tsx
import { IOSList, IOSListRow, IOSSwitch } from "@noorddev/vlak-react";

<IOSList title="Connections"><IOSListRow label={<label htmlFor="wifi">Wi-Fi</label>} trailing={<IOSSwitch id="wifi" defaultChecked />} /><IOSListRow label="Network details" disclosure onClick={() => console.log("Open network")} /></IOSList>
```

## Props

### IOSList

An inset group of rows; controls remain separate focus targets.

Extends `Omit<HTMLAttributes<HTMLElement>, "title">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `ReactNode` |  |  |
| `footer` | `ReactNode` |  |  |

### IOSListRow

Supply onClick for a native button, or omit it to hold a switch or other input.

Extends `Omit<HTMLAttributes<HTMLElement>, "children">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `ReactNode` |  |  |
| `description` | `ReactNode` |  |  |
| `leading` | `ReactNode` |  |  |
| `trailing` | `ReactNode` |  |  |
| `disabled` | `boolean` |  |  |
| `disclosure` | `boolean` | `false` |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab, Shift+Tab | Moves through action rows and the controls inside static rows. |
| Enter, Space | Activates a focused action row as a native button. |

## Accessibility

- Group headings label their sections. Static rows are not unnecessary focus stops.
- Action rows use native buttons with disabled behavior and at least a 52px height.

## Classes

`rs-ios-list`, `rs-ios-list-title`, `rs-ios-list-group`, `rs-ios-list-footer`, `rs-ios-list-row`, `rs-ios-list-row-action`, `rs-ios-list-row-disabled`, `rs-ios-list-row-leading`, `rs-ios-list-row-copy`, `rs-ios-list-row-description`, `rs-ios-list-row-trailing`

## Dependencies

Registry dependencies: [icons](icons.md).  
React: `packages/react/src/components/ios-list.tsx`  
CSS: `packages/core/css/components/ios-list.css`
