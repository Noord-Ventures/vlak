import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it, vi } from "vitest";
import { Select } from "../src/components/select";

afterEach(cleanup);
const options = [{ value: "a", label: "Alpha" }, { value: "b", label: "Beta" }];

it("does not accept an open-menu choice after its owning fieldset becomes disabled", async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  const { rerender } = render(<fieldset><Select aria-label="Choice" options={options} defaultValue="a" onValueChange={change} /></fieldset>);
  await user.click(screen.getByRole("combobox"));
  rerender(<fieldset disabled><Select aria-label="Choice" options={options} defaultValue="a" onValueChange={change} /></fieldset>);
  expect((screen.getByRole("combobox") as HTMLButtonElement).matches(":disabled")).toBe(true);
  const option = screen.queryByRole("option", { name: "Beta" });
  if (option) fireEvent.click(option);
  expect(change).not.toHaveBeenCalled();
  expect(screen.getByRole("combobox").textContent).toBe("Alpha");
});
