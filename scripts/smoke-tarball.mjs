// Installs the packed tarballs into a throwaway project, the way a user
// gets them from npm, and exercises every public surface:
//
//   - @noorddev/vlak: tokens, registry, the CSS export, the props JSON
//   - @noorddev/vlak-react: server render of components with no compiler,
//     the stylesheet, per-component entries, the .stylex token file
//   - @noorddev/vlak-cli: init + add from the tarball, offline
//   - publint and are-the-types-wrong on each tarball
//
// Run after `pnpm build`. Needs network for React and optional rendering engines.
import { execSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const work = mkdtempSync(join(tmpdir(), "vlak-smoke-"));
const run = (cmd, cwd = work) => execSync(cmd, { cwd, stdio: "pipe", encoding: "utf8" });
const log = (msg) => console.log(`[smoke] ${msg}`);
const expectedCatalogueSize = 231;
const parityCore = [
  ["attachments", "Attachments"], ["response-branch", "ResponseBranch"],
  ["shimmer", "Shimmer"], ["plan", "Plan"], ["task", "Task"], ["thought-steps", "ThoughtSteps"],
  ["checkpoint", "Checkpoint"], ["suggestions", "Suggestions"], ["work-queue", "WorkQueue"],
  ["generated-image", "GeneratedImage"], ["conversation-export", "ConversationDownload"], ["response-editor", "ResponseEditor"],
  ["agent", "Agent"], ["artifact", "Artifact"], ["commit", "Commit"], ["environment-variables", "EnvironmentVariables"],
  ["package-info", "PackageInfo"], ["schema-display", "SchemaDisplay"], ["snippet", "Snippet"], ["test-results", "TestResults"],
  ["terminal", "Terminal"], ["stack-trace", "StackTrace"], ["sandbox", "Sandbox"], ["web-preview", "WebPreview"],
  ["context-usage", "ContextUsage"], ["model-selector", "ModelSelector"], ["inline-citation", "InlineCitation"], ["sources", "Sources"], ["open-in-chat", "OpenInChat"],
  ["audio-player", "AudioPlayer"], ["mic-selector", "MicSelector"], ["speech-input", "SpeechInput"],
  ["voice-selector", "VoiceSelector"], ["transcription", "Transcription"], ["persona", "Persona"],
];
const nativeCore = [
  ["ios-navigation-bar", "IOSNavigationBar"], ["ios-tab-bar", "IOSTabBar"],
  ["ios-search-field", "IOSSearchField"], ["ios-switch", "IOSSwitch"],
  ["ios-list", "IOSList"], ["ios-segmented-control", "IOSSegmentedControl"],
  ["ios-slider", "IOSSlider"], ["ios-sheet", "IOSSheet"],
  ["android-app-bar", "AndroidAppBar"], ["android-navigation", "AndroidNavigation"],
  ["android-search-bar", "AndroidSearchBar"], ["android-switch", "AndroidSwitch"],
  ["android-list", "AndroidList"], ["android-chip", "AndroidChip"],
  ["android-fab", "AndroidFab"], ["android-sheet", "AndroidSheet"],
];
if (new Set(nativeCore.map(([name]) => name)).size !== 16) throw new Error("Expected 16 native catalogue entries");
const optionalAdditions = [
  ["response-markdown", "ResponseMarkdown"], ["highlighted-code", "HighlightedCode"],
  ["jsx-preview", "JSXPreview"], ["workflow-canvas", "WorkflowCanvas"],
];
if (new Set([...parityCore, ...optionalAdditions].map(([name]) => name)).size !== 39) throw new Error("Expected 39 parity catalogue entries");
const reactManifest = JSON.parse(readFileSync(join(root, "packages/react/package.json"), "utf8"));
const optionalEngines = Object.entries(reactManifest.peerDependencies).filter(([name]) => reactManifest.peerDependenciesMeta?.[name]?.optional);
const withoutOptionalEngines = `
for (const name of ${JSON.stringify(optionalEngines.map(([name]) => name))}) {
  let installed = false;
  try { import.meta.resolve(name); installed = true; } catch (error) { if (error.code !== "ERR_MODULE_NOT_FOUND") throw error; }
  if (installed) throw new Error("Core consumer unexpectedly installed optional engine: " + name);
}
console.log("  ✓ core install/import works without any optional rendering engines");
`;
const additions = [
  ...parityCore,
  ...nativeCore,
  ["ios-list", "IOSListRow"], ["android-app-bar", "AndroidAppBarAction"],
  ["android-list", "AndroidListRow"], ["android-sheet", "AndroidSheetTitle"], ["android-sheet", "AndroidSheetBody"],
  ["attachments", "Attachment"], ["suggestions", "Suggestion"], ["snippet", "SnippetCopy"], ["audio-player", "AudioPlayerControls"],
  ["chat", "Chat"],
  ["conversation", "Conversation"],
  ["response", "Response"],
  ["response-actions", "ResponseActions"],
  ["widget", "Widget"],
  ["widget", "WidgetEmbed"],
  ["reasoning", "Reasoning"],
  ["tool-call", "ToolCall"],
  ["confirmation", "Confirmation"],
  ["calendar-popover", "CalendarPopover"],
  ["joint-panel", "JointPanel"],
  ["robot-pose", "RobotPose"],
  ["robot-mission-queue", "RobotMissionQueue"],
  ["pad-inspector", "PadInspector"],
  ["design-rule-results", "DesignRuleResults"],
  ["colony-plate", "ColonyPlate"],
  ["culture-log", "CultureLog"],

  ["assembly-variant-matrix", "AssemblyVariantMatrix"],
  ["coordinate-reference-field", "CoordinateReferenceField"],
  ["datum-transform-picker", "DatumTransformPicker"],
  ["raster-band-mixer", "RasterBandMixer"],
  ["patchbay", "Patchbay"],
  ["kerning-pair-editor", "KerningPairEditor"],
  ["stage-position-list", "StagePositionList"],
  ["stack-navigator", "StackNavigator"],
  ["acquisition-sequencer", "AcquisitionSequencer"],
  ["sequence-alignment", "SequenceAlignment"],
  ["coverage-inspector", "CoverageInspector"],
  ["genomic-region-field", "GenomicRegionField"],
  ["alarm-panel", "AlarmPanel"],
  ["work-offset-panel", "WorkOffsetPanel"],

  ["number-field", "NumberField"], ["range-slider", "RangeSlider"], ["multi-select", "MultiSelect"], ["tag-input", "TagInput"], ["date-range-picker", "DateRangePicker"],
  ["time-field", "TimeField"], ["file-upload", "FileUpload"], ["transfer-list", "TransferList"], ["inline-edit", "InlineEdit"], ["rating", "Rating"],
  ["description-list", "DescriptionList"], ["metric", "Metric"], ["activity-timeline", "ActivityTimeline"], ["code-block", "CodeBlock"], ["json-viewer", "JSONViewer"],
  ["diff-viewer", "DiffViewer"], ["error-summary", "ErrorSummary"], ["notification-center", "NotificationCenter"], ["task-progress", "TaskProgress"], ["connection-status", "ConnectionStatus"],
  ["tree-view", "TreeView"], ["toolbar", "Toolbar"], ["bottom-navigation", "BottomNavigation"], ["overflow-list", "OverflowList"], ["filter-bar", "FilterBar"],
  ["query-builder", "QueryBuilder"], ["sortable-list", "SortableList"], ["virtual-list", "VirtualList"], ["master-detail", "MasterDetail"], ["property-grid", "PropertyGrid"],
  ["playback-controls", "PlaybackControls"], ["media-scrubber", "MediaScrubber"], ["media-player", "MediaPlayer"], ["waveform", "Waveform"], ["image-viewer", "ImageViewer"],
  ["canvas-controls", "CanvasControls"], ["message-composer", "MessageComposer"], ["file-browser", "FileBrowser"], ["kanban-board", "KanbanBoard"], ["scheduler", "Scheduler"],
  ["health-metric", "HealthMetric"], ["reference-range", "ReferenceRange"], ["lab-results", "LabResults"], ["symptom-diary", "SymptomDiary"],
  ["activity-goal", "ActivityGoal"], ["habit-tracker", "HabitTracker"], ["check-in", "CheckIn"], ["sleep-timeline", "SleepTimeline"],
  ["patient-banner", "PatientBanner"], ["medication-schedule", "MedicationSchedule"], ["appointment-card", "AppointmentCard"], ["care-plan", "CarePlan"],
  ["activity-rings", "ActivityRings"], ["identity-document", "IdentityDocument"], ["tax-summary", "TaxSummary"], ["benefit-program", "BenefitProgram"], ["application-status", "ApplicationStatus"], ["evidence-checklist", "EvidenceChecklist"],
  ["measurement-value", "MeasurementValue"], ["quantity-field", "QuantityField"], ["well-plate", "WellPlate"], ["experiment-run", "ExperimentRun"], ["spectrum-plot", "SpectrumPlot"],
  ["audio-meter", "AudioMeter"], ["channel-strip", "ChannelStrip"], ["parameter-knob", "ParameterKnob"], ["timecode-field", "TimecodeField"], ["clip-timeline", "ClipTimeline"],
  ["render-queue", "RenderQueue"], ["layer-stack", "LayerStack"], ["color-inspector", "ColorInspector"], ["spacing-control", "SpacingControl"],
];
// The same fixtures exercise the packed modules under both supported React majors.
const renderAdditions = `
const additions = ${JSON.stringify(additions)};
const fixtureProps = {
  IOSNavigationBar: { title: "Notes", largeTitle: true, onBack() {}, backLabel: "Folders", actions: [{ id: "compose", label: "New note", icon: h(R.Icon, { name: "plus", size: 24 }), onClick() {} }] },
  IOSTabBar: { label: "Notebook views", defaultValue: "notes", items: [{ id: "notes", label: "Notes", panelId: "notes-panel", icon: h(R.Icon, { name: "file-text", size: 24 }) }, { id: "search", label: "Search", panelId: "search-panel", icon: h(R.Icon, { name: "search", size: 24 }) }] },
  IOSSearchField: { "aria-label": "Search notes", name: "note-query", defaultValue: "Project", onValueChange() {} },
  IOSSwitch: { "aria-label": "Background sync", name: "ios-sync", defaultChecked: true, onCheckedChange() {} },
  IOSList: { title: "Connections", footer: "Settings apply to this device.", children: h(R.IOSListRow, { label: "Wi-Fi", description: "Studio network", trailing: h(R.IOSSwitch, { "aria-label": "Wi-Fi enabled", defaultChecked: true }) }) },
  IOSListRow: { label: "Network details", description: "Studio network", disclosure: true, onClick() {} },
  IOSSegmentedControl: { label: "Messages", name: "message-filter", defaultValue: "all", items: [{ id: "all", label: "All" }, { id: "unread", label: "Unread" }], onValueChange() {} },
  IOSSlider: { "aria-label": "Volume", name: "volume", defaultValue: 40, min: 0, max: 100, onValueChange() {} },
  IOSSheet: { open: false, title: "Connection settings", description: "Choose how this device connects.", onOpenChange() {}, children: h(R.IOSSwitch, { "aria-label": "Background sync", defaultChecked: true }) },
  AndroidAppBar: { title: "Documents", variant: "medium", navigation: h(R.AndroidAppBarAction, { "aria-label": "Go back", onClick() {} }, h(R.Icon, { name: "arrow-left", size: 24 })), actions: h(R.AndroidAppBarAction, { "aria-label": "Search documents", onClick() {} }, h(R.Icon, { name: "search", size: 24 })) },
  AndroidAppBarAction: { "aria-label": "Go back", onClick() {}, children: h(R.Icon, { name: "arrow-left", size: 24 }) },
  AndroidNavigation: { "aria-label": "Workspace", orientation: "vertical", defaultValue: "home", onValueChange() {}, items: [{ value: "home", label: "Home", icon: h(R.Icon, { name: "home", size: 24 }) }, { value: "files", label: "Files", icon: h(R.Icon, { name: "folder", size: 24 }) }] },
  AndroidSearchBar: { "aria-label": "Search documents", name: "document-query", defaultValue: "Project", onValueChange() {} },
  AndroidSwitch: { "aria-label": "Background sync", name: "android-sync", defaultChecked: true, onCheckedChange() {} },
  AndroidList: { "aria-label": "Connections", children: h(R.AndroidListRow, { headline: "Wi-Fi", supportingText: "Studio network", onAction() {}, trailing: h(R.AndroidSwitch, { "aria-label": "Wi-Fi enabled", defaultChecked: true }) }) },
  AndroidListRow: { headline: "Network details", supportingText: "Studio network", onAction() {} },
  AndroidChip: { defaultSelected: true, onSelectedChange() {}, children: "Unread" },
  AndroidFab: { icon: h(R.Icon, { name: "plus", size: 24 }), onClick() {}, children: "New document" },
  AndroidSheet: { open: false, onOpenChange() {}, children: [h(R.AndroidSheetTitle, { key: "title" }, "Connection settings"), h(R.AndroidSheetBody, { key: "body" }, "Choose how this device connects."), h(R.AndroidSwitch, { key: "sync", "aria-label": "Background sync", defaultChecked: true })] },
  AndroidSheetTitle: { children: "Connection settings" },
  AndroidSheetBody: { children: "Choose how this device connects." },
  Attachments: { variant: "inline", children: h(R.Attachment, { data: { id: "brief", name: "Project brief.txt", mediaType: "text/plain", size: 342 }, onRemove() {} }) },
  Attachment: { data: { id: "drawing", name: "drawing.svg", mediaType: "image/svg+xml", url: "blob:https://example.com/drawing" }, onRemove() {} },
  ResponseBranch: { branches: [{ id: "first", content: "First recorded response" }, { id: "second", content: "Revised recorded response" }], defaultValue: "second" },
  Shimmer: { children: "Reviewing brief", active: true },
  Plan: { title: "Review plan", description: "Read the brief and compare ownership", actions: h(R.Button, { variant: "subtle" }, "Approve plan"), children: "Check each launch milestone." },
  Task: { title: "Read sources", items: [{ id: "brief", content: "Read launch brief", state: "complete", file: "brief.md" }] },
  ThoughtSteps: { defaultOpen: true, steps: [{ id: "source", title: "Read the source", state: "complete", sources: h("a", { href: "/brief" }, "Launch brief") }, { id: "review", title: "Compare owners", state: "active", content: "One owner is missing." }] },
  Checkpoint: { label: "Before editing", onRestore() {} },
  Suggestions: { children: h(R.Suggestion, { value: "Review launch brief", onSelect() {} }, "Review brief") },
  Suggestion: { value: "Review launch brief", onSelect() {}, children: "Review brief" },
  WorkQueue: { sections: [{ id: "review", title: "Next steps", items: [{ id: "brief", content: "Review brief", completed: false, description: "Confirm the owner" }] }], onItemCheckedChange() {} },
  GeneratedImage: { alt: "Recorded chart", image: { mediaType: "image/png", base64: "AAAA" } },
  ConversationDownload: { messages: [{ role: "user", content: "Review the brief" }, { role: "assistant", parts: [{ type: "text", text: "One finding" }, { type: "tool", name: "read", output: { sections: 3 } }] }], title: "Brief review" },
  ResponseEditor: { text: "Draft response", onSave() {}, onCancel() {} },
  Agent: { name: "Brief reviewer", model: "Supplied model", instructions: "Compare the supplied milestones", tools: [{ name: "readBrief", description: "Read the supplied document", inputSchema: { type: "object", properties: { path: { type: "string" } } } }], outputSchema: { type: "object" } },
  Artifact: { title: "Review notes", description: "Recorded findings", children: "One milestone needs an owner", onClose() {} },
  Commit: { hash: "a1b2c3d4e5f6", message: "Clarify the launch owner", author: "Robin Ellis", timestamp: "2026-09-09T08:00:00Z", timeLabel: "9 September", defaultOpen: true, files: [{ path: "brief.md", status: "modified", additions: 3, deletions: 1 }], onFileSelect() {} },
  EnvironmentVariables: { variables: [{ name: "SERVICE_TOKEN", value: "private-smoke-fixture", required: true, description: "Application credential" }] },
  PackageInfo: { name: "example-library", currentVersion: "1.0.0", newVersion: "1.1.0", changeType: "minor", dependencies: [{ name: "react", version: ">=18", kind: "peer" }] },
  SchemaDisplay: { method: "POST", path: "/reviews", parameters: [{ name: "project", type: "string", location: "query", required: true }], responseBody: [{ name: "result", type: "object", properties: [{ name: "summary", type: "string", required: true }] }] },
  Snippet: { code: "pnpm add example-library", prefix: "$" },
  SnippetCopy: { value: "pnpm add example-library" },
  TestResults: { suites: [{ id: "review", name: "Review tests", tests: [{ id: "owner", name: "Requires an owner", status: "passed", duration: 8 }, { id: "date", name: "Requires a date", status: "failed", error: "Missing launch date", stack: "Error: Missing launch date" }] }], onRetry() {} },
  Terminal: { output: "Reading brief\\n\\u001b[32mReady\\u001b[0m", streaming: true, onClear() {} },
  StackTrace: { trace: "Error: Missing owner\\n    at review (/app/review.ts:12:3)", defaultOpen: true, onFilePathClick() {} },
  Sandbox: { title: "Recorded run", state: "complete", code: "console.log(3)", language: "JavaScript", output: "3" },
  WebPreview: { title: "Review preview", defaultUrl: "https://example.com/preview", logs: [{ id: "ready", level: "info", message: "Preview ready" }] },
  ContextUsage: { usedTokens: 1200, maxTokens: 8000, usage: { inputTokens: 1000, outputTokens: 200 }, pricing: { inputPerMillion: 1, outputPerMillion: 2 }, model: "Supplied model", defaultOpen: true },
  ModelSelector: { models: [{ id: "fast", name: "Fast model", provider: "Example provider", description: "Short drafts" }, { id: "careful", name: "Careful model", provider: "Example provider", disabled: true }], defaultValue: "fast", onValueChange() {} },
  InlineCitation: { sources: [{ id: "brief", title: "Launch brief", url: "https://example.com/brief", quote: "Every milestone has an owner" }], children: "1" },
  Sources: { sources: [{ id: "brief", title: "Launch brief", url: "https://example.com/brief", description: "Supplied source" }], defaultOpen: true },
  OpenInChat: { prompt: "Review the launch brief", providers: ["chatgpt", "claude"], defaultOpen: true },
  AudioPlayer: { title: "Spoken brief", src: "https://example.com/brief.wav", transcript: "The brief is ready for review." },
  AudioPlayerControls: { seekOffset: 5 },
  MicSelector: { label: "Microphone", onValueChange() {} },
  SpeechInput: { onTranscript() {} },
  VoiceSelector: { voices: [{ id: "mina", name: "Mina", provider: "Example provider", language: "English", previewSrc: "https://example.com/sample.wav", previewText: "The brief is ready." }], defaultValue: "mina", onValueChange() {} },
  Transcription: { currentTime: 2, segments: [{ id: "first", startSecond: 0, endSecond: 4, speaker: "Mina", text: "The brief is ready." }], onSeek() {} },
  Persona: { state: "thinking", label: "Assistant: thinking" },
  Chat: { title: "Example chat", composer: "Write a message", children: "Recorded response" },
  Conversation: { label: "Example conversation" },
  Response: { children: "Recorded response", status: "complete" },
  ResponseActions: { text: "Recorded response" },
  Widget: { title: "Recorded result", provider: "Example integration", children: "Three files found" },
  WidgetEmbed: { title: "Embedded result", src: "https://example.com/embed", height: 360 },
  Reasoning: { title: "Work summary", children: "Compared the supplied brief" },
  ToolCall: { title: "Read brief", state: "complete", output: "3 sections read" },
  Confirmation: { title: "Approve note", onConfirm() {} },
  CalendarPopover: { label: "Deadline", defaultValue: "2026-07-24", name: "deadline" },
  JointPanel: {"label": "Robot joints", "joints": []},
  RobotPose: {"label": "Recorded pose", "poses": []},
  RobotMissionQueue: {"label": "Inspection mission", "steps": []},
  PadInspector: {"label": "Board pads", "pads": []},
  DesignRuleResults: {"label": "Board rule results", "violations": []},
  ColonyPlate: {"label": "Plate annotations", "markers": []},
  CultureLog: {"label": "Culture observations", "cultureId": "Example culture", "sampleId": "Example sample", "observations": []},

  AssemblyVariantMatrix: {"label": "Assembly variants", "references": [], "variants": []},
  CoordinateReferenceField: {"label": "Map coordinates", "axes": [], "references": []},
  DatumTransformPicker: {"label": "Datum transformation", "sourceReference": "Source", "destinationReference": "Destination", "transformations": []},
  RasterBandMixer: {"label": "Raster bands", "bands": []},
  Patchbay: {"label": "Audio routes", "sources": [], "destinations": []},
  KerningPairEditor: {"label": "Pair spacing", "pairs": [], "fontFamily": "serif", "unitsPerEm": 1000},
  StagePositionList: {
    label: "Recorded stage positions", coordinateFrame: { id: "stage-smoke", label: "Supplied frame" }, units: { x: "µm", y: "µm", z: "µm" },
    positions: [{ id: "field-01", name: "Overview", x: 0.0001, y: null, z: 0, enabled: true }, { id: "field-02", name: "Detail", x: -12.5, y: 20, z: null, enabled: false }],
    value: "field-01", name: "stage-position", onValueChange() {}, onEnabledChange() {}, onOrderChange() {}, onRemove() {},
  },
  StackNavigator: {"label": "Image stack", "axes": []},
  AcquisitionSequencer: {"label": "Acquisition steps", "steps": [], "channels": []},
  SequenceAlignment: {"label": "Aligned reads", "contig": "chr1", "referenceLabel": "Example reference", "referenceSequence": "AC", "positions": [1, 2], "reads": []},
  CoverageInspector: {"label": "Coverage", "contig": "chr1", "loci": [{"position": 1, "depth": 0}]},
  GenomicRegionField: {"label": "Region", "reference": "Example reference", "contigs": [{"id": "chr1", "length": 100}]},
  AlarmPanel: {"label": "Plant alarms", "alarms": []},
  WorkOffsetPanel: {"label": "Work coordinates", "axes": [], "systems": [], "activeSystemId": null},

  NumberField: { label: "Count", defaultValue: 3 }, RangeSlider: { label: "Range" }, MultiSelect: { label: "Cities", options: [{ value: "a", label: "Alkmaar" }] }, TagInput: { label: "Tags" },
  TimeField: { label: "Time" }, TransferList: { options: [{ value: "a", label: "Alkmaar" }] },
  DescriptionList: { items: [{ id: "range", label: "Range", value: "386 km" }] }, Metric: { label: "Range", value: 386 },
  ActivityTimeline: { events: [{ id: "event", title: "Published", dateTime: "2026-09-06T09:00:00Z" }] }, CodeBlock: { code: "const count = 3;" }, JSONViewer: { data: { count: 3 } }, DiffViewer: { before: "before", after: "after" },
  ErrorSummary: { errors: [{ id: "email", message: "Enter an email" }] }, TaskProgress: { label: "Upload", state: "pending" }, ConnectionStatus: { state: "connected" },
  TreeView: { label: "Files", nodes: [{ id: "file", label: "Readme" }] }, Toolbar: { label: "Actions", actions: [] }, BottomNavigation: { items: [] }, OverflowList: { items: [] }, QueryBuilder: { fields: [] },
  VirtualList: { label: "Records", items: [] }, MasterDetail: { items: [] }, PropertyGrid: { fields: [] },
  MediaScrubber: { duration: 60 }, MediaPlayer: { src: "/recording.mp3", label: "Recording" }, Waveform: { samples: [0.2, 0.6], duration: 60 }, ImageViewer: { images: [] },
  MessageComposer: { compact: true, maxRows: 6, defaultValue: "Review the launch brief", tools: h(R.Button, { variant: "subtle" }, "Add context"), onSend() {} }, FileBrowser: { entries: [] }, KanbanBoard: { columns: [] }, Scheduler: { events: [], defaultView: "agenda", defaultValue: new Date("2026-09-06T00:00:00Z"), timeZone: "UTC" },
  HealthMetric: { label: "Recorded amount", value: 2, unit: "units", status: "available", source: "Fictional fixture" },
  ReferenceRange: { label: "Example assay", value: 2, minimum: 1, maximum: 3, unit: "units", rangeLabel: "Supplied example interval" },
  LabResults: { label: "Example results", results: [{ id: "assay", name: "Example assay", value: 2, unit: "units", status: "final", minimum: 1, maximum: 3, note: "Fictional fixture" }] },
  SymptomDiary: { entries: [{ id: "entry", symptom: "Reported discomfort", dateTime: "2026-09-14T08:00:00+02:00", timeLabel: "14 September, 08:00 UTC+02:00", intensity: "As reported", notes: "Fictional fixture" }] },
  ActivityGoal: { label: "Personal activity goal", current: 2, target: 3, unit: "sessions" },
  HabitTracker: { label: "Example habit", days: [{ date: "2026-09-14", label: "14 September", status: "unrecorded" }], onDayChange() {} },
  CheckIn: { label: "How was your day?", options: [{ value: "steady", label: "Steady" }, { value: "difficult", label: "Difficult" }], value: null, onValueChange() {} },
  SleepTimeline: { label: "Recorded sleep", start: 0, end: 120, startLabel: "22:00", endLabel: "00:00", intervals: [{ id: "asleep", start: 0, end: 90, startLabel: "22:00", endLabel: "23:30", state: "asleep" }, { id: "unknown", start: 90, end: 120, startLabel: "23:30", endLabel: "00:00", state: "unknown" }] },
  PatientBanner: { patientName: "Robin Ellis", identifiers: [{ id: "record", label: "Patient ID", value: "Demo 042" }], contextItems: [{ id: "allergies", label: "Allergies", value: "Not reviewed" }] },
  MedicationSchedule: { timeZone: "Europe/Amsterdam, UTC+02:00", dateLabel: "14 September 2026", items: [{ id: "morning", name: "Example medication", dose: "Supplied dose", timeLabel: "08:00", status: "Not recorded", instructions: "Supplied instructions", actions: [{ id: "taken", label: "Record as taken" }] }], onAction() {} },
  AppointmentCard: { appointmentTitle: "Care team check-in", dateLabel: "18 September 2026", timeLabel: "10:30–11:00", timeZone: "Europe/Amsterdam, UTC+02:00", dateTime: "2026-09-18T10:30:00+02:00", clinician: "Alex Morgan", location: "Demo clinic", status: "Awaiting confirmation" },
  CarePlan: { tasks: [{ id: "questions", title: "Prepare questions", owner: "Robin Ellis", dueLabel: "17 September", status: "Open", completed: false }], onCompletedChange() {} },
  ActivityRings: { label: "Personal goals", goals: [{ id: "walk", label: "Walking", current: 18, target: 30, unit: "minutes" }, { id: "read", label: "Reading", current: null, target: 20, unit: "minutes" }] },
  IdentityDocument: { documentTitle: "Residence document", holderName: "Robin Ellis", maskedIdentifier: "•••• 2048", issuer: "Example civic office", status: "Verification pending" },
  TaxSummary: { label: "Annual assessment", periodLabel: "2025", reference: "Example 204", status: "Provisional", items: [{ id: "assessment", label: "Assessed amount", amount: "€ 240.00" }], totals: [{ id: "payable", label: "Amount payable", amount: "€ 240.00" }] },
  BenefitProgram: { programName: "Community project grant", status: "Applications open", eligibility: "Not assessed", criteria: [{ id: "location", label: "Project location", status: "Not reviewed" }] },
  ApplicationStatus: { applicationTitle: "Grant application", reference: "Example 204", status: "Under review", milestones: [{ id: "review", label: "Evidence review", status: "In progress", current: true }], nextStep: "Wait for the provider update" },
  EvidenceChecklist: { label: "Application evidence", items: [{ id: "address", label: "Proof of address", status: "Awaiting review", fileName: "Example-address.pdf", actions: [{ id: "view", label: "View record" }] }], onAction() {} },
  MeasurementValue: { label: "Sample mass", value: "2.400", unit: "g", uncertainty: 0.001, source: "Example balance" },
  QuantityField: { label: "Sample quantity", units: [{ value: "g", label: "Grams" }], defaultValue: { amount: 2.4, unit: "g" } },
  WellPlate: { label: "Example plate", rows: ["A", "B"], columns: ["1", "2"], wells: [{ row: "A", column: "1", status: "Recorded", label: "Sample 01" }], onValueChange() {} },
  ExperimentRun: { label: "Sample preparation", runId: "Example 204", status: "Paused", conditions: [{ id: "batch", label: "Batch", value: "Example 01" }], steps: [{ id: "prepare", label: "Prepare sample", status: "Awaiting operator", actions: [{ id: "resume", label: "Request resume" }] }], onAction() {} },
  SpectrumPlot: { label: "Recorded spectrum", xLabel: "Wavelength", yLabel: "Intensity", xUnit: "nm", points: [{ x: 400, y: 0.2 }, { x: 500, y: 0.6 }, { x: 600, y: 0.3 }], peaks: [{ id: "annotation", x: 500, y: 0.6, label: "Supplied annotation" }] },
  AudioMeter: { label: "Output levels", channels: [{ id: "left", label: "Left", level: -18, peak: -6 }, { id: "right", label: "Right", level: -20, peak: -8 }] },
  ChannelStrip: { label: "Dialogue", defaultValue: { gain: -6, pan: 0, muted: false, solo: false } },
  ParameterKnob: { label: "Mix", defaultValue: 40, min: 0, max: 100, unit: "%" },
  TimecodeField: { label: "In point", frameRate: 25, defaultValue: "00:01:12:10" },
  ClipTimeline: { label: "Edit timeline", tracks: [{ id: "video", label: "Video" }], clips: [{ id: "opening", trackId: "video", label: "Opening", start: 0, duration: 5 }], duration: 30, unit: "seconds", position: 2, onSeek() {}, onSelectClip() {} },
  RenderQueue: { label: "Export queue", jobs: [{ id: "draft", label: "Draft export", status: "rendering", progress: 25 }, { id: "failed", label: "Previous export", status: "failed", detail: "Example failure" }], onCancel() {}, onRetry() {} },
  LayerStack: { label: "Document layers", layers: [{ id: "title", label: "Title", visible: true, locked: false }], selectedId: "title", onSelect() {}, onLayersChange() {} },
  ColorInspector: { label: "Fill", defaultValue: { hex: "#808080", alpha: 1 } },
  SpacingControl: { label: "Padding", defaultValue: { top: 8, right: 12, bottom: 8, left: 12 }, unit: "px" },
};
function withOwner(exported, element) {
  if (exported === "AudioPlayerControls") return h(R.AudioPlayer, { title: "Spoken brief", src: "/brief.wav" }, element);
  if (exported === "Attachment") return h(R.Attachments, null, element);
  if (exported === "IOSListRow") return h(R.IOSList, { title: "Connections" }, element);
  if (exported === "AndroidListRow") return h(R.AndroidList, { "aria-label": "Connections" }, element);
  if (exported === "AndroidSheetTitle") return h(R.AndroidSheet, { open: false, onOpenChange() {} }, element);
  if (exported === "AndroidSheetBody") return h(R.AndroidSheet, { open: false, onOpenChange() {} }, h(R.AndroidSheetTitle, null, "Connection settings"), element);
  return element;
}
let additionHtml = "";
for (const [name, exported] of additions) {
  if (!R[exported]) throw new Error("Missing root export: " + exported);
  const leaf = await import("@noorddev/vlak-react/components/" + name);
  if (leaf[exported] !== R[exported]) throw new Error("Mismatched leaf export: " + exported);
  const element = h(R[exported], fixtureProps[exported] ?? {});
  const markup = renderToString(withOwner(exported, element));
  if (!markup.includes("rs-")) throw new Error("Empty or unstyled SSR: " + exported);
  if (["IOSSwitch", "AndroidSwitch"].includes(exported) && !(markup.includes('type="checkbox"') && markup.includes('role="switch"') && markup.includes('checked=""'))) throw new Error("Native switch lost its input or supplied checked state: " + exported);
  if (["IOSSearchField", "AndroidSearchBar"].includes(exported) && !(markup.includes('type="search"') && markup.includes('value="Project"'))) throw new Error("Native search lost its input or supplied query: " + exported);
  if (exported === "IOSSlider" && !(markup.includes('type="range"') && markup.includes('value="40"'))) throw new Error("IOSSlider lost its native range input or supplied value");
  if (exported === "AndroidChip" && !markup.includes('aria-pressed="true"')) throw new Error("AndroidChip lost its supplied selection");
  if (["IOSSheet", "AndroidSheet", "AndroidSheetTitle", "AndroidSheetBody"].includes(exported) && !(markup.startsWith("<dialog") && markup.includes("Connection settings"))) throw new Error("Native sheet compound lost its owning dialog or title: " + exported);
  if (exported === "StagePositionList" && !(markup.startsWith("<fieldset") && markup.includes("Supplied frame (stage-smoke)") && markup.includes(">0.0001<") && markup.includes(">0<") && markup.includes("Not supplied") && markup.includes("field-01") && markup.includes("Move down"))) throw new Error("Stage position fixture lost its native root, coordinate context or supplied values");
  if (exported === "Attachment" && (!markup.includes('download="drawing.svg"') || markup.includes('target="_blank"'))) throw new Error("Local attachments must download instead of opening an active document");
  if (exported === "ResponseBranch" && (!markup.includes("Revised recorded response") || markup.includes("First recorded response"))) throw new Error("ResponseBranch must render only the selected alternative");
  if (exported === "EnvironmentVariables" && markup.includes("private-smoke-fixture")) throw new Error("Environment values must remain masked in server output");
  additionHtml += markup;
}
for (const [name, exported] of [["attachments", "useFileAttachments"], ["mic-selector", "useAudioDevices"], ["audio-player", "useAudioPlayer"], ["conversation-export", "serializeConversation"], ["tool-call", "getToolCallPresentation"], ["stack-trace", "parseStackTrace"], ["environment-variables", "formatEnvironmentExports"]]) {
  const leaf = await import("@noorddev/vlak-react/components/" + name);
  if (typeof R[exported] !== "function" || leaf[exported] !== R[exported]) throw new Error("Missing or mismatched helper export: " + exported);
}
const transcript = R.serializeConversation(fixtureProps.ConversationDownload.messages, { title: "Brief review" });
if (!transcript.includes("## user") || !transcript.includes("One finding") || transcript.includes("[object Object]")) throw new Error("Structured conversation export failed");
if (R.getToolCallPresentation({ type: "dynamic-tool", toolName: "Read brief", state: "input-available" }).state !== "queued") throw new Error("Tool input availability must not imply execution");
console.log("  ✓ all " + additions.length + " new root/leaf exports render, " + additionHtml.length + " chars");
`;

// Optional engines are installed only after both clean core consumers have passed.
// These checks exercise the packed entry points, not a source checkout or bundler alias.
const renderOptional = `const optionalAdditions = ${JSON.stringify(optionalAdditions)};\n` + String.raw`
import { createElement as h } from "react";
import { renderToString } from "react-dom/server";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import props from "@noorddev/vlak/props" with { type: "json" };
import { catalogComponents } from "@noorddev/vlak";
import * as R from "@noorddev/vlak-react";
import { ResponseMarkdown } from "@noorddev/vlak-react/components/response-markdown";
import { HighlightedCode } from "@noorddev/vlak-react/components/highlighted-code";
import { JSXPreview } from "@noorddev/vlak-react/components/jsx-preview";
import * as W from "@noorddev/vlak-react/components/workflow-canvas";
const require = createRequire(import.meta.url);
const assert = (ok, message) => { if (!ok) throw new Error(message); };
for (const [name, exported] of optionalAdditions) {
  assert(!(exported in R), "Optional renderer leaked into the core entry: " + exported);
  assert(props.components[name]?.exports.some(entry => entry.name === exported), "Missing optional props: " + exported);
  const component = catalogComponents.find(entry => entry.name === name);
  assert(component?.reactImport === "@noorddev/vlak-react/components/" + name, "Missing optional import metadata: " + name);
  assert(component.dependencies?.length > 0, "Missing optional dependency metadata: " + name);
  for (const dependency of component.dependencies) {
    // Registry install specifications include ranges; module resolution needs only the package name.
    const version = dependency.lastIndexOf("@");
    import.meta.resolve(version > 0 ? dependency.slice(0, version) : dependency);
  }
}
const fence = String.fromCharCode(96).repeat(3);
const source = "const count = 3;";
const code = renderToString(h(HighlightedCode, { code: source, language: "typescript", lineNumbers: true, filename: "count.ts" }));
assert(code.includes(source) && code.includes("rs-highlighted-code") && code.includes("Copy code"), "HighlightedCode must server-render readable source and controls");
const unknown = renderToString(h(HighlightedCode, { code: "custom => syntax", language: "not-a-real-language" }));
assert(unknown.includes("custom =&gt; syntax"), "Unknown code languages must retain plain source");
const markdown = ["# Review", "", "| Owner | State |", "| --- | --- |", "| Robin | Ready |", "", "- [x] Brief reviewed", "", fence + "ts", source, fence, "", "$$", "x^2 + 1", "$$"].join("\n");
const rich = renderToString(h(ResponseMarkdown, { children: markdown }));
assert(rich.includes("rs-response-markdown") && rich.includes("<table") && rich.includes("katex") && rich.includes(source), "Rich response lost Markdown, code, table or math output");
const partial = renderToString(h(ResponseMarkdown, { streaming: true, children: "A **partial response\n\n" + fence + "ts\nconst pending =" }));
assert(partial.includes("partial response") && partial.includes("const pending ="), "Partial streamed syntax must remain readable");
const unsafe = renderToString(h(ResponseMarkdown, { children: '[unsafe](javascript:alert(1))\n\n<script>alert(1)</script>\n\n![Remote diagram](https://untrusted.example/image.png)' }));
assert(!/href="javascript:|<script\b|<img\b/.test(unsafe), "Markdown must not activate unsafe links, raw HTML or unapproved remote images");
const image = renderToString(h(ResponseMarkdown, { baseUrl: "https://assets.example/docs/", imageOrigins: ["https://assets.example"], children: "![Diagram](diagram.png)" }));
assert(image.includes('src="https://assets.example/docs/diagram.png"'), "An allowed relative image must use its validated resolved origin");
const diagram = renderToString(h(ResponseMarkdown, { children: fence + "mermaid\ngraph TD; Brief-->Review;\n" + fence }));
assert(diagram.includes("Brief") && diagram.includes("Review"), "Mermaid must server-render a readable source fallback");
assert(readFileSync(require.resolve("katex/dist/katex.min.css"), "utf8").includes(".katex"), "KaTeX stylesheet is unavailable");
const preview = renderToString(h(JSXPreview, { jsx: '<div>{summary}</div>', bindings: { summary: "Ready for review" } }));
assert(preview.includes("rs-jsx-preview") && preview.includes("Preparing preview"), "JSXPreview must expose its honest server placeholder");
const rejected = renderToString(h(JSXPreview, { jsx: '<script>alert(1)</script>' }));
assert(rejected.includes('role="alert"') && !rejected.includes("<script>"), "JSXPreview must reject active markup even before mounting");
for (const exported of ["WorkflowCanvas", "WorkflowNode", "WorkflowEdge", "WorkflowConnection", "WorkflowControls", "WorkflowPanel", "WorkflowToolbar"]) {
  assert(typeof W[exported] === "function" || typeof W[exported] === "object", "Missing workflow export: " + exported);
  assert(props.components["workflow-canvas"]?.exports.some(entry => entry.name === exported), "Missing workflow props: " + exported);
}
const graph = renderToString(h(W.WorkflowCanvas, {
  width: 900, height: 400, style: { height: 400 }, fitView: false,
  nodes: [{ id: "brief", type: "vlak", position: { x: 20, y: 20 }, width: 288, height: 120, data: { title: "Read brief", target: false } }, { id: "review", type: "vlak", position: { x: 380, y: 20 }, width: 288, height: 120, data: { title: "Review owners", source: false } }],
  edges: [{ id: "brief-review", type: "vlak", source: "brief", target: "review" }], onNodesChange() {}, onEdgesChange() {}, onConnect() {},
}, h(W.WorkflowControls), h(W.WorkflowPanel, { position: "top-left" }, "Review workflow")));
assert(graph.includes("react-flow") && graph.includes("rs-workflow-canvas") && graph.includes("Review workflow"), "WorkflowCanvas must render the real engine and composed panel");
const workflowCss = readFileSync(require.resolve("@noorddev/vlak-react/workflow.css"), "utf8");
assert(workflowCss.includes("@layer vlak.engine {") && workflowCss.includes(".react-flow__edge-path") && workflowCss.includes("MIT License") && workflowCss.includes("Copyright") && !/@import\b/.test(workflowCss), "Workflow stylesheet must bundle engine rules in the lower cascade layer, preserve the MIT notice, and avoid unresolved imports");
console.log("  ✓ optional Markdown/code/math, safe URLs, JSX boundary, and real graph entries server-render");
`;

function sourceFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? sourceFiles(join(dir, entry.name)) : /\.(ts|tsx)$/.test(entry.name) ? [join(dir, entry.name)] : []);
}

try {
  /* 1. Pack. */
  const tarballs = {};
  for (const pkg of ["core", "react", "cli"]) {
    const out = run(`pnpm pack --pack-destination ${work}`, join(root, "packages", pkg)).trim().split("\n").pop();
    tarballs[pkg] = out;
    log(`packed ${pkg}: ${out.split("/").pop()}`);
  }

  /* 2. publint + are-the-types-wrong. */
  for (const [pkg, file] of Object.entries(tarballs)) {
    run(`npx publint ${file}`, root);
    if (pkg !== "cli") run(`npx attw ${file} --profile esm-only`, root);
    log(`${pkg}: publint and attw clean`);
  }

  /* 3. A consumer project. */
  writeFileSync(join(work, "package.json"), JSON.stringify({ name: "consumer", private: true, type: "module" }, null, 2));
  run(`npm install --no-audit --no-fund --silent react@19 react-dom@19 ${tarballs.core} ${tarballs.react} ${tarballs.cli}`);
  log("installed into a consumer project");

  writeFileSync(
    join(work, "render.mjs"),
    `
import { renderToString } from "react-dom/server";
import { createElement as h } from "react";
import { vlakTokens, catalogComponents } from "@noorddev/vlak";
import props from "@noorddev/vlak/props" with { type: "json" };
import * as vlak from "@noorddev/vlak-react";
import { Button } from "@noorddev/vlak-react/components/button";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
${withoutOptionalEngines}
const checks = [];
checks.push(["tokens", vlakTokens.color.light.paper === "#FAF8F2"]);
checks.push(["catalogue", catalogComponents.length === ${expectedCatalogueSize}]);
checks.push(["props json", typeof props.components === "object"]);
checks.push(["optional engines remain subpaths", ${JSON.stringify(optionalAdditions)}.every(([, exported]) => !(exported in vlak))]);
require("node:fs").writeFileSync(new URL("./catalogue.json", import.meta.url), JSON.stringify(catalogComponents));
const R = vlak;
${renderAdditions}
checks.push(["new component props", additions.every(([name, exported]) => props.components[name]?.exports.some(entry => entry.name === exported))]);
const stageProps = props.components["stage-position-list"]?.exports.find(entry => entry.name === "StagePositionList");
checks.push(["stage position contract", stageProps?.ref === "HTMLFieldSetElement" && ["label", "coordinateFrame", "units", "positions"].every(name => stageProps.props.some(prop => prop.name === name && prop.required)) && ["value", "onValueChange", "onEnabledChange", "onOrderChange", "onRemove", "readOnly"].every(name => stageProps.props.some(prop => prop.name === name))]);
const html = renderToString(h("div", null,
  h(Button, null, "Hi"),
  h(vlak.Dialog, { open: false, onClose() {} }, h(vlak.DialogTitle, null, "T")),
  h(vlak.Select, { options: [{ value: "a", label: "A" }], value: "a", onValueChange() {} }),
  h(vlak.Tabs, { defaultValue: "a" }, h(vlak.TabList, null, h(vlak.Tab, { value: "a" }, "A")), h(vlak.TabPanel, { value: "a" }, "P")),
  h(vlak.LineChart, { series: [{ name: "Sheets", values: [1, 2, 3] }], labels: ["Mon", "Tue", "Wed"] }),
));
checks.push(["ssr renders", html.includes("rs-btn-primary")]);
checks.push(["css export", require.resolve("@noorddev/vlak/css").endsWith("vlak.css")]);
checks.push(["react css export", require.resolve("@noorddev/vlak-react/css").endsWith("vlak-react.css")]);
checks.push(["runtime tokens are var()", String(vlak.vlak.ink).startsWith("var(--") && vlak.phone.startsWith("@media")]);
/* The .stylex file is for a consumer's StyleX compiler and must stay uncompiled; it is never imported at runtime. */
checks.push(["stylex token file is uncompiled", (await import("node:fs")).readFileSync(require.resolve("@noorddev/vlak-react/tokens.stylex"), "utf8").includes("defineVars(")]);
const failed = checks.filter(([, ok]) => !ok);
for (const [name, ok] of checks) console.log((ok ? "  ✓ " : "  ✗ ") + name);
if (failed.length) process.exit(1);
`,
  );
  const out = run("node render.mjs");
  process.stdout.write(out);

  /* 3b. React 18: the peer range allows it, so every export must render there too,
     with no unknown-prop warnings (popoverTarget and inert are spelled per version). */
  const r18 = join(work, "r18");
  run(`mkdir -p ${r18}`);
  writeFileSync(join(r18, "package.json"), JSON.stringify({ name: "consumer-r18", private: true, type: "module" }, null, 2));
  run(`npm install --no-audit --no-fund --silent react@18 react-dom@18 ${tarballs.core} ${tarballs.react}`, r18);
  writeFileSync(
    join(r18, "render.mjs"),
    `
import { renderToString } from "react-dom/server";
import { createElement as h } from "react";
import * as R from "@noorddev/vlak-react";
${withoutOptionalEngines}
const warnings = new Set();
console.error = (...a) => { let i = 1; warnings.add(String(a[0]).replace(/%s/g, () => String(a[i++])).slice(0, 120)); };
${renderAdditions}
const html = renderToString(h("div", null,
  h(R.Popover, { trigger: "More" }, h(R.PopoverBody, null, "Body")),
  h(R.CrumbBar, { trail: [{ label: "Docs", href: "#" }, { label: "Here" }] }),
  h(R.Dialog, { open: true, onClose() {} }, h(R.DialogTitle, null, "T"), h(R.DialogBody, null, "B")),
  h(R.Select, { options: [{ value: "a", label: "A" }], value: "a", "aria-label": "Pick" }),
  h(R.Tabs, { defaultValue: "a" }, h(R.TabList, null, h(R.Tab, { value: "a" }, "A")), h(R.TabPanel, { value: "a" }, "P")),
  h(R.Button, null, "Go"),
));
const bad = [...warnings].filter((w) => /does not recognize|non-boolean attribute|Invalid DOM property|Each child in a list/.test(w));
console.log("  " + (bad.length ? "✗" : "✓") + " react 18 renders " + html.length + " chars, " + bad.length + " prop warnings");
for (const w of bad) console.log("    " + w);
if (!html.includes("popovertarget=")) { console.log("    ✗ popovertarget attribute missing on React 18"); process.exit(1); }
if (bad.length) process.exit(1);
`,
  );
  process.stdout.write(run("node render.mjs", r18));
  log("react 18 render clean");

  /* 3c. Only now install the explicitly selected optional engines, in each major. */
  const engineArguments = optionalEngines.map(([name, range]) => `'${name}@${range.replaceAll("'", "'\\''")}'`).join(" ");
  for (const [consumer, major] of [[work, 19], [r18, 18]]) {
    run(`npm install --no-audit --no-fund --silent ${engineArguments}`, consumer);
    writeFileSync(join(consumer, "optional.mjs"), renderOptional);
    process.stdout.write(run("node optional.mjs", consumer));
    log(`react ${major}: optional renderer entries clean`);
  }

  /* 4. The CLI from its tarball, offline. */
  const app = join(work, "app");
  run(`mkdir -p ${app}`);
  run("npx vlak init", app);
  const allAdditions = [...additions, ...optionalAdditions];
  const addOutput = run(`npx vlak add button dialog bar-chart ${[...new Set(allAdditions.map(([name]) => name))].join(" ")}`, app);
  for (const f of ["styles/vlak.css", "styles/fonts/inter/OFL.txt", "index.html", "vlak.json", "components/vlak/button.tsx", "components/vlak/dialog.tsx", "components/vlak/charts/bar.tsx", "components/vlak/rs.ts", "components/vlak/use-input-value.ts", "components/vlak/use-overlay-position.ts", "components/vlak/merge-refs.ts"]) {
    if (!existsSync(join(app, f))) throw new Error(`cli: expected ${f}`);
  }
  const listed = JSON.parse(run("npx vlak list --json", app));
  if (!Array.isArray(listed) || listed.length !== expectedCatalogueSize) throw new Error(`cli: expected ${expectedCatalogueSize} public entries, got ${listed.length}`);
  const installedCss = readFileSync(join(app, "styles", "vlak.css"), "utf8");
  const catalogue = JSON.parse(readFileSync(join(work, "catalogue.json"), "utf8"));
  for (const [name, exported] of allAdditions) {
    const file = join(app, "components", "vlak", `${name}.tsx`);
    if (!existsSync(file)) throw new Error(`cli: missing ${name} source`);
    if (!new RegExp(`export (?:const|function|class) ${exported}\\b`).test(readFileSync(file, "utf8"))) throw new Error(`cli: missing ${exported} source export`);
    if (!listed.some(item => item.name === name)) throw new Error(`cli: missing ${name} catalogue entry`);
    // CLI init ships the complete CSS-first stylesheet; add vendors source only.
    const entry = catalogue.find(component => component.name === name);
    if (!entry) throw new Error(`cli: missing ${name} packed registry metadata`);
    if (entry.css.length && !entry.classes.some(className => installedCss.includes(`.${className}`))) throw new Error(`cli: missing ${name} styles in vlak.css`);
    if (name === "conversation-export" && (entry.css.some(file => file !== "components/button.css") || !entry.registryDependencies.includes("button") || !installedCss.includes(".rs-btn-subtle"))) throw new Error("cli: conversation-export must compose the shared Button without a phantom stylesheet");
  }
  for (const [name] of optionalAdditions) {
    const entry = catalogue.find(component => component.name === name);
    for (const dependency of entry.dependencies) if (!addOutput.includes(dependency)) throw new Error(`cli: did not report ${name}'s required ${dependency} package`);
    for (const stylesheet of entry.styles ?? []) {
      if (stylesheet.startsWith("@noorddev/vlak-react/")) {
        const copied = join(app, "styles", "vlak", stylesheet.slice("@noorddev/vlak-react/".length));
        if (!existsSync(copied)) throw new Error(`cli: missing optional engine stylesheet ${copied}`);
      } else if (!addOutput.includes(stylesheet)) throw new Error(`cli: did not report required stylesheet ${stylesheet}`);
    }
  }
  const vendored = sourceFiles(join(app, "components", "vlak"));
  for (const file of vendored) {
    const source = readFileSync(file, "utf8");
    for (const match of source.matchAll(/(?:from\s*|import\s*\()(["'])(\.[^"']+)\1/g)) {
      const target = resolve(dirname(file), match[2]);
      if (![target, `${target}.ts`, `${target}.tsx`, join(target, "index.ts"), join(target, "index.tsx")].some(candidate => existsSync(candidate))) throw new Error(`cli: unresolved ${match[2]} in ${file}`);
    }
    if (/from\s*["']@noorddev\/vlak-react/.test(source)) throw new Error(`cli: vendored source leaked a package dependency in ${file}`);
  }
  log(`cli: all ${new Set(allAdditions.map(([name]) => name)).size} added catalogue entries present, ${vendored.length} source files have complete relative import closure`);
  log(`cli: init + add wrote the tree, list --json has ${listed.length} entries`);

  log("ok");
} finally {
  rmSync(work, { recursive: true, force: true });
}
