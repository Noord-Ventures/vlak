# Json viewer

Inspects structured data with bounded nested disclosures and path search.

Category: content  
Name: `json-viewer`  
Also known as: JSONViewer  
Page: https://vlak.dev/components/json-viewer/

## When to use

- Inspecting API responses, configuration, and nested records.

## When not to

- Editing structured data; use a form or editor.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { JSONViewer } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add json-viewer
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/json-viewer.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-json-viewer" role="region" aria-label="Vehicle data"><div class="rs-json-viewer-body"><details open><summary class="rs-json-viewer-summary">vehicle: Object</summary><div class="rs-json-viewer-children"><p class="rs-json-viewer-value">range: 386</p></div></details></div></div>
```

## Example

```tsx
import { JSONViewer } from "@noorddev/vlak-react";

<JSONViewer label="Vehicle data" data={{ vehicle: { range: 386, battery: 84 }, connected: true }} />
```

## Props

### JSONViewer

Bounded JSON inspection using native disclosures and path/value search.

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `data` (required) | `unknown` |  |  |
| `label` | `string` | `"Structured data"` |  |
| `searchable` | `boolean` | `true` |  |
| `maxDepth` | `number` | `8` | Bounds rendering of unusually deep data. |
| `maxEntries` | `number` | `100` | Maximum children shown per object or array. |
| `maxNodes` | `number` | `1000` | Total node budget across the inspected document. |
| `maxStringLength` | `number` | `2000` | Maximum string characters displayed per value, before escaping. |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab, Enter, Space | Tab reaches search, expand/collapse controls, and summaries; Enter or Space toggles a disclosure. |

## Accessibility

- Uses native details rather than a partial tree role. Depth, entry, total node, and string length limits disclose truncation; circular references are labeled. Inspection does not invoke getters. Search covers the displayed, bounded data.

## Classes

`rs-json-viewer`, `rs-json-viewer-tools`, `rs-json-viewer-body`, `rs-json-viewer-summary`, `rs-json-viewer-children`, `rs-json-viewer-value`, `rs-json-viewer-note`

## Dependencies

Registry dependencies: [button](button.md), [input](input.md).  
React: `packages/react/src/components/json-viewer.tsx`  
CSS: `packages/core/css/components/json-viewer.css`
