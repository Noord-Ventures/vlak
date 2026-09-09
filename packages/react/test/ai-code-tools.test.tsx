import type * as React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { StackTrace, parseStackTrace } from "../src/components/stack-trace";
import { Sandbox } from "../src/components/sandbox";
import { WebPreview, isPreviewUrl } from "../src/components/web-preview";
import { Terminal } from "../src/components/terminal";
import { appendTerminalOutput, createTerminalParser } from "../src/components/terminal-parser";
import { JSXPreview } from "../src/components/jsx-preview";
import { completePreviewJSX, previewBindings, validatePreviewJSX } from "../src/components/jsx-preview-parser";

afterEach(cleanup);
const a11y = (container: HTMLElement) => axe(container, { rules: { "color-contrast": { enabled: false } } });

describe("Stack trace", () => {
  const trace = "TypeError: Could not read file\n  at read (C:\\workspace\\file.ts:12:4)\n  at node:internal/process/task_queues:95:5\nload@https://example.com/app.js:18:2\n@https://example.com/app.js:22:3";
  it("parses V8, Node and Firefox locations without losing Windows drive or URL separators", () => {
    const parsed = parseStackTrace(trace);
    expect(parsed.errorType).toBe("TypeError");
    expect(parsed.errorMessage).toBe("Could not read file");
    expect(parsed.frames).toHaveLength(4);
    expect(parsed.frames[0]).toMatchObject({ functionName: "read", filePath: "C:\\workspace\\file.ts", lineNumber: 12, columnNumber: 4 });
    expect(parsed.frames[1]?.isInternal).toBe(true);
    expect(parsed.frames[2]).toMatchObject({ functionName: "load", filePath: "https://example.com/app.js", lineNumber: 18, columnNumber: 2 });
    expect(parseStackTrace(trace, 2).omittedFrames).toBe(2);
  });
  it("copies raw source and activates location callbacks from the keyboard", async () => {
    const copy = vi.fn();
    const select = vi.fn();
    const { container } = render(<StackTrace trace={trace} defaultOpen onCopy={copy} onFilePathClick={select} />);
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    expect(copy).toHaveBeenCalledWith(trace);
    screen.getByRole("button", { name: "C:\\workspace\\file.ts:12:4" }).focus();
    await userEvent.keyboard("{Enter}");
    expect(select).toHaveBeenCalledWith("C:\\workspace\\file.ts", 12, 4);
    expect(await a11y(container)).toHaveNoViolations();
  });
});

describe("Sandbox", () => {
  it("uses keyboard tabs for code/output and leaves execution state application-owned", async () => {
    const { container } = render(<Sandbox title="Run review tests" state="complete" code="pnpm test" output="3 tests passed" />);
    const code = screen.getByRole("tab", { name: "Code" });
    code.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Output" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("tabpanel").textContent).toBe("3 tests passed");
    expect(await a11y(container)).toHaveNoViolations();
  });
});

describe("Terminal", () => {
  it("keeps repeated terminal scroll areas out of page landmarks", async () => {
    const { container } = render(<main><Terminal title="Build output" output="Build passed" /><Terminal title="Test output" output="Tests passed" /></main>);
    expect(screen.getAllByRole("region").map(region => region.getAttribute("aria-label"))).toEqual(["Build output", "Test output"]);
    expect(screen.getAllByRole("group", { name: "Terminal output" })).toHaveLength(2);
    expect(await a11y(container)).toHaveNoViolations();
  });
  it("carries split ANSI state across chunks, resets attributes and decodes 256/truecolor", () => {
    let parsed = appendTerminalOutput(createTerminalParser(), "plain \u001b[1;3;38;5;");
    expect(parsed.runs.map(run => run.text).join("")).toBe("plain ");
    parsed = appendTerminalOutput(parsed, "196mred\u001b[0m normal\u001b[48;2;10;20;30mbackground");
    expect(parsed.runs[1]).toMatchObject({ text: "red", bold: true, italic: true, foreground: "rgb(255, 0, 0)" });
    expect(parsed.runs[2]).toEqual({ text: " normal" });
    expect(parsed.runs[3]?.background).toBe("rgb(10, 20, 30)");
    expect(appendTerminalOutput(createTerminalParser(), "\u001b[38:2::10:20:30mRGB").runs[0]?.foreground).toBe("rgb(10, 20, 30)");
  });
  it("discards split OSC clipboard/link commands and keeps markup inert", () => {
    let parsed = appendTerminalOutput(createTerminalParser(), "\u001b]52;c;payload");
    parsed = appendTerminalOutput(parsed, "\u001b\\<script>text</script>\u001b]8;;https://example.com\u0007label\u001b]8;;\u0007");
    expect(parsed.runs.map(run => run.text).join("")).toBe("<script>text</script>label");
  });
  it("defaults to monochrome attributes, exposes original colors only by opt-in and copies raw output", async () => {
    const copy = vi.fn();
    const clear = vi.fn();
    const output = "\u001b[1;31mFailed\u001b[0m\n";
    const { container, rerender } = render(<Terminal output={output} streaming onCopy={copy} onClear={clear} />);
    expect(container.querySelector(".rs-terminal-bold")).toBeTruthy();
    expect(container.querySelector(".rs-terminal-colors")).toBeNull();
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    expect(copy).toHaveBeenCalledWith(output);
    await userEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(clear).toHaveBeenCalledOnce();
    rerender(<Terminal output={output} ansiColors />);
    expect((container.querySelector(".rs-terminal-colors") as HTMLElement).style.getPropertyValue("--terminal-foreground")).toBe("rgb(128, 0, 0)");
    expect(await a11y(container)).toHaveNoViolations();
  });
  it("preserves a reader's scroll position until Latest output is activated", async () => {
    const { rerender } = render(<Terminal output="First line" />);
    const area = screen.getByRole("group", { name: "Terminal output" });
    Object.defineProperties(area, { scrollHeight: { value: 1000, configurable: true }, clientHeight: { value: 200, configurable: true } });
    area.scrollTop = 100;
    fireEvent.scroll(area);
    rerender(<Terminal output="First line\nSecond line" />);
    expect(area.scrollTop).toBe(100);
    await userEvent.click(screen.getByRole("button", { name: "Latest output" }));
    expect(area.scrollTop).toBe(1000);
  });
});

describe("Web preview", () => {
  it("names repeated page previews without adding duplicate navigation landmarks", async () => {
    const { container } = render(<main><WebPreview title="Calendar preview" /><WebPreview title="Draft preview" /></main>);
    expect(screen.getAllByRole("region").map(region => region.getAttribute("aria-label"))).toEqual(["Calendar preview", "Draft preview"]);
    expect(screen.getByRole("group", { name: "Calendar preview navigation" })).toBeTruthy();
    expect(screen.getByRole("group", { name: "Draft preview navigation" })).toBeTruthy();
    expect(await axe(container, { iframes: false, rules: { "color-contrast": { enabled: false } } })).toHaveNoViolations();
  });
  it("rejects executable URLs and protocol confusion", () => {
    for (const value of ["javascript:alert(1)", "data:text/html,bad", "//example.com", "https:\\example.com", "https://user:pass@example.com", "/\\example.com", "\nhttps://example.com"]) expect(isPreviewUrl(value)).toBe(false);
    for (const value of ["about:blank", "/widgets/demo.html", "https://example.com/page"]) expect(isPreviewUrl(value)).toBe(true);
  });
  it("requests controlled navigation without changing iframe source until the host accepts", async () => {
    const navigate = vi.fn();
    const { container, rerender } = render(<WebPreview title="Generated page" url="about:blank" onUrlChange={navigate} />);
    const input = screen.getByRole("textbox", { name: "Preview URL" });
    await userEvent.clear(input);
    await userEvent.type(input, "https://example.com/preview{Enter}");
    expect(navigate).toHaveBeenCalledWith("https://example.com/preview");
    expect(screen.getByTitle("Generated page").getAttribute("src")).toBe("about:blank");
    rerender(<WebPreview title="Generated page" url="https://example.com/preview" onUrlChange={navigate} />);
    expect(screen.getByTitle("Generated page").getAttribute("src")).toBe("https://example.com/preview");
    expect(screen.getByTitle("Generated page").getAttribute("sandbox")).toBe("allow-scripts allow-forms");
    expect(await axe(container, { iframes: false, rules: { "color-contrast": { enabled: false } } })).toHaveNoViolations();
  });
  it("keeps navigation callbacks explicit and console messages escaped and bounded", async () => {
    const back = vi.fn();
    const reload = vi.fn();
    const { container } = render(<WebPreview onBack={back} canGoBack onReload={reload} logs={[{ level: "log", message: "old" }, { level: "error", message: "<img src=x>" }]} maxLogEntries={1} />);
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    expect(back).toHaveBeenCalledOnce();
    await userEvent.click(screen.getByRole("button", { name: "Reload preview" }));
    expect(reload).toHaveBeenCalledOnce();
    expect(container.querySelector("img")).toBeNull();
    expect(screen.queryByText("old")).toBeNull();
    expect(screen.getByText("<img src=x>")).toBeTruthy();
  });
});

describe("JSX preview", () => {
  it("completes tags without treating quoted greater-than signs as tag endings", () => {
    expect(completePreviewJSX('<div title="a > b"><strong>Hello')).toBe('<div title="a > b"><strong>Hello</strong></div>');
    expect(completePreviewJSX("<section>Text <str")).toBe("<section>Text </section>");
  });
  it("rejects executable expressions, prototype access, event handlers and active HTML before interpretation", () => {
    for (const source of ['<div>{"".constructor.constructor("return globalThis")()}</div>', '<div>{value["con" + "structor"]}</div>', '<button onClick={callback}>Run</button>', '<div {...props} />', '<iframe src="https://example.com" />', '<a href="javascript:alert(1)">Go</a>']) expect(() => validatePreviewJSX(source, new Set())).toThrow();
    expect(() => validatePreviewJSX('<div>{count + 1}<strong>Ready</strong></div>', new Set())).not.toThrow();
  });
  it("copies only plain data and never invokes binding accessors", () => {
    const getter = vi.fn();
    const input = Object.defineProperty({}, "value", { get: getter, enumerable: true });
    expect(() => previewBindings(input)).toThrow("accessors");
    expect(getter).not.toHaveBeenCalled();
    expect(() => previewBindings({ callback: () => {} })).toThrow("functions");
    expect(Object.getPrototypeOf(previewBindings({ record: { total: 3 } }))).toBeNull();
  });
  it("renders registered display components and bindings, retaining good content during partial expressions", async () => {
    const Card = ({ title, children }: { title: string; children?: React.ReactNode }) => <section aria-label={title}>{children}</section>;
    const components = { Card };
    const { container, rerender } = render(<JSXPreview jsx='<Card title="Review"><p>{count} findings</p></Card>' components={components} bindings={{ count: 3 }} streaming />);
    expect(screen.getByText("3 findings")).toBeTruthy();
    rerender(<JSXPreview jsx='<Card title="Review"><p>{count +' components={components} bindings={{ count: 3 }} streaming />);
    expect(screen.getByText("3 findings")).toBeTruthy();
    expect(await a11y(container)).toHaveNoViolations();
  });
  it("reports invalid completed source and renders an explicit error fallback", async () => {
    const error = vi.fn();
    render(<JSXPreview jsx="<div>{callback()}</div>" onError={error} fallback="This preview needs a valid data expression." />);
    expect(screen.getByRole("alert").textContent).toBe("This preview needs a valid data expression.");
    await waitFor(() => expect(error).toHaveBeenCalledOnce());
  });
});
