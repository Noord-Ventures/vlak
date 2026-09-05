import * as React from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { TreeView } from "../src/components/tree-view";
import { Toolbar } from "../src/components/toolbar";
import { BottomNavigation } from "../src/components/bottom-navigation";
import { OverflowList } from "../src/components/overflow-list";
import { FilterBar } from "../src/components/filter-bar";
import { QueryBuilder, describeQuery } from "../src/components/query-builder";
import { SortableList } from "../src/components/sortable-list";
import { VirtualList } from "../src/components/virtual-list";
import { MasterDetail } from "../src/components/master-detail";
import { PropertyGrid } from "../src/components/property-grid";

afterEach(cleanup);
const nodes = [{ id: "work", label: "Work", children: [{ id: "drive", label: "Drive" }, { id: "orbit", label: "Orbit" }] }, { id: "archive", label: "Archive", disabled: true }];
const actions = [{ id: "copy", label: "Copy", onAction: vi.fn() }, { id: "paste", label: "Paste", disabled: true, onAction: vi.fn() }, { id: "undo", label: "Undo", onAction: vi.fn() }];
const sortItems = [{ id: "a", label: "Alpha" }, { id: "b", label: "Beta" }, { id: "c", label: "Gamma" }];
describe("navigation and workspace additions", () => {
  it("expands and selects tree nodes through the keyboard", async () => {
    const onChange = vi.fn();
    render(<TreeView label="Studies" nodes={nodes} onValueChange={onChange} />);
    screen.getByRole("treeitem", { name: /Work/ }).focus();
    await userEvent.keyboard("{ArrowRight}{ArrowRight}{Enter}");
    expect(document.activeElement?.textContent).toBe("Drive");
    expect(onChange).toHaveBeenCalledWith("drive");
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(screen.queryByRole("treeitem", { name: "Drive" })).toBeNull();
  });
  it("keeps one tree tab stop and blocks disabled selection", async () => {
    const onChange = vi.fn();
    render(<TreeView label="Studies" nodes={nodes} onValueChange={onChange} />);
    expect(screen.getAllByRole("treeitem").filter(element => element.tabIndex === 0)).toHaveLength(1);
    screen.getByRole("treeitem", { name: /Work/ }).focus();
    await userEvent.keyboard("{End}{Enter}");
    expect(onChange).not.toHaveBeenCalled();
  });
  it("moves toolbar focus past disabled actions and wraps", async () => {
    render(<Toolbar label="Editing" actions={actions} />);
    screen.getByRole("button", { name: "Copy" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Undo" }));
    await userEvent.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Copy" }));
    expect(screen.getAllByRole("button").filter(button => button.tabIndex === 0)).toHaveLength(1);
  });
  it("uses real links and current-page semantics for bottom navigation", () => {
    render(<BottomNavigation current="home" items={[{ id: "home", label: "Home", href: "/" }, { id: "inbox", label: "Inbox", href: "/inbox", count: 2 }]} />);
    expect(screen.getByRole("link", { name: "Home" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", { name: "Inbox (2)" }).getAttribute("href")).toBe("/inbox");
  });
  it("keeps overflow actions available in a keyboard menu", async () => {
    const select = vi.fn();
    render(<OverflowList items={[{ id: "one", label: "One", onAction: select }, { id: "two", label: "Two", onAction: select }]} maxVisible={1} />);
    await userEvent.click(screen.getByRole("button", { name: "More actions" }));
    const second = screen.getByRole("menuitem", { name: "Two" });
    second.focus(); await userEvent.keyboard("{Enter}");
    expect(select).toHaveBeenCalledOnce();
  });
  it("removes filters without losing focus and respects controlled data", async () => {
    const onChange = vi.fn();
    render(<FilterBar value={[{ id: "city", label: "Alkmaar" }]} onValueChange={onChange} resultCount={3} />);
    await userEvent.click(screen.getByRole("button", { name: "Remove Alkmaar filter" }));
    expect(onChange).toHaveBeenCalledWith([]);
    expect(screen.getByRole("button", { name: "Remove Alkmaar filter" })).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByRole("group"));
  });
  it("builds nested conditions with editable values and a readable summary", async () => {
    render(<QueryBuilder fields={[{ id: "city", label: "City" }]} />);
    await userEvent.click(screen.getByRole("button", { name: "Add condition" }));
    await userEvent.type(screen.getByRole("textbox", { name: "Value 1" }), "Alkmaar");
    expect(screen.getByLabelText("Query summary").textContent).toContain('City is "Alkmaar"');
    await userEvent.click(screen.getByRole("button", { name: "Add group" }));
    expect(screen.getByRole("group", { name: "Condition group 2" })).toBeTruthy();
    expect(describeQuery({ id: "root", combinator: "and", rules: [] }, [])).toBe("No conditions");
  });
  it("reorders with Alt and arrows, retains focus and announces position", async () => {
    render(<SortableList defaultValue={sortItems} />);
    const handle = screen.getByRole("button", { name: "Move Alpha" }); handle.focus();
    await userEvent.keyboard("{Alt>}{ArrowDown}{/Alt}");
    expect(screen.getAllByRole("listitem")[1]?.textContent).toContain("Alpha");
    expect(document.activeElement).toBe(handle);
    expect(screen.getByRole("status").textContent).toContain("position 2 of 3");
  });
  it("emits controlled reordering without changing caller-owned items", async () => {
    const change = vi.fn(); render(<SortableList value={sortItems} onValueChange={change} />);
    await userEvent.click(screen.getByRole("button", { name: "Move Alpha down" }));
    expect(change.mock.calls[0]?.[0].map((item: { id: string }) => item.id)).toEqual(["b", "a", "c"]);
    expect(screen.getAllByRole("listitem")[0]?.textContent).toContain("Alpha");
  });
  it("windows large lists and focuses the last row with End", async () => {
    const items = Array.from({ length: 1000 }, (_, index) => ({ id: String(index), label: `Item ${index}` }));
    render(<VirtualList items={items} label="Records" height={176} rowHeight={44} />);
    expect(screen.getAllByRole("listitem").length).toBeLessThan(20);
    screen.getAllByRole("listitem")[0]!.focus();
    await userEvent.keyboard("{End}");
    expect(document.activeElement?.textContent).toBe("Item 999");
    expect(document.activeElement?.getAttribute("aria-posinset")).toBe("1000");
    expect(screen.getAllByRole("listitem").length).toBeLessThan(20);
  });
  it("moves from master list to detail and back", async () => {
    render(<MasterDetail label="Studies" items={[{ id: "drive", label: "Drive", detail: <p>Vehicle systems</p> }]} />);
    await userEvent.click(screen.getByRole("button", { name: "Drive" }));
    expect(document.activeElement).toBe(screen.getByRole("heading", { name: "Drive" }));
    fireEvent.click(screen.getByText("Back to studies"));
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Drive" }));
  });
  it("edits different property field types through native controls", async () => {
    const change = vi.fn();
    render(<PropertyGrid fields={[{ id: "name", label: "Name" }, { id: "enabled", label: "Enabled", type: "switch" }]} defaultValue={{ name: "A", enabled: false }} onValueChange={change} />);
    await userEvent.type(screen.getByRole("textbox", { name: "Name" }), "B");
    await userEvent.click(screen.getByRole("switch", { name: "Enabled" }));
    expect(change).toHaveBeenLastCalledWith({ name: "AB", enabled: true });
  });
  const specimens = [
    <TreeView key="tree" label="Files" nodes={nodes} defaultExpanded={["work"]} />,
    <Toolbar key="toolbar" label="Editing" actions={actions} />,
    <BottomNavigation key="bottom" items={[{ id: "home", label: "Home", href: "/" }]} />,
    <OverflowList key="overflow" items={actions} maxVisible={1} />,
    <FilterBar key="filter" defaultValue={[{ id: "city", label: "City" }]} resultCount={2} />,
    <QueryBuilder key="query" fields={[{ id: "name", label: "Name" }]} />,
    <SortableList key="sortable" defaultValue={sortItems} />,
    <VirtualList key="virtual" label="Items" items={sortItems} />,
    <MasterDetail key="master" items={[{ id: "a", label: "A", detail: "Details" }]} />,
    <PropertyGrid key="properties" fields={[{ id: "name", label: "Name" }]} />,
  ];
  it.each(specimens.map((specimen, index) => [index, specimen] as const))("has no axe violations in workspace specimen %s", async (_, specimen) => {
    const { container } = render(specimen);
    expect((await axe(container, { rules: { "color-contrast": { enabled: false } } })).violations).toEqual([]);
  });
});
