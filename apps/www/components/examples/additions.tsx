"use client";

import type { ComponentType } from "react";
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

/** The same real controls power previews and interactive examples. */
export const additions: Record<string, ComponentType> = {
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
