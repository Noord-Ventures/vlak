# Vlak interface films

One 40-second, 1920×1080/30 fps film for every interface in the original catalog. The approved agent film is retained; the other twelve use this shared renderer. All surfaces, typography, icons, controls, images and native interactions come from the original React boards and their compiled Vlak components. Film configuration adds reversible transforms, visibility, camera framing and scripted user input. It does not edit or re-create the product components.

## Render

Use the installed workspace dependencies, Node 22.18 or newer, Chrome, and FFmpeg with H.264/AAC support. From the repository root:

```sh
node apps/www/scripts/render-interface-film.mjs press --proof --stills
node apps/www/scripts/render-interface-film.mjs press --sound
```

Replace `press` with `line`, `wall`, `night`, `evening`, `room`, `graphics`, `render`, `drive`, `orbit`, `frontier`, or `platforms`. The existing Agents renderer remains `apps/www/scripts/render-agents-film.mjs --sound`.

`VLAK_FFMPEG` selects the encoder executable; `VLAK_VIDEO_OUTPUT` selects an individual film's destination. By default each new film writes to `~/Movies/Vlak/interface-films/<slug>/`. Each export includes the final H.264/AAC MP4, a silent master, a 48kHz stereo WAV score, checkpoint PNGs, a cover and a JSON render report. `--proof` renders at 960×540, `--stills` renders review checkpoints, and `--limit-frames=N` creates a partial export.

When all masters are complete:

```sh
node apps/www/scripts/interface-films/assemble-collection.mjs
node apps/www/scripts/interface-films/serve-collection.mjs
```

This reads the original interface catalog, decodes all 13 current masters and records their SHA-256 checksums, copies the approved agent film, and creates a portable gallery, manifest and ZIP. It refuses an incomplete, corrupt, or warning-bearing master; FFmpeg must be available for this verification. `VLAK_COLLECTION_OUTPUT` overrides the collection folder; `VLAK_AGENTS_OUTPUT` locates the approved agent export. The local review server supports video byte ranges and defaults to http://127.0.0.1:3115/; `VLAK_VIDEO_PORT` selects another port. The extracted gallery can also be opened directly from its index.html.

## Motion and state

Each configuration in `films/` imports an original `Board` or `ConceptBoard`. The shared runtime constructs a large native component from separately timed surfaces and content, docks it into the original layout, and builds the remaining interface. Native buttons visibly compress before real React events fire. Component arrivals follow the same damped spring as the approved agent film; sound contacts use the curve's first crossing, approximately 195ms after release.

Native input setters and keyboard events preserve the board's controlled state. After assets load, fixture timers and `Date.now()` run on film time, including Line's original 700ms reply timer. Character entry is deterministic. Assertions inspect the actual resulting DOM. Rewinding remounts the original fixture and replays actions. Original CSS animations use film time; the native live WebGL city and external Sketchfab viewer retain their own rendering implementations. The fleet canvas display size is matched to its native container so the offscreen browser’s retina pixel buffer does not crop the city.

Close-ups fade unrelated native branches before camera movement, then restore them after returning. Any action outside a close-up first returns to the full interface so the actual control is visible when pressed. Ellipsis and native scroll clipping remain intact after the opening component docks. Blended illustrations retain their original isolated backing surfaces and native opacity.

## Fidelity and sound

The renderer loads the compiled React/core component CSS, original site reset, shared interface CSS and each board's own scene CSS. All original image assets are decoded before capture. A browser-only `next/dynamic` adapter imports the same original components. The 3D workspace waits for the actual Sketchfab vehicle and fails if it is unavailable; its native attribution remains visible. Only the known third-party accelerometer feature-policy diagnostic is recorded as nonfatal. Original local fixtures remain local demonstrations; no chat, delivery, agent or vehicle backend is contacted.

Sound uses the existing unmodified, MIT-licensed Cuelume 0.2.2 engine and recipes vendored under `../agent-film/vendor/cuelume/`. SHA-256 provenance is checked before each score. The offline renderer executes the original Web Audio graphs at 48kHz stereo. Sounds are scheduled only for present, visible native controls and component contacts, including ancestor clipping. A quiet original tonal bed is mixed underneath. The final AAC mix targets −20LUFS and −2dBTP.

The reports record final states, dispatched events, audible contacts, asset readiness and render settings. Final validation includes native assertions, visual checkpoint review, and a complete FFmpeg decode of each master. Production interface files and generated component CSS are unchanged.
