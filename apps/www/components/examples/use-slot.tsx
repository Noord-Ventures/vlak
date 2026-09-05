"use client";

import type { ComponentType } from "react";
import { additions } from "./additions";
import { Use as Accordion } from "./accordion/use";
import { Use as Alert } from "./alert/use";
import { Use as AlertDialog } from "./alert-dialog/use";
import { Use as AspectRatio } from "./aspect-ratio/use";
import { Use as Assistant } from "./assistant/use";
import { Use as AreaChart } from "./area-chart/use";
import { Use as Avatar } from "./avatar/use";
import { Use as Badge } from "./badge/use";
import { Use as BarChart } from "./bar-chart/use";
import { Use as Breadcrumbs } from "./breadcrumbs/use";
import { Use as Button } from "./button/use";
import { Use as ButtonGroup } from "./button-group/use";
import { Use as Calendar } from "./calendar/use";
import { Use as Callout } from "./callout/use";
import { Use as Card } from "./card/use";
import { Use as Carousel } from "./carousel/use";
import { Use as Chart } from "./chart/use";
import { Use as Checkbox } from "./checkbox/use";
import { Use as Chip } from "./chip/use";
import { Use as Collapsible } from "./collapsible/use";
import { Use as Combobox } from "./combobox/use";
import { Use as ConcentricRadius } from "./concentric-radius/use";
import { Use as Command } from "./command/use";
import { Use as ContextMenu } from "./context-menu/use";
import { Use as CrumbBar } from "./crumb-bar/use";
import { Use as DataTable } from "./data-table/use";
import { Use as DatePicker } from "./date-picker/use";
import { Use as Dialog } from "./dialog/use";
import { Use as Donut } from "./donut/use";
import { Use as Drawer } from "./drawer/use";
import { Use as DropdownMenu } from "./dropdown-menu/use";
import { Use as Empty } from "./empty/use";
import { Use as Field } from "./field/use";
import { Use as Form } from "./form/use";
import { Use as Histogram } from "./histogram/use";
import { Use as HoverCard } from "./hover-card/use";
import { Use as Icons } from "./icons/use";
import { Use as InlineForm } from "./inline-form/use";
import { Use as Input } from "./input/use";
import { Use as InputGroup } from "./input-group/use";
import { Use as InputOtp } from "./input-otp/use";
import { Use as Item } from "./item/use";
import { Use as Kbd } from "./kbd/use";
import { Use as Label } from "./label/use";
import { Use as Link } from "./link/use";
import { Use as Menubar } from "./menubar/use";
import { Use as NativeSelect } from "./native-select/use";
import { Use as NavigationMenu } from "./navigation-menu/use";
import { Use as Pagination } from "./pagination/use";
import { Use as Popover } from "./popover/use";
import { Use as Progress } from "./progress/use";
import { Use as Radio } from "./radio/use";
import { Use as References } from "./references/use";
import { Use as Resizable } from "./resizable/use";
import { Use as ScatterChart } from "./scatter-chart/use";
import { Use as ScrollArea } from "./scroll-area/use";
import { Use as Select } from "./select/use";
import { Use as Separator } from "./separator/use";
import { Use as Sheet } from "./sheet/use";
import { Use as Sidebar } from "./sidebar/use";
import { Use as Skeleton } from "./skeleton/use";
import { Use as SmallMultiples } from "./small-multiples/use";
import { Use as Slider } from "./slider/use";
import { Use as Spinner } from "./spinner/use";
import { Use as Stepper } from "./stepper/use";
import { Use as Switch } from "./switch/use";
import { Use as Table } from "./table/use";
import { Use as Tabs } from "./tabs/use";
import { Use as Textarea } from "./textarea/use";
import { Use as ThemeToggle } from "./theme-toggle/use";
import { Use as Toast } from "./toast/use";
import { Use as Toggle } from "./toggle/use";
import { Use as ToggleGroup } from "./toggle-group/use";
import { Use as Tooltip } from "./tooltip/use";
import { Use as Workflow } from "./workflow/use";

const uses: Record<string, ComponentType> = {
  accordion: Accordion,
  alert: Alert,
  "alert-dialog": AlertDialog,
  "aspect-ratio": AspectRatio,
  "area-chart": AreaChart,
  assistant: Assistant,
  avatar: Avatar,
  badge: Badge,
  "bar-chart": BarChart,
  breadcrumbs: Breadcrumbs,
  button: Button,
  "button-group": ButtonGroup,
  calendar: Calendar,
  callout: Callout,
  card: Card,
  carousel: Carousel,
  chart: Chart,
  checkbox: Checkbox,
  chip: Chip,
  collapsible: Collapsible,
  combobox: Combobox,
  "concentric-radius": ConcentricRadius,
  command: Command,
  "context-menu": ContextMenu,
  "crumb-bar": CrumbBar,
  "data-table": DataTable,
  "date-picker": DatePicker,
  dialog: Dialog,
  donut: Donut,
  drawer: Drawer,
  "dropdown-menu": DropdownMenu,
  empty: Empty,
  field: Field,
  form: Form,
  histogram: Histogram,
  "hover-card": HoverCard,
  icons: Icons,
  "inline-form": InlineForm,
  input: Input,
  "input-group": InputGroup,
  "input-otp": InputOtp,
  item: Item,
  kbd: Kbd,
  label: Label,
  link: Link,
  menubar: Menubar,
  "native-select": NativeSelect,
  "navigation-menu": NavigationMenu,
  pagination: Pagination,
  popover: Popover,
  progress: Progress,
  radio: Radio,
  references: References,
  "scatter-chart": ScatterChart,
  resizable: Resizable,
  "scroll-area": ScrollArea,
  select: Select,
  separator: Separator,
  sheet: Sheet,
  sidebar: Sidebar,
  skeleton: Skeleton,
  slider: Slider,
  "small-multiples": SmallMultiples,
  spinner: Spinner,
  stepper: Stepper,
  switch: Switch,
  table: Table,
  tabs: Tabs,
  textarea: Textarea,
  "theme-toggle": ThemeToggle,
  toast: Toast,
  toggle: Toggle,
  "toggle-group": ToggleGroup,
  tooltip: Tooltip,
  workflow: Workflow,
};

export function UseSlot({ name }: { name: string }) {
  const Use = uses[name] ?? additions[name];
  if (!Use) return null;
  return <Use />;
}
