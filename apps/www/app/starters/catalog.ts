import type { InterfaceSlug } from "../interfaces/catalog";

type StarterValue = string | number | boolean | null | StarterValue[] | { [key: string]: StarterValue };

export interface StarterEnvironment {
  /** Public Vite variable. Never put a server credential in a starter. */
  name: string;
  description: string;
  required?: boolean;
  /** Optional component prop supplied from import.meta.env by the exporter. */
  prop?: string;
}

export interface InterfaceStarterDefinition {
  slug: InterfaceSlug;
  title: string;
  description: string;
  /** Source paths are relative to apps/www, not the Next page wrapper. */
  entry: string;
  component: string;
  props: Record<string, StarterValue>;
  styles: string[];
  /** First file to edit, relative to the exported project. */
  edit: string;
  note: string;
  /** Additional packages only. The exporter pins Vlak from release manifests. */
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  /** Public-relative extra files. Imported assets are also collected. */
  assets?: string[];
  /** Public-relative notices that accompany the corresponding assets. */
  credits?: string[];
  env?: StarterEnvironment[];
  networkNotes?: string[];
}

export interface InterfaceStarter extends InterfaceStarterDefinition {
  preview: string;
  href: string;
  download: string;
  source: string;
}

const threeDependencies = { three: "^0.184.0" };
const threeDevDependencies = { "@types/three": "^0.184.1" };

// Metadata only: importing this catalog must not load client components or Next.
const definitions: InterfaceStarterDefinition[] = [
  {
    slug: "ios",
    title: "iPhone Duo",
    description: "Outer and inner screens, folding, local apps and familiar iOS navigation.",
    entry: "app/interfaces/mobile-os/board.tsx",
    component: "Board",
    props: { platform: "ios" },
    styles: ["scene.css", "platform-controls.css", "ios-native.css", "android-native.css", "device-chrome.css"].map(name => `app/interfaces/mobile-os/${name}`),
    edit: "src/app/interfaces/mobile-os/board.tsx",
    note: "The device is a browser prototype. Camera, messages and other system apps use local sample data; no device service is connected.",
  },
  {
    slug: "android",
    title: "Android",
    description: "A phone workspace with app navigation, Quick Settings and editable local data.",
    entry: "app/interfaces/mobile-os/board.tsx",
    component: "Board",
    props: { platform: "android" },
    styles: ["scene.css", "platform-controls.css", "ios-native.css", "android-native.css", "device-chrome.css"].map(name => `app/interfaces/mobile-os/${name}`),
    edit: "src/app/interfaces/mobile-os/board.tsx",
    note: "System controls are browser interactions. Network, camera and account services are not connected.",
  },
  {
    slug: "calendar",
    title: "Calendar",
    description: "Month, week, day and agenda views, editable events and iCalendar import and export.",
    entry: "app/interfaces/calendar/board.tsx",
    component: "CalendarBoard",
    props: {},
    styles: [],
    edit: "src/app/interfaces/calendar/board.tsx",
    note: "Events and project files stay local. No shared calendar, account system or calendar service is connected.",
  },
  {
    slug: "reconciliation",
    title: "CSV reconciliation",
    description: "Compare two CSV files, review missing or conflicting rows, and export the result.",
    entry: "app/interfaces/reconciliation/board.tsx",
    component: "ReconciliationBoard",
    props: {},
    styles: ["app/interfaces/reconciliation/scene.css"],
    edit: "src/app/interfaces/reconciliation/model.ts",
    note: "Files are processed in a browser worker. Review matching rules and exports before using them with business data.",
  },
  {
    slug: "line",
    title: "AI conversation",
    description: "Conversations, a message composer, response details and Markdown export.",
    entry: "app/interfaces/line/board.tsx",
    component: "Board",
    props: {},
    styles: ["app/interfaces/line/scene.css"],
    edit: "src/app/interfaces/line/board.tsx",
    note: "Replies are local templates. Connect a model through your own server; never put provider secrets in the browser.",
  },
  {
    slug: "press",
    title: "Production dashboard",
    description: "A production overview, job register, invoices and local review notes.",
    entry: "app/interfaces/press/board.tsx",
    component: "Board",
    props: {},
    styles: ["app/interfaces/press/scene.css"],
    edit: "src/app/interfaces/press/board.tsx",
    note: "Jobs, output totals and invoices are sample records. Reviews stay in this tab and do not start production, send payments or mark invoices paid.",
  },
  {
    slug: "wall",
    title: "Social feed",
    description: "An image-led feed with publishing, comments and contributor profiles.",
    entry: "app/interfaces/wall/board.tsx",
    component: "Board",
    props: {},
    styles: ["app/interfaces/wall/scene.css"],
    edit: "src/app/interfaces/wall/board.tsx",
    note: "People, posts and comments are sample content. Publishing, likes and follows update local state; there is no account or social network connection.",
  },
  {
    slug: "night",
    title: "Fleet management",
    description: "A vehicle list, geographic map, trip details and separate dispatch notes.",
    entry: "app/interfaces/night/board.tsx",
    component: "Board",
    props: {},
    styles: ["app/interfaces/night/scene.css"],
    edit: "src/app/interfaces/night/board.tsx",
    note: "Vehicles and telemetry are sample records. Without a Mapbox token the map uses a local preview. Dispatch notes do not send vehicle commands.",
    env: [{ name: "VITE_MAPBOX_ACCESS_TOKEN", prop: "mapboxAccessToken", required: false, description: "Optional public Mapbox token beginning with pk. Restrict it to your own development and deployment origins. Leave blank for the local map preview." }],
    networkNotes: ["With a public token, map rendering and street routes use Mapbox services. The Mapbox script, styles, tiles and Directions requests require network access and your own Mapbox account configuration."],
  },
  {
    slug: "evening",
    title: "Food ordering",
    description: "Kitchen search, menus, item quantities, a bag and a local receipt.",
    entry: "app/interfaces/evening/board.tsx",
    component: "Board",
    props: {},
    styles: ["app/interfaces/evening/scene.css"],
    edit: "src/app/interfaces/evening/board.tsx",
    note: "Checkout creates a local demonstration receipt, not an order or payment. Restaurant references provide sample context. Food images are generated illustrations, not photographs of those businesses or their dishes. Replace the sample content for your own service.",
    networkNotes: ["Restaurant and menu source links open their public websites. Browsing and the order bag do not call an ordering service."],
  },
  {
    slug: "room",
    title: "Team chat",
    description: "Editable channels, local messages, threads and pinned decisions.",
    entry: "app/interfaces/room/board.tsx",
    component: "Board",
    props: {},
    styles: ["app/interfaces/room/scene.css"],
    edit: "src/app/interfaces/room/board.tsx",
    note: "Messages, replies and channel changes stay in this tab. No users are contacted and no messaging backend is connected.",
  },
  {
    slug: "agents",
    title: "Agent workspace",
    description: "Task creation, an active work queue, review details and local approvals.",
    entry: "app/interfaces/agents/board.tsx",
    component: "AgentsBoard",
    props: {},
    styles: ["app/interfaces/agents/scene.css"],
    edit: "src/app/interfaces/agents/data.ts",
    note: "Tasks and approvals are local examples. No agent, model or external tool runs when a task is created or approved.",
  },
  {
    slug: "graphics",
    title: "Graphics generator",
    description: "Canvas compositions with editable parameters, saved projects and image export.",
    entry: "app/interfaces/concepts/wallpaper-generator.tsx",
    component: "WallpaperGenerator",
    props: {},
    styles: ["app/interfaces/concepts/wallpaper.css"],
    edit: "src/app/interfaces/concepts/wallpaper-generator.tsx",
    note: "Graphics are drawn locally from the supplied parameters. Project files and image exports do not use an image generation service.",
  },
  {
    slug: "render",
    title: "3D workspace",
    description: "A model viewport with mesh selection, material settings and camera controls.",
    entry: "app/interfaces/concepts/render.tsx",
    component: "RenderBoard",
    props: {},
    styles: ["app/interfaces/concepts/render.css"],
    edit: "src/app/interfaces/concepts/render.tsx",
    note: "Three.js renders a locally bundled Braun T3 model. The model is adapted from Radio T3 by ludwigangulodi under CC BY 4.0; keep its supplied attribution when reusing it. WebGL is required for the interactive viewport.",
    dependencies: threeDependencies,
    devDependencies: threeDevDependencies,
    assets: ["interfaces/concepts/braun-t3-monochrome.glb"],
    credits: ["interfaces/concepts/braun-t3-attribution.md"],
  },
  {
    slug: "drive",
    title: "Vehicle controls",
    description: "Vehicle, journey and energy views with cabin controls and a local 3D scene.",
    entry: "app/interfaces/concepts/drive.tsx",
    component: "Drive",
    props: {},
    styles: ["app/interfaces/concepts/drive.css"],
    edit: "src/app/interfaces/concepts/drive.tsx",
    note: "Driving, charging, media and cabin controls are local simulations. No vehicle or navigation service is connected. The Evoque model is by tonielpro520 under CC BY 4.0; keep the supplied model attribution. A static illustration remains available without WebGL.",
    dependencies: threeDependencies,
    devDependencies: threeDevDependencies,
    assets: ["interfaces/concepts/evoque-monochrome.glb", "interfaces/concepts/evoque-feature-lines.json", "interfaces/concepts/evoque-line-side-light-v4.png"],
    credits: ["interfaces/concepts/vehicle-attribution.md", "interfaces/concepts/evoque-license.txt"],
  },
  {
    slug: "orbit",
    title: "Satellite operations",
    description: "An asset list, vector map, display layers, pass details and a capture queue.",
    entry: "app/interfaces/concepts/orbit.tsx",
    component: "OrbitBoard",
    props: {},
    styles: ["app/interfaces/concepts/orbit.css"],
    edit: "src/app/interfaces/concepts/orbit.tsx",
    note: "Satellites, telemetry and observation layers are illustrative. Captures update a local queue; no satellite or imagery service is connected.",
  },
  {
    slug: "frontier",
    title: "Company website",
    description: "A model company page with capability cards, research sections and a 3D portrait.",
    entry: "app/interfaces/concepts/board.tsx",
    component: "ConceptBoard",
    props: { kind: "frontier" },
    styles: ["app/interfaces/concepts/scene.css"],
    edit: "src/app/interfaces/concepts/board.tsx",
    note: "Athena Labs and its model capabilities are fictional. The local portrait is adapted from Bust of Athena by yugengen under CC BY 4.0; keep the supplied attribution. A still portrait is shown when WebGL is unavailable.",
    dependencies: threeDependencies,
    devDependencies: threeDevDependencies,
    assets: ["interfaces/concepts/athena-lines.json", "interfaces/concepts/athena-still.svg"],
    credits: ["interfaces/concepts/athena-license.json"],
  },
  {
    slug: "platforms",
    title: "Transit app",
    description: "Route planning, journey details, saved travel days and a local traveler profile.",
    entry: "app/interfaces/concepts/transit.tsx",
    component: "TransitBoard",
    props: {},
    styles: ["app/interfaces/concepts/transit.css"],
    edit: "src/app/interfaces/concepts/transit.tsx",
    note: "Routes, times and platforms are illustrative. Saved journeys and preferences stay in this tab. No live timetable, booking or ticketing service is connected.",
  },
  {
    slug: "documentation",
    title: "Documentation reader",
    description: "A document index, article reader, contents navigation and reading preferences.",
    entry: "app/interfaces/documentation/board.tsx",
    component: "DocumentationBoard",
    props: {},
    styles: ["app/interfaces/documentation/scene.css"],
    edit: "src/app/interfaces/documentation/data.ts",
    note: "Documents are original sample copy bundled with the project. Reader settings work locally; no publishing service or subscription is connected.",
  },
  {
    slug: "video-player",
    title: "Video player",
    description: "A viewing room with a playlist, seeking, volume and provider playback controls.",
    entry: "app/interfaces/video-player/board.tsx",
    component: "VideoPlayerBoard",
    props: {},
    styles: [],
    edit: "src/app/interfaces/video-player/data.ts",
    note: "Sample videos use official YouTube and Vimeo embeds. Video files are not included in the ZIP. Keep provider links and replace the playlist with media you are permitted to embed.",
    networkNotes: ["Playback, player scripts and thumbnails require YouTube or Vimeo access. Publisher restrictions, region and browser settings can prevent playback; direct publisher links remain available."],
  },
  {
    slug: "music-player",
    title: "Music player",
    description: "A searchable music library, artwork, local audio playback and an editable queue.",
    entry: "app/interfaces/music-player/board.tsx",
    component: "MusicPlayerBoard",
    props: {},
    styles: ["app/interfaces/music-player/scene.css"],
    edit: "src/app/interfaces/music-player/board.tsx",
    note: "Official previews remain individually initiated promotional samples with store links. Full recordings and artwork are not bundled. Attach your own audio files for local playback; files are not uploaded.",
    assets: ["interfaces/music-player/itunes-store-badge.svg"],
    networkNotes: ["Official preview audio and artwork load from Apple services and may become unavailable. Store links open the provider website. Attached audio plays locally without a provider account."],
  },
  {
    slug: "microscopy",
    title: "Microscopy planner",
    description: "Stage positions, exposure sequences, stack coordinates and validated plan export.",
    entry: "app/interfaces/microscopy/board.tsx",
    component: "MicroscopyBoard",
    props: {},
    styles: ["app/interfaces/microscopy/scene.css"],
    edit: "src/app/interfaces/microscopy/plan.ts",
    note: "This is a local planning example. No microscope is connected, no images are acquired and no movement is commanded. Exposure totals are arithmetic sums, not acquisition-time estimates.",
  },
  {
    slug: "desktop-os",
    title: "Desktop OS",
    description: "Four desktop conventions with windows, files, an editor and local applications.",
    entry: "app/interfaces/desktop-os/board.tsx",
    component: "Board",
    props: {},
    styles: [],
    edit: "src/app/interfaces/desktop-os/board.tsx",
    note: "Each desktop keeps its own browser-local files and preferences. Terminal commands act on that simulated file system, not your computer. The included browser reads bundled Vlak guides; external addresses open a browser tab. No native operating system is running.",
    assets: ["docs/guide.md", "docs/tokens.md", "design.md"],
    networkNotes: ["The bundled guide pages work locally. Entering an external web address opens that website in a new browser tab."],
  },
  {
    slug: "microbiology",
    title: "Microbiology notebook",
    description: "Culture records, a colony plate, source observations and a local review notebook.",
    entry: "app/interfaces/microbiology/board.tsx",
    component: "MicrobiologyBoard",
    props: {},
    styles: ["app/interfaces/microbiology/scene.css"],
    edit: "src/app/interfaces/microbiology/board.tsx",
    note: "Cultures, samples and counts are fictional fixtures. Notes and reviews stay local. No laboratory system, image detection or culture recommendation service is connected.",
  },
  {
    slug: "genome",
    title: "Genome mapping workspace",
    description: "Reference regions, supplied coverage, aligned reads and exportable locus annotations.",
    entry: "app/interfaces/genome/board.tsx",
    component: "GenomeBoard",
    props: {},
    styles: ["app/interfaces/genome/scene.css"],
    edit: "src/app/interfaces/genome/board.tsx",
    note: "The short sequences and reads are fictional interface fixtures. The workspace displays supplied records; it performs no mapping, alignment, variant calling or clinical interpretation.",
  },
  {
    slug: "protein",
    title: "Protein sequence workbench",
    description: "A toy sequence editor with residue inspection, saved variants and exact comparisons.",
    entry: "app/interfaces/protein/board.tsx",
    component: "ProteinBoard",
    props: {},
    styles: ["app/interfaces/protein/scene.css"],
    edit: "src/app/interfaces/protein/board.tsx",
    note: "The sequence is a fictional, nonfunctional teaching fixture. Its ribbon is an illustration, not a calculated structure. No folding model, scientific scoring, synthesis or design service is connected.",
  },
  {
    slug: "robotics",
    title: "Robotics workspace",
    description: "An interactive robot arm, joint targets, mission steps and alarm review.",
    entry: "app/interfaces/robotics/board.tsx",
    component: "RoboticsBoard",
    props: {},
    styles: ["app/interfaces/robotics/scene.css"],
    edit: "src/app/interfaces/robotics/simulation.ts",
    note: "The arm and telemetry are a local browser simulation. Draft targets, mission changes and acknowledgements never command hardware. Three.js supplies the interactive arm view; WebGL availability depends on the browser.",
    dependencies: threeDependencies,
    devDependencies: threeDevDependencies,
  },
  {
    slug: "circuitry",
    title: "Circuit board workspace",
    description: "Board inspection, pad details, supplied design-rule results and assembly variants.",
    entry: "app/interfaces/circuitry/board.tsx",
    component: "CircuitryBoard",
    props: {},
    styles: ["app/interfaces/circuitry/scene.css"],
    edit: "src/app/interfaces/circuitry/board.tsx",
    note: "Board records and rule results are supplied examples. Local notes and variant changes do not run electrical simulation, validate a real design or produce manufacturing files.",
  },
  {
    slug: "identity",
    title: "Identity review",
    description: "An application queue, sample identity documents, evidence checks and review decisions.",
    entry: "app/interfaces/identity/board.tsx",
    component: "IdentityBoard",
    props: {},
    styles: ["app/interfaces/identity/scene.css"],
    edit: "src/app/interfaces/identity/board.tsx",
    note: "Applicants and documents are fictional. Review decisions remain local and do not verify identity, run a background check or approve a real application.",
  },
  {
    slug: "patient",
    title: "Patient workspace",
    description: "A patient summary with appointments, lab records, medications and care-plan notes.",
    entry: "app/interfaces/patient/board.tsx",
    component: "PatientBoard",
    props: {},
    styles: ["app/interfaces/patient/scene.css"],
    edit: "src/app/interfaces/patient/board.tsx",
    note: "Patients and medical records are fictional interface fixtures, not clinical advice. Local notes and acknowledgements do not prescribe treatment, contact patients or update a care system.",
  },
  {
    slug: "music",
    title: "Music session",
    description: "A browser sequencer with editable clips, channel controls, project files and audio export.",
    entry: "app/interfaces/music/board.tsx",
    component: "MusicBoard",
    props: {},
    styles: ["app/interfaces/music/scene.css"],
    edit: "src/app/interfaces/music/engine.ts",
    note: "Web Audio synthesizes the supplied instruments locally. Playback starts after a user action. Projects and rendered audio stay in the browser; no audio service or recording library is required.",
  },
];

export const interfaceStarters: InterfaceStarter[] = definitions.map(starter => ({
  ...starter,
  preview: `/interfaces/${starter.slug}/`,
  href: `/interfaces/#${starter.slug}`,
  download: `/starter/${starter.slug}.zip`,
  source: `https://github.com/Noord-Ventures/vlak/tree/main/apps/www/${starter.entry.substring(0, starter.entry.lastIndexOf("/"))}`,
}));

export function starterByInterface(slug: string) {
  return interfaceStarters.find(starter => starter.slug === slug);
}
