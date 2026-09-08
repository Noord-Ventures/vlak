import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const componentDir = join(import.meta.dirname, "../css/components");

/** Walk generated CSS blocks without depending on formatting or media order. */
function rules(css: string, conditions: string[] = []): Array<{ selector: string; conditions: string[] }> {
  const result: Array<{ selector: string; conditions: string[] }> = [];
  const source = css.replace(/\/\*[\s\S]*?\*\//g, "");
  let cursor = 0;
  while (cursor < source.length) {
    const open = source.indexOf("{", cursor);
    if (open < 0) break;
    const header = source.slice(cursor, open).trim();
    let end = open + 1;
    let depth = 1;
    while (depth && end < source.length) {
      if (source[end] === "{") depth++;
      if (source[end] === "}") depth--;
      end++;
    }
    if (header.startsWith("@")) result.push(...rules(source.slice(open + 1, end - 1), [...conditions, header]));
    else result.push({ selector: header, conditions });
    cursor = end;
  }
  return result;
}

describe("pointer hover capabilities", () => {
  it("keeps every component hover rule off non-hovering touch pointers", () => {
    const hoverRules = readdirSync(componentDir).filter(name => name.endsWith(".css")).flatMap(name =>
      rules(readFileSync(join(componentDir, name), "utf8"))
        .filter(rule => rule.selector.includes(":hover"))
        .map(rule => ({ ...rule, name })),
    );
    expect(hoverRules.length).toBeGreaterThan(30);
    for (const rule of hoverRules) {
      const query = rule.conditions.join(" ");
      expect(query, `${rule.name}: ${rule.selector}`).toMatch(/\(hover:\s*hover\)/);
      expect(query, `${rule.name}: ${rule.selector}`).toMatch(/\(pointer:\s*fine\)/);
    }
  });

  it("does not let generic button hover mask disabled or persistent selection", () => {
    const buttonRules = rules(readFileSync(join(componentDir, "button.css"), "utf8"));
    const hoverRules = buttonRules.filter(rule => rule.selector.includes(":hover"));
    expect(hoverRules.length).toBeGreaterThan(0);
    for (const { selector } of hoverRules) {
      expect(selector).toContain(":not(:disabled)");
      for (const attribute of ["aria-disabled", "aria-pressed", "aria-selected"]) {
        expect(selector).toContain(`:not([${attribute}='true'])`);
      }
      expect(selector).toContain(":not([aria-current])");
    }
    expect(buttonRules.some(rule => rule.selector.includes(":focus-visible") && !rule.conditions.length)).toBe(true);
  });
});
