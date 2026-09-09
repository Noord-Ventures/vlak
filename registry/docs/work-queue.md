# Work queue

Collapsible prompt and todo sections with completion counts, attachments, and item actions.

Category: ai  
Name: `work-queue`  
Also known as: AI Elements Queue, Prompt queue  
Page: https://vlak.dev/ai/work-queue/

## When to use

- Group queued prompts and todo items in sections with stable ids.
- Supply onItemCheckedChange to make completion interactive; the supplied items remain authoritative.
- Use attachments and actions slots for each item. The component displays counts from supplied completion state.

## When not to

- Using a queue display to schedule or execute work.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { WorkQueue } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add work-queue
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/work-queue.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<section class="rs-work-queue" aria-label="Work queue"><details class="rs-work-queue-section" open><summary>Next steps, 0 of 1 complete</summary><ul class="rs-work-queue-list"><li class="rs-work-queue-item">Review the brief</li></ul></details></section>
```

## Example

```tsx
"use client";
import { useState } from "react";
import { WorkQueue } from "@noorddev/vlak-react";

export function ReviewQueue() {
  const [completed, setCompleted] = useState(false);
  return <WorkQueue sections={[{ id: "todos", title: "Next steps", items: [
    { id: "review", content: "Review the brief", completed },
  ] }]} onItemCheckedChange={(_sectionId, _itemId, checked) => setCompleted(checked)} />;
}
```

## Props

### WorkQueue

Supplied prompt and todo sections. Checking a row requests a change; the application owns scheduling.

Extends `HTMLAttributes<HTMLElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `sections` (required) | `readonly WorkQueueSection[]` |  |  |
| `label` | `string` | `"Work queue"` |  |
| `onItemCheckedChange` | `(sectionId: string, itemId: string, checked: boolean) => void` |  |  |
| `emptyMessage` | `ReactNode` | `"Nothing queued."` |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves through the supplied native controls in reading order |
| Enter, Space | Activates focused buttons and disclosure summaries |

## Accessibility

- Native attributes, className, style, and the forwarded ref reach the outer element.
- Interactive content requires accessible names; progress text is not announced for every streamed token.

## Classes

`rs-work-queue`, `rs-work-queue-section`, `rs-work-queue-list`, `rs-work-queue-item`, `rs-work-queue-row`, `rs-work-queue-content`, `rs-work-queue-complete`, `rs-work-queue-actions`, `rs-work-queue-detail`

## Dependencies

Registry dependencies: [reasoning](reasoning.md), [checkbox](checkbox.md).  
React: `packages/react/src/components/work-queue.tsx`  
CSS: `packages/core/css/components/work-queue.css`
