import * as React from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { Avatar } from "../src/components/avatar";
import { Calendar } from "../src/components/calendar";
import { DatePicker } from "../src/components/date-picker";
import { CommandDialog } from "../src/components/command";
import { DataTable } from "../src/components/data-table";
import { InputOTP } from "../src/components/input-otp";
import { InlineForm } from "../src/components/inline-form";
import { NativeSelect } from "../src/components/native-select";
import { Tab, TabList, TabPanel, Tabs } from "../src/components/tabs";
import { ThemeToggle } from "../src/components/theme-toggle";
import { Toggle, ToggleGroup } from "../src/components/toggle";
import { innerRadius } from "../src/components/concentric-radius";
import { BarChart } from "../src/components/charts/bar";
import { LineChart } from "../src/components/charts/line";
import { ScatterChart } from "../src/components/charts/scatter";
import { Sparkline } from "../src/components/charts/sparkline";
import { Histogram } from "../src/components/charts/histogram";
import { Donut } from "../src/components/charts/donut";
import { ImageViewer } from "../src/components/image-viewer";
import { useOverlayPosition } from "../src/use-overlay-position";

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  HTMLDialogElement.prototype.close = function () { this.open = false; this.dispatchEvent(new Event("close")); };
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); delete document.documentElement.dataset.theme; });

describe("Control audit repairs", () => {
  it("focuses DatePicker's selected day after the measured overlay becomes visible", async () => {
    const nativeFocus = HTMLElement.prototype.focus;
    vi.spyOn(HTMLElement.prototype, "focus").mockImplementation(function (this: HTMLElement, options?: FocusOptions) {
      // jsdom otherwise focuses visibility:hidden elements that browsers reject.
      if (this.closest('[style*="visibility: hidden"]')) return;
      nativeFocus.call(this, options);
    });
    render(<DatePicker defaultValue={new Date(2026, 8, 6)} />);
    const trigger = screen.getByRole("button");
    await userEvent.click(trigger);
    const dialog = screen.getByRole("dialog");
    expect(dialog.style.visibility).toBe("visible");
    expect(dialog.contains(document.activeElement)).toBe(true);
    expect(document.activeElement?.getAttribute("aria-selected")).toBe("true");
    await userEvent.keyboard("{Escape}");
    expect(document.activeElement).toBe(trigger);
  });

  it("uses explicit Light even when the operating system prefers dark", async () => {
    const saved = new Map<string, string>();
    vi.stubGlobal("localStorage", { getItem: (key: string) => saved.get(key), setItem: (key: string, value: string) => saved.set(key, value) });
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true, addEventListener() {}, removeEventListener() {} })));
    const user = userEvent.setup();
    render(<ThemeToggle />);
    await user.click(screen.getByRole("button", { name: "Switch to light scheme" }));
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(localStorage.getItem("vlak-theme")).toBe("light");
    expect(screen.getByRole("button", { name: "Switch to dark scheme" })).toBeTruthy();
  });

  it("gives standalone and grouped toggles distinct CSS contracts", () => {
    render(<><Toggle>Standalone</Toggle><ToggleGroup options={[{ value: "a", label: "Grouped" }]} /></>);
    expect(screen.getByRole("button", { name: "Standalone" }).className).not.toContain("rs-toggle-grouped");
    expect(screen.getByRole("button", { name: "Grouped" }).className).toContain("rs-toggle-grouped");
  });

  it("selects the first enabled tab without a supplied default and reconciles removal", async () => {
    function Fixture({ remove = false }: { remove?: boolean }) {
      return <Tabs><TabList aria-label="Views"><Tab value="disabled" disabled>Disabled</Tab>{!remove && <Tab value="a">A</Tab>}<Tab value="b">B</Tab></TabList><TabPanel value="a">First panel</TabPanel><TabPanel value="b">Second panel</TabPanel></Tabs>;
    }
    const view = render(<Fixture />);
    expect(screen.getByRole("tab", { name: "A" }).tabIndex).toBe(0);
    expect(screen.getByRole("tabpanel").textContent).toBe("First panel");
    view.rerender(<Fixture remove />);
    expect(screen.getByRole("tab", { name: "B" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("tabpanel").textContent).toBe("Second panel");
    expect(await axe(view.container, { rules: { "color-contrast": { enabled: false } } })).toHaveNoViolations();
  });

  it("does not mutate a controlled tab selection", async () => {
    const changed = vi.fn();
    render(<Tabs value="a" onValueChange={changed}><TabList><Tab value="a">A</Tab><Tab value="b">B</Tab></TabList></Tabs>);
    await userEvent.click(screen.getByRole("tab", { name: "B" }));
    expect(changed).toHaveBeenCalledWith("b");
    expect(screen.getByRole("tab", { name: "A" }).getAttribute("aria-selected")).toBe("true");
  });

  it("names the actual CommandDialog and passes axe", async () => {
    const { container } = render(<CommandDialog open aria-label="Project commands" groups={[]} />);
    expect(screen.getByRole("dialog", { name: "Project commands" })).toBeTruthy();
    expect(await axe(container, { rules: { "color-contrast": { enabled: false } } })).toHaveNoViolations();
  });

  it("retries Avatar images after their URL changes", () => {
    const view = render(<Avatar src="/broken.png" alt="Ada" />);
    fireEvent.error(view.container.querySelector("img")!);
    expect(view.container.querySelector("img")).toBeNull();
    view.rerender(<Avatar src="/working.png" alt="Ada" />);
    expect(view.container.querySelector("img")?.getAttribute("src")).toBe("/working.png");
  });

  it("keeps the native select and shares the icon geometry", () => {
    const ref = React.createRef<HTMLSelectElement>();
    const { container } = render(<NativeSelect ref={ref} aria-label="City"><option>Alkmaar</option></NativeSelect>);
    expect(ref.current?.tagName).toBe("SELECT");
    expect(container.querySelector(".rs-native-select-icon svg, svg.rs-native-select-icon")).toBeTruthy();
  });

  it("controls OTP values, resizes its cells and serializes the complete code", () => {
    const onValueChange = vi.fn();
    const view = render(<InputOTP value="1234" length={4} name="code" onValueChange={onValueChange} />);
    fireEvent.change(screen.getByRole("textbox", { name: "Digit 1" }), { target: { value: "9" } });
    expect(onValueChange).toHaveBeenCalledWith("9234");
    expect((screen.getByRole("textbox", { name: "Digit 1" }) as HTMLInputElement).value).toBe("1");
    expect(view.container.querySelector<HTMLInputElement>('input[name="code"]')?.value).toBe("1234");
    view.rerender(<InputOTP value="567890" length={6} readOnly />);
    expect(screen.getAllByRole("textbox")).toHaveLength(6);
    fireEvent.change(screen.getByRole("textbox", { name: "Digit 1" }), { target: { value: "1" } });
    expect((screen.getByRole("textbox", { name: "Digit 1" }) as HTMLInputElement).value).toBe("5");
  });

  it("does not complete the same OTP twice and allows an edited new completion", () => {
    const complete = vi.fn();
    render(<InputOTP length={2} onComplete={complete} />);
    fireEvent.change(screen.getByRole("textbox", { name: "Digit 1" }), { target: { value: "12" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Digit 2" }), { target: { value: "2" } });
    expect(complete).toHaveBeenCalledTimes(1);
    fireEvent.change(screen.getByRole("textbox", { name: "Digit 2" }), { target: { value: "3" } });
    expect(complete).toHaveBeenLastCalledWith("13");
  });

  it("respects Calendar date bounds and excluded dates without blocking keyboard navigation", async () => {
    const changed = vi.fn();
    render(<Calendar value={new Date(2026, 8, 5)} min={new Date(2026, 8, 4)} max={new Date(2026, 8, 8)} isDateDisabled={(d) => d.getDate() === 6} onValueChange={changed} />);
    const forbidden = screen.getByRole("gridcell", { name: "Sunday, September 6, 2026" });
    expect(forbidden.getAttribute("aria-disabled")).toBe("true");
    await userEvent.click(forbidden);
    expect(changed).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("gridcell", { name: "Monday, September 7, 2026" }));
    expect(changed).toHaveBeenCalledWith(new Date(2026, 8, 7));
    expect((screen.getByRole("button", { name: "Previous month" }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: "Next month" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("waits for InlineForm promises, rejects duplicate submissions, reports failure and supports retry", async () => {
    let reject!: (error: Error) => void;
    const pending = new Promise<void>((_, rejectPromise) => { reject = rejectPromise; });
    const submit = vi.fn().mockReturnValueOnce(pending).mockResolvedValueOnce(undefined);
    const ref = React.createRef<HTMLFormElement>();
    const { container } = render(<InlineForm ref={ref} defaultValue="ada@example.com" onSubmit={submit} />);
    fireEvent.submit(ref.current!);
    fireEvent.submit(ref.current!);
    expect(submit).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("You're on the list")).toBeNull();
    expect(ref.current?.getAttribute("aria-busy")).toBe("true");
    await act(async () => { reject(new Error("offline")); });
    expect(screen.getByRole("alert").textContent).toContain("try again");
    await userEvent.click(screen.getByRole("button", { name: "Subscribe" }));
    expect(screen.getByRole("status").textContent).toContain("You're on the list");
    expect(ref.current?.tagName).toBe("FORM");
    expect(await axe(container, { rules: { "color-contrast": { enabled: false } } })).toHaveNoViolations();
  });

  it("uses the exact concentric formula even with zero obsolete fit iterations", () => {
    expect(innerRadius(28, 16, { epochs: 0 })).toBe(12);
    expect(innerRadius(2, 20)).toBe(0);
    expect(innerRadius(Number.NaN, 2)).toBe(0);
  });
});

describe("Chart data fidelity", () => {
  it.each([false, true])("renders every grouped bar and preserves nonzero inverted geometry (%s)", (inverted) => {
    const { container } = render(<BarChart inverted={inverted} labels={["A", "B"]} series={[{ name: "One", values: [3, -2] }, { name: "Two", values: [6, 4] }]} />);
    const bars = [...container.querySelectorAll("rect[data-series]")];
    expect(bars).toHaveLength(4);
    for (const bar of bars) expect(Number(bar.getAttribute("height"))).toBeGreaterThan(0);
    expect(bars[0]?.getAttribute("x")).not.toBe(bars[1]?.getAttribute("x"));
  });

  it("uses positive dimensions for signed horizontal stacks", () => {
    const { container } = render(<BarChart orientation="horizontal" stacked inverted labels={["A"]} series={[{ name: "One", values: [-3] }, { name: "Two", values: [4] }]} />);
    for (const bar of container.querySelectorAll("rect[data-series]")) expect(Number(bar.getAttribute("width"))).toBeGreaterThan(0);
  });

  it("keeps the bar tooltip position finite when the first series is missing", () => {
    const { container } = render(<BarChart labels={["A"]} series={[{ name: "Missing", values: [Number.NaN] }, { name: "Observed", values: [4] }]} />);
    fireEvent.keyDown(container.querySelector("svg")!, { key: "Home" });
    const tip = screen.getByRole("status");
    expect(tip.textContent).toContain("No data");
    expect(tip.getAttribute("style")).not.toMatch(/NaN|Infinity/);
  });

  it("keeps domain ticks inside [100, 200] and breaks missing data into separate line segments", () => {
    const { container } = render(<LineChart domain={[100, 200]} series={[{ name: "Observed", values: [120, null, 180] }]} />);
    const ticks = [...container.querySelectorAll("g > g > text.rs-chart-axis")].map((node) => Number(node.textContent));
    expect(ticks.length).toBeGreaterThan(0);
    expect(ticks.every((tick) => tick >= 100 && tick <= 200)).toBe(true);
    const path = container.querySelector("path.rs-chart-line")?.getAttribute("d") ?? "";
    expect(path.match(/M/g)).toHaveLength(2);
    expect(path).not.toContain("NaN");
    expect(screen.getAllByText("No data").length).toBeGreaterThan(0);
  });

  it("announces missing samples without drawing zero-value dots", async () => {
    const { container } = render(<LineChart series={[{ name: "Long", values: [1, 2] }, { name: "Short", values: [4] }]} />);
    const plot = container.querySelector("svg")!;
    fireEvent.keyDown(plot, { key: "End" });
    expect(screen.getByRole("status").textContent).toContain("No data");
    expect(container.querySelectorAll("circle.rs-chart-dot")).toHaveLength(1);
  });

  it("handles empty and invalid scatter/line/bar/histogram datasets without NaN coordinates", () => {
    const { container } = render(<><ScatterChart points={[]} /><LineChart series={[]} /><BarChart data={[]} /><Histogram bins={[{ label: "Invalid", count: -2 }]} /></>);
    expect(screen.getAllByRole("status")).toHaveLength(4);
    expect(container.innerHTML).not.toMatch(/NaN|Infinity/);
  });

  it("does not fabricate a final zero point in empty sparklines or a percentage for zero-total donuts", () => {
    const { container } = render(<><Sparkline values={[]} /><Donut value={2} max={0} /></>);
    expect(container.querySelector(".rs-spark circle")).toBeNull();
    expect(screen.getByRole("img", { name: "No data to display" })).toBeTruthy();
    expect(screen.getAllByText("No data").length).toBeGreaterThan(0);
    expect(container.innerHTML).not.toMatch(/NaN|Infinity/);
  });
});

it("zooms image layout dimensions instead of producing unreachable negative overflow", async () => {
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(320);
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(352);
  const { container } = render(<ImageViewer images={[{ src: "/photo.jpg", alt: "Landscape" }]} />);
  const image = screen.getByRole("img", { name: "Landscape" }) as HTMLImageElement;
  Object.defineProperty(image, "naturalWidth", { value: 800 });
  Object.defineProperty(image, "naturalHeight", { value: 600 });
  fireEvent.load(image);
  expect(image.style.width).toBe("320px");
  await userEvent.click(screen.getByRole("button", { name: "Zoom in" }));
  expect(image.style.width).toBe("400px");
  expect(image.style.height).toBe("300px");
  expect(image.style.transform).toBe("");
  expect(container.querySelector(".rs-image-viewer-plane")).toBeTruthy();
});

describe("DataTable state", () => {
  const rows = [{ id: "b", name: "Beta" }, { id: "a", name: "Alpha" }];
  const columns = [{ key: "name", header: "Name", sortable: true }];
  it("keeps selection attached to row keys after sorting and filters visible rows", async () => {
    const changed = vi.fn();
    const { container } = render(<DataTable rows={rows} columns={columns} rowKey={(row) => row.id} selectable filterable onSelectionChange={changed} />);
    await userEvent.click(screen.getByRole("checkbox", { name: "Select row 1" }));
    expect(changed).toHaveBeenCalledWith(["b"]);
    await userEvent.click(screen.getByRole("button", { name: "Name" }));
    expect(container.querySelector('tr[data-selected="true"]')?.textContent).toContain("Beta");
    await userEvent.type(screen.getByRole("searchbox", { name: "Filter rows" }), "Alpha");
    expect(screen.queryByText("Beta")).toBeNull();
    expect(screen.getByText("Alpha")).toBeTruthy();
    expect(await axe(container, { rules: { "color-contrast": { enabled: false } } })).toHaveNoViolations();
  });
  it("emits but does not mutate controlled sorting, filtering or selection", async () => {
    const sortChanged = vi.fn(), selectionChanged = vi.fn(), filterChanged = vi.fn();
    render(<DataTable rows={rows} columns={columns} rowKey={(row) => row.id} sort={null} onSortChange={sortChanged} selectedKeys={[]} onSelectionChange={selectionChanged} selectable filterable filter="" onFilterChange={filterChanged} />);
    await userEvent.click(screen.getByRole("button", { name: "Name" }));
    expect(sortChanged).toHaveBeenCalledWith({ key: "name", dir: "asc" });
    expect(screen.getByRole("columnheader", { name: "Name" }).hasAttribute("aria-sort")).toBe(false);
    await userEvent.click(screen.getByRole("checkbox", { name: "Select row 1" }));
    expect(selectionChanged).toHaveBeenCalledWith(["b"]);
    expect((screen.getByRole("checkbox", { name: "Select row 1" }) as HTMLInputElement).checked).toBe(false);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "A" } });
    expect(filterChanged).toHaveBeenCalledWith("A");
    expect((screen.getByRole("searchbox") as HTMLInputElement).value).toBe("");
  });
});

it("clamps a context overlay into the viewport and flips it above the pointer", () => {
  Object.defineProperty(window, "innerWidth", { configurable: true, value: 390 });
  Object.defineProperty(window, "innerHeight", { configurable: true, value: 700 });
  function Overlay() {
    const panel = React.useRef<HTMLDivElement>(null);
    const anchor = React.useRef<HTMLDivElement>(null);
    const style = useOverlayPosition(true, panel, anchor, { x: 385, y: 695 });
    return <div ref={(element) => { panel.current = element; if (element) { Object.defineProperty(element, "scrollWidth", { configurable: true, value: 180 }); Object.defineProperty(element, "scrollHeight", { configurable: true, value: 220 }); } }} data-testid="overlay" style={style} />;
  }
  render(<Overlay />);
  const overlay = screen.getByTestId("overlay");
  expect(overlay.style.position).toBe("fixed");
  expect(Number.parseFloat(overlay.style.left)).toBeLessThanOrEqual(202);
  expect(Number.parseFloat(overlay.style.top)).toBeLessThanOrEqual(475);
});
