# Vlak interface films

One 40-second, 1920×1080/30 fps film for every interface in the original catalog, presented inside a shared faux browser window. The agent film retains its approved choreography and sound; the other twelve use this shared renderer. All surfaces, typography, icons, controls, images and native interactions come from the original React boards and their compiled Vlak components. Film configuration adds reversible transforms, visibility, camera framing and scripted user input. It does not edit or re-create the product components.

## Render

Use the installed workspace dependencies, Node 22.18 or newer, Chrome, and FFmpeg with H.264/AAC support. From the repository root:

```sh
node apps/www/scripts/render-interface-film.mjs press --proof --stills
node apps/www/scripts/render-interface-film.mjs press --sound
```

Replace `press` with `line`, `wall`, `night`, `evening`, `room`, `graphics`, `render`, `drive`, `orbit`, `frontier`, or `platforms`. The existing Agents renderer remains `apps/www/scripts/render-agents-film.mjs --sound`.

`VLAK_FFMPEG` selects the encoder executable; `VLAK_VIDEO_OUTPUT` selects an individual film's destination. Every renderer, including Agents, defaults to `~/Movies/Vlak/interface-films/<slug>/`. Each export includes the final H.264/AAC MP4, a silent master, a 48kHz stereo WAV score, checkpoint PNGs, a cover and a JSON render report. `--proof` renders at 960×540, `--stills` renders review checkpoints, and `--limit-frames=N` creates a partial export. Use a separate destination such as `~/Movies/Vlak/browser-films/<slug>/` while reviewing replacement masters.

When all masters are complete:

```sh
node apps/www/scripts/interface-films/assemble-collection.mjs
node apps/www/scripts/interface-films/serve-collection.mjs
```

This reads the original interface catalog, decodes all 13 current masters and records their SHA-256 checksums, then creates a portable gallery, manifest and ZIP. Every master, including Agents, must already be present with browser-frame metadata. The assembler never substitutes the old `agent-assembly` export. It refuses an incomplete, corrupt, unframed, or warning-bearing master; FFmpeg must be available for verification.

To publish an entire reviewed staging collection:

```sh
VLAK_COLLECTION_STAGING="$HOME/Movies/Vlak/browser-films" node apps/www/scripts/interface-films/assemble-collection.mjs
```

All 13 staged masters are verified before any served film is replaced. Export files are replaced atomically, companion report paths are relocated to the collection, and existing gallery assets and other review artifacts are retained. When replacing the original unframed collection, its ZIP is preserved as `Vlak-interface-films-unframed.zip`; the new portable ZIP is built separately and moved into place. `VLAK_COLLECTION_OUTPUT` overrides the collection folder. The local review server supports video byte ranges and defaults to http://127.0.0.1:3115/; `VLAK_VIDEO_PORT` selects another port. The extracted gallery can also be opened directly from its index.html.

When `~/Movies/Vlak/prompt-to-interface/` contains the final `vlak-prompt-to-interface.mp4`, matching JSON report and `-cover.png`, the assembler also verifies and publishes the optional **Prompt to interface** narrative above the interface grid. `VLAK_FEATURE_OUTPUT` overrides that source folder. The landscape master must be 1920×1080, 30fps, 40 seconds and 1,200 frames with AAC stereo audio. Its three assets are copied into the gallery and ZIP, and its metadata appears under `manifest.feature`.

The same folder can also contain `vlak-prompt-to-interface-reel.mp4`, `vlak-prompt-to-interface-reel.json` and `vlak-prompt-to-interface-reel-cover.png`. This optional Instagram Reel is verified separately at 1080×1920 with the same frame rate, duration, frame count and audio requirements. Its three assets are included in the gallery and ZIP, with separate `manifest.featureReel` metadata. The landscape and portrait previews share the featured section, retain their native 16:9 and 9:16 aspect ratios, and have individual MP4 downloads. They appear side by side on larger screens and stack on mobile; the portrait preview stays narrow enough for review.

The original interface catalog count remains 13. The archive download count includes whichever featured formats are present, reaching 15 films with both narrative exports. Render and review replacement masters before running the assembler: partial or warning-bearing reports and corrupt or incorrectly sized video streams are refused before served files are replaced. Missing optional exports are omitted. Video and poster URLs include master checksums so a refreshed gallery shows the current export.

## Browser framing

`browser-frame.jsx` wraps each original 1180×772 interface in a square window with a 64px toolbar. Navigation, window controls, and the address field are original Vlak `Button`, `ButtonGroup`, `Icon`, `Input`, `InputGroup`, and `InputAddon` components. The address identifies the current interface. The window stays still while the native component camera moves inside its clipped content viewport; opening hero components are constrained to fit. The final window settles below the large Vlak.dev wordmark. Browser geometry and native board dimensions are recorded under `finalState.browserFrame` in every report.

## Motion and state

Each configuration in `films/` imports an original `Board` or `ConceptBoard`. The shared runtime constructs a large native component from separately timed surfaces and content, docks it into the original layout, and builds the remaining interface. Native buttons visibly compress before real React events fire. Component arrivals follow the same damped spring as the approved agent film; sound contacts use the curve's first crossing, approximately 195ms after release.

Native input setters and keyboard events preserve the board's controlled state. After assets load, fixture timers and `Date.now()` run on film time, including Line's original 700ms reply timer. Character entry is deterministic. Assertions inspect the actual resulting DOM. Rewinding remounts the original fixture and replays actions. Original CSS animations use film time; the native live WebGL city and external Sketchfab viewer retain their own rendering implementations. The fleet canvas display size is matched to its native container so the offscreen browser’s retina pixel buffer does not crop the city.

Close-ups fade unrelated native branches before camera movement, then restore them after returning. Any action outside a close-up first returns to the full interface so the actual control is visible when pressed. Ellipsis and native scroll clipping remain intact after the opening component docks. Blended illustrations retain their original isolated backing surfaces and native opacity.

## Fidelity and sound

The renderer loads the compiled React/core component CSS, original site reset, shared interface CSS and each board's own scene CSS. All original image assets are decoded before capture. A browser-only `next/dynamic` adapter imports the same original components. The 3D workspace waits for the actual Sketchfab vehicle and fails if it is unavailable; its native attribution remains visible. Only the known third-party accelerometer feature-policy diagnostic is recorded as nonfatal. Original local fixtures remain local demonstrations; no chat, delivery, agent or vehicle backend is contacted.

Sound uses the existing unmodified, MIT-licensed Cuelume 0.2.2 engine and recipes vendored under `../agent-film/vendor/cuelume/`. SHA-256 provenance is checked before each score. The offline renderer executes the original Web Audio graphs at 48kHz stereo. Sounds are scheduled only for present, visible native controls and component contacts, including ancestor clipping. A quiet original tonal bed is mixed underneath. The final AAC mix targets −20LUFS and −2dBTP.

The reports record final states, dispatched events, audible contacts, asset readiness and render settings. Final validation includes native assertions, visual checkpoint review, and a complete FFmpeg decode of each master. Production interface files and generated component CSS are unchanged.
