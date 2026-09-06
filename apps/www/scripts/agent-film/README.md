# Vlak agent interface film

A 40-second film of the actual agent management interface from `apps/www/app/interfaces/agents`. It renders `AgentsBoard` with its own `scene.css` and the compiled Vlak React components, including the real queue, detail view, output cards, task form, and action controls.

Task and agent activity shown in the film are local React demo state. Capturing the film does not launch agents or contact an agent backend. The interface itself retains its existing “Local demo” and “Changes stay in this tab” labels.

The film supplies camera composition and deterministic motion around that interface. A film aperture follows the native panel edges during close-ups. It does not recreate buttons, forms, or task cards as imitation controls. The final shot holds the complete board with a Vlak.dev wordmark from 36 seconds through the end.

## Build and render

Run from the repository root with Node 22.6 or newer, the workspace's pnpm version, Chrome, and FFmpeg with H.264/AAC support installed:

```sh
pnpm install
pnpm --filter '@noorddev/vlak-react...' build
node apps/www/scripts/render-agents-film.mjs --proof --stills
node apps/www/scripts/render-agents-film.mjs --sound
```

The proof command writes 960 × 540 checkpoint PNGs and a `vlak-agents-interface-proof-stills.json` report. The final command writes 1920 × 1080 at 30 fps, with a duration of 40 seconds. Its default destination is:

```text
~/Movies/Vlak/agent-assembly/vlak-agents-interface.mp4
```

The render also retains a `-silent.mp4`, a `-score.wav`, selected PNG frames, and a JSON report with render settings and landing cues. All outputs use the `vlak-agents-interface` basename; proof runs add `-proof`.

FFmpeg and the output directory can be selected explicitly:

```sh
VLAK_FFMPEG="/absolute/path/to/ffmpeg" \
VLAK_VIDEO_OUTPUT="$HOME/Movies/Vlak/agent-assembly" \
node apps/www/scripts/render-agents-film.mjs --sound
```

## Story

The opening constructs a large native task from its surface, agent label, number, title, status mark, and arrow. That task docks into the queue. The workspace then builds through individually timed icons, counts, tabs, task rows, activity markers, labels, and action controls. Each later app state uses the same approach, including output files, the progress rail and fill, and the form labels and fields. Before submission, the camera returns to the full board and the queue opens a slot for the new task. The story then uses the interface's actual actions: show a task's output, approve its review, select task 014, pause and resume it, create a task, enter its name and brief, queue it, and start it. Those interactions update the same React state used by the website demo.

The controller is the authority for action and typing timestamps. Camera changes and landing sounds follow the visible interface state; they are not evidence of work by a real agent service.

## Source and sound

- [AgentsBoard](../../app/interfaces/agents/board.tsx) owns the interface and local interaction state.
- [scene.css](../../app/interfaces/agents/scene.css) owns the interface layout and paint.
- [timeline.mjs](timeline.mjs) shares the action times and component contacts with the soundtrack.
- [parts.mjs](parts.mjs) inventories the original native elements for motion and verification.
- [controller.mjs](controller.mjs) performs the real native clicks and controlled text input, and exports their deterministic timing metadata.
- [render-agents-film.mjs](../render-agents-film.mjs) captures and encodes the film.
- [sound.mjs](sound.mjs) maps native actions and shared animation contacts to Cuelume cues.
- [cuelume-offline.mjs](cuelume-offline.mjs) renders the official Web Audio engine offline.

All interaction effects come from [Cuelume 0.2.2](https://cuelume.dev/docs), using its unmodified published recipes and audio engine. The vendored source includes the original [MIT license](vendor/cuelume/LICENSE) and [release integrity metadata](vendor/cuelume/provenance.json). No package installation, runtime download, or sound service is required. This affects the film only; the website's interface remains unchanged.

Cuelume's `tick`, `press`, and `release` cues accompany parts assembling; `toggle` marks tab and pause changes, `success` confirms approval and queueing, and `loading` marks a task starting or resuming. Sparse typing sounds follow actual character insertions. A separate original, quiet two-tone bed sits underneath, with no homemade clicks, impacts, or transition effects.

`sound.mjs` exports `writeScore(file, duration = filmDuration)`, `landingCues`, `actionCues`, `typingCues`, `cuelumeCues`, `soundSource`, and `scoreCuts`. The shared [timeline.mjs](timeline.mjs) sets the 40-second duration and each component's first contact. Native action and character timings derive directly from `agentFilmEvents`. Named cue metadata includes global time, element description, official Cuelume sound name and volume.

The adapter opens headless Chrome and renders the original graphs through `OfflineAudioContext`, including Cuelume's shimmer and shared compressor. It uses a seeded noise stream and schedules cleanup on the audio clock, preserving repeatable timing and noise. Native browser floating-point summation can vary the final PCM bit in an echo tail. Vendored source hashes are verified before each render. The adapter's output was checked against Cuelume's public `play()` for all seventeen cues and matched byte for byte. See the [vendor notes](vendor/cuelume/README.md) for the exact adaptation.

`writeScore` writes a 48 kHz, stereo, 16-bit PCM WAV and resolves to the supplied path. The final MP4 encodes stereo AAC at 192 kbit/s, with loudness normalization targeting −20 LUFS and a −2 dBTP ceiling.

To generate the score independently:

```sh
node apps/www/scripts/agent-film/sound.mjs /tmp/vlak-agents-assembly-score.wav 40
```

Keep motion and landing cues together in the shared timeline. Keep action and character timings in the controller. The film renderer combines the PCM score with the video for the final MP4. Render this revision to `~/Movies/Vlak/agent-assembly` to preserve the earlier film and score.
