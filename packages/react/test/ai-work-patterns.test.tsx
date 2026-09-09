import * as React from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { Checkpoint } from "../src/components/checkpoint";
import { serializeConversation } from "../src/components/conversation-export";
import { GeneratedImage } from "../src/components/generated-image";
import { Plan } from "../src/components/plan";
import { Reasoning } from "../src/components/reasoning";
import { ResponseEditor } from "../src/components/response-editor";
import { Shimmer } from "../src/components/shimmer";
import { Suggestion, Suggestions } from "../src/components/suggestions";
import { Task } from "../src/components/task";
import { ThoughtSteps } from "../src/components/thought-steps";
import { getToolCallPresentation } from "../src/components/tool-call";
import { TreeView } from "../src/components/tree-view";
import { WorkQueue } from "../src/components/work-queue";

afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("AI work patterns", () => {
  it("uses keyboard-activated suggestions without losing their submitted values", async () => {
    const select = vi.fn();
    const { container } = render(<Suggestions><Suggestion value="Review the launch brief" onSelect={select}>Review brief</Suggestion><Suggestion disabled value="Unavailable" onSelect={select} /></Suggestions>);
    await userEvent.tab(); await userEvent.keyboard("{Enter}");
    expect(select).toHaveBeenCalledWith("Review the launch brief");
    expect(await axe(container)).toHaveNoViolations();
  });
  it("keeps supplied plan actions and work-step evidence accessible", async () => {
    const approve = vi.fn();
    const { container } = render(<Plan title="Review plan" description="Read, check, propose" actions={<button type="button" onClick={approve}>Approve plan</button>}><ThoughtSteps defaultOpen steps={[{ id: "source", title: "Read the source", state: "complete", sources: <a href="/brief">Launch brief</a> }, { id: "review", title: "Compare owners", state: "active", content: "One owner is missing." }]} /></Plan>);
    await userEvent.click(screen.getByRole("button", { name: "Approve plan" }));
    expect(approve).toHaveBeenCalledOnce();
    expect(screen.getByRole("link", { name: "Launch brief" })).toBeTruthy();
    expect(await axe(container)).toHaveNoViolations();
  });
  it("renders a default-open task and supplied file references", () => {
    const { container } = render(<Task title="Read sources" items={[{ id: "brief", content: "Read launch brief", file: "launch-brief.md", state: "complete" }]} />);
    expect(container.querySelector("details")?.open).toBe(true);
    expect(screen.getByText("launch-brief.md")).toBeTruthy();
  });
  it("requests queue completion with stable section and item identities", async () => {
    const change = vi.fn();
    const { container } = render(<WorkQueue onItemCheckedChange={change} sections={[{ id: "todos", title: "Next steps", items: [{ id: "review", content: "Review brief", completed: false }] }]} />);
    const checkbox = screen.getByRole("checkbox", { name: "Review brief" });
    checkbox.focus(); await userEvent.keyboard(" ");
    expect(change).toHaveBeenCalledWith("todos", "review", true);
    expect((checkbox as HTMLInputElement).checked).toBe(false);
    expect(await axe(container)).toHaveNoViolations();
  });
  it("reports restore rejection and permits a retry", async () => {
    const restore = vi.fn().mockRejectedValueOnce(new Error("Offline")).mockResolvedValue(undefined);
    render(<Checkpoint label="Before editing" onRestore={restore} />);
    await userEvent.click(screen.getByRole("button", { name: "Restore checkpoint" }));
    expect(screen.getByRole("alert").textContent).toContain("Try again");
    await userEvent.click(screen.getByRole("button", { name: "Restore checkpoint" }));
    expect(restore).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole("alert")).toBeNull();
  });
  it("preserves a multiline draft when saving fails", async () => {
    const save = vi.fn().mockRejectedValue(new Error("Offline"));
    render(<ResponseEditor text="Old message" onSave={save} onCancel={vi.fn()} />);
    await userEvent.clear(screen.getByRole("textbox"));
    await userEvent.type(screen.getByRole("textbox"), "First line{Enter}Second line");
    await userEvent.click(screen.getByRole("button", { name: "Save message" }));
    expect(save).toHaveBeenCalledWith("First line\nSecond line");
    expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe("First line\nSecond line");
    expect(screen.getByRole("alert")).toBeTruthy();
  });
  it("keeps an in-flight restore locked across parent callback changes", async () => {
    let complete!: () => void;
    const restore = vi.fn(() => new Promise<void>(resolve => { complete = resolve; }));
    const { rerender } = render(<Checkpoint label="Before editing" onRestore={() => restore()} />);
    await userEvent.click(screen.getByRole("button", { name: "Restore checkpoint" }));
    rerender(<Checkpoint label="Before editing" onRestore={() => restore()} />);
    expect((screen.getByRole("button", { name: "Restoring…" }) as HTMLButtonElement).disabled).toBe(true);
    await act(async () => complete());
    expect(restore).toHaveBeenCalledOnce();
  });
  it("does not cancel editing when Escape dismisses an IME candidate", () => {
    const cancel = vi.fn();
    render(<ResponseEditor text="Draft" onSave={vi.fn()} onCancel={cancel} />);
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Escape", isComposing: true });
    expect(cancel).not.toHaveBeenCalled();
  });
  it("cancels pending editing and ignores its late rejection", async () => {
    let reject!: (error: Error) => void;
    const cancel = vi.fn();
    render(<ResponseEditor text="Draft" onSave={() => new Promise((_resolve, fail) => { reject = fail; })} onCancel={cancel} />);
    await userEvent.click(screen.getByRole("button", { name: "Save message" }));
    await userEvent.keyboard("{Escape}");
    expect(cancel).toHaveBeenCalledOnce();
    await act(async () => reject(new Error("Late failure")));
    expect(screen.queryByRole("alert")).toBeNull();
  });
  it("measures a streaming interval and closes once when the optional policy is enabled", () => {
    vi.useFakeTimers();
    const { container, rerender } = render(<Reasoning status="streaming" autoExpand autoCollapseDelay={500} measureDuration>Summary</Reasoning>);
    expect(container.querySelector("details")?.open).toBe(true);
    act(() => vi.advanceTimersByTime(2100));
    rerender(<Reasoning status="complete" autoExpand autoCollapseDelay={500} measureDuration>Summary</Reasoning>);
    expect(screen.getByRole("status").textContent).toBe("Complete · 2s");
    act(() => vi.advanceTimersByTime(500));
    expect(container.querySelector("details")?.open).toBe(false);
  });
  it("preserves a reader's manual disclosure after streaming", () => {
    vi.useFakeTimers();
    const { container, rerender } = render(<Reasoning status="streaming" autoExpand autoCollapseDelay={100}>Summary</Reasoning>);
    const details = container.querySelector("details")!;
    fireEvent.click(details.querySelector("summary")!);
    details.open = true; fireEvent(details, new Event("toggle"));
    rerender(<Reasoning status="complete" autoExpand autoCollapseDelay={100}>Summary</Reasoning>);
    act(() => vi.advanceTimersByTime(200));
    expect(details.open).toBe(true);
  });
  it("serializes structured messages and fences tool output without object coercion", () => {
    const result = serializeConversation([{ role: "user", content: "Review this" }, { role: "assistant", parts: [{ type: "text", text: "Two findings" }, { type: "file", filename: "brief.md", url: "/brief.md" }, { type: "tool", name: "read", output: { text: "```" } }] }], { title: "Project brief" });
    expect(result).toContain("# Project brief\n\n## user\n\nReview this");
    expect(result).toContain("Attachment: brief.md\n/brief.md");
    expect(result).toContain("````json");
    expect(result).not.toContain("[object Object]");
    expect(serializeConversation([{ role: "assistant", content: "Legacy content", parts: [{ type: "text", text: "Private attachment" }] }], { serializePart: () => "" })).not.toContain("Legacy content");
  });
  it("maps all tool lifecycle states without inferring execution from ready input", () => {
    expect(getToolCallPresentation({ type: "tool-read", state: "input-available" })).toMatchObject({ title: "read", state: "queued", statusLabel: "Ready" });
    expect(getToolCallPresentation({ type: "dynamic-tool", toolName: "Search brief", state: "input-streaming" }).title).toBe("Search brief");
    expect(getToolCallPresentation({ type: "tool-read", state: "approval-requested", approval: { id: "approval" } }).approvalStatus).toBe("pending");
    expect(getToolCallPresentation({ type: "tool-read", state: "approval-responded", approval: { id: "approval", approved: false } }).approvalStatus).toBe("rejected");
    expect(getToolCallPresentation({ type: "tool-read", state: "approval-responded", approval: { id: "approval" } })).toMatchObject({ state: "queued", statusLabel: "Approval decision unavailable" });
    expect(getToolCallPresentation({ type: "tool-read", state: "approval-responded", approval: { id: "approval" } }).approvalStatus).toBeUndefined();
    expect(getToolCallPresentation({ type: "tool-read", state: "output-available", output: 0 }).output).toBe(0);
    expect(getToolCallPresentation({ type: "tool-read", state: "output-error", errorText: "Offline" }).error).toBe("Offline");
    expect(getToolCallPresentation({ type: "tool-read", state: "output-denied" }).statusLabel).toBe("Denied");
  });
  it("preserves tree keyboard search when files have custom visual content", async () => {
    render(<TreeView label="Files" nodes={[{ id: "a", label: "Alpha.tsx", icon: "□" }, { id: "b", label: "Beta.tsx", icon: "□" }]} renderLabel={node => <strong>{node.label} · Modified</strong>} />);
    await userEvent.tab(); await userEvent.keyboard("b");
    expect(document.activeElement).toBe(screen.getByRole("treeitem", { name: "Beta.tsx" }));
  });
  it("keeps shimmer text readable to assistive technology and validates generated image MIME types", () => {
    const { rerender } = render(<><Shimmer duration={-1} spread={100}>Reading sources</Shimmer><GeneratedImage alt="Generated chart" image={{ mediaType: "image/png", base64: "AAAA" }} /></>);
    expect(screen.getByText("Reading sources").style.getPropertyValue("--rs-shimmer-duration")).toBe("0.2s");
    expect(screen.getByRole("img").getAttribute("src")).toBe("data:image/png;base64,AAAA");
    rerender(<GeneratedImage alt="Unsupported result" image={{ mediaType: "text/html", base64: "AAAA" }} />);
    expect(screen.getByRole("img").hasAttribute("src")).toBe(false);
  });
});
