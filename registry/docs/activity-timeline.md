# Activity timeline

Lists timestamped events with actors and optional expandable details.

Category: content  
Name: `activity-timeline`  
Also known as: ActivityTimeline  
Page: https://vlak.dev/components/activity-timeline/

## When to use

- Audit history, project activity, and chronological event records.

## When not to

- Steps toward a goal; use Stepper or TaskProgress.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { ActivityTimeline } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add activity-timeline
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/activity-timeline.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<ol class="rs-activity-timeline"><li class="rs-activity-timeline-event"><time class="rs-activity-timeline-time" datetime="2026-09-05T10:00:00Z">5 September, 10:00</time><div><p class="rs-activity-timeline-title">Revision published</p></div></li></ol>
```

## Example

```tsx
import { ActivityTimeline } from "@noorddev/vlak-react";

<ActivityTimeline events={[{ id: "release", title: "Revision published", dateTime: "2026-09-05T10:00:00Z", actor: "Studio", description: "Updated the vehicle controls", details: "Numeric baselines and playback spacing are now shared." }]} />
```

## Props

### ActivityTimeline

Chronological events in caller-supplied order, with optional native disclosures.

Extends `HTMLAttributes<HTMLOListElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLOListElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `events` (required) | `ActivityEvent[]` |  |  |
| `emptyLabel` | `string` | `"No activity yet"` |  |
| `locale` | `string` | `"en"` |  |
| `timeZone` | `string` | `"UTC"` |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab, Enter, Space | Tab reaches each summary; Enter or Space expands the native disclosure. |

## Accessibility

- An ordered list with machine-readable time elements. Optional details use native disclosure semantics.

## Classes

`rs-activity-timeline`, `rs-activity-timeline-event`, `rs-activity-timeline-time`, `rs-activity-timeline-title`, `rs-activity-timeline-body`, `rs-activity-timeline-summary`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/activity-timeline.tsx`  
CSS: `packages/core/css/components/activity-timeline.css`
