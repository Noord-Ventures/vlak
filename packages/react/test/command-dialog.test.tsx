import * as React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { Command, CommandDialog } from "../src/components/command";

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  HTMLDialogElement.prototype.close = function () { this.open = false; };
});
afterEach(cleanup);

describe("Command dialog layout ownership", () => {
  it("keeps the native dialog hidden without applying the command flex layout", () => {
    const ref = React.createRef<HTMLDialogElement>();
    const { container } = render(<><CommandDialog ref={ref} open={false} groups={[]} /><CommandDialog open={false} groups={[]} /></>);
    const dialogs = container.querySelectorAll("dialog");
    expect(dialogs).toHaveLength(2);
    for (const dialog of dialogs) {
      expect(dialog.classList.contains("rs-command-dialog")).toBe(true);
      expect(dialog.classList.contains("rs-command")).toBe(false);
      expect(dialog.open).toBe(false);
      expect(getComputedStyle(dialog).display).toBe("none");
      expect(dialog.children).toHaveLength(0);
    }
    expect(ref.current).toBe(dialogs[0]);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("applies the root class only to standalone command content", () => {
    render(<Command className="custom-command" groups={[]} />);
    const content = screen.getByRole("combobox").parentElement!;
    expect(content.tagName).toBe("DIV");
    expect(content.classList.contains("rs-command")).toBe(true);
    expect(content.classList.contains("custom-command")).toBe(true);
  });

  it("keeps the dialog ref through opening and closing while unmounting its content", () => {
    const ref = React.createRef<HTMLDialogElement>();
    const view = render(<CommandDialog ref={ref} open={false} groups={[]} />);
    const dialog = ref.current!;
    view.rerender(<CommandDialog ref={ref} open groups={[]} />);
    expect(ref.current).toBe(dialog);
    expect(dialog.open).toBe(true);
    expect(dialog.querySelector("div.rs-command")).toBeTruthy();
    expect(dialog.classList.contains("rs-command")).toBe(false);
    view.rerender(<CommandDialog ref={ref} open={false} groups={[]} />);
    expect(ref.current).toBe(dialog);
    expect(dialog.open).toBe(false);
    expect(getComputedStyle(dialog).display).toBe("none");
    expect(dialog.children).toHaveLength(0);
  });
});
