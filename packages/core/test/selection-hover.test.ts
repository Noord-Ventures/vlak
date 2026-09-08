import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const cssDir = join(import.meta.dirname, "../css");
const hover = ":hover:not(:disabled):not([aria-disabled='true'])";

function declarations(css: string, selector: string): string[] {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return [...css.matchAll(new RegExp(`${escaped}\\{([^}]+)\\}`, "g"))].map(match => match[1]!);
}

describe("persistent selected paint", () => {
  for (const [component, base, selected, fill, border] of [
    ["toggle", "rs-toggle", "rs-toggle-pressed", "var(--text)", "var(--text)"],
    ["pagination", "rs-page", "rs-page-on", "var(--text)", "transparent"],
    ["calendar", "rs-cal-day", "rs-cal-day-selected", "var(--text)", undefined],
    ["menubar", "rs-menubar-trigger", "rs-menubar-trigger-open", "var(--control-fill)", undefined],
    ["file-browser", "rs-file-browser-action", "rs-file-browser-view-active", "var(--control-fill)", undefined],
  ] as const) {
    it(`keeps ${component} selection when the pointer remains over it`, () => {
      const css = readFileSync(join(cssDir, `components/${component}.css`), "utf8");
      const rest = declarations(css, `.${selected}`);
      const hovered = declarations(css, `.${selected}${hover}`);

      // The selected rule repeats its own paint at the same specificity as
      // base hover. This protects both React and semantic-class consumers.
      expect(rest[0]).toContain(`background-color:${fill}`);
      expect(hovered[0]).toContain(`background-color:${fill}`);
      expect(css.indexOf(`.${selected}${hover}{`)).toBeGreaterThan(css.indexOf(`.${base}${hover}{`));
      if (border) expect(hovered[0]).toContain(`border-color:${border}`);
      if (component === "toggle") expect(hovered[0]).toContain("color:var(--bg)");

      // High-contrast selection must survive hover as well as its rest state.
      expect(rest.some(rule => rule.includes("background-color:Highlight"))).toBe(true);
      expect(hovered.some(rule => rule.includes("background-color:Highlight"))).toBe(true);
      if (component === "toggle") expect(hovered.some(rule => rule.includes("color:HighlightText"))).toBe(true);
    });
  }

  it("does not repaint disabled controls through hover selectors", () => {
    for (const component of ["toggle", "pagination", "calendar", "menubar", "tag-input"]) {
      const css = readFileSync(join(cssDir, `components/${component}.css`), "utf8");
      const selectors = [...css.matchAll(/([^{}]+)\{[^{}]*\}/g)]
        .map(match => match[1]!)
        .filter(selector => selector.includes(":hover"));
      expect(selectors.length).toBeGreaterThan(0);
      for (const selector of selectors) {
        expect(selector).toContain(":not(:disabled)");
        expect(selector).toContain(":not([aria-disabled='true'])");
      }
    }
  });

  it("keeps the compatibility touch layer free of overriding control paint", () => {
    const css = readFileSync(join(cssDir, "touch.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    expect(css.trim()).toBe("");
  });
});
