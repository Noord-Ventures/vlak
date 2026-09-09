# Highlighted code

Monochrome syntax highlighting with lazy grammars, exact-source copy and download, and a scrollable code region.

Category: ai  
Name: `highlighted-code`  
Also known as: AI Elements CodeBlock, Shiki code block, Syntax highlighting  
Page: https://vlak.dev/ai/highlighted-code/

## When to use

- Source returned by an assistant or supplied by an application that benefits from syntax structure.
- Pass streaming=true for unfinished blocks. Highlighting begins when the block settles.
- Set filename for code downloads. Copy and download always use the original supplied code.
- Unknown languages, large source, and unavailable grammars remain readable plain text.

## When not to

- Expecting this component to execute code or to fetch a source file.
- Applying colored syntax themes outside the monochrome design system.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react shiki@^3.19.0
```

This optional entry point keeps its rendering dependencies out of the core React import.

```tsx
import "@noorddev/vlak-react/css";
import { HighlightedCode } from "@noorddev/vlak-react/components/highlighted-code";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add highlighted-code
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/highlighted-code.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<figure class="rs-highlighted-code"><figcaption class="rs-highlighted-code-header"><span class="rs-highlighted-code-language">typescript</span></figcaption><pre class="rs-highlighted-code-pre" tabindex="0" role="group" aria-label="typescript source"><code>const ready = true;</code></pre></figure>
```

## Example

```tsx
import { HighlightedCode } from "@noorddev/vlak-react/components/highlighted-code";

<HighlightedCode code={"const ready = true;"} language="typescript" filename="review.ts" lineNumbers />
```

## Props

### HighlightedCode

Optional Shiki renderer with lazy grammars, monochrome tokens, and exact-source copy.

Extends `HTMLAttributes<HTMLElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `code` (required) | `string` |  |  |
| `language` | `string` | `"text"` |  |
| `streaming` | `boolean` | `false` | Keep an unfinished source block readable without repeatedly highlighting it. |
| `lineNumbers` | `boolean` | `false` |  |
| `maxHeight` | `number` | `400` | Maximum scrollable source height in pixels. |
| `copyable` | `boolean` | `true` |  |
| `downloadable` | `boolean` | `true` |  |
| `filename` | `string` | `"code.txt"` |  |
| `onCopyCode` | `(code: string) => void \| Promise<void>` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Reaches copy, download, and the scrollable source region. |
| Enter, Space | Copies or downloads the source through the focused button. |

## Accessibility

- Source is rendered as escaped React text, including highlighted tokens. Decorative line numbers do not enter the accessible text.
- Copy feedback appears only after the clipboard request resolves. Failure remains visible and can be retried.
- A 44px target and visible focus outline support keyboard use. The source region is named and scrollable.
- Highlighting is lazy, has bounded full-source caching, and ignores stale results after content changes. Native figure attributes and its ref pass through.

## Classes

`rs-highlighted-code`, `rs-highlighted-code-header`, `rs-highlighted-code-language`, `rs-highlighted-code-actions`, `rs-highlighted-code-action`, `rs-highlighted-code-icon`, `rs-highlighted-code-pre`, `rs-highlighted-code-line`, `rs-highlighted-code-number`, `rs-highlighted-code-status`, `rs-highlighted-code-token`, `rs-highlighted-code-muted`, `rs-highlighted-code-bold`, `rs-highlighted-code-italic`

## Dependencies

Registry dependencies: [button](button.md).  
React: `packages/react/src/components/highlighted-code.tsx`  
CSS: `packages/core/css/components/highlighted-code.css`
