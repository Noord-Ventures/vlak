import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { catalogComponents } from "../src/registry";
import { healthDataContract, healthWorkflows } from "../src/health";

describe("health collection delivery", () => {
  const components = catalogComponents.filter(component => component.category === "health");
  const names = components.map(component => component.name);
  const guide = readFileSync(new URL("../../../registry/docs/health.md", import.meta.url), "utf8");
  const index = readFileSync(new URL("../../../registry/docs/llms.txt", import.meta.url), "utf8");

  it("documents every workflow component through the health category", () => {
    const workflowNames = healthWorkflows.flatMap(workflow => [...workflow.components]);
    expect(new Set(workflowNames).size).toBe(workflowNames.length);
    expect([...names].sort()).toEqual([...workflowNames].sort());
    for (const component of components) {
      expect(guide).toContain(`/docs/${component.name}.md`);
      expect(component.usage?.use.length).toBeGreaterThan(0);
      expect(component.a11y?.length).toBeGreaterThan(0);
    }
  });

  it("distributes the data and action contracts to agents", () => {
    expect(index).toContain("https://vlak.dev/docs/health.md");
    expect(index).toContain("## Health");
    for (const rule of healthDataContract) expect(guide).toContain(rule.description);
  });
});
