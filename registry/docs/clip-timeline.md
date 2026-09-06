# Clip timeline

Positions supplied clips within a declared duration, with contained horizontal scrolling, accessible selection, and optional seeking.

Category: creative  
Name: `clip-timeline`  
Also known as: ClipTimeline, Video timeline, Audio timeline, Track timeline, Clip selection, Edit timeline  
Page: https://vlak.dev/components/clip-timeline/

## When to use

- Caller-owned tracks and clips measured explicitly in seconds or whole frames.
- onSelectClip for selection requests and onSeek for a native position control; update the supplied selectedClipId and position.
- Separate rows within each track keep overlapping clips visible without implying an edit.

## When not to

- Expecting drag editing, playback, trimming, or a media backend.
- Hiding invalid or unassigned clips; their text records remain visible.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { ClipTimeline } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add clip-timeline
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/clip-timeline.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-clip-timeline"><p class="rs-clip-timeline-label" id="assembly-label">Assembly</p><p class="rs-clip-timeline-note">0 to 60 seconds</p><div class="rs-clip-timeline-viewport" role="region" aria-labelledby="assembly-label" tabindex="0"><div class="rs-clip-timeline-track"><span>Video</span><div class="rs-clip-timeline-lane" aria-hidden="true"><span class="rs-clip-timeline-clip" style="inset-inline-start:10%;width:30%">Opening</span></div></div></div><ul class="rs-clip-timeline-rows"><li><span>Opening · Video · 6–24 seconds</span></li></ul></div>
```

## Example

```tsx
import { ClipTimeline } from "@noorddev/vlak-react";

<ClipTimeline label="Assembly" duration={60} unit="seconds" tracks={[{ id: "video", label: "Video" }]} clips={[{ id: "opening", trackId: "video", label: "Opening", start: 6, duration: 18 }]} />
```

## Props

### ClipTimeline

Supplied clip positions, with separate reachable selection and seek controls.

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `ReactNode` |  |  |
| `tracks` (required) | `ClipTrack[]` |  |  |
| `clips` (required) | `TimelineClip[]` |  |  |
| `duration` (required) | `number` |  |  |
| `unit` (required) | `"seconds" \| "frames"` |  |  |
| `position` | `number \| null` |  |  |
| `selectedClipId` | `string \| null` |  |  |
| `onSeek` | `(position: number) => void` |  |  |
| `onSelectClip` | `(id: string) => void` |  |  |
| `disabled` | `boolean` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves through the optional seek control, scrollable track region, and selection buttons. |
| Arrow keys, Home, End | Uses native seeking on the range input; arrow keys scroll the focused track region. |
| Enter, Space | Requests selection from a focused clip button. |

## Accessibility

- Clip graphics are decorative and accompanied by complete text records with track, start, end, and unit.
- Every selectable clip has a separate 44px button, including clips whose plotted duration is less than one pixel.
- The horizontal viewport remains inside the component and can receive keyboard focus.
- Invalid duration or clip intervals do not produce misleading geometry; the ref and native attributes reach the root div.

## Classes

`rs-clip-timeline`, `rs-clip-timeline-label`, `rs-clip-timeline-note`, `rs-clip-timeline-seek`, `rs-clip-timeline-range`, `rs-clip-timeline-viewport`, `rs-clip-timeline-track`, `rs-clip-timeline-clips`, `rs-clip-timeline-lane`, `rs-clip-timeline-clip`, `rs-clip-timeline-selected`, `rs-clip-timeline-rows`, `rs-clip-timeline-button`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/clip-timeline.tsx`  
CSS: `packages/core/css/components/clip-timeline.css`
