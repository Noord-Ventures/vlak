import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  BarChart,
  Badge,
  Breadcrumbs,
  ButtonGroup,
  CrumbBar,
  concentricInner,
  Nest,
  NestInner,
  Button,
  Callout,
  Card,
  CardBody,
  CardLabel,
  CardTitle,
  Empty,
  Field,
  FieldLabel,
  LineChart,
  Form,
  Icon,
  IconCatalog,
  ICON_STROKE,
  ICON_VIEWBOX,
  filledCutouts,
  filledMarks,
  iconGroups,
  iconNames,
  NativeSelect,
  Spinner,
  ThemeToggle,
  Checkbox,
  InlineForm,
  Pagination,
  Progress,
  Radio,
  RadioGroup,
  Select,
  Slider,
  Stepper,
  Switch,
  Tab,
  TabList,
  TabPanel,
  Tabs,
} from "../src";

afterEach(cleanup);

describe("Button", () => {
  it("maps variants and sizes to Vlak classes", () => {
    render(
      <>
        <Button>Go</Button>
        <Button variant="ghost" size="sm">
          Quiet
        </Button>
      </>,
    );
    expect(screen.getByRole("button", { name: "Go" }).className).toContain("rs-btn-primary");
    expect(screen.getByRole("button", { name: "Quiet" }).className).toContain("rs-btn-ghost");
    expect(screen.getByRole("button", { name: "Quiet" }).className).toContain("rs-btn-sm");
  });

  it("defaults to type=button so it never submits forms by accident", () => {
    render(<Button>Go</Button>);
    expect(screen.getByRole("button")).toHaveProperty("type", "button");
  });
});

describe("Callout", () => {
  it("is a hairline note, not a left bar", () => {
    render(
      <Callout>
        <p>
          <strong>Fixed fee.</strong> The number on the cover is the number on the invoice.
        </p>
      </Callout>,
    );
    const note = document.querySelector(".rs-callout");
    expect(note?.className).toContain("rs-callout");
    expect(note?.textContent).toContain("Fixed fee.");
  });
});

describe("Card", () => {
  it("is a typography stack with no frame class besides rs-card", () => {
    render(
      <Card>
        <CardLabel>Studio note</CardLabel>
        <CardTitle>A quieter interface</CardTitle>
        <CardBody>Emphasis from weight and spacing, never from a hue.</CardBody>
      </Card>,
    );
    expect(document.querySelector(".rs-card")?.className).toContain("rs-card");
    expect(document.querySelector(".rs-card-title")?.textContent).toBe("A quieter interface");
  });
});

describe("Badge", () => {
  it("renders the three variants", () => {
    render(
      <>
        <Badge>A</Badge>
        <Badge variant="solid">B</Badge>
        <Badge variant="muted">C</Badge>
      </>,
    );
    expect(screen.getByText("A").className).toContain("rs-badge");
    expect(screen.getByText("B").className).toContain("rs-badge-solid");
    expect(screen.getByText("C").className).toContain("rs-badge-muted");
  });
});

describe("Switch", () => {
  it("toggles uncontrolled state with role=switch", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Switch aria-label="Notifications" onCheckedChange={onChange} />);
    const el = screen.getByRole("switch", { name: "Notifications" });
    expect(el.getAttribute("aria-checked")).toBe("false");
    await user.click(el);
    expect(el.getAttribute("aria-checked")).toBe("true");
    expect(el.className).toContain("rs-switch-on");
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("stays controlled when checked is passed", async () => {
    const user = userEvent.setup();
    render(<Switch aria-label="X" checked={false} />);
    const el = screen.getByRole("switch");
    await user.click(el);
    expect(el.getAttribute("aria-checked")).toBe("false");
  });
});

describe("Checkbox", () => {
  it("is a real native checkbox with a mirrored box", async () => {
    const user = userEvent.setup();
    render(<Checkbox label="Brand" />);
    const box = screen.getByRole("checkbox", { name: "Brand" });
    await user.click(box);
    expect((box as HTMLInputElement).checked).toBe(true);
    expect(document.querySelector('path[d="M3.5 8.5 L6.5 11.5 L12.5 4.5"]')).toBeTruthy();
  });
});

describe("RadioGroup", () => {
  it("selects one value at a time", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <RadioGroup defaultValue="monthly" onValueChange={onChange}>
        <Radio value="monthly" label="Monthly" />
        <Radio value="yearly" label="Yearly" />
      </RadioGroup>,
    );
    await user.click(screen.getByRole("radio", { name: "Yearly" }));
    expect(onChange).toHaveBeenCalledWith("yearly");
    expect((screen.getByRole("radio", { name: "Yearly" }) as HTMLInputElement).checked).toBe(true);
    expect((screen.getByRole("radio", { name: "Monthly" }) as HTMLInputElement).checked).toBe(false);
  });
});

describe("Slider", () => {
  it("drives fill width from a native range input", () => {
    const { container } = render(<Slider defaultValue={62} aria-label="Volume" />);
    const fill = container.querySelector<HTMLElement>(".rs-slider-fill");
    expect(fill?.style.width).toBe("62%");
    expect(screen.getByRole("slider", { name: "Volume" })).toBeTruthy();
  });
});

describe("Progress", () => {
  it("exposes progressbar semantics and keeps the number in the label", () => {
    render(<Progress label="Uploading" value={40} />);
    const bar = screen.getByRole("progressbar");
    expect(bar.getAttribute("aria-valuenow")).toBe("40");
    expect(screen.getByText("40%")).toBeTruthy();
    expect(bar.textContent).not.toContain("40%");
  });
});

describe("Tabs", () => {
  it("wires tab/panel semantics and switches on click", async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="overview">
        <TabList>
          <Tab value="overview">Overview</Tab>
          <Tab value="activity">Activity</Tab>
        </TabList>
        <TabPanel value="overview">First</TabPanel>
        <TabPanel value="activity">Second</TabPanel>
      </Tabs>,
    );
    expect(screen.getByRole("tab", { name: "Overview" }).getAttribute("aria-selected")).toBe("true");
    await user.click(screen.getByRole("tab", { name: "Activity" }));
    expect(screen.getByRole("tab", { name: "Activity" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByText("Second").hidden).toBe(false);
    expect(screen.getByText("First").hidden).toBe(true);
  });

  it("moves selection with arrow keys", async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="a">
        <TabList>
          <Tab value="a">A</Tab>
          <Tab value="b">B</Tab>
        </TabList>
        <TabPanel value="a">PA</TabPanel>
        <TabPanel value="b">PB</TabPanel>
      </Tabs>,
    );
    screen.getByRole("tab", { name: "A" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "B" }).getAttribute("aria-selected")).toBe("true");
  });
});

describe("Icon", () => {
  it("locks a 16 viewBox, 1px currentColor hairline, butt/miter, no radius", () => {
    const { container } = render(<Icon name="copy" />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("viewBox")).toBe("0 0 16 16");
    expect(svg?.getAttribute("width")).toBe("16");
    expect(svg?.getAttribute("height")).toBe("16");
    expect(svg?.getAttribute("fill")).toBe("none");
    expect(svg?.getAttribute("stroke")).toBe("currentColor");
    expect(svg?.getAttribute("stroke-width")).toBe("1");
    expect(svg?.getAttribute("stroke-linecap")).toBe("butt");
    expect(svg?.getAttribute("stroke-linejoin")).toBe("miter");
    expect(svg?.classList.contains("rs-icon")).toBe(true);
    expect(container.querySelector("[rx]")).toBeNull();
    expect(ICON_STROKE).toBe(1);
    expect(ICON_VIEWBOX).toBe(16);
  });

  it("keeps the copy mark square at 12, 16, and 24", () => {
    const { container, rerender } = render(<Icon name="copy" size={12} />);
    let svg = container.querySelector("svg");
    expect(svg?.getAttribute("width")).toBe("12");
    expect(svg?.getAttribute("height")).toBe("12");
    expect(svg?.getAttribute("viewBox")).toBe("0 0 16 16");
    rerender(<Icon name="copy" size={16} />);
    svg = container.querySelector("svg");
    expect(svg?.getAttribute("width")).toBe("16");
    expect(svg?.getAttribute("height")).toBe("16");
    rerender(<Icon name="copy" size={24} />);
    svg = container.querySelector("svg");
    expect(svg?.getAttribute("width")).toBe("24");
    expect(svg?.getAttribute("height")).toBe("24");
    expect(svg?.getAttribute("viewBox")).toBe("0 0 16 16");
  });

  it("draws the tightened copy pair with a 2.5-unit offset", () => {
    const { container } = render(<Icon name="copy" />);
    expect(container.querySelector('path[d="M5.5 3 H13 V10.5"]')).toBeTruthy();
    const rect = container.querySelector("rect");
    expect(rect?.getAttribute("x")).toBe("3");
    expect(rect?.getAttribute("y")).toBe("5.5");
    expect(rect?.getAttribute("width")).toBe("7.5");
    expect(rect?.getAttribute("height")).toBe("7.5");
    expect(container.querySelectorAll("rect")).toHaveLength(1);
  });

  it("uses one check path for copied and check", () => {
    const { container, rerender } = render(<Icon name="copied" />);
    expect(container.querySelector('path[d="M3.5 8.5 L6.5 11.5 L12.5 4.5"]')).toBeTruthy();
    rerender(<Icon name="check" />);
    expect(container.querySelector('path[d="M3.5 8.5 L6.5 11.5 L12.5 4.5"]')).toBeTruthy();
    expect(container.querySelector("svg")?.getAttribute("viewBox")).toBe("0 0 16 16");
  });

  it("keeps the core chevrons and close paths exact", () => {
    expect(iconNames.slice(0, 5)).toEqual(["copy", "copied", "chevron-left", "chevron-right", "close"]);
    const { container } = render(
      <>
        <Icon name="chevron-left" />
        <Icon name="chevron-right" />
        <Icon name="close" />
      </>,
    );
    expect(container.querySelector('path[d="M10.5 3.75 L5.5 8.25 L10.5 12.75"]')).toBeTruthy();
    expect(container.querySelector('path[d="M5.5 3.75 L10.5 8.25 L5.5 12.75"]')).toBeTruthy();
    expect(container.querySelector('path[d="M4.5 4.5 L11.5 11.5"]')).toBeTruthy();
    expect(container.querySelector('path[d="M11.5 4.5 L4.5 11.5"]')).toBeTruthy();
  });

  it("ships a complete family on the same 16 module", () => {
    expect(iconNames.length).toBe(151);
    const { container } = render(
      iconNames.map((name) => (
        <Icon key={name} name={name} size={12} />
      )),
    );
    const svgs = [...container.querySelectorAll("svg")];
    expect(svgs).toHaveLength(iconNames.length);
    for (const svg of svgs) {
      expect(svg.getAttribute("viewBox")).toBe("0 0 16 16");
      expect(svg.getAttribute("width")).toBe("12");
      expect(svg.getAttribute("height")).toBe("12");
      expect(svg.getAttribute("stroke-width")).toBe("1");
      expect(svg.getAttribute("stroke-linecap")).toBe("butt");
      expect(svg.querySelector("[rx]")).toBeNull();
    }
  });

  it("reuses the check for success and rotates chevron-right for up and down", () => {
    const { container, rerender } = render(<Icon name="success" />);
    expect(container.querySelector('path[d="M3.5 8.5 L6.5 11.5 L12.5 4.5"]')).toBeTruthy();
    rerender(<Icon name="chevron-down" />);
    expect(container.querySelector('path[d="M5.5 3.75 L10.5 8.25 L5.5 12.75"]')).toBeTruthy();
    expect(container.querySelector('g[transform="rotate(90 8 8)"]')).toBeTruthy();
    rerender(<Icon name="chevron-up" />);
    expect(container.querySelector('g[transform="rotate(270 8 8)"]')).toBeTruthy();
  });

  it("inks every shape so live DOM matches the source geometry", () => {
    const { container } = render(<Icon name="copy" />);
    const path = container.querySelector('path[d="M5.5 3 H13 V10.5"]');
    const rect = container.querySelector("rect");
    expect(path?.getAttribute("vector-effect")).toBe("non-scaling-stroke");
    expect(path?.getAttribute("stroke-width")).toBe("1");
    expect(path?.getAttribute("stroke-linecap")).toBe("butt");
    expect(rect?.getAttribute("vector-effect")).toBe("non-scaling-stroke");
  });

  it("draws sun and moon as rs-icon family members, not a second stroke", () => {
    const { container, rerender } = render(<Icon name="sun" className="icon-sun" />);
    const sun = container.querySelector("svg");
    expect(sun?.classList.contains("rs-icon")).toBe(true);
    expect(sun?.classList.contains("icon-sun")).toBe(true);
    const circle = container.querySelector("circle");
    expect(circle?.getAttribute("stroke-width")).toBe("1");
    expect(circle?.getAttribute("stroke-linecap")).toBe("butt");
    expect(circle?.getAttribute("stroke-linejoin")).toBe("miter");
    expect(circle?.getAttribute("vector-effect")).toBe("non-scaling-stroke");
    expect(circle?.getAttribute("fill")).toBe("none");
    rerender(<Icon name="moon" className="icon-moon" />);
    const moon = container.querySelector("svg");
    expect(moon?.classList.contains("rs-icon")).toBe(true);
    const crescent = container.querySelector("path");
    expect(crescent?.getAttribute("d")).toBe("M10.75 3 A5.5 5.5 0 1 0 10.75 13 A4.25 4.25 0 1 1 10.75 3 Z");
    expect(crescent?.getAttribute("d")).not.toMatch(/M13\.5 9\.5A5\.5/);
    expect(crescent?.getAttribute("stroke-width")).toBe("1");
    expect(crescent?.getAttribute("stroke-linecap")).toBe("butt");
    expect(crescent?.getAttribute("vector-effect")).toBe("non-scaling-stroke");
  });

  it("holds calendar on the same hairline", () => {
    const { container } = render(<Icon name="calendar" />);
    const rect = container.querySelector("rect");
    expect(rect?.getAttribute("x")).toBe("3");
    expect(rect?.getAttribute("y")).toBe("4.5");
    expect(rect?.getAttribute("width")).toBe("10");
    expect(rect?.getAttribute("height")).toBe("9");
    expect(rect?.getAttribute("rx")).toBeNull();
    expect(rect?.getAttribute("vector-effect")).toBe("non-scaling-stroke");
  });

  it("catalogs the family in sentence-case groups at 12, 16, and 24", () => {
    const { container } = render(<IconCatalog />);
    expect(iconGroups.length).toBeGreaterThanOrEqual(8);
    expect(container.querySelector(".rs-icon-catalog")).toBeTruthy();
    expect(container.querySelector(".rs-icon-group-title")?.textContent).toBe("Navigation");
    expect(container.textContent).not.toMatch(/NAVIGATION|ACTIONS|SETTINGS/);
    const cells = container.querySelectorAll(".rs-icon-cell");
    expect(cells.length).toBeGreaterThanOrEqual(80);
    const firstPair = container.querySelector(".rs-icon-pair");
    expect(firstPair).toBeTruthy();
    const line = firstPair!.querySelector('[data-variant="line"]');
    const filled = firstPair!.querySelector('[data-variant="filled"]');
    expect(line).toBeTruthy();
    expect(filled).toBeTruthy();
    const lineSizes = [...line!.querySelectorAll("svg")].map((svg) => svg.getAttribute("width"));
    const filledSizes = [...filled!.querySelectorAll("svg")].map((svg) => svg.getAttribute("width"));
    expect(lineSizes).toEqual(["12", "16", "24"]);
    expect(filledSizes).toEqual(["12", "16", "24"]);
    expect(filled!.querySelector(".rs-icon-filled")).toBeTruthy();
  });

  it("uses deliberate silhouettes for open figures in the filled family", () => {
    expect(Object.keys(filledMarks)).toEqual(expect.arrayContaining([
      "link",
      "unlink",
      "search",
      "zoom-in",
      "zoom-out",
      "chevrons-left",
      "chevrons-right",
      "home",
      "inbox",
      "user",
      "users",
      "user-plus",
      "user-minus",
      "trash",
      "download",
      "upload",
      "cart",
      "flag",
      "map-pin",
      "cloud",
      "folder-open",
      "clipboard",
      "archive",
      "duplicate",
      "files",
      "key",
      "database",
      "monitor",
      "sun",
      "moon",
      "receipt",
      "wallet",
      "compass",
      "building",
      "at",
      "user-check",
      "thumbs-up",
      "crosshair",
    ]));

    const { container, rerender } = render(<Icon name="home" variant="filled" />);
    expect(container.querySelector('mask path[d$="H3.5 Z"]')?.getAttribute("fill")).toBe("white");

    rerender(<Icon name="home" />);
    expect(container.querySelector('path[d="M3.5 8 L8 3.5 L12.5 8"]')).toBeTruthy();
    expect(container.querySelector('path[d$="H3.5 Z"]')).toBeNull();

    rerender(<Icon name="map-pin" variant="filled" />);
    expect(container.querySelector("mask circle")?.getAttribute("fill")).toBe("black");
    expect(container.querySelector('rect[mask^="url(#rs-icon-"]')?.getAttribute("fill")).toBe("currentColor");
    expect(filledCutouts["map-pin"]).toEqual([1]);
  });

  it("keeps object detail legible in filled utility marks", () => {
    expect(filledCutouts.trash).toEqual([3, 4, 5]);
    expect(filledCutouts.archive).toEqual([2]);
    expect(filledCutouts.paste).toEqual([2, 3, 4]);
    expect(filledCutouts.globe).toEqual([1, 2, 3]);
    expect(filledCutouts.receipt).toEqual([1, 2]);
    expect(filledCutouts.wallet).toEqual([1]);
  });

  it("punches transparent detail through filled icons", () => {
    const { container } = render(<Icon name="calendar" variant="filled" />);
    const mask = container.querySelector("mask");
    expect(mask).toBeTruthy();
    expect(mask?.querySelectorAll('[stroke="black"]')).toHaveLength(3);
    expect(container.querySelector('rect[mask^="url(#rs-icon-"]')).toBeTruthy();
  });
});

describe("ThemeToggle", () => {
  it("renders one family mark that swaps", () => {
    const { container } = render(<ThemeToggle />);
    const marks = container.querySelectorAll(".rs-theme-moon, .rs-theme-sun");
    expect(marks).toHaveLength(1);
    expect(marks[0]?.classList.contains("rs-icon")).toBe(true);
    expect(marks[0]?.getAttribute("viewBox")).toBe("0 0 16 16");
    expect(marks[0]?.getAttribute("stroke-width")).toBe("1");
    expect(marks[0]?.getAttribute("stroke-linecap")).toBe("butt");
    expect(container.querySelector('[stroke-width="1.5"]')).toBeNull();
  });
});

describe("Select", () => {
  const options = [
    { value: "alkmaar", label: "Alkmaar" },
    { value: "amsterdam", label: "Amsterdam" },
  ];

  it("opens a listbox and selects an option", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Select options={options} onValueChange={onChange} />);
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "Amsterdam" }));
    expect(onChange).toHaveBeenCalledWith("amsterdam");
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(screen.getByRole("combobox").textContent).toContain("Amsterdam");
  });

  it("supports keyboard: open, arrow, enter", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Select options={options} onValueChange={onChange} />);
    screen.getByRole("combobox").focus();
    await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    expect(onChange).toHaveBeenCalledWith("amsterdam");
  });
});

describe("Pagination", () => {
  it("marks the current page and windows long ranges", () => {
    render(<Pagination page={5} count={20} />);
    const current = screen.getByRole("button", { name: "5" });
    expect(current.className).toContain("rs-page-on");
    expect(current.getAttribute("aria-current")).toBe("page");
    expect(screen.getAllByText("…").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "20" })).toBeTruthy();
  });
});

describe("Stepper", () => {
  it("marks done and active steps", () => {
    const { container } = render(
      <Stepper steps={[{ name: "Brief" }, { name: "Design" }, { name: "Build" }]} current={1} />,
    );
    const dots = container.querySelectorAll(".rs-step-dot");
    expect(dots[0]?.className).toContain("rs-step-done");
    expect(dots[1]?.className).toContain("rs-step-active");
    expect(dots[2]?.className).not.toContain("rs-step-active");
  });

  it("keeps joining hairlines inside each step so they meet the dots", () => {
    const { container } = render(
      <Stepper steps={[{ name: "Brief" }, { name: "Design" }, { name: "Build" }]} current={1} />,
    );
    const steps = container.querySelectorAll(".rs-step");
    expect(steps[0]?.querySelector(".rs-step-line")).toBeTruthy();
    expect(steps[1]?.querySelector(".rs-step-line")).toBeTruthy();
    expect(steps[2]?.querySelector(".rs-step-line")).toBeNull();
  });
});

describe("Breadcrumbs", () => {
  it("keeps ancestors as trail links, not a second color", () => {
    render(<Breadcrumbs items={[{ label: "Studio", href: "/" }, { label: "Vlak" }]} />);
    expect(screen.getByRole("link", { name: "Studio" }).className).toContain("rs-crumbs-link");
    expect(screen.getByText("Vlak").className).toContain("rs-crumbs-here");
    expect(screen.getByText("/").className).toContain("rs-crumbs-sep");
  });
});

describe("CrumbBar", () => {
  it("solidifies and reveals the crumbs on scroll", () => {
    const { container } = render(
      <CrumbBar trail={[{ label: "Vlak", href: "/" }, { label: "Components" }]} />,
    );
    const bar = container.querySelector(".rs-crumb-bar")!;
    expect(bar.className).not.toContain("rs-crumb-bar-scrolled");
    Object.defineProperty(window, "scrollY", { value: 300, configurable: true });
    fireEvent.scroll(window);
    expect(bar.className).toContain("rs-crumb-bar-scrolled");
    expect(screen.getByText("Components").className).toContain("rs-crumbs-here");
    Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
  });
});

describe("ButtonGroup", () => {
  it("is a group of flush actions", () => {
    render(
      <ButtonGroup>
        <Button variant="ghost">Left</Button>
        <Button variant="ghost">Right</Button>
      </ButtonGroup>,
    );
    expect(screen.getByRole("group").className).toContain("rs-btn-group");
    expect(screen.getAllByRole("button")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Left" }).className).toContain("rs-btn-ghost");
  });
});

describe("Form and Field", () => {
  it("stacks a labeled field inside a native form", () => {
    render(
      <Form aria-label="Contact">
        <Field>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <input id="name" className="rs-input" />
        </Field>
      </Form>,
    );
    expect(screen.getByRole("form", { name: "Contact" }).className).toContain("rs-form");
    expect(screen.getByLabelText("Name")).toBeTruthy();
  });
});

describe("NativeSelect", () => {
  it("is a real select with Vlak chrome", () => {
    render(
      <NativeSelect aria-label="City" defaultValue="alkmaar">
        <option value="alkmaar">Alkmaar</option>
        <option value="delft">Delft</option>
      </NativeSelect>,
    );
    const el = screen.getByRole("combobox", { name: "City" }) as HTMLSelectElement;
    expect(el.className).toContain("rs-native-select");
    expect(el.value).toBe("alkmaar");
  });
});

describe("Empty", () => {
  it("renders a vacant cell", () => {
    render(<Empty title="No projects yet">Start one.</Empty>);
    expect(screen.getByText("No projects yet").className).toContain("rs-empty-title");
    expect(screen.getByText("Start one.").className).toContain("rs-empty-body");
  });
});

describe("Spinner", () => {
  it("exposes status semantics", () => {
    render(<Spinner label="Loading" />);
    expect(screen.getByRole("status", { name: "Loading" }).className).toContain("rs-spinner");
  });

  it("draws a 1px hairline circle, not a square", () => {
    const { container } = render(<Spinner />);
    const ring = container.querySelector("circle");
    expect(ring?.getAttribute("stroke-width")).toBe("1");
    expect(ring?.getAttribute("stroke-linecap")).toBe("butt");
    expect(ring?.getAttribute("r")).toBe("6.5");
  });
});

describe("LineChart", () => {
  it("renders a hairline plot and a screen-reader table", () => {
    render(
      <LineChart
        labels={["Mon", "Tue"]}
        series={[{ name: "Sheets", values: [12, 18] }]}
      />,
    );
    expect(document.querySelector(".rs-chart-line")).toBeTruthy();
    expect(document.querySelector(".rs-chart-field")).toBeTruthy();
    expect(screen.getByRole("table")).toBeTruthy();
    expect(screen.getByText("Sheets")).toBeTruthy();
  });
});

describe("BarChart", () => {
  it("draws horizontal bars without a radius", () => {
    const { container } = render(
      <BarChart
        orientation="horizontal"
        data={[
          { label: "Alkmaar", value: 42 },
          { label: "Delft", value: 28 },
        ]}
      />,
    );
    const bars = container.querySelectorAll("rect.rs-chart-bar");
    expect(bars.length).toBe(2);
    for (const bar of bars) {
      expect(bar.getAttribute("rx")).toBeNull();
    }
  });
});

describe("Nest", () => {
  it("sets concentric custom properties from Steve’s innerRadius", () => {
    const { container } = render(
      <Nest radius={28} pad={16}>
        <Nest pad={8}>
          <NestInner>Board</NestInner>
        </Nest>
      </Nest>,
    );
    const nests = container.querySelectorAll(".rs-nest");
    expect(nests).toHaveLength(2);
    expect((nests[0] as HTMLElement).style.getPropertyValue("--rs-out")).toBe("28px");
    expect((nests[0] as HTMLElement).style.getPropertyValue("--rs-gap")).toBe("16px");
    expect((nests[1] as HTMLElement).style.getPropertyValue("--rs-out")).toBe("12px");
    expect((nests[1] as HTMLElement).style.getPropertyValue("--rs-gap")).toBe("8px");
    expect(container.querySelector(".rs-nest-in")?.textContent).toBe("Board");
    expect(concentricInner(28, 16)).toBe(12);
    expect(concentricInner(28, 16)).not.toBe(28);
  });
});

describe("InlineForm", () => {
  it("reveals the action only once input validates, then confirms", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const { container } = render(<InlineForm onSubmit={onSubmit} />);
    const reveal = () => container.querySelector(".rs-reveal");
    expect(reveal()?.className).not.toContain("rs-reveal-in");
    await user.type(screen.getByPlaceholderText("Your e-mail"), "renn@noord.vc");
    expect(reveal()?.className).toContain("rs-reveal-in");
    await user.click(screen.getByRole("button", { name: "Subscribe" }));
    expect(onSubmit).toHaveBeenCalledWith("renn@noord.vc");
    expect(screen.getByText("You're on the list")).toBeTruthy();
  });
});
