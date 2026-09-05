import * as React from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { DescriptionList } from "../src/components/description-list";
import { Metric } from "../src/components/metric";
import { ActivityTimeline } from "../src/components/activity-timeline";
import { CodeBlock } from "../src/components/code-block";
import { JSONViewer } from "../src/components/json-viewer";
import { DiffViewer, diffLines } from "../src/components/diff-viewer";
import { ErrorSummary } from "../src/components/error-summary";
import { NotificationCenter } from "../src/components/notification-center";
import { TaskProgress } from "../src/components/task-progress";
import { ConnectionStatus } from "../src/components/connection-status";

afterEach(cleanup);
const notifications = [{ id: "a", title: "Export ready", description: "The archive is ready to download" }];
const events = [{ id: "a", title: "Published", dateTime: "2026-09-05T10:00:00Z", details: "Revision 2" }];
describe("data and feedback additions", () => {
  it("keeps description semantics, forwarded refs and native attributes", () => {
    const ref = React.createRef<HTMLDListElement>();
    render(<DescriptionList ref={ref} data-testid="facts" items={[{ id: "r", label: "Range", value: "386 km" }]} />);
    expect(ref.current?.tagName).toBe("DL");
    expect(screen.getByText("Range").tagName).toBe("DT");
    expect(screen.getByText("386 km").tagName).toBe("DD");
  });
  it("formats a metric without mixing its value and unit", () => {
    render(<Metric label="Range" value={1234.5} unit="km" locale="en-US" formatOptions={{ maximumFractionDigits: 1 }} />);
    expect(screen.getByText("1,234.5").className).toContain("rs-metric-value");
    expect(screen.getByText("km").className).toContain("rs-metric-unit");
  });
  it("uses native details in activity history", async () => {
    render(<ActivityTimeline events={events} />);
    const summary = screen.getByText("Details");
    summary.focus();
    await userEvent.keyboard("{Enter}");
    expect(summary.tagName).toBe("SUMMARY");
    expect(screen.getByText("Revision 2")).toBeTruthy();
    expect(document.querySelector("time")?.dateTime).toBe(events[0]!.dateTime);
  });
  it("does not report a code copy as successful before completion", async () => {
    let finish!: () => void;
    const onCopy = vi.fn(() => new Promise<void>(resolve => { finish = resolve; }));
    render(<CodeBlock code="const value = 42;" language="JavaScript" onCopyCode={onCopy} lineNumbers />);
    await userEvent.click(screen.getByRole("button", { name: "Copy code" }));
    expect(screen.getByRole("status").textContent).toBe("");
    expect((screen.getByRole("button", { name: "Copying" }) as HTMLButtonElement).disabled).toBe(true);
    await act(async () => finish());
    expect(screen.getByRole("status").textContent).toBe("Code copied");
  });
  it("makes failed copy retryable", async () => {
    render(<CodeBlock code="x" onCopyCode={async () => { throw new Error("denied"); }} />);
    await userEvent.click(screen.getByRole("button", { name: "Copy code" }));
    expect(screen.getByRole("status").textContent).toContain("Could not copy");
    expect((screen.getByRole("button", { name: "Copy code" }) as HTMLButtonElement).disabled).toBe(false);
  });
  it("searches structured data, handles cycles, and bounds recursion", async () => {
    const data: Record<string, unknown> = { vehicle: { range: 386 }, name: "EV" }; data.self = data;
    render(<JSONViewer data={data} />);
    expect(screen.getByText("[Circular]")).toBeTruthy();
    await userEvent.type(screen.getByRole("searchbox"), "absent");
    expect(screen.getByRole("status").textContent).toContain("No matching");
    await userEvent.clear(screen.getByRole("searchbox"));
    await userEvent.click(screen.getByRole("button", { name: "Collapse all" }));
    expect(document.querySelector("details")?.open).toBe(false);
  });
  it("diffs insertions, deletions, unchanged suffixes and empty input", () => {
    expect(diffLines("a\nb\nc", "a\nx\nc").map(line => line.kind)).toEqual(["same", "removed", "added", "same"]);
    expect(diffLines("", "")).toEqual([]);
    expect(diffLines("", "hello")).toEqual([{ kind: "added", text: "hello", after: 1 }]);
    expect(diffLines("a\nb", "a\nb")).toHaveLength(2);
  });
  it("bounds diff computation for large replacements", () => {
    const before = Array.from({ length: 1100 }, (_, index) => `old ${index}`).join("\n");
    const after = Array.from({ length: 1100 }, (_, index) => `new ${index}`).join("\n");
    expect(diffLines(before, after)).toHaveLength(2200);
  });
  it("switches diff layout with keyboard and supports controlled view", async () => {
    const onChange = vi.fn();
    const { rerender } = render(<DiffViewer before="a" after="b" onViewChange={onChange} />);
    screen.getByRole("button", { name: "Split" }).focus();
    await userEvent.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: "Split" }).getAttribute("aria-pressed")).toBe("true");
    expect(onChange).toHaveBeenCalledWith("split");
    rerender(<DiffViewer before="a" after="b" view="unified" onViewChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Split" }));
    expect(screen.getByRole("button", { name: "Unified" }).getAttribute("aria-pressed")).toBe("true");
  });
  it("links a form error to its actual focusable input", async () => {
    render(<><label htmlFor="email">Email</label><input id="email" /><ErrorSummary errors={[{ id: "email", message: "Enter your email" }]} autoFocus /></>);
    expect(document.activeElement).toBe(screen.getByRole("alert"));
    await userEvent.click(screen.getByRole("link", { name: "Enter your email" }));
    expect(document.activeElement?.id).toBe("email");
  });
  it("updates notification read state and dismisses through native buttons", async () => {
    render(<NotificationCenter defaultValue={notifications} />);
    await userEvent.click(screen.getByRole("button", { name: "Mark Export ready as read" }));
    expect(screen.getByText("(0 unread)")).toBeTruthy();
    screen.getByRole("button", { name: "Dismiss Export ready" }).focus();
    await userEvent.keyboard("{Enter}");
    expect(screen.getByText("You're up to date")).toBeTruthy();
  });
  it("keeps controlled notifications unchanged until the parent updates", async () => {
    const onChange = vi.fn();
    render(<NotificationCenter value={notifications} onValueChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Mark all as read" }));
    expect(screen.getByText("(1 unread)")).toBeTruthy();
    expect(onChange).toHaveBeenCalledWith([expect.objectContaining({ read: true })]);
  });
  it("represents unknown progress and action failures honestly", async () => {
    render(<TaskProgress label="Export" state="running" onCancel={async () => { throw new Error("offline"); }} />);
    expect(screen.getByRole("progressbar").hasAttribute("value")).toBe(false);
    await userEvent.click(screen.getByRole("button", { name: "Cancel task" }));
    expect(screen.getByRole("alert").textContent).toContain("action failed");
    expect(screen.getByRole("status").textContent).toBe("In progress");
  });
  it("does not infer reconnection from a resolved retry request", async () => {
    const onRetry = vi.fn(async () => {});
    const { rerender } = render(<ConnectionStatus state="offline" onRetry={onRetry} />);
    screen.getByRole("button", { name: "Retry connection" }).focus();
    await userEvent.keyboard("{Enter}");
    expect(onRetry).toHaveBeenCalledOnce();
    expect(screen.getByRole("status").textContent).toBe("Offline");
    rerender(<ConnectionStatus state="connected" onRetry={onRetry} />);
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getByRole("status").textContent).toBe("Connected");
  });
  const specimens = [
    <DescriptionList key="dl" items={[{ id: "x", label: "Name", value: "Vlak" }]} />,
    <Metric key="metric" label="Range" value={386} unit="km" />,
    <ActivityTimeline key="activity" events={events} />,
    <CodeBlock key="code" code="let x = 1;" />,
    <JSONViewer key="json" data={{ value: 1 }} />,
    <DiffViewer key="diff" before="a" after="b" />,
    <ErrorSummary key="errors" errors={[{ id: "target", message: "Required" }]} />,
    <NotificationCenter key="notifications" defaultValue={notifications} />,
    <TaskProgress key="task" label="Export" state="running" value={40} />,
    <ConnectionStatus key="connection" state="offline" onRetry={() => {}} />,
  ];
  it.each(specimens.map((specimen, index) => [index, specimen] as const))("has no axe violations in data specimen %s", async (_, specimen) => {
    const { container } = render(specimen);
    expect((await axe(container, { rules: { "color-contrast": { enabled: false } } })).violations).toEqual([]);
  });
});
