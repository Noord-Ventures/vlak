import * as React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { Menubar } from "../src/components/menubar";
import { vlak } from "../src/tokens.stylex";

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

const menus = [
  { label: "File", items: [{ label: "New" }, { label: "Open" }] },
  { label: "Edit", items: [{ label: "Undo" }, { label: "Redo" }] },
  { label: "View", items: [{ label: "Zoom in" }] },
];

describe("compact Menubar", () => {
  it("uses menu-specific controls without select sizing, borders, or disclosure icons", () => {
    const ref = React.createRef<HTMLDivElement>();
    const { container } = render(<Menubar ref={ref} aria-label="Editor menus" menus={menus} className="custom-bar" style={{ width: 202 }} />);
    const bar = screen.getByRole("menubar", { name: "Editor menus" });
    expect(ref.current).toBe(bar);
    expect(bar.className).toContain("custom-bar");
    expect(bar.style.width).toBe("202px");
    expect(container.querySelector(".rs-select, .rs-dropdown")).toBeNull();
    expect(container.querySelector("svg")).toBeNull();
    expect(container.querySelectorAll(".rs-menubar-wrap")).toHaveLength(3);
    for (const item of screen.getAllByRole("menuitem")) {
      expect(item.className).toContain("rs-menubar-trigger");
      expect(item.getAttribute("aria-haspopup")).toBe("menu");
    }
  });

  it("aligns compact triggers and allows wrapping without shrinking their hit targets", () => {
    const { container } = render(<Menubar menus={menus} style={{ width: 160 }} />);
    const bar = getComputedStyle(screen.getByRole("menubar"));
    expect(bar.display).toBe("inline-flex");
    expect(bar.flexWrap).toBe("wrap");
    expect(bar.alignItems).toBe("center");
    expect(bar.maxWidth).toBe("100%");
    expect(bar.boxSizing).toBe("border-box");
    for (const wrap of container.querySelectorAll(".rs-menubar-wrap")) {
      const paint = getComputedStyle(wrap);
      expect(paint.flex).toBe("0 1 auto");
      expect(Number.parseFloat(paint.minWidth)).toBe(0);
      expect(paint.maxWidth).toBe("100%");
    }
    for (const item of screen.getAllByRole("menuitem")) {
      const paint = getComputedStyle(item);
      expect(paint.minWidth).toBe(vlak.hit);
      expect(paint.minHeight).toBe(vlak.hit);
      expect(paint.borderWidth).toBe("0px");
      expect(paint.borderRadius).toBe(vlak.radiusSm);
      expect(paint.alignItems).toBe("center");
      expect(paint.justifyContent).toBe("center");
    }
  });

  it("marks only the open trigger with a full-surface state and keeps keyboard selection working", async () => {
    const user = userEvent.setup();
    const selected = vi.fn();
    render(<Menubar menus={[{ label: "File", items: [{ label: "New", onSelect: selected }] }, menus[1]!]} />);
    const file = screen.getByRole("menuitem", { name: "File" });
    const edit = screen.getByRole("menuitem", { name: "Edit" });
    file.focus();
    await user.keyboard("{Enter}");
    expect(file.className).toContain("rs-menubar-trigger-open");
    expect(edit.className).not.toContain("rs-menubar-trigger-open");
    await user.keyboard("{Enter}");
    expect(selected).toHaveBeenCalledOnce();
    expect(screen.queryByRole("menu")).toBeNull();
    expect(document.activeElement).toBe(file);
    expect(file.className).not.toContain("rs-menubar-trigger-open");
    await user.keyboard("{ArrowRight}{ArrowUp}");
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Redo" }));
    await user.keyboard("{Escape}");
    expect(document.activeElement).toBe(edit);
  });

  it("repositions the panel when moving between compact menu anchors", async () => {
    const user = userEvent.setup();
    render(<Menubar menus={menus} />);
    const file = screen.getByRole("menuitem", { name: "File" });
    const edit = screen.getByRole("menuitem", { name: "Edit" });
    vi.spyOn(file, "getBoundingClientRect").mockReturnValue({ x: 12, y: 20, left: 12, top: 20, right: 64, bottom: 64, width: 52, height: 44, toJSON: () => ({}) });
    vi.spyOn(edit, "getBoundingClientRect").mockReturnValue({ x: 66, y: 20, left: 66, top: 20, right: 116, bottom: 64, width: 50, height: 44, toJSON: () => ({}) });
    await user.click(file);
    expect(screen.getByRole("menu", { name: "File" }).style.left).toBe("12px");
    await user.keyboard("{ArrowRight}");
    const panel = screen.getByRole("menu", { name: "Edit" });
    expect(panel.style.left).toBe("66px");
    expect(panel.style.top).toBe("70px");
    expect(panel.style.visibility).toBe("visible");
    expect(panel.className).toContain("rs-menubar-panel");
  });

  it("switches open menus by pointer and closes on an outside pointer", async () => {
    const user = userEvent.setup();
    render(<><Menubar menus={menus} /><button type="button">Outside</button></>);
    await user.click(screen.getByRole("menuitem", { name: "File" }));
    fireEvent.pointerEnter(screen.getByRole("menuitem", { name: "View" }));
    expect(screen.getByRole("menu", { name: "View" })).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Outside" }));
    expect(screen.queryByRole("menu")).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Outside" }));
  });

  it("retains named menu semantics when closed and open", async () => {
    const user = userEvent.setup();
    const { container } = render(<Menubar aria-label="Editor menus" menus={menus} />);
    // Actual contrast and geometry are verified in the browser, not jsdom.
    expect(await axe(container, { rules: { "color-contrast": { enabled: false } } })).toHaveNoViolations();
    await user.click(screen.getByRole("menuitem", { name: "File" }));
    expect(await axe(container, { rules: { "color-contrast": { enabled: false } } })).toHaveNoViolations();
  });
});
