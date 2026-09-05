import * as React from "react";
import { cleanup, render, screen, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { DropdownMenu, MenuPanel } from "../src/components/dropdown-menu";

afterEach(cleanup);
const selected = vi.fn();
const items = [{ label: "Export", items: [{ label: "PNG", onSelect: selected }, { label: "More", items: [{ label: "SVG", onSelect: selected }] }] }, { label: "Duplicate" }];

describe("nested menus", () => {
  it("focuses the active item after a measured overlay becomes visible", () => {
    const { rerender } = render(<MenuPanel id="measured" items={[{ label: "First" }]} onClose={() => {}} style={{ visibility: "hidden" }} />);
    expect(document.activeElement).not.toBe(screen.getByText("First"));
    rerender(<MenuPanel id="measured" items={[{ label: "First" }]} onClose={() => {}} style={{ visibility: "visible" }} />);
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "First" }));
  });
  it("opens with arrows and restores the immediate parent with Left or Escape", async () => {
    render(<DropdownMenu label="Actions" items={items} />);
    await userEvent.click(screen.getByRole("button", { name: "Actions" }));
    await userEvent.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "PNG" }));
    await userEvent.keyboard("{ArrowDown}{ArrowRight}");
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "SVG" }));
    await userEvent.keyboard("{Escape}");
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "More" }));
    await userEvent.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Export" }));
    expect(screen.queryByRole("menuitem", { name: "PNG" })).toBeNull();
    await userEvent.keyboard("{Escape}");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Actions" }));
  });
  it("chooses a nested action and closes the entire chain", async () => {
    selected.mockClear(); render(<DropdownMenu label="Actions" items={items} />);
    await userEvent.click(screen.getByRole("button", { name: "Actions" }));
    await userEvent.click(screen.getByRole("menuitem", { name: "Export" }));
    const child = screen.getByRole("menuitem", { name: "PNG" });
    fireEvent.pointerDown(child);
    expect(screen.getByRole("menuitem", { name: "PNG" })).toBeTruthy();
    await userEvent.click(child);
    expect(selected).toHaveBeenCalledOnce();
    expect(screen.queryByRole("menu")).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Actions" }));
  });
  it("does not leak child navigation into the parent and closes on outside interaction", async () => {
    render(<DropdownMenu label="Actions" items={items} />);
    await userEvent.click(screen.getByRole("button", { name: "Actions" }));
    await userEvent.keyboard("{ArrowRight}{End}");
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "More" }));
    expect(screen.getByRole("menuitem", { name: "Export" }).getAttribute("aria-expanded")).toBe("true");
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole("menu")).toBeNull();
  });
  it("names every open menu and exposes checked-item state", async () => {
    const change = vi.fn();
    const { container } = render(<DropdownMenu label="Actions" items={[{ label: "View", items: [{ label: "Grid", checked: true, onCheckedChange: change }] }]} />);
    await userEvent.click(screen.getByRole("button", { name: "Actions" }));
    await userEvent.keyboard("{ArrowRight}");
    const menu = screen.getByRole("menu", { name: "View" });
    expect(within(menu).getByRole("menuitemcheckbox", { name: "Grid" }).getAttribute("aria-checked")).toBe("true");
    expect((await axe(container, { rules: { "color-contrast": { enabled: false } } })).violations).toEqual([]);
    await userEvent.keyboard("{Enter}"); expect(change).toHaveBeenCalledWith(false);
  });
});
