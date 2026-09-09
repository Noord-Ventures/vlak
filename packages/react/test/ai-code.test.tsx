import * as React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { Agent } from "../src/components/agent";
import { Artifact } from "../src/components/artifact";
import { Commit } from "../src/components/commit";
import { EnvironmentVariables, formatEnvironmentExports } from "../src/components/environment-variables";
import { PackageInfo } from "../src/components/package-info";
import { SchemaDisplay, type SchemaProperty } from "../src/components/schema-display";
import { Snippet, SnippetCopy } from "../src/components/snippet";
import { TestResults, type TestResultSuite } from "../src/components/test-results";

// jsdom does not lay out text or provide canvas metrics; browser verification checks contrast.
afterEach(cleanup);

describe("Snippet copy", () => {
  it("copies exact source without the prefix, is keyboard accessible, and reports rejection", async () => {
    const copy = vi.fn().mockRejectedValueOnce(new Error("denied")).mockResolvedValueOnce(undefined);
    const { container } = render(<Snippet code={"pnpm add vlak\n"} prefix="$" onCopy={copy} />);
    await userEvent.tab();
    expect(document.activeElement?.tagName).toBe("CODE");
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    expect(copy).toHaveBeenCalledWith("pnpm add vlak\n");
    expect(await screen.findByText("Could not copy. Try again.")).toBeTruthy();
    await userEvent.keyboard(" ");
    expect(await screen.findByText("Copied")).toBeTruthy();
    expect(await axe(container, { rules: { "color-contrast": { enabled: false } } })).toHaveNoViolations();
  });
  it("locks pending copy and discards its result when source changes", async () => {
    let finish = () => {};
    const copy = vi.fn(() => new Promise<void>(resolve => { finish = resolve; }));
    const { rerender } = render(<SnippetCopy value="old" onCopy={copy} />);
    await userEvent.click(screen.getByRole("button", { name: "Copy snippet" }));
    await userEvent.click(screen.getByRole("button", { name: "Copy snippet" }));
    expect(copy).toHaveBeenCalledOnce();
    rerender(<SnippetCopy value="new" onCopy={copy} />);
    finish();
    await waitFor(() => expect(screen.getByRole("status").textContent).toBe(""));
  });
});

describe("Environment variables", () => {
  const variables = [{ name: "TOKEN", value: "demo-secret", required: true }, { name: "EMPTY", value: "" }];
  it("starts masked, reveals only on activation, and hides a changed value", async () => {
    const { container, rerender } = render(<EnvironmentVariables variables={variables} />);
    expect(screen.queryByText("demo-secret")).toBeNull();
    expect(container.innerHTML.includes("demo-secret")).toBe(false);
    await userEvent.click(screen.getByRole("button", { name: "Show TOKEN" }));
    expect(screen.getByText("demo-secret")).toBeTruthy();
    rerender(<EnvironmentVariables variables={[{ name: "TOKEN", value: "replacement" }]} />);
    expect(screen.queryByText("replacement")).toBeNull();
    expect(await axe(container, { rules: { "color-contrast": { enabled: false } } })).toHaveNoViolations();
  });
  it("keeps controlled reveal authoritative and supports keyboard exact-value copy", async () => {
    const show = vi.fn();
    const copy = vi.fn();
    render(<EnvironmentVariables variables={variables} showValues={false} onShowValuesChange={show} onCopy={copy} />);
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    expect(show).toHaveBeenCalledWith(true);
    expect(screen.queryByText("demo-secret")).toBeNull();
    screen.getByRole("button", { name: "Copy TOKEN" }).focus();
    await userEvent.keyboard("{Enter}");
    expect(copy).toHaveBeenCalledWith("demo-secret");
  });
  it("quotes shell metacharacters literally and rejects invalid assignment names", () => {
    expect(formatEnvironmentExports([{ name: "TOKEN", value: "a'b$()\nnext" }])).toBe("export TOKEN='a'\\''b$()\nnext'");
    expect(() => formatEnvironmentExports([{ name: "TOKEN;bad", value: "value" }])).toThrow("Invalid environment variable name");
  });
});

describe("Developer content views", () => {
  it("renders agent schema data without invoking object accessors, with keyboard disclosure", async () => {
    const getter = vi.fn(() => "private");
    const schema = Object.defineProperty({}, "secret", { enumerable: true, get: getter });
    const { container } = render(<Agent name="Reviewer" model="Local model" instructions="Review the supplied source." tools={[{ name: "read_file", inputSchema: schema }]} outputSchema="type Review = { summary: string }" />);
    await userEvent.tab();
    expect(document.activeElement?.tagName).toBe("SUMMARY");
    await userEvent.click(document.activeElement as HTMLElement);
    expect(screen.getByText("read_file").closest("details")?.open).toBe(true);
    expect(getter).not.toHaveBeenCalled();
    expect(await axe(container, { rules: { "color-contrast": { enabled: false } } })).toHaveNoViolations();
  });
  it("forwards artifact attributes and requests close without removing app-owned content", async () => {
    const close = vi.fn();
    const ref = React.createRef<HTMLElement>();
    const { container } = render(<Artifact ref={ref} title="Review" description="Generated document" onClose={close} maxHeight={240} className="custom" data-source="local" style={{ maxWidth: 600 }}>Draft text</Artifact>);
    const region = screen.getByRole("region", { name: "Review" });
    expect(ref.current).toBe(region);
    expect(region.classList.contains("custom")).toBe(true);
    expect(region.style.maxWidth).toBe("600px");
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    expect(close).toHaveBeenCalledOnce();
    expect(screen.getByText("Draft text")).toBeTruthy();
    expect(await axe(container, { rules: { "color-contrast": { enabled: false } } })).toHaveNoViolations();
  });
  it("copies the full commit hash, preserves rename information and selects a file", async () => {
    const copy = vi.fn();
    const select = vi.fn();
    const file = { path: "src/new.ts", previousPath: "src/old.ts", status: "renamed" as const, additions: 2, deletions: 1 };
    const { container } = render(<Commit hash="123456789abcdef" message="Rename module" files={[file]} timestamp="2026-09-09T12:00:00Z" defaultOpen onCopy={copy} onFileSelect={select} />);
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    expect(copy).toHaveBeenCalledWith("123456789abcdef");
    await userEvent.click(screen.getByRole("button", { name: "src/new.ts" }));
    expect(select).toHaveBeenCalledWith(file);
    expect(screen.getByText("from src/old.ts")).toBeTruthy();
    expect(screen.getByText("2026-09-09 12:00 UTC").getAttribute("datetime")).toBe("2026-09-09T12:00:00.000Z");
    expect(await axe(container, { rules: { "color-contrast": { enabled: false } } })).toHaveNoViolations();
  });
  it("distinguishes current and proposed versions and expands dependencies", async () => {
    const { container } = render(<PackageInfo name="example" currentVersion="1.0.0" newVersion="1.1.0" changeType="minor" dependencies={[{ name: "react", version: "^19", kind: "peer" }]} />);
    expect(screen.getByText("Current 1.0.0")).toBeTruthy();
    expect(screen.getByText("Proposed 1.1.0")).toBeTruthy();
    await userEvent.tab();
    expect(document.activeElement?.tagName).toBe("SUMMARY");
    await userEvent.click(document.activeElement as HTMLElement);
    expect(screen.getByText("Dependencies (1)").closest("details")?.open).toBe(true);
    expect(await axe(container, { rules: { "color-contrast": { enabled: false } } })).toHaveNoViolations();
  });
});

describe("Schema display", () => {
  it("escapes endpoint markup, displays locations and arrays, and bounds recursive schemas", async () => {
    const recursive: SchemaProperty = { name: "child", type: "object" };
    recursive.properties = [recursive];
    const { container } = render(<SchemaDisplay method="GET" path='/items/<img src=x onerror="alert(1)">' parameters={[{ name: "id", type: "string", required: true, location: "path" }]} responseBody={[{ name: "items", type: "array", items: recursive }]} />);
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText("Recursive reference.")).toBeTruthy();
    await userEvent.tab();
    expect(document.activeElement?.tagName).toBe("SUMMARY");
    expect(await axe(container, { rules: { "color-contrast": { enabled: false } } })).toHaveNoViolations();
  });
  it("caps both broad and deep schemas", () => {
    const { container } = render(<SchemaDisplay method="POST" path="/items" responseBody={Array.from({ length: 50 }, (_, i) => ({ name: `p${i}`, type: "string" }))} maxNodes={3} />);
    expect(container.querySelectorAll(".rs-schema-display-property").length).toBe(3);
    expect(screen.getByText("More properties omitted.")).toBeTruthy();
  });
});

describe("Test results", () => {
  const suites: TestResultSuite[] = [{ id: "api", name: "API", tests: [{ id: "ok", name: "Loads", status: "passed", duration: 0 }, { id: "bad", name: "Retries", status: "failed", error: "Expected 200", stack: "at retry (api.ts:12:4)" }, { id: "skip", name: "Offline", status: "skipped" }, { id: "run", name: "Saves", status: "running" }] }];
  it("derives totals, includes zero durations, and keeps failures truthful after retry rejection", async () => {
    const retry = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce(undefined);
    const { container } = render(<TestResults suites={suites} duration={0} onRetry={retry} />);
    expect(screen.getByText("3 of 4 complete")).toBeTruthy();
    expect(screen.getByRole("progressbar").getAttribute("value")).toBe("3");
    expect(screen.getAllByText("0 ms")).toHaveLength(2);
    screen.getByRole("button", { name: "Retry Retries" }).focus();
    await userEvent.keyboard("{Enter}");
    expect(retry).toHaveBeenCalledWith(suites[0]!.tests[1], suites[0]);
    expect(await screen.findByText("Retry failed. Try again.")).toBeTruthy();
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(retry).toHaveBeenCalledTimes(2));
    expect(screen.getByText("Expected 200")).toBeTruthy();
    expect(await axe(container, { rules: { "color-contrast": { enabled: false } } })).toHaveNoViolations();
  });
  it("ignores stale retry rejection after the host supplies a successful result", async () => {
    let reject = (_error: Error) => {};
    const retry = vi.fn(() => new Promise<void>((_resolve, no) => { reject = no; }));
    const { rerender } = render(<TestResults suites={suites} onRetry={retry} />);
    await userEvent.click(screen.getByRole("button", { name: "Retry Retries" }));
    expect(screen.getByRole("button", { name: "Retry Retries" }).hasAttribute("disabled")).toBe(true);
    rerender(<TestResults suites={[{ ...suites[0]!, tests: [{ id: "bad", name: "Retries", status: "passed" }] }]} onRetry={retry} />);
    reject(new Error("late"));
    await waitFor(() => expect(screen.queryByText("Retry failed. Try again.")).toBeNull());
    expect(screen.getByText("1 passed")).toBeTruthy();
  });
});
