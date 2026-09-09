import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Combobox } from "../src/components/combobox";

afterEach(cleanup);
const options = [{ value: "one", label: "Disabled first", disabled: true }, { value: "two", label: "Available second" }, { value: "three", label: "Disabled middle", disabled: true }, { value: "four", label: "Available fourth" }, { value: "five", label: "Disabled last", disabled: true }];
const active = (input: HTMLElement) => document.getElementById(input.getAttribute("aria-activedescendant") ?? "")?.textContent;
describe("Combobox disabled options", () => {
  it("skips unavailable rows for arrows, Home, End and page navigation", async () => {
    const user = userEvent.setup(); const onValueChange = vi.fn(); render(<Combobox options={options} onValueChange={onValueChange} aria-label="Choice" />);
    const input = screen.getByRole("combobox"); input.focus(); await user.keyboard("{ArrowDown}"); expect(active(input)).toBe("Available second");
    await user.keyboard("{ArrowDown}"); expect(active(input)).toBe("Available fourth"); await user.keyboard("{ArrowDown}"); expect(active(input)).toBe("Available fourth");
    await user.keyboard("{ArrowUp}"); expect(active(input)).toBe("Available second"); await user.keyboard("{End}"); expect(active(input)).toBe("Available fourth");
    await user.keyboard("{Home}"); expect(active(input)).toBe("Available second"); await user.keyboard("{PageDown}"); expect(active(input)).toBe("Available fourth");
    await user.keyboard("{PageUp}{Enter}"); expect(onValueChange).toHaveBeenCalledExactlyOnceWith("two");
    await user.keyboard("{ArrowUp}"); expect(active(input)).toBe("Available fourth");
  });
  it("does not activate disabled rows with pointer or Enter in an all-disabled result", async () => {
    const user = userEvent.setup(); const onValueChange = vi.fn(); render(<Combobox options={options} onValueChange={onValueChange} aria-label="Choice" />);
    const input = screen.getByRole("combobox"); await user.click(input); const disabled = screen.getByRole("option", { name: "Disabled first" });
    fireEvent.pointerEnter(disabled); await user.click(disabled); expect(disabled.getAttribute("aria-disabled")).toBe("true"); expect(onValueChange).not.toHaveBeenCalled();
    await user.type(input, "Disabled"); await user.keyboard("{ArrowDown}{Home}{End}{ArrowUp}{Enter}"); expect(input.getAttribute("aria-activedescendant")).toBeNull(); expect(onValueChange).not.toHaveBeenCalled(); expect(input.getAttribute("aria-expanded")).toBe("true");
  });
  it("preserves controlled disabled selection display, adapts changing options and closes when disabled", async () => {
    const user = userEvent.setup(); const { rerender } = render(<Combobox options={options} value="three" aria-label="Choice" />);
    const input = screen.getByRole("combobox") as HTMLInputElement; expect(input.value).toBe("Disabled middle");
    await user.click(input); expect(active(input)).toBe("Available second"); expect(screen.getByRole("option", { name: "Disabled middle" }).getAttribute("aria-selected")).toBe("true");
    rerender(<Combobox options={options.map(option => ({ ...option, disabled: option.value !== "four" }))} value="three" aria-label="Choice" />); expect(active(input)).toBe("Available fourth");
    rerender(<Combobox options={options} value="three" aria-label="Choice" disabled />); expect(screen.queryByRole("listbox")).toBeNull(); expect(input.disabled).toBe(true); expect(input.value).toBe("Disabled middle");
  });
});
