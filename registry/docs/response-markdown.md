# Response markdown

Renders streaming markdown, tables, code, math, and diagrams with Vlak typography and safe default links.

Category: ai  
Name: `response-markdown`  
Also known as: AI Elements MessageResponse, Streamdown, Markdown response, Streaming markdown, Math response, Mermaid response  
Page: https://vlak.dev/ai/response-markdown/

## When to use

- Pass the current response text and streaming=true while receiving it. Completed content uses static parsing.
- Use the optional renderer subpath and install its documented dependencies. It needs no model vendor or Tailwind runtime.
- Import the documented KaTeX stylesheet to render equations and local math fonts correctly.
- Set imageOrigins to exact permitted origins when response images should load. Otherwise image descriptions remain readable.
- Use trusted components overrides for application-specific rendering. Native root attributes, styles, and refs are preserved.

## When not to

- Passing model-authored markup through a custom component that injects it as trusted content.
- Assuming the renderer starts a model request, persists a message, or executes displayed code.
- Importing renderer code into the root component package when a lightweight application does not use it.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react streamdown@^2.6.0 shiki@^3.19.0 @streamdown/math@^1.0.2 @streamdown/cjk@^1.0.3 mermaid@^11.12.2 katex@^0.16.27
```

This optional entry point keeps its rendering dependencies out of the core React import.

```tsx
import "@noorddev/vlak-react/css";
import "katex/dist/katex.min.css";
import { ResponseMarkdown } from "@noorddev/vlak-react/components/response-markdown";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add response-markdown
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/response-markdown.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-response-markdown"><p class="rs-response-markdown-paragraph">Give each decision a <strong class="rs-response-markdown-strong">clear owner</strong> and a next step.</p></div>
```

## Example

```tsx
import { Response } from "@noorddev/vlak-react";
import { ResponseMarkdown } from "@noorddev/vlak-react/components/response-markdown";
import "katex/dist/katex.min.css";

<Response status="streaming">
  <ResponseMarkdown streaming>{"Give each decision a **clear owner**."}</ResponseMarkdown>
</Response>
```

## Props

### ResponseMarkdown

Optional streaming Markdown, math, code, and diagrams with Vlak paint and safe default URLs.

Extends `Omit<HTMLAttributes<HTMLDivElement>, "children">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` (required) | `string` |  |  |
| `streaming` | `boolean` | `false` | True while the application is receiving this response. |
| `math` | `boolean` | `true` |  |
| `diagrams` | `boolean` | `true` |  |
| `lineNumbers` | `boolean` | `false` |  |
| `imageOrigins` | `readonly string[]` | `noImages` | Only images from these exact origins load. The default renders image descriptions. |
| `baseUrl` | `string` |  | Origin used to resolve relative image addresses. |
| `components` | `Components` |  | Trusted application components override Vlak's Markdown elements. |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Reaches links, scrollable tables and code, diagram controls, and the native source disclosure. |
| Enter, Space | Activates the focused code or diagram button; the native source summary expands or collapses. |

## Accessibility

- Changing response text stays outside a live region. Compose with Response for short response status announcements.
- Headings, lists, tables, readable code, and math retain semantic markup. Tables and code are keyboard-scrollable.
- Raw markup is disabled and sanitized. Links allow web and mail protocols; other protocols and incomplete links remain inert text.
- Math uses KaTeX with its default trust restrictions. Diagrams load only after a complete fence and use strict rendering with source fallback.
- Diagram zoom controls have descriptive names, 44px targets, and visible focus. Invalid or oversized diagrams preserve their source.

## Classes

`rs-response-markdown-paragraph`, `rs-response-markdown-strong`, `rs-response-markdown-list`, `rs-response-markdown-item`, `rs-response-markdown-quote`, `rs-response-markdown-inline`, `rs-response-markdown-link`, `rs-response-markdown-image`, `rs-response-markdown-image-description`, `rs-response-markdown-table-region`, `rs-response-markdown-table`, `rs-response-markdown-th`, `rs-response-markdown-td`, `rs-response-markdown-rule`, `rs-response-markdown-diagram`, `rs-response-markdown-diagram-viewport`, `rs-response-markdown-diagram-art`, `rs-response-markdown-diagram-header`, `rs-response-markdown-diagram-title`, `rs-response-markdown-diagram-action`, `rs-response-markdown-diagram-icon`, `rs-response-markdown-summary`, `rs-response-markdown-feedback`, `rs-response-markdown`, `rs-response-markdown-h1`, `rs-response-markdown-h2`, `rs-response-markdown-h3`, `rs-response-markdown-h4`, `rs-response-markdown-h5`, `rs-response-markdown-h6`

## Dependencies

Registry dependencies: [highlighted-code](highlighted-code.md), [button](button.md).  
React: `packages/react/src/components/response-markdown.tsx`  
CSS: `packages/core/css/components/response-markdown.css`
