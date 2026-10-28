import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Button } from "../src/components/button";
import { InlineForm } from "../src/components/inline-form";
import { vlak, vlakDisplay, vlakFont } from "../src/tokens.stylex";

afterEach(cleanup);

describe("brand hooks", () => {
  it("fills the primary action from --action and labels it from --action-text", () => {
    render(<><Button>Save</Button><Button variant="ghost">Cancel</Button></>);
    const primary = getComputedStyle(screen.getByRole("button", { name: "Save" }));
    expect(primary.backgroundColor).toBe(vlak.action);
    expect(primary.color).toBe(vlak.actionText);
    expect(getComputedStyle(screen.getByRole("button", { name: "Cancel" })).backgroundColor).not.toBe(vlak.action);
    expect(vlak.action).not.toBe(vlak.ink);
  });

  it("gives the inline form's submit the same fill", () => {
    render(<InlineForm onSubmit={() => {}} />);
    const submit = getComputedStyle(screen.getByRole("button", { name: "Subscribe" }));
    expect(submit.backgroundColor).toBe(vlak.action);
    expect(submit.color).toBe(vlak.actionText);
  });

  it("points the font exports at the hooks", () => {
    expect(vlakFont).toBe("var(--font-sans)");
    expect(vlakDisplay).toBe("var(--font-display)");
  });

  it("leaves no leaf with its own copy of the Inter stack", () => {
    const dir = join(import.meta.dirname, "../src/components");
    const leaves = readdirSync(dir, { recursive: true, encoding: "utf8" }).filter((file) => /\.tsx?$/.test(file));
    const inlined = leaves.filter((file) => /Inter,\s*-apple-system/.test(readFileSync(join(dir, file), "utf8")));
    expect(inlined, "leaves a brand font cannot reach").toEqual([]);
  });
});
