import * as React from "react";
import { renderToString } from "react-dom/server";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MessageComposer } from "../src/components/message-composer";

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

function measureDraft() {
  let width = 400;
  const computedStyle = window.getComputedStyle.bind(window);
  vi.spyOn(window, "getComputedStyle").mockImplementation((element, pseudo) => element instanceof HTMLTextAreaElement
    ? Object.assign(computedStyle(element), { lineHeight: "22px", fontSize: "16px", paddingTop: "11px", paddingBottom: "11px", borderTopWidth: "0px", borderBottomWidth: "0px", minHeight: "44px" })
    : computedStyle(element, pseudo));
  vi.spyOn(HTMLTextAreaElement.prototype, "clientWidth", "get").mockImplementation(() => width);
  vi.spyOn(HTMLTextAreaElement.prototype, "scrollHeight", "get").mockImplementation(function (this: HTMLTextAreaElement) {
    const lines = this.value.split("\n").reduce((count, line) => count + Math.max(1, Math.ceil(line.length / (width / 10))), 0);
    return lines * 22 + 22;
  });
  return { setWidth: (next: number) => { width = next; } };
}

describe("Compact MessageComposer", () => {
  it("starts on one line, grows for wrapping and newlines, caps, and shrinks when cleared", () => {
    measureDraft();
    render(<MessageComposer compact maxRows={3} onSend={() => {}} />);
    const draft = screen.getByRole<HTMLTextAreaElement>("textbox", { name: "Message" });
    expect(draft.rows).toBe(1);
    expect(draft.style.height).toBe("44px");
    fireEvent.change(draft, { target: { value: "A".repeat(60) } });
    expect(draft.style.height).toBe("66px");
    fireEvent.change(draft, { target: { value: "One\nTwo\nThree\nFour" } });
    expect(draft.style.height).toBe("88px");
    expect(draft.style.overflowY).toBe("auto");
    fireEvent.change(draft, { target: { value: "" } });
    expect(draft.style.height).toBe("44px");
    expect(draft.style.overflowY).toBe("hidden");
  });

  it("remeasures controlled drafts and width changes without reacting to its own height changes", () => {
    const measurement = measureDraft();
    let notify!: () => void;
    const disconnect = vi.fn();
    vi.stubGlobal("ResizeObserver", class {
      constructor(callback: () => void) { notify = callback; }
      observe() {}
      disconnect = disconnect;
    });
    const { rerender, unmount } = render(<MessageComposer compact value="Short" onSend={() => {}} />);
    const draft = screen.getByRole<HTMLTextAreaElement>("textbox");
    rerender(<MessageComposer compact value={"A".repeat(60)} onSend={() => {}} />);
    expect(draft.style.height).toBe("66px");
    const measuredBefore = vi.mocked(window.getComputedStyle).mock.calls.length;
    act(() => notify());
    expect(vi.mocked(window.getComputedStyle).mock.calls.length).toBe(measuredBefore);
    measurement.setWidth(200);
    act(() => notify());
    expect(draft.style.height).toBe("88px");
    unmount();
    expect(disconnect).toHaveBeenCalledOnce();
  });

  it("uses named icon actions, preserves IME composition, and clears successful drafts", async () => {
    measureDraft();
    const user = userEvent.setup();
    const send = vi.fn();
    const ref = React.createRef<HTMLTextAreaElement>();
    render(<MessageComposer ref={ref} compact sendOnEnter defaultValue={"Hello\nthere"} onSend={send} />);
    const draft = screen.getByRole<HTMLTextAreaElement>("textbox");
    const sendButton = screen.getByRole("button", { name: "Send" });
    expect(sendButton.textContent).toBe("");
    expect(sendButton.title).toBe("Send");
    expect(ref.current).toBe(draft);
    fireEvent.keyDown(draft, { key: "Enter", isComposing: true });
    fireEvent.keyDown(draft, { key: "Enter", shiftKey: true });
    expect(send).not.toHaveBeenCalled();
    sendButton.focus();
    await user.keyboard("{Enter}");
    await waitFor(() => expect(draft.value).toBe(""));
    expect(send).toHaveBeenCalledWith({ text: "Hello\nthere", files: [] });
    expect(draft.style.height).toBe("44px");
  });

  it("keeps errors visible and retains the draft and attachments for retry", async () => {
    const user = userEvent.setup();
    const send = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValue(undefined);
    render(<MessageComposer compact allowAttachments defaultValue="Review this" onSend={send} />);
    const attachment = new File(["Proof"], "proof.txt", { type: "text/plain" });
    await user.upload(screen.getByLabelText("Attach files", { selector: "input" }), attachment);
    await user.click(screen.getByRole("button", { name: "Send" }));
    const status = screen.getByRole("status");
    expect(status.textContent).toContain("draft is still here");
    expect(status.className).not.toContain("rs-message-composer-sr-only");
    expect(screen.getByRole<HTMLTextAreaElement>("textbox").value).toBe("Review this");
    expect(screen.getByRole("list", { name: "Attachments" }).textContent).toContain("proof.txt");
    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(send).toHaveBeenLastCalledWith({ text: "Review this", files: [attachment] });
    expect(screen.queryByRole("list", { name: "Attachments" })).toBeNull();
    expect(status.className).toContain("rs-message-composer-sr-only");
  });

  it("provides an icon-only stop action during generation", async () => {
    const user = userEvent.setup();
    const stop = vi.fn();
    render(<MessageComposer compact generating onStop={stop} onSend={() => {}} />);
    const button = screen.getByRole("button", { name: "Stop response" });
    expect(button.textContent).toBe("");
    expect(button.title).toBe("Stop response");
    await user.click(button);
    expect(stop).toHaveBeenCalledOnce();
    expect(screen.getByRole<HTMLTextAreaElement>("textbox").disabled).toBe(false);
  });

  it("renders on the server and has no axe violations", async () => {
    expect(renderToString(<MessageComposer compact onSend={() => {}} />)).toContain('rows="1"');
    const { container } = render(<MessageComposer compact allowAttachments onSend={() => {}} />);
    expect(await axe(container, { rules: { "color-contrast": { enabled: false } } })).toHaveNoViolations();
  });
});
