import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { catalogComponents } from "../src/registry";

const repoRoot = join(import.meta.dirname, "../../..");
const docsDir = join(repoRoot, "registry/docs");

describe("generated docs", () => {
  // registry/docs is committed and CI checks it is in sync; tests only read.
  it("has a page for every catalog component, an index, tokens, a guide, and llms.txt", () => {
    for (const c of catalogComponents) expect(existsSync(join(docsDir, `${c.name}.md`)), `docs/${c.name}.md`).toBe(true);
    for (const f of ["index.md", "tokens.md", "guide.md", "ai.md", "ai-parity.md", "llms.txt", "llms-full.txt"]) expect(existsSync(join(docsDir, f)), f).toBe(true);
  });

  it("links every component from llms.txt and index.md", () => {
    const llms = readFileSync(join(docsDir, "llms.txt"), "utf8");
    const index = readFileSync(join(docsDir, "index.md"), "utf8");
    for (const c of catalogComponents) {
      expect(llms, `llms.txt links ${c.name}`).toContain(`/docs/${c.name}.md`);
      expect(index, `index.md links ${c.name}`).toContain(`](${c.name}.md)`);
    }
  });

  it("every page carries the install paths and the example", () => {
    for (const c of catalogComponents) {
      const page = readFileSync(join(docsDir, `${c.name}.md`), "utf8");
      expect(page).toContain(`npx @noorddev/vlak-cli add ${c.name}`);
      expect(page).toContain(`npx shadcn add https://vlak.dev/r/${c.name}.json`);
      expect(page).toContain("npm install @noorddev/vlak-react");
      expect(page).toContain("## Example");
      expect(page).toContain("## Accessibility");
    }
  });

  it("shows optional stylesheet instructions to stock shadcn users", () => {
    for (const component of catalogComponents.filter(entry => entry.styles?.length)) {
      const item = JSON.parse(readFileSync(join(repoRoot, "registry", `${component.name}.json`), "utf8"));
      for (const stylesheet of component.styles!) {
        const target = stylesheet.replace("@noorddev/vlak-react/", "styles/vlak/");
        expect(item.docs, `${component.name}: installer stylesheet instructions`).toContain(target);
        if (stylesheet.startsWith("@noorddev/vlak-react/")) expect(item.files.some((file: { target: string }) => file.target === target)).toBe(true);
      }
    }
  });
});
