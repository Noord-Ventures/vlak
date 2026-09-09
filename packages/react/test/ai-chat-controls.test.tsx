import * as React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ContextUsage } from "../src/components/context-usage";
import { ModelSelector } from "../src/components/model-selector";
import { InlineCitation } from "../src/components/inline-citation";
import { Sources, sourceHref, type CitationSource } from "../src/components/sources";
import { OpenInChat, openInChatHref } from "../src/components/open-in-chat";

afterEach(() => { cleanup(); vi.restoreAllMocks(); });
async function accessible(container: HTMLElement) {
  const result = await axe(container, { rules: { "color-contrast": { enabled: false } } });
  (expect(result) as unknown as { toHaveNoViolations(): void }).toHaveNoViolations();
}
const sources: CitationSource[] = [{ id: "brief", title: "Project brief", url: "https://example.com/brief", description: "Scope and owners", quote: "Every decision has an owner." }, { id: "notes", title: "Review notes", url: "https://example.com/notes", description: "The next review", quote: "Review the draft on Thursday." }];

describe("ContextUsage", () => {
  it("reports occupancy and supplied usage without double-counting cached or reasoning tokens", async () => {
    const ref = React.createRef<HTMLDetailsElement>();
    const { container } = render(<ContextUsage ref={ref} defaultOpen usedTokens={512} maxTokens={2048} model="Example model" usage={{ inputTokens: 1000, cachedInputTokens: 200, outputTokens: 500, reasoningTokens: 100 }} pricing={{ inputPerMillion: 2, cacheReadPerMillion: 0.5, outputPerMillion: 6, reasoningPerMillion: 10 }} data-meter="context" />);
    expect(ref.current?.dataset.meter).toBe("context"); expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("512");
    expect(screen.getByText("0.0051 USD")).toBeTruthy(); expect(screen.getByText("Context usage · 25%")).toBeTruthy(); await accessible(container);
  });
  it("keeps unknown and invalid data distinct from zero", () => {
    const { rerender } = render(<ContextUsage defaultOpen usedTokens={NaN} maxTokens={0} usage={{}} pricing={{ inputPerMillion: 2 }} />);
    expect(screen.queryByRole("progressbar")).toBeNull(); expect(screen.getByText("Context limit unavailable.")).toBeTruthy(); expect(screen.queryByText("0.00 USD")).toBeNull();
    rerender(<ContextUsage defaultOpen usedTokens={3000} maxTokens={2000} usage={{ inputTokens: 0, outputTokens: 0 }} pricing={{}} />);
    expect(screen.getByText("The supplied usage exceeds this context limit.")).toBeTruthy(); expect(screen.getByText("0.00 USD")).toBeTruthy();
    rerender(<ContextUsage defaultOpen usedTokens={1} maxTokens={2000} usage={{ inputTokens: 100, cachedInputTokens: 50, outputTokens: 0 }} pricing={{ inputPerMillion: 2, cacheReadPerMillion: -1 }} />);
    expect(screen.queryByText(/USD/)).toBeNull();
  });
  it("uses native keyboard disclosure", async () => {
    const user = userEvent.setup(); const ref = React.createRef<HTMLDetailsElement>(); render(<ContextUsage ref={ref} usedTokens={2} maxTokens={8} />);
    expect(ref.current?.open).toBe(false); await user.tab(); expect(document.activeElement?.tagName).toBe("SUMMARY"); await user.click(ref.current!.querySelector("summary")!); expect(ref.current?.open).toBe(true);
  });
});

describe("ModelSelector", () => {
  const models = [{ id: "small", name: "Small", provider: "Example provider", capabilities: ["Fast"], contextWindow: 32000 }, { id: "vision", name: "Vision", provider: "Another provider", capabilities: ["Images"], priceLabel: "Application supplied rate" }, { id: "off", name: "Unavailable", disabled: true }];
  it("searches model metadata by keyboard and keeps controlled selection application-owned", async () => {
    const user = userEvent.setup(); const onValueChange = vi.fn(); const ref = React.createRef<HTMLDivElement>();
    const { container, rerender } = render(<ModelSelector models={models} value="small" onValueChange={onValueChange} ref={ref} className="custom" />);
    const input = screen.getByRole("combobox", { name: "Model" }); await user.click(input); await user.clear(input); await user.type(input, "Images"); await user.keyboard("{ArrowDown}{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("vision"); expect(ref.current?.classList.contains("custom")).toBe(true); expect(screen.getByText(/32,000 token context/)).toBeTruthy();
    rerender(<ModelSelector models={models} value="vision" onValueChange={onValueChange} />); expect(screen.getByText(/Application supplied rate/)).toBeTruthy(); await accessible(container);
  });
  it("reports unavailable selections and skips disabled model choices", async () => {
    const user = userEvent.setup(); const onValueChange = vi.fn(); render(<ModelSelector models={models} value="removed" onValueChange={onValueChange} />);
    expect(screen.getByRole("status").textContent).toContain("unavailable"); const input = screen.getByRole("combobox"); await user.click(input); await user.clear(input); await user.type(input, "Unavailable"); await user.keyboard("{ArrowDown}{Enter}"); expect(onValueChange).not.toHaveBeenCalled();
  });
});

describe("Sources and InlineCitation", () => {
  it("counts sources in a native disclosure and renders safe links and quotes", async () => {
    const user = userEvent.setup(); const ref = React.createRef<HTMLDetailsElement>();
    const { container } = render(<Sources sources={[...sources, { id: "unsafe", title: "Unavailable link", url: "javascript:alert(1)" }]} ref={ref} data-sources="brief" />);
    await user.tab(); expect(document.activeElement?.tagName).toBe("SUMMARY"); await user.click(ref.current!.querySelector("summary")!); expect(ref.current?.open).toBe(true); expect(ref.current?.dataset.sources).toBe("brief"); expect(screen.getByText("Sources (3)")).toBeTruthy();
    const link = screen.getByRole("link", { name: "Project brief (new tab)" }); expect(link.getAttribute("href")).toBe(sources[0]!.url); expect(link.getAttribute("rel")).toContain("noopener");
    expect(screen.queryByRole("link", { name: "Unavailable link" })).toBeNull(); expect(screen.getByText(sources[0]!.quote!)).toBeTruthy(); await accessible(container);
  });
  it("opens inline sources by keyboard, navigates count and quotes, and restores focus", async () => {
    const user = userEvent.setup(); const onIndexChange = vi.fn(); const ref = React.createRef<HTMLSpanElement>();
    render(<main><p>Read the brief<InlineCitation ref={ref} sources={sources} onIndexChange={onIndexChange} className="custom" /></p></main>);
    const trigger = screen.getByRole("button", { name: "View 2 sources" }); trigger.focus(); await user.keyboard("{Enter}");
    const dialog = screen.getByRole("dialog", { name: "Citation sources" }); expect(dialog.parentElement).toBe(document.body); expect(document.activeElement).toBe(dialog); expect(ref.current?.classList.contains("custom")).toBe(true);
    await user.keyboard("{ArrowRight}"); expect(screen.getByRole("status").textContent).toBe("Source 2 of 2"); expect(screen.getByText("Review the draft on Thursday.")).toBeTruthy(); expect(onIndexChange).toHaveBeenCalledWith(1);
    await user.keyboard("{Home}"); expect(screen.getByText("Every decision has an owner.")).toBeTruthy();
    await accessible(document.body); await user.keyboard("{Escape}"); expect(screen.queryByRole("dialog")).toBeNull(); expect(document.activeElement).toBe(trigger);
  });
  it("waits for visible placement before focusing the citation panel", async () => {
    const nativeFocus = HTMLElement.prototype.focus;
    vi.spyOn(HTMLElement.prototype, "focus").mockImplementation(function (this: HTMLElement, options?: FocusOptions) {
      // Match browsers: focus() has no effect while the positioning pass keeps the panel hidden.
      if (this.style.visibility !== "hidden") nativeFocus.call(this, options);
    });
    const user = userEvent.setup(); render(<InlineCitation sources={sources} />);
    await user.click(screen.getByRole("button", { name: "View 2 sources" }));
    expect(document.activeElement).toBe(screen.getByRole("dialog", { name: "Citation sources" }));
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("status").textContent).toBe("Source 2 of 2");
  });
  it("keeps boundary navigation focusable, closes on outside interaction and tabs back into the document", async () => {
    const user = userEvent.setup(); render(<><InlineCitation sources={sources} /><button type="button">After citation</button></>);
    const trigger = screen.getByRole("button", { name: "View 2 sources" }); await user.click(trigger);
    const next = screen.getByRole("button", { name: "Next source" }); await user.click(next); expect(document.activeElement).toBe(next); expect(next.getAttribute("aria-disabled")).toBe("true");
    screen.getByRole("link", { name: "Review notes (new tab)" }).focus(); await user.tab(); expect(screen.queryByRole("dialog")).toBeNull(); expect(document.activeElement).toBe(screen.getByRole("button", { name: "After citation" }));
    await user.click(trigger); await user.click(screen.getByRole("button", { name: "After citation" })); expect(screen.queryByRole("dialog")).toBeNull();
  });
  it("leaves controlled citation selection to the caller and disables empty citations", async () => {
    const user = userEvent.setup(); const onIndexChange = vi.fn(); const { rerender } = render(<InlineCitation sources={sources} index={0} onIndexChange={onIndexChange} />);
    await user.click(screen.getByRole("button", { name: "View 2 sources" })); await user.click(screen.getByRole("button", { name: "Next source" })); expect(onIndexChange).toHaveBeenCalledWith(1); expect(screen.getByRole("status").textContent).toBe("Source 1 of 2");
    rerender(<InlineCitation sources={[]} />); expect(screen.queryByRole("dialog")).toBeNull(); expect((screen.getByRole("button", { name: "View 0 sources" }) as HTMLButtonElement).disabled).toBe(true);
  });
});

describe("OpenInChat", () => {
  it("encodes a supplied prompt for each provider without executing it", async () => {
    const prompt = "A & B?\n# next = 你好";
    const query: Record<string, string> = { chatgpt: "prompt", claude: "q", cursor: "text", scira: "q", t3: "q", v0: "q" };
    for (const provider of ["chatgpt", "claude", "cursor", "scira", "t3", "v0"] as const) expect(new URL(openInChatHref(provider, prompt)!).searchParams.get(query[provider]!)).toBe(prompt);
    const user = userEvent.setup(); const ref = React.createRef<HTMLDetailsElement>(); const { container } = render(<OpenInChat ref={ref} prompt={prompt} providers={["chatgpt", "claude", "github"]} githubUrl="https://github.com/example/repo" />);
    await user.tab(); expect(document.activeElement?.tagName).toBe("SUMMARY"); await user.click(ref.current!.querySelector("summary")!); expect(ref.current?.open).toBe(true);
    const links = screen.getAllByRole("link"); expect(links).toHaveLength(3); expect(links.every(link => link.getAttribute("target") === "_blank" && link.getAttribute("rel") === "noopener noreferrer")).toBe(true); await accessible(container);
  });
  it("omits unsafe source and GitHub schemes while keeping relative source references", () => {
    expect(sourceHref("/docs/brief#scope")).toBe("/docs/brief#scope"); expect(sourceHref("javascript:alert(1)")).toBeUndefined(); expect(sourceHref("java\nscript:alert(1)")).toBeUndefined(); expect(sourceHref("data:text/html,anything")).toBeUndefined();
    expect(openInChatHref("github", "prompt", "javascript:alert(1)")).toBeUndefined();
    render(<OpenInChat prompt="Hello" providers={["github"]} defaultOpen />); expect(screen.getByText("No provider links available.")).toBeTruthy(); expect(screen.queryByRole("link")).toBeNull();
  });
});
