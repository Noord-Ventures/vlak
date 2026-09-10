# Snippet

Presents a compact selectable command with a decorative prefix and exact-value copy action.

Category: ai  
Name: `snippet`  
Also known as: AI Elements Snippet, Command line, Copy command  
Page: https://vlak.dev/ai/snippet/

[AI component index](https://vlak.dev/docs/ai-index.md) · [Integration guide](https://vlak.dev/docs/ai.md) · [AI Elements feature coverage](https://vlak.dev/docs/ai-parity.md)

## When to use

- A short command or source reference where the copy value should preserve whitespace.
- Reuse SnippetCopy for named exact-value actions in developer views.
- Supply onCopy for a host clipboard adapter; omit it to use the browser clipboard.

## When not to

- Claiming syntax highlighting or command execution from a selectable code line.
- Including a shell prompt in code when it should only be a decorative prefix.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { Snippet, SnippetCopy } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add snippet
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/snippet.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<figure class="rs-snippet" aria-label="Install command"><span class="rs-snippet-prefix" aria-hidden="true">$</span><code class="rs-snippet-code" tabindex="0">pnpm add @noorddev/vlak-react</code></figure>
```

## Example

```tsx
import { Snippet } from "@noorddev/vlak-react";

<Snippet code="pnpm add @noorddev/vlak-react" prefix="$" label="Install command" />
```

## Props

### Snippet

A compact, selectable command or code line; the decorative prefix is not copied.

Extends `Omit<HTMLAttributes<HTMLElement>, "onCopy" | "prefix">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `code` (required) | `string` |  |  |
| `prefix` | `ReactNode` |  |  |
| `label` | `string` | `"Code snippet"` |  |
| `copyLabel` | `string` |  |  |
| `copyable` | `boolean` | `true` |  |
| `onCopy` | `(value: string) => void \| Promise<void>` |  |  |

### SnippetCopy

Exact-value clipboard action shared by compact developer views.

Extends `Omit<HTMLAttributes<HTMLSpanElement>, "onCopy">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLSpanElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` (required) | `string` |  |  |
| `label` | `string` | `"Copy snippet"` |  |
| `onCopy` | `(value: string) => void \| Promise<void>` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Tab reaches the scrollable code and 44px copy button. |
| Enter, Space | Enter or Space requests clipboard copy from the focused button. |

## Accessibility

- The prefix is decorative and is excluded from copied source.
- Copy reports success only after completion, errors remain visible, and duplicate pending requests are locked.
- Changing the source invalidates stale clipboard feedback. Native attributes, className, style and refs are forwarded.

## Classes

`rs-snippet-copy`, `rs-snippet-status`, `rs-snippet`, `rs-snippet-prefix`, `rs-snippet-code`

## Dependencies

Registry dependencies: [button](button.md), [icons](icons.md).  
React: `packages/react/src/components/snippet.tsx`  
CSS: `packages/core/css/components/snippet.css`
