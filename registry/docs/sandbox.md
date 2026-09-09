# Sandbox

Combines a tool-status disclosure with keyboard-accessible code and output tabs.

Category: ai  
Name: `sandbox`  
Also known as: AI Elements Sandbox, Code execution result, Code and output  
Page: https://vlak.dev/ai/sandbox/

## When to use

- Display supplied generated code and the result of an application-owned run.
- Use tab/onTabChange or defaultTab to select code or output.
- Supply codeContent to compose an optional syntax renderer, and output for text or structured React results.

## When not to

- Treating this display surface as a code executor or isolation boundary.
- Reporting a successful run before the application supplies that state.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { Sandbox } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add sandbox
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/sandbox.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<details class="rs-tool-call rs-sandbox" open><summary class="rs-tool-call-summary"><span class="rs-tool-call-title">Check generated module</span><span class="rs-tool-call-state">Complete</span></summary><div class="rs-tool-call-body"><div class="rs-sandbox-content"><pre class="rs-sandbox-output">2 checks passed</pre></div></div></details>
```

## Example

```tsx
import { Sandbox } from "@noorddev/vlak-react";

<Sandbox title="Check generated module" state="complete" code="export const ready = true;" language="TypeScript" output="2 checks passed" />
```

## Props

### Sandbox

A code/output disclosure. Execution and process isolation remain application-owned.

Extends `Omit<DetailsHTMLAttributes<HTMLDetailsElement>, "title">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDetailsElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `code` (required) | `string` |  |  |
| `language` | `string` | `"Text"` |  |
| `output` | `ReactNode` |  |  |
| `codeContent` | `ReactNode` |  |  |
| `tab` | `"output" \| "code"` |  |  |
| `defaultTab` | `"output" \| "code"` | `"code"` |  |
| `onTabChange` | `(tab: "code" \| "output") => void` |  |  |
| `title` (required) | `ReactNode` |  | Name of the application-owned tool operation. |
| `state` | `ToolCallState` |  |  |
| `statusLabel` | `string` |  | More precise supplied progress, for example approval or input preparation. |
| `error` | `string` |  |  |
| `defaultOpen` | `boolean` | `true` |  |
| `onOpenChange` | `(open: boolean) => void` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Tab reaches the native disclosure, active tab and controls inside the selected panel. |
| Arrow keys, Home, End, Enter, Space | Arrow keys, Home and End move between code/output tabs; Enter or Space activates the focused control. |

## Accessibility

- ToolCall supplies a named 44px summary, status text and subtle 4px surface.
- Tabs provide a named tablist and labelled panels; hidden panels do not stay in the tab order.
- Output strings are escaped preformatted text and can be read without repeated live announcements.

## Classes

`rs-sandbox`, `rs-sandbox-content`, `rs-sandbox-output`

## Dependencies

Registry dependencies: [tool-call](tool-call.md), [code-block](code-block.md), [tabs](tabs.md).  
React: `packages/react/src/components/sandbox.tsx`  
CSS: `packages/core/css/components/sandbox.css`
