# Vlak components, in motion

A 35-second film of twelve actual `@noorddev/vlak-react` exports. React renders the controls, and Chrome animates their DOM nodes with deterministic CSS transforms. The package's compiled stylesheet and bundled fonts supply the component paint: labels, borders, icons, native inputs, and layout.

Film-specific code supplies the composition, perspective, motion, component names, wordmark, and final grid. It does not redraw controls or use screenshot plates. This film features the twelve components below, rather than the entire Vlak catalog.

## Build and render

Run from the repository root. Requirements are Node 22.6 or newer, the workspace's pnpm version, installed Chrome, and FFmpeg with `libx264` and AAC support.

```sh
pnpm install
pnpm --filter '@noorddev/vlak-react...' build
```

The package build includes its workspace dependency and produces the compiled React exports, CSS, and fonts used by the film. Rebuild after changing component leaves or package paint.

Render the checkpoint stills at 960 × 540:

```sh
node apps/www/scripts/render-components-exact.mjs --proof --stills
```

Render the full 35-second film at 1920 × 1080, 30 fps, with sound:

```sh
node apps/www/scripts/render-components-exact.mjs --sound
```

The renderer bundles the film entry with the installed esbuild, starts a temporary loopback server, opens headless Chrome, and evaluates `window.film.step(frame)` for each of the 1,050 frames. Chrome uses a device scale factor of two; captures are reduced to the requested output dimensions. FFmpeg encodes H.264 High Profile MP4 with `yuv420p`, BT.709 metadata, and fast-start playback. Sound is muxed as 48 kHz stereo AAC at 192 kbit/s.

FFmpeg defaults to `ffmpeg` on `PATH`. Override the binary and output directory when needed:

```sh
VLAK_FFMPEG="/absolute/path/to/ffmpeg" \
VLAK_VIDEO_OUTPUT="$HOME/Movies/Vlak" \
node apps/www/scripts/render-components-exact.mjs --sound
```

Omit `--sound` for a silent film. `--limit-frames 90` renders the first three seconds and adds `-partial` to the basename; combine it with `--proof` for a quick encoding check.

## Components and sequence

| Chapter start | Actual exports |
| --- | --- |
| 0 s | `Switch`, `NumberField`, `RangeSlider`, `Rating` |
| 6 s | `Waveform`, `PlaybackControls`, `MediaScrubber` |
| 12.5 s | `MultiSelect`, `TagInput`, `QueryBuilder` |
| 19 s | `Scheduler`, `KanbanBoard` |
| 26 s | All twelve in a four-column, three-row overview |

The film changes real component props and native state: the switch checks, the number reaches 204, range values move, playback and progress change, selected topics become tags and query rules, and planning fixtures update. The overview retains the canonical components and their completed states through the end of the film.

The scheduling chapter opens `Scheduler`'s own reschedule dialog and edits its native date and time inputs. The fixture moves **Layout review** from 9 September 2026, 09:00–10:00 UTC, to 10 September, 11:30–12:30 UTC, preserving its duration. The Kanban fixture moves **Type study** to **In progress** and **Motion study** to **Planned**. These are application fixtures around the exported components, not replacement forms or cards.

## Source files

- [render-components-exact.mjs](../render-components-exact.mjs): bundling, temporary server, Chrome capture, encoding, sound mux, and output manifests.
- [capture/exact-film.jsx](capture/exact-film.jsx): composition, deterministic DOM motion, native dialog coordination, and overview placement.
- [capture/specimens-exact.jsx](capture/specimens-exact.jsx): the twelve exported components, their props, and the component catalog.
- [capture/planning-exact.jsx](capture/planning-exact.jsx): controlled scheduling and Kanban fixtures.
- [capture/planning-motion.mjs](capture/planning-motion.mjs): measured movement of the actual Kanban cards between their native column positions.
- [exact-sound.mjs](exact-sound.mjs): deterministic original synthesis and documented contact times.

Frame time is `frame / 30`. Motion is evaluated from that time instead of accumulating a physics simulation. Modified inline motion styles are restored before the next frame. The renderer fixes locale to `en-GB`, timezone to UTC, and disables incidental package motion with reduced-motion preferences; the film's explicit transforms remain under the frame clock.

The component wrappers use CSS zoom and an equal inverse camera scale, with extra density for the opening Switch macro. This raises the browser's paint resolution without changing the components' dimensions, proportions, or stylesheet. The native top-layer dialog compensates for the same inherited zoom.

## Sound and contact timing

`exact-sound.mjs` exports:

- `writeScore(file, duration = 35)`: writes a deterministic 48 kHz, stereo, 16-bit PCM WAV and resolves to its path.
- `scoreCuts`: global chapter boundaries used for restrained transition swells.
- `landingCues`: named contact events with `time`, `component`, `gain`, and `pan`.
- `landingCueTimes`: the sorted numeric contact times for review or metadata.

The short, dry landing clicks are separate from presses and controlled state changes. Cue times follow the DOM animation's first spring contact, including the slower whole-host and overview arrivals. Minor waveform groups and labels have quieter cues; each overview tile has an individual landing click. Synthesis uses no external recordings or music samples. The ending bed resolves gently while the grid remains visible.

The standard spring reaches its first contact after:

```js
const contact = (Math.PI / 2 + Math.atan(0.4)) / 10;
```

Overview contact times follow the film's component catalog order:

```js
26.55 + (index === 11 ? 0 : index + 1) * 0.085 + contact / 0.8
```

Kanban lands first, followed by the other eleven components. When changing selectors, entry delays, playback presses, or dialog timing, update the named cues alongside the motion. The audio mux targets −20 LUFS, a −2 dBTP ceiling, and a 9 LU loudness range; those are normalization targets rather than a claim that every export reaches the ceiling.

Generate the standalone score for review:

```sh
node apps/www/scripts/components-film/exact-sound.mjs /tmp/vlak-components-exact-score.wav 35
```

## Outputs

The default directory is `~/Movies/Vlak`. A full render with `--sound` writes:

| File | Contents |
| --- | --- |
| `vlak-components-exact.mp4` | Final film with sound |
| `vlak-components-exact-silent.mp4` | Silent video master |
| `vlak-components-exact-score.wav` | Original PCM score before mux normalization |
| `vlak-components-exact.json` | Dimensions, duration, component stats, audio settings, and review-frame paths |
| `vlak-components-exact-FFFF.png` | Checkpoint image; `FFFF` is the zero-padded frame number |
| `vlak-components-exact-cover.png` | Last checkpoint image, showing the completed grid |

Proof outputs add `-proof` to the basename. A stills-only run writes checkpoint PNGs, a cover, and `vlak-components-exact-proof-stills.json`; it does not encode an MP4. Other film renderers and their output basenames remain separate.
