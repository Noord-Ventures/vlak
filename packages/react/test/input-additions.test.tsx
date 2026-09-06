import * as React from "react";
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { NumberField } from "../src/components/number-field";
import { RangeSlider } from "../src/components/range-slider";
import { MultiSelect } from "../src/components/multi-select";
import { TagInput } from "../src/components/tag-input";
import { DateRangePicker } from "../src/components/date-range-picker";
import { TimeField } from "../src/components/time-field";
import { FileUpload, type FileUploadContext } from "../src/components/file-upload";
import { TransferList } from "../src/components/transfer-list";
import { InlineEdit } from "../src/components/inline-edit";
import { Rating } from "../src/components/rating";
import { vlak } from "../src/tokens.stylex";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
const options = [{ value: "a", label: "Alkmaar" }, { value: "b", label: "Bergen" }, { value: "c", label: "Castricum", disabled: true }];

describe("NumberField", () => {
  it("steps decimals without drift, respects bounds, forwards the input ref and submits its value", async () => {
    const user = userEvent.setup();
    const ref = React.createRef<HTMLInputElement>();
    const { container } = render(<form><NumberField ref={ref} label="Temperature" name="temperature" defaultValue={20} min={20} max={20.2} step={0.1} unit="°C" /></form>);
    expect(ref.current).toBe(screen.getByRole("spinbutton"));
    expect(screen.getByRole("button", { name: "Decrease value" }).hasAttribute("disabled")).toBe(true);
    await user.click(screen.getByRole("button", { name: "Increase value" }));
    await user.click(screen.getByRole("button", { name: "Increase value" }));
    expect(ref.current?.value).toBe("20.2");
    expect(screen.getByRole("button", { name: "Increase value" }).hasAttribute("disabled")).toBe(true);
    expect(new FormData(container.querySelector("form")!).get("temperature")).toBe("20.2");
    fireEvent.reset(container.querySelector("form")!);
    await waitFor(() => expect(ref.current?.value).toBe("20"));
  });
  it("supports empty and controlled values without internal takeover", async () => {
    const change = vi.fn();
    render(<NumberField label="Quantity" value={2} onValueChange={change} />);
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "" } });
    expect(change).toHaveBeenLastCalledWith(null);
    expect((screen.getByRole("spinbutton") as HTMLInputElement).value).toBe("2");
  });
  it("places increase before decrease in stacked controls", () => {
    render(<NumberField label="Cabin temperature" controlsPlacement="stacked" defaultValue={20} />);
    expect(screen.getAllByRole("button").map((button) => button.getAttribute("aria-label"))).toEqual(["Increase value", "Decrease value"]);
  });
  it("snaps a typed off-step value and preserves controlled stepping", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<NumberField label="Temperature" defaultValue={20.2} min={16} step={0.5} />);
    await user.click(screen.getByRole("button", { name: "Increase value" }));
    expect((screen.getByRole("spinbutton") as HTMLInputElement).value).toBe("20.5");
    const change = vi.fn();
    rerender(<NumberField label="Temperature" value={20} min={16} step={0.5} onValueChange={change} />);
    await user.click(screen.getByRole("button", { name: "Increase value" }));
    expect(change).toHaveBeenLastCalledWith(20.5);
    expect((screen.getByRole("spinbutton") as HTMLInputElement).value).toBe("20");
  });
});

describe("RangeSlider", () => {
  it("keeps lower and upper values ordered and submits distinct endpoints", () => {
    const change = vi.fn();
    const { container } = render(<form><RangeSlider name="price" defaultValue={[20, 80]} onValueChange={change} /></form>);
    const lower = screen.getByRole("slider", { name: "From" });
    const upper = screen.getByRole("slider", { name: "To" });
    fireEvent.change(lower, { target: { value: "90" } });
    expect(change).toHaveBeenLastCalledWith([80, 80]);
    expect(upper.getAttribute("min")).toBe("80");
    expect(new FormData(container.querySelector("form")!).get("price[0]")).toBe("80");
    expect(new FormData(container.querySelector("form")!).get("price[1]")).toBe("80");
  });
  it("keeps a supplied range controlled", () => {
    const change = vi.fn();
    render(<RangeSlider value={[10, 90]} onValueChange={change} />);
    fireEvent.change(screen.getByRole("slider", { name: "From" }), { target: { value: "40" } });
    expect(change).toHaveBeenLastCalledWith([40, 90]);
    expect((screen.getByRole("slider", { name: "From" }) as HTMLInputElement).value).toBe("10");
  });
});

describe("MultiSelect", () => {
  it("filters named native checkboxes, preserves selection, closes with Escape and serializes values", async () => {
    const user = userEvent.setup();
    const { container } = render(<form><MultiSelect options={options} name="cities" label="Cities" /></form>);
    const summary = container.querySelector("summary")!;
    await user.click(summary);
    await user.click(screen.getByRole("checkbox", { name: "Alkmaar" }));
    await user.type(screen.getByRole("searchbox"), "Berg");
    expect(screen.queryByRole("checkbox", { name: "Alkmaar" })).toBeNull();
    await user.click(screen.getByRole("checkbox", { name: "Bergen" }));
    expect(new FormData(container.querySelector("form")!).getAll("cities")).toEqual(["a", "b"]);
    await user.keyboard("{Escape}");
    expect(container.querySelector("details")?.open).toBe(false);
    expect(document.activeElement).toBe(summary);
    expect(summary.textContent).toContain("Alkmaar, Bergen");
  });
  it("does not open or clear while disabled", async () => {
    const user = userEvent.setup();
    const { container } = render(<MultiSelect options={options} defaultValue={["a"]} disabled />);
    await user.click(container.querySelector("summary")!);
    expect(container.querySelector("details")?.open).toBe(false);
    expect(screen.getByRole("button", { name: "Clear selection" }).hasAttribute("disabled")).toBe(true);
  });
  it("keeps a selected value removable when its option disappears", async () => {
    const user = userEvent.setup();
    const { container } = render(<MultiSelect options={[]} defaultValue={["removed"]} />);
    expect(container.querySelector("summary")?.textContent).toContain("removed (unavailable)");
    await user.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(container.querySelector("summary")?.textContent).toContain("Select options");
  });
});

describe("TagInput", () => {
  it("insets the remove control inside the tag without shrinking its target", async () => {
    const submit = vi.fn((event: React.FormEvent) => event.preventDefault());
    render(<form onSubmit={submit}><TagInput defaultValue={["Research"]} /></form>);
    const remove = screen.getByRole("button", { name: "Remove Research" });
    const tag = getComputedStyle(remove.closest("li")!);
    const button = getComputedStyle(remove);
    expect(tag.paddingBlock).toMatch(/^0?\.25rem$/);
    expect(tag.paddingInlineEnd).toMatch(/^0?\.25rem$/);
    expect(tag.borderRadius).toBe(vlak.radiusSm);
    expect(button.minWidth).toBe(vlak.hit);
    expect(button.minHeight).toBe(vlak.hit);
    expect(button.width).toBe(vlak.hit);
    expect(button.height).toBe(vlak.hit);
    expect(button.padding).toBe("0px");
    expect(button.boxSizing).toBe("border-box");
    expect(button.borderRadius).toBe(vlak.radiusSm);
    expect(button.flexShrink).toBe("0");
    expect(remove.getAttribute("type")).toBe("button");
    expect(remove.className).not.toContain("rs-btn-");
    remove.focus();
    await userEvent.keyboard("{Enter}");
    expect(screen.queryByRole("button", { name: "Remove Research" })).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Tags" }));
    expect(submit).not.toHaveBeenCalled();
  });
  it("adds unique tags, parses pasted lists and offers keyboard removal", async () => {
    const user = userEvent.setup();
    const { container } = render(<form><TagInput name="tags" label="Tags" /></form>);
    const input = screen.getByRole("textbox", { name: "Tags" });
    await user.type(input, "design{Enter}design{Enter}");
    expect(screen.getAllByRole("button", { name: "Remove design" })).toHaveLength(1);
    fireEvent.paste(input, { clipboardData: { getData: () => "research,design\nengineering" } });
    expect(new FormData(container.querySelector("form")!).getAll("tags")).toEqual(["design", "research", "engineering"]);
    input.focus();
    await user.keyboard("{Backspace}");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Remove engineering" }));
    await user.keyboard("{Enter}");
    expect(screen.queryByRole("button", { name: "Remove engineering" })).toBeNull();
    expect(document.activeElement).toBe(input);
  });
  it("retains rejected drafts and reports the reason", async () => {
    const user = userEvent.setup();
    render(<TagInput defaultValue={["design"]} maxTags={1} />);
    await user.type(screen.getByRole("textbox"), "research{Enter}");
    expect(screen.getByRole("alert").textContent).toBe("Use at most 1 tag");
    expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe("research");
    expect(screen.queryByRole("button", { name: "Remove research" })).toBeNull();
  });
  it("keeps existing draft text when pasting a separated list at the cursor", async () => {
    const user = userEvent.setup();
    render(<TagInput />);
    const input = screen.getByRole("textbox");
    await user.type(input, "Res");
    fireEvent.paste(input, { clipboardData: { getData: () => "earch,Design" } });
    expect(screen.getByRole("button", { name: "Remove Research" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Remove Design" })).toBeTruthy();
  });
});

describe("DateRangePicker", () => {
  it("clears an end that precedes a new start, updates its constraint, and submits ISO dates", () => {
    const { container } = render(<form><DateRangePicker name="stay" defaultValue={{ start: "2026-09-06", end: "2026-09-08" }} required /></form>);
    const start = screen.getByLabelText("Start date");
    const end = screen.getByLabelText("End date") as HTMLInputElement;
    fireEvent.change(start, { target: { value: "2026-09-10" } });
    expect(end.value).toBe("");
    expect(end.min).toBe("2026-09-10");
    expect(end.checkValidity()).toBe(false);
    fireEvent.change(end, { target: { value: "2026-09-12" } });
    expect(new FormData(container.querySelector("form")!).get("stay[start]")).toBe("2026-09-10");
    expect(new FormData(container.querySelector("form")!).get("stay[end]")).toBe("2026-09-12");
  });
});

describe("TimeField", () => {
  it("uses native time editing with seconds, constraints, controlled events and form reset", async () => {
    const change = vi.fn();
    const { container } = render(<form><TimeField name="start" label="Start time" defaultValue="09:30:00" min="09:00" step={1} onValueChange={change} /></form>);
    const input = screen.getByLabelText("Start time") as HTMLInputElement;
    expect(input.type).toBe("time");
    fireEvent.change(input, { target: { value: "10:45:30" } });
    expect(change).toHaveBeenLastCalledWith("10:45:30");
    expect(new FormData(container.querySelector("form")!).get("start")).toBe("10:45:30");
    fireEvent.reset(container.querySelector("form")!);
    await waitFor(() => expect(input.value).toBe("09:30:00"));
  });
});

describe("FileUpload", () => {
  it("validates type, size and count for browse and drop, then serializes only accepted files", async () => {
    const user = userEvent.setup({ applyAccept: false });
    const reject = vi.fn();
    const { container } = render(<form><FileUpload name="files" accept=".txt" maxSize={8} maxFiles={1} onReject={reject} /></form>);
    const good = new File(["hello"], "notes.txt", { type: "text/plain" });
    const wrong = new File(["image"], "photo.png", { type: "image/png" });
    const large = new File(["too many bytes"], "large.txt", { type: "text/plain" });
    await user.upload(screen.getByLabelText("Choose files"), [good, wrong, large]);
    expect(screen.getByRole("button", { name: "Remove notes.txt" })).toBeTruthy();
    expect(reject.mock.calls[0]?.[0]).toHaveLength(2);
    const extra = new File(["more"], "extra.txt", { type: "text/plain" });
    fireEvent.drop(container.querySelector(".rs-file-upload-drop")!, { dataTransfer: { files: [extra] } });
    expect(screen.getByRole("alert").textContent).toContain("Choose at most 1 file");
    const data = new FormData();
    const event = new Event("formdata");
    Object.defineProperty(event, "formData", { value: data });
    container.querySelector("form")!.dispatchEvent(event);
    expect(data.getAll("files")).toHaveLength(1);
    expect((data.get("files") as File).name).toBe("notes.txt");
  });
  it("reports upload failures, retries and cancels the app transport", async () => {
    const user = userEvent.setup();
    let context: FileUploadContext | undefined;
    const upload = vi.fn().mockRejectedValueOnce(new Error("Network unavailable")).mockImplementationOnce((_file: File, next: FileUploadContext) => { context = next; return new Promise(() => {}); });
    render(<FileUpload onUpload={upload} />);
    await user.upload(screen.getByLabelText("Choose files"), new File(["hello"], "notes.txt", { type: "text/plain" }));
    await waitFor(() => expect(screen.getByText("Network unavailable")).toBeTruthy());
    await user.click(screen.getByRole("button", { name: "Retry upload of notes.txt" }));
    act(() => context?.onProgress(45));
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("45");
    await user.click(screen.getByRole("button", { name: "Cancel upload of notes.txt" }));
    expect(context?.signal.aborted).toBe(true);
    expect(screen.getByText("Cancelled")).toBeTruthy();
  });
});

describe("TransferList", () => {
  it("moves named selections in both directions, clears marked items, and keeps disabled options fixed", async () => {
    const user = userEvent.setup();
    const { container } = render(<form><TransferList name="cities" options={options} defaultValue={["c"]} /></form>);
    await user.click(screen.getByRole("checkbox", { name: "Alkmaar" }));
    await user.click(screen.getByRole("button", { name: "Add selected" }));
    const selected = screen.getByRole("group", { name: "Selected (2)" });
    expect(within(selected).getByRole("checkbox", { name: "Alkmaar" })).toBeTruthy();
    expect((within(selected).getByRole("checkbox", { name: "Castricum" }) as HTMLInputElement).disabled).toBe(true);
    expect(new FormData(container.querySelector("form")!).getAll("cities")).toEqual(["c", "a"]);
    await user.click(within(selected).getByRole("checkbox", { name: "Alkmaar" }));
    await user.click(screen.getByRole("button", { name: "Remove selected" }));
    expect(new FormData(container.querySelector("form")!).getAll("cities")).toEqual(["c"]);
  });
  it("keeps unavailable assigned values visible and removable", async () => {
    const user = userEvent.setup();
    render(<TransferList options={[]} defaultValue={["removed"]} />);
    await user.click(screen.getByRole("checkbox", { name: "removed (unavailable)" }));
    await user.click(screen.getByRole("button", { name: "Remove selected" }));
    expect(screen.getByRole("status").textContent).toBe("0 selected");
  });
});

describe("InlineEdit", () => {
  it("restores focus after cancel, preserves failed drafts, and commits only after async success", async () => {
    const user = userEvent.setup();
    const save = vi.fn().mockRejectedValueOnce(new Error("Try again")).mockResolvedValueOnce(undefined);
    const { container } = render(<form><InlineEdit label="Project name" name="project" defaultValue="Vlak" onSave={save} /></form>);
    const edit = screen.getByRole("button", { name: "Edit Project name" });
    await user.click(edit);
    await user.keyboard("Draft{Escape}");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Edit Project name" }));
    expect(new FormData(container.querySelector("form")!).get("project")).toBe("Vlak");
    await user.click(screen.getByRole("button", { name: "Edit Project name" }));
    await user.clear(screen.getByRole("textbox"));
    await user.type(screen.getByRole("textbox"), "New name{Enter}");
    await waitFor(() => expect(screen.getByRole("alert").textContent).toBe("Try again"));
    expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe("New name");
    await user.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(screen.queryByRole("textbox")).toBeNull());
    expect(new FormData(container.querySelector("form")!).get("project")).toBe("New name");
  });
});

describe("Rating", () => {
  it("uses native radio keyboard selection, submits the score and clears it", async () => {
    // jsdom lacks CSS.escape, which user-event uses to find native radio siblings.
    vi.stubGlobal("CSS", { escape: (text: string) => text.replace(/["\\]/g, "\\$&") });
    const user = userEvent.setup();
    const { container } = render(<form><Rating name="score" defaultValue={3} required /></form>);
    screen.getByRole("radio", { name: "3 of 5" }).focus();
    await user.keyboard("{ArrowRight}");
    expect((screen.getByRole("radio", { name: "4 of 5" }) as HTMLInputElement).checked).toBe(true);
    expect(new FormData(container.querySelector("form")!).get("score")).toBe("4");
    await user.click(screen.getByRole("button", { name: "Clear rating" }));
    expect(new FormData(container.querySelector("form")!).has("score")).toBe(false);
    expect(container.querySelector("form")!.checkValidity()).toBe(false);
  });
});

describe("input additions accessibility", () => {
  const examples = [
    <NumberField label="Quantity" defaultValue={2} key="number" />,
    <RangeSlider label="Budget" key="range" />,
    <MultiSelect label="Cities" options={options} key="multi" />,
    <TagInput label="Tags" defaultValue={["Design"]} key="tags" />,
    <DateRangePicker label="Stay" key="date" />,
    <TimeField label="Start time" key="time" />,
    <FileUpload label="Choose files" key="upload" />,
    <TransferList label="Cities" options={options} key="transfer" />,
    <InlineEdit label="Name" defaultValue="Vlak" key="edit" />,
    <Rating label="Usefulness" key="rating" />,
  ];
  for (const example of examples) it(`${example.key} has a named, accessible default state`, async () => {
    const { container } = render(<main>{example}</main>);
    // jsdom does not paint; contrast is verified against the shipped token colors in browser checks.
    expect(await axe(container, { rules: { "color-contrast": { enabled: false } } })).toHaveNoViolations();
  });
});
