import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { FileBrowser, type BrowserEntry } from "../src/components/file-browser";
import { TreeView } from "../src/components/tree-view";

afterEach(cleanup);
const folderName = "Images and publication references";
const fileName = "A long publication file name with its original extension.webp";
const entries: BrowserEntry[] = [{ id: "images", name: folderName, kind: "folder", children: [{ id: "sheet", name: fileName, kind: "file" }] }];

describe("File browser and tree craft", () => {
  it("keeps a short visible root while retaining distinct landmark names", () => {
    render(<><FileBrowser label="Files preview" entries={entries} /><FileBrowser label="Studio files" entries={entries} /></>);
    for (const label of ["Files preview", "Studio files"]) {
      const browser = screen.getByRole("region", { name: label });
      const tree = within(browser).getByRole("tree", { name: `${label} folder tree` });
      expect(within(tree).getByRole("treeitem", { name: "Files" })).toBeTruthy();
      expect(within(browser).getByRole("navigation", { name: `${label} breadcrumbs` })).toBeTruthy();
      expect(within(browser).getByRole("complementary", { name: `${label} folders` })).toBeTruthy();
    }
  });

  it("uses compact breadcrumb actions and preserves current-folder navigation", async () => {
    const user = userEvent.setup();
    render(<FileBrowser label="Asset browser" rootLabel="Library" entries={entries} defaultFolder="images" />);
    const path = screen.getByRole("navigation", { name: "Asset browser breadcrumbs" });
    const current = within(path).getByRole("button", { name: folderName });
    expect(current.getAttribute("aria-current")).toBe("location");
    expect(current.classList.contains("rs-file-browser-crumb")).toBe(true);
    expect(current.className).not.toContain("rs-btn");
    expect(current.querySelector("svg")).toBeNull();
    expect(current.querySelector("[title]")?.getAttribute("title")).toBe(folderName);
    await user.click(within(path).getByRole("button", { name: "Library" }));
    expect(within(path).queryByRole("button", { name: folderName })).toBeNull();
    expect(within(path).getByRole("button", { name: "Library" }).getAttribute("aria-current")).toBe("location");
    expect(screen.getByRole("treeitem", { name: "Library" }).getAttribute("aria-selected")).toBe("true");
  });

  it("retains full folder names and keyboard selection in a single-line label span", async () => {
    const user = userEvent.setup();
    const selected = vi.fn();
    render(<TreeView label="Folder tree" nodes={[{ id: "root", label: "Files", children: [{ id: "images", label: folderName }] }]} defaultExpanded={["root"]} onValueChange={selected} />);
    const root = screen.getByRole("treeitem", { name: "Files" });
    root.focus();
    await user.keyboard("{ArrowRight}{Enter}");
    const folder = screen.getByRole("treeitem", { name: folderName });
    expect(document.activeElement).toBe(folder);
    expect(selected).toHaveBeenCalledWith("images");
    const label = folder.querySelector(".rs-tree-view-label")!;
    expect(label.textContent).toBe(folderName);
    expect(label.getAttribute("title")).toBe(folderName);
    expect(getComputedStyle(label).whiteSpace).toBe("nowrap");
    expect(getComputedStyle(label).textOverflow).toBe("ellipsis");
    await user.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(screen.queryByRole("treeitem", { name: folderName })).toBeNull();
  });

  it("preserves the full accessible file name while truncating its visible text", () => {
    render(<FileBrowser entries={entries} defaultFolder="images" />);
    const file = screen.getByRole("button", { name: `${fileName} File` });
    const label = file.querySelector(".rs-file-browser-name")!;
    expect(label.getAttribute("title")).toBe(fileName);
    expect(getComputedStyle(label).whiteSpace).toBe("nowrap");
    expect(getComputedStyle(label).textOverflow).toBe("ellipsis");
  });

  it("owns compact action sizing without inheriting the full-width mobile Button variant", async () => {
    const user = userEvent.setup();
    const open = vi.fn();
    render(<FileBrowser entries={entries} defaultFolder="images" onOpen={open} />);
    const toolbar = screen.getByRole("group", { name: "File view" });
    for (const action of within(toolbar).getAllByRole("button")) {
      expect(action.classList.contains("rs-file-browser-action")).toBe(true);
      expect(action.className).not.toContain("rs-btn");
      expect(action.getAttribute("type")).toBe("button");
      expect(getComputedStyle(action).width).toBe("auto");
    }
    const openButton = within(toolbar).getByRole("button", { name: "Open selected" }) as HTMLButtonElement;
    expect(openButton.disabled).toBe(true);
    await user.click(openButton);
    expect(open).not.toHaveBeenCalled();
    const grid = within(toolbar).getByRole("button", { name: "Grid" });
    grid.focus();
    await user.keyboard(" ");
    expect(grid.getAttribute("aria-pressed")).toBe("true");
    expect(document.activeElement).toBe(grid);
    await user.click(screen.getByRole("button", { name: `${fileName} File` }));
    expect(openButton.disabled).toBe(false);
    openButton.focus();
    await user.keyboard("{Enter}");
    expect(open).toHaveBeenCalledWith(entries[0]!.children![0]);
  });

  it("keeps the composed browser accessible with a custom visible root name", async () => {
    const { container } = render(<FileBrowser label="Asset browser" rootLabel="Library" entries={entries} defaultFolder="images" />);
    const result = await axe(container, { rules: { "color-contrast": { enabled: false } } });
    expect(result.violations).toEqual([]);
  });
});
