import * as React from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { JSONViewer } from "../src/components/json-viewer";
import { DiffViewer } from "../src/components/diff-viewer";

afterEach(cleanup);

describe("bounded data inspection", () => {
  it("does not execute getters, including properties outside the visible budget", () => {
    const getter = vi.fn(() => { throw new Error("Inspection must not execute this"); });
    const data = Object.fromEntries(Array.from({ length: 200 }, (_, index) => [`key${index}`, index]));
    Object.defineProperty(data, "firstGetter", { enumerable: true, get: getter });
    Object.defineProperty(data, "secondGetter", { enumerable: true, get: getter });
    render(<JSONViewer data={data} maxEntries={201} />);
    expect(getter).not.toHaveBeenCalled();
    expect(screen.getByText("[Getter]")).toBeTruthy();
    expect(screen.getByText("Additional entries not displayed")).toBeTruthy();
    expect(screen.queryByText("secondGetter:")).toBeNull();
  });

  it("does not execute array accessors and observes the total node budget", () => {
    const getter = vi.fn(() => 42);
    const data = [0, 1, 2, 3];
    Object.defineProperty(data, "0", { enumerable: true, get: getter });
    render(<JSONViewer data={data} maxNodes={2} />);
    expect(getter).not.toHaveBeenCalled();
    expect(screen.getByText("[Getter]")).toBeTruthy();
    expect(screen.getByText("3 additional entries not displayed")).toBeTruthy();
  });

  it("truncates long strings before escaping them into display text", () => {
    const { container } = render(<JSONViewer data={{ payload: '"'.repeat(1_000_000) }} maxStringLength={100} />);
    expect(container.textContent?.length).toBeLessThan(500);
    expect(screen.getByText(/\[truncated\]/)).toBeTruthy();
  });

  it("pages diffs without dropping any lines and resets when the documents change", async () => {
    const before = Array.from({ length: 600 }, (_, index) => `line ${index}`).join("\n");
    const { rerender } = render(<DiffViewer before={before} after={before} pageSize={200} />);
    const table = screen.getByRole("table");
    expect(within(table).getAllByRole("row")).toHaveLength(201);
    expect(screen.getByRole("status").textContent).toBe("Lines 1–200 of 600");
    const next = screen.getByRole("button", { name: "Next lines" });
    next.focus();
    await userEvent.keyboard("{Enter}");
    expect(screen.getByRole("status").textContent).toBe("Lines 201–400 of 600");
    expect(screen.getByText("line 200")).toBeTruthy();
    expect(screen.queryByText("line 0")).toBeNull();
    await userEvent.click(next);
    expect(screen.getByText("line 599")).toBeTruthy();
    expect((next as HTMLButtonElement).disabled).toBe(true);
    rerender(<DiffViewer before={`${before}\nlast`} after={`${before}\nlast`} pageSize={200} />);
    expect(screen.getByRole("status").textContent).toBe("Lines 1–200 of 601");
    expect(screen.getByText("line 0")).toBeTruthy();
  });

  it("caps even an excessive caller-supplied diff page size", () => {
    const before = Array.from({ length: 2000 }, (_, index) => String(index)).join("\n");
    render(<DiffViewer before={before} after={before} pageSize={1_000_000} />);
    expect(within(screen.getByRole("table")).getAllByRole("row")).toHaveLength(1001);
    expect(screen.getByRole("status").textContent).toBe("Lines 1–1000 of 2000");
  });
});
