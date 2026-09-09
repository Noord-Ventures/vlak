import * as React from "react";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Response, useResponse } from "../src/components/response";
import { Reasoning } from "../src/components/reasoning";

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

async function expectNoViolations(element: Element) {
  const results = await axe(element, { rules: { "color-contrast": { enabled: false } } });
  (expect(results) as unknown as { toHaveNoViolations(): void }).toHaveNoViolations();
}

describe("Response", () => {
  it("keeps changing content outside live regions and preserves speaker identity, markup, and refs", async () => {
    const ref = React.createRef<HTMLElement>();
    const { container, rerender } = render(<Response ref={ref} status="streaming" className="custom" style={{ marginTop: 8 }} data-message="42"><p>The <strong>first</strong> clause.</p></Response>);
    const article = screen.getByRole("article", { name: "Assistant" });
    expect(ref.current).toBe(article);
    expect(article.classList.contains("custom")).toBe(true);
    expect(article.style.marginTop).toBe("8px");
    expect(article.dataset.message).toBe("42");
    const status = within(article).getByRole("status");
    expect(status.textContent).toBe("Responding");
    expect(screen.getByText("first").closest("[aria-live]")).toBeNull();
    const changes = vi.fn();
    const observer = new MutationObserver(changes);
    observer.observe(status, { childList: true, characterData: true, subtree: true });
    rerender(<Response ref={ref} status="streaming"><p>The <strong>second</strong> clause.</p></Response>);
    await Promise.resolve();
    expect(changes).not.toHaveBeenCalled();
    observer.disconnect();
    rerender(<Response from="user">{"<script>not executable</script>"}</Response>);
    expect(screen.getByRole("article", { name: "You" }).dataset.from).toBe("user");
    expect(container.querySelector("script")).toBeNull();
    expect(screen.queryByRole("button", { name: "Copy response" })).toBeNull();
    await expectNoViolations(container);
  });

  it("copies only explicit text by keyboard and waits for clipboard success", async () => {
    const user = userEvent.setup();
    let resolveCopy: (() => void) | undefined;
    const write = vi.spyOn(navigator.clipboard, "writeText").mockImplementation(() => new Promise<void>((resolve) => { resolveCopy = resolve; }));
    const { container } = render(<Response copyText="Plain copy text"><strong>Rich content</strong></Response>);
    await user.tab();
    const copy = screen.getByRole("button", { name: "Copy response" });
    expect(document.activeElement).toBe(copy);
    await user.keyboard("{Enter}");
    expect(write).toHaveBeenCalledWith("Plain copy text");
    expect((copy as HTMLButtonElement).disabled).toBe(true);
    expect(screen.queryByText("Copied")).toBeNull();
    resolveCopy?.();
    await screen.findByText("Copied");
    expect((copy as HTMLButtonElement).disabled).toBe(false);
    await expectNoViolations(container);
  });

  it("reports clipboard failure, allows retry, and ignores an old write after content changes", async () => {
    const user = userEvent.setup();
    const write = vi.spyOn(navigator.clipboard, "writeText").mockRejectedValueOnce(new Error("Denied"));
    const { rerender } = render(<Response copyText="Old">Old</Response>);
    await user.click(screen.getByRole("button", { name: "Copy response" }));
    await screen.findByText("Could not copy. Try again.");
    expect(screen.queryByText("Copied")).toBeNull();
    let resolveCopy: (() => void) | undefined;
    write.mockImplementationOnce(() => new Promise<void>((resolve) => { resolveCopy = resolve; }));
    await user.click(screen.getByRole("button", { name: "Copy response" }));
    rerender(<Response copyText="New">New</Response>);
    resolveCopy?.();
    await waitFor(() => expect((screen.getByRole("button", { name: "Copy response" }) as HTMLButtonElement).disabled).toBe(false));
    expect(screen.queryByText("Copied")).toBeNull();
    write.mockResolvedValueOnce();
    await user.click(screen.getByRole("button", { name: "Copy response" }));
    await screen.findByText("Copied");
    expect(write).toHaveBeenLastCalledWith("New");
  });

  it("exposes errors and stopped state without marking partial content busy or live", () => {
    const retry = vi.fn();
    const { rerender } = render(<Response status="error" errorMessage="Connection interrupted" actions={<button type="button" onClick={retry}>Retry</button>}>Partial answer</Response>);
    expect(screen.getByRole("status").textContent).toBe("Response failed");
    expect(screen.getByText("Connection interrupted")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(retry).toHaveBeenCalledOnce();
    rerender(<Response status="stopped">Partial answer</Response>);
    expect(screen.getByRole("status").textContent).toBe("Stopped");
    expect(screen.getByText("Partial answer").closest("[aria-busy], [aria-live]")).toBeNull();
  });
});

describe("Reasoning", () => {
  it("uses native disclosure behavior and retains the reader's choice when status changes", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const ref = React.createRef<HTMLDetailsElement>();
    const { container, rerender } = render(<Reasoning ref={ref} title="Review summary" status="streaming" onOpenChange={onOpenChange}><p>Checked the notice period.</p></Reasoning>);
    const details = container.querySelector("details")!;
    const summary = container.querySelector("summary")!;
    expect(ref.current).toBe(details);
    await user.tab();
    expect(document.activeElement).toBe(summary);
    // jsdom supports native summary clicks; Enter and Space need a real browser.
    await user.click(summary);
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(true));
    expect(details.open).toBe(true);
    rerender(<Reasoning ref={ref} title="Review summary" status="complete" onOpenChange={onOpenChange}><p>Checked the notice period.</p></Reasoning>);
    expect(details.open).toBe(true);
    await user.click(summary);
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    rerender(<Reasoning ref={ref} title="Review summary" status="streaming" onOpenChange={onOpenChange}><p>Reading another clause.</p></Reasoning>);
    expect(details.open).toBe(false);
    await expectNoViolations(container);
  });

  it("requests a controlled change without changing the disclosure until accepted", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onToggle = vi.fn();
    const { container, rerender } = render(<Reasoning open={false} onOpenChange={onOpenChange} onToggle={onToggle}>Summary</Reasoning>);
    const details = container.querySelector("details")!;
    const summary = container.querySelector("summary")!;
    await user.click(summary);
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    expect(details.open).toBe(false);
    rerender(<Reasoning open onOpenChange={onOpenChange} onToggle={onToggle}>Summary</Reasoning>);
    expect(details.open).toBe(true);
    await waitFor(() => expect(onToggle).toHaveBeenCalled());
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    await user.click(summary);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(details.open).toBe(true);
    await expectNoViolations(container);
  });

  it("keeps defaultOpen initial and separates the status from evolving summary content", async () => {
    const { container, rerender } = render(<Reasoning defaultOpen title="Review summary" status="streaming" className="custom" style={{ marginTop: 8 }} data-review="42"><p>First step</p></Reasoning>);
    const details = container.querySelector("details")!;
    expect(details.open).toBe(true);
    expect(details.classList.contains("custom")).toBe(true);
    expect(details.style.marginTop).toBe("8px");
    expect(details.dataset.review).toBe("42");
    expect(screen.getByRole("status").textContent).toBe("In progress");
    expect(screen.getByText("First step").closest("[aria-live]")).toBeNull();
    rerender(<Reasoning defaultOpen={false} title="Review summary" status="complete"><p>Second step</p></Reasoning>);
    expect(details.open).toBe(true);
    expect(screen.getByRole("status").textContent).toBe("Complete");
    await expectNoViolations(container);
  });
});


describe("Response composition", () => {
  it("rearranges avatar, content and actions while descendants receive status and naming stays valid", async () => {
    function ContextAction() {
      const response = useResponse();
      return <button type="button" disabled={response.status === "streaming"}>{response.from === "assistant" ? "Retry reply" : "Edit message"}</button>;
    }
    const layout = (parts: import("../src/components/response").ResponseParts) => <>{parts.avatar}<div>{parts.status}{parts.content}{parts.error}</div><footer>{parts.actions}</footer></>;
    const { container, rerender } = render(<Response author="Research assistant" avatar={<span aria-hidden="true">●</span>} status="streaming" renderLayout={layout} actions={<ContextAction />}>Partial answer</Response>);
    const article = screen.getByRole("article", { name: "Research assistant" });
    expect(article.hasAttribute("aria-labelledby")).toBe(false);
    expect(container.querySelector(".rs-response-avatar")).toBeTruthy();
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "Retry reply" }).disabled).toBe(true);
    expect(screen.getByText("Partial answer").closest("[aria-live], [aria-busy]")).toBeNull();
    rerender(<Response from="user" renderLayout={layout} actions={<ContextAction />}>Updated request</Response>);
    expect(screen.getByRole("article", { name: "You" }).classList.contains("rs-response-user")).toBe(true);
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "Edit message" }).disabled).toBe(false);
    expect(screen.getByRole("status").textContent).toBe("Complete");
    await expectNoViolations(container);
  });

  it("keeps default avatar identity named and copies explicit text in a custom footer", async () => {
    const user = userEvent.setup();
    const write = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    const { rerender } = render(<Response avatar={<span aria-hidden="true">●</span>} author="Assistant">Answer</Response>);
    expect(screen.getByRole("article", { name: "Assistant" }).querySelector(".rs-response-identity")).toBeTruthy();
    rerender(<Response aria-label="First answer" copyText="Exact answer" renderLayout={parts => <>{parts.content}{parts.status}<footer>{parts.actions}</footer></>}>Answer</Response>);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Copy response" }));
    await user.keyboard("{Enter}");
    await screen.findByText("Copied");
    expect(write).toHaveBeenCalledWith("Exact answer");
    expect(screen.getByRole("article", { name: "First answer" })).toBeTruthy();
  });
});
