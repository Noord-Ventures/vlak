# Task

A default-open task disclosure with supplied item states and file references.

Category: ai  
Name: `task`  
Also known as: Task  
Page: https://vlak.dev/ai/task/

## When to use

- Supply pending, active, and complete items with optional file badges.
- Use children for additional supplied task content.

## When not to

- Expecting this display to run tasks or infer their completion.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { Task } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add task
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/task.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<details class="rs-task" open><summary>Read sources</summary><ul class="rs-task-list"><li class="rs-task-item">Read launch-brief.md</li></ul></details>
```

## Example

```tsx
import { Task } from "@noorddev/vlak-react";

<Task title="Read sources" items={[{ id: "brief", content: "Read the launch brief", state: "complete", file: "launch-brief.md" }]} />
```

## Props

### Task

A default-open task disclosure with supplied rows and file references.

Extends `Omit<DetailsHTMLAttributes<HTMLDetailsElement>, "title">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDetailsElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `ReactNode` |  |  |
| `status` | `ReasoningStatus` |  | Describes application-supplied progress, without generating a thinking trace. |
| `statusLabel` | `string` |  |  |
| `defaultOpen` | `boolean` |  |  |
| `onOpenChange` | `(open: boolean) => void` |  |  |
| `variant` | `"inline" \| "panel"` |  | An inline disclosure for message activity, or a framed panel. |
| `durationMs` | `number` |  | Optional elapsed time supplied by the application, in milliseconds. |
| `measureDuration` | `boolean` |  | Measure this component's streaming interval. Off by default. |
| `autoExpand` | `boolean` |  | Open when a new streaming interval begins. Manual disclosure remains the default. |
| `autoCollapseDelay` | `number \| false` |  | Close once after completion unless the reader manually changed the disclosure. |
| `items` | `readonly TaskItem[]` | `[]` |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves through the supplied native controls in reading order |
| Enter, Space | Activates focused buttons and disclosure summaries |

## Accessibility

- Native attributes, className, style, and the forwarded ref reach the outer element.
- Interactive content requires accessible names; progress text is not announced for every streamed token.

## Classes

`rs-task`, `rs-task-list`, `rs-task-item`, `rs-task-active`, `rs-task-file`

## Dependencies

Registry dependencies: [reasoning](reasoning.md).  
React: `packages/react/src/components/task.tsx`  
CSS: `packages/core/css/components/task.css`
