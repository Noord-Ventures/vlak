import * as React from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import * as Vlak from "../src";

/**
 * Every component reaches its root element through `ref`, on React 18
 * and 19 alike. The tables below cover the whole public surface: an
 * export is a component in `cases`, a listed non-component, or a listed
 * component without a DOM root. Anything else fails the coverage test.
 */

/** Exports that are not components: helpers, hooks, tokens, constants. */
const NOT_COMPONENTS = [
  "cx",
  "rs",
  "vlak",
  "phone",
  "mobileGrid",
  "rail",
  "wide",
  "vlakFont",
  "vlakMono",
  "ICON_STROKE",
  "ICON_VIEWBOX",
  "iconInk",
  "filledCutouts",
  "filledMarks",
  "iconGroups",
  "iconLabel",
  "iconNames",
  "resolveIcon",
  "toast",
  "concentricInner",
  "concentricOuter",
  "innerRadius",
  "formatMediaTime",
  "diffLines",
  "describeQuery",
] as const;

/** Components with no single DOM root to forward to, and why. */
const NO_DOM_ROOT: Record<string, string> = {
  Popover: "renders a Fragment: the trigger Button and the top-layer panel are siblings",
};

type AnyProps = Record<string, unknown>;

interface Case {
  /** The smallest props the component renders with. */
  props?: AnyProps;
  /** Tag of the element the ref lands on. */
  tag: string;
  /** Parent the component only renders inside of. */
  wrap?: (el: React.ReactElement) => React.ReactElement;
}

const option = [{ value: "a", label: "A" }];
const items = [{ label: "One" }];
const series = [{ name: "A", values: [1, 2, 3] }];
const noop = () => {};
const dialog = { open: false, onClose: noop };

const inTabs = (el: React.ReactElement) => <Vlak.Tabs defaultValue="a">{el}</Vlak.Tabs>;
const inTable = (el: React.ReactElement) => <Vlak.Table>{el}</Vlak.Table>;
const inTbody = (el: React.ReactElement) => (
  <Vlak.Table>
    <tbody>{el}</tbody>
  </Vlak.Table>
);
const inRow = (el: React.ReactElement) => (
  <Vlak.Table>
    <tbody>
      <tr>{el}</tr>
    </tbody>
  </Vlak.Table>
);

const healthCases: Record<string, Case> = {
  HealthMetric: { props: { label: "Recorded events", value: 0, unit: "events", source: "Diary" }, tag: "div" },
  ReferenceRange: { props: { label: "Reported measurement", value: 24, minimum: 20, maximum: 30, unit: "units" }, tag: "div" },
  LabResults: { props: { label: "Latest report", results: [{ id: "reported", name: "Reported measurement", value: 24, unit: "units", status: "final" }] }, tag: "ul" },
  SymptomDiary: { props: { entries: [{ id: "morning", symptom: "Headache", dateTime: "2026-09-06T09:00:00+02:00", intensity: "Mild", details: "Recorded after breakfast" }] }, tag: "ol" },
  CheckIn: { props: { label: "How is your energy?", options: [{ value: "steady", label: "Steady" }], defaultValue: null }, tag: "fieldset" },
  HabitTracker: { props: { label: "Evening walk", days: [{ date: "2026-09-06", label: "Sun 6 Sep", status: "unrecorded" }], onDayChange: noop }, tag: "div" },
  SleepTimeline: { props: { label: "Last night", start: 0, end: 480, startLabel: "22:30", endLabel: "06:30", intervals: [{ id: "sleep", start: 0, end: 480, startLabel: "22:30", endLabel: "06:30", state: "asleep" }] }, tag: "figure" },
  ActivityGoal: { props: { label: "Walking", current: 24, target: 30, unit: "min" }, tag: "div" },
  PatientBanner: { props: { patientName: "Robin Ellis", identifiers: [{ id: "record", label: "Patient ID", value: "Demo 042" }], contextItems: [{ id: "allergies", label: "Allergies", value: "Not reviewed" }] }, tag: "div" },
  MedicationSchedule: { props: { timeZone: "Europe/Amsterdam, UTC+02:00", items: [{ id: "morning", name: "Example medication", dose: "Supplied dose", timeLabel: "08:00", status: "Not recorded", actions: [{ id: "taken", label: "Record as taken" }] }], onAction: noop }, tag: "div" },
  AppointmentCard: { props: { appointmentTitle: "Care team check-in", dateLabel: "18 September 2026", timeLabel: "10:30", timeZone: "Europe/Amsterdam, UTC+02:00", status: "Awaiting confirmation" }, tag: "div" },
  CarePlan: { props: { tasks: [{ id: "visit", title: "Confirm the next visit", owner: "Robin Ellis", dueLabel: "17 September", status: "Open", completed: false }], onCompletedChange: noop }, tag: "div" },
};

const domainCases: Record<string, Case> = {
  StagePositionList: { tag: "fieldset", props: { label: "Stage positions", coordinateFrame: { id: "stage", label: "Stage frame" }, units: { x: "µm", y: "µm", z: "µm" }, positions: [] } },
  JointPanel: { tag: "fieldset", props: {"label": "Robot joints", "joints": []} },
  RobotPose: { tag: "fieldset", props: {"label": "Recorded pose", "poses": []} },
  RobotMissionQueue: { tag: "fieldset", props: {"label": "Inspection mission", "steps": []} },
  PadInspector: { tag: "fieldset", props: {"label": "Board pads", "pads": []} },
  DesignRuleResults: { tag: "fieldset", props: {"label": "Board rule results", "violations": []} },
  ColonyPlate: { tag: "figure", props: {"label": "Plate annotations", "markers": []} },
  CultureLog: { tag: "div", props: {"label": "Culture observations", "cultureId": "Example culture", "sampleId": "Example sample", "observations": []} },

  AssemblyVariantMatrix: { tag: "fieldset", props: {"label": "Assembly variants", "references": [], "variants": []} },
  CoordinateReferenceField: { tag: "fieldset", props: {"label": "Map coordinates", "axes": [], "references": []} },
  DatumTransformPicker: { tag: "fieldset", props: {"label": "Datum transformation", "sourceReference": "Source", "destinationReference": "Destination", "transformations": []} },
  RasterBandMixer: { tag: "fieldset", props: {"label": "Raster bands", "bands": []} },
  Patchbay: { tag: "fieldset", props: {"label": "Audio routes", "sources": [], "destinations": []} },
  KerningPairEditor: { tag: "fieldset", props: {"label": "Pair spacing", "pairs": [], "fontFamily": "serif", "unitsPerEm": 1000} },
  StackNavigator: { tag: "fieldset", props: {"label": "Image stack", "axes": []} },
  AcquisitionSequencer: { tag: "fieldset", props: {"label": "Acquisition steps", "steps": [], "channels": []} },
  SequenceAlignment: { tag: "div", props: {"label": "Aligned reads", "contig": "chr1", "referenceLabel": "Example reference", "referenceSequence": "AC", "positions": [1, 2], "reads": []} },
  CoverageInspector: { tag: "figure", props: {"label": "Coverage", "contig": "chr1", "loci": [{"position": 1, "depth": 0}]} },
  GenomicRegionField: { tag: "fieldset", props: {"label": "Region", "reference": "Example reference", "contigs": [{"id": "chr1", "length": 100}]} },
  AlarmPanel: { tag: "div", props: {"label": "Plant alarms", "alarms": []} },
  WorkOffsetPanel: { tag: "fieldset", props: {"label": "Work coordinates", "axes": [], "systems": [], "activeSystemId": null} },

  ActivityRings: { props: { label: "Personal goals", goals: [{ id: "walk", label: "Walking", current: 18, target: 30, unit: "minutes" }] }, tag: "figure" },
  IdentityDocument: { props: { documentTitle: "Residence document", holderName: "Robin Ellis", maskedIdentifier: "•••• 2048", status: "Verification pending" }, tag: "div" },
  TaxSummary: { props: { label: "Annual assessment", periodLabel: "2025", status: "Provisional", items: [{ id: "assessment", label: "Assessed amount", amount: "€ 240.00" }], totals: [{ id: "payable", label: "Amount payable", amount: "€ 240.00" }] }, tag: "div" },
  BenefitProgram: { props: { programName: "Community project grant", status: "Applications open", eligibility: "Not assessed", criteria: [{ id: "location", label: "Project location", status: "Not reviewed" }] }, tag: "div" },
  ApplicationStatus: { props: { applicationTitle: "Grant application", reference: "Example 204", status: "Under review", milestones: [{ id: "review", label: "Evidence review", status: "In progress", current: true }] }, tag: "div" },
  EvidenceChecklist: { props: { label: "Application evidence", items: [{ id: "address", label: "Proof of address", status: "Awaiting review", fileName: "Example-address.pdf", actions: [{ id: "view", label: "View record" }] }], onAction: noop }, tag: "div" },
  MeasurementValue: { props: { label: "Sample mass", value: "2.400", unit: "g", uncertainty: 0.001, source: "Example balance" }, tag: "div" },
  QuantityField: { props: { label: "Sample quantity", units: [{ value: "g", label: "Grams" }], defaultValue: { amount: 2.4, unit: "g" } }, tag: "fieldset" },
  WellPlate: { props: { label: "Example plate", rows: ["A", "B"], columns: ["1", "2"], wells: [{ row: "A", column: "1", status: "Recorded", label: "Sample 01" }], onValueChange: noop }, tag: "div" },
  ExperimentRun: { props: { label: "Sample preparation", runId: "Example 204", status: "Paused", steps: [{ id: "prepare", label: "Prepare sample", status: "Awaiting operator", actions: [{ id: "resume", label: "Request resume" }] }], onAction: noop }, tag: "div" },
  SpectrumPlot: { props: { label: "Recorded spectrum", xLabel: "Wavelength", yLabel: "Intensity", xUnit: "nm", points: [{ x: 400, y: 0.2 }, { x: 500, y: 0.6 }, { x: 600, y: 0.3 }] }, tag: "figure" },
  AudioMeter: { props: { label: "Output levels", channels: [{ id: "left", label: "Left", level: -18, peak: -6 }, { id: "right", label: "Right", level: -20, peak: -8 }] }, tag: "div" },
  ChannelStrip: { props: { label: "Dialogue", defaultValue: { gain: -6, pan: 0, muted: false, solo: false } }, tag: "fieldset" },
  ParameterKnob: { props: { label: "Mix", defaultValue: 40, min: 0, max: 100, unit: "%" }, tag: "input" },
  TimecodeField: { props: { label: "In point", frameRate: 25, defaultValue: "00:01:12:10" }, tag: "input" },
  ClipTimeline: { props: { label: "Edit timeline", tracks: [{ id: "video", label: "Video" }], clips: [{ id: "opening", trackId: "video", label: "Opening", start: 0, duration: 5 }], duration: 30, unit: "seconds", position: 2, onSeek: noop, onSelectClip: noop }, tag: "div" },
  RenderQueue: { props: { label: "Export queue", jobs: [{ id: "draft", label: "Draft export", status: "rendering", progress: 25 }], onCancel: noop }, tag: "div" },
  LayerStack: { props: { label: "Document layers", layers: [{ id: "title", label: "Title", visible: true, locked: false }], selectedId: "title", onSelect: noop, onLayersChange: noop }, tag: "div" },
  ColorInspector: { props: { label: "Fill", defaultValue: { hex: "#808080", alpha: 1 } }, tag: "fieldset" },
  SpacingControl: { props: { label: "Padding", defaultValue: { top: 8, right: 12, bottom: 8, left: 12 }, unit: "px" }, tag: "fieldset" },
};

const cases: Record<string, Case> = {
  ...healthCases,
  ...domainCases,
  NumberField: { props: { label: "Count" }, tag: "input" },
  RangeSlider: { props: { label: "Range" }, tag: "fieldset" },
  MultiSelect: { props: { options: option, label: "Cities" }, tag: "fieldset" },
  TagInput: { props: { label: "Tags" }, tag: "input" },
  DateRangePicker: { tag: "fieldset" },
  TimeField: { props: { label: "Time" }, tag: "input" },
  FileUpload: { tag: "input" },
  TransferList: { props: { options: option }, tag: "fieldset" },
  InlineEdit: { tag: "div" },
  Rating: { tag: "fieldset" },
  PlaybackControls: { tag: "div" },
  MediaScrubber: { props: { duration: 60 }, tag: "input" },
  MediaPlayer: { props: { src: "/audio.mp3", label: "Recording" }, tag: "video" },
  Waveform: { props: { samples: [0.2, 0.6], duration: 60 }, tag: "div" },
  ImageViewer: { props: { images: [] }, tag: "div" },
  CanvasControls: { tag: "div" },
  MessageComposer: { props: { onSend: noop }, tag: "textarea" },
  FileBrowser: { props: { entries: [] }, tag: "div" },
  KanbanBoard: { props: { columns: [] }, tag: "div" },
  Scheduler: { props: { events: [], defaultView: "agenda", defaultValue: new Date(2026, 8, 6) }, tag: "div" },
  DescriptionList: { props: { items: [] }, tag: "dl" },
  Metric: { props: { label: "Range", value: 386 }, tag: "div" },
  ActivityTimeline: { props: { events: [] }, tag: "ol" },
  CodeBlock: { props: { code: "const n = 1;" }, tag: "figure" },
  JSONViewer: { props: { data: {} }, tag: "div" },
  DiffViewer: { props: { before: "", after: "" }, tag: "div" },
  ErrorSummary: { props: { errors: [{ id: "missing", message: "Required" }] }, tag: "div" },
  NotificationCenter: { tag: "section" },
  TaskProgress: { props: { label: "Upload", state: "pending" }, tag: "section" },
  ConnectionStatus: { props: { state: "connected" }, tag: "div" },
  TreeView: { props: { label: "Files", nodes: [] }, tag: "ul" },
  Toolbar: { props: { label: "Actions", actions: [] }, tag: "div" },
  BottomNavigation: { props: { items: [] }, tag: "nav" },
  OverflowList: { props: { items: [] }, tag: "div" },
  FilterBar: { tag: "div" },
  QueryBuilder: { props: { fields: [] }, tag: "div" },
  SortableList: { tag: "ol" },
  VirtualList: { props: { items: [], label: "Records" }, tag: "div" },
  MasterDetail: { props: { items: [] }, tag: "div" },
  PropertyGrid: { props: { fields: [] }, tag: "div" },
  Icon: { props: { name: "check" }, tag: "svg" },
  Icons: { tag: "div" },
  IconCatalog: { tag: "div" },
  Button: { tag: "button" },
  Link: { props: { href: "/" }, tag: "a" },
  Chip: { tag: "span" },
  Badge: { tag: "span" },
  Card: { tag: "div" },
  CardInner: { tag: "div" },
  CardLabel: { tag: "span" },
  CardTitle: { tag: "h3" },
  CardBody: { tag: "p" },
  Callout: { tag: "div" },
  Input: { tag: "input" },
  /* Controls whose ref is the native input inside a wrapping label or box. */
  Checkbox: { tag: "input" },
  RadioGroup: { tag: "div" },
  Radio: { props: { value: "a" }, tag: "input" },
  Switch: { tag: "button" },
  Slider: { tag: "input" },
  Progress: { props: { value: 40 }, tag: "div" },
  Tabs: { tag: "div" },
  TabList: { tag: "div" },
  Tab: { props: { value: "a" }, tag: "button", wrap: inTabs },
  TabPanel: { props: { value: "a" }, tag: "div", wrap: inTabs },
  Select: { props: { options: option }, tag: "div" },
  Dialog: { props: dialog, tag: "dialog" },
  DialogTitle: { tag: "h2" },
  DialogBody: { tag: "p" },
  DialogActions: { tag: "div" },
  Breadcrumbs: { props: { items: [{ label: "Home", href: "/" }] }, tag: "nav" },
  CrumbBar: { props: { trail: [{ label: "Home", href: "/" }] }, tag: "nav" },
  Pagination: { props: { page: 1, count: 3 }, tag: "nav" },
  Stepper: { props: { steps: [{ name: "One" }], current: 0 }, tag: "div" },
  InlineForm: { tag: "form" },
  Accordion: { tag: "div" },
  AccordionItem: { props: { title: "Row" }, tag: "details" },
  Alert: { tag: "div" },
  AlertDialog: { props: dialog, tag: "dialog" },
  AlertDialogTitle: { tag: "h2" },
  AlertDialogBody: { tag: "p" },
  AlertDialogActions: { tag: "div" },
  Avatar: { props: { initials: "RA" }, tag: "span" },
  AvatarRow: { tag: "div" },
  Textarea: { tag: "textarea" },
  Separator: { tag: "hr" },
  Skeleton: { tag: "span" },
  Tooltip: { props: { tip: "Tip", children: "Hover" }, tag: "span" },
  Toaster: { tag: "div" },
  DropdownMenu: { props: { label: "Menu", items }, tag: "div" },
  Toggle: { tag: "button" },
  ToggleGroup: { props: { options: option }, tag: "div" },
  ThemeToggle: { tag: "button" },
  PopoverTitle: { tag: "span" },
  PopoverBody: { tag: "p" },
  Sheet: { props: dialog, tag: "dialog" },
  SheetTitle: { tag: "h2" },
  SheetBody: { tag: "p" },
  ScrollArea: { tag: "div" },
  LineChart: { props: { series }, tag: "div" },
  AreaChart: { props: { series }, tag: "div" },
  BarChart: { props: { data: [{ label: "a", value: 1 }] }, tag: "div" },
  ScatterChart: { props: { points: [{ x: 1, y: 2 }] }, tag: "div" },
  Donut: { props: { value: 40 }, tag: "div" },
  Share: { props: { slices: [{ label: "a", value: 1 }] }, tag: "div" },
  Histogram: { props: { bins: [{ label: "a", count: 1 }] }, tag: "div" },
  SmallMultiples: { props: { panels: [{ title: "A", series, labels: ["1", "2", "3"] }] }, tag: "div" },
  Sparkline: { props: { values: [1, 2, 3] }, tag: "span" },
  Collapsible: { props: { title: "More" }, tag: "details" },
  HoverCard: { props: { trigger: "More", children: "Detail" }, tag: "span" },
  Kbd: { tag: "kbd" },
  KbdPair: { tag: "span" },
  InputOTP: { tag: "div" },
  ContextMenu: { props: { items, children: "Target" }, tag: "div" },
  Menubar: { props: { menus: [{ label: "File", items }] }, tag: "div" },
  NavigationMenu: { props: { items: [{ label: "Home", href: "/" }] }, tag: "nav" },
  Carousel: { tag: "div" },
  CarouselSlide: { tag: "div" },
  Split: { props: { children: [<span key="a" />, <span key="b" />] }, tag: "div" },
  Combobox: { props: { options: option }, tag: "div" },
  Command: { props: { groups: [] }, tag: "div" },
  CommandDialog: { props: { ...dialog, groups: [] }, tag: "dialog" },
  Calendar: { tag: "div" },
  DatePicker: { tag: "div" },
  Table: { tag: "table" },
  TableHead: { tag: "thead", wrap: inTable },
  TableBody: { tag: "tbody", wrap: inTable },
  TableRow: { tag: "tr", wrap: inTbody },
  TableTh: { tag: "th", wrap: inRow },
  TableTd: { tag: "td", wrap: inRow },
  DataTable: { props: { columns: [{ key: "a", header: "A" }], rows: [] }, tag: "div" },
  AspectRatio: { tag: "div" },
  Nest: { tag: "div" },
  NestInner: { tag: "div" },
  ButtonGroup: { tag: "div" },
  Drawer: { props: dialog, tag: "dialog" },
  DrawerTitle: { tag: "h2" },
  DrawerBody: { tag: "p" },
  Empty: { tag: "div" },
  Field: { tag: "div" },
  FieldLabel: { tag: "label" },
  FieldHint: { tag: "p" },
  FieldError: { tag: "p" },
  Form: { tag: "form" },
  InputGroup: { tag: "div" },
  InputAddon: { tag: "span" },
  Item: { props: { title: "Row" }, tag: "div" },
  Label: { tag: "label" },
  NativeSelect: { tag: "select" },
  Sidebar: { tag: "aside" },
  SidebarHead: { tag: "div" },
  SidebarNav: { tag: "nav" },
  SidebarItem: { props: { href: "/" }, tag: "a" },
  SidebarLabel: { tag: "p" },
  SidebarFoot: { tag: "div" },
  Spinner: { tag: "span" },
  Flow: { tag: "div" },
  FlowStep: { tag: "div" },
  FlowNum: { tag: "span" },
  FlowTitle: { tag: "h3" },
  FlowBody: { tag: "p" },
  FlowSubs: { tag: "div" },
  FlowSub: { tag: "span" },
  FlowSubAdd: { tag: "span" },
  FlowAdd: { tag: "button" },
  FlowPlus: { tag: "span" },
  Assistant: { tag: "div" },
  AssistantHead: { tag: "div" },
  AssistantTitle: { tag: "span" },
  AssistantStatus: { tag: "span" },
  AssistantMsg: { tag: "div" },
  AssistantUserBlock: { tag: "div" },
  AssistantReply: { tag: "p" },
  AssistantCard: { tag: "div" },
  AssistantTag: { tag: "span" },
  AssistantText: { tag: "p" },
  AssistantDone: { tag: "div" },
  AssistantInput: { tag: "div" },
  AssistantSend: { tag: "span" },
  Cite: { tag: "sup" },
  CiteLink: { props: { href: "#r1" }, tag: "a" },
  Refs: { tag: "ol" },
  RefItem: { tag: "li" },
  RefAuthors: { tag: "span" },
  RefDoi: { props: { href: "https://doi.org/x" }, tag: "a" },
  CiteBox: { tag: "div" },
  CiteBoxLabel: { tag: "div" },
  CiteBoxText: { tag: "div" },
};

const exportsByName = Vlak as unknown as Record<string, unknown>;

beforeAll(() => {
  // jsdom has no modal dialogs: mirror the open state and the close event.
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function () {
    this.open = false;
    this.dispatchEvent(new Event("close"));
  };
});

afterEach(cleanup);

describe("ref forwarding", () => {
  it("accounts for every export", () => {
    const covered = new Set<string>([...NOT_COMPONENTS, ...Object.keys(NO_DOM_ROOT), ...Object.keys(cases)]);
    const missing = Object.keys(exportsByName).filter((name) => !covered.has(name));
    expect(missing).toEqual([]);
    const unknown = [...covered].filter((name) => !(name in exportsByName));
    expect(unknown).toEqual([]);
  });

  it("lists only non-components as non-components", () => {
    for (const name of NOT_COMPONENTS) {
      const value = exportsByName[name];
      const isForwardRef = typeof value === "object" && value !== null && "render" in value;
      expect(isForwardRef, `${name} looks like a component`).toBe(false);
    }
  });

  for (const [name, { props = {}, tag, wrap = (el: React.ReactElement) => el }] of Object.entries(cases)) {
    it(`${name} forwards its ref to <${tag}>`, () => {
      const Component = exportsByName[name] as React.ComponentType<AnyProps & React.RefAttributes<Element>>;
      const ref = React.createRef<Element>();
      render(wrap(<Component ref={ref} {...props} />));
      expect(ref.current).toBeInstanceOf(Element);
      expect(ref.current?.tagName.toLowerCase()).toBe(tag);
    });
  }

  for (const [name, { props = {} }] of Object.entries({ ...healthCases, ...domainCases })) {
    it(`${name} preserves native root attributes and merges consumer styles`, () => {
      const Component = exportsByName[name] as React.ComponentType<AnyProps & React.RefAttributes<Element>>;
      const ref = React.createRef<HTMLElement>();
      render(<Component ref={ref} {...props} id="health-record" title="Supplied record title" data-record="demo" dir="rtl" className="consumer-record" style={{ marginTop: 17 }} />);
      expect(ref.current?.id).toBe("health-record");
      expect(ref.current?.getAttribute("title")).toBe("Supplied record title");
      expect(ref.current?.dataset.record).toBe("demo");
      expect(ref.current?.dir).toBe("rtl");
      expect(ref.current?.classList.contains("consumer-record")).toBe(true);
      expect(ref.current?.className).toMatch(/rs-/);
      expect(ref.current?.style.marginTop).toBe("17px");
    });
  }
});
