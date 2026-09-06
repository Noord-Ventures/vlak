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
| Line | `/interfaces/line` | Interfaces → Line | AI chat. List → chat → a line. Centered measure. Composer in the pane, aligned. Site 204s run around the box. On the phone: five-chat inbox plus composer (V1 still), not a squeezed three-pane. |
| Press | `/interfaces/press` | Interfaces → Press | Dashboard. Floor → job → sheet. Hue in the rail. One Crouwel spot. On the phone: 38 / 12 / 4 metrics and four jobs, not a 204 rail stacked on the floor. |
| Wall | `/interfaces/wall` | Interfaces → Wall | Social feed. Feed → post → profile. Masonry on desktop, a text stream on the phone. All people and portraits are fictional mock users created for the interface studies. |
| Fleet management | `/interfaces/night` | Interfaces → Fleet management | List → unit → trip. A neighborhood at city scale with readable streets and a selected route. On phones, switch between the van list and map; trip details open in a dismissible sheet. |
| Food ordering | `/interfaces/evening` | Interfaces → Food ordering | Search and filter restaurants → store → bag. Image-led cards adapt to phones. The bag is a sheet; no order is submitted. |
| Room | `/interfaces/room` | Interfaces → Room | Team chat. Channel → message → thread. People in the rail. Not Wall. On the phone: channels and people list plus composer, not a 204 rail stacked on the thread. |
| Agent management | `/interfaces/agents` | Interfaces → Agent management | Queue → task → activity or output. Create local tasks, pause or resume a run, and approve a review. Narrow panels use list-to-detail navigation. No model or external agent service is connected. |
| Wallpaper generator | `/interfaces/graphics` | Interfaces → Wallpaper generator | Direction → generate → select → export. Geometric compositions run locally in-browser. Export produces a PNG with a 6,144px long edge; no image API is required. |
| 3D workspace | `/interfaces/render` | Interfaces → 3D workspace | Live WebGL car model, modeling tools, selected panel, render timeline. Drag rotates the model. |
| EV controls | `/interfaces/drive` | Interfaces → EV controls | Driving status, navigation, media, cabin and connectivity in a restrained automotive field. |
| Satellite operations | `/interfaces/orbit` | Interfaces → Satellite operations | Animated pass, targets, sweep, spectral layers and telemetry over an illustrative European observation image. |
| Frontier model company | `/interfaces/frontier` | Interfaces → Frontier model company | Proposition → evidence → model access. Uses Vlak Card stacks for capability regions. |
| Mobile platforms | `/interfaces/platforms` | Interfaces → Mobile platforms | The same itinerary in iPhone and Android frames with platform-specific navigation and chrome. |
| Phone | ≤430 | Contents picker | Rail hides under 900. A stacked 44pt picker lists all studies. Scene controls use the 44pt phone scale. Each boxed demo is a mobile composition, not the desktop scene scaled down. |

Routes are derived from `catalog.ts`; CI fails if a catalog route disappears.

Before shipping, check all study routes at phone and desktop widths, including 320px. Verify one main landmark and page heading, no horizontal page overflow, primary local interactions, clipboard feedback, design-guide URL, component links, and the build anchor. Scope container queries to the owning study. Run the site typecheck and production build.
