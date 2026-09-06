# Render queue

Displays supplied export jobs, progress, and status with explicit cancel and retry callbacks for a connected renderer.

Category: creative  
Name: `render-queue`  
Also known as: RenderQueue, Export queue, Encoding queue, Render jobs, Export progress  
Page: https://vlak.dev/components/render-queue/

## When to use

- Renderer-owned jobs with queued, rendering, complete, failed, or canceled status.
- onCancel for active jobs and onRetry for failed or canceled jobs; the host owns the resulting status.
- Known percentages from zero through 100; missing progress remains explicitly unreported.

## When not to

- Simulating render progress or success without a backend result.
- Displaying cancel or retry controls when there is no callback to handle them.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { RenderQueue } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add render-queue
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/render-queue.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-render-queue"><p class="rs-render-queue-label">Exports</p><ul class="rs-render-queue-list"><li class="rs-render-queue-job"><div class="rs-render-queue-header"><span>Film master</span><span>Rendering</span></div><progress class="rs-render-queue-progress" value="42" max="100" aria-label="Film master progress">42%</progress><p class="rs-render-queue-note">42%</p></li></ul></div>
```

## Example

```tsx
import { RenderQueue } from "@noorddev/vlak-react";

<RenderQueue label="Exports" jobs={[{ id: "master", label: "Film master", status: "rendering", progress: 42, detail: "ProRes master" }, { id: "preview", label: "Review copy", status: "queued" }]} />
```

## Props

### RenderQueue

Host-owned render jobs and available cancel or retry actions.

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `ReactNode` |  |  |
| `jobs` (required) | `RenderJob[]` |  |  |
| `onCancel` | `(id: string) => void` |  |  |
| `onRetry` | `(id: string) => void` |  |  |
| `disabled` | `boolean` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves through available cancel and retry buttons. |
| Enter, Space | Requests the focused job action without changing the supplied job state. |

## Accessibility

- Job labels and statuses remain text; determinate native progress is named per job.
- Missing or invalid progress has an explicit text state and never emits NaN or an invented percentage.
- Actions have job-specific names, 44px targets, and disabled support.
- The ref and native attributes reach the root div.

## Classes

`rs-render-queue`, `rs-render-queue-label`, `rs-render-queue-list`, `rs-render-queue-job`, `rs-render-queue-header`, `rs-render-queue-note`, `rs-render-queue-progress`, `rs-render-queue-action`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/render-queue.tsx`  
CSS: `packages/core/css/components/render-queue.css`
