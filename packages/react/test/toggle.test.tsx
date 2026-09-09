import * as React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Toggle, ToggleGroup } from "../src/components/toggle";

afterEach(cleanup);

const options = [
  { value: "overview", label: "Overview" },
  { value: "activity", label: "Activity" },
  { value: "files", label: "Files" },
];

describe.each(["default", "subtle"] as const)("%s toggles", variant => {
  it("keeps controlled state authoritative and respects disabled native buttons", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const ref = React.createRef<HTMLButtonElement>();
    const { rerender } = render(<Toggle variant={variant} ref={ref} pressed={false} onPressedChange={change}>Follow</Toggle>);
    const button = screen.getByRole("button", { name: "Follow" });
    expect(ref.current).toBe(button);
    await user.tab();
    await user.keyboard(" ");
    expect(change).toHaveBeenLastCalledWith(true);
    expect(button.getAttribute("aria-pressed")).toBe("false");
    rerender(<Toggle variant={variant} ref={ref} pressed onPressedChange={change}>Follow</Toggle>);
    await user.keyboard("{Enter}");
    expect(change).toHaveBeenLastCalledWith(false);
    expect(button.getAttribute("aria-pressed")).toBe("true");
    rerender(<Toggle variant={variant} disabled pressed onPressedChange={change}>Follow</Toggle>);
    await user.click(button);
    expect(change).toHaveBeenCalledTimes(2);
  });

  it("keeps all group options in the native tab order and selects with Enter or Space", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(<ToggleGroup variant={variant} aria-label="View" options={options} defaultValue="overview" onValueChange={change} />);
    const overview = screen.getByRole("button", { name: "Overview" });
    const activity = screen.getByRole("button", { name: "Activity" });
    const files = screen.getByRole("button", { name: "Files" });
    await user.tab();
    expect(document.activeElement).toBe(overview);
    await user.tab();
    expect(document.activeElement).toBe(activity);
    await user.keyboard("{Enter}");
    expect(activity.getAttribute("aria-pressed")).toBe("true");
    expect(overview.getAttribute("aria-pressed")).toBe("false");
    await user.tab();
    expect(document.activeElement).toBe(files);
    await user.keyboard(" ");
    expect(files.getAttribute("aria-pressed")).toBe("true");
    expect(activity.getAttribute("aria-pressed")).toBe("false");
    expect(change.mock.calls).toEqual([["activity"], ["files"]]);
  });

  it("keeps controlled group selection until the application accepts a change", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const ref = React.createRef<HTMLDivElement>();
    const { rerender } = render(<ToggleGroup variant={variant} ref={ref} aria-label="View" options={options} value="overview" onValueChange={change} />);
    expect(ref.current).toBe(screen.getByRole("group", { name: "View" }));
    await user.click(screen.getByRole("button", { name: "Files" }));
    expect(change).toHaveBeenCalledWith("files");
    expect(screen.getByRole("button", { name: "Overview" }).getAttribute("aria-pressed")).toBe("true");
    rerender(<ToggleGroup variant={variant} ref={ref} aria-label="View" options={options} value="files" onValueChange={change} />);
    expect(screen.getByRole("button", { name: "Files" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: "Overview" }).getAttribute("aria-pressed")).toBe("false");
  });

  it("exposes named controls and selected states without axe violations", async () => {
    const { container } = render(<><Toggle variant={variant} defaultPressed>Follow</Toggle><ToggleGroup variant={variant} aria-label="View" options={options} defaultValue="overview" /></>);
    expect(await axe(container, { rules: { "color-contrast": { enabled: false } } })).toHaveNoViolations();
  });
});

it("preserves an uncontrolled toggle and group selection when the presentation changes", async () => {
  const user = userEvent.setup();
  const { rerender } = render(<><Toggle>Follow</Toggle><ToggleGroup aria-label="View" options={options} defaultValue="overview" /></>);
  await user.click(screen.getByRole("button", { name: "Follow" }));
  await user.click(screen.getByRole("button", { name: "Files" }));
  rerender(<><Toggle variant="subtle">Follow</Toggle><ToggleGroup variant="subtle" aria-label="View" options={options} defaultValue="overview" /></>);
  expect(screen.getByRole("button", { name: "Follow" }).getAttribute("aria-pressed")).toBe("true");
  expect(screen.getByRole("button", { name: "Files" }).getAttribute("aria-pressed")).toBe("true");
  expect(screen.getByRole("button", { name: "Follow" }).hasAttribute("variant")).toBe(false);
  expect(screen.getByRole("group", { name: "View" }).hasAttribute("variant")).toBe(false);
});
