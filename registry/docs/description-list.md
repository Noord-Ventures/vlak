# Description list

Aligns semantic labels and values in a responsive description list.

Category: content  
Name: `description-list`  
Also known as: DescriptionList  
Page: https://vlak.dev/components/description-list/

## When to use

- Read-only properties, specifications, and account details.

## When not to

- Editable properties; use PropertyGrid.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { DescriptionList } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add description-list
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/description-list.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<dl class="rs-description-list"><div class="rs-description-list-row"><dt class="rs-description-list-label">Estimated range</dt><dd class="rs-description-list-value">386 km</dd></div></dl>
```

## Example

```tsx
import { DescriptionList } from "@noorddev/vlak-react";

<DescriptionList items={[{ id: "range", label: "Estimated range", value: "386 km" }, { id: "battery", label: "Battery", value: "84%" }]} />
```

## Props

### DescriptionList

Aligned, semantic labels and values without an extra card.

Extends `HTMLAttributes<HTMLDListElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDListElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` (required) | `DescriptionItem[]` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab, Enter, Space | Links or controls supplied as values keep their native keyboard behavior. |

## Accessibility

- Uses dl, dt, and dd; labels and values remain in reading order on small screens.

## Classes

`rs-description-list`, `rs-description-list-row`, `rs-description-list-label`, `rs-description-list-value`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/description-list.tsx`  
CSS: `packages/core/css/components/description-list.css`
