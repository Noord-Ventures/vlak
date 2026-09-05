# Property grid

Aligns editable labels, values, units, and hints in an inspector.

Category: patterns  
Name: `property-grid`  
Also known as: PropertyGrid  
Page: https://vlak.dev/components/property-grid/

## When to use

- Inspector panels and dense settings with mixed field types.

## When not to

- Read-only facts; use DescriptionList.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { PropertyGrid } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add property-grid
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/property-grid.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-property-grid" role="group" aria-label="Properties"><div class="rs-property-grid-row"><label class="rs-property-grid-label" for="property-name">Name</label><div class="rs-property-grid-control"><input class="rs-input" id="property-name" value="Drive" /></div></div></div>
```

## Example

```tsx
import { PropertyGrid } from "@noorddev/vlak-react";

<PropertyGrid defaultValue={{ name: "Drive", range: 386, enabled: true }} fields={[{ id: "name", label: "Name" }, { id: "range", label: "Range", type: "number", unit: "km", min: 0 }, { id: "enabled", label: "Connected", type: "switch" }]} />
```

## Props

### PropertyGrid

Editable property rows with shared label/value/unit alignment.

Extends `Omit<HTMLAttributes<HTMLDivElement>, "defaultValue">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `fields` (required) | `PropertyField[]` |  |  |
| `value` | `PropertyValues` |  |  |
| `defaultValue` | `PropertyValues` | `{}` |  |
| `onValueChange` | `(values: PropertyValues) => void` |  |  |
| `label` | `string` | `"Properties"` |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab, native field keys, Space | Native text/number/select fields keep their editing keys; Space toggles a switch. |

## Accessibility

- Each row labels its actual control and associates its hint. Native numeric constraints remain available to forms.

## Classes

`rs-property-grid`, `rs-property-grid-row`, `rs-property-grid-label`, `rs-property-grid-control`, `rs-property-grid-note`

## Dependencies

Registry dependencies: [input](input.md), [native-select](native-select.md), [switch](switch.md).  
React: `packages/react/src/components/property-grid.tsx`  
CSS: `packages/core/css/components/property-grid.css`
