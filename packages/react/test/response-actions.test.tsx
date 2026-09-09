import * as React from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ResponseActions } from "../src/components/response-actions";
import { vlak } from "../src/tokens.stylex";

const originalShare = Object.getOwnPropertyDescriptor(navigator, "share");
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  if (originalShare) Object.defineProperty(navigator, "share", originalShare);
  else Reflect.deleteProperty(navigator, "share");
});

function mockSpeech() {
  class Utterance {
    onend: (() => void) | null = null;
    onerror: (() => void) | null = null;
    constructor(public text: string) {}
  }
  const speech = {
    speaking: false,
    pending: false,
    speak: vi.fn((_utterance: Utterance) => { speech.speaking = true; }),
    cancel: vi.fn(() => { speech.speaking = false; speech.pending = false; }),
  };
  vi.stubGlobal("speechSynthesis", speech);
  vi.stubGlobal("SpeechSynthesisUtterance", Utterance);
  return speech;
}

function installShare(share: (data: ShareData) => Promise<void>) {
  Object.defineProperty(navigator, "share", { configurable: true, value: share });
}

describe("ResponseActions", () => {
  it("names every icon control, copies by keyboard, and forwards native attributes and refs", async () => {
    const user = userEvent.setup();
    const copy = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    const ref = React.createRef<HTMLDivElement>();
    const { container } = render(<ResponseActions text="An answer" ref={ref} className="custom" style={{ marginTop: 8 }} data-message="42" />);
    const group = screen.getByRole("group", { name: "Response actions" });
    expect(ref.current).toBe(group);
    expect(group.classList.contains("custom")).toBe(true);
    expect(group.style.marginTop).toBe("8px");
    expect(group.dataset.message).toBe("42");
    const buttons = screen.getAllByRole("button");
    expect(buttons.map((button) => button.getAttribute("aria-label"))).toEqual(["Copy response", "Read aloud", "Rate response", "Share response"]);
    expect(buttons.every((button) => button.textContent === "")).toBe(true);
    expect(buttons.every((button) => button.classList.contains("rs-btn-subtle") && button.classList.contains("rs-btn-icon"))).toBe(true);
    expect((buttons[1] as HTMLButtonElement).disabled).toBe(true);
    expect(buttons[1]!.title).toBe("Read aloud is unavailable in this browser");
    await user.tab();
    expect(document.activeElement).toBe(buttons[0]);
    await user.keyboard("{Enter}");
    expect(copy).toHaveBeenCalledWith("An answer");
    await screen.findByText("Copied");
    const result = await axe(container, { rules: { "color-contrast": { enabled: false } } });
    (expect(result) as unknown as { toHaveNoViolations(): void }).toHaveNoViolations();
  });

  it("keeps failed copy retryable, suppresses duplicates, and ignores stale results", async () => {
    const user = userEvent.setup();
    const copy = vi.spyOn(navigator.clipboard, "writeText").mockRejectedValueOnce(new Error("Denied"));
    const { rerender } = render(<ResponseActions text="Old answer" />);
    await user.click(screen.getByRole("button", { name: "Copy response" }));
    await screen.findByText("Could not copy. Try again.");
    let resolve: (() => void) | undefined;
    copy.mockImplementationOnce(() => new Promise<void>((done) => { resolve = done; }));
    const button = screen.getByRole("button", { name: "Copy response" });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(copy).toHaveBeenCalledTimes(2);
    expect((button as HTMLButtonElement).disabled).toBe(true);
    rerender(<ResponseActions text="New answer" />);
    await act(async () => { resolve?.(); });
    expect(screen.queryByText("Copied")).toBeNull();
    expect((button as HTMLButtonElement).disabled).toBe(false);
    copy.mockResolvedValueOnce();
    await user.click(button);
    await screen.findByText("Copied");
    expect(copy).toHaveBeenLastCalledWith("New answer");
  });

  it("retains feedback while saving or on failure, then toggles mutually exclusive choices", async () => {
    const user = userEvent.setup();
    let reject: ((reason: Error) => void) | undefined;
    const onFeedback = vi.fn().mockImplementationOnce(() => new Promise<void>((_resolve, fail) => { reject = fail; }));
    render(<ResponseActions text="An answer" defaultFeedback="positive" onFeedback={onFeedback} />);
    const trigger = screen.getByRole("button", { name: "Rate response" });
    expect(trigger.classList.contains("rs-response-actions-selected")).toBe(true);
    expect(getComputedStyle(trigger).backgroundColor).toBe(vlak.tableAlt);
    await user.click(trigger);
    expect(screen.getByRole("menuitemcheckbox", { name: "Helpful response" }).getAttribute("aria-checked")).toBe("true");
    fireEvent.click(screen.getByRole("menuitemcheckbox", { name: "Unhelpful response" }));
    fireEvent.click(trigger);
    fireEvent.keyDown(trigger, { key: "Enter" });
    expect(onFeedback).toHaveBeenCalledExactlyOnceWith("negative");
    expect(trigger.dataset.feedback).toBe("positive");
    expect(trigger.getAttribute("aria-disabled")).toBe("true");
    expect(screen.queryByRole("menu")).toBeNull();
    expect(document.activeElement).toBe(trigger);
    await act(async () => { reject?.(new Error("Offline")); });
    await screen.findByText("Could not save feedback. Try again.");
    await user.click(trigger);
    expect(screen.getByRole("menuitemcheckbox", { name: "Helpful response" }).getAttribute("aria-checked")).toBe("true");
    onFeedback.mockResolvedValue(undefined);
    await user.click(screen.getByRole("menuitemcheckbox", { name: "Unhelpful response" }));
    await screen.findByText("Marked as unhelpful");
    await user.click(trigger);
    expect(screen.getByRole("menuitemcheckbox", { name: "Helpful response" }).getAttribute("aria-checked")).toBe("false");
    expect(screen.getByRole("menuitemcheckbox", { name: "Unhelpful response" }).getAttribute("aria-checked")).toBe("true");
    await user.click(screen.getByRole("menuitemcheckbox", { name: "Unhelpful response" }));
    await screen.findByText("Feedback cleared");
    expect(onFeedback).toHaveBeenLastCalledWith(null);
    expect(trigger.dataset.feedback).toBe("none");
  });

  it("leaves controlled feedback to its owner", async () => {
    const user = userEvent.setup();
    const onFeedback = vi.fn().mockResolvedValue(undefined);
    const { rerender } = render(<ResponseActions text="An answer" feedback={null} onFeedback={onFeedback} />);
    const trigger = screen.getByRole("button", { name: "Rate response" });
    await user.click(trigger);
    await user.click(screen.getByRole("menuitemcheckbox", { name: "Helpful response" }));
    await waitFor(() => expect(onFeedback).toHaveBeenCalledWith("positive"));
    expect(trigger.dataset.feedback).toBe("none");
    rerender(<ResponseActions text="An answer" feedback="positive" onFeedback={onFeedback} />);
    await user.click(trigger);
    expect(screen.getByRole("menuitemcheckbox", { name: "Helpful response" }).getAttribute("aria-checked")).toBe("true");
  });

  it("opens the feedback choices by keyboard, navigates, selects, and restores focus", async () => {
    const user = userEvent.setup();
    const onFeedback = vi.fn().mockResolvedValue(undefined);
    const { container } = render(<ResponseActions text="An answer" onFeedback={onFeedback} />);
    const trigger = screen.getByRole("button", { name: "Rate response" });
    trigger.focus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menu", { name: "Rate response" })).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByRole("menuitemcheckbox", { name: "Helpful response" }));
    await user.keyboard("{ArrowDown}{Enter}");
    await waitFor(() => expect(onFeedback).toHaveBeenCalledWith("negative"));
    expect(screen.queryByRole("menu")).toBeNull();
    expect(document.activeElement).toBe(trigger);
    await user.keyboard("{ArrowUp}");
    expect(document.activeElement).toBe(screen.getByRole("menuitemcheckbox", { name: "Unhelpful response" }));
    const result = await axe(container, { rules: { "color-contrast": { enabled: false } } });
    (expect(result) as unknown as { toHaveNoViolations(): void }).toHaveNoViolations();
    await user.keyboard("{Escape}");
    expect(document.activeElement).toBe(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    await user.keyboard(" ");
    await user.tab();
    expect(screen.queryByRole("menu")).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Share response" }));
  });

  it("dismisses feedback choices on outside interaction or when the response changes", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<><ResponseActions text="Old answer" /><button type="button">Outside</button></>);
    const trigger = screen.getByRole("button", { name: "Rate response" });
    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: "Outside" }));
    expect(screen.queryByRole("menu")).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Outside" }));
    await user.click(trigger);
    rerender(<><ResponseActions text="New answer" /><button type="button">Outside</button></>);
    expect(screen.queryByRole("menu")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("narrates the supplied text, toggles stop, and reports natural completion", async () => {
    const user = userEvent.setup();
    const speech = mockSpeech();
    const onReadingChange = vi.fn();
    render(<ResponseActions text="Read this answer" onReadingChange={onReadingChange} />);
    expect(speech.speak).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Read aloud" }));
    expect(speech.speak.mock.calls[0]![0].text).toBe("Read this answer");
    expect(onReadingChange).toHaveBeenLastCalledWith(true);
    await user.click(screen.getByRole("button", { name: "Stop reading" }));
    expect(speech.cancel).toHaveBeenCalledOnce();
    expect(onReadingChange).toHaveBeenLastCalledWith(false);
    await user.click(screen.getByRole("button", { name: "Read aloud" }));
    speech.speaking = false;
    act(() => { speech.speak.mock.calls[1]![0].onend?.(); });
    expect(screen.getByRole("button", { name: "Read aloud" })).toBeTruthy();
    expect(screen.getByRole("status").textContent).toBe("Reading finished");
    expect(onReadingChange.mock.calls.map(([value]) => value)).toEqual([true, false, true, false]);
  });

  it("cleans up owned narration on text change and unmount using the latest callback", async () => {
    const user = userEvent.setup();
    const speech = mockSpeech();
    const first = vi.fn();
    const latest = vi.fn();
    const { rerender, unmount } = render(<ResponseActions text="First answer" onReadingChange={first} />);
    await user.click(screen.getByRole("button", { name: "Read aloud" }));
    const oldUtterance = speech.speak.mock.calls[0]![0];
    rerender(<ResponseActions text="New answer" onReadingChange={latest} />);
    expect(speech.cancel).toHaveBeenCalledOnce();
    expect(latest).toHaveBeenLastCalledWith(false);
    expect(oldUtterance.onend).toBeNull();
    expect(oldUtterance.onerror).toBeNull();
    await user.click(screen.getByRole("button", { name: "Read aloud" }));
    unmount();
    expect(speech.cancel).toHaveBeenCalledTimes(2);
    expect(latest).toHaveBeenLastCalledWith(false);
  });

  it("does not interrupt or clear speech belonging to another application", async () => {
    const user = userEvent.setup();
    const speech = mockSpeech();
    speech.speaking = true;
    const { unmount } = render(<ResponseActions text="An answer" />);
    await user.click(screen.getByRole("button", { name: "Read aloud" }));
    expect(speech.speak).not.toHaveBeenCalled();
    expect(screen.getByRole("status").textContent).toContain("Another reading is in progress");
    unmount();
    expect(speech.cancel).not.toHaveBeenCalled();
  });

  it("resets narration on speech failure and leaves the action retryable", async () => {
    const user = userEvent.setup();
    const speech = mockSpeech();
    const onReadingChange = vi.fn();
    render(<ResponseActions text="An answer" onReadingChange={onReadingChange} />);
    await user.click(screen.getByRole("button", { name: "Read aloud" }));
    speech.speaking = false;
    act(() => { speech.speak.mock.calls[0]![0].onerror?.(); });
    expect(onReadingChange).toHaveBeenLastCalledWith(false);
    await screen.findByText("Could not read aloud. Try again.");
    await user.click(screen.getByRole("button", { name: "Read aloud" }));
    expect(speech.speak).toHaveBeenCalledTimes(2);
  });

  it("shares only on activation and treats dismissed native sharing as cancellation", async () => {
    const user = userEvent.setup();
    const share = vi.fn().mockRejectedValueOnce(new DOMException("Dismissed", "AbortError")).mockResolvedValue(undefined);
    installShare(share);
    render(<ResponseActions text="An answer" />);
    expect(share).not.toHaveBeenCalled();
    const button = screen.getByRole("button", { name: "Share response" });
    await user.click(button);
    expect(share).toHaveBeenCalledExactlyOnceWith({ text: "An answer" });
    expect(screen.getByRole("status").textContent).toBe("");
    await user.click(button);
    await screen.findByText("Shared");
  });

  it("honestly labels clipboard sharing fallback and supports an application share handler", async () => {
    const user = userEvent.setup();
    const copy = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    const { rerender } = render(<ResponseActions text="An answer" />);
    await user.click(screen.getByRole("button", { name: "Share response" }));
    expect(copy).toHaveBeenCalledExactlyOnceWith("An answer");
    await screen.findByText("Copied response to share");
    const onShare = vi.fn().mockRejectedValueOnce(new Error("Offline")).mockResolvedValue(undefined);
    rerender(<ResponseActions text="An answer" onShare={onShare} />);
    await user.click(screen.getByRole("button", { name: "Share response" }));
    await screen.findByText("Could not share. Try again.");
    await user.click(screen.getByRole("button", { name: "Share response" }));
    await screen.findByText("Shared");
    expect(onShare).toHaveBeenCalledTimes(2);
    expect(copy).toHaveBeenCalledOnce();
  });
});
