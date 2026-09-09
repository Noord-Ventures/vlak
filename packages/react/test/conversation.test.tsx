import * as React from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { Conversation } from "../src/components/conversation";

let resize: () => void;
const disconnect = vi.fn();
beforeEach(() => {
  vi.stubGlobal("ResizeObserver", class {
    constructor(callback: () => void) { resize = callback; }
    observe() {}
    disconnect = disconnect;
  });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.clearAllMocks(); });

function dimensions(log: HTMLElement, height: number) {
  Object.defineProperty(log, "scrollHeight", { configurable: true, value: height });
  Object.defineProperty(log, "clientHeight", { configurable: true, value: 200 });
}

describe("Conversation", () => {
  it("follows resized streaming content, but preserves a reader's earlier position", () => {
    render(<Conversation><p>First response</p></Conversation>);
    const log = screen.getByRole("log");
    dimensions(log, 600);
    act(() => resize());
    expect(log.scrollTop).toBe(600);
    log.scrollTop = 100;
    fireEvent.scroll(log);
    dimensions(log, 800);
    act(() => resize());
    expect(log.scrollTop).toBe(100);
    expect(screen.getByRole("button", { name: "Jump to latest" })).toBeTruthy();
  });

  it("returns to the latest message by keyboard and resumes following", async () => {
    render(<Conversation><p>First response</p></Conversation>);
    const log = screen.getByRole("log");
    dimensions(log, 600);
    log.scrollTop = 100;
    fireEvent.scroll(log);
    screen.getByRole("button", { name: "Jump to latest" }).focus();
    await userEvent.keyboard("{Enter}");
    expect(log.scrollTop).toBe(600);
    expect(document.activeElement).toBe(log);
    dimensions(log, 800);
    act(() => resize());
    expect(log.scrollTop).toBe(800);
  });

  it("keeps autoScroll=false manual even when a new message arrives", () => {
    const { rerender } = render(<Conversation autoScroll={false}><p>First</p></Conversation>);
    const log = screen.getByRole("log");
    dimensions(log, 600);
    rerender(<Conversation autoScroll={false}><p>First</p><p>Second</p></Conversation>);
    expect(log.scrollTop).toBe(0);
    expect(screen.getByRole("button", { name: "Jump to latest" })).toBeTruthy();
  });

  it("names the log, leaves live announcements to response status, forwards its root and cleans up", async () => {
    const ref = React.createRef<HTMLDivElement>();
    const { container, unmount } = render(<Conversation ref={ref} label="Project conversation" className="custom" data-project="demo"><p>Recorded response</p></Conversation>);
    expect(ref.current?.classList.contains("custom")).toBe(true);
    expect(ref.current?.dataset.project).toBe("demo");
    const log = screen.getByRole("log", { name: "Project conversation" });
    expect(log.getAttribute("aria-live")).toBe("off");
    await userEvent.tab();
    expect(document.activeElement).toBe(log);
    expect(await axe(container)).toHaveNoViolations();
    unmount();
    expect(disconnect).toHaveBeenCalledOnce();
  });
});
