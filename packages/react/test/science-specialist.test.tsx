import * as React from "react";
import { act, cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { StackNavigator } from "../src/components/stack-navigator";
import { AcquisitionSequencer } from "../src/components/acquisition-sequencer";
import type { AcquisitionStep } from "../src/components/acquisition-sequencer";
import { SequenceAlignment } from "../src/components/sequence-alignment";
import { CoverageInspector } from "../src/components/coverage-inspector";
import { GenomicRegionField } from "../src/components/genomic-region-field";

afterEach(cleanup);
const axes = [{ id: "depth", label: "Depth", unit: "µm", positions: [{ value: -2 }, { value: 0 }, { value: 1, disabled: true }, { value: 4 }, { value: null }] }];
const channels = [{ id: "phase", label: "Phase" }, { id: "second", label: "Channel 2" }];
const capture: readonly AcquisitionStep[] = [
  { id: "first", label: "Baseline", exposure: 10, exposureUnit: "ms", time: 0, timeUnit: "s", depth: -1, depthUnit: "µm", channel: "phase", status: "Not run", actions: [{ id: "request", label: "Request capture" }] },
  { id: "second", label: "Follow-up", exposure: 20, exposureUnit: "ms", time: 5, timeUnit: "s", depth: 0, depthUnit: "µm", channel: "phase", status: "Not run" },
];
const alignment = { label: "Read alignment", contig: "chr7", referenceLabel: "Example reference", referenceSequence: "AC-GT", positions: [101, 102, null, 103, 104], reads: [{ id: "r1", label: "Read 001", sequence: "ACAGT" }, { id: "r2", label: "Read 002", sequence: "AC-GT" }] };
const loci = [{ position: 101, depth: 0, bases: { A: 0, C: 0 }, forward: 0, reverse: 0 }, { position: 102, depth: null }, { position: 105, depth: 24, bases: { A: 20, C: 4 }, forward: 12, reverse: 12 }];
const contigs = [{ id: "chr7", length: 1000 }, { id: "chr8", length: 80 }];
const region = { label: "Region", reference: "Example reference", contigs };

describe("StackNavigator", () => {
  it("preserves physical zero and signed values while using explicit zero-based submitted indexes", async () => {
    const user = userEvent.setup();
    const { container } = render(<form><StackNavigator label="Stack" axes={axes} name="plane" defaultValue={{ depth: 0 }} /></form>);
    expect(screen.getByText("Position 1 of 5; -2 µm")).toBeTruthy();
    expect(new FormData(container.querySelector("form")!).get("plane.depth")).toBe("0");
    await user.click(screen.getByRole("combobox", { name: "Depth" }));
    await user.keyboard("{ArrowDown}{Enter}");
    expect(screen.getByText("Position 2 of 5; 0 µm")).toBeTruthy();
    expect(new FormData(container.querySelector("form")!).get("plane.depth")).toBe("1");
  });
  it("moves by keyboard and skips disabled positions without changing physical spacing", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(<StackNavigator label="Stack" axes={axes} defaultValue={{ depth: 1 }} onValueChange={change} />);
    screen.getByRole("button", { name: "Next Depth position" }).focus();
    await user.keyboard("{Enter}");
    expect(change).toHaveBeenLastCalledWith({ depth: 3 });
    expect(screen.getByText("Position 4 of 5; 4 µm")).toBeTruthy();
    screen.getByRole("button", { name: "Previous Depth position" }).focus();
    await user.keyboard(" ");
    expect(screen.getByText("Position 2 of 5; 0 µm")).toBeTruthy();
  });
  it("does not choose missing positions or present invalid physical data as zero", () => {
    const { rerender } = render(<StackNavigator label="Stack" axes={axes} />);
    expect(screen.getByText("No position selected")).toBeTruthy();
    rerender(<StackNavigator label="Stack" axes={axes} value={{ depth: 999 }} />);
    expect(screen.getByText("Selected position unavailable")).toBeTruthy();
    rerender(<StackNavigator label="Stack" axes={axes} value={{ depth: 4 }} />);
    expect(screen.getByText("Position 5 of 5; Physical value unavailable")).toBeTruthy();
    rerender(<StackNavigator label="Stack" axes={[{ ...axes[0]!, positions: [{ value: Number.NaN }] }]} value={{ depth: 0 }} />);
    expect(screen.getByText("Position 1 of 1; Physical value unavailable")).toBeTruthy();
    rerender(<StackNavigator label="Stack" axes={[axes[0]!, axes[0]!]} />);
    expect(screen.queryByRole("combobox")).toBeNull();
    expect(screen.getByText(/Stack unavailable/)).toBeTruthy();
  });
  it("keeps controlled selection through rejected changes and reset", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const { container } = render(<form><StackNavigator label="Stack" axes={axes} value={{ depth: 1 }} onValueChange={change} /></form>);
    await user.click(screen.getByRole("button", { name: "Next Depth position" }));
    expect(change).toHaveBeenLastCalledWith({ depth: 3 });
    expect(screen.getByRole("combobox").textContent).toContain("2 / 5 · 0 µm");
    await act(async () => { container.querySelector("form")!.reset(); });
    expect(screen.getByRole("combobox").textContent).toContain("2 / 5 · 0 µm");
  });
  it("resets external-form defaults and preserves read-only indexes for submission", async () => {
    const user = userEvent.setup();
    const { container, rerender } = render(<><form id="stack-form" /><StackNavigator label="Stack" axes={axes} name="plane" form="stack-form" defaultValue={{ depth: 0 }} /></>);
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "4 / 5 · 4 µm" }));
    await act(async () => { container.querySelector("form")!.reset(); });
    expect(screen.getByRole("combobox").textContent).toContain("1 / 5 · -2 µm");
    rerender(<form><StackNavigator label="Stack" axes={axes} name="plane" value={{ depth: 1 }} readOnly /></form>);
    expect((screen.getByRole("combobox") as HTMLButtonElement).disabled).toBe(true);
    expect(new FormData(container.querySelector("form")!).get("plane.depth")).toBe("1");
    rerender(<form><StackNavigator label="Stack" axes={axes} name="plane" value={{ depth: 1 }} readOnly disabled /></form>);
    expect([...new FormData(container.querySelector("form")!).entries()]).toEqual([]);
  });
});

describe("AcquisitionSequencer", () => {
  it("proposes immutable edits while displaying only host-accepted values", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const { container } = render(<form><AcquisitionSequencer label="Plan" steps={capture} channels={channels} name="capture" onStepsChange={change} /></form>);
    await user.clear(screen.getByRole("spinbutton", { name: "Exposure (ms): step 1, Baseline" }));
    expect(change).toHaveBeenLastCalledWith([{ ...capture[0], exposure: null }, capture[1]]);
    expect((screen.getByRole("spinbutton", { name: "Exposure (ms): step 1, Baseline" }) as HTMLInputElement).value).toBe("10");
    await user.click(screen.getByRole("combobox", { name: "Channel: step 1, Baseline" }));
    await user.keyboard("{ArrowDown}{Enter}");
    expect(change).toHaveBeenLastCalledWith([{ ...capture[0], channel: "second" }, capture[1]]);
    expect(capture[0]!.channel).toBe("phase");
    const data = new FormData(container.querySelector("form")!);
    expect(data.get("capture.first.time")).toBe("0");
    expect(data.get("capture.first.depth")).toBe("-1");
    await act(async () => { container.querySelector("form")!.reset(); });
    expect(screen.getByRole("combobox", { name: "Channel: step 1, Baseline" }).textContent).toBe("Phase");
  });
  it("allows keyboard reordering once the host accepts the new sequence", async () => {
    const user = userEvent.setup();
    function Editor() { const [steps, setSteps] = React.useState(capture); return <AcquisitionSequencer label="Plan" steps={steps} channels={channels} onStepsChange={setSteps} />; }
    render(<Editor />);
    screen.getByRole("button", { name: "Move step 1, Baseline, down" }).focus();
    await user.keyboard("{Enter}");
    expect(screen.getAllByRole("listitem")[0]?.textContent).toContain("Follow-up");
    expect(screen.getByRole("spinbutton", { name: "Time offset (s): step 1, Follow-up" })).toBeTruthy();
    expect(screen.getAllByText("Not run")).toHaveLength(2);
  });
  it("requests actions without implying an actual capture and locks pending work", async () => {
    const user = userEvent.setup();
    const action = vi.fn();
    const submit = vi.fn(event => event.preventDefault());
    const change = vi.fn();
    const { rerender } = render(<form onSubmit={submit}><AcquisitionSequencer label="Plan" steps={capture} channels={channels} onAction={action} /></form>);
    await user.tab();
    await user.keyboard("{Enter}");
    expect(action).toHaveBeenLastCalledWith("first", "request");
    expect(submit).not.toHaveBeenCalled();
    expect(screen.getAllByText("Not run")).toHaveLength(2);
    expect(screen.queryByText(/confirmed/i)).toBeNull();
    rerender(<AcquisitionSequencer label="Plan" steps={[{ ...capture[0]!, pending: true }, capture[1]!]} channels={channels} onStepsChange={change} onAction={action} />);
    expect(screen.getByText("Request pending; recorded state unchanged")).toBeTruthy();
    expect((screen.getByRole("button", { name: "Request capture: step 1, Baseline" }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("spinbutton", { name: "Exposure (ms): step 1, Baseline" }) as HTMLInputElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: "Move step 2, Follow-up, up" }) as HTMLButtonElement).disabled).toBe(true);
    expect(change).not.toHaveBeenCalled();
  });
  it("distinguishes missing and nonfinite values from recorded zero and rejects ambiguous steps", () => {
    const { rerender } = render(<AcquisitionSequencer label="Plan" channels={channels} steps={[{ ...capture[0]!, exposure: null, depth: Number.NaN }]} readOnly />);
    expect(screen.getByText("0 s")).toBeTruthy();
    expect(screen.getByText("Not supplied")).toBeTruthy();
    expect(screen.getByText("Unavailable")).toBeTruthy();
    expect(screen.queryByRole("spinbutton")).toBeNull();
    rerender(<AcquisitionSequencer label="Plan" channels={channels} steps={[capture[0]!, capture[0]!]} />);
    expect(screen.getByText(/Sequence unavailable/)).toBeTruthy();
    rerender(<AcquisitionSequencer label="Plan" channels={channels} steps={[]} />);
    expect(screen.getByText("No capture steps supplied")).toBeTruthy();
  });
});

describe("SequenceAlignment", () => {
  it("preserves supplied read characters and genomic gaps with a complete table alternative", () => {
    const { container } = render(<SequenceAlignment {...alignment} />);
    expect(screen.getByRole("table", { name: "Read alignment, reference and reads" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Column 3, reference gap, reference -" })).toBeTruthy();
    expect(container.querySelectorAll("tbody tr")).toHaveLength(3);
    const read = screen.getByRole("rowheader", { name: "Read 001" }).closest("tr")!;
    expect([...read.querySelectorAll("td")].map(cell => cell.textContent).join("")).toBe("ACAGT");
  });
  it("moves focus without selecting and supports keyboard base and region selection", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(<SequenceAlignment {...alignment} onValueChange={change} />);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Column 1, chr7 position 101, reference A" }));
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Column 2, chr7 position 102, reference C" }));
    expect(change).not.toHaveBeenCalled();
    await user.keyboard("{Enter}");
    expect(change).toHaveBeenLastCalledWith({ startColumn: 2, endColumn: 2 });
    await user.keyboard("{Shift>}{ArrowRight}{ArrowRight}{/Shift}");
    expect(change).toHaveBeenLastCalledWith({ startColumn: 2, endColumn: 4 });
    expect(screen.getByRole("status").textContent).toBe("Selected columns 2–4; reference positions 102, gap, 103");
    expect(screen.getAllByRole("button", { pressed: true })).toHaveLength(3);
    await user.keyboard("{End}");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Column 5, chr7 position 104, reference T" }));
    expect(change).toHaveBeenCalledTimes(3);
  });
  it("retains a controlled selection after proposals and offers usable select-all and clear actions", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const { rerender } = render(<SequenceAlignment {...alignment} value={{ startColumn: 1, endColumn: 1 }} onValueChange={change} />);
    await user.click(screen.getByRole("button", { name: "Column 2, chr7 position 102, reference C" }));
    expect(change).toHaveBeenLastCalledWith({ startColumn: 2, endColumn: 2 });
    expect(screen.getByRole("button", { name: "Column 1, chr7 position 101, reference A" }).getAttribute("aria-pressed")).toBe("true");
    rerender(<SequenceAlignment {...alignment} key="uncontrolled" />);
    await user.click(screen.getByRole("button", { name: "Select all columns" }));
    expect(screen.getAllByRole("button", { pressed: true })).toHaveLength(5);
    await user.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(screen.getByText("No columns selected")).toBeTruthy();
  });
  it("keeps the read-only scrolling region keyboard reachable", async () => {
    const user = userEvent.setup();
    render(<SequenceAlignment {...alignment} readOnly />);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("region", { name: "Read alignment" }));
    expect(screen.queryByRole("button")).toBeNull();
  });
  it("rejects oversized, mismatched and contradictory data without truncating it", () => {
    const { rerender } = render(<SequenceAlignment {...alignment} referenceSequence="ACGT" />);
    expect(screen.getByText(/sequences, positions or read identifiers are inconsistent/)).toBeTruthy();
    expect(screen.queryByRole("table")).toBeNull();
    rerender(<SequenceAlignment {...alignment} positions={[101, 102, 103, 104, 105]} />);
    expect(screen.queryByRole("table")).toBeNull();
    rerender(<SequenceAlignment {...alignment} positions={Array.from({ length: 121 }, (_, index) => index + 1)} referenceSequence={"A".repeat(121)} reads={[]} />);
    expect(screen.getByText(/at most 120 columns and 32 reads/)).toBeTruthy();
    expect(screen.queryByRole("table")).toBeNull();
    rerender(<SequenceAlignment {...alignment} positions={[]} referenceSequence="" reads={[]} />);
    expect(screen.getByText("No alignment columns supplied")).toBeTruthy();
  });
});

describe("CoverageInspector", () => {
  it("distinguishes recorded zero, absent depth and unavailable counts", async () => {
    const user = userEvent.setup();
    const { container } = render(<CoverageInspector label="Coverage" contig="chr7" loci={loci} />);
    const details = container.querySelector("dl")!;
    expect([...details.querySelectorAll("dd")].map(item => item.textContent)).toEqual(["0", "0", "0"]);
    expect(container.querySelectorAll("circle.rs-coverage-inspector-point")).toHaveLength(2);
    expect(container.querySelectorAll("circle.rs-coverage-inspector-missing")).toHaveLength(1);
    await user.click(screen.getByRole("combobox", { name: "Inspect position" }));
    await user.keyboard("{ArrowDown}{Enter}");
    expect([...container.querySelector("dl")!.querySelectorAll("dd")].map(item => item.textContent)).toEqual(["Not supplied", "Not supplied", "Not supplied"]);
    await user.click(screen.getByText("Depth table, 3 positions"));
    const row = screen.getByRole("rowheader", { name: "101" }).closest("tr")!;
    expect(within(row).getByRole("cell", { name: "0" })).toBeTruthy();
    expect(within(screen.getByRole("rowheader", { name: "102" }).closest("tr")!).getByRole("cell", { name: "Not supplied" })).toBeTruthy();
  });
  it("uses supplied genomic distances in finite geometry and preserves maximum safe integer positions", () => {
    const { container, rerender } = render(<CoverageInspector label="Coverage" contig="chr7" loci={loci} />);
    const points = [...container.querySelectorAll("circle")];
    expect(points.map(point => point.getAttribute("cx"))).toEqual(["8", "154", "592"]);
    expect(points[0]!.getAttribute("cy")).toBe("102");
    rerender(<CoverageInspector label="Coverage" contig="chr7" loci={[{ position: Number.MAX_SAFE_INTEGER, depth: Number.MAX_SAFE_INTEGER }]} />);
    expect(container.querySelector("circle")?.getAttribute("cx")).toBe("300");
    expect(container.querySelector("svg")?.outerHTML).not.toMatch(/NaN|Infinity/);
  });
  it("does not accept rejected controlled position changes and supports native keyboard access to details", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(<CoverageInspector label="Coverage" contig="chr7" loci={loci} value={105} onValueChange={change} />);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("combobox", { name: "Inspect position" }));
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "101 · Depth 0" }));
    expect(change).toHaveBeenLastCalledWith(101);
    expect(screen.getByRole("combobox").textContent).toBe("105 · Depth 24");
    expect(screen.getByText("20")).toBeTruthy();
    await user.tab();
    expect(document.activeElement).toBe(screen.getByText("Depth table, 3 positions"));
  });
  it("exposes malformed counts and rejects invalid or oversized coordinate windows", () => {
    const { container, rerender } = render(<CoverageInspector label="Coverage" contig="chr7" loci={[{ position: 1, depth: -1, forward: Number.NaN, reverse: Infinity }]} />);
    expect([...container.querySelector("dl")!.querySelectorAll("dd")].map(item => item.textContent)).toEqual(["Unavailable", "Unavailable", "Unavailable"]);
    expect(container.querySelector(".rs-coverage-inspector-plot path")).toBeNull();
    rerender(<CoverageInspector label="Coverage" contig="chr7" loci={[{ position: 0, depth: 0 }]} />);
    expect(screen.getByText(/Coverage unavailable/)).toBeTruthy();
    expect(container.querySelector("svg")).toBeNull();
    rerender(<CoverageInspector label="Coverage" contig="chr7" loci={Array.from({ length: 513 }, (_, index) => ({ position: index + 1, depth: 0 }))} />);
    expect(screen.queryByRole("combobox")).toBeNull();
    rerender(<CoverageInspector label="Coverage" contig="chr7" loci={[]} />);
    expect(screen.getByText("No coverage records supplied")).toBeTruthy();
  });
});

describe("GenomicRegionField", () => {
  it("submits explicit reference and inclusive coordinates without conversion", () => {
    const { container } = render(<form><GenomicRegionField {...region} name="region" defaultValue={{ contig: "chr7", start: 1, end: 1 }} required /></form>);
    expect(screen.getByText("1 positions, including both endpoints")).toBeTruthy();
    expect(container.querySelector("form")!.checkValidity()).toBe(true);
    expect(Object.fromEntries(new FormData(container.querySelector("form")!))).toEqual({ "region.reference": "Example reference", "region.coordinates": "1-based-inclusive", "region.contig": "chr7", "region.start": "1", "region.end": "1" });
  });
  it.each([
    [{ contig: "chr7", start: 0, end: 1 }, "Positions begin at 1"],
    [{ contig: "chr7", start: 20, end: 10 }, "End must be at or after start"],
    [{ contig: "chr7", start: 1.5, end: 10 }, "Positions must be whole safe integers"],
    [{ contig: "chr7", start: 1, end: Number.MAX_SAFE_INTEGER + 1 }, "Positions must be whole safe integers"],
    [{ contig: "chr7", start: Number.NaN, end: 10 }, "Positions must be whole safe integers"],
    [{ contig: "chr7", start: 1, end: 1001 }, "End must be at most 1000"],
    [{ contig: "chr7", start: null, end: 10 }, "Enter both start and end positions"],
    [{ contig: "unknown", start: 1, end: 10 }, "Choose a supplied contig"],
  ] as const)("prevents invalid genomic region %j from native submission", (value, message) => {
    const { container } = render(<form><GenomicRegionField {...region} value={value} /></form>);
    expect(screen.getByText(message)).toBeTruthy();
    expect(container.querySelector("form")!.checkValidity()).toBe(false);
    expect(screen.getByRole("spinbutton", { name: "Start" }).getAttribute("aria-invalid")).toBe("true");
  });
  it("preserves coordinates on contig changes, making new bounds explicit", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const { container } = render(<form><GenomicRegionField {...region} defaultValue={{ contig: "chr7", start: 101, end: 105 }} onValueChange={change} /></form>);
    await user.click(screen.getByRole("combobox", { name: "Contig" }));
    await user.keyboard("{ArrowDown}{Enter}");
    expect(change).toHaveBeenLastCalledWith({ contig: "chr8", start: 101, end: 105 });
    expect((screen.getByRole("spinbutton", { name: "Start" }) as HTMLInputElement).value).toBe("101");
    expect(screen.getByText("End must be at most 80")).toBeTruthy();
    expect(container.querySelector("form")!.checkValidity()).toBe(false);
  });
  it("supports keyboard edits and external form reset without changing the coordinate convention", async () => {
    const user = userEvent.setup();
    const { container } = render(<><form id="region-form" /><GenomicRegionField {...region} name="region" form="region-form" defaultValue={{ contig: "chr7", start: 1, end: 10 }} /></>);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("combobox", { name: "Contig" }));
    await user.tab();
    await user.keyboard("{Control>}a{/Control}5");
    expect((screen.getByRole("spinbutton", { name: "Start" }) as HTMLInputElement).value).toBe("5");
    expect(screen.getByText("6 positions, including both endpoints")).toBeTruthy();
    await act(async () => { container.querySelector("form")!.reset(); });
    expect((screen.getByRole("spinbutton", { name: "Start" }) as HTMLInputElement).value).toBe("1");
    expect(new FormData(container.querySelector("form")!).get("region.coordinates")).toBe("1-based-inclusive");
  });
  it("retains controlled coordinates through rejected edits and native reset", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const { container } = render(<form><GenomicRegionField {...region} value={{ contig: "chr7", start: 1, end: 10 }} onValueChange={change} /></form>);
    await user.clear(screen.getByRole("spinbutton", { name: "Start" }));
    expect(change).toHaveBeenLastCalledWith({ contig: "chr7", start: null, end: 10 });
    expect((screen.getByRole("spinbutton", { name: "Start" }) as HTMLInputElement).value).toBe("1");
    await act(async () => { container.querySelector("form")!.reset(); });
    expect((screen.getByRole("spinbutton", { name: "Start" }) as HTMLInputElement).value).toBe("1");
  });
  it("allows an empty optional field and submits read-only values while excluding disabled fields", () => {
    const { container, rerender } = render(<form><GenomicRegionField {...region} /></form>);
    expect(screen.getByText("No region entered")).toBeTruthy();
    expect(container.querySelector("form")!.checkValidity()).toBe(true);
    rerender(<form><GenomicRegionField {...region} name="region" value={{ contig: "chr7", start: 1, end: 1 }} readOnly /></form>);
    expect((screen.getByRole("spinbutton", { name: "Start" }) as HTMLInputElement).readOnly).toBe(true);
    expect(new FormData(container.querySelector("form")!).get("region.contig")).toBe("chr7");
    rerender(<form><GenomicRegionField {...region} name="region" value={{ contig: "chr7", start: 1, end: 1 }} readOnly disabled /></form>);
    expect([...new FormData(container.querySelector("form")!).entries()]).toEqual([]);
  });
});

const specimens = [
  <StackNavigator key="stack" label="Stack" axes={axes} defaultValue={{ depth: 1 }} />,
  <AcquisitionSequencer key="capture" label="Plan" steps={capture} channels={channels} onStepsChange={() => {}} onAction={() => {}} />,
  <SequenceAlignment key="alignment" {...alignment} />,
  <CoverageInspector key="coverage" label="Coverage" contig="chr7" loci={loci} />,
  <GenomicRegionField key="region" {...region} defaultValue={{ contig: "chr7", start: 1, end: 10 }} />,
];
it.each(specimens.map((specimen, index) => [index, specimen] as const))("specialist science specimen %s has no axe violations", async (_, specimen) => {
  const { container } = render(specimen);
  expect((await axe(container, { rules: { "color-contrast": { enabled: false } } })).violations).toEqual([]);
});

const refCases = [
  [StackNavigator, { label: "Stack", axes }, "FIELDSET"],
  [AcquisitionSequencer, { label: "Plan", steps: capture, channels }, "FIELDSET"],
  [SequenceAlignment, alignment, "DIV"],
  [CoverageInspector, { label: "Coverage", contig: "chr7", loci }, "FIGURE"],
  [GenomicRegionField, region, "FIELDSET"],
] as const;
it.each(refCases)("forwards %s root refs and native attributes with merged styles", (Component, props, tag) => {
  const ref = React.createRef<HTMLElement>();
  const Leaf = Component as unknown as React.ComponentType<Record<string, unknown> & React.RefAttributes<HTMLElement>>;
  render(<Leaf {...props} ref={ref} data-record="042" className="consumer" style={{ marginTop: 17 }} />);
  expect(ref.current?.tagName).toBe(tag);
  expect(ref.current?.dataset.record).toBe("042");
  expect(ref.current?.className).toContain("consumer");
  expect(ref.current?.style.marginTop).toBe("17px");
});
