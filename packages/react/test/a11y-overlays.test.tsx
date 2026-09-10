import * as React from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { AlertDialog, AlertDialogActions, AlertDialogTitle } from "../src/components/alert-dialog";
import { Button } from "../src/components/button";
import { Dialog, DialogActions, DialogBody, DialogTitle } from "../src/components/dialog";
import { Drawer, DrawerTitle } from "../src/components/drawer";
import { Field, FieldError, FieldHint, FieldLabel } from "../src/components/field";
import { HoverCard } from "../src/components/hover-card";
import { Input } from "../src/components/input";
import { NativeSelect } from "../src/components/native-select";
import { Progress } from "../src/components/progress";
import { Sheet, SheetTitle } from "../src/components/sheet";
import { Slider } from "../src/components/slider";
import { Textarea } from "../src/components/textarea";
import { toast, Toaster } from "../src/components/toast";
import { Tooltip } from "../src/components/tooltip";

/* test/setup.ts registers the matcher at runtime; this types it locally. */
async function noViolations(el: Element) {
  // jsdom has no canvas, so axe cannot measure contrast here; the palette is checked in core.
  expect(await axe(el, { rules: { "color-contrast": { enabled: false } } })).toHaveNoViolations();
}

beforeAll(() => {
  // jsdom has no modal dialogs: mirror the open state and the close event.
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function () {
    this.open = false;
    this.dispatchEvent(new Event("close"));
  };
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const dialog = () => document.querySelector("dialog")!;

function DialogDemo({ onClose }: { onClose: () => void }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open</Button>
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
          onClose();
        }}
      >
        <DialogTitle>Remove this item?</DialogTitle>
        <DialogBody>This can't be undone.</DialogBody>
        <DialogActions>
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

describe("Dialog", () => {
  it("is named by its title, described by its body, and rendered as a heading", async () => {
    const user = userEvent.setup();
    const { container } = render(<DialogDemo onClose={() => {}} />);
    await user.click(screen.getByRole("button", { name: "Open" }));
    const el = dialog();
    expect(el.open).toBe(true);
    const title = screen.getByText("Remove this item?");
    expect(title.tagName).toBe("H2");
    expect(el.getAttribute("aria-labelledby")).toBe(title.id);
    expect(el.getAttribute("aria-describedby")).toBe(screen.getByText("This can't be undone.").id);
    expect(el.getAttribute("closedby")).toBe("closerequest");
    expect(screen.getByRole("dialog", { name: "Remove this item?" })).toBe(el);
    await noViolations(container);
  });

  it("turns Escape into onClose and returns focus to the opener", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<DialogDemo onClose={onClose} />);
    const opener = screen.getByRole("button", { name: "Open" });
    await user.click(opener);
    expect(dialog().contains(document.activeElement)).toBe(true);
    // The platform fires a cancelable `cancel` on Escape.
    act(() => {
      fireEvent(dialog(), new Event("cancel", { cancelable: true }));
    });
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(dialog().open).toBe(false);
    expect(document.activeElement).toBe(opener);
  });

  it("forwards its ref and honours an explicit title id", () => {
    const ref = React.createRef<HTMLDialogElement>();
    render(
      <Dialog ref={ref} open onClose={() => {}}>
        <DialogTitle id="custom">Custom</DialogTitle>
      </Dialog>,
    );
    expect(ref.current).toBe(dialog());
    expect(dialog().getAttribute("aria-labelledby")).toBe("custom");
  });

  it("restores the opener when a parent unmounts its open dialog", async () => {
    const user = userEvent.setup();
    const closed = vi.fn();
    function ConditionalDialog() {
      const [visible, setVisible] = React.useState(false);
      return <><button type="button" onClick={() => setVisible(true)}>Open conditionally</button>{visible && <Dialog open aria-label="Temporary dialog" closeLabel="Close temporary dialog" onClose={() => { closed(); setVisible(false); }} />}</>;
    }
    render(<ConditionalDialog />);
    const opener = screen.getByRole("button", { name: "Open conditionally" });
    await user.click(opener);
    expect(dialog().contains(document.activeElement)).toBe(true);
    await user.click(screen.getByRole("button", { name: "Close temporary dialog" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(opener);
    expect(closed).toHaveBeenCalledTimes(1);
  });

  it("preserves a newer focus target when an open dialog unmounts", async () => {
    const user = userEvent.setup();
    function FocusDestination() {
      const [visible, setVisible] = React.useState(false);
      const destination = React.useRef<HTMLButtonElement>(null);
      return <><button type="button" onClick={() => setVisible(true)}>Open dialog</button><button type="button" ref={destination}>Next workspace</button>{visible && <Dialog open aria-label="Temporary dialog"><button type="button" onClick={() => { destination.current?.focus(); setVisible(false); }}>Continue</button></Dialog>}</>;
    }
    render(<FocusDestination />);
    await user.click(screen.getByRole("button", { name: "Open dialog" }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Next workspace" }));
  });

  it("keeps Strict Mode replay open and reports a subsequent native close once", async () => {
    const closed = vi.fn();
    const nativeClose = vi.spyOn(HTMLDialogElement.prototype, "close").mockImplementation(function (this: HTMLDialogElement) {
      this.open = false;
      queueMicrotask(() => this.dispatchEvent(new Event("close")));
    });
    try {
      render(<React.StrictMode><Dialog open aria-label="Strict dialog" onClose={closed}><button type="button">Inside</button></Dialog></React.StrictMode>);
      await act(async () => { await Promise.resolve(); });
      expect(dialog().open).toBe(true);
      expect(dialog().contains(document.activeElement)).toBe(true);
      expect(closed).not.toHaveBeenCalled();
      await act(async () => { dialog().close(); await Promise.resolve(); });
      expect(closed).toHaveBeenCalledTimes(1);
    } finally { nativeClose.mockRestore(); }
  });

  it("ignores a queued native close after a controlled dialog has reopened", async () => {
    const closed = vi.fn();
    const nativeClose = vi.spyOn(HTMLDialogElement.prototype, "close").mockImplementation(function (this: HTMLDialogElement) {
      this.open = false;
      queueMicrotask(() => this.dispatchEvent(new Event("close")));
    });
    try {
      const view = render(<Dialog open aria-label="Reopened dialog" onClose={closed}><button type="button">Inside</button></Dialog>);
      view.rerender(<Dialog open={false} aria-label="Reopened dialog" onClose={closed}><button type="button">Inside</button></Dialog>);
      view.rerender(<Dialog open aria-label="Reopened dialog" onClose={closed}><button type="button">Inside</button></Dialog>);
      await act(async () => { await Promise.resolve(); });
      expect(dialog().open).toBe(true);
      expect(closed).not.toHaveBeenCalled();
    } finally { nativeClose.mockRestore(); }
  });
});

describe("AlertDialog", () => {
  it("cannot be dismissed by a close request", async () => {
    const onClose = vi.fn();
    const { container } = render(
      <AlertDialog open onClose={onClose}>
        <AlertDialogTitle>Delete this workspace?</AlertDialogTitle>
        <AlertDialogActions>
          <Button size="sm" onClick={onClose}>
            Delete
          </Button>
        </AlertDialogActions>
      </AlertDialog>,
    );
    const el = dialog();
    expect(el.getAttribute("role")).toBe("alertdialog");
    expect(el.getAttribute("closedby")).toBe("none");
    const cancel = new Event("cancel", { cancelable: true });
    act(() => {
      fireEvent(el, cancel);
    });
    expect(cancel.defaultPrevented).toBe(true);
    expect(onClose).not.toHaveBeenCalled();
    expect(el.open).toBe(true);
    await noViolations(container);
  });
});

describe("Sheet and Drawer", () => {
  it("name themselves and offer a labelled close button", async () => {
    const onClose = vi.fn();
    const { container, unmount } = render(
      <Sheet open onClose={onClose} closeLabel="Close filters">
        <SheetTitle>Filters</SheetTitle>
      </Sheet>,
    );
    expect(dialog().getAttribute("aria-labelledby")).toBe(screen.getByText("Filters").id);
    const close = screen.getByRole("button", { name: "Close filters" });
    expect(close.className).toContain("rs-sheet-close");
    fireEvent.click(close);
    expect(onClose).toHaveBeenCalledTimes(1);
    await noViolations(container);
    unmount();

    const drawer = render(
      <Drawer open onClose={onClose} closeLabel="Close notes">
        <DrawerTitle as="h3">Notes</DrawerTitle>
      </Drawer>,
    );
    expect(screen.getByText("Notes").tagName).toBe("H3");
    expect(dialog().getAttribute("aria-labelledby")).toBe(screen.getByText("Notes").id);
    expect(screen.getByRole("button", { name: "Close notes" }).className).toContain("rs-drawer-close");
    await noViolations(drawer.container);
  });
});

describe("Tooltip", () => {
  it("is a real element that describes its trigger and hides on Escape", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Tooltip tip="Copy to clipboard">
        <button type="button">Copy</button>
      </Tooltip>,
    );
    const trigger = screen.getByRole("button", { name: "Copy" });
    const tip = document.getElementById(trigger.getAttribute("aria-describedby")!)!;
    expect(tip.getAttribute("role")).toBe("tooltip");
    expect(tip.textContent).toBe("Copy to clipboard");
    expect(tip.className).toContain("rs-tip-bubble");
    await user.tab();
    expect(document.activeElement).toBe(trigger);
    expect(tip.hidden).toBe(false);
    await user.keyboard("{Escape}");
    expect(tip.hidden).toBe(true);
    fireEvent.pointerLeave(tip.parentElement!);
    expect(tip.hidden).toBe(false);
    await noViolations(container);
  });

  it("makes a text trigger reachable and described", () => {
    render(<Tooltip tip="Hint">Hover</Tooltip>);
    const root = screen.getByText("Hover");
    expect(root.getAttribute("tabindex")).toBe("0");
    expect(document.getElementById(root.getAttribute("aria-describedby")!)?.textContent).toBe("Hint");
  });
});

describe("HoverCard", () => {
  it("keeps a link trigger at one tab stop and associates the panel", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <>
        <HoverCard trigger={<a href="#noord">@noord</a>}>Noord, a venture studio.</HoverCard>
        <button type="button">After</button>
      </>,
    );
    const link = screen.getByRole("link", { name: "@noord" });
    const panel = document.getElementById(link.getAttribute("aria-describedby")!)!;
    expect(panel.getAttribute("role")).toBe("tooltip");
    expect(panel.textContent).toBe("Noord, a venture studio.");
    await user.tab();
    expect(document.activeElement).toBe(link);
    await user.keyboard("{Escape}");
    expect(panel.hidden).toBe(true);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "After" }));
    expect(panel.hidden).toBe(false);
    await noViolations(container);
  });

  it("gives a text trigger one tab stop", () => {
    render(<HoverCard trigger="@noord">Card</HoverCard>);
    const trigger = screen.getByText("@noord");
    expect(trigger.getAttribute("tabindex")).toBe("0");
    // The panel is visually hidden until hover or focus, so it is queried as hidden.
    expect(trigger.getAttribute("aria-describedby")).toBe(screen.getByRole("tooltip", { hidden: true }).id);
  });
});

describe("Toaster", () => {
  it("renders toasts fired before it mounted", () => {
    toast("Early");
    render(<Toaster />);
    expect(screen.getByText("Early").className).toContain("rs-toast-title");
  });

  it("gives every toast a labelled close button", async () => {
    const { container } = render(<Toaster />);
    act(() => {
      toast("Saved", { description: "Your changes are live." });
    });
    expect(screen.getByRole("button", { name: "Dismiss" })).toBeTruthy();
    await noViolations(container);
  });

  it("pauses while hovered or focused, and closes on demand", () => {
    // axe schedules its own timers, so it stays out of this fake-timer test.
    vi.useFakeTimers();
    render(<Toaster duration={4000} />);
    act(() => {
      toast("Saved", { description: "Your changes are live." });
    });
    const card = document.querySelector(".rs-toast")!;
    fireEvent.pointerEnter(card);
    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(screen.getByText("Saved")).toBeTruthy();
    fireEvent.pointerLeave(card);
    act(() => {
      vi.advanceTimersByTime(4000 + "SavedYour changes are live.".length * 50 + 10);
    });
    expect(screen.queryByText("Saved")).toBeNull();

    act(() => {
      toast("Second");
    });
    const close = screen.getByRole("button", { name: "Dismiss" });
    fireEvent.focus(close);
    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(screen.getByText("Second")).toBeTruthy();
    fireEvent.click(close);
    expect(screen.queryByText("Second")).toBeNull();
  });

  it("clears its timers on unmount", () => {
    vi.useFakeTimers();
    const { unmount } = render(<Toaster />);
    act(() => {
      toast("Gone");
    });
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe("Field", () => {
  it("binds hint and error to the control", async () => {
    const { container } = render(
      <Field>
        <FieldLabel htmlFor="email">E-mail</FieldLabel>
        <Input id="email" plain />
        <FieldHint>Your work address.</FieldHint>
        <FieldError>Required.</FieldError>
      </Field>,
    );
    const input = screen.getByLabelText("E-mail");
    const ids = input.getAttribute("aria-describedby")!.split(" ");
    expect(ids).toContain(screen.getByText("Your work address.").id);
    expect(ids).toContain(screen.getByText("Required.").id);
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.className).toContain("rs-input-invalid");
    await noViolations(container);
  });

  it("reaches a textarea and a native select the same way", () => {
    render(
      <>
        <Field>
          <FieldLabel htmlFor="notes">Notes</FieldLabel>
          <Textarea id="notes" />
          <FieldError>Too long.</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="city">City</FieldLabel>
          <NativeSelect id="city">
            <option>Alkmaar</option>
          </NativeSelect>
          <FieldHint>Where the invoice goes.</FieldHint>
        </Field>
      </>,
    );
    const area = screen.getByLabelText("Notes");
    expect(area.getAttribute("aria-invalid")).toBe("true");
    expect(area.getAttribute("aria-describedby")).toBe(screen.getByText("Too long.").id);
    const select = screen.getByLabelText("City");
    expect(select.getAttribute("aria-invalid")).toBeNull();
    expect(select.getAttribute("aria-describedby")).toBe(screen.getByText("Where the invoice goes.").id);
  });

  it("lets Input render its own hint and error", async () => {
    const { container } = render(<Input label="Name" hint="As on the invoice." error="Required." />);
    const input = screen.getByLabelText("Name");
    const ids = input.getAttribute("aria-describedby")!.split(" ");
    expect(ids).toContain(screen.getByText("As on the invoice.").id);
    expect(ids).toContain(screen.getByText("Required.").id);
    expect(screen.getByText("Required.").getAttribute("role")).toBe("alert");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    await noViolations(container);
  });
});

describe("Progress", () => {
  it("is named by its label and carries the value range", async () => {
    const { container } = render(<Progress label="Uploading" value={40} />);
    const bar = screen.getByRole("progressbar", { name: "Uploading" });
    expect(bar.getAttribute("aria-valuemin")).toBe("0");
    expect(bar.getAttribute("aria-valuemax")).toBe("100");
    expect(bar.getAttribute("aria-valuenow")).toBe("40");
    await noViolations(container);
  });

  it("accepts an explicit aria-label", () => {
    render(<Progress aria-label="Sync" value={2} max={4} />);
    expect(screen.getByRole("progressbar", { name: "Sync" }).getAttribute("aria-valuemax")).toBe("4");
  });
});

describe("Slider", () => {
  it("marks the thumb while the range has keyboard focus", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <>
        <Slider aria-label="Volume" defaultValue={30} />
        <button type="button">After</button>
      </>,
    );
    const thumb = container.querySelector(".rs-slider-thumb")!;
    expect(thumb.className).not.toContain("rs-slider-thumb-focused");
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("slider", { name: "Volume" }));
    expect(thumb.className).toContain("rs-slider-thumb-focused");
    await user.tab();
    expect(thumb.className).not.toContain("rs-slider-thumb-focused");
    await noViolations(container);
  });
});
