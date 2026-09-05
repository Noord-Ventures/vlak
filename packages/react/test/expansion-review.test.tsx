import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { QueryBuilder, type QueryGroup } from "../src/components/query-builder";
import { VirtualList } from "../src/components/virtual-list";
import { SortableList } from "../src/components/sortable-list";
import { PropertyGrid } from "../src/components/property-grid";
import { OverflowList } from "../src/components/overflow-list";
import { JSONViewer } from "../src/components/json-viewer";
import { NotificationCenter } from "../src/components/notification-center";
import { TagInput } from "../src/components/tag-input";
import { FileUpload, type FileUploadContext } from "../src/components/file-upload";
import { InlineEdit } from "../src/components/inline-edit";

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe("independent expansion review", () => {
  it("changes QueryBuilder operator choices when moving from text to numeric fields", async () => {
    const user = userEvent.setup();
    const fields = [{ id: "name", label: "Name", type: "text" as const }, { id: "range", label: "Range", type: "number" as const }];
    render(<QueryBuilder fields={fields} defaultValue={{ id: "root", combinator: "and", rules: [{ id: "r", field: "name", operator: "contains", value: "Drive" }] }} />);
    expect(screen.queryByRole("option", { name: "is greater than" })).toBeNull();
    await user.selectOptions(screen.getByRole("combobox", { name: "Field 1" }), "range");
    expect((screen.getByRole("combobox", { name: "Operator 1" }) as HTMLSelectElement).value).toBe("is");
    expect((screen.getByRole("spinbutton", { name: "Value 1" }) as HTMLInputElement).value).toBe("");
    expect(screen.queryByRole("option", { name: "contains" })).toBeNull();
    expect(screen.getByRole("option", { name: "is greater than" })).toBeTruthy();
  });
  it("does not mutate a controlled nested query and respects depth limits", () => {
    const query: QueryGroup = { id: "root", combinator: "and", rules: [{ id: "nested", combinator: "or", rules: [{ id: "r", field: "name", operator: "is", value: "Drive" }] }] };
    const change = vi.fn();
    render(<QueryBuilder fields={[{ id: "name", label: "Name" }]} value={query} maxDepth={1} onValueChange={change} />);
    expect(screen.queryByRole("button", { name: "Add group" })).toBeNull();
    fireEvent.change(screen.getByRole("textbox", { name: "Value 1" }), { target: { value: "Orbit" } });
    expect(change).toHaveBeenCalledOnce();
    expect((query.rules[0] as QueryGroup).rules[0]).toEqual({ id: "r", field: "name", operator: "is", value: "Drive" });
    expect((screen.getByRole("textbox", { name: "Value 1" }) as HTMLInputElement).value).toBe("Drive");
  });
  it("preserves virtual-row focus at the nearest surviving position after deletion", async () => {
    const user = userEvent.setup();
    const items = [{ id: "a", label: "Alpha" }, { id: "b", label: "Beta" }, { id: "c", label: "Gamma" }];
    const { rerender } = render(<VirtualList items={items} label="Records" />);
    await user.click(screen.getByText("Beta"));
    expect(document.activeElement?.textContent).toBe("Beta");
    rerender(<VirtualList items={[items[0]!, items[2]!]} label="Records" />);
    expect(document.activeElement?.textContent).toBe("Gamma");
    rerender(<VirtualList items={[]} label="Records" />);
    expect(document.activeElement).toBe(screen.getByRole("list", { name: "Records" }));
  });
  it("keeps focused descendants mounted while scrolling and leaves their arrow keys alone", async () => {
    const user = userEvent.setup();
    const items = Array.from({ length: 500 }, (_, index) => ({ id: String(index), label: `Item ${index}`, content: index === 0 ? <input aria-label="Row editor" defaultValue="Draft" /> : undefined }));
    render(<VirtualList items={items} label="Records" height={176} overscan={Number.NaN} />);
    const input = screen.getByRole("textbox", { name: "Row editor" });
    await user.click(input);
    fireEvent.scroll(screen.getByRole("list"), { target: { scrollTop: 5000 } });
    expect(screen.getByRole("textbox", { name: "Row editor" })).toBe(input);
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(input);
    expect(screen.getAllByRole("listitem").length).toBeLessThan(20);
  });
  it("announces a controlled reorder only after the caller commits it", async () => {
    const user = userEvent.setup();
    const items = [{ id: "a", label: "Alpha" }, { id: "b", label: "Beta" }];
    const change = vi.fn();
    const { rerender } = render(<SortableList value={items} onValueChange={change} />);
    await user.click(screen.getByRole("button", { name: "Move Alpha down" }));
    expect(screen.getByRole("status").textContent).toBe("");
    expect(screen.getAllByRole("listitem")[0]?.textContent).toContain("Alpha");
    rerender(<SortableList value={[items[1]!, items[0]!]} onValueChange={change} />);
    expect(screen.getByRole("status").textContent).toContain("Alpha, position 2 of 2");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Move Alpha" }));
  });
  it("submits all PropertyGrid field types and resets their uncontrolled values", async () => {
    const user = userEvent.setup();
    const { container } = render(<form><PropertyGrid fields={[{ id: "mode", label: "Mode", type: "select", options: [{ value: "quiet", label: "Quiet" }, { value: "normal", label: "Normal" }] }, { id: "enabled", label: "Enabled", type: "switch" }, { id: "range", label: "Range", type: "number", unit: "km", description: "Estimated distance" }]} defaultValue={{ mode: "quiet", enabled: false, range: 386 }} /></form>);
    await user.selectOptions(screen.getByRole("combobox", { name: "Mode" }), "normal");
    await user.click(screen.getByRole("switch", { name: "Enabled" }));
    const form = container.querySelector("form")!;
    expect(new FormData(form).get("mode")).toBe("normal");
    expect(new FormData(form).get("enabled")).toBe("true");
    const range = screen.getByRole("spinbutton", { name: "Range" });
    const descriptions = range.getAttribute("aria-describedby")?.split(" ").map(id => document.getElementById(id)?.textContent);
    expect(descriptions).toEqual(["Estimated distance", "km"]);
    fireEvent.reset(form);
    await waitFor(() => expect(new FormData(form).get("enabled")).toBe("false"));
    expect(new FormData(form).get("mode")).toBe("quiet");
  });
  it("does not steal focus from a separate OverflowList during resize", async () => {
    const user = userEvent.setup();
    const observers: Array<() => void> = [];
    let width = 180;
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(() => width);
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(() => ({ width: 80, height: 44, x: 0, y: 0, top: 0, bottom: 44, left: 0, right: 80, toJSON: () => ({}) }));
    vi.stubGlobal("ResizeObserver", class { constructor(callback: () => void) { observers.push(callback); } observe() {} unobserve() {} disconnect() {} });
    const items = [{ id: "one", label: "One", onAction: () => {} }, { id: "two", label: "Two", onAction: () => {} }];
    render(<><OverflowList items={items} label="First" /><OverflowList items={items} label="Second" /></>);
    const second = within(screen.getByRole("group", { name: "Second" })).getByRole("button", { name: "One" });
    await user.click(second);
    width = 100;
    act(() => observers[0]?.());
    expect(document.activeElement).toBe(second);
  });
  it("caps large JSON arrays before reading values outside the visible budget", () => {
    const entries = Array(10000).fill(1);
    const read = vi.fn(() => { throw new Error("Should not read an omitted value"); });
    Object.defineProperty(entries, "10", { get: read });
    render(<JSONViewer data={entries} maxEntries={3} maxNodes={4} maxDepth={Number.NaN} />);
    expect(read).not.toHaveBeenCalled();
    expect(screen.getByText("9997 additional entries not displayed")).toBeTruthy();
  });
  it("waits for controlled notification dismissal before announcing success or moving focus", async () => {
    const user = userEvent.setup();
    const notices = [{ id: "export", title: "Export ready" }];
    const change = vi.fn();
    const { rerender } = render(<NotificationCenter value={notices} onValueChange={change} />);
    const dismiss = screen.getByRole("button", { name: "Dismiss Export ready" });
    await user.click(dismiss);
    expect(screen.getByRole("status").textContent).toBe("");
    expect(document.activeElement).toBe(dismiss);
    rerender(<NotificationCenter value={[]} onValueChange={change} />);
    expect(screen.getByRole("status").textContent).toBe("Export ready dismissed");
    expect(document.activeElement).toBe(screen.getByRole("region"));
  });
  it("resets TagInput drafts as well as committed tags", async () => {
    const user = userEvent.setup();
    const { container } = render(<form><TagInput defaultValue={["Design"]} /></form>);
    await user.type(screen.getByRole("textbox"), "Research{Enter}unfinished");
    fireEvent.reset(container.querySelector("form")!);
    await waitFor(() => expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe(""));
    expect(screen.queryByRole("button", { name: "Remove Research" })).toBeNull();
  });
  it("aborts active upload transports when their form is reset", async () => {
    const user = userEvent.setup();
    let context: FileUploadContext | undefined;
    const { container } = render(<form><FileUpload onUpload={(_file, next) => { context = next; return new Promise(() => {}); }} /></form>);
    await user.upload(screen.getByLabelText("Choose files"), new File(["draft"], "draft.txt"));
    fireEvent.reset(container.querySelector("form")!);
    await waitFor(() => expect(context?.signal.aborted).toBe(true));
    expect(screen.queryByRole("button", { name: "Remove draft.txt" })).toBeNull();
  });
  it("ignores a late InlineEdit save result after native form reset", async () => {
    const user = userEvent.setup();
    let finish: (() => void) | undefined;
    const { container } = render(<form><InlineEdit label="Name" name="name" defaultValue="Original" onSave={() => new Promise<void>(resolve => { finish = resolve; })} /></form>);
    await user.click(screen.getByRole("button", { name: "Edit Name" }));
    await user.clear(screen.getByRole("textbox"));
    await user.type(screen.getByRole("textbox"), "Changed{Enter}");
    fireEvent.reset(container.querySelector("form")!);
    await waitFor(() => expect(screen.queryByRole("textbox")).toBeNull());
    await act(async () => finish?.());
    expect(new FormData(container.querySelector("form")!).get("name")).toBe("Original");
  });
});
