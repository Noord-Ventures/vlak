import * as React from "react";
import { renderToString } from "react-dom/server";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MessageComposer, useMessageComposer, type MessageComposerState } from "../src/components/message-composer";

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


describe("MessageComposer composition", () => {
  it("rearranges controls while custom tools share the draft and validated attachment state", async () => {
    const user = userEvent.setup();
    const send = vi.fn();
    const reject = vi.fn();
    const first = new File(["a"], "first.txt", { type: "text/plain" });
    const second = new File(["b"], "second.txt", { type: "text/plain" });
    const wrong = new File(["c"], "third.pdf", { type: "application/pdf" });
    function Tools() {
      const composer = useMessageComposer();
      return <><button type="button" onClick={() => { composer.setValue("Review the brief"); composer.addFiles([first]); composer.addFiles([second, wrong]); composer.focus(); }}>Use brief</button><button type="button" disabled={!composer.canAttach} onClick={composer.openFileDialog}>Choose a file</button><span data-testid="selection">{composer.files.length} selected</span></>;
    }
    const { container } = render(<MessageComposer compact sendOnEnter allowAttachments accept=".txt" maxFiles={2} onAttachmentError={reject} onSend={send} tools={<Tools />} renderLayout={parts => <><div>{parts.tools}</div>{parts.attachments}<div data-testid="custom-draft">{parts.input}</div><footer>{parts.submit}</footer></>} />);
    await user.click(screen.getByRole("button", { name: "Use brief" }));
    expect(screen.getByTestId("selection").textContent).toBe("2 selected");
    expect(reject.mock.lastCall?.[0][0].code).toBe("accept");
    expect(screen.getByRole("alert").textContent).toContain("third.pdf");
    expect(document.activeElement).toBe(screen.getByRole("textbox"));
    expect(screen.getAllByRole("textbox")).toHaveLength(1);
    const picker = screen.getByLabelText("Attach files", { selector: "input" });
    const click = vi.spyOn(picker, "click");
    await user.click(screen.getByRole("button", { name: "Choose a file" }));
    expect(click).toHaveBeenCalledOnce();
    screen.getByRole("textbox").focus();
    await user.keyboard("{Enter}");
    await waitFor(() => expect(screen.getByRole<HTMLTextAreaElement>("textbox").value).toBe(""));
    expect(send).toHaveBeenCalledWith({ text: "Review the brief", files: [first, second] });
    expect(screen.getByTestId("selection").textContent).toBe("0 selected");
    expect(await axe(container, { rules: { "color-contrast": { enabled: false } } })).toHaveNoViolations();
  });

  it("merges native textarea attributes, refs, descriptions and cancelable keyboard handlers", async () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    const fieldRef = React.createRef<HTMLTextAreaElement>();
    const send = vi.fn();
    const key = vi.fn((event: React.KeyboardEvent<HTMLTextAreaElement>) => event.preventDefault());
    const changed = vi.fn();
    const { rerender } = render(<><p id="extra-help">Additional context</p><MessageComposer ref={ref} compact sendOnEnter defaultValue="Draft" onSend={send} textareaProps={{ ref: fieldRef, name: "prompt", className: "custom-area", style: { letterSpacing: "1px" }, "aria-describedby": "extra-help", onKeyDown: key, onChange: changed }} /></>);
    const area = screen.getByRole<HTMLTextAreaElement>("textbox");
    expect(ref.current).toBe(area);
    expect(fieldRef.current).toBe(area);
    expect(area.name).toBe("prompt");
    expect(area.classList.contains("rs-message-composer-area")).toBe(true);
    expect(area.classList.contains("custom-area")).toBe(true);
    expect(area.style.letterSpacing).toBe("1px");
    expect(area.getAttribute("aria-describedby")?.split(" ")).toHaveLength(2);
    fireEvent.change(area, { target: { value: "Updated" } });
    expect(changed).toHaveBeenCalledOnce();
    expect(area.value).toBe("Updated");
    fireEvent.keyDown(area, { key: "Enter" });
    expect(key).toHaveBeenCalledOnce();
    expect(send).not.toHaveBeenCalled();
    rerender(<MessageComposer compact sendOnEnter defaultValue="Draft" onSend={send} />);
    const next = screen.getByRole("textbox");
    fireEvent.compositionStart(next);
    fireEvent.keyDown(next, { key: "Enter", isComposing: false });
    expect(send).not.toHaveBeenCalled();
    fireEvent.compositionEnd(next);
    fireEvent.keyDown(next, { key: "Enter", keyCode: 229 });
    expect(send).not.toHaveBeenCalled();
    fireEvent.keyDown(next, { key: "Enter" });
    await waitFor(() => expect(send).toHaveBeenCalledOnce());
  });

  it("guards custom commands during submission and keeps failure feedback outside the custom layout", async () => {
    const file = new File(["brief"], "brief.txt");
    let controller!: MessageComposerState;
    let fail!: (error: Error) => void;
    const send = vi.fn(() => new Promise<void>((_resolve, reject) => { fail = reject; }));
    function Observer() { controller = useMessageComposer(); return null; }
    render(<MessageComposer compact defaultValue="Keep this" allowAttachments defaultFiles={[file]} onSend={send} renderLayout={parts => <>{parts.input}{parts.submit}<Observer /></>} />);
    let sent!: Promise<boolean>;
    act(() => { sent = controller.submit(); });
    expect(controller.pending).toBe(true);
    expect(controller.canSubmit).toBe(false);
    act(() => { controller.setValue("Lost draft"); controller.clearAttachments(); controller.addFiles([new File(["new"], "new.txt")]); });
    expect(controller.value).toBe("Keep this");
    expect(controller.files).toEqual([file]);
    expect(await controller.submit()).toBe(false);
    await act(async () => { fail(new Error("offline")); expect(await sent).toBe(false); });
    expect(send).toHaveBeenCalledOnce();
    expect(controller.failed).toBe(true);
    const feedback = screen.getByRole("status");
    expect(feedback.textContent).toContain("draft is still here");
    expect(feedback.classList.contains("rs-message-composer-sr-only")).toBe(false);
    expect(screen.getByRole<HTMLTextAreaElement>("textbox").value).toBe("Keep this");
  });

  it("honors controlled state and native validity from custom submit commands", async () => {
    let controller!: MessageComposerState;
    function Observer() { controller = useMessageComposer(); return null; }
    const changed = vi.fn();
    const send = vi.fn();
    const invalid = vi.fn();
    const file = new File(["brief"], "brief.txt");
    render(<MessageComposer compact value="" onValueChange={changed} files={[file]} allowAttachments onSend={send} textareaProps={{ required: true, onInvalid: invalid }}><Observer /></MessageComposer>);
    act(() => controller.setValue("Requested draft"));
    expect(changed).toHaveBeenCalledWith("Requested draft");
    expect(controller.value).toBe("");
    expect(await controller.submit()).toBe(false);
    expect(invalid).toHaveBeenCalledOnce();
    expect(send).not.toHaveBeenCalled();
  });
});
