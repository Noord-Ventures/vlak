# Icons

Provides interface marks on a 16px viewBox. Round currentColor strokes are 1px at 12, 1.25px at 16, and 1.5px at 24.

Category: icons  
Name: `icons`  
Also known as: Icon, Icons, Icon set, Glyphs  
Page: https://vlak.dev/components/icons/

## When to use

- Chrome marks at 12, 16, or 24: chevrons, close, search, sort, and the rest of the family.
- rotate for the down and up chevrons; variant="filled" for the solid kin.

## When not to

- Illustration or brand marks; these are compact interface glyphs.
- Icons as the only label; add text or an aria-label on the control.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { Icon, IconCatalog, iconLabel, Icons, resolveIcon } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add icons
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/icons.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-icons"><svg class="rs-icon" viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M5.5 3 H13 V10.5" vector-effect="non-scaling-stroke"/><rect x="3" y="5.5" width="7.5" height="7.5" vector-effect="non-scaling-stroke"/></svg><svg class="rs-icon" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"><path d="M5.5 3 H13 V10.5" vector-effect="non-scaling-stroke"/><rect x="3" y="5.5" width="7.5" height="7.5" vector-effect="non-scaling-stroke"/></svg></div>
```

## Example

```tsx
import { Icon, IconCatalog, iconNames } from "@noorddev/vlak-react";

<Icon name="search" size={12} />
<Icon name="search" size={16} />
<Icon name="check" size={24} variant="filled" />
<Icon name="chevron-right" rotate={90} />
<button type="button" aria-label="Close"><Icon name="close" /></button>

iconNames; // every drawn mark
<IconCatalog />
```

## Props

### Icon

One mark. Size is the drawn square; the viewBox is always 16.

Extends `Omit<SVGAttributes<SVGSVGElement>, "children" | "rotate">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `SVGSVGElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `name` (required) | `IconName` |  |  |
| `size` | `IconSize` | `16` |  |
| `variant` | `IconVariant` | `"line"` | Optically weighted line, or filled silhouette of the same figure. |
| `rotate` | `IconRotate` |  | Same mark, spun around 8,8. Accordion down is chevron-right at 90. |

### IconCatalog

Full family at 12, 16, and 24, line | filled, grouped. Optical center 8,8.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` |  |  |

### Icons

Inline mark row. One family, current color.

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

No props of its own.

### Functions

- `iconLabel` (function)
- `resolveIcon` (function)

## Accessibility

- Icon renders an inline <svg aria-hidden="true">; it is decorative unless you pass aria-hidden={false}, role="img", and aria-label.
- Icon-only controls need an aria-label; the icon never names them.

## Classes

`rs-icons`, `rs-icon`, `rs-icon-catalog`, `rs-icon-group`, `rs-icon-group-title`, `rs-icon-grid`, `rs-icon-cell`, `rs-icon-pair`, `rs-icon-kin`, `rs-icon-label`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/icon.tsx`  
CSS: `packages/core/css/components/icons.css`
