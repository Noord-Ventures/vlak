# Vlak agent interface film

A 34-second film of the actual agent management interface from `apps/www/app/interfaces/agents`. It renders `AgentsBoard` with its own `scene.css` and the compiled Vlak React components, including the real queue, detail view, output cards, task form, and action controls.

Task and agent activity shown in the film are local React demo state. Capturing the film does not launch agents or contact an agent backend. The interface itself retains its existing “Local demo” and “Changes stay in this tab” labels.

The film supplies camera composition and deterministic motion around that interface. A film aperture follows the native panel edges during close-ups. It does not recreate buttons, forms, or task cards as imitation controls. The final shot holds the complete board with a Vlak.dev wordmark from 28.5 seconds through the end.

## Build and render

Run from the repository root with Node 22.6 or newer, the workspace's pnpm version, Chrome, and FFmpeg with H.264/AAC support installed:

```sh
pnpm install
pnpm --filter '@noorddev/vlak-react...' build
node apps/www/scripts/render-agents-film.mjs --proof --stills
node apps/www/scripts/render-agents-film.mjs --sound
```

The proof command writes 960 × 540 checkpoint PNGs and a `vlak-agents-interface-proof-stills.json` report. The final command writes 1920 × 1080 at 30 fps, with a duration of 34 seconds. Its default destination is:

```text
~/Movies/Vlak/vlak-agents-interface.mp4
```

The render also retains a `-silent.mp4`, a `-score.wav`, selected PNG frames, and a JSON report with render settings and landing cues. All outputs use the `vlak-agents-interface` basename; proof runs add `-proof`.

FFmpeg and the output directory can be selected explicitly:

```sh
VLAK_FFMPEG="/absolute/path/to/ffmpeg" \
VLAK_VIDEO_OUTPUT="$HOME/Movies/Vlak" \
node apps/www/scripts/render-agents-film.mjs --sound
```

## Story

The opening assembles the board with a gentle ripple. The story then uses the interface's actual actions: show a task's output, approve its review, select task 014, pause and resume it, create a task, enter its name and brief, queue it, and start it. Those interactions update the same React state used by the website demo.

The controller is the authority for action and typing timestamps. Camera changes and landing sounds follow the visible interface state; they are not evidence of work by a real agent service.

## Source and sound

- [AgentsBoard](../../app/interfaces/agents/board.tsx) owns the interface and local interaction state.
- [scene.css](../../app/interfaces/agents/scene.css) owns the interface layout and paint.
- [controller.mjs](controller.mjs) performs the real native clicks and controlled text input, and exports their deterministic timing metadata.
- [render-agents-film.mjs](../render-agents-film.mjs) captures and encodes the film.
- [sound.mjs](sound.mjs) generates the original restrained score and dry contact sounds.

The score is synthesized locally from deterministic tones and filtered noise. It uses no music samples, external recordings, or synthesis service. Brief, quiet clicks mark actual user actions and component landings; sparse typing sounds follow the controller's character insertions. The bed settles during the final overview.

`sound.mjs` exports `writeScore(file, duration = 34)`, `landingCues`, `actionCues`, `typingCues`, and `scoreCuts`. Named cues expose their global time, element description, gain, and pan so the motion and audio can be reviewed together. Action and typing cues derive directly from the controller's `agentFilmEvents`; typing uses a quiet, sparse subset of actual character insertions. `writeScore` writes a 48 kHz, stereo, 16-bit PCM WAV and resolves to the supplied path. The final MP4 encodes stereo AAC at 192 kbit/s, with loudness normalization targeting −20 LUFS and a −2 dBTP ceiling.

To generate the score independently:

```sh
node apps/www/scripts/agent-film/sound.mjs /tmp/vlak-agents-interface-score.wav 34
```

Keep landing cues synchronized when changing the board's motion. Keep action and character timings synchronized with the controller. The film renderer combines the PCM score with the video for the final MP4.
