# Media scrubber

Seeks through media in seconds with elapsed time, buffering, chapters, and optional previews.

Category: forms  
Name: `media-scrubber`  
Also known as: MediaScrubber, Seek bar, Media timeline  
Page: https://vlak.dev/components/media-scrubber/

## When to use

- A media timeline where values are seconds.
- Chapter navigation or supplied thumbnail previews.

## When not to

- An arbitrary numeric setting; use Slider.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { formatMediaTime, MediaScrubber } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add media-scrubber
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/media-scrubber.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-media-scrubber"><input type="range" min="0" max="240" value="42" aria-label="Playback position" aria-valuetext="0:42 of 4:00" /><div class="rs-media-scrubber-times"><span>0:42</span><span>4:00</span></div></div>
```

## Example

```tsx
import { MediaScrubber } from "@noorddev/vlak-react";

<MediaScrubber value={position} duration={240} buffered={180} onValueChange={setPosition} chapters={[{ time: 0, label: "Opening" }, { time: 90, label: "The detail" }]} />
```

## Props

### MediaScrubber

A native range in seconds with elapsed and total time. The input remains a 44px target.

Extends `Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "defaultValue" | "onChange">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLInputElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `duration` (required) | `number` |  |  |
| `label` | `string` | `"Playback position"` |  |
| `showTime` | `boolean` | `true` |  |
| `buffered` | `number` | `0` | Last buffered second. |
| `chapters` | `readonly MediaChapter[]` | `[]` |  |
| `preview` | `(seconds: number) => ReactNode` |  | Thumbnail or other visual preview for the pointed or focused second. |
| `value` | `number` |  |  |
| `defaultValue` | `number` | `0` |  |
| `step` | `number` | `1` |  |
| `onValueChange` | `(value: number) => void` |  |  |

### Functions

- `formatMediaTime` (function): Elapsed media time, including hours when needed. Invalid duration is displayed as zero.

## Keyboard

| Keys | Does |
| --- | --- |
| Arrow keys, Home, End | Uses the native range input to seek within the duration. |
| Tab | Moves to the optional native chapter selector; selecting a chapter seeks to its start. |

## Accessibility

- The range announces elapsed and total time with aria-valuetext.
- Unknown or invalid duration disables seeking.
- Previews are visual supplements; the native range supplies the equivalent position text.

## Classes

`rs-media-scrubber`, `rs-media-scrubber-times`, `rs-media-scrubber-track`, `rs-media-scrubber-rail`, `rs-media-scrubber-buffered`, `rs-media-scrubber-slider`, `rs-media-scrubber-preview`, `rs-media-scrubber-chapters`

## Dependencies

Registry dependencies: [slider](slider.md), [native-select](native-select.md).  
React: `packages/react/src/components/media-scrubber.tsx`  
CSS: `packages/core/css/components/media-scrubber.css`
