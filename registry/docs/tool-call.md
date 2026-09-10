# Tool call

Shows tool input, output, and execution state in a native disclosure with a subtle 1px outline, 4px corners, and a 44px summary.

Category: ai  
Name: `tool-call`  
Also known as: ToolCall, AI Elements Tool, Tool invocation, Tool result, Function call  
Page: https://vlak.dev/ai/tool-call/

[AI component index](https://vlak.dev/docs/ai-index.md) · [Integration guide](https://vlak.dev/docs/ai.md) · [AI Elements feature coverage](https://vlak.dev/docs/ai-parity.md)

## When to use

- Showing application-supplied tool activity within a conversation.
- Queued, running, complete, or error states with optional input, output, and additional content.

## When not to

- Executing a tool or granting permission; the application owns execution and authorization.
- Passing raw objects or booleans as display content; serialize them or use your own renderer.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { getToolCallPresentation, ToolCall } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add tool-call
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/tool-call.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<details class="rs-tool-call" open><summary class="rs-tool-call-summary"><span class="rs-tool-call-title">Search documents</span><span class="rs-tool-call-state" role="status">Complete</span><svg class="rs-tool-call-indicator" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6" /></svg></summary><div class="rs-tool-call-body"><div class="rs-tool-call-section"><p class="rs-tool-call-label">Output</p><pre class="rs-tool-call-code">Three matching documents</pre></div></div></details>
```

## Example

```tsx
import { ToolCall } from "@noorddev/vlak-react";

<ToolCall title="Search documents" state="complete" input={JSON.stringify({ query: "Renewal terms" }, null, 2)} output="Three matching documents" defaultOpen />
```

## Props

### ToolCall

Displays supplied tool activity. The application owns execution and its state.

Extends `Omit<DetailsHTMLAttributes<HTMLDetailsElement>, "title">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDetailsElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` (required) | `ReactNode` |  | Name of the application-owned tool operation. |
| `state` | `ToolCallState` | `"queued"` |  |
| `statusLabel` | `string` |  | More precise supplied progress, for example approval or input preparation. |
| `input` | `ReactNode` |  | Strings and numbers are rendered as plain preformatted text. Format objects before passing them. |
| `output` | `ReactNode` |  |  |
| `error` | `string` |  |  |
| `defaultOpen` | `boolean` | `false` |  |
| `onOpenChange` | `(open: boolean) => void` |  |  |

### Functions

- `getToolCallPresentation` (function): Maps supplied tool lifecycle without inferring that ready arguments have started execution.

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Focuses the native disclosure summary and any interactive content when expanded. |
| Enter, Space | Requests expansion or collapse through the browser's native summary behavior. |

## Accessibility

- The native details and summary expose expansion state. The summary has a 44px minimum target and visible focus outline.
- The decorative 16px chevron points right when closed and down when open. Forced colors retain a system color outline and readable controls.
- State is visible text in a polite status; error text has an alert role. No color is needed to distinguish states.
- Strings and numbers are rendered as escaped preformatted text. Empty strings and zero are retained; React nodes remain application-rendered content.
- open is authoritative when controlled; onOpenChange reports requested changes. defaultOpen sets the initial uncontrolled state. The ref reaches details and native attributes pass through.
- The component displays the supplied execution state and never runs a tool itself.

## Classes

`rs-tool-call`, `rs-tool-call-summary`, `rs-tool-call-title`, `rs-tool-call-state`, `rs-tool-call-indicator`, `rs-tool-call-body`, `rs-tool-call-section`, `rs-tool-call-label`, `rs-tool-call-value`, `rs-tool-call-code`, `rs-tool-call-error`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/tool-call.tsx`  
CSS: `packages/core/css/components/tool-call.css`
