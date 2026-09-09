# Audio player

Native audio playback for remote files and generated speech, with composable controls, bounded skip seeking, volume, and recoverable errors.

Category: ai  
Name: `audio-player`  
Also known as: AI Elements Audio Player, Generated speech, AudioPlayerControls, Speech playback  
Page: https://vlak.dev/ai/audio-player/

## When to use

- Supply src for a file or data with base64 and an audio mediaType for generated speech.
- The default controls support play, pause, skip backward and forward, seeking, mute, and volume.
- Replace children with AudioPlayerControls or application controls using useAudioPlayer inside the player.
- Supply a readable transcript for spoken content. Provider generation and authorization remain application-owned.
- The forwarded ref reaches the native audio element; onTimeChange can synchronize Transcription.
- Source changes stop the old element and discard stale playback results. CSS-only markup uses native audio controls.

## When not to

- Autoplaying generated speech without user activation.
- Treating this component as a speech generation API.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { AudioPlayer, AudioPlayerControls, useAudioPlayer } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add audio-player
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/audio-player.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-audio-player" role="region" aria-label="Spoken brief"><h3 class="rs-audio-player-heading">Spoken brief</h3><audio controls aria-label="Spoken brief" src="/brief.wav"></audio><p class="rs-audio-player-transcript">The brief is ready for review.</p></div>
```

## Example

```tsx
import { AudioPlayer, AudioPlayerControls, type GeneratedSpeechAudio } from "@noorddev/vlak-react";

export function SpokenBrief({ speech, transcript }: { speech: GeneratedSpeechAudio; transcript: string }) {
  return <AudioPlayer title="Spoken brief" data={speech} transcript={transcript}>
    <AudioPlayerControls seekOffset={5} />
  </AudioPlayer>;
}
```

## Props

### AudioPlayer

Native audio for URLs or generated speech, with replaceable controls and explicit media ownership.

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLAudioElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` (required) | `string` |  |  |
| `src` | `string` |  |  |
| `data` | `GeneratedSpeechAudio` |  |  |
| `transcript` | `ReactNode` |  |  |
| `preload` | `"none" \| "metadata" \| "auto"` | `"metadata"` |  |
| `onTimeChange` | `(seconds: number) => void` |  |  |
| `onPlayingChange` | `(playing: boolean) => void` |  |  |

### AudioPlayerControls

Default transport, bounded skip seeking and volume; replace or compose with useAudioPlayer.

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `seekOffset` | `number` | `10` |  |
| `disabled` | `boolean` | `false` |  |

### Functions

- `useAudioPlayer` (hook): Access the native media controller from controls nested inside AudioPlayer.

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves through playback, seeking, and volume controls |
| Enter, Space | Activates playback, skip, mute, or retry |
| Arrow keys, Home, End | Adjusts the focused native seek or volume range |

## Accessibility

- The player is a region named by its title, and icon buttons have explicit accessible labels and 44px targets.
- Playback failures use a status region and permit retry. Native events own playback state.
- The subtle 1px frame uses 4px corners; focus and forced-colors controls retain distinct outlines.

## Classes

`rs-audio-player`, `rs-audio-player-heading`, `rs-audio-player-controls`, `rs-audio-player-row`, `rs-audio-player-volume`, `rs-audio-player-status`, `rs-audio-player-transcript`

## Dependencies

Registry dependencies: [button](button.md), [button-group](button-group.md), [slider](slider.md), [media-scrubber](media-scrubber.md), [icons](icons.md).  
React: `packages/react/src/components/audio-player.tsx`  
CSS: `packages/core/css/components/audio-player.css`
