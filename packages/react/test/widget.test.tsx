import * as React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { Widget, WidgetEmbed } from "../src/components/widget";

afterEach(cleanup);

describe("Widget", () => {
  it("names the frame and keeps provider content, actions and source context accessible", async () => {
    const ref = React.createRef<HTMLElement>();
    const action = vi.fn();
    const { container } = render(<Widget ref={ref} title="Project tasks" provider="Connected workspace" statusLabel="3 tasks" className="custom" style={{ maxWidth: 500 }} data-source="project" actions={<button type="button" onClick={action}>Open tasks</button>} footer="Updated just now"><p>Review the launch brief.</p></Widget>);
    const region = screen.getByRole("region", { name: "Project tasks" });
    expect(ref.current).toBe(region);
    expect(region.dataset.source).toBe("project");
    expect(region.style.maxWidth).toBe("500px");
    expect(region.classList.contains("custom")).toBe(true);
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    expect(action).toHaveBeenCalledOnce();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("shows application supplied loading and empty states without presenting stale ready content", () => {
    const { rerender } = render(<Widget title="Tasks" status="loading"><p>Old task</p></Widget>);
    expect(screen.getByRole("status").closest('[aria-busy="true"]')).toBeNull();
    expect(screen.getByRole("status").textContent).toBe("Loading…");
    expect(screen.queryByText("Old task")).toBeNull();
    rerender(<Widget title="Tasks" status="empty" emptyMessage="No tasks assigned." />);
    expect(screen.getByRole("status").textContent).toBe("No tasks assigned.");
  });

  it("keeps failed retries actionable and reports success only through application state", async () => {
    const retry = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce(undefined);
    const { rerender } = render(<Widget title="Tasks" status="error" onRetry={retry} errorMessage="Workspace unavailable." />);
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("Retry failed. Try again.")).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    await waitFor(() => expect(retry).toHaveBeenCalledTimes(2));
    expect(screen.getByRole("alert").textContent).toBe("Workspace unavailable.");
    rerender(<Widget title="Tasks" status="ready"><p>Review the draft</p></Widget>);
    expect(screen.getByText("Review the draft")).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("locks duplicate retries and ignores their failure after the supplied state changes", async () => {
    let reject: (reason: Error) => void = () => {};
    const retry = vi.fn(() => new Promise<void>((_, no) => { reject = no; }));
    const { rerender } = render(<Widget title="Tasks" status="error" onRetry={retry} />);
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(screen.getByRole("button", { name: "Retrying…" }).hasAttribute("disabled")).toBe(true);
    expect(retry).toHaveBeenCalledOnce();
    rerender(<Widget title="Tasks" status="ready"><p>Loaded</p></Widget>);
    reject(new Error("stale"));
    await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
    expect(screen.getByText("Loaded")).toBeTruthy();
  });
});

describe("WidgetEmbed", () => {
  it("names the embedded interface and defaults to a bounded, sandboxed frame", async () => {
    const { container } = render(<Widget title="Available times" provider="Calendar integration"><WidgetEmbed title="Calendar availability picker" src="about:blank" /></Widget>);
    const frame = screen.getByTitle("Calendar availability picker") as HTMLIFrameElement;
    expect(frame.tagName).toBe("IFRAME");
    expect(frame.getAttribute("src")).toBe("about:blank");
    expect(frame.getAttribute("height")).toBe("320");
    expect(frame.getAttribute("sandbox")).toBe("allow-scripts allow-forms");
    expect(frame.getAttribute("referrerpolicy")).toBe("no-referrer");
    expect(frame.getAttribute("loading")).toBe("lazy");
    expect(frame.classList.contains("rs-widget-embed")).toBe(true);
    expect(frame.hasAttribute("allow")).toBe(false);
    // Check the host frame's accessible name; jsdom cannot inspect a provider document.
    expect(await axe(container, { iframes: false, rules: { "color-contrast": { enabled: false } } })).toHaveNoViolations();
  });

  it("forwards its iframe ref and lets the application choose dimensions, permissions, and native events", () => {
    const ref = React.createRef<HTMLIFrameElement>();
    const onLoad = vi.fn();
    render(<WidgetEmbed ref={ref} title="Provider document preview" src="about:blank" height={480} sandbox="allow-scripts" allow="fullscreen" referrerPolicy="origin" loading="eager" className="custom" style={{ maxWidth: 640 }} name="provider-preview" data-provider="documents" onLoad={onLoad} />);
    const frame = screen.getByTitle("Provider document preview") as HTMLIFrameElement;
    expect(ref.current).toBe(frame);
    expect(frame.getAttribute("height")).toBe("480");
    expect(frame.getAttribute("sandbox")).toBe("allow-scripts");
    expect(frame.getAttribute("allow")).toBe("fullscreen");
    expect(frame.getAttribute("referrerpolicy")).toBe("origin");
    expect(frame.getAttribute("loading")).toBe("eager");
    expect(frame.getAttribute("name")).toBe("provider-preview");
    expect(frame.dataset.provider).toBe("documents");
    expect(frame.classList.contains("custom")).toBe(true);
    expect(frame.style.maxWidth).toBe("640px");
    fireEvent.load(frame);
    expect(onLoad).toHaveBeenCalledOnce();
  });
});
