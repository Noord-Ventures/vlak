import * as React from "react";
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { MeasurementValue } from "../src/components/measurement-value";
import { QuantityField } from "../src/components/quantity-field";
import { WellPlate } from "../src/components/well-plate";
import { ExperimentRun } from "../src/components/experiment-run";
import { SpectrumPlot } from "../src/components/spectrum-plot";

afterEach(cleanup);
const units = [{ value: "ul", label: "µL" }, { value: "ml", label: "mL" }];
const plate = { label: "Plate 042", rows: ["A", "B"], columns: ["1", "2", "3"], wells: [{ row: "A", column: "1", status: "Loaded" }, { row: "A", column: "2", status: "Reserved", disabled: true }] };
const spectrum = { label: "Supplied spectrum", xLabel: "Wavelength", xUnit: "nm", yLabel: "Signal", yUnit: "counts", points: [{ x: 0, y: 0 }, { x: 1, y: 2 }, { x: 2, y: 1 }] };

describe("MeasurementValue", () => {
  it("preserves zeros and supplied significant figures without inferring uncertainty", () => {
    const { rerender } = render(<MeasurementValue label="Sample mass" value={0} uncertainty={0} unit="g" />);
    expect(screen.getByText("0")).toBeTruthy();
    expect(screen.getByText("± 0")).toBeTruthy();
    expect(screen.getByText("Supplied uncertainty")).toBeTruthy();
    rerender(<MeasurementValue label="Sample mass" value="1.230" unit="g" notation="scientific" />);
    expect(screen.getByText("1.230")).toBeTruthy();
    expect(screen.queryByText("Supplied uncertainty")).toBeNull();
    rerender(<MeasurementValue label="Reading" value={0.0000123} notation="scientific" />);
    expect(screen.getByText("1.23e-5")).toBeTruthy();
  });
  it.each([undefined, null, Number.NaN, Infinity, " "])("names missing or invalid reading %s", value => {
    render(<MeasurementValue label="Reading" value={value} uncertainty={0.1} />);
    expect(screen.getByText("Measurement unavailable")).toBeTruthy();
    expect(document.querySelector(".rs-measurement-value-number")).toBeNull();
  });
  it("suppresses pending readings and keeps invalid uncertainty separate from valid measurements", () => {
    const { rerender } = render(<MeasurementValue label="Reading" value={123} status="pending" />);
    expect(screen.getByText("Measurement pending")).toBeTruthy();
    expect(screen.queryByText("123")).toBeNull();
    rerender(<MeasurementValue label="Reading" value={123} uncertainty={-1} />);
    expect(screen.getByText("123")).toBeTruthy();
    expect(screen.getByText("Uncertainty unavailable")).toBeTruthy();
  });
});

describe("QuantityField", () => {
  it("submits the numeric amount and unit separately without converting either", async () => {
    const change = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<form><QuantityField label="Volume" name="volume" units={units} defaultValue={{ amount: 0, unit: "ul" }} onValueChange={change} /></form>);
    expect(new FormData(container.querySelector("form")!).get("volume")).toBe("0");
    await user.clear(screen.getByRole("spinbutton", { name: "Amount" }));
    await user.type(screen.getByRole("spinbutton"), "250");
    await user.selectOptions(screen.getByRole("combobox", { name: "Unit" }), "ml");
    expect(change).toHaveBeenLastCalledWith({ amount: 250, unit: "ml" });
    const data = new FormData(container.querySelector("form")!);
    expect(data.get("volume")).toBe("250");
    expect(data.get("volume.unit")).toBe("ml");
  });
  it("keeps controlled data through rejected changes and reset", async () => {
    const change = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<form><QuantityField label="Volume" units={units} value={{ amount: 250, unit: "ul" }} onValueChange={change} /></form>);
    await user.selectOptions(screen.getByRole("combobox"), "ml");
    expect(change).toHaveBeenLastCalledWith({ amount: 250, unit: "ml" });
    expect((screen.getByRole("combobox") as HTMLSelectElement).value).toBe("ul");
    await user.clear(screen.getByRole("spinbutton"));
    expect((screen.getByRole("spinbutton") as HTMLInputElement).value).toBe("250");
    await act(async () => { container.querySelector("form")!.reset(); });
    expect((screen.getByRole("spinbutton") as HTMLInputElement).value).toBe("250");
    expect((screen.getByRole("combobox") as HTMLSelectElement).value).toBe("ul");
  });
  it("restores uncontrolled defaults in an external form and follows native validation", async () => {
    const user = userEvent.setup();
    const { container } = render(<><form id="record" /><QuantityField label="Volume" form="record" name="amount" units={units} defaultValue={{ amount: 0, unit: "ul" }} min={0} required /></>);
    await user.clear(screen.getByRole("spinbutton"));
    expect(container.querySelector("form")!.checkValidity()).toBe(false);
    await user.type(screen.getByRole("spinbutton"), "20");
    await user.selectOptions(screen.getByRole("combobox"), "ml");
    expect(container.querySelector("form")!.checkValidity()).toBe(true);
    await act(async () => { container.querySelector("form")!.reset(); });
    expect((screen.getByRole("spinbutton") as HTMLInputElement).value).toBe("0");
    expect((screen.getByRole("combobox") as HTMLSelectElement).value).toBe("ul");
  });
  it("submits read-only quantities but excludes disabled ones, without choosing unknown units", () => {
    const { container, rerender } = render(<form><QuantityField label="Volume" name="amount" units={units} value={{ amount: 0, unit: "ul" }} readOnly /></form>);
    expect((screen.getByRole("spinbutton") as HTMLInputElement).readOnly).toBe(true);
    expect((screen.getByRole("combobox") as HTMLSelectElement).disabled).toBe(true);
    expect(new FormData(container.querySelector("form")!).get("amount.unit")).toBe("ul");
    rerender(<form><QuantityField label="Volume" name="amount" units={units} value={{ amount: 0, unit: "ul" }} disabled /></form>);
    expect(Array.from(new FormData(container.querySelector("form")!).entries())).toEqual([]);
    rerender(<QuantityField label="Volume" units={units} value={{ amount: Number.NaN, unit: "unknown" }} />);
    expect(screen.getByText("Amount unavailable")).toBeTruthy();
    expect(screen.getByText("Unit unavailable")).toBeTruthy();
    expect((screen.getByRole("combobox") as HTMLSelectElement).value).toBe("");
  });
});

describe("WellPlate", () => {
  it("uses one tab stop, arrow navigation that skips disabled wells, and explicit selection", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(<WellPlate {...plate} onValueChange={change} />);
    const first = screen.getByRole("button", { name: "Well A, 1: Loaded" });
    await user.tab();
    expect(document.activeElement).toBe(first);
    expect(screen.getAllByRole("button").filter(button => button.tabIndex === 0)).toHaveLength(1);
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Well A, 3: Unrecorded" }));
    expect(change).not.toHaveBeenCalled();
    await user.keyboard("{ArrowDown}{Enter}");
    expect(change).toHaveBeenLastCalledWith({ row: "B", column: "3" });
    expect(document.activeElement?.closest("td")?.getAttribute("aria-selected")).toBe("true");
    await user.keyboard("{Home}");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Well B, 1: Unrecorded" }));
    await user.keyboard("{Control>}{Home}{/Control}");
    expect(document.activeElement).toBe(first);
    await user.keyboard("{Control>}{End}{/Control}");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Well B, 3: Unrecorded" }));
  });
  it("does not change controlled selection before the caller accepts it", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(<WellPlate {...plate} value={{ row: "A", column: "1" }} onValueChange={change} />);
    const other = screen.getByRole("button", { name: "Well A, 3: Unrecorded" });
    await user.click(other);
    expect(change).toHaveBeenLastCalledWith({ row: "A", column: "3" });
    expect(other.closest("td")?.getAttribute("aria-selected")).toBe("false");
    expect(screen.getByRole("button", { name: "Well A, 1: Loaded" }).closest("td")?.getAttribute("aria-selected")).toBe("true");
  });
  it("provides static records and rejects ambiguous or oversized layouts", () => {
    const { rerender } = render(<WellPlate {...plate} readOnly />);
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getAllByText("Unrecorded")).toHaveLength(4);
    rerender(<WellPlate {...plate} rows={["A", "A"]} />);
    expect(screen.getByText(/row, column or well records are invalid/)).toBeTruthy();
    expect(screen.queryByRole("grid")).toBeNull();
    rerender(<WellPlate {...plate} wells={[{ row: "Z", column: "1", status: "Loaded" }]} />);
    expect(screen.queryByRole("grid")).toBeNull();
    rerender(<WellPlate {...plate} rows={Array.from({ length: 1537 }, (_, index) => String(index))} />);
    expect(screen.getByText(/at most 1536 wells/)).toBeTruthy();
  });
  it("keeps a static plate's scroll region keyboard reachable", async () => {
    const user = userEvent.setup();
    render(<WellPlate {...plate} readOnly />);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("region", { name: "Plate 042" }));
  });
});

describe("ExperimentRun", () => {
  it("requests a keyboard action without inventing completion and blocks pending actions", async () => {
    const user = userEvent.setup();
    const action = vi.fn();
    const steps = [{ id: "review", label: "Review acquisition", status: "Not reviewed", actions: [{ id: "review", label: "Record review" }] }];
    const { rerender } = render(<ExperimentRun label="Run" status="Awaiting review" conditions={[{ id: "offset", label: "Offset", value: 0 }, { id: "unknown", label: "Temperature", value: null }]} steps={steps} onAction={action} />);
    expect(screen.getByText("0")).toBeTruthy();
    expect(screen.getByText("Not supplied")).toBeTruthy();
    await user.tab();
    await user.keyboard("{Enter}");
    expect(action).toHaveBeenLastCalledWith("review", "review");
    expect(screen.getByText("Not reviewed")).toBeTruthy();
    rerender(<ExperimentRun label="Run" status="Awaiting review" steps={[{ ...steps[0]!, pending: true }]} onAction={action} />);
    expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText("Update pending")).toBeTruthy();
  });
});

describe("SpectrumPlot", () => {
  it("plots the original x spacing, keeps zero and exposes supplied annotations", () => {
    const { container } = render(<SpectrumPlot {...spectrum} peaks={[{ id: "p", label: "Marked feature", x: 1, y: 2 }]} />);
    expect(container.querySelector("polyline")?.getAttribute("points")).toBe("128,216 370,32 612,124");
    expect(container.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
    expect(screen.getByText("Marked feature: Wavelength (nm) 1; Signal (counts) 2")).toBeTruthy();
    expect(container.querySelectorAll("tbody tr")).toHaveLength(3);
  });
  it("makes all data reachable by keyboard pagination while keeping only 50 table rows mounted", async () => {
    const user = userEvent.setup();
    const { container } = render(<SpectrumPlot {...spectrum} points={Array.from({ length: 51 }, (_, index) => ({ x: index, y: index * 2 }))} />);
    const summary = screen.getByText("Data table, 51 points");
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("region", { name: "Supplied spectrum plot" }));
    await user.tab();
    expect(document.activeElement).toBe(summary);
    await user.click(summary);
    expect(container.querySelectorAll("tbody tr")).toHaveLength(50);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Next rows" }));
    await user.keyboard("{Enter}");
    expect(screen.getByText("Rows 51–51 of 51")).toBeTruthy();
    expect(container.querySelectorAll("tbody tr")).toHaveLength(1);
    expect(screen.getByRole("cell", { name: "100" })).toBeTruthy();
  });
  it("shows a singleton and handles constant or extreme finite domains without invalid geometry", () => {
    const { container, rerender } = render(<SpectrumPlot {...spectrum} points={[{ x: 0, y: 0 }]} />);
    expect(container.querySelector("circle")?.getAttribute("cx")).toBe("370");
    expect(container.querySelector("circle")?.getAttribute("cy")).toBe("124");
    rerender(<SpectrumPlot {...spectrum} points={[{ x: -Number.MAX_VALUE, y: -Number.MAX_VALUE }, { x: Number.MAX_VALUE, y: Number.MAX_VALUE }]} />);
    expect(container.querySelector("polyline")?.getAttribute("points")).toBe("128,216 612,32");
    expect(container.querySelector("svg")?.outerHTML).not.toMatch(/NaN|Infinity/);
  });
  it("reports empty, invalid, out-of-domain and oversized data without partial plotting", () => {
    const { container, rerender } = render(<SpectrumPlot {...spectrum} points={[]} />);
    expect(screen.getByText("No spectrum points supplied")).toBeTruthy();
    rerender(<SpectrumPlot {...spectrum} points={[{ x: 0, y: Number.NaN }]} />);
    expect(container.querySelector("svg")).toBeNull();
    expect(screen.getByText("Unavailable")).toBeTruthy();
    rerender(<SpectrumPlot {...spectrum} xDomain={[1, 2]} />);
    expect(screen.getByText(/fall outside the axis bounds/)).toBeTruthy();
    expect(container.querySelector("svg")).toBeNull();
    rerender(<SpectrumPlot {...spectrum} xDomain={[2, 1]} />);
    expect(screen.getByText(/axis bounds must be finite and increasing/)).toBeTruthy();
    rerender(<SpectrumPlot {...spectrum} points={Array.from({ length: 4097 }, () => ({ x: 0, y: 0 }))} />);
    expect(screen.getByText(/at most 4096 points/)).toBeTruthy();
    expect(container.querySelector("svg")).toBeNull();
    expect(container.querySelector("table")).toBeNull();
  });
});

const specimens = [
  <MeasurementValue key="measurement" label="Sample mass" value="1.230" uncertainty={0.005} unit="g" />,
  <QuantityField key="quantity" label="Volume" description="Recorded volume" units={units} defaultValue={{ amount: 250, unit: "ul" }} />,
  <WellPlate key="plate" {...plate} />,
  <ExperimentRun key="experiment" label="Run" status="Awaiting review" steps={[{ id: "review", label: "Review", status: "Not reviewed", actions: [{ id: "review", label: "Record review" }] }]} onAction={() => {}} />,
  <SpectrumPlot key="spectrum" {...spectrum} />,
];
it.each(specimens.map((specimen, index) => [index, specimen] as const))("science specimen %s has no axe violations", async (_, specimen) => {
  const { container } = render(specimen);
  expect((await axe(container, { rules: { "color-contrast": { enabled: false } } })).violations).toEqual([]);
});

const refCases = [
  [MeasurementValue, { label: "Reading", value: 0 }, "DIV"],
  [QuantityField, { label: "Volume", units }, "FIELDSET"],
  [WellPlate, plate, "DIV"],
  [ExperimentRun, { label: "Run", status: "Awaiting review", steps: [] }, "DIV"],
  [SpectrumPlot, spectrum, "FIGURE"],
] as const;
it.each(refCases)("forwards %s native root attributes and ref", (Component, props, tag) => {
  const ref = React.createRef<HTMLElement>();
  const Leaf = Component as unknown as React.ComponentType<Record<string, unknown> & React.RefAttributes<HTMLElement>>;
  render(<Leaf {...props} ref={ref} data-record="042" className="consumer" style={{ marginTop: 17 }} />);
  expect(ref.current?.tagName).toBe(tag);
  expect(ref.current?.dataset.record).toBe("042");
  expect(ref.current?.className).toContain("consumer");
  expect(ref.current?.style.marginTop).toBe("17px");
});
