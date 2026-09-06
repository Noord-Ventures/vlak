# Vlak component film

A deterministic 27-second product film using actual compiled Vlak React components, their shipped CSS and Inter, rendered onto dimensional paper geometry. The opening turns the captured Waveform amplitudes into solid geometry. Ten composed specimens feature 17 of the 40 additions from commit `9b8715e`, plus the existing Sparkline: 18 featured components within a catalog of 114.

The movie is an offline artifact; these scripts do not add a route or a runtime dependency to the website. Output defaults to `~/Movies/Vlak`. Set `VLAK_VIDEO_OUTPUT` for both capture and render to change it. Textures live in its `component-textures` subdirectory; `VLAK_COMPONENT_TEXTURES` overrides that location for both scripts.

```sh
# From the repository root, with workspace dependencies installed, Chrome available,
# and the compiled React package built. FFmpeg needs libx264 and h264_metadata.
pnpm --filter @noorddev/vlak-react build
node apps/www/scripts/components-film/capture.mjs
VLAK_FFMPEG=/path/to/ffmpeg node apps/www/scripts/render-components-video.mjs --proof --stills
VLAK_FFMPEG=/path/to/ffmpeg node apps/www/scripts/render-components-video.mjs --proof
VLAK_FFMPEG=/path/to/ffmpeg node apps/www/scripts/render-components-video.mjs --sound
```

`capture.mjs` writes a manifest and component textures at 2× resolution, with seven card/control fragments at 6× for close-ups. `studio.mjs` builds the physically lit paper studio, and `scene.mjs` controls six deterministic compositions. The master is 1920×1080 at 30 fps, H.264, yuv420p, with explicit Rec.709 metadata and fast-start playback. Proofs are 960×540. Both include review stills. `--stills` writes only review images and metadata; its JSON reports no video file. Metadata separates the 40 new/114 total release counts from the 17 new/18 total featured components.

`--sound` creates an original electronic score through `sound.mjs`, then muxes it as stereo AAC at 192 kbps/48 kHz into the final MP4 without re-encoding the video. Audio normalization targets −18 LUFS, −1.5 dBTP and LRA 9. The completed silent master remains separately available as `*-silent.mp4`, even if soundtrack generation or muxing fails; the original `*-score.wav` is also retained. Omitting `--sound` produces a silent MP4. Still-only mode ignores the sound flag. `sound.mjs` can also run separately with an output WAV path; it uses no third-party samples.

The reported release count refers to the repository's component catalog, not a claim about npm publication. Captures include only selected new components; the title describes the overall release.
