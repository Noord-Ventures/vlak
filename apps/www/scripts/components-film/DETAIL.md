# Vlak, in detail

A 32-second component film built from individually animated, paper-thin geometry. Flat Vlak surfaces, hairlines and printed type move through space with spring settling, inertia and separate layer choreography. It uses no screenshots, screen-shaped texture planes, or third-party scene assets. The earlier captured-panel film remains separately reproducible.

The four chapters show:

- Switch border, fill and thumb layers separating and seating; NumberField buttons stepping a value; two independent RangeSlider rows and Rating stars.
- 128 waveform bars unwinding from a coil, independent scrubber layers, a moving knob and ripples, and thin playback controls pressing and changing state.
- MultiSelect checkboxes and menu rows becoming TagInput tokens, then separate field/operator/value/action controls assembling into a nested QueryBuilder.
- Scheduler headings and event layers assembling, its reschedule controls opening, then cards forming and moving between Kanban columns.

The media chapter uses Vlak's inverse paper/ink palette. The closing wordmark is flat Inter geometry. Individual glyphs settle into place before a brief rough monochrome print finish. The original electronic score has synchronized clicks, button detents, and restrained transitions.

These are motion interpretations of Vlak components, rather than a recording of runtime UI animations. In particular, Scheduler rescheduling is presented through its controls; the later transformation into Kanban is film choreography. The RangeSlider retains the shipped component's two separate rows.

```sh
# From the repository root, with workspace dependencies and Chrome installed.
VLAK_FFMPEG=/path/to/ffmpeg node apps/www/scripts/render-components-detail.mjs --proof --stills
VLAK_FFMPEG=/path/to/ffmpeg node apps/www/scripts/render-components-detail.mjs --proof --sound
VLAK_FFMPEG=/path/to/ffmpeg node apps/www/scripts/render-components-detail.mjs --sound
```

The master is 1920×1080, 30fps, H.264/Rec.709, with fast-start playback and stereo AAC. `--sound` keeps a separate silent master. Output defaults to `~/Movies/Vlak/vlak-components-flat-physics.mp4`; override the directory with `VLAK_VIDEO_OUTPUT`. The new filename preserves earlier `vlak-components-detail.mp4` exports for comparison. `--limit-frames N` renders a separately named partial for diagnosis. Still-only runs write their own metadata instead of overwriting a video's manifest.

`kit.mjs` constructs unbeveled surfaces with at most 0.012 units of thickness, cut-out borders, and correctly kerned Inter at 0.001 units. Surface thickness is independent of flight paths and animated layer separation. `controls.mjs`, `mechanisms.mjs`, `selection.mjs`, and `planning.mjs` hold independent deterministic timelines. `detail-scene.mjs` uses restrained camera angles and keeps type in focus. `studio2.mjs` provides matte diffuse materials, broad lighting, soft shadows and restrained contact occlusion. It renders at twice the output resolution to preserve thin moving borders before browser downsampling. Resting controls return nearly flush; metal rims, keycap bodies and embossed type are absent.

`Inter-580-clean.ttf` is an overlap-cleaned geometry source derived from the repository's Inter580 instance. Browser font rasterizers handle its original overlapping contours correctly, but Three's triangulator requires simple polygon outlines. `clean-film-font.py` regenerates the file using fontTools and skia-pathops; advances and kerning remain unchanged. The original font continues to render the final HTML wordmark. Inter's license is at `packages/core/css/fonts/inter/OFL.txt`.
