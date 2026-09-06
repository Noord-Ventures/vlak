import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DropdownMenu } from "../src/components/dropdown-menu";
import { vlak } from "../src/tokens.stylex";

afterEach(cleanup);

const items = [
  { label: "Rename" },
  { label: "Duplicate" },
  { separator: true },
  { label: "Delete" },
];

describe("DropdownMenu visual craft", () => {
  it("reserves an inline 16px indicator slot for checked and unchecked items", async () => {
    const change = vi.fn();
    render(<DropdownMenu label="Export" items={[
      { label: "Include notes", checked: true, onCheckedChange: change },
      { label: "Include history", checked: false, onCheckedChange: change },
      { label: "Download" },
    ]} />);
    await userEvent.click(screen.getByRole("button", { name: "Export" }));
    const checked = screen.getByRole("menuitemcheckbox", { name: "Include notes" });
    const unchecked = screen.getByRole("menuitemcheckbox", { name: "Include history" });
    expect(checked.getAttribute("aria-checked")).toBe("true");
    expect(unchecked.getAttribute("aria-checked")).toBe("false");
    for (const item of [checked, unchecked]) {
      expect(getComputedStyle(item).display).toBe("flex");
      expect(getComputedStyle(item).alignItems).toBe("center");
      expect(getComputedStyle(item).minHeight).toBe(vlak.hit);
      const slot = item.querySelector(".rs-menu-item-indicator")!;
      expect(getComputedStyle(slot).width).toBe("1rem");
      expect(getComputedStyle(slot).height).toBe("1rem");
      expect(getComputedStyle(slot).flexShrink).toBe("0");
      expect(slot.getAttribute("aria-hidden")).toBe("true");
      expect(slot.nextElementSibling?.className).toContain("rs-menu-item-label");
    }
    expect(checked.querySelector(".rs-menu-item-indicator svg")).not.toBeNull();
    expect(unchecked.querySelector(".rs-menu-item-indicator svg")).toBeNull();
    const action = screen.getByRole("menuitem", { name: "Download" });
    expect(action.hasAttribute("aria-checked")).toBe(false);
    expect(action.querySelector(".rs-menu-item-indicator")).toBeNull();
    await userEvent.keyboard("{Enter}");
    expect(change).toHaveBeenCalledWith(false);
    await userEvent.click(screen.getByRole("button", { name: "Export" }));
    await userEvent.keyboard("{ArrowDown}{Enter}");
    expect(change).toHaveBeenLastCalledWith(true);
  });

  it("uses a single explicit group separator without borders around every action", async () => {
    render(<DropdownMenu label="Actions" items={items} />);
    await userEvent.click(screen.getByRole("button", { name: "Actions" }));
    expect(screen.getAllByRole("separator")).toHaveLength(1);
    for (const item of screen.getAllByRole("menuitem")) {
      const paint = getComputedStyle(item);
      expect(paint.borderTopWidth).toBe("0px");
      expect(paint.borderBottomWidth).toBe("0px");
      expect(paint.borderLeftWidth).toBe("0px");
      expect(paint.borderRightWidth).toBe("0px");
      expect(paint.outlineWidth).toBe("0");
      expect(paint.outlineStyle).toBe("none");
    }
    expect(getComputedStyle(screen.getByRole("menu")).padding).toBe("0.25rem");
  });

  it("keeps focus moving through every action without landing on the separator", async () => {
    render(<DropdownMenu label="Actions" items={items} />);
    const trigger = screen.getByRole("button", { name: "Actions" });
    trigger.focus();
    await userEvent.keyboard("{ArrowDown}");
    const rename = screen.getByRole("menuitem", { name: "Rename" });
    expect(document.activeElement).toBe(rename);
    expect(getComputedStyle(rename).backgroundColor).toBe(vlak.ink);
    expect(getComputedStyle(rename).color).toBe(vlak.paper);
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    const deletion = screen.getByRole("menuitem", { name: "Delete" });
    expect(document.activeElement).toBe(deletion);
    expect(deletion.className).toContain("rs-menu-item-active");
    expect(screen.getByRole("separator").getAttribute("tabindex")).toBeNull();
    await userEvent.keyboard("{Escape}");
    expect(document.activeElement).toBe(trigger);
  });
});
