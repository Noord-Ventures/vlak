"use client";

import { useState, type ComponentType } from "react";
import {
  BottomNavigation,
  DateRangePicker,
  FileUpload,
  FilterBar,
  InlineEdit,
  MasterDetail,
  MultiSelect,
  NumberField,
  OverflowList,
  PropertyGrid,
  QueryBuilder,
  RangeSlider,
  Rating,
  SortableList,
  TagInput,
  TimeField,
  Toolbar,
  TransferList,
  TreeView,
  VirtualList,
} from "@noorddev/vlak-react";

const cities = [
  { value: "alkmaar", label: "Alkmaar" },
  { value: "bergen", label: "Bergen" },
  { value: "castricum", label: "Castricum" },
  { value: "heiloo", label: "Heiloo" },
];

const records = Array.from({ length: 200 }, (_, index) => ({
  id: String(index),
  label: `Record ${index + 1}`,
}));

function NumberFieldPreview() {
  return <NumberField label="Quantity" defaultValue={3} min={0} max={20} />;
}

function RangeSliderPreview() {
  return (
    <RangeSlider
      label="Budget"
      defaultValue={[120, 420]}
      min={0}
      max={800}
      step={20}
      formatValue={(value) => `€${value}`}
    />
  );
}

function MultiSelectPreview() {
  return <MultiSelect label="Cities" defaultValue={["alkmaar"]} options={cities} />;
}

function TagInputPreview() {
  return <TagInput label="Tags" defaultValue={["Research", "Design"]} maxTags={5} />;
}

function DateRangePickerPreview() {
  return (
    <DateRangePicker
      label="Dates"
      defaultValue={{ start: "2026-09-08", end: "2026-09-12" }}
      min="2026-09-01"
    />
  );
}

function TimeFieldPreview() {
  return <TimeField label="Start time" defaultValue="09:30" step={900} />;
}

function FileUploadPreview() {
  return (
    <FileUpload
      label="Choose files"
      accept=".pdf,.txt"
      maxFiles={3}
      maxSize={10 * 1024 * 1024}
      description="PDF or text, up to 10 MB each. Files stay on this device."
    />
  );
}

function TransferListPreview() {
  return <TransferList label="Cities" defaultValue={["alkmaar"]} options={cities} />;
}

function InlineEditPreview() {
  return (
    <InlineEdit
      label="Project name"
      defaultValue="Field study"
      validate={(value) => value.trim() ? undefined : "Enter a project name"}
    />
  );
}

function RatingPreview() {
  return <Rating label="Rating" defaultValue={4} max={5} />;
}

function TreeViewPreview() {
  return (
    <TreeView
      label="Studies"
      defaultExpanded={["studies"]}
      defaultValue="drive"
      nodes={[
        {
          id: "studies",
          label: "Studies",
          children: [{ id: "drive", label: "Drive" }, { id: "orbit", label: "Orbit" }],
        },
        { id: "archive", label: "Archive" },
      ]}
    />
  );
}

function ToolbarPreview() {
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  return (
    <Toolbar
      label="Text formatting"
      actions={[
        { id: "bold", label: "Bold", pressed: bold, onAction: () => setBold((value) => !value) },
        { id: "italic", label: "Italic", pressed: italic, onAction: () => setItalic((value) => !value) },
        { id: "underline", label: "Underline", pressed: underline, onAction: () => setUnderline((value) => !value) },
      ]}
    />
  );
}

function BottomNavigationPreview() {
  return (
    <BottomNavigation
      label="Preview navigation"
      current="interfaces"
      items={[
        { id: "components", label: "Components", href: "/components/", icon: "grid" },
        { id: "interfaces", label: "Interfaces", href: "/interfaces/", icon: "layout" },
        { id: "docs", label: "Docs", href: "/docs/", icon: "file-text" },
      ]}
    />
  );
}

function OverflowListPreview() {
  const [pinned, setPinned] = useState(false);
  const [muted, setMuted] = useState(false);
  const [archived, setArchived] = useState(false);
  return (
    <OverflowList
      label="Item actions"
      maxVisible={2}
      items={[
        { id: "pin", label: pinned ? "Unpin" : "Pin", onAction: () => setPinned((value) => !value) },
        { id: "mute", label: muted ? "Unmute" : "Mute", onAction: () => setMuted((value) => !value) },
        { id: "archive", label: archived ? "Restore" : "Archive", onAction: () => setArchived((value) => !value) },
      ]}
    />
  );
}

function FilterBarPreview() {
  return <FilterBar defaultValue={[{ id: "city", label: "Alkmaar" }, { id: "status", label: "Published" }]} />;
}

function QueryBuilderPreview() {
  return (
    <QueryBuilder
      fields={[{ id: "name", label: "Name" }, { id: "range", label: "Range", type: "number" }]}
      defaultValue={{
        id: "root",
        combinator: "and",
        rules: [{ id: "rule", field: "name", operator: "contains", value: "Drive" }],
      }}
    />
  );
}

function SortableListPreview() {
  return (
    <SortableList
      label="Project stages"
      defaultValue={[
        { id: "research", label: "Research" },
        { id: "design", label: "Design" },
        { id: "build", label: "Build" },
      ]}
    />
  );
}

function VirtualListPreview() {
  return <VirtualList label="Records" height={264} items={records} />;
}

function MasterDetailPreview() {
  return (
    <MasterDetail
      label="Preview records"
      defaultValue="north"
      items={[
        { id: "north", label: "North studio", description: "Alkmaar", detail: <span>4 active projects</span> },
        { id: "south", label: "South studio", description: "Utrecht", detail: <span>2 active projects</span> },
      ]}
    />
  );
}

function PropertyGridPreview() {
  return (
    <PropertyGrid
      defaultValue={{ name: "Drive", range: 386, enabled: true }}
      fields={[
        { id: "name", label: "Name" },
        { id: "range", label: "Range", type: "number", unit: "km", min: 0 },
        { id: "enabled", label: "Connected", type: "switch" },
      ]}
    />
  );
}

/** Raw, interactive specimens. Contextual examples belong under In action. */
export const inputNavigationPreviews: Record<string, ComponentType> = {
  "number-field": NumberFieldPreview,
  "range-slider": RangeSliderPreview,
  "multi-select": MultiSelectPreview,
  "tag-input": TagInputPreview,
  "date-range-picker": DateRangePickerPreview,
  "time-field": TimeFieldPreview,
  "file-upload": FileUploadPreview,
  "transfer-list": TransferListPreview,
  "inline-edit": InlineEditPreview,
  rating: RatingPreview,
  "tree-view": TreeViewPreview,
  toolbar: ToolbarPreview,
  "bottom-navigation": BottomNavigationPreview,
  "overflow-list": OverflowListPreview,
  "filter-bar": FilterBarPreview,
  "query-builder": QueryBuilderPreview,
  "sortable-list": SortableListPreview,
  "virtual-list": VirtualListPreview,
  "master-detail": MasterDetailPreview,
  "property-grid": PropertyGridPreview,
};
