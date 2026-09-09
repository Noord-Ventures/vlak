import * as React from "react";
import { renderToString } from "react-dom/server";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { ResponseMarkdown } from "../src/components/response-markdown";
import { Response } from "../src/components/response";

const diagram = vi.hoisted(() => ({ initialize: vi.fn(), render: vi.fn() }));
vi.mock("mermaid", () => ({ default: diagram }));
afterEach(() => { cleanup(); document.documentElement.removeAttribute("data-theme"); vi.clearAllMocks(); vi.unstubAllGlobals(); });

describe("ResponseMarkdown", () => {
  it("collapses structural whitespace inside a plain-text response while preserving code lines", () => {
    const { container } = render(<Response><ResponseMarkdown>{"## Checklist\n\n- Read the brief\n- Assign an owner\n\n```text\nline one\n  line two\n```"}</ResponseMarkdown></Response>);
    const markdown = container.querySelector(".rs-response-markdown")!;
    const code = markdown.querySelector("pre")!;
    expect(getComputedStyle(markdown).whiteSpace).toBe("normal");
    expect(getComputedStyle(code).whiteSpace).toBe("pre");
    expect(code.textContent).toBe("line one\n  line two\n");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });
  it("renders incomplete emphasis and fences while streaming, then settles into parsed content", async () => {
    const { container, rerender } = render(<ResponseMarkdown streaming>{"A **careful"}</ResponseMarkdown>);
    expect(container.querySelector("strong")?.textContent).toBe("careful");
    rerender(<ResponseMarkdown streaming>{"A **careful** answer.\n\n```javascript\nconst x = 1;"}</ResponseMarkdown>);
    expect(screen.getByRole("group", { name: "javascript source" }).textContent).toBe("const x = 1;\n");
    expect(container.querySelector("figure")?.dataset.highlighted).toBe("false");
    rerender(<ResponseMarkdown>{"A **careful** answer.\n\n```javascript\nconst x = 1;\n```"}</ResponseMarkdown>);
    await waitFor(() => expect(container.querySelector("figure")?.dataset.highlighted).toBe("true"));
    expect(container.querySelector("strong")?.textContent).toBe("careful");
  });

  it("keeps raw markup inert, filters unsafe protocols, and does not fetch images by default", () => {
    const markdown = '<script>alert(1)</script>\n\n<iframe src="https://example.com"></iframe>\n\n[Bad](javascript:alert) [Data](data:text/html,hello) [Good](https://example.com) [Local](/guide)\n\n![Chart](https://images.example.com/chart.png)';
    const { container, rerender } = render(<ResponseMarkdown>{markdown}</ResponseMarkdown>);
    expect(container.querySelector("script, iframe, img")).toBeNull();
    expect(screen.queryByRole("link", { name: "Bad" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Data" })).toBeNull();
    expect(screen.getByRole("link", { name: "Good" }).getAttribute("href")).toBe("https://example.com");
    expect(screen.getByRole("link", { name: "Local" }).getAttribute("href")).toBe("/guide");
    expect(screen.getByText("Image: Chart")).toBeTruthy();
    rerender(<ResponseMarkdown imageOrigins={["https://images.example.com"]}>{'![Chart](https://images.example.com/chart.png)\n\n![Blocked](https://images.example.com.evil.test/chart.png)'}</ResponseMarkdown>);
    expect(screen.getByRole("img", { name: "Chart" }).getAttribute("referrerpolicy")).toBe("no-referrer");
    expect(screen.queryByRole("img", { name: "Blocked" })).toBeNull();
  });

  it("supports tables, task lists, math, custom components, and native root attributes", async () => {
    const ref = React.createRef<HTMLDivElement>();
    const { container } = render(<ResponseMarkdown ref={ref} className="custom" style={{ marginTop: 8 }} data-source="saved">{"## Findings\n\n| Item | Status |\n| --- | --- |\n| Review | Ready |\n\n- [x] Reviewed\n\n$$\nx^2 + y^2 = z^2\n$$"}</ResponseMarkdown>);
    expect(ref.current?.dataset.source).toBe("saved");
    expect(ref.current?.classList.contains("custom")).toBe(true);
    expect(ref.current?.style.marginTop).toBe("8px");
    expect(screen.getByRole("table")).toBeTruthy();
    expect((screen.getByRole("checkbox") as HTMLInputElement).disabled).toBe(true);
    expect(container.querySelector(".katex math")).toBeTruthy();
    expect(container.querySelector("[aria-live]")).toBeNull();
    const results = await axe(container, { rules: { "color-contrast": { enabled: false } } });
    (expect(results) as unknown as { toHaveNoViolations(): void }).toHaveNoViolations();
  });

  it("loads relative images from the validated base origin rather than the host page", () => {
    render(<ResponseMarkdown baseUrl="https://assets.example/docs/" imageOrigins={["https://assets.example"]}>{'![Root](/preview.png)\n\n![Relative](images/preview.png)\n\n![Protocol relative](//assets.example/preview.png)\n\n![Blocked](https://other.example/preview.png)'}</ResponseMarkdown>);
    expect(screen.getByRole("img", { name: "Root" }).getAttribute("src")).toBe("https://assets.example/preview.png");
    expect(screen.getByRole("img", { name: "Relative" }).getAttribute("src")).toBe("https://assets.example/docs/images/preview.png");
    expect(screen.getByRole("img", { name: "Protocol relative" }).getAttribute("src")).toBe("https://assets.example/preview.png");
    expect(screen.queryByRole("img", { name: "Blocked" })).toBeNull();
  });

  it("defers diagrams until their fence completes and preserves the source after a renderer error", async () => {
    diagram.render.mockRejectedValueOnce(new Error("Bad diagram"));
    const { rerender } = render(<ResponseMarkdown streaming>{"```mermaid\nflowchart LR\nA-->B"}</ResponseMarkdown>);
    expect(diagram.render).not.toHaveBeenCalled();
    rerender(<ResponseMarkdown>{"```mermaid\nflowchart LR\nA-->B\n```"}</ResponseMarkdown>);
    await screen.findByText("The diagram could not be rendered. Its source is available below.");
    expect(diagram.initialize).toHaveBeenCalledWith(expect.objectContaining({ securityLevel: "strict", htmlLabels: false }));
    expect(screen.getByText("Diagram source")).toBeTruthy();
    expect(document.querySelector("pre code")?.textContent).toBe("flowchart LR\nA-->B\n");
  });

  it("renders on the server without starting diagram work", () => {
    const html = renderToString(<ResponseMarkdown>{"Hello **world**.\n\n```mermaid\nflowchart LR\nA-->B\n```"}</ResponseMarkdown>);
    expect(html).toContain("<strong");
    expect(html).toContain("Rendering diagram");
    expect(diagram.render).not.toHaveBeenCalled();
  });

  it("rerenders diagrams for the effective light and dark schemes without weakening strict rendering", async () => {
    const listeners = new Set<() => void>();
    const media = { matches: false, addEventListener: (_event: string, listener: () => void) => listeners.add(listener), removeEventListener: (_event: string, listener: () => void) => listeners.delete(listener) };
    vi.stubGlobal("matchMedia", () => media);
    diagram.render.mockResolvedValue({ svg: '<svg xmlns="http://www.w3.org/2000/svg"><text>Hello</text></svg>' });
    const { unmount } = render(<ResponseMarkdown>{"```mermaid\nsequenceDiagram\nAlice->>Bob: Hello\n```"}</ResponseMarkdown>);
    await waitFor(() => expect(diagram.initialize).toHaveBeenLastCalledWith(expect.objectContaining({ securityLevel: "strict", themeVariables: expect.objectContaining({ darkMode: false, signalTextColor: "#111111" }) })));
    document.documentElement.setAttribute("data-theme", "dark");
    await waitFor(() => expect(diagram.initialize).toHaveBeenLastCalledWith(expect.objectContaining({ securityLevel: "strict", themeVariables: expect.objectContaining({ darkMode: true, signalTextColor: "#f5f5f5" }) })));
    document.documentElement.setAttribute("data-theme", "light");
    await waitFor(() => expect(diagram.initialize).toHaveBeenLastCalledWith(expect.objectContaining({ themeVariables: expect.objectContaining({ darkMode: false }) })));
    document.documentElement.removeAttribute("data-theme");
    media.matches = true;
    for (const listener of listeners) listener();
    await waitFor(() => expect(diagram.initialize).toHaveBeenLastCalledWith(expect.objectContaining({ themeVariables: expect.objectContaining({ darkMode: true }) })));
    unmount();
    expect(listeners.size).toBe(0);
  });
});
