# Playback controls

Groups named play, pause, previous, next, and stop controls with 44px targets.

Category: actions  
Name: `playback-controls`  
Also known as: PlaybackControls, Transport controls, Media controls  
Page: https://vlak.dev/components/playback-controls/

## When to use

- Transport controls beside media metadata or inside a player.
- Custom previous and next labels when actions restart or seek.

## When not to

- A media source by itself; use MediaPlayer to bind to audio or video.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { PlaybackControls } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add playback-controls
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/playback-controls.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-playback-controls" role="group" aria-label="Playback controls"><button class="rs-btn-primary rs-playback-action" type="button" aria-label="Play">Play</button></div>
```

## Example

```tsx
import { PlaybackControls } from "@noorddev/vlak-react";

<PlaybackControls playing={playing} onPlayingChange={setPlaying} onPrevious={restartTrack} previousLabel="Restart track" onNext={skipAhead} nextLabel="Skip ahead" />
```

## Props

### PlaybackControls

Named, keyboard-operable transport buttons. Playback state may be owned by a media element.

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `playing` | `boolean` |  |  |
| `defaultPlaying` | `boolean` | `false` |  |
| `onPlayingChange` | `(playing: boolean) => void` |  |  |
| `onPrevious` | `() => void` |  |  |
| `onNext` | `() => void` |  |  |
| `onStop` | `() => void` |  |  |
| `disabled` | `boolean` | `false` |  |
| `previousDisabled` | `boolean` | `false` |  |
| `nextDisabled` | `boolean` | `false` |  |
| `previousLabel` | `string` | `"Previous track"` |  |
| `nextLabel` | `string` | `"Next track"` |  |
| `label` | `string` | `"Playback controls"` |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab, Shift+Tab | Moves between enabled transport buttons. |
| Enter, Space | Activates the focused transport action. |

## Accessibility

- Every icon button has a state-aware accessible name.
- Optional previous, next, and stop actions render only when supplied.
- The containing group has a customisable label; disabled actions use native disabled buttons.

## Classes

`rs-playback-controls`, `rs-playback-action`

## Dependencies

Registry dependencies: [button](button.md), [icons](icons.md).  
React: `packages/react/src/components/playback-controls.tsx`  
CSS: `packages/core/css/components/playback-controls.css`
