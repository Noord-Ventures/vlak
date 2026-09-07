# Interfaces

The catalogue contains 24 working interface studies. Their definitions live in `app/interfaces/catalog.ts`; each study has its own route and source folder. Interfaces is a first-class site destination alongside Components, Docs and About. The component expansion adds 52 specialist controls, taking the public component catalogue from 114 to 166.

## Catalogue and shared shell

Each study has a descriptive English title. Stable route slugs identify source locations, not product brands. The sidebar uses the shorter labels Website, Genome Mapping and Protein Sequence for `/interfaces/frontier`, `/interfaces/genome` and `/interfaces/protein`. The Interfaces rail and compact contents index sort these display labels alphabetically. The eight specialist workspaces lead the separately curated poster gallery.

The gallery presents poster crops: clipped fragments of actual interfaces with readable type. A photograph or model can extend beyond a card; text stays inside word boundaries. Captions use the study titles. The first eight specialist title-bar dividers reach both crop edges while their labels and body content retain the same inset. The H1 aligns with the first rail row at scroll zero. Cards occupy the 204px module, have square chrome and use two gutters of vertical separation.

The site gutter overlay appears on `/interfaces` as it does on Components. It is painted by `html::before`, including the leftmost gutter. Do not introduce a second body grid or a page-level horizontal cage. Use `--grid-line`, quieter than the Home and About divider. Detail pages retain the surrounding site field; the Documentation reader itself has no construction grid.

Detail pages keep the Vlak logo, corner navigation, breadcrumb and Interfaces rail. A compact title and Build with Vlak link sit directly above the specimen. Below it are the interaction summary, source, plain-language description and links to the components actually used. Custom visual adaptations are documented honestly. The Build section supplies a package install, stylesheet import, installation guide, source link and copyable study brief. Copy reports actual clipboard success or exposes selectable text. `/design.md` is copied from the root guide during site preparation. Gallery and next-study links finish the page, with the next arrow in the gutter.

On narrow pages, a secondary contents picker sits below the main navigation. It is transparent at the top and backed by paper after scroll. Its chevron and the two-line main menu mark share the Vlak icon geometry. Desktop documentation menus allow pointer travel from trigger into the panel; focus, outside-click and Escape paths remain usable.

## Visual and interaction contract

Use Vlak paper, ink and gray tokens, inherited Inter, sentence case, hairlines and the shared control family. Structural cards, panels, rails and rows stay square. Dividers meet the edges of the region they separate; padding belongs to the content inside that region. Vlak Card provides the unframed typographic stack within these regions. Buttons, inputs, selectors and toggles use Vlak primitives where applicable.

Specialized artwork can keep meaningful distinctions: album artwork and generated food photographs retain their colors, while Athena, satellite mapping and the vehicle scenes remain monochrome. Phone hardware, app icons, grouped settings, circular controls and physical models retain the forms their tasks require. Shared symbols use Vlak Icon's 16-unit grid and 1px ink. Do not add a competing general-purpose icon set.

Each study supports a useful list, detail and action path. Local actions have visible results and preserve drafts or selections when returning. Do not claim a backend, model provider, account, government submission, clinical action, food order, vehicle command or satellite operation exists. Real integrations are identified separately: Mapbox geographic requests, official music previews, local Web Audio and browser exports.

State transitions are restrained. Focus and a user-triggered change can move deliberately; no bouncing or generic entrance cascade. Reduced motion stops continuous scenes and visualizers while preserving their useful final state. Every interactive target is at least 44 × 44px. Phone body copy is generally 15–16px and editable text fields use at least 16px. Selection changes the whole control surface, its ink or weight. Numeric meters use a fixed value column and stable decimal formatting.

## Studies and primary workflows

| Study | Route | Main path | Result and boundary |
| --- | --- | --- | --- |
| Microbiology notebook | `/interfaces/microbiology` | Culture → plate marker → observation | Preserve recorded counts and missing coordinates; save a local observation or review request. |
| Genome mapping workspace | `/interfaces/genome` | Region → alignment or coverage → annotation | Inspect a bounded sample region, select an exact locus, save annotations and export their actual JSON records. |
| Protein sequence workbench | `/interfaces/protein` | Sequence → residue → variant comparison | Edit a deliberately nonfunctional toy sequence and compare exact substitutions. The ribbon is illustrative; no folding or design model runs. |
| Robotics workspace | `/interfaces/robotics` | Robot → joint target → confirmation or event | A Three.js arm follows sampled joint state. Draft, requested and confirmed targets remain separate; changing one joint preserves the others. |
| Circuit board workspace | `/interfaces/circuitry` | Board pad → prompt → proposal | Local templates prepare explicit net and assembly proposals. Apply reviewed draft changes; supplied rule checks retain their actual status. |
| Identity application | `/interfaces/identity` | Applicant → evidence → review → receipt | Validate fields and sample evidence, then create a local receipt. Storage reports success or failure; no government submission occurs. |
| Patient dashboard | `/interfaces/patient` | Overview → readings or care → visit preparation | Inspect sample readings, update a local care record, and preserve an unsaved visit note or appointment preference across Back until explicitly saved. |
| Music session | `/interfaces/music` | Clip → pattern → mix or export | Four synthesized tracks use the Web Audio clock. Clip, tempo, mix and tone controls affect sound; export renders a stereo wave file. |
| AI chat | `/interfaces/line` | Notebook → conversation → response details | Independent conversations and drafts, local response templates, saved replies and Markdown export. |
| Dashboard | `/interfaces/press` | Production → job → review | Supplied dates and records drive the metrics and filters. Save review notes without changing invoice payment state. |
| Social feed | `/interfaces/wall` | Feed → comments → profile | Publish text, filter contributors, like, reply and follow locally. People and post records are fictional. |
| Fleet management | `/interfaces/night` | Vehicles → map → trip | Filter sample vehicles on Mapbox's monochrome Dogpatch map, inspect provider street routes and save local trip notes. |
| Food ordering | `/interfaces/evening` | Kitchen → menu → bag → receipt | Browse four restaurants, filter dishes, change quantities and produce a local receipt. No order or payment is sent. |
| Team chat | `/interfaces/room` | Channel → conversation → thread | Create local channels, send messages and replies, pin and acknowledge updates. Cancel returns to the originating list, conversation or thread. |
| Agent management | `/interfaces/agents` | Queue → task → activity or output | Create tasks, pause or resume sample runs, and review local work. No agent or model service is connected. |
| Wallpaper generator | `/interfaces/graphics` | Direction → generate → select → export | Seeded geometric compositions run in the browser. Export creates a PNG with a 6,144px long edge. |
| 3D workspace | `/interfaces/render` | Vehicle → surface or viewport → camera | The local licensed vehicle responds to Fine lines, Ink lines, mesh, orbit, zoom, reset and turntable controls. |
| EV controls | `/interfaces/drive` | Vehicle → Journey → Energy | Side-profile exterior, third-person perspective streetscape and isometric exploded battery views respond to the simulation. Reading blocks open focused detail panes. |
| Satellite operations | `/interfaces/orbit` | Map → asset → pass | Select assets and layers, change zoom, and manage a local capture queue around a monochrome map and scanning reticle. |
| Website / Athena Labs | `/interfaces/frontier` | Proposition → model → system card | A large cropped hairline Athena bust turns slowly beside local model information. Reduced motion holds it still. |
| Transit app | `/interfaces/platforms` | Plan → route → saved day | Search sample stations, choose departure time, inspect stops, save a trip and edit traveler preferences. No timetable or booking service is connected. |
| Mobile OS | `/interfaces/mobile-os` | Home → app → system controls | Two independent phones each provide 16 apps, local editing, settings, notifications, recents, timers and synthesized audio. |
| Music player | `/interfaces/music-player` | Library or Queue → recording → Sound | Play individual official previews or attached local files. Sound adds a measured spectrum and five-band equalizer when processing is available. |
| Video player | `/interfaces/video-player` | Music video playlist → official embed → playback | Loathe, Foals and Woodkid official YouTube and Vimeo music videos with actual player controls, native captions, and mobile Watching / Playlist screens. |
| Documentation | `/interfaces/documentation` | Index → article → heading outline | A bounded Inter reader with metadata, reading preferences, section navigation, pinning and index-position restoration. |

Routes are derived from `catalog.ts`; catalogue entries must resolve to actual pages.

## Mobile composition

Use the specimen's width, not only the browser width. At 640px and below, desktop panes become focused screens. The same mobile composition must work inside a narrow specimen beside the desktop documentation rail.

- The music session uses one selected track with four clip launchers and scene actions. Its Clip screen presents 16 steps as four labeled beat rows; Mixer and Clip keep Back, focus restoration and pinned transport.
- Patient visit preparation preserves unsaved note and preference drafts when returning to the overview; its saved record changes only on explicit Save.
- Team chat restores the originating screen, thread draft and focus after cancelled channel creation. Food ordering does not add history when its active Bag action is tapped again.
- Agent management uses Tasks, Active and Review; detail and creation replace the list with their own Back and primary action.
- Wallpaper generation separates Preview from Direction, retains the selected result and exposes the other generated choices.
- The 3D workspace separates Viewport from Inspector. Viewport tools remain reachable without covering the model.
- EV keeps Range & battery, Cabin and Media readings available. Details slide in above those controls on phones, with a clear return to the scene. Desktop details occupy one third of the workspace.
- Satellite operations separates Map, Assets and Pass details. Telemetry remains available at every size.
- The Website header uses Vlak paper, ink and hairlines with its active underline on the divider. Mobile navigation uses a disclosure menu and one-column reading flow, with Escape and focus return.
- Transit has one responsive planner, itinerary, saved-day and profile state, without a platform switch.
- Mobile OS shows both phones side by side on desktop and in a horizontal scroll-snap track on compact screens. There is no study-level switch. iPhone navigation keeps the Home gesture, App Library, contextual back, grouped Settings and separate Control and Notification Centers. Android retains its All Apps drawer, three-button navigation, app bars, floating actions and Quick Settings. The iOS visual language uses paper surfaces, Vlak glyphs and restrained type without replacing its platform structure. Vertical Home scrolling remains native, an App Library swipe does not move the phone track, and a status-bar swipe keeps the other phone reachable.
- Music player exposes Library, Playing and Queue on mobile. The selected recording, transport, Sound settings and queue survive navigation.
- Documentation uses a readable contents disclosure below 840px. On desktop, heading marks reveal labels on approach or focus. Clicking a heading or the Contents control pins it; Escape dismisses it. Paragraphs and lists use Inter at weight 350. Reading controls have no hover fill; the outline keeps its proximity reveal. Reader settings reuse the site chrome’s SettingsMark and canonical Vlak Popover, Field, ToggleGroup and Button components. Explicit Light and Dark use the exact token palettes; Auto inherits the site without changing its theme. There is no layout-grid preference.

Desktop specimens adapt between 612 and 816px tall; phone frames follow the stable viewport with a 480px minimum. Boards fill their frame. Long content scrolls inside its screen, independently of headers, primary actions and bottom navigation. Back preserves state and restores focus. Each route documents its adaptation in `mobilePatterns`.

## Media and service boundaries

Fleet management needs `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`, documented in `apps/www/.env.example`. Its fallback is a labeled schematic, and Mapbox attribution remains visible. Vehicle positions and operational readings are samples even when geographic tiles and routes come from Mapbox.

Food ordering uses verified restaurant references for Joe's Kitchen, Neder, La Dune and Jacky's. Restaurant and dish photographs are generated illustrations. Prices and service details distinguish sourced snapshots from samples; delivery and checkout remain illustrative.

Mobile OS music uses real local oscillators and keeps its app and system controls synchronized with actual audio suspension, unsuccessful resume and recovery.

The Music Player has 23 verified recordings. Official previews are individually initiated promotional streams with direct store links, the approved badge and courtesy credit. They do not auto-advance or become downloadable full tracks. User-attached files stay local and support full queue playback.

The Sound graph probes remote-media CORS support on selection. Play and audio-context resume stay in the user action; a pending or refused probe keeps immediate native playback available without creating a media source. It never fabricates visualizer readings. Reduced motion holds the spectrum still.

The 3D Workspace and EV share an attributed geometry-only Evoque under CC BY 4.0. Their screen-space feature contours use 1.05px lines with a narrow silhouette hull, and surfaces match the composited viewport paper through stable CSS token colors. EV's Journey streetscape is an original looping illustration, not mapped Utrecht geometry. Lights can switch the site theme and restore it; repeated toggles must keep all material colors consistent. The robot and battery geometry are independently authored illustrations.

Athena's licensed bust is cropped above the helmet and below the shoulders, has no pause button and honors reduced motion. Creator links, license links and modification notes sit below Components used, with asset provenance in the repository. Three.js and Mapbox are site dependencies, not runtime additions to the component package.

## Verification contract and checkpoint

The fresh delivery package checkpoint passes 1,097 tests, build, typecheck, size budget and tarball smoke, with all 528 generated files byte-stable. Biome reports zero errors across 793 files; the example check passes 167 isolated examples and 92 new previews. These package results do not substitute for testing the latest application source.

The fresh production export passes all 192 study layout/accessibility cases, the eight specialist studies' complete local workflows, established mobile journeys, shared gallery/chrome checks and About integration. Current EV journeys, Render controls and the shared vehicle lifecycle pass. Native Mobile OS gestures and real audio interruption/recovery are covered. Documentation's canonical popover, exact local palettes, forced colors, scale bounds and focus paths pass their focused eight-case check.

The delivery refresh runner recorded one Music Player direct-audio timeout. Its replacement regression passed all eight width/theme cases with trusted keyboard activation, immediate direct playback requests during pending or refused CORS probes, and no unintended audio graph creation. Keep the original nonzero run in the evidence. The dedicated Agents rerun passes after fixing directory redirects in the local test server, and Inspiration passes all 15 updated checks.

The newer main-branch media-control alignment changes are merged; the final production build and second generation pass succeed with 528 unchanged outputs. All 64 first-eight crop geometry cases pass on the actual final export without injected CSS, with zero edge gaps, retained 20px content insets and no overflow or browser errors. The focused post-merge media-control browser check passes all eight width/theme cases, including local playback, volume, mute, responsive alignment, 44px reach and keyboard behavior.

For the fresh export, set `SITE_URL` and optionally `PLAYWRIGHT_EXECUTABLE_PATH`, then use the relevant runners:

- `scripts/e2e-interface-refresh.mjs`: all 24 studies at 320, 390, 1024 and 1440px, with layout and accessibility in both themes and focused app flows in light mode at each width. Room/Bag return paths also run at the two phone widths. `INTERFACES` selects a bounded subset.
- `scripts/e2e-specialist-interfaces.mjs`: the eight specialist application layouts in both themes, with local persistence, exact data, downloads and synthesized-audio workflows in light mode at each width.
- `scripts/e2e-render-controls.mjs` and `scripts/e2e-vehicle.mjs`: actual geometry, line treatments, mesh, camera fit, turntable, failure/retry and context cleanup.
- `scripts/e2e-interface-chrome.mjs`, `scripts/e2e-interfaces.mjs` and `scripts/e2e-mobile-interfaces.mjs`: shared navigation, gallery behavior, flush dividers, target sizes and established responsive journeys.
- The domain and application helpers remain callable separately for focused regression checks, including Mobile OS, Documentation, Music Player, robotics and Mapbox.

Before recording a final pass, test the current production export at phone and desktop widths, including a narrow desktop specimen. Check one main landmark and page heading, page and specimen overflow, 44px reach, keyboard navigation, state changes, failures, clipboard/download feedback, source and component links, the Build anchor and light/dark/reduced-motion behavior. Review actual screenshots. Run the site typecheck and production build; record exact results after integration.
