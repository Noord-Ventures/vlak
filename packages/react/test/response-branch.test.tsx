import * as React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { ResponseBranch } from "../src/components/response-branch";

afterEach(cleanup);
const branches = [{ id: "one", content: <p>Original response</p> }, { id: "two", content: <p>Second response</p> }, { id: "three", content: <p>Third response</p> }];

describe("ResponseBranch", () => {
  it("navigates saved alternatives with native buttons and retains selection after reordering", async () => {
    const user = userEvent.setup();
    const changed = vi.fn();
    const { container, rerender } = render(<ResponseBranch branches={branches} onValueChange={changed} />);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Next response" }));
    await user.keyboard("{Enter}");
    expect(screen.getByText("Second response")).toBeTruthy();
    expect(screen.queryByText("Original response")).toBeNull();
    expect(changed).toHaveBeenLastCalledWith("two");
    expect(screen.getByRole("status").textContent).toBe("2 / 3");
    rerender(<ResponseBranch branches={[branches[2]!, branches[0]!, branches[1]!]} onValueChange={changed} />);
    expect(screen.getByText("Second response")).toBeTruthy();
    expect(screen.getByRole("status").textContent).toBe("3 / 3");
    const results = await axe(container, { rules: { "color-contrast": { enabled: false } } });
    (expect(results) as unknown as { toHaveNoViolations(): void }).toHaveNoViolations();
  });

  it("requests controlled changes and forwards attributes without changing content until accepted", async () => {
    const user = userEvent.setup();
    const changed = vi.fn();
    const ref = React.createRef<HTMLDivElement>();
    const { rerender } = render(<ResponseBranch ref={ref} branches={branches} value="one" onValueChange={changed} className="custom" style={{ marginTop: 8 }} data-history="saved" />);
    await user.click(screen.getByRole("button", { name: "Next response" }));
    expect(changed).toHaveBeenCalledWith("two");
    expect(screen.getByText("Original response")).toBeTruthy();
    expect(ref.current?.style.marginTop).toBe("8px");
    expect(ref.current?.dataset.history).toBe("saved");
    rerender(<ResponseBranch branches={branches} value="two" onValueChange={changed} />);
    expect(screen.getByText("Second response")).toBeTruthy();
    await user.tab({ shift: true });
    await user.keyboard(" ");
    expect(changed).toHaveBeenLastCalledWith("one");
    expect(screen.getByText("Second response")).toBeTruthy();
  });

  it("handles removed, empty, and single alternatives without leaving dangling controls", () => {
    const { rerender } = render(<ResponseBranch branches={branches} defaultValue="two" />);
    rerender(<ResponseBranch branches={[branches[0]!]} defaultValue="two" />);
    expect(screen.getByText("Original response")).toBeTruthy();
    expect(screen.queryByRole("group")).toBeNull();
    rerender(<ResponseBranch branches={[]} />);
    expect(screen.getByText("No responses yet.")).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("isolates local widget state when alternatives share the same component type", async () => {
    function Draft({ initial }: { initial: string }) {
      const [value, setValue] = React.useState(initial);
      return <input aria-label="Branch draft" value={value} onChange={event => setValue(event.currentTarget.value)} />;
    }
    render(<ResponseBranch branches={[{ id: "one", content: <Draft initial="First draft" /> }, { id: "two", content: <Draft initial="Second draft" /> }]} />);
    await userEvent.clear(screen.getByRole("textbox", { name: "Branch draft" }));
    await userEvent.type(screen.getByRole("textbox", { name: "Branch draft" }), "Edited first draft");
    await userEvent.click(screen.getByRole("button", { name: "Next response" }));
    expect((screen.getByRole("textbox", { name: "Branch draft" }) as HTMLInputElement).value).toBe("Second draft");
    await userEvent.click(screen.getByRole("button", { name: "Previous response" }));
    expect((screen.getByRole("textbox", { name: "Branch draft" }) as HTMLInputElement).value).toBe("First draft");
  });
});
