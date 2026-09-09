import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MessageComposer } from "../src/components/message-composer";

const originalMediaDevices = Object.getOwnPropertyDescriptor(navigator, "mediaDevices");
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); if (originalMediaDevices) Object.defineProperty(navigator, "mediaDevices", originalMediaDevices); else Reflect.deleteProperty(navigator, "mediaDevices"); });

describe("MessageComposer attachments", () => {
  it("uses the same type, size, and count limits for picker, paste, and drop", async () => {
    const user = userEvent.setup();
    const send = vi.fn();
    const reject = vi.fn();
    render(<MessageComposer compact allowAttachments accept=".txt" maxFileSize={5} maxFiles={2} onAttachmentError={reject} onSend={send} />);
    const first = new File(["a"], "first.txt", { type: "text/plain" });
    const second = new File(["b"], "second.txt", { type: "text/plain" });
    const wrong = new File(["pdf"], "brief.pdf", { type: "application/pdf" });
    const large = new File(["too long"], "large.txt", { type: "text/plain" });
    fireEvent.drop(screen.getByRole("form", { name: "Message" }), { dataTransfer: { files: [wrong, large, first], types: ["Files"] } });
    expect(reject.mock.calls[0]![0].map((item: { code: string }) => item.code)).toEqual(["accept", "max_file_size"]);
    expect(screen.getByText("first.txt")).toBeTruthy();
    fireEvent.paste(screen.getByRole("textbox"), { clipboardData: { files: [second], getData: () => "" } });
    expect(screen.getByText("second.txt")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Attach files", { selector: "input" }), { target: { files: [new File(["c"], "third.txt")] } });
    expect(reject.mock.lastCall?.[0][0].code).toBe("max_files");
    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(send).toHaveBeenCalledWith({ text: "", files: [first, second] });
    await waitFor(() => expect(screen.queryByRole("list", { name: "Attachments" })).toBeNull());
  });

  it("supports lifted files and preserves external draft changes during an asynchronous send", async () => {
    const user = userEvent.setup();
    let finish: (() => void) | undefined;
    const send = vi.fn(() => new Promise<void>((resolve) => { finish = resolve; }));
    const changeFiles = vi.fn();
    const changeText = vi.fn();
    const first = new File(["first"], "first.txt");
    const second = new File(["second"], "second.txt");
    const { rerender } = render(<MessageComposer compact allowAttachments value="Original" files={[first]} onFilesChange={changeFiles} onValueChange={changeText} onSend={send} />);
    await user.click(screen.getByRole("button", { name: "Send" }));
    rerender(<MessageComposer compact allowAttachments value="Next draft" files={[first, second]} onFilesChange={changeFiles} onValueChange={changeText} onSend={send} />);
    finish?.();
    await waitFor(() => expect(changeFiles).toHaveBeenCalledWith([second]));
    expect(changeText).not.toHaveBeenCalled();
    expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe("Next draft");
  });

  it("uses global drop only when opted in, respects cancellation, and exposes composition slots", () => {
    const changeFiles = vi.fn();
    const file = new File(["brief"], "brief.txt");
    const { rerender } = render(<MessageComposer compact allowAttachments onFilesChange={changeFiles} onSend={() => {}} tools={<button type="button">Choose model</button>} />);
    fireEvent.drop(document.body, { dataTransfer: { files: [file], types: ["Files"] } });
    expect(changeFiles).not.toHaveBeenCalled();
    rerender(<MessageComposer compact allowAttachments globalDrop onFilesChange={changeFiles} onSend={() => {}} tools={<button type="button">Choose model</button>} />);
    fireEvent.drop(document.body, { dataTransfer: { files: [file], types: ["Files"] } });
    expect(changeFiles).toHaveBeenCalledWith([file]);
    expect(screen.getByRole("button", { name: "Choose model" })).toBeTruthy();
    rerender(<MessageComposer compact allowAttachments onPaste={(event) => event.preventDefault()} onFilesChange={changeFiles} onSend={() => {}} />);
    changeFiles.mockClear();
    fireEvent.paste(screen.getByRole("textbox"), { clipboardData: { files: [new File(["new"], "new.txt")], getData: () => "" } });
    expect(changeFiles).not.toHaveBeenCalled();
  });

  it("captures a screenshot only after activation and stops the display tracks", async () => {
    const user = userEvent.setup();
    const stop = vi.fn();
    const track = { stop, readyState: "live" };
    const getDisplayMedia = vi.fn().mockResolvedValue({ getTracks: () => [track], getVideoTracks: () => [track] });
    Object.defineProperty(navigator, "mediaDevices", { configurable: true, value: { getDisplayMedia } });
    vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (this: HTMLVideoElement) {
      Object.defineProperty(this, "videoWidth", { value: 640 });
      Object.defineProperty(this, "videoHeight", { value: 480 });
      queueMicrotask(() => this.dispatchEvent(new Event("loadeddata")));
      return Promise.resolve();
    });
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({ drawImage: vi.fn() } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation((callback) => callback(new Blob(["image"], { type: "image/png" })));
    const send = vi.fn();
    render(<MessageComposer compact allowAttachments allowScreenshot onSend={send} />);
    expect(getDisplayMedia).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Attach screenshot" }));
    await screen.findByText("screenshot.png");
    expect(stop).toHaveBeenCalledOnce();
    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(send.mock.calls[0]![0].files[0].type).toBe("image/png");
  });

  it("stops a screen selection that resolves after the composer unmounts", async () => {
    const user = userEvent.setup();
    let finish: ((stream: unknown) => void) | undefined;
    const getDisplayMedia = vi.fn(() => new Promise((resolve) => { finish = resolve; }));
    Object.defineProperty(navigator, "mediaDevices", { configurable: true, value: { getDisplayMedia } });
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
    const stop = vi.fn();
    const track = { stop, readyState: "live" };
    const { unmount } = render(<MessageComposer compact allowAttachments allowScreenshot onSend={() => {}} />);
    await user.click(screen.getByRole("button", { name: "Attach screenshot" }));
    unmount();
    finish?.({ getTracks: () => [track], getVideoTracks: () => [track] });
    await waitFor(() => expect(stop).toHaveBeenCalled());
  });
});
