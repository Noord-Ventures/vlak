# Sleep timeline

Displays supplied sleep, wake, and unknown intervals with explicit time labels, monochrome segments, and a complete text record.

Category: health  
Name: `sleep-timeline`  
Also known as: SleepTimeline, Sleep log, Sleep chart, Sleep interval, Sleep record, Wellness timeline  
Page: https://vlak.dev/components/sleep-timeline/

## When to use

- Display-only sleep records from a caller-owned source, using minute offsets on a single timeline.
- Explicit boundary labels that include the date and timezone when needed.
- Gaps remain unrecorded; supplied unknown intervals retain their unknown state.

## When not to

- Inferring sleep stages, diagnosis, or sleep quality from the supplied intervals.
- Silently clipping out-of-window records, merging overlaps, or filling missing time with sleep.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { SleepTimeline } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add sleep-timeline
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/sleep-timeline.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<figure class="rs-sleep-timeline"><figcaption class="rs-sleep-timeline-caption"><span class="rs-sleep-timeline-label">Last night</span></figcaption><div class="rs-sleep-timeline-chart" aria-hidden="true"><span class="rs-sleep-timeline-segment rs-sleep-timeline-asleep" style="width:75%"></span><span class="rs-sleep-timeline-segment rs-sleep-timeline-awake" style="width:25%"></span></div><div class="rs-sleep-timeline-axis"><span>22:30</span><span>06:30</span></div><ul class="rs-sleep-timeline-list"><li class="rs-sleep-timeline-interval"><span>Asleep</span><span class="rs-sleep-timeline-period">22:30 to 04:30</span></li><li class="rs-sleep-timeline-interval"><span>Awake</span><span class="rs-sleep-timeline-period">04:30 to 06:30</span></li></ul></figure>
```

## Example

```tsx
import { SleepTimeline } from "@noorddev/vlak-react";

<SleepTimeline label="Last night" description="Recorded intervals, local time" start={0} end={480} startLabel="22:30" endLabel="06:30" intervals={[
  { id: "sleep-1", start: 0, end: 240, startLabel: "22:30", endLabel: "02:30", state: "asleep" },
  { id: "wake-1", start: 240, end: 255, startLabel: "02:30", endLabel: "02:45", state: "awake" },
  { id: "sleep-2", start: 270, end: 480, startLabel: "03:00", endLabel: "06:30", state: "asleep" },
]} />
```

## Props

### SleepTimeline

Supplied sleep and wake intervals, with gaps exposed as unrecorded time.

Extends `HTMLAttributes<HTMLElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `ReactNode` |  |  |
| `description` | `ReactNode` |  |  |
| `intervals` (required) | `SleepInterval[]` |  |  |
| `start` (required) | `number` |  | Visible window in minutes. All intervals must fit within it. |
| `end` (required) | `number` |  |  |
| `startLabel` (required) | `string` |  |  |
| `endLabel` (required) | `string` |  |  |

## Accessibility

- A native figure and caption introduce the record. The decorative chart is hidden from assistive technology.
- Every supplied interval and unrecorded gap has a visible text equivalent with start and end labels.
- Overlapping, invalid, or out-of-window intervals produce a visible explanation and suppress the chart while preserving supplied text.
- Sleep, wake, and unknown segments use distinct monochrome fills and boundaries; forced-colors retains a dotted unknown marker.
- The forwarded ref and native attributes reach the figure.

## Classes

`rs-sleep-timeline`, `rs-sleep-timeline-caption`, `rs-sleep-timeline-label`, `rs-sleep-timeline-description`, `rs-sleep-timeline-chart`, `rs-sleep-timeline-segment`, `rs-sleep-timeline-asleep`, `rs-sleep-timeline-awake`, `rs-sleep-timeline-unknown`, `rs-sleep-timeline-axis`, `rs-sleep-timeline-list`, `rs-sleep-timeline-interval`, `rs-sleep-timeline-period`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/sleep-timeline.tsx`  
CSS: `packages/core/css/components/sleep-timeline.css`
