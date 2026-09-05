# Code block

Shows source text with optional line numbers, wrapping, and copy feedback.

Category: content  
Name: `code-block`  
Also known as: CodeBlock  
Page: https://vlak.dev/components/code-block/

## When to use

- Installation commands, code samples, and technical documents.

## When not to

- Comparing revisions; use DiffViewer.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { CodeBlock } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add code-block
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/code-block.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<figure class="rs-code-block"><figcaption class="rs-code-block-header">TypeScript</figcaption><pre class="rs-code-block-pre" tabindex="0" aria-label="TypeScript source"><code>const range = 386;</code></pre></figure>
```

## Example

```tsx
import { CodeBlock } from "@noorddev/vlak-react";

<CodeBlock language="TypeScript" code={"const range = 386;\nconst unit = \"km\";"} lineNumbers />
```

## Props

### CodeBlock

Plain source with optional numbering and honest asynchronous copy feedback.

Extends `HTMLAttributes<HTMLElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `code` (required) | `string` |  |  |
| `language` | `string` | `"Text"` |  |
| `lineNumbers` | `boolean` | `false` |  |
| `wrap` | `boolean` | `false` |  |
| `copyable` | `boolean` | `true` |  |
| `onCopyCode` | `(code: string) => void \| Promise<void>` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab, Enter, Space | Tab reaches the copy action and scrollable source; Enter or Space copies. |

## Accessibility

- Line numbers are decorative. Copy completion and failure are announced only after the operation resolves.

## Classes

`rs-code-block`, `rs-code-block-header`, `rs-code-block-pre`, `rs-code-block-wrap`, `rs-code-block-line`, `rs-code-block-number`, `rs-code-block-status`

## Dependencies

Registry dependencies: [button](button.md).  
React: `packages/react/src/components/code-block.tsx`  
CSS: `packages/core/css/components/code-block.css`
