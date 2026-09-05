# Task progress

Tracks long-running work with phases, honest progress, cancellation, and retry.

Category: feedback  
Name: `task-progress`  
Also known as: TaskProgress  
Page: https://vlak.dev/components/task-progress/

## When to use

- Exports, uploads, background processing, and recoverable operations.

## When not to

- A brief loading indicator; use Spinner.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { TaskProgress } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add task-progress
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/task-progress.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<section class="rs-task-progress" aria-label="Exporting study"><h2 class="rs-task-progress-title">Exporting study</h2><p role="status">In progress</p><progress class="rs-task-progress-bar" aria-label="Export progress" max="100" value="42"></progress></section>
```

## Example

```tsx
import { TaskProgress } from "@noorddev/vlak-react";

<TaskProgress label="Exporting study" state="running" value={42} elapsedSeconds={12} phases={[{ id: "prepare", label: "Prepare", state: "complete" }, { id: "render", label: "Render", state: "active" }, { id: "package", label: "Package", state: "pending" }]} />
```

## Props

### TaskProgress

Honest long-running task state, including unknown progress and action failures.

Extends `HTMLAttributes<HTMLElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `string` |  |  |
| `state` (required) | `TaskState` |  |  |
| `value` | `number` |  | Percentage, omit while the amount of work is unknown. |
| `phases` | `TaskPhase[]` | `[]` |  |
| `description` | `ReactNode` |  |  |
| `elapsedSeconds` | `number` |  |  |
| `remainingSeconds` | `number` |  |  |
| `onCancel` | `() => void \| Promise<void>` |  |  |
| `onRetry` | `() => void \| Promise<void>` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab, Enter, Space | Tab reaches cancel or retry when supplied; Enter or Space invokes the callback. |

## Accessibility

- Native progress supports unknown completion when value is omitted. State changes are announced, elapsed seconds are not repeatedly announced.

## Classes

`rs-task-progress`, `rs-task-progress-title`, `rs-task-progress-bar`, `rs-task-progress-detail`, `rs-task-progress-phases`, `rs-task-progress-phase`, `rs-task-progress-actions`

## Dependencies

Registry dependencies: [button](button.md).  
React: `packages/react/src/components/task-progress.tsx`  
CSS: `packages/core/css/components/task-progress.css`
