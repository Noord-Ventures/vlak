# Vlak, in detail

A 32-second component film built from individually animated solid geometry. It uses no screenshots, screen-shaped texture planes, or third-party scene assets. The earlier captured-panel film remains separately reproducible.

The four chapters show:

- Switch border, fill, thumb and cap layers separating and seating; NumberField buttons stepping a value; two independent RangeSlider rows and Rating stars.
- 128 waveform bars unwinding from a coil, independent scrubber layers, a moving knob and ripples, and stacked playback controls pressing and changing state.
- MultiSelect checkboxes and menu rows becoming TagInput tokens, then separate field/operator/value/action controls assembling into a nested QueryBuilder.
- Scheduler headings and event layers assembling, its reschedule controls opening, then cards forming and moving between Kanban columns.

The media chapter uses Vlak's inverse paper/ink palette. The closing wordmark is actual extruded Inter. Individual glyphs settle into place before a brief rough monochrome print finish. The original electronic score has synchronized clicks, button detents, and restrained transitions.

These are motion interpretations of Vlak components, rather than a recording of runtime UI animations. In particular, Scheduler rescheduling is presented through its controls; the later transformation into Kanban is film choreography. The RangeSlider retains the shipped component's two separate rows.

```sh
# From the repository root, with workspace dependencies and Chrome installed.
VLAK_FFMPEG=/path/to/ffmpeg node apps/www/scripts/render-components-detail.mjs --proof --stills
VLAK_FFMPEG=/path/to/ffmpeg node apps/www/scripts/render-components-detail.mjs --proof --sound
VLAK_FFMPEG=/path/to/ffmpeg node apps/www/scripts/render-components-detail.mjs --sound
```

The master is 1920×1080, 30fps, H.264/Rec.709, with fast-start playback and stereo AAC. `--sound` keeps a separate silent master. Output defaults to `~/Movies/Vlak`; override it with `VLAK_VIDEO_OUTPUT`. `--limit-frames N` renders a separately named partial for diagnosis. Still-only runs write their own metadata instead of overwriting a video's manifest.

`kit.mjs` constructs beveled solids, cut-out borders, and correctly kerned Inter geometry. `controls.mjs`, `mechanisms.mjs`, `selection.mjs`, and `planning.mjs` hold independent deterministic timelines. `detail-scene.mjs` controls camera, focus, and the final assembly. `studio2.mjs` provides physical lighting, soft shadows, contact occlusion, and selective depth of field.

`Inter-580-clean.ttf` is an overlap-cleaned geometry source derived from the repository's Inter580 instance. Browser font rasterizers handle its original overlapping contours correctly, but Three's triangulator requires simple polygon outlines. `clean-film-font.py` regenerates the file using fontTools and skia-pathops; advances and kerning remain unchanged. The original font continues to render the final HTML wordmark. Inter's license is at `packages/core/css/fonts/inter/OFL.txt`.
