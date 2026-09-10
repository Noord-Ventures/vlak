# Transcription

Displays timestamped speech segments, highlights playback time, and optionally seeks a player through accessible phrase controls.

Category: ai  
Name: `transcription`  
Also known as: AI Elements Transcription, Timed transcript, Speech segments, Transcript seek  
Page: https://vlak.dev/ai/transcription/

[AI component index](https://vlak.dev/docs/ai-index.md) · [Integration guide](https://vlak.dev/docs/ai.md) · [AI Elements feature coverage](https://vlak.dev/docs/ai-parity.md)

## When to use

- Supply stable segment ids, text and finite non-negative timestamps in seconds.
- currentTime controls highlighting. Only activating a segment invokes onSeek; playback updates never trigger seek feedback loops.
- Without onSeek the transcript is noninteractive text. Empty or invalid segments are omitted.
- autoScroll is off by default. When enabled it follows active text until the reader scrolls or interacts, then offers Follow transcript.
- CSS-only markup displays supplied text and states; synchronization requires application code.

## When not to

- Treating supplied text as a live transcription service.
- Forcing the viewport back to the active phrase after the reader scrolls away.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { Transcription } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add transcription
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/transcription.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-transcription"><div class="rs-transcription-viewport" role="group" aria-label="Transcript" tabindex="0"><ol class="rs-transcription-list"><li><div class="rs-transcription-segment rs-transcription-active" aria-current="true"><span class="rs-transcription-time">0:00</span><span>The brief is ready for review.</span></div></li></ol></div></div>
```

## Example

```tsx
"use client";
import { useRef, useState } from "react";
import { Transcription } from "@noorddev/vlak-react";

export function TimedTranscript({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [time, setTime] = useState(0);
  return <>
    <audio ref={audioRef} src={src} controls aria-label="Spoken brief" onTimeUpdate={event => setTime(event.currentTarget.currentTime)} />
    <Transcription currentTime={time} onSeek={seconds => {
      if (audioRef.current) audioRef.current.currentTime = seconds;
    }} segments={[
      { id: "opening", startSecond: 0, endSecond: 4, speaker: "Mina", text: "The brief is ready for review." },
      { id: "next", startSecond: 4, endSecond: 8, text: "Each decision has an owner and a next step." },
    ]} />
  </>;
}
```

## Props

### Transcription

Supplied timed text. Playback remains application-owned; only activation requests a seek.

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `segments` (required) | `readonly TranscriptionSegment[]` |  |  |
| `currentTime` | `number` | `0` |  |
| `onSeek` | `(seconds: number) => void` |  |  |
| `label` | `string` | `"Transcript"` |  |
| `autoScroll` | `boolean` | `false` | Follow active text until the reader scrolls. Off by default. |
| `maxHeight` | `string \| number` | `"24rem"` |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Reaches the transcript region and optional phrase seek controls |
| Arrow keys, Page Up, Page Down, Home, End | Scrolls the focused region and pauses automatic following |
| Enter, Space | Seeks to the focused phrase or resumes following |

## Accessibility

- A named region contains an ordered list, timestamps and optional speaker labels.
- Active text exposes aria-current and a full selected fill. Seek buttons have 44px minimum height and visible focus.
- Following moves only this transcript's scroll position; it never steals focus or announces each playback tick.

## Classes

`rs-transcription`, `rs-transcription-viewport`, `rs-transcription-list`, `rs-transcription-segment`, `rs-transcription-interactive`, `rs-transcription-active`, `rs-transcription-time`, `rs-transcription-speaker`, `rs-transcription-empty`

## Dependencies

Registry dependencies: [button](button.md), [media-scrubber](media-scrubber.md).  
React: `packages/react/src/components/transcription.tsx`  
CSS: `packages/core/css/components/transcription.css`
