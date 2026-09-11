import type { ComponentType } from "react";

type PreviewGroup = Record<string, ComponentType>;
type PreviewLoader = () => Promise<PreviewGroup>;

// Keep names here, implementations in separate chunks. A visit to the basic kit
// should not download clinical, scientific, mobile, or AI demonstrations.
const groups: { names: readonly string[]; load: PreviewLoader }[] = [
  { names: ["attachments"], load: () => import("./ai-attachments").then(module => module.aiAttachmentPreviews) },
  { names: ["context-usage","model-selector","sources","inline-citation","open-in-chat"], load: () => import("./ai-chat-controls").then(module => module.aiChatControlPreviews) },
  { names: ["terminal","stack-trace","sandbox","web-preview","jsx-preview"], load: () => import("./ai-code-tools").then(module => module.aiCodeToolsPreviews) },
  { names: ["agent","artifact","commit","environment-variables","package-info","schema-display","snippet","test-results"], load: () => import("./ai-code").then(module => module.aiCodePreviews) },
  { names: ["audio-player","mic-selector","speech-input","voice-selector","transcription","persona"], load: () => import("./ai-voice").then(module => module.aiVoicePreviews) },
  { names: ["plan","task","thought-steps","checkpoint","suggestions","work-queue","shimmer","generated-image","conversation-export","response-editor"], load: () => import("./ai-work-patterns").then(module => module.aiWorkPatternPreviews) },
  { names: ["workflow-canvas"], load: () => import("./ai-workflow").then(module => module.aiWorkflowPreviews) },
  { names: ["chat","conversation","response","response-actions","widget","reasoning","tool-call","confirmation"], load: () => import("./ai").then(module => module.aiPreviews) },
  { names: ["android-app-bar","android-navigation","android-search-bar","android-switch","android-list","android-chip","android-fab","android-sheet"], load: () => import("./android").then(module => module.androidPreviews) },
  { names: ["identity-document","tax-summary","benefit-program","application-status","evidence-checklist"], load: () => import("./civic").then(module => module.civicPreviews) },
  { names: ["button-group","link","icons","workflow","chip","table","assistant","references","button","callout","badge","card","label","field","form","input-group","native-select","item","empty","spinner","drawer","sidebar","toggle-group","input","inline-form","checkbox","radio","switch","slider","progress","tabs","chart","bar-chart","area-chart","scatter-chart","donut","histogram","small-multiples","collapsible","hover-card","kbd","input-otp","context-menu","menubar","navigation-menu","carousel","resizable","combobox","command","calendar","calendar-popover","date-picker","data-table","concentric-radius","aspect-ratio","accordion","alert","alert-dialog","avatar","textarea","separator","skeleton","tooltip","toast","dropdown-menu","toggle","popover","sheet","scroll-area","crumb-bar","breadcrumbs","pagination","select","dialog","theme-toggle","stepper"], load: () => import("./core").then(module => module.demos) },
  { names: ["audio-meter","channel-strip","parameter-knob","timecode-field","clip-timeline","render-queue","layer-stack","color-inspector","spacing-control"], load: () => import("./creative").then(module => module.creativePreviews) },
  { names: ["description-list","metric","activity-timeline","code-block","json-viewer","diff-viewer","error-summary","notification-center","task-progress","connection-status"], load: () => import("./data").then(module => module.dataPreviews) },
  { names: ["pad-inspector","design-rule-results"], load: () => import("./electronics").then(module => module.electronicsPreviews) },
  { names: ["alarm-panel","work-offset-panel"], load: () => import("./engineering").then(module => module.engineeringPreviews) },
  { names: ["coordinate-reference-field","datum-transform-picker","raster-band-mixer"], load: () => import("./geospatial").then(module => module.geospatialPreviews) },
  { names: ["health-metric","reference-range","lab-results","symptom-diary","check-in","habit-tracker","sleep-timeline","activity-goal","activity-rings","patient-banner","medication-schedule","appointment-card","care-plan"], load: () => import("./health").then(module => module.healthPreviews) },
  { names: ["number-field","range-slider","multi-select","tag-input","date-range-picker","time-field","file-upload","transfer-list","inline-edit","rating","tree-view","toolbar","bottom-navigation","overflow-list","filter-bar","query-builder","sortable-list","virtual-list","master-detail","property-grid"], load: () => import("./input-navigation").then(module => module.inputNavigationPreviews) },
  { names: ["ios-navigation-bar","ios-tab-bar","ios-search-field","ios-switch","ios-list","ios-segmented-control","ios-slider","ios-sheet"], load: () => import("./ios").then(module => module.iosPreviews) },
  { names: ["playback-controls","media-scrubber","media-player","waveform","image-viewer","canvas-controls","message-composer","file-browser","kanban-board","scheduler"], load: () => import("./media").then(module => module.mediaPreviews) },
  { names: ["colony-plate","culture-log"], load: () => import("./microbiology").then(module => module.microbiologyPreviews) },
  { names: ["joint-panel","robot-pose","robot-mission-queue"], load: () => import("./robotics").then(module => module.roboticsPreviews) },
  { names: ["stage-position-list","stack-navigator","acquisition-sequencer","sequence-alignment","coverage-inspector","genomic-region-field"], load: () => import("./science-specialist").then(module => module.scienceSpecialistPreviews) },
  { names: ["measurement-value","quantity-field","well-plate","experiment-run","spectrum-plot"], load: () => import("./science").then(module => module.sciencePreviews) },
  { names: ["patchbay","kerning-pair-editor","assembly-variant-matrix"], load: () => import("./workbench").then(module => module.workbenchPreviews) },
  { names: ["response-branch","highlighted-code","response-markdown"], load: () => import("./ai-rich-response").then(module => ({
    "response-branch": module.ResponseBranchPreview,
    "highlighted-code": module.HighlightedCodePreview,
    "response-markdown": module.MarkdownPreview,
  })) },
];

const loaders = new Map(groups.flatMap(group => group.names.map(name => [name, group.load] as const)));
const pending = new Map<PreviewLoader, Promise<PreviewGroup>>();

export function hasPreview(name: string) {
  return loaders.has(name);
}

export async function loadPreview(name: string): Promise<ComponentType | null> {
  const load = loaders.get(name);
  if (!load) return null;
  let request = pending.get(load);
  if (!request) {
    request = load().catch(error => {
      pending.delete(load);
      throw error;
    });
    pending.set(load, request);
  }
  return (await request)[name] ?? null;
}
