import * as React from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { Patchbay } from "../src/components/patchbay";
import { KerningPairEditor } from "../src/components/kerning-pair-editor";
import { AssemblyVariantMatrix } from "../src/components/assembly-variant-matrix";

afterEach(cleanup);
const sources = [{ id: "left", label: "Mix left", group: "Bus", signalType: "audio" }, { id: "right", label: "Mix right", group: "Bus", signalType: "audio" }];
const destinations = [{ id: "a", label: "Output A", group: "Interface", signalType: "audio" }, { id: "clock", label: "Clock", signalType: "control" }, { id: "b", label: "Output B", group: "Interface", signalType: "audio" }];
const routes = [{ sourceId: "left", destinationId: "a" }];
const pairs = [{ id: "av", left: "A", right: "V" }, { id: "to", left: "T", right: "o" }];
const references = [{ id: "r1", label: "R1", partLabel: "10 kΩ resistor" }];
const variants = [{ id: "pilot", label: "Pilot" }, { id: "production", label: "Production" }];
const cells = [{ referenceId: "r1", variantId: "pilot", populated: false, includeInBom: true, includeInPlacement: false }];

describe("Patchbay", () => {
  it("uses one tab stop, roves around blocked signal types, and toggles routes with Space", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const ref = React.createRef<HTMLFieldSetElement>();
    render(<Patchbay ref={ref} label="Routing" sources={sources} destinations={destinations} defaultValue={routes} onValueChange={change} />);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("checkbox", { name: "Mix left to Output A" }));
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(screen.getByRole("checkbox", { name: "Mix left to Output B" }));
    await user.keyboard(" ");
    expect(change).toHaveBeenLastCalledWith([...routes, { sourceId: "left", destinationId: "b" }]);
    await user.keyboard("{ArrowDown}{Home}");
    expect(document.activeElement).toBe(screen.getByRole("checkbox", { name: "Mix right to Output A" }));
    await user.keyboard("{Control>}{Home}{/Control}");
    expect(document.activeElement).toBe(screen.getByRole("checkbox", { name: "Mix left to Output A" }));
    expect(screen.getAllByRole("checkbox").filter((input) => input.tabIndex === 0)).toHaveLength(1);
    expect(ref.current).toBe(screen.getByRole("group", { name: "Routing" }));
    expect((screen.getByRole("checkbox", { name: "Mix left to Clock" }) as HTMLInputElement).disabled).toBe(true);
  });

  it("submits checked pairs, resets external forms, and retains read-only routes", async () => {
    const user = userEvent.setup();
    const { container, rerender } = render(<><form id="route-form" /><Patchbay label="Routing" sources={sources} destinations={destinations} defaultValue={routes} name="routes" form="route-form" /></>);
    const form = container.querySelector("form")!;
    expect(new FormData(form).getAll("routes")).toEqual(['["left","a"]']);
    await user.click(screen.getByRole("checkbox", { name: "Mix left to Output B" }));
    expect(new FormData(form).getAll("routes")).toHaveLength(2);
    act(() => form.reset());
    await waitFor(() => expect(new FormData(form).getAll("routes")).toEqual(['["left","a"]']));
    rerender(<form><Patchbay label="Routing" sources={sources} destinations={destinations} value={routes} name="routes" readOnly /></form>);
    expect(new FormData(container.querySelector("form")!).getAll("routes")).toEqual(['["left","a"]']);
    rerender(<form><Patchbay label="Routing" sources={sources} destinations={destinations} value={routes} name="routes" readOnly disabled /></form>);
    expect(new FormData(container.querySelector("form")!).has("routes")).toBe(false);
  });

  it("preserves controlled confirmation and unavailable routes while permitting an incompatible route to be removed", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const supplied = [{ sourceId: "left", destinationId: "clock" }, { sourceId: "missing", destinationId: "a" }];
    render(<Patchbay label="Routing" sources={sources} destinations={destinations} value={supplied} onValueChange={change} getBlockReason={(_, destination) => destination.id === "a" ? "Port reserved by the host." : null} />);
    expect(screen.getByText("missing to a")).toBeTruthy();
    expect(screen.getAllByText("Port reserved by the host.")).toHaveLength(2);
    const incompatible = screen.getByRole("checkbox", { name: "Mix left to Clock" }) as HTMLInputElement;
    expect(incompatible.disabled).toBe(false);
    await user.click(incompatible);
    expect(change).toHaveBeenLastCalledWith([{ sourceId: "missing", destinationId: "a" }]);
    expect(incompatible.checked).toBe(true);
  });

  it("handles empty ports and missing signal types without offering a false connection", () => {
    const { rerender } = render(<Patchbay label="Routing" sources={[]} destinations={[]} />);
    expect(screen.getByText("Supply source and destination ports to edit connections.")).toBeTruthy();
    rerender(<Patchbay label="Routing" sources={[{ id: "x", label: "Unknown source", signalType: "" }]} destinations={[{ id: "y", label: "Unknown destination", signalType: "" }]} />);
    expect(screen.getByText("Signal type unavailable.")).toBeTruthy();
    expect((screen.getByRole("checkbox") as HTMLInputElement).disabled).toBe(true);
  });
});

describe("KerningPairEditor", () => {
  it("converts font units accurately and supports bounded single-unit and Shift nudges", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const { container } = render(<KerningPairEditor label="Pair spacing" pairs={pairs} fontFamily="Georgia" unitsPerEm={1000} min={-100} max={0} baselineOffsets={{ av: -60 }} defaultValue={{ av: -80 }} onValueChange={change} />);
    expect(container.querySelectorAll<HTMLElement>(".rs-kerning-pair-editor-glyphs")[1]!.lastElementChild?.getAttribute("style")).toContain("margin-inline-start: -0.08em");
    const input = screen.getByRole("spinbutton", { name: "Offset (font units)" }) as HTMLInputElement;
    input.focus();
    await user.keyboard("{ArrowRight}{Shift>}{ArrowRight}{/Shift}");
    expect(input.value).toBe("-69");
    expect(change).toHaveBeenLastCalledWith({ av: -69 });
    fireEvent.change(input, { target: { value: "-99" } });
    await user.keyboard("{Shift>}{ArrowLeft}{/Shift}");
    expect(input.value).toBe("-100");
    expect(screen.getByText("Baseline: -60 units")).toBeTruthy();
    expect(screen.getByText("Edited: -100 units")).toBeTruthy();
  });

  it("navigates pairs, resets to supplied baseline, and undoes only the last confirmed edit", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<KerningPairEditor label="Pair spacing" pairs={pairs} fontFamily="Georgia" unitsPerEm={1000} baselineOffsets={{ av: 0, to: -40 }} defaultValue={{ av: -80, to: -50 }} />);
    await user.click(screen.getByRole("button", { name: "Reset to baseline" }));
    expect((screen.getByRole("spinbutton") as HTMLInputElement).value).toBe("0");
    await user.click(screen.getByRole("button", { name: "Undo last edit" }));
    expect((screen.getByRole("spinbutton") as HTMLInputElement).value).toBe("-80");
    screen.getByRole("button", { name: "Next pair" }).focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("combobox").textContent).toContain("T / o");
    expect((screen.getByRole("spinbutton") as HTMLInputElement).value).toBe("-50");
    expect((screen.getByRole("button", { name: "Next pair" }) as HTMLButtonElement).disabled).toBe(true);
    rerender(<KerningPairEditor label="Pair spacing" pairs={pairs} fontFamily="Georgia" unitsPerEm={1000} value={{ av: -60, to: -50 }} activePairId="av" />);
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "-80" } });
    expect((screen.getByRole("spinbutton") as HTMLInputElement).value).toBe("-60");
    expect((screen.getByRole("button", { name: "Undo last edit" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("preserves zero, fractional and missing offsets and avoids invalid preview geometry", () => {
    const { container, rerender } = render(<KerningPairEditor label="Pair spacing" pairs={pairs} fontFamily="Georgia" unitsPerEm={1000} defaultValue={{ av: 0 }} />);
    expect(screen.getByText("Baseline: not supplied")).toBeTruthy();
    expect(screen.getByText("Edited: 0 units")).toBeTruthy();
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "-0.5" } });
    expect((screen.getByRole("spinbutton") as HTMLInputElement).validity.stepMismatch).toBe(false);
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "" } });
    expect(screen.getByText("Edited: not supplied")).toBeTruthy();
    rerender(<KerningPairEditor label="Pair spacing" pairs={pairs} fontFamily="Georgia" unitsPerEm={0} value={{ av: Number.NaN }} />);
    expect(screen.getByText("Supply a font family and positive units per em to preview spacing.")).toBeTruthy();
    expect(screen.getByText("Edited: unavailable")).toBeTruthy();
    expect(screen.queryByRole("img")).toBeNull();
    expect(container.innerHTML).not.toMatch(/NaN|Infinity/);
    rerender(<KerningPairEditor label="Pair spacing" pairs={[]} fontFamily="Georgia" unitsPerEm={1000} />);
    expect(screen.getByText("No glyph pairs supplied")).toBeTruthy();
  });

  it("submits every named pair, restores uncontrolled values and clears undo on reset", async () => {
    const ref = React.createRef<HTMLFieldSetElement>();
    const { container } = render(<form><KerningPairEditor ref={ref} label="Pair spacing" pairs={pairs} fontFamily="Georgia" unitsPerEm={1000} name="kern" defaultValue={{ av: -60, to: 0 }} /></form>);
    const form = container.querySelector("form")!;
    expect(new FormData(form).get("kern.to")).toBe("0");
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "-80" } });
    expect(new FormData(form).get("kern.av")).toBe("-80");
    act(() => form.reset());
    await waitFor(() => expect(new FormData(form).get("kern.av")).toBe("-60"));
    expect((screen.getByRole("button", { name: "Undo last edit" }) as HTMLButtonElement).disabled).toBe(true);
    expect(ref.current?.tagName).toBe("FIELDSET");
  });

  it("honors controlled navigation and read-only offsets", async () => {
    const user = userEvent.setup();
    const active = vi.fn();
    const change = vi.fn();
    render(<KerningPairEditor label="Pair spacing" pairs={pairs} fontFamily="Georgia" unitsPerEm={1000} value={{ av: -60 }} activePairId="av" onActivePairChange={active} onValueChange={change} readOnly />);
    await user.click(screen.getByRole("button", { name: "Next pair" }));
    expect(active).toHaveBeenLastCalledWith("to");
    expect(screen.getByRole("combobox").textContent).toContain("A / V");
    screen.getByRole("spinbutton").focus();
    await user.keyboard("{ArrowRight}");
    expect(change).not.toHaveBeenCalled();
  });
});

describe("AssemblyVariantMatrix", () => {
  it("opens a native details editor from a keyboard-reachable summary and edits flags independently", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(<AssemblyVariantMatrix label="Assembly" references={references} variants={variants} defaultValue={cells} onValueChange={change} />);
    const summary = screen.getByLabelText("Edit R1 in Pilot");
    await user.tab();
    expect(document.activeElement).toBe(summary);
    expect(summary.tagName).toBe("SUMMARY");
    // jsdom implements summary click toggling, not native summary key activation.
    await user.click(summary);
    await user.tab();
    const populated = screen.getByRole("combobox", { name: "Populated, R1 in Pilot" });
    expect(document.activeElement).toBe(populated);
    await user.keyboard("{Enter}{Home}{ArrowDown}{Enter}");
    expect(change).toHaveBeenLastCalledWith([{ ...cells[0], populated: true }]);
    expect(screen.getByRole("combobox", { name: "In placement file, R1 in Pilot" }).textContent).toContain("No");
    expect(screen.getByRole("combobox", { name: "In bill of materials, R1 in Pilot" }).textContent).toContain("Yes");
  });

  it("creates a missing cell without inventing flags and preserves controlled host data", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(<AssemblyVariantMatrix label="Assembly" references={references} variants={variants} value={[]} onValueChange={change} />);
    await user.click(screen.getByLabelText("Edit R1 in Production"));
    screen.getByRole("combobox", { name: "Populated, R1 in Production" }).focus();
    await user.keyboard("{Enter}{End}{Enter}");
    expect(change).toHaveBeenLastCalledWith([{ referenceId: "r1", variantId: "production", populated: false, includeInBom: null, includeInPlacement: null }]);
    expect(screen.getByRole("combobox", { name: "Populated, R1 in Production" }).textContent).toContain("Unspecified");
  });

  it("submits independent flags, restores defaults on reset and retains read-only false values", async () => {
    const user = userEvent.setup();
    const ref = React.createRef<HTMLFieldSetElement>();
    const { container, rerender } = render(<form><AssemblyVariantMatrix ref={ref} label="Assembly" references={references} variants={variants} defaultValue={cells} name="assembly" /></form>);
    const form = container.querySelector("form")!;
    expect(new FormData(form).get("assembly.r1.pilot.populated")).toBe("no");
    expect(new FormData(form).get("assembly.r1.pilot.includeInBom")).toBe("yes");
    await user.click(screen.getByLabelText("Edit R1 in Pilot"));
    screen.getByRole("combobox", { name: "Populated, R1 in Pilot" }).focus();
    await user.keyboard("{Enter}{Home}{ArrowDown}{Enter}");
    act(() => form.reset());
    await waitFor(() => expect(new FormData(form).get("assembly.r1.pilot.populated")).toBe("no"));
    expect(ref.current?.tagName).toBe("FIELDSET");
    rerender(<form><AssemblyVariantMatrix label="Assembly" references={references} variants={variants} value={cells} name="assembly" readOnly /></form>);
    expect(new FormData(container.querySelector("form")!).get("assembly.r1.pilot.populated")).toBe("no");
    rerender(<form><AssemblyVariantMatrix label="Assembly" references={references} variants={variants} value={cells} name="assembly" readOnly disabled /></form>);
    expect(new FormData(container.querySelector("form")!).has("assembly.r1.pilot.populated")).toBe(false);
  });

  it("exposes duplicates, unavailable references and empty matrices without merging policy", () => {
    const { rerender } = render(<AssemblyVariantMatrix label="Assembly" references={references} variants={variants} value={[...cells, ...cells, { referenceId: "missing", variantId: "pilot", populated: null, includeInBom: false, includeInPlacement: null }]} />);
    expect(screen.getByText("Conflicting records for R1 in Pilot")).toBeTruthy();
    expect(screen.getByText("missing in pilot")).toBeTruthy();
    expect(screen.queryByLabelText("Edit R1 in Pilot")).toBeNull();
    rerender(<AssemblyVariantMatrix label="Assembly" references={[]} variants={[]} />);
    expect(screen.getByText("Supply references and variants to edit assembly choices.")).toBeTruthy();
  });
});

describe("workbench accessibility", () => {
  const examples = [
    <Patchbay key="patchbay" label="Routing" sources={sources} destinations={destinations} defaultValue={routes} />,
    <KerningPairEditor key="kerning" label="Pair spacing" pairs={pairs} fontFamily="Georgia" unitsPerEm={1000} baselineOffsets={{ av: 0 }} defaultValue={{ av: -60 }} />,
    <AssemblyVariantMatrix key="assembly" label="Assembly" references={references} variants={variants} defaultValue={cells} />,
  ];
  for (const example of examples) it(`${example.key} exposes named controls and state descriptions`, async () => {
    const { container } = render(<main>{example}</main>);
    expect(await axe(container, { rules: { "color-contrast": { enabled: false } } })).toHaveNoViolations();
  });
  it("exposes named independent flags inside an expanded assembly cell", async () => {
    const user = userEvent.setup();
    const { container } = render(<main><AssemblyVariantMatrix label="Assembly" references={references} variants={variants} defaultValue={cells} /></main>);
    await user.click(screen.getByLabelText("Edit R1 in Pilot"));
    expect(await axe(container, { rules: { "color-contrast": { enabled: false } } })).toHaveNoViolations();
  });
});
