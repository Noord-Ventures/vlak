import { act, cleanup, render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { Select } from "../src/components/select";

afterEach(cleanup);
const options = [{ value: "a", label: "Alpha" }, { value: "b", label: "Beta", disabled: true }, { value: "c", label: "Charlie" }];

describe("Select in compound forms", () => {
  it("skips unavailable options for arrows and typeahead and rejects their pointer selection", async () => {
    const user = userEvent.setup(); const change = vi.fn();
    render(<Select aria-label="Channel" options={options} defaultValue="a" onValueChange={change} fullWidth />);
    await user.tab(); await user.keyboard("{Enter}{ArrowDown}{Enter}");
    expect(change).toHaveBeenLastCalledWith("c");
    await user.keyboard("{Home}");
    expect(screen.getByRole("option", { name: "Beta" }).getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(screen.getByRole("option", { name: "Beta" }));
    expect(change).toHaveBeenCalledTimes(1);
    await user.keyboard("b{Enter}");
    expect(change).toHaveBeenLastCalledWith("a");
  });
  it("submits and resets through an external form", async () => {
    const user = userEvent.setup();
    const { container } = render(<><form id="record" /><Select aria-label="Channel" name="channel" form="record" options={options} defaultValue="a" /></>);
    await user.click(screen.getByRole("combobox")); await user.keyboard("{End}{Enter}");
    expect(new FormData(container.querySelector("form")!).get("channel")).toBe("c");
    await act(async () => container.querySelector("form")!.reset());
    expect(new FormData(container.querySelector("form")!).get("channel")).toBe("a");
    expect(screen.getByRole("combobox").textContent).toBe("Alpha");
  });
  it("keeps a controlled value when an edit is rejected and when resetting", async () => {
    const user = userEvent.setup(); const change = vi.fn();
    const { container } = render(<form><Select aria-label="Channel" name="channel" options={options} value="c" defaultValue="a" onValueChange={change} /></form>);
    await user.click(screen.getByRole("combobox")); await user.keyboard("{Home}{Enter}");
    expect(change).toHaveBeenCalledWith("a");
    await act(async () => container.querySelector("form")!.reset());
    expect(screen.getByRole("combobox").textContent).toBe("Charlie");
    expect(new FormData(container.querySelector("form")!).get("channel")).toBe("c");
  });
  it("retains readonly form values and omits disabled controls", () => {
    const { container, rerender } = render(<form><Select aria-label="Channel" name="channel" options={options} value="a" readOnly /></form>);
    expect(new FormData(container.querySelector("form")!).get("channel")).toBe("a");
    expect((screen.getByRole("combobox") as HTMLButtonElement).disabled).toBe(true);
    rerender(<form><Select aria-label="Channel" name="channel" options={options} value="a" readOnly disabled /></form>);
    expect(new FormData(container.querySelector("form")!).has("channel")).toBe(false);
  });
  it("reports required validation at the visible trigger and clears the error after selection", async () => {
    const user = userEvent.setup();
    const { container } = render(<form><Select aria-label="Channel" aria-describedby="help" name="channel" options={options} required /><p id="help">Select a supplied channel</p></form>);
    let valid = true;
    act(() => { valid = container.querySelector("form")!.checkValidity(); });
    expect(valid).toBe(false);
    const trigger = screen.getByRole("combobox");
    expect(document.activeElement).toBe(trigger);
    expect(trigger.getAttribute("aria-invalid")).toBe("true");
    expect(trigger.getAttribute("aria-describedby")).toContain("help");
    expect(screen.getByText("Choose an option")).toBeTruthy();
    await user.keyboard("{Enter}{Enter}");
    expect(container.querySelector("form")!.checkValidity()).toBe(true);
    expect(trigger.getAttribute("aria-invalid")).toBeNull();
  });
  it("does not treat an unknown controlled value as satisfying required", () => {
    const { container } = render(<form><Select aria-label="Channel" name="channel" options={options} required value="missing" /></form>);
    act(() => { expect(container.querySelector("form")!.checkValidity()).toBe(false); });
    expect(screen.getByText("Choose an option")).toBeTruthy();
  });
  it("keeps the native bridge out of the accessibility tree and passes axe while open", async () => {
    const user = userEvent.setup();
    const { container } = render(<Select aria-label="Channel" options={options} defaultValue="a" required fullWidth />);
    expect(screen.getAllByRole("combobox")).toHaveLength(1);
    await user.click(screen.getByRole("combobox"));
    expect((await axe(container, { rules: { "color-contrast": { enabled: false } } })).violations).toEqual([]);
  });
});
