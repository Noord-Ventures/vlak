import * as React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { Chat } from "../src/components/chat";

afterEach(cleanup);

describe("Chat", () => {
  it("names the frame and history independently and keeps the composer outside the log", async () => {
    const ref = React.createRef<HTMLElement>();
    const { container } = render(<Chat ref={ref} title="Launch brief" description="Recorded example" conversationLabel="Brief messages"
      className="custom" style={{ maxWidth: "60rem" }} data-project="launch" historyHeight="24rem"
      composer={<textarea aria-label="Message" />} footer="Check responses before use">
      <p>Prepare a launch summary.</p>
    </Chat>);
    const region = screen.getByRole("region", { name: "Launch brief" });
    const log = screen.getByRole("log", { name: "Brief messages" });
    const composer = screen.getByRole("textbox", { name: "Message" });
    expect(ref.current).toBe(region);
    expect(region.classList.contains("custom")).toBe(true);
    expect(region.style.maxWidth).toBe("60rem");
    expect(region.dataset.project).toBe("launch");
    expect(log.parentElement?.style.height).toBe("24rem");
    expect(log.contains(screen.getByText("Prepare a launch summary."))).toBe(true);
    expect(log.contains(composer)).toBe(false);
    expect(region.contains(composer)).toBe(true);
    expect(log.contains(screen.getByText("Check responses before use"))).toBe(false);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("respects a supplied region name or label reference", () => {
    const { rerender } = render(<Chat title="Brief" aria-label="Project assistant" composer={null} />);
    expect(screen.getByRole("region", { name: "Project assistant" }).hasAttribute("aria-labelledby")).toBe(false);
    rerender(<><h2 id="chat-name">Editorial assistant</h2><Chat title="Brief" aria-label="Project assistant" aria-labelledby="chat-name" composer={null} /></>);
    expect(screen.getByRole("region", { name: "Editorial assistant" })).toBeTruthy();
  });

  it("keeps header actions, scrollback, and the composer in a usable keyboard order", async () => {
    const newChat = vi.fn();
    render(<Chat title="Brief" actions={<button type="button" onClick={newChat}>New chat</button>} composer={<textarea aria-label="Message" />}>
      <p>First response</p>
    </Chat>);
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "New chat" }));
    await userEvent.keyboard("{Enter}");
    expect(newChat).toHaveBeenCalledOnce();
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByRole("log", { name: "Conversation" }));
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Message" }));
  });

  it("preserves manual scrollback when messages grow and keeps the jump control above the composer", () => {
    const composer = <textarea aria-label="Message" />;
    const { rerender } = render(<Chat title="Brief" autoScroll={false} composer={composer}><p>First response</p></Chat>);
    const log = screen.getByRole("log");
    Object.defineProperty(log, "scrollHeight", { configurable: true, value: 600 });
    Object.defineProperty(log, "clientHeight", { configurable: true, value: 200 });
    log.scrollTop = 100;
    fireEvent.scroll(log);
    rerender(<Chat title="Brief" autoScroll={false} composer={composer}><p>First response</p><p>Second response</p></Chat>);
    expect(log.scrollTop).toBe(100);
    const jump = screen.getByRole("button", { name: "Jump to latest" });
    expect(log.parentElement?.contains(jump)).toBe(true);
    expect(log.parentElement?.contains(screen.getByRole("textbox"))).toBe(false);
  });
});
