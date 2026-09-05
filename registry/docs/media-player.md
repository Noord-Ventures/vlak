# Media player

Connects native audio or video to playback, seeking, captions, speed, volume, and full screen.

Category: patterns  
Name: `media-player`  
Also known as: MediaPlayer, Audio player, Video player  
Page: https://vlak.dev/components/media-player/

## When to use

- Playing an actual audio or video source with consistent controls.
- Media with captions and a supplied text transcript.

## When not to

- DRM, adaptive streaming protocols, or a video editing timeline.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { MediaPlayer } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add media-player
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/media-player.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-media-player" role="region" aria-label="Film"><h3 class="rs-media-player-title">Film</h3><video class="rs-media-player-media" controls aria-label="Film"><track kind="captions" src="captions.vtt" srclang="en" label="English" /></video></div>
```

## Example

```tsx
import { MediaPlayer } from "@noorddev/vlak-react";

<MediaPlayer src="/film.mp4" title="A closer look" tracks={[{ src: "/film-en.vtt", srcLang: "en", label: "English", default: true }]} transcript={<p>A text transcript of the film.</p>} />
```

## Props

### MediaPlayer

Native media with Vlak transport, seeking, volume, captions, and recoverable loading errors.

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLMediaElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `src` (required) | `string` |  |  |
| `title` (required) | `string` |  |  |
| `kind` | `"audio" \| "video"` | `"video"` |  |
| `poster` | `string` |  |  |
| `preload` | `"none" \| "metadata" \| "auto"` | `"metadata"` |  |
| `tracks` | `readonly MediaTrack[]` | `[]` |  |
| `transcript` | `ReactNode` |  |  |
| `onPlayingChange` | `(playing: boolean) => void` |  |  |
| `onTimeChange` | `(seconds: number) => void` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab, Shift+Tab | Moves through transport, seeking, volume, speed, captions, and available full-screen actions. |
| Enter, Space | Activates buttons; range and select controls retain native keyboard behavior. |
| Escape | Exits browser full screen. |

## Accessibility

- Native controls remain available before hydration.
- Supply caption tracks for spoken video and a transcript where appropriate.
- Load and play failures are announced; retry preserves access to the player.
- Full screen is shown only when the browser supplies the API.

## Classes

`rs-media-player`, `rs-media-player-media`, `rs-media-player-title`, `rs-media-player-controls`, `rs-media-player-action`, `rs-media-player-volume`, `rs-media-player-status`, `rs-media-player-transcript`, `rs-media-player-summary`

## Dependencies

Registry dependencies: [button](button.md), [icons](icons.md), [slider](slider.md), [native-select](native-select.md), [playback-controls](playback-controls.md), [media-scrubber](media-scrubber.md).  
React: `packages/react/src/components/media-player.tsx`  
CSS: `packages/core/css/components/media-player.css`
