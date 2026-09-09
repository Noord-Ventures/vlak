import * as React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { HighlightedCode } from "../src/components/highlighted-code";

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("HighlightedCode", () => {
  it("highlights exact source and updates equal-length middle edits without stale cached tokens", async () => {
    const prefix = `// ${"a".repeat(120)}\n`;
    const suffix = `\n// ${"z".repeat(120)}`;
    const first = `${prefix}const value = "one";${suffix}`;
    const second = `${prefix}const value = "two";${suffix}`;
    const { container, rerender } = render(<HighlightedCode code={first} language="javascript" />);
    await waitFor(() => expect(container.querySelector("figure")?.dataset.highlighted).toBe("true"));
    expect(container.querySelector("code")?.textContent).toBe(first);
    rerender(<HighlightedCode code={second} language="javascript" />);
    expect(container.querySelector("code")?.textContent).toBe(second);
    await waitFor(() => expect(container.querySelector("figure")?.dataset.highlighted).toBe("true"));
    expect(container.querySelector("code")?.textContent).toBe(second);
  });

  it("keeps unknown languages and streaming code readable and forwards native attributes", async () => {
    const ref = React.createRef<HTMLElement>();
    const { container, rerender } = render(<HighlightedCode ref={ref} code="<unsafe>" language="unknown-language" className="custom" style={{ marginTop: 8 }} data-source="example" />);
    expect(ref.current).toBe(container.querySelector("figure"));
    expect(ref.current?.style.marginTop).toBe("8px");
    expect(ref.current?.dataset.source).toBe("example");
    expect(container.querySelector("unsafe")).toBeNull();
    expect(container.querySelector("code")?.textContent).toBe("<unsafe>");
    rerender(<HighlightedCode code="const value = 1;" language="javascript" streaming />);
    expect(container.querySelector("figure")?.dataset.highlighted).toBe("false");
    const results = await axe(container, { rules: { "color-contrast": { enabled: false } } });
    (expect(results) as unknown as { toHaveNoViolations(): void }).toHaveNoViolations();
  });

  it("copies exact source by keyboard, reports errors, and ignores stale writes", async () => {
    const user = userEvent.setup();
    let finish: (() => void) | undefined;
    const copy = vi.fn().mockImplementationOnce(() => new Promise<void>((resolve) => { finish = resolve; })).mockRejectedValueOnce(new Error("Denied")).mockResolvedValue(undefined);
    const { rerender } = render(<HighlightedCode code="first" onCopyCode={copy} downloadable={false} />);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Copy code" }));
    await user.keyboard("{Enter}");
    expect(copy).toHaveBeenCalledWith("first");
    expect((screen.getByRole("button", { name: "Copy code" }) as HTMLButtonElement).disabled).toBe(true);
    rerender(<HighlightedCode code="second" onCopyCode={copy} downloadable={false} />);
    finish?.();
    await waitFor(() => expect(screen.getByRole("status").textContent).toBe(""));
    await user.click(screen.getByRole("button", { name: "Copy code" }));
    await screen.findByText("Could not copy. Select and copy the source.");
    await user.click(screen.getByRole("button", { name: "Copy code" }));
    await screen.findByText("Code copied");
    expect(copy).toHaveBeenLastCalledWith("second");
  });

  it("keeps repeated source blocks named and reachable without duplicate landmarks", async () => {
    const { container } = render(<><HighlightedCode code="const first = 1;" language="javascript" streaming /><HighlightedCode code="const second = 2;" language="javascript" streaming /></>);
    for (const source of screen.getAllByRole("group", { name: "javascript source" })) {
      source.focus();
      expect(document.activeElement).toBe(source);
    }
    expect(await axe(container)).toHaveNoViolations();
  });
});
