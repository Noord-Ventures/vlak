"use client";

import * as React from "react";
import { additions } from "./examples/additions";
import {
  Accordion,
  Assistant,
  AssistantMsg,
  AssistantReply,
  AssistantUserBlock,
  AspectRatio,
  AreaChart,
  BarChart,
  ButtonGroup,
  Drawer,
  DrawerBody,
  DrawerTitle,
  Empty,
  Field,
  FieldHint,
  FieldLabel,
  Flow,
  FlowAdd,
  FlowBody,
  FlowNum,
  FlowStep,
  FlowSub,
  FlowSubAdd,
  FlowSubs,
  FlowTitle,
  Form,
  InputAddon,
  InputGroup,
  Item,
  Label,
  Link,
  NativeSelect,
  Sidebar,
  SidebarFoot,
  SidebarHead,
  SidebarItem,
  SidebarLabel,
  SidebarNav,
  Spinner,
  Calendar,
  Carousel,
  Collapsible,
  Combobox,
  CommandDialog,
  ContextMenu,
  DataTable,
  DatePicker,
  Donut,
  Histogram,
  HoverCard,
  IconCatalog,
  InputOTP,
  Kbd,
  Nest,
  NestInner,
  LineChart,
  Menubar,
  NavigationMenu,
  ScatterChart,
  Share,
  SmallMultiples,
  Split,
  AccordionItem,
  Alert,
  AlertDialog,
  AlertDialogActions,
  AlertDialogBody,
  AlertDialogTitle,
  Avatar,
  AvatarRow,
  Badge,
  Breadcrumbs,
  Button,
  Callout,
  Card,
  CardBody,
  CardLabel,
  CardTitle,
  Chip,
  Cite,
  CiteLink,
  Checkbox,
  Dialog,
  DialogActions,
  DialogBody,
  DialogTitle,
  DropdownMenu,
  InlineForm,
  Input,
  Pagination,
  Progress,
  Radio,
  RadioGroup,
  RefAuthors,
  RefItem,
  Refs,
  ScrollArea,
  Select,
  Separator,
  Sheet,
  SheetBody,
  SheetTitle,
  Skeleton,
  Slider,
  Stepper,
  Switch,
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableTd,
  TableTh,
  ThemeToggle,
  Textarea,
  toast,
  Toaster,
  ToggleGroup,
  Tooltip,
  Popover,
  PopoverBody,
  PopoverTitle,
  Tab,
  TabList,
  Tabs,
} from "@noorddev/vlak-react";

function DialogDemo() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        Remove item…
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Remove this item?</DialogTitle>
        <DialogBody>This can&rsquo;t be undone.</DialogBody>
        <DialogActions>
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={() => setOpen(false)}>
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function AlertDialogDemo() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        Delete workspace…
      </Button>
      <AlertDialog open={open} onClose={() => setOpen(false)}>
        <AlertDialogTitle>Delete this workspace?</AlertDialogTitle>
        <AlertDialogBody>All projects go with it. This needs an answer.</AlertDialogBody>
        <AlertDialogActions>
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Keep it
          </Button>
          <Button size="sm" onClick={() => setOpen(false)}>
            Delete
          </Button>
        </AlertDialogActions>
      </AlertDialog>
    </>
  );
}

function DrawerDemo() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        Open notes
      </Button>
      <Drawer open={open} onClose={() => setOpen(false)}>
        <DrawerTitle>Notes</DrawerTitle>
        <DrawerBody>A bottom panel. Escape closes it.</DrawerBody>
      </Drawer>
    </>
  );
}

function SheetDemo() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        Open filters
      </Button>
      <Sheet open={open} onClose={() => setOpen(false)}>
        <SheetTitle>Filters</SheetTitle>
        <SheetBody>Everything narrows from here. Press Escape to close.</SheetBody>
      </Sheet>
    </>
  );
}

function ToastDemo() {
  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => toast("Saved", { description: "Your changes are live." })}>
        Save changes
      </Button>
      <Toaster />
    </>
  );
}

function CommandDemo() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        Open command…
        <span className="rs-kbd-pair">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </span>
      </Button>
      <CommandDialog
        open={open}
        onClose={() => setOpen(false)}
        groups={[
          {
            label: "Go to",
            items: [
              { label: "Components", hint: "⌘1" },
              { label: "Tokens", hint: "⌘2" },
              { label: "Docs", hint: "⌘3" },
            ],
          },
          { label: "Actions", items: [{ label: "Toggle appearance" }, { label: "Copy install command" }] },
        ]}
      />
    </>
  );
}

function CalendarDemo() {
  const [date, setDate] = React.useState<Date | undefined>(new Date(2026, 6, 24));
  return <Calendar value={date} onValueChange={setDate} weekStart={1} />;
}

function DatePickerDemo() {
  const [date, setDate] = React.useState<Date | undefined>(new Date(2026, 6, 24));
  return <DatePicker value={date} onValueChange={setDate} placeholder="Press date" />;
}

function PaginationDemo() {
  const [page, setPage] = React.useState(3);
  return <Pagination page={page} count={12} onPageChange={setPage} aria-label="Example pagination" />;
}

function SliderDemo() {
  const [value, setValue] = React.useState(62);
  return (
    <div style={{ width: 240 }}>
      <Slider value={value} onValueChange={setValue} aria-label="Value" />
    </div>
  );
}

function ProgressDemo() {
  return (
    <div style={{ width: 240 }}>
      <Progress label="Uploading" value={40} />
    </div>
  );
}

/** Live demo per registry name. CSS-only entries fall back to their snippet. */
export const demos: Record<string, () => React.ReactNode> = {
  "button-group": () => (
    <ButtonGroup>
      <Button variant="ghost">Left</Button>
      <Button variant="ghost">Center</Button>
      <Button variant="ghost">Right</Button>
    </ButtonGroup>
  ),
  link: () => (
    <div className="preview-cluster" style={{ flexDirection: "column", alignItems: "flex-start", gap: 12 }}>
      <Link href="#">A text link</Link>
      <Link underline href="#" style={{ fontSize: 14 }}>
        An in-copy link
      </Link>
    </div>
  ),
  icons: () => <IconCatalog />,
  workflow: () => (
    <Flow style={{ gridTemplateColumns: "184px", width: 184 }}>
      <FlowStep>
        <FlowNum>1</FlowNum>
        <FlowTitle>Proposal</FlowTitle>
        <FlowBody>Scope, timeline, and fee on one page.</FlowBody>
        <FlowSubs>
          <FlowSub>Brief</FlowSub>
          <FlowSub>Fee</FlowSub>
          <FlowSubAdd>+</FlowSubAdd>
        </FlowSubs>
      </FlowStep>
      <FlowAdd>Add a step</FlowAdd>
    </Flow>
  ),
  chip: () => (
    <div className="preview-cluster">
      <Chip>/noord-brand</Chip>
      <Chip>0.3.0</Chip>
    </div>
  ),
  table: () => (
    <Table>
      <TableHead>
        <TableRow>
          <TableTh>Phase</TableTh>
          <TableTh>Weeks</TableTh>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableTd>Strategy</TableTd>
          <TableTd>2</TableTd>
        </TableRow>
        <TableRow>
          <TableTd>Identity</TableTd>
          <TableTd>4</TableTd>
        </TableRow>
      </TableBody>
    </Table>
  ),
  assistant: () => (
    <Assistant>
      <AssistantMsg user>
        <AssistantUserBlock>Make the intro tighter.</AssistantUserBlock>
      </AssistantMsg>
      <AssistantReply>Done. Two sentences, same claim.</AssistantReply>
    </Assistant>
  ),
  references: () => (
    <div>
      <p>
        Set in a single ink.
        <Cite>
          <CiteLink href="#preview-ref-1">1</CiteLink>
        </Cite>
      </p>
      <Refs>
        <RefItem id="preview-ref-1">
          <RefAuthors>Müller-Brockmann, J.</RefAuthors> Grid systems in graphic design.
        </RefItem>
      </Refs>
    </div>
  ),
  button: () => (
    <div className="preview-cluster">
      <Button>Primary action</Button>
      <Button variant="ghost">Secondary</Button>
    </div>
  ),
  callout: () => (
    <Callout>
      <p>
        <strong>Fixed fee.</strong> The number on the cover is the number on the invoice.
      </p>
    </Callout>
  ),
  badge: () => (
    <div className="preview-cluster">
      <Badge>Recommended</Badge>
      <Badge variant="solid">Delivered</Badge>
      <Badge variant="muted">In progress</Badge>
    </div>
  ),
  card: () => (
    <Card>
      <CardLabel>Case study</CardLabel>
      <CardTitle>A quieter interface</CardTitle>
      <CardBody>Emphasis from weight and spacing, never from a hue.</CardBody>
    </Card>
  ),
  label: () => <Label htmlFor="demo-name">Name</Label>,
  field: () => (
    <div style={{ width: 260 }}>
      <Field>
        <FieldLabel htmlFor="demo-field">Name</FieldLabel>
        <Input plain id="demo-field" placeholder="Vlak" />
        <FieldHint>As it appears on the invoice.</FieldHint>
      </Field>
    </div>
  ),
  form: () => (
    <Form
      onSubmit={(e) => e.preventDefault()}
      style={{ width: 260 }}
    >
      <Field>
        <FieldLabel htmlFor="demo-form-name">Name</FieldLabel>
        <Input plain id="demo-form-name" placeholder="Renato" />
      </Field>
      <Button type="submit" size="sm">
        Send
      </Button>
    </Form>
  ),
  "input-group": () => (
    <div style={{ width: 260 }}>
      <InputGroup>
        <InputAddon>https://</InputAddon>
        <Input placeholder="vlak.dev" />
      </InputGroup>
    </div>
  ),
  "native-select": () => (
    <div style={{ width: 220 }}>
      <NativeSelect aria-label="City" defaultValue="alkmaar">
        <option value="alkmaar">Alkmaar</option>
        <option value="amsterdam">Amsterdam</option>
        <option value="rotterdam">Rotterdam</option>
      </NativeSelect>
    </div>
  ),
  item: () => (
    <div style={{ width: 260 }}>
      <Item title="Alkmaar" description="The studio city." meta="NL" />
      <Item title="Delft" description="The grid city." meta="NL" />
    </div>
  ),
  empty: () => (
    <div style={{ width: 260 }}>
      <Empty title="No projects yet" action={<Button variant="ghost" size="sm">New project</Button>}>
        Start one. The grid is empty on purpose.
      </Empty>
    </div>
  ),
  spinner: () => <Spinner />,
  drawer: DrawerDemo,
  sidebar: () => (
    <Sidebar aria-label="Example sidebar">
      <SidebarHead>Vlak</SidebarHead>
      <SidebarNav aria-label="Example links">
        <SidebarLabel>Go to</SidebarLabel>
        <SidebarItem href="#" current>
          Overview
        </SidebarItem>
        <SidebarItem href="#">Docs</SidebarItem>
        <SidebarItem href="#">Components</SidebarItem>
      </SidebarNav>
      <SidebarFoot>0.3</SidebarFoot>
    </Sidebar>
  ),
  "toggle-group": () => (
    <ToggleGroup
      options={[
        { value: "left", label: "Left" },
        { value: "center", label: "Center" },
        { value: "right", label: "Right" },
      ]}
      defaultValue="left"
    />
  ),
  input: () => (
    <div style={{ width: 260 }}>
      <Input label="E-mail" placeholder="you@example.com" />
    </div>
  ),
  "inline-form": () => (
    <div style={{ width: 300 }}>
      <InlineForm />
    </div>
  ),
  checkbox: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <Checkbox label="Brand" defaultChecked />
      <Checkbox label="Product" />
    </div>
  ),
  radio: () => (
    <RadioGroup defaultValue="monthly" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <Radio value="monthly" label="Monthly" />
      <Radio value="yearly" label="Yearly" />
    </RadioGroup>
  ),
  switch: () => <Switch defaultChecked aria-label="Notifications" />,
  slider: SliderDemo,
  progress: ProgressDemo,
  tabs: () => (
    <Tabs defaultValue="overview">
      <TabList>
        <Tab value="overview">Overview</Tab>
        <Tab value="activity">Activity</Tab>
        <Tab value="settings">Settings</Tab>
      </TabList>
    </Tabs>
  ),
  chart: () => (
    <div style={{ width: 408 }}>
      <LineChart
        height={204}
        labels={["Mon", "Tue", "Wed", "Thu", "Fri"]}
        series={[
          { name: "Sheets", values: [12, 18, 15, 26, 24] },
          { name: "Proofs", values: [4, 6, 5, 9, 7] },
        ]}
        unit="sheets"
        annotations={[{ at: 3, label: "Press" }]}
      />
    </div>
  ),
  "bar-chart": () => (
    <div style={{ width: 408 }}>
      <BarChart
        height={204}
        data={[
          { label: "Alkmaar", value: 42 },
          { label: "Delft", value: 28 },
          { label: "Haarlem", value: 21 },
          { label: "Utrecht", value: 16 },
        ]}
        unit="issues"
        yLabel="This issue"
      />
    </div>
  ),
  "area-chart": () => (
    <div style={{ width: 408 }}>
      <AreaChart
        height={204}
        labels={["Mon", "Tue", "Wed", "Thu", "Fri"]}
        series={[{ name: "Sheets", values: [8, 14, 12, 22, 18] }]}
        unit="sheets"
        annotations={[{ at: 3, label: "Press" }]}
      />
    </div>
  ),
  "scatter-chart": () => (
    <div style={{ width: 408 }}>
      <ScatterChart
        height={204}
        points={[
          { x: 12, y: 18, label: "Alkmaar" },
          { x: 28, y: 16, label: "Haarlem" },
          { x: 48, y: 22, label: "Rotterdam" },
          { x: 68, y: 26, label: "Groningen" },
          { x: 80, y: 44, label: "Amsterdam" },
        ]}
        xLabel="Module"
        yLabel="Density"
      />
    </div>
  ),
  donut: () => (
    <div style={{ width: "100%", maxWidth: 340, display: "grid", gap: 20 }}>
      <Donut value={72} max={100} size={184} label="printed" />
      <Share
        slices={[
          { label: "Sheet", value: 72 },
          { label: "Proof", value: 18 },
          { label: "Waste", value: 10 },
        ]}
      />
    </div>
  ),
  histogram: () => (
    <div style={{ width: "100%", maxWidth: 340 }}>
      <Histogram
        height={204}
        yLabel="Count"
        bins={[
          { label: "0–1", count: 4 },
          { label: "1–2", count: 11 },
          { label: "2–3", count: 18 },
          { label: "3–4", count: 9 },
          { label: "4–5", count: 3 },
        ]}
      />
    </div>
  ),
  "small-multiples": () => (
    <div style={{ width: 408 }}>
      <SmallMultiples
        height={120}
        panels={[
          { title: "Alkmaar", labels: ["Mon", "Wed", "Fri"], series: [{ name: "Sheets", values: [12, 15, 24] }] },
          { title: "Delft", labels: ["Mon", "Wed", "Fri"], series: [{ name: "Sheets", values: [8, 9, 14] }] },
        ]}
      />
    </div>
  ),
  collapsible: () => (
    <Collapsible title="Show the details" defaultOpen>
      Quiet, on the grid.
    </Collapsible>
  ),
  "hover-card": () => (
    <HoverCard open trigger={<Link href="#">@noord</Link>}>
      Noord, a venture studio in Alkmaar. Ten portfolio companies, one design system.
    </HoverCard>
  ),
  kbd: () => (
    <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
      <Kbd>⌘</Kbd>
      <Kbd>K</Kbd>
    </span>
  ),
  "input-otp": () => <InputOTP length={4} aria-label="Demo code" />,
  "context-menu": () => (
    <ContextMenu
      items={[{ label: "Copy" }, { label: "Paste" }, { separator: true }, { label: "Inspect" }]}
    >
      <div
        style={{
          border: "1px dashed var(--divider)",
          borderRadius: "var(--radius)",
          padding: "22px 28px",
          fontSize: 13,
          color: "var(--text-secondary)",
        }}
      >
        Right-click me
      </div>
    </ContextMenu>
  ),
  menubar: () => (
    <Menubar
      menus={[
        { label: "File", items: [{ label: "New" }, { label: "Open…" }, { separator: true }, { label: "Export" }] },
        { label: "Edit", items: [{ label: "Undo" }, { label: "Redo" }] },
        { label: "View", items: [{ label: "Zoom in" }, { label: "Zoom out" }] },
      ]}
    />
  ),
  "navigation-menu": () => (
    <NavigationMenu
      aria-label="Example navigation"
      items={[
        { label: "Overview", href: "#", current: true },
        { label: "Docs", href: "#" },
        { label: "Changelog", href: "#" },
      ]}
    />
  ),
  carousel: () => (
    <Carousel aria-label="Example carousel">
      {["One", "Two", "Three", "Four"].map((n) => (
        <div key={n} className="rs-carousel-slide">
          <span className="rs-card-title" style={{ fontSize: 14 }}>
            {n}
          </span>
        </div>
      ))}
    </Carousel>
  ),
  resizable: () => (
    <div style={{ width: 300 }}>
      <Split initial={55}>
        <div style={{ padding: 14, fontSize: 13, color: "var(--text-secondary)" }}>Left pane</div>
        <div style={{ padding: 14, fontSize: 13, color: "var(--text-secondary)" }}>Right pane</div>
      </Split>
    </div>
  ),
  combobox: () => (
    <Combobox
      options={[
        { value: "alkmaar", label: "Alkmaar" },
        { value: "amsterdam", label: "Amsterdam" },
        { value: "delft", label: "Delft" },
        { value: "rotterdam", label: "Rotterdam" },
      ]}
      placeholder="Search cities…"
    />
  ),
  command: CommandDemo,
  calendar: CalendarDemo,
  "date-picker": DatePickerDemo,
  "data-table": () => (
    <div style={{ width: 300 }}>
      <DataTable
        columns={[
          { key: "phase", header: "Phase", sortable: true },
          { key: "weeks", header: "Weeks", sortable: true },
        ]}
        rows={[
          { phase: "Strategy", weeks: 2 },
          { phase: "Identity", weeks: 4 },
          { phase: "Digital", weeks: 6 },
        ]}
      />
    </div>
  ),
  "concentric-radius": () => (
    <Nest radius={28} pad={16} style={{ width: 184 }}>
      <NestInner>
        <Button size="sm">Save</Button>
      </NestInner>
    </Nest>
  ),
  "aspect-ratio": () => (
    <AspectRatio ratio={16 / 9} style={{ width: 240, background: "var(--divider-subtle)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "var(--text)" }}>
        16 : 9
      </div>
    </AspectRatio>
  ),
  accordion: () => (
    <div style={{ width: 300 }}>
      <Accordion exclusive>
        <AccordionItem title="What is Vlak?" defaultOpen>
          A minimal design system on a 204px module.
        </AccordionItem>
        <AccordionItem title="Does it require Radix?">No. Native elements provide the behavior.</AccordionItem>
      </Accordion>
    </div>
  ),
  alert: () => (
    <div style={{ width: 300 }}>
      <Alert title="Heads up">Your workspace syncs every hour.</Alert>
    </div>
  ),
  "alert-dialog": AlertDialogDemo,
  avatar: () => (
    <AvatarRow>
      <Avatar initials="RV" />
      <Avatar initials="NO" />
      <Avatar initials="+3" />
    </AvatarRow>
  ),
  textarea: () => (
    <div style={{ width: 280 }}>
      <Textarea label="Notes" placeholder="What should we know?" rows={3} />
    </div>
  ),
  separator: () => (
    <div style={{ width: 220 }}>
      <p className="rs-t-body">Above the line.</p>
      <Separator />
      <p className="rs-t-body">Below it.</p>
    </div>
  ),
  skeleton: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: 220 }}>
      <Skeleton width="60%" />
      <Skeleton width="100%" />
      <Skeleton width="85%" />
    </div>
  ),
  tooltip: () => (
    <Tooltip tip="Copy to clipboard">
      <Button variant="ghost" size="sm">
        Copy
      </Button>
    </Tooltip>
  ),
  toast: ToastDemo,
  "dropdown-menu": () => (
    <DropdownMenu
      label="Actions"
      items={[
        { label: "Rename" },
        { label: "Duplicate" },
        { separator: true },
        { label: "Delete" },
      ]}
    />
  ),
  toggle: () => (
    <ToggleGroup
      options={[
        { value: "left", label: "Left" },
        { value: "center", label: "Center" },
        { value: "right", label: "Right" },
      ]}
      defaultValue="left"
    />
  ),
  popover: () => (
    <Popover trigger="Details">
      <PopoverTitle>Module grid</PopoverTitle>
      <PopoverBody>204px modules: a 184px column and a 20px gutter.</PopoverBody>
    </Popover>
  ),
  sheet: SheetDemo,
  "scroll-area": () => (
    <ScrollArea maxHeight={110} style={{ width: 180 }} aria-label="Example list">
      {["Alkmaar", "Amsterdam", "Delft", "Eindhoven", "Groningen", "Haarlem", "Rotterdam", "Utrecht"].map((c) => (
        <p key={c} className="rs-t-body" style={{ padding: "3px 0" }}>
          {c}
        </p>
      ))}
    </ScrollArea>
  ),
  "crumb-bar": () => (
    <nav className="rs-crumb-bar rs-crumb-bar-scrolled" style={{ position: "relative", width: 340 }} aria-label="Example crumb bar">
      <div className="rs-crumb-bar-inner" style={{ margin: 0, paddingLeft: 16 }}>
        <p className="rs-crumbs">
          <span>Vlak</span>
          <span className="rs-crumbs-sep">/</span>
          <span className="rs-crumbs-here">Components</span>
        </p>
      </div>
    </nav>
  ),
  breadcrumbs: () => (
    <Breadcrumbs items={[{ label: "Studio", href: "/" }, { label: "Vlak" }]} aria-label="Example breadcrumbs" />
  ),
  pagination: PaginationDemo,
  select: () => (
    <Select
      aria-label="City"
      options={[
        { value: "alkmaar", label: "Alkmaar" },
        { value: "amsterdam", label: "Amsterdam" },
        { value: "rotterdam", label: "Rotterdam" },
      ]}
      defaultValue="alkmaar"
    />
  ),
  dialog: DialogDemo,
  "theme-toggle": () => <ThemeToggle className="rs-theme-toggle-inline" />,
  stepper: () => (
    <Stepper
      steps={[{ name: "Brief" }, { name: "Design" }, { name: "Build" }]}
      current={1}
    />
  ),
};

export function Preview({ name, snippet }: { name: string; snippet: string }) {
  const Addition = additions[name];
  if (Addition) return <Addition />;
  const demo = demos[name];
  if (demo) return <>{demo()}</>;
  return <div dangerouslySetInnerHTML={{ __html: snippet }} />;
}
