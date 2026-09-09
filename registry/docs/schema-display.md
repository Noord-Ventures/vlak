# Schema display

Displays an endpoint’s method, path, parameters and nested request and response schemas.

Category: ai  
Name: `schema-display`  
Also known as: AI Elements Schema Display, API endpoint, Request schema  
Page: https://vlak.dev/ai/schema-display/

## When to use

- Endpoint documentation with parameter locations, required fields, nested objects and array item schemas.
- Use maxDepth and maxNodes to bound rendering of large schemas; defaults are 6 levels and 200 properties.
- Adapt an API specification to SchemaProperty records before rendering.

## When not to

- Treating this view as an OpenAPI validator or request executor.
- Embedding markup in endpoint paths; strings are deliberately rendered as text.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { SchemaDisplay } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add schema-display
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/schema-display.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<article class="rs-schema-display" aria-label="POST /reviews"><header class="rs-schema-display-header"><span class="rs-badge-muted">POST</span><code class="rs-schema-display-path">/reviews</code></header><div class="rs-schema-display-content"><details class="rs-disclosure" open><summary class="rs-disclosure-summary">Request body</summary><ul class="rs-schema-display-list"><li class="rs-schema-display-property"><div class="rs-schema-display-line"><code>diff</code><span class="rs-badge-muted">string</span><strong class="rs-schema-display-note">Required</strong></div></li></ul></details></div></article>
```

## Example

```tsx
import { SchemaDisplay } from "@noorddev/vlak-react";

<SchemaDisplay method="POST" path="/projects/{projectId}/reviews" parameters={[{ name: "projectId", type: "string", required: true, location: "path" }]} requestBody={[{ name: "diff", type: "string", required: true }]} responseBody={[{ name: "id", type: "string", required: true }]} />
```

## Props

### SchemaDisplay

Endpoint documentation with bounded, expandable object and array schemas.

Extends `HTMLAttributes<HTMLElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `method` (required) | `"GET" \| "POST" \| "PUT" \| "PATCH" \| "DELETE" \| "HEAD" \| "OPTIONS"` |  |  |
| `path` (required) | `string` |  |  |
| `description` | `ReactNode` |  |  |
| `parameters` | `SchemaParameter[]` |  |  |
| `requestBody` | `SchemaProperty[]` |  |  |
| `responseBody` | `SchemaProperty[]` |  |  |
| `maxDepth` | `number` | `6` | Bounds recursive schema rendering. Defaults to 6 levels and 200 properties. |
| `maxNodes` | `number` | `200` |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Tab reaches each native schema summary. |
| Enter, Space | Enter or Space toggles parameters, bodies and nested properties. |

## Accessibility

- Endpoint method and path name the article, while types, locations and required flags are readable text.
- Recursive references, depth limits and omitted properties have explicit labels.
- Paths and descriptions are escaped React text; no markup interpolation is used.

## Classes

`rs-schema-display`, `rs-schema-display-header`, `rs-schema-display-path`, `rs-schema-display-content`, `rs-schema-display-description`, `rs-schema-display-list`, `rs-schema-display-property`, `rs-schema-display-line`, `rs-schema-display-note`

## Dependencies

Registry dependencies: [badge](badge.md), [collapsible](collapsible.md).  
React: `packages/react/src/components/schema-display.tsx`  
CSS: `packages/core/css/components/schema-display.css`
