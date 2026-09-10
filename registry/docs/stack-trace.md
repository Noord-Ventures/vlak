# Stack trace

Parses JavaScript error frames into function names, file locations and internal-frame labels.

Category: ai  
Name: `stack-trace`  
Also known as: AI Elements Stack Trace, JavaScript error, Error frames  
Page: https://vlak.dev/ai/stack-trace/

[AI component index](https://vlak.dev/docs/ai-index.md) · [Integration guide](https://vlak.dev/docs/ai.md) · [AI Elements feature coverage](https://vlak.dev/docs/ai-parity.md)

## When to use

- Inspect supplied V8, Node, Firefox or Safari stack frames, preserving Windows drive names and URL paths.
- Use onFilePathClick to navigate to a file, line and column; unknown frame text remains readable.
- Use open/onOpenChange for controlled disclosure and maxFrames to bound displayed frames. Copy retains the full raw trace.

## When not to

- Executing a file path or inferring its contents from an error frame.
- Assuming every runtime stack syntax can be parsed; unsupported frame text is retained.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { parseStackTrace, StackTrace } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add stack-trace
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/stack-trace.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<article class="rs-stack-trace" aria-label="TypeError"><header class="rs-stack-trace-header"><div class="rs-stack-trace-heading"><span class="rs-stack-trace-title">TypeError</span><p class="rs-stack-trace-message">Draft must contain text</p></div></header><div class="rs-stack-trace-content"><details class="rs-disclosure" open><summary class="rs-disclosure-summary">1 stack frame</summary><ol class="rs-stack-trace-list"><li class="rs-stack-trace-frame"><span>sendPrompt</span><span>src/composer.tsx:42:5</span></li></ol></details></div></article>
```

## Example

```tsx
import { StackTrace } from "@noorddev/vlak-react";

<StackTrace trace={"TypeError: Draft must contain text\n  at sendPrompt (src/composer.tsx:42:5)\n  at node:internal/process/task_queues:95:5"} defaultOpen />
```

## Props

### StackTrace

Extends `Omit<HTMLAttributes<HTMLElement>, "onCopy">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `trace` (required) | `string` |  |  |
| `open` | `boolean` |  |  |
| `defaultOpen` | `boolean` | `false` |  |
| `onOpenChange` | `(open: boolean) => void` |  |  |
| `onFilePathClick` | `(filePath: string, line?: number, column?: number) => void` |  |  |
| `onCopy` | `(trace: string) => void \| Promise<void>` |  |  |
| `maxFrames` | `number` |  |  |

### Functions

- `parseStackTrace` (function): Parses V8/Node and Firefox/Safari locations; unknown frame text remains readable.

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Tab reaches raw-trace copy, the frame disclosure and optional location buttons. |
| Enter, Space | Enter or Space activates copy, toggles the frame summary or requests navigation to a location. |

## Accessibility

- Error type and message are visible text; internal frames have a readable label rather than opacity alone.
- Native disclosure semantics expose expanded state.
- All file callbacks are explicit user actions; parsing never opens files.

## Classes

`rs-stack-trace`, `rs-stack-trace-header`, `rs-stack-trace-heading`, `rs-stack-trace-title`, `rs-stack-trace-message`, `rs-stack-trace-content`, `rs-stack-trace-list`, `rs-stack-trace-location`, `rs-stack-trace-note`, `rs-stack-trace-frame`, `rs-stack-trace-internal`

## Dependencies

Registry dependencies: [button](button.md), [collapsible](collapsible.md), [snippet](snippet.md).  
React: `packages/react/src/components/stack-trace.tsx`  
CSS: `packages/core/css/components/stack-trace.css`
