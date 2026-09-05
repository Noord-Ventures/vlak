import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { MasterDetail } from "../src/components/master-detail";

afterEach(cleanup);

describe("MasterDetail instance landmarks", () => {
  const items = [{ id: "north", label: "North studio", detail: "4 active projects" }];

  it("names unselected detail regions from each caller's label", () => {
    render(<><MasterDetail label="Preview records" items={items} /><MasterDetail label="Studies" items={items} /></>);
    expect(screen.getByRole("region", { name: "Preview records details" })).toBeTruthy();
    expect(screen.getByRole("region", { name: "Studies details" })).toBeTruthy();
    expect(screen.queryByRole("region", { name: "Details" })).toBeNull();
  });

  it("keeps a unique region name after Back clears an active selection", async () => {
    render(<><MasterDetail label="Preview records" items={items} defaultValue="north" /><MasterDetail label="Studies" items={items} /></>);
    expect(screen.getByRole("region", { name: "North studio details" })).toBeTruthy();
    // jsdom does not apply the phone media query that exposes the Back control.
    const back = screen.getByText("Back to preview records");
    back.parentElement!.style.display = "block";
    await userEvent.click(screen.getByRole("button", { name: "Back to preview records" }));
    expect(screen.queryByRole("region", { name: "North studio details" })).toBeNull();
    expect(screen.getByRole("region", { name: "Preview records details" })).toBeTruthy();
    expect(screen.getByRole("region", { name: "Studies details" })).toBeTruthy();
    expect(new Set(screen.getAllByRole("region").map(region => region.getAttribute("aria-label"))).size).toBe(2);
  });
});
