"use client";

import type { ComponentType } from "react";
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
