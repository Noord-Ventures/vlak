import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { catalogComponents } from "../src/registry";
import { domainCollections } from "../src/domains";

describe("specialised collection delivery", () => {
  const index = readFileSync(new URL("../../../registry/docs/llms.txt", import.meta.url), "utf8");
  for (const collection of domainCollections) {
    it(`distributes the complete ${collection.name} collection and contracts`, () => {
      const guide = readFileSync(new URL(`../../../registry/docs/${collection.name}.md`, import.meta.url), "utf8");
      const components = catalogComponents.filter(component => component.category === collection.name);
      const names = collection.groups.flatMap(group => [...group.components]);
      expect(new Set(names).size).toBe(names.length);
      expect(components.map(component => component.name).sort()).toEqual([...names].sort());
      for (const component of components) {
        expect(guide).toContain(`/docs/${component.name}.md`);
        expect(component.usage?.use.length).toBeGreaterThan(0);
        expect(component.a11y?.length).toBeGreaterThan(0);
      }
      expect(index).toContain(`https://vlak.dev/docs/${collection.name}.md`);
      for (const rule of collection.contracts) expect(guide).toContain(rule.description);
    });
  }
});
