import * as React from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ToolCall } from "../src/components/tool-call";
import { Confirmation } from "../src/components/confirmation";

afterEach(cleanup);

describe("ToolCall", () => {
  it("exposes native keyboard focus and toggles an uncontrolled disclosure", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const ref = React.createRef<HTMLDetailsElement>();
    render(<ToolCall ref={ref} title="Search documents" state="complete" output="Three matches" onOpenChange={onOpenChange} />);
    const summary = screen.getByText("Search documents").closest("summary")!;
    await user.tab();
    expect(document.activeElement).toBe(summary);
    // jsdom implements the native summary click default action, but not keyboard activation.
    await user.click(summary);
    await waitFor(() => expect(ref.current?.open).toBe(true));
    await waitFor(() => expect(onOpenChange).toHaveBeenLastCalledWith(true));
    await user.click(summary);
    await waitFor(() => expect(ref.current?.open).toBe(false));
    await waitFor(() => expect(onOpenChange).toHaveBeenLastCalledWith(false));
  });

  it("keeps controlled open authoritative and reports each user request once", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const ref = React.createRef<HTMLDetailsElement>();
    const view = render(<ToolCall ref={ref} title="Find sources" open={false} onOpenChange={change} output="Result" />);
    await user.click(screen.getByText("Find sources"));
    expect(ref.current?.open).toBe(false);
    expect(change).toHaveBeenCalledExactlyOnceWith(true);
    view.rerender(<ToolCall ref={ref} title="Find sources" open onOpenChange={change} output="Result" />);
    await waitFor(() => expect(ref.current?.open).toBe(true));
    await user.click(screen.getByText("Find sources"));
    expect(ref.current?.open).toBe(true);
    expect(change.mock.calls).toEqual([[true], [false]]);
  });

  it("restores externally toggled controlled details and forwards native toggle events", async () => {
    const change = vi.fn();
    const toggle = vi.fn();
    const ref = React.createRef<HTMLDetailsElement>();
    render(<ToolCall ref={ref} title="Read file" open={false} onOpenChange={change} onToggle={toggle} />);
    act(() => { ref.current!.open = true; fireEvent(ref.current!, new Event("toggle")); });
    expect(ref.current?.open).toBe(false);
    expect(change).toHaveBeenCalledExactlyOnceWith(true);
    expect(toggle).toHaveBeenCalled();
  });

  it("preserves falsy supplied values and renders payload text without interpreting markup", () => {
    const ref = React.createRef<HTMLDetailsElement>();
    const view = render(<ToolCall ref={ref} title="Read result" defaultOpen input="" output={0} className="custom-tool" style={{ maxWidth: 400 }} data-testid="tool" />);
    expect(ref.current?.open).toBe(true);
    expect(screen.getByText("Input")).toBeTruthy();
    expect(screen.getByText("Output")).toBeTruthy();
    expect(screen.getByText("0").tagName).toBe("PRE");
    expect(ref.current?.className).toContain("custom-tool");
    expect(ref.current?.style.maxWidth).toBe("400px");
    view.rerender(<ToolCall title="Read result" defaultOpen input={'<script>alert("hello")</script>'} output={<p>Formatted result</p>} />);
    expect(view.container.querySelector("script")).toBeNull();
    expect(screen.getByText('<script>alert("hello")</script>').tagName).toBe("PRE");
    expect(screen.getByText("Formatted result")).toBeTruthy();
  });

  it("announces state and error and has no axe violations", async () => {
    const { container } = render(<ToolCall title="Search documents" state="error" defaultOpen input="Contract dates" error="Search was unavailable" />);
    expect(screen.getByRole("status").textContent).toBe("Error");
    expect(screen.getByRole("alert").textContent).toBe("Search was unavailable");
    expect(await axe(container, { rules: { "color-contrast": { enabled: false } } })).toHaveNoViolations();
  });
});

describe("Confirmation", () => {
  it("supports keyboard rejection without confirming or submitting the surrounding form", async () => {
    const user = userEvent.setup();
    const confirm = vi.fn();
    const reject = vi.fn();
    const change = vi.fn();
    const submit = vi.fn((event: React.FormEvent) => event.preventDefault());
    const ref = React.createRef<HTMLElement>();
    render(<form onSubmit={submit}><Confirmation ref={ref} title="Share the draft?" onConfirm={confirm} onReject={reject} onStatusChange={change} className="custom-confirmation" style={{ maxWidth: 500 }}>The recipient can read this draft.</Confirmation></form>);
    expect(screen.getByRole("region", { name: "Share the draft?" })).toBe(ref.current);
    expect(ref.current?.className).toContain("custom-confirmation");
    expect(ref.current?.style.maxWidth).toBe("500px");
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Confirm" }));
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Reject" }));
    await user.keyboard(" ");
    expect(reject).toHaveBeenCalledOnce();
    expect(confirm).not.toHaveBeenCalled();
    expect(submit).not.toHaveBeenCalled();
    expect(change).toHaveBeenCalledExactlyOnceWith("rejected");
    expect(screen.getByRole("status").textContent).toBe("Rejected");
  });

  it("locks duplicate submissions until approval has been successfully recorded", async () => {
    let resolve!: () => void;
    const confirm = vi.fn(() => new Promise<void>((done) => { resolve = done; }));
    const change = vi.fn();
    render(<Confirmation title="Update the draft?" onConfirm={confirm} onStatusChange={change} />);
    const button = screen.getByRole("button", { name: "Confirm" });
    act(() => { fireEvent.click(button); fireEvent.click(button); fireEvent.click(screen.getByRole("button", { name: "Reject" })); });
    expect(confirm).toHaveBeenCalledOnce();
    expect(change).not.toHaveBeenCalled();
    expect(screen.getByRole("region").getAttribute("aria-busy")).toBe("true");
    expect(screen.getByRole("status").textContent).toBe("Recording decision…");
    await act(async () => resolve());
    expect(change).toHaveBeenCalledExactlyOnceWith("accepted");
    expect(screen.getByRole("status").textContent).toBe("Approval recorded");
    expect((button as HTMLButtonElement).disabled).toBe(true);
  });

  it("keeps approval pending after failure and lets the keyboard retry", async () => {
    const user = userEvent.setup();
    const confirm = vi.fn().mockRejectedValueOnce(new Error("Could not save approval")).mockResolvedValueOnce(undefined);
    const change = vi.fn();
    render(<Confirmation title="Approve the change?" onConfirm={confirm} onStatusChange={change} />);
    await user.tab();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("alert").textContent).toBe("Could not save approval");
    expect(screen.getByRole("region").getAttribute("data-status")).toBe("pending");
    expect(change).not.toHaveBeenCalled();
    screen.getByRole("button", { name: "Try again" }).focus();
    await user.keyboard("{Enter}");
    expect(confirm).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByRole("status").textContent).toBe("Approval recorded");
  });

  it("allows retrying a rejected decision without calling onConfirm", async () => {
    const user = userEvent.setup();
    const confirm = vi.fn();
    const reject = vi.fn().mockRejectedValueOnce("offline").mockResolvedValueOnce(undefined);
    render(<Confirmation title="Apply the suggestion?" onConfirm={confirm} onReject={reject} />);
    await user.click(screen.getByRole("button", { name: "Reject" }));
    expect(screen.getByRole("alert").textContent).toBe("Could not record your decision. Try again.");
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(reject).toHaveBeenCalledTimes(2);
    expect(confirm).not.toHaveBeenCalled();
    expect(screen.getByRole("status").textContent).toBe("Rejected");
  });

  it("leaves controlled status to the application and ignores stale async completions", async () => {
    const user = userEvent.setup();
    let resolve!: () => void;
    const confirm = vi.fn(() => new Promise<void>((done) => { resolve = done; }));
    const change = vi.fn();
    const view = render(<Confirmation title="Use the result?" status="pending" onConfirm={confirm} onStatusChange={change} />);
    await user.click(screen.getByRole("button", { name: "Confirm" }));
    view.rerender(<Confirmation title="Use the result?" status="rejected" onConfirm={confirm} onStatusChange={change} />);
    await act(async () => resolve());
    expect(change).not.toHaveBeenCalled();
    expect(screen.getByRole("status").textContent).toBe("Rejected");
    view.rerender(<Confirmation title="Use the result?" status="pending" onConfirm={confirm} onStatusChange={change} />);
    await user.click(screen.getByRole("button", { name: "Confirm" }));
    await act(async () => resolve());
    expect(change).toHaveBeenCalledExactlyOnceWith("accepted");
    expect(screen.getByRole("region").getAttribute("data-status")).toBe("pending");
    expect(screen.getByRole("status").textContent).toBe("Decision recorded; waiting for update");
    expect((screen.getByRole("button", { name: "Confirm" }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    fireEvent.click(screen.getByRole("button", { name: "Reject" }));
    expect(confirm).toHaveBeenCalledTimes(2);
    expect(change).toHaveBeenCalledOnce();
    view.rerender(<Confirmation title="Use the result?" status="accepted" onConfirm={confirm} onStatusChange={change} />);
    expect(screen.getByRole("status").textContent).toBe("Approval recorded");
  });

  it("does not report completion after unmount", async () => {
    let resolve!: () => void;
    const change = vi.fn();
    const view = render(<Confirmation title="Approve?" onConfirm={() => new Promise<void>((done) => { resolve = done; })} onStatusChange={change} />);
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    view.unmount();
    await act(async () => resolve());
    expect(change).not.toHaveBeenCalled();
  });

  it("has no axe violations while awaiting a decision or reporting an error", async () => {
    const user = userEvent.setup();
    const { container } = render(<Confirmation title="Send the document?" onConfirm={() => { throw new Error("Connection lost"); }}>The document will be shared with your team.</Confirmation>);
    expect(await axe(container, { rules: { "color-contrast": { enabled: false } } })).toHaveNoViolations();
    await user.click(screen.getByRole("button", { name: "Confirm" }));
    expect(await axe(container, { rules: { "color-contrast": { enabled: false } } })).toHaveNoViolations();
  });
});
