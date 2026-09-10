import * as React from "react";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { IOSNavigationBar } from "../src/components/ios-navigation-bar";
import { IOSTabBar } from "../src/components/ios-tab-bar";
import { IOSSearchField } from "../src/components/ios-search-field";
import { IOSSwitch } from "../src/components/ios-switch";
import { IOSList, IOSListRow } from "../src/components/ios-list";
import { IOSSegmentedControl } from "../src/components/ios-segmented-control";
import { IOSSlider } from "../src/components/ios-slider";
import { IOSSheet } from "../src/components/ios-sheet";

afterEach(cleanup);
const showModal = HTMLDialogElement.prototype.showModal;
const close = HTMLDialogElement.prototype.close;
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  HTMLDialogElement.prototype.close = function () { this.open = false; this.dispatchEvent(new Event("close")); };
});
afterAll(() => { HTMLDialogElement.prototype.showModal = showModal; HTMLDialogElement.prototype.close = close; });

const tabs = [{ id: "library", label: "Library" }, { id: "radio", label: "Radio", disabled: true }, { id: "search", label: "Search" }];

describe("iOS primitives", () => {
  it("names all eight controls and exposes no axe violations", async () => {
    const { container } = render(<main>
      <IOSNavigationBar title="Albums" onBack={() => {}} actions={[{ id: "sort", label: "Sort" }]} />
      <IOSTabBar items={tabs} />
      <IOSSearchField aria-label="Search albums" />
      <IOSList title="Playback" footer="Changes apply to this device"><IOSListRow label={<label htmlFor="shuffle">Shuffle</label>} trailing={<IOSSwitch id="shuffle" />} /><IOSListRow label="Sound" disclosure onClick={() => {}} /></IOSList>
      <IOSSegmentedControl label="Order" items={[{ id: "recent", label: "Recent" }, { id: "name", label: "Name" }]} />
      <IOSSlider aria-label="Volume" />
      <IOSSheet title="Details"><p>Album details</p></IOSSheet>
    </main>);
    expect(await axe(container, { rules: { "color-contrast": { enabled: false } } })).toHaveNoViolations();
    const sheet = render(<IOSSheet defaultOpen title="Track details" description="Manage the selected track"><button type="button">Keep track</button></IOSSheet>);
    expect(await axe(sheet.container, { rules: { "color-contrast": { enabled: false } } })).toHaveNoViolations();
  });

  it("keeps navigation actions keyboard operable and disabled actions inert", async () => {
    const user = userEvent.setup(); const back = vi.fn(); const sort = vi.fn();
    render(<IOSNavigationBar title="Albums" orientation="vertical" onBack={back} actions={[{ id: "disabled", label: "Unavailable", disabled: true, onClick: sort }, { id: "sort", label: "Sort", onClick: sort }]} />);
    await user.tab(); expect(document.activeElement).toBe(screen.getByRole("button", { name: "Back" }));
    await user.keyboard("{Enter}"); expect(back).toHaveBeenCalledOnce();
    await user.tab(); expect(document.activeElement).toBe(screen.getByRole("button", { name: "Sort" }));
    await user.keyboard(" "); expect(sort).toHaveBeenCalledOnce();
  });

  it("roves tabs, skips disabled destinations, wraps and respects canceled keys", async () => {
    const user = userEvent.setup(); const change = vi.fn();
    const { rerender } = render(<IOSTabBar items={tabs} onValueChange={change} />);
    await user.tab(); await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(screen.getByRole("tab", { name: "Search" }));
    expect(screen.getByRole("tab", { name: "Search" }).getAttribute("aria-selected")).toBe("true");
    await user.keyboard("{ArrowRight}"); expect(document.activeElement).toBe(screen.getByRole("tab", { name: "Library" }));
    rerender(<IOSTabBar items={tabs} orientation="vertical" onKeyDown={event => event.preventDefault()} onValueChange={change} />);
    await user.keyboard("{ArrowDown}"); expect(document.activeElement).toBe(screen.getByRole("tab", { name: "Library" }));
    expect(change.mock.calls.map(call => call[0])).toEqual(["search", "library"]);
  });

  it("keeps navigation instances unique and preserves native external form submission", async () => {
    const user = userEvent.setup(); const submit = vi.fn(event => event.preventDefault());
    const { container } = render(<><form id="editor" onSubmit={submit}><input name="title" defaultValue="Note" /></form><IOSNavigationBar title="Note" actions={[{ id: "save", label: "Save", type: "submit", form: "editor" }]} /><IOSNavigationBar title="Other" actions={[{ id: "save", label: "Other save" }]} /></>);
    const ids = [...container.querySelectorAll("[id]")].map(node => node.id); expect(new Set(ids).size).toBe(ids.length);
    await user.click(screen.getByRole("button", { name: "Save" })); expect(submit).toHaveBeenCalledOnce();
  });

  it("gives repeated tab instances unique DOM IDs and supports explicit panel wiring", () => {
    const { container } = render(<><IOSTabBar items={tabs} /><IOSTabBar items={tabs} /><IOSTabBar items={[{ id: "details", label: "Details", buttonId: "details-tab", panelId: "details-panel" }]} /><div id="details-panel" role="tabpanel" aria-labelledby="details-tab">Details</div></>);
    const ids = [...container.querySelectorAll("[id]")].map(node => node.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(screen.getByRole("tab", { name: "Details" }).getAttribute("aria-controls")).toBe("details-panel");
  });

  it("keeps controlled selection with its owner and uses RTL arrow direction", async () => {
    const user = userEvent.setup(); const change = vi.fn();
    render(<IOSTabBar style={{ direction: "rtl" }} value="library" items={tabs} onValueChange={change} />);
    await user.tab(); await user.keyboard("{ArrowLeft}");
    expect(change).toHaveBeenCalledWith("search");
    expect(screen.getByRole("tab", { name: "Library" }).getAttribute("aria-selected")).toBe("true");
  });

  it("clears search through the keyboard and returns focus to the native input", async () => {
    const user = userEvent.setup(); const ref = React.createRef<HTMLInputElement>(); const change = vi.fn();
    render(<IOSSearchField ref={ref} defaultValue="Braun" aria-label="Search" onValueChange={change} />);
    await user.tab(); expect(document.activeElement).toBe(ref.current);
    await user.tab(); await user.keyboard("{Enter}");
    expect(ref.current?.value).toBe(""); expect(document.activeElement).toBe(ref.current); expect(change).toHaveBeenLastCalledWith("");
    expect(screen.queryByRole("button", { name: "Clear search" })).toBeNull();
  });

  it("retains search form submission and read-only behavior", async () => {
    const user = userEvent.setup(); const submit = vi.fn(event => event.preventDefault());
    render(<form onSubmit={submit}><IOSSearchField name="q" value="Paper" readOnly aria-label="Search" /><button type="submit">Find</button></form>);
    expect(screen.queryByRole("button", { name: "Clear search" })).toBeNull();
    await user.tab(); await user.keyboard("{Enter}"); expect(submit).toHaveBeenCalledOnce();
    expect(new FormData(screen.getByRole("searchbox").closest("form")!).get("q")).toBe("Paper");
  });

  it("clears controlled search through a native onChange-only handler", async () => {
    const user = userEvent.setup(); const changes = vi.fn();
    function Search() {
      const [query, setQuery] = React.useState("Braun");
      return <IOSSearchField aria-label="Search" value={query} onChange={event => { changes(event.target.value); setQuery(event.target.value); }} />;
    }
    render(<Search />);
    await user.click(screen.getByRole("button", { name: "Clear search" }));
    expect((screen.getByRole("searchbox") as HTMLInputElement).value).toBe("");
    expect(changes).toHaveBeenCalledExactlyOnceWith("");
    expect(document.activeElement).toBe(screen.getByRole("searchbox"));
    expect(screen.queryByRole("button", { name: "Clear search" })).toBeNull();
  });

  it("toggles a native switch with Space and contributes only checked values to a form", async () => {
    const user = userEvent.setup(); const ref = React.createRef<HTMLInputElement>(); const change = vi.fn();
    const { container } = render(<form><IOSSwitch ref={ref} name="wifi" value="enabled" aria-label="Wi-Fi" onCheckedChange={change} /></form>);
    await user.tab(); expect(document.activeElement).toBe(ref.current); expect(ref.current?.type).toBe("checkbox");
    await user.keyboard(" "); expect(new FormData(container.querySelector("form")!).get("wifi")).toBe("enabled"); expect(change).toHaveBeenCalledWith(true);
    await user.keyboard(" "); expect(new FormData(container.querySelector("form")!).has("wifi")).toBe(false);
  });

  it("keeps controls in static list rows separate from navigation buttons", async () => {
    const user = userEvent.setup(); const details = vi.fn();
    const { container } = render(<IOSList title="Connections"><IOSListRow label={<label htmlFor="wifi">Wi-Fi</label>} trailing={<IOSSwitch id="wifi" />} /><IOSListRow label="Details" onClick={details} disclosure /><IOSListRow label="Unavailable" disabled onClick={details} /></IOSList>);
    expect(container.querySelector("button button,button input")).toBeNull();
    await user.tab(); await user.keyboard(" "); expect((screen.getByRole("switch") as HTMLInputElement).checked).toBe(true);
    await user.tab(); await user.keyboard("{Enter}"); expect(details).toHaveBeenCalledOnce();
  });

  it("uses radio semantics, single-tab focus and form values for segments", async () => {
    const user = userEvent.setup();
    const { container } = render(<form><IOSSegmentedControl name="view" label="Calendar view" items={[{ id: "day", label: "Day" }, { id: "week", label: "Week", disabled: true }, { id: "month", label: "Month" }]} /></form>);
    await user.tab(); await user.keyboard("{ArrowRight}"); expect(document.activeElement).toBe(screen.getByRole("radio", { name: "Month" }));
    expect(new FormData(container.querySelector("form")!).get("view")).toBe("month");
    await user.keyboard("{Home}"); expect(screen.getByRole("radio", { name: "Day" }).getAttribute("aria-checked")).toBe("true");
  });

  it("forwards native range focus and bounds while keeping off-step paint synchronized", async () => {
    const user = userEvent.setup(); const ref = React.createRef<HTMLInputElement>();
    const { container, rerender } = render(<IOSSlider ref={ref} aria-label="Volume" min={0} max={10} step={3} value={10} />);
    await user.tab(); expect(document.activeElement).toBe(ref.current); expect(ref.current?.type).toBe("range");
    expect(ref.current?.value).toBe("9"); expect((container.querySelector(".rs-ios-slider-fill") as HTMLElement).style.width).toBe("90%");
    rerender(<IOSSlider ref={ref} aria-label="Volume" min={0} max={1} step={0.3} value={0.8} />);
    expect(ref.current?.value).toBe("0.9"); expect((container.querySelector(".rs-ios-slider-fill") as HTMLElement).style.width).toBe("90%");
    // jsdom has no range keyboard default action; a real browser owns that behavior.
    rerender(<IOSSlider key="uncontrolled" ref={ref} aria-label="Volume" min={0} max={10} step={3} defaultValue={10} />);
    expect(ref.current?.value).toBe("9");
    fireEvent.change(ref.current!, { target: { value: "3" } });
    expect((container.querySelector(".rs-ios-slider-fill") as HTMLElement).style.width).toBe("30%");
  });

  it("resets uncontrolled form fields, while honoring a canceled reset", async () => {
    const user = userEvent.setup();
    function Form({ cancel }: { cancel: boolean }) { return <form onReset={event => { if (cancel) event.preventDefault(); }}><IOSSearchField name="q" aria-label="Search" defaultValue="Original" /><IOSSwitch name="wifi" aria-label="Wi-Fi" defaultChecked /><IOSSlider name="volume" aria-label="Volume" defaultValue={30} /><IOSSegmentedControl name="view" items={[{ id: "day", label: "Day" }, { id: "month", label: "Month" }]} /><button type="reset">Reset</button></form>; }
    const { rerender } = render(<Form cancel />);
    await user.clear(screen.getByRole("searchbox")); await user.type(screen.getByRole("searchbox"), "Edited");
    await user.click(screen.getByRole("switch")); fireEvent.change(screen.getByRole("slider"), { target: { value: "70" } }); await user.click(screen.getByRole("radio", { name: "Month" }));
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect((screen.getByRole("searchbox") as HTMLInputElement).value).toBe("Edited"); expect((screen.getByRole("switch") as HTMLInputElement).checked).toBe(false); expect((screen.getByRole("slider") as HTMLInputElement).value).toBe("70"); expect(screen.getByRole("radio", { name: "Month" }).getAttribute("aria-checked")).toBe("true");
    rerender(<Form cancel={false} />); await user.click(screen.getByRole("button", { name: "Reset" }));
    expect((screen.getByRole("searchbox") as HTMLInputElement).value).toBe("Original"); expect((screen.getByRole("switch") as HTMLInputElement).checked).toBe(true); expect((screen.getByRole("slider") as HTMLInputElement).value).toBe("30"); expect(screen.getByRole("radio", { name: "Day" }).getAttribute("aria-checked")).toBe("true");
  });

  it("keeps disabled inputs out of sequential focus and blocks mutation", async () => {
    const user = userEvent.setup(); const change = vi.fn();
    render(<><IOSSearchField disabled aria-label="Search" /><IOSSwitch disabled aria-label="Wi-Fi" onCheckedChange={change} /><IOSSlider disabled aria-label="Volume" onValueChange={change} /><IOSSegmentedControl disabled items={[{ id: "day", label: "Day" }]} onValueChange={change} /><button type="button">Continue</button></>);
    await user.tab(); expect(document.activeElement).toBe(screen.getByRole("button", { name: "Continue" }));
    await user.click(screen.getByRole("switch")); expect(change).not.toHaveBeenCalled();
  });

  it("opens the native modal, handles Escape requests and restores its trigger", async () => {
    const user = userEvent.setup(); const ref = React.createRef<HTMLDialogElement>();
    function Example() { const [open, setOpen] = React.useState(false); return <><button type="button" onClick={() => setOpen(true)}>Open sheet</button><IOSSheet ref={ref} title="Edit note" open={open} onOpenChange={setOpen}><input aria-label="Title" defaultValue="Draft" /></IOSSheet></>; }
    render(<Example />); const trigger = screen.getByRole("button", { name: "Open sheet" }); await user.click(trigger);
    expect(ref.current?.open).toBe(true); expect(ref.current?.contains(document.activeElement)).toBe(true);
    fireEvent(ref.current!, new Event("cancel", { cancelable: true })); expect(ref.current?.open).toBe(false); expect(document.activeElement).toBe(trigger);
    await user.click(trigger); expect((within(ref.current!).getByRole("textbox") as HTMLInputElement).value).toBe("Draft");
    await user.click(within(ref.current!).getByRole("button", { name: "Close sheet" })); expect(document.activeElement).toBe(trigger);
  });

  it("honors canceled sheet Escape, native close, and cleans focus on unmount", async () => {
    const user = userEvent.setup(); const ref = React.createRef<HTMLDialogElement>(); const changed = vi.fn();
    const trigger = document.createElement("button"); trigger.textContent = "Origin"; document.body.append(trigger); trigger.focus();
    const { rerender, unmount } = render(<IOSSheet ref={ref} defaultOpen title="Required choice" onOpenChange={changed} onCancel={event => event.preventDefault()}><button type="button">Save</button></IOSSheet>);
    fireEvent(ref.current!, new Event("cancel", { cancelable: true })); expect(ref.current?.open).toBe(true); expect(changed).not.toHaveBeenCalled();
    rerender(<IOSSheet ref={ref} defaultOpen title="Required choice" onOpenChange={changed}><button type="button">Save</button></IOSSheet>);
    await user.click(screen.getByRole("button", { name: "Save" }));
    act(() => ref.current?.close()); expect(changed).toHaveBeenCalledWith(false);
    unmount(); expect(ref.current).toBeNull(); expect(document.activeElement).toBe(trigger); trigger.remove();
  });

  it("keeps nondismissable sheets open and handles StrictMode native close", () => {
    const ref = React.createRef<HTMLDialogElement>(); const changed = vi.fn();
    const { rerender } = render(<React.StrictMode><IOSSheet ref={ref} defaultOpen title="Required choice" dismissable={false} onOpenChange={changed}><button type="button">Save</button></IOSSheet></React.StrictMode>);
    expect(ref.current?.open).toBe(true); expect(screen.queryByRole("button", { name: "Close sheet" })).toBeNull();
    fireEvent(ref.current!, new Event("cancel", { cancelable: true })); expect(changed).not.toHaveBeenCalled();
    rerender(<React.StrictMode><IOSSheet ref={ref} defaultOpen title="Required choice" onOpenChange={changed}><button type="button">Save</button></IOSSheet></React.StrictMode>);
    act(() => ref.current?.close()); expect(changed).toHaveBeenCalledOnce(); expect(ref.current?.open).toBe(false);
  });
});
