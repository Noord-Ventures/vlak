# Interfaces

What it is, how to get there, what done looks like.

Writers: the studies live in `app/interfaces/catalog.ts`. Each proto is its own folder and route. The section is a first-class nav sibling of Components, Docs, and About, not a page inside a component.

Each interface is a fictional app with a descriptive English name. The gallery, side rail, and detail headings use those names. Stable route slugs are implementation details, not product brands. Newer concepts appear first, starting with agent management.

Landing cards are poster crops — a clipped fragment of that UI, not a tiny full-page shrink, not a title-only frame. Type in a crop wraps on a word. A composer or photograph may run off the card; a letter may not. Captions follow the English names.

The site gutter overlay (184 + 20 verticals) shows on `/interfaces` the same as Components — painted on `html::before`, not a second body field. The utmost left gutter paints; do not clip it. Homepage is boxed cells only and does not share this overlay. Type occupies the first cell. Cards sit on the grid. Ink is `--grid-line`, quieter than the Home / About `--divider` cage. Quiet, readable on paper and dark. Do not raise opacity. Detail routes keep the field around the boxed specimen. No page-level horizontal cage.

Detail keeps Vlak site chrome (logo, corner nav, crumb bar, Interfaces rail). A compact title and Build with Vlak link sit directly above the boxed specimen, aligned with the top of the rail. Below it: interaction summary, source link, plain-language description, and links to components actually used. Component modification notes describe custom implementation honestly.

The Build with Vlak section supplies a copyable package install, stylesheet import, installation guide, source link, and study-specific brief for coding agents. Copy reports actual clipboard success or exposes selectable text on failure. `/design.md` is copied from the root guide during site preparation. Finish with gallery and next-study links. Do not claim account, backend, vehicle, satellite, or commercial generation services exist: these are local examples.

The boxed UI is a coherent modern product with a Vlak core, not a floaty flat demo. Module, hairlines, grotesque, sentence case. Never all caps. No tape. Chrome stays mostly monochrome. A board may take one spot or a quiet hue for hierarchy. Faces, circular controls, and physical phone frames may be round. Structural cards, panels, rails, rows, and full-bleed dividers stay square and meet their edges. Vlak `Card` supplies the unframed typographic stack inside those regions. Nav, lists, composers, jobs, cart, and fleet units use Vlak `Icon` marks from the family (16 viewBox, 1px currentColor). No second icon set.

Each app has two to three levels of use: list → detail → one level deeper. Inspector panes (`.if-inspect`) open with width and opacity. A state the user caused may snap, ease, or confirm. Quiet, precise, a little pleasure on the change. Entry is not a show. No fade-up on load, no staggered reveal. Color, opacity, and width name the change. Nothing bounces. Reduced motion stills the loops.

| Surface | Route | Click path | Done |
| --- | --- | --- | --- |
| Interfaces index | `/interfaces` | Corner → Interfaces | Lists the studies. Title occupies a 204 cell. At scroll 0 the H1 top shares the rail first-row line. Each card is a poster crop on the 204, then the English name. Index tiles are chrome-square (radius 0), same lock as Components `.rs-card`. Vertical gap is two gutters so the stack is looser than a flush cage. The field under the title and around the crops reads as the module. |
| AI chat | `/interfaces/line` | Interfaces → AI chat | Inbox → conversation → response or information. A full-width reading screen and pinned composer replace the desktop panes on mobile. |
| Dashboard | `/interfaces/press` | Interfaces → Dashboard | Overview → jobs or invoices → brief. Bottom navigation and a focused production overview replace the desktop dashboard on mobile. |
| Social feed | `/interfaces/wall` | Interfaces → Social feed | Feed → comments → profile. Feed and People have bottom navigation; comments get their own reply screen. All portraits are fictional mock users. |
| Fleet management | `/interfaces/night` | Interfaces → Fleet management | Vehicles → map → trip. A compact vehicle card anchors the map; the itinerary uses a full reading screen with Back and Show on map actions. |
| Food ordering | `/interfaces/evening` | Interfaces → Food ordering | Kitchens → menu → dish → bag. Filters and ordering use focused mobile screens with a bottom action. The confirmation is local; no order or payment is submitted. |
| Team chat | `/interfaces/room` | Interfaces → Team chat | Channels → conversation → thread. Each mobile level gets a contextual header and Back action. Conversations and threads have their own pinned composers. |
| Agent management | `/interfaces/agents` | Interfaces → Agent management | Queue → task → activity or output. Create local tasks, pause or resume a run, and approve a review. Narrow panels use list-to-detail navigation. No model or external agent service is connected. |
| Wallpaper generator | `/interfaces/graphics` | Interfaces → Wallpaper generator | Direction → generate → select → export. Geometric compositions run locally in-browser. Export produces a PNG with a 6,144px long edge; no image API is required. |
| 3D workspace | `/interfaces/render` | Interfaces → 3D workspace | Live WebGL car model, modeling tools, selected panel, render timeline. Drag rotates the model. |
| EV controls | `/interfaces/drive` | Interfaces → EV controls | Driving status, navigation, media, cabin and connectivity in a restrained automotive field. |
| Satellite operations | `/interfaces/orbit` | Interfaces → Satellite operations | Animated pass, targets, sweep, spectral layers and telemetry over an illustrative European observation image. |
| Frontier model company | `/interfaces/frontier` | Interfaces → Frontier model company | Proposition → evidence → model access. Uses Vlak Card stacks for capability regions. |
| Mobile platforms | `/interfaces/platforms` | Interfaces → Mobile platforms | The same itinerary in iPhone and Android frames with platform-specific navigation and chrome. |
| Phone | ≤430 | Contents picker | Rail hides under 900. A stacked 44pt picker lists all studies. Scene controls use the 44pt phone scale. Each boxed demo is a mobile composition, not the desktop scene scaled down. |

Routes are derived from `catalog.ts`; CI fails if a catalog route disappears.

## Mobile composition contract

The specimen container, not only the browser width, determines the layout. At 640px and below, replace desktop information architecture with focused screens. A narrow specimen next to the documentation rail must receive the same mobile treatment. Desktop remains multi-pane above that threshold.

- Agent management uses Tasks, Active, and Review bottom navigation. Task details and new-task forms replace the queue and header, with a pinned primary action and independently scrolling content.
- Wallpaper generation separates Preview from Direction. Show one selected result, keep a three-result picker, and return to Preview after generation. All format and export controls remain reachable.
- The 3D workspace separates Viewport from Inspector and puts modeling tools in a horizontal toolbar.
- Vehicle controls separate Vehicle, Controls, and Media. Keep the artwork, settings, and playback at a usable scale without competing for the same screen.
- Satellite operations separate Map, Assets, and Pass details. Do not hide telemetry to make the map fit.
- The frontier company uses a disclosure menu and a single-column reading flow, with Escape and focus return.
- Mobile platforms show one full-width handset behind an iOS/Android picker. Both preserve their own navigation and saved-trip state.

Use Vlak Button, Card, Icon, Input, InputGroup, and ToggleGroup where applicable. Keep structural regions flush and controls at the 4px radius. Body copy is 15–16px on phones, text inputs are at least 16px, and targets are at least 44 × 44px. Selection changes the full control surface. Do not add simulated device status bars outside the explicit platform comparison.

Headers, bottom navigation, and primary actions must remain separate from the scrolling content. Back preserves the selected item and restores focus. Phone specimen height follows the stable viewport, with a 480px minimum; long details scroll inside their screen. Reduced motion must preserve every transition's end state. Each detail page documents its mobile component adaptation in `mobilePatterns`.

`scripts/e2e-mobile-interfaces.mjs` exercises all 13 flows at 320 × 568, 390 × 844, 430 × 932, and a narrow specimen inside a 1024px desktop page. It checks touch targets, duplicated chrome, overflow, reachable navigation, and the main state-changing journey. `scripts/e2e-agents.mjs` covers task creation, approvals, pause/resume, focus, and accessibility. `scripts/e2e-interfaces.mjs` covers the shared gallery, detail pages, and desktop regressions.

Before shipping, check all study routes at phone and desktop widths, including 320px. Verify one main landmark and page heading, no horizontal page overflow, primary local interactions, clipboard feedback, design-guide URL, component links, and the build anchor. Scope container queries to the owning study. Run the site typecheck and production build.
