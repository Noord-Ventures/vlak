"use client";

import dynamic from "next/dynamic";

import type { ComponentType } from "react";
import { Use as IOSNavigationBar } from "./ios-navigation-bar/use";
import { Use as IOSTabBar } from "./ios-tab-bar/use";
import { Use as IOSSearchField } from "./ios-search-field/use";
import { Use as IOSSwitch } from "./ios-switch/use";
import { Use as IOSList } from "./ios-list/use";
import { Use as IOSSegmentedControl } from "./ios-segmented-control/use";
import { Use as IOSSlider } from "./ios-slider/use";
import { Use as IOSSheet } from "./ios-sheet/use";
import { Use as AndroidAppBar } from "./android-app-bar/use";
import { Use as AndroidNavigation } from "./android-navigation/use";
import { Use as AndroidSearchBar } from "./android-search-bar/use";
import { Use as AndroidSwitch } from "./android-switch/use";
import { Use as AndroidList } from "./android-list/use";
import { Use as AndroidChip } from "./android-chip/use";
import { Use as AndroidFab } from "./android-fab/use";
import { Use as AndroidSheet } from "./android-sheet/use";
import { Use as AiOpenInChat } from "./open-in-chat/use";
import { Use as AiInlineCitation } from "./inline-citation/use";
import { Use as AiSources } from "./sources/use";
import { Use as AiModelSelector } from "./model-selector/use";
import { Use as AiContextUsage } from "./context-usage/use";
import { Use as AiWebPreview } from "./web-preview/use";
import { Use as AiSandbox } from "./sandbox/use";
import { Use as AiStackTrace } from "./stack-trace/use";
import { Use as AiTerminal } from "./terminal/use";
import { Use as AiAttachments } from "./attachments/use";
import { Use as AiResponseEditor } from "./response-editor/use";
import { Use as AiConversationExport } from "./conversation-export/use";
import { Use as AiGeneratedImage } from "./generated-image/use";
import { Use as AiWorkQueue } from "./work-queue/use";
import { Use as AiSuggestions } from "./suggestions/use";
import { Use as AiCheckpoint } from "./checkpoint/use";
import { Use as AiThoughtSteps } from "./thought-steps/use";
import { Use as AiTask } from "./task/use";
import { Use as AiPlan } from "./plan/use";
import { Use as AiShimmer } from "./shimmer/use";
import { Use as AiResponseBranch } from "./response-branch/use";
import { Use as AiAudioPlayer } from "./audio-player/use";
import { Use as AiPersona } from "./persona/use";
import { Use as AiTranscription } from "./transcription/use";
import { Use as AiVoiceSelector } from "./voice-selector/use";
import { Use as AiSpeechInput } from "./speech-input/use";
import { Use as AiMicSelector } from "./mic-selector/use";
import { Use as AiTestResults } from "./test-results/use";
import { Use as AiSnippet } from "./snippet/use";
import { Use as AiSchemaDisplay } from "./schema-display/use";
import { Use as AiPackageInfo } from "./package-info/use";
import { Use as AiEnvironmentVariables } from "./environment-variables/use";
import { Use as AiCommit } from "./commit/use";
import { Use as AiArtifact } from "./artifact/use";
import { Use as AiAgent } from "./agent/use";
import { Use as Chat } from "./chat/use";
import { Use as Conversation } from "./conversation/use";
import { Use as Response } from "./response/use";
import { Use as ResponseActions } from "./response-actions/use";
import { Use as Widget } from "./widget/use";
import { Use as Reasoning } from "./reasoning/use";
import { Use as ToolCall } from "./tool-call/use";
import { Use as Confirmation } from "./confirmation/use";
import { JointPanelUse as JointPanel } from "./joint-panel/use";
import { RobotPoseUse as RobotPose } from "./robot-pose/use";
import { RobotMissionQueueUse as RobotMissionQueue } from "./robot-mission-queue/use";
import { Use as PadInspector } from "./pad-inspector/use";
import { Use as DesignRuleResults } from "./design-rule-results/use";
import { Use as ColonyPlate } from "./colony-plate/use";
import { Use as CultureLog } from "./culture-log/use";

import { Use as AssemblyVariantMatrix } from "./assembly-variant-matrix/use";
import { Use as CoordinateReferenceField } from "./coordinate-reference-field/use";
import { Use as DatumTransformPicker } from "./datum-transform-picker/use";
import { Use as RasterBandMixer } from "./raster-band-mixer/use";
import { Use as Patchbay } from "./patchbay/use";
import { Use as KerningPairEditor } from "./kerning-pair-editor/use";
import { Use as StackNavigator } from "./stack-navigator/use";
import { Use as StagePositionList } from "./stage-position-list/use";
import { Use as AcquisitionSequencer } from "./acquisition-sequencer/use";
import { Use as SequenceAlignment } from "./sequence-alignment/use";
import { Use as CoverageInspector } from "./coverage-inspector/use";
import { Use as GenomicRegionField } from "./genomic-region-field/use";
import { Use as AlarmPanel } from "./alarm-panel/use";
import { Use as WorkOffsetPanel } from "./work-offset-panel/use";

import { Use as IdentityDocument } from "./identity-document/use";
import { Use as TaxSummary } from "./tax-summary/use";
import { Use as BenefitProgram } from "./benefit-program/use";
import { Use as ApplicationStatus } from "./application-status/use";
import { Use as EvidenceChecklist } from "./evidence-checklist/use";
import { Use as MeasurementValue } from "./measurement-value/use";
import { Use as QuantityField } from "./quantity-field/use";
import { Use as WellPlate } from "./well-plate/use";
import { Use as ExperimentRun } from "./experiment-run/use";
import { Use as SpectrumPlot } from "./spectrum-plot/use";
import { Use as AudioMeter } from "./audio-meter/use";
import { Use as ChannelStrip } from "./channel-strip/use";
import { Use as ParameterKnob } from "./parameter-knob/use";
import { Use as TimecodeField } from "./timecode-field/use";
import { Use as ClipTimeline } from "./clip-timeline/use";
import { Use as RenderQueue } from "./render-queue/use";
import { Use as LayerStack } from "./layer-stack/use";
import { Use as ColorInspector } from "./color-inspector/use";
import { Use as SpacingControl } from "./spacing-control/use";
import { Use as HealthMetric } from "./health-metric/use";
import { Use as ReferenceRange } from "./reference-range/use";
import { Use as LabResults } from "./lab-results/use";
import { Use as SymptomDiary } from "./symptom-diary/use";
import { Use as CheckIn } from "./check-in/use";
import { Use as HabitTracker } from "./habit-tracker/use";
import { Use as SleepTimeline } from "./sleep-timeline/use";
import { Use as ActivityGoal } from "./activity-goal/use";
import { Use as ActivityRings } from "./activity-rings/use";
import { Use as PatientBanner } from "./patient-banner/use";
import { Use as MedicationSchedule } from "./medication-schedule/use";
import { Use as AppointmentCard } from "./appointment-card/use";
import { Use as CarePlan } from "./care-plan/use";
import { Use as PlaybackControls } from "./playback-controls/use";
import { Use as MediaScrubber } from "./media-scrubber/use";
import { Use as MediaPlayer } from "./media-player/use";
import { Use as Waveform } from "./waveform/use";
import { Use as ImageViewer } from "./image-viewer/use";
import { Use as CanvasControls } from "./canvas-controls/use";
import { Use as MessageComposer } from "./message-composer/use";
import { Use as FileBrowser } from "./file-browser/use";
import { Use as KanbanBoard } from "./kanban-board/use";
import { Use as Scheduler } from "./scheduler/use";
import { Use as NumberField } from "./number-field/use";
import { Use as RangeSlider } from "./range-slider/use";
import { Use as MultiSelect } from "./multi-select/use";
import { Use as TagInput } from "./tag-input/use";
import { Use as DateRangePicker } from "./date-range-picker/use";
import { Use as TimeField } from "./time-field/use";
import { Use as FileUpload } from "./file-upload/use";
import { Use as TransferList } from "./transfer-list/use";
import { Use as InlineEdit } from "./inline-edit/use";
import { Use as Rating } from "./rating/use";
import { Use as DescriptionList } from "./description-list/use";
import { Use as Metric } from "./metric/use";
import { Use as ActivityTimeline } from "./activity-timeline/use";
import { Use as CodeBlock } from "./code-block/use";
import { Use as JsonViewer } from "./json-viewer/use";
import { Use as DiffViewer } from "./diff-viewer/use";
import { Use as ErrorSummary } from "./error-summary/use";
import { Use as NotificationCenter } from "./notification-center/use";
import { Use as TaskProgress } from "./task-progress/use";
import { Use as ConnectionStatus } from "./connection-status/use";
import { Use as TreeView } from "./tree-view/use";
import { Use as Toolbar } from "./toolbar/use";
import { Use as BottomNavigation } from "./bottom-navigation/use";
import { Use as OverflowList } from "./overflow-list/use";
import { Use as FilterBar } from "./filter-bar/use";
import { Use as QueryBuilder } from "./query-builder/use";
import { Use as SortableList } from "./sortable-list/use";
import { Use as VirtualList } from "./virtual-list/use";
import { Use as MasterDetail } from "./master-detail/use";
import { Use as PropertyGrid } from "./property-grid/use";

/** Contextual examples for In action. Never use these as raw previews. */
export const additions: Record<string, ComponentType> = {
  "ios-navigation-bar": IOSNavigationBar,
  "ios-tab-bar": IOSTabBar,
  "ios-search-field": IOSSearchField,
  "ios-switch": IOSSwitch,
  "ios-list": IOSList,
  "ios-segmented-control": IOSSegmentedControl,
  "ios-slider": IOSSlider,
  "ios-sheet": IOSSheet,
  "android-app-bar": AndroidAppBar,
  "android-navigation": AndroidNavigation,
  "android-search-bar": AndroidSearchBar,
  "android-switch": AndroidSwitch,
  "android-list": AndroidList,
  "android-chip": AndroidChip,
  "android-fab": AndroidFab,
  "android-sheet": AndroidSheet,
  "jsx-preview": dynamic(() => import("./jsx-preview/use").then(module => module.Use)),
  "open-in-chat": AiOpenInChat,
  "inline-citation": AiInlineCitation,
  "sources": AiSources,
  "model-selector": AiModelSelector,
  "context-usage": AiContextUsage,
  "web-preview": AiWebPreview,
  "sandbox": AiSandbox,
  "stack-trace": AiStackTrace,
  "terminal": AiTerminal,
  "highlighted-code": dynamic(() => import("./highlighted-code/use").then(module => module.Use)),
  "response-markdown": dynamic(() => import("./response-markdown/use").then(module => module.Use)),
  "workflow-canvas": dynamic(() => import("./workflow-canvas/use").then(module => module.Use)),
  "attachments": AiAttachments,
  "response-editor": AiResponseEditor,
  "conversation-export": AiConversationExport,
  "generated-image": AiGeneratedImage,
  "work-queue": AiWorkQueue,
  "suggestions": AiSuggestions,
  "checkpoint": AiCheckpoint,
  "thought-steps": AiThoughtSteps,
  "task": AiTask,
  "plan": AiPlan,
  "shimmer": AiShimmer,
  "response-branch": AiResponseBranch,
  "audio-player": AiAudioPlayer,
  "persona": AiPersona,
  "transcription": AiTranscription,
  "voice-selector": AiVoiceSelector,
  "speech-input": AiSpeechInput,
  "mic-selector": AiMicSelector,
  "test-results": AiTestResults,
  "snippet": AiSnippet,
  "schema-display": AiSchemaDisplay,
  "package-info": AiPackageInfo,
  "environment-variables": AiEnvironmentVariables,
  "commit": AiCommit,
  "artifact": AiArtifact,
  "agent": AiAgent,
  chat: Chat,
  conversation: Conversation,
  response: Response,
  "response-actions": ResponseActions,
  widget: Widget,
  reasoning: Reasoning,
  "tool-call": ToolCall,
  confirmation: Confirmation,
  "joint-panel": JointPanel,
  "robot-pose": RobotPose,
  "robot-mission-queue": RobotMissionQueue,
  "pad-inspector": PadInspector,
  "design-rule-results": DesignRuleResults,
  "colony-plate": ColonyPlate,
  "culture-log": CultureLog,

  "assembly-variant-matrix": AssemblyVariantMatrix,
  "coordinate-reference-field": CoordinateReferenceField,
  "datum-transform-picker": DatumTransformPicker,
  "raster-band-mixer": RasterBandMixer,
  "patchbay": Patchbay,
  "kerning-pair-editor": KerningPairEditor,
  "stack-navigator": StackNavigator,
  "stage-position-list": StagePositionList,
  "acquisition-sequencer": AcquisitionSequencer,
  "sequence-alignment": SequenceAlignment,
  "coverage-inspector": CoverageInspector,
  "genomic-region-field": GenomicRegionField,
  "alarm-panel": AlarmPanel,
  "work-offset-panel": WorkOffsetPanel,

  "identity-document": IdentityDocument,
  "tax-summary": TaxSummary,
  "benefit-program": BenefitProgram,
  "application-status": ApplicationStatus,
  "evidence-checklist": EvidenceChecklist,
  "measurement-value": MeasurementValue,
  "quantity-field": QuantityField,
  "well-plate": WellPlate,
  "experiment-run": ExperimentRun,
  "spectrum-plot": SpectrumPlot,
  "audio-meter": AudioMeter,
  "channel-strip": ChannelStrip,
  "parameter-knob": ParameterKnob,
  "timecode-field": TimecodeField,
  "clip-timeline": ClipTimeline,
  "render-queue": RenderQueue,
  "layer-stack": LayerStack,
  "color-inspector": ColorInspector,
  "spacing-control": SpacingControl,
  "health-metric": HealthMetric,
  "reference-range": ReferenceRange,
  "lab-results": LabResults,
  "symptom-diary": SymptomDiary,
  "check-in": CheckIn,
  "habit-tracker": HabitTracker,
  "sleep-timeline": SleepTimeline,
  "activity-goal": ActivityGoal,
  "activity-rings": ActivityRings,
  "patient-banner": PatientBanner,
  "medication-schedule": MedicationSchedule,
  "appointment-card": AppointmentCard,
  "care-plan": CarePlan,
  "playback-controls": PlaybackControls,
  "media-scrubber": MediaScrubber,
  "media-player": MediaPlayer,
  "waveform": Waveform,
  "image-viewer": ImageViewer,
  "canvas-controls": CanvasControls,
  "message-composer": MessageComposer,
  "file-browser": FileBrowser,
  "kanban-board": KanbanBoard,
  "scheduler": Scheduler,
  "number-field": NumberField,
  "range-slider": RangeSlider,
  "multi-select": MultiSelect,
  "tag-input": TagInput,
  "date-range-picker": DateRangePicker,
  "time-field": TimeField,
  "file-upload": FileUpload,
  "transfer-list": TransferList,
  "inline-edit": InlineEdit,
  "rating": Rating,
  "description-list": DescriptionList,
  "metric": Metric,
  "activity-timeline": ActivityTimeline,
  "code-block": CodeBlock,
  "json-viewer": JsonViewer,
  "diff-viewer": DiffViewer,
  "error-summary": ErrorSummary,
  "notification-center": NotificationCenter,
  "task-progress": TaskProgress,
  "connection-status": ConnectionStatus,
  "tree-view": TreeView,
  "toolbar": Toolbar,
  "bottom-navigation": BottomNavigation,
  "overflow-list": OverflowList,
  "filter-bar": FilterBar,
  "query-builder": QueryBuilder,
  "sortable-list": SortableList,
  "virtual-list": VirtualList,
  "master-detail": MasterDetail,
  "property-grid": PropertyGrid,
};
