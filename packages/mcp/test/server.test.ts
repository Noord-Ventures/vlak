import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createServer } from "../src/server";

const client = new Client({ name: "test", version: "0.0.0" });
const server = createServer();

const textOf = (result: unknown) => {
  const content = (result as { content: Array<{ type: string; text: string }> }).content;
  return content.map((c) => c.text).join("\n");
};
const resourceText = (result: { contents: unknown[] }) => (result.contents[0] as { text: string }).text;

beforeAll(async () => {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  await client.connect(clientTransport);
});

afterAll(async () => {
  await client.close();
  await server.close();
});

describe("vlak-mcp", () => {
  it("exposes the six tools", async () => {
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual(["get_component", "get_guide", "get_install", "get_tokens", "list_components", "search_components"]);
    expect(tools.every((tool) => tool.annotations?.readOnlyHint === true)).toBe(true);
    expect(tools.every((tool) => tool.outputSchema)).toBe(true);
  });

  it("lists components, optionally by category", async () => {
    const result = await client.callTool({ name: "list_components", arguments: {} });
    const all = JSON.parse(textOf(result));
    expect(result.structuredContent).toEqual(all);
    expect(all.count).toBeGreaterThan(60);
    expect(all.components.find((c: { name: string }) => c.name === "button")).toMatchObject({ title: "Button", category: "actions" });
    const forms = JSON.parse(textOf(await client.callTool({ name: "list_components", arguments: { category: "forms" } })));
    expect(forms.components.every((c: { category: string }) => c.category === "forms")).toBe(true);
    expect(forms.components.map((c: { name: string }) => c.name)).toContain("select");
  });

  it("gets a component with docs, props, example, snippet, and classes", async () => {
    const button = JSON.parse(textOf(await client.callTool({ name: "get_component", arguments: { name: "button" } })));
    expect(button.docs).toContain("# Button");
    expect(button.import).toBe('import { Button } from "@noorddev/vlak-react";');
    expect(button.example).toContain("<Button");
    expect(button.snippet).toContain("rs-btn-primary");
    expect(button.classes).toContain("rs-btn-primary");
    expect(button.props[0]).toMatchObject({ name: "Button", kind: "component", extends: "ButtonHTMLAttributes<HTMLButtonElement>" });
    expect(button.props[0].props.map((p: { name: string }) => p.name)).toEqual(["variant", "size", "grouped"]);
    expect(button.keyboard.length).toBeGreaterThan(0);
    expect(button.a11y.length).toBeGreaterThan(0);
  });

  it("errors on an unknown component with suggestions", async () => {
    const result = await client.callTool({ name: "get_component", arguments: { name: "snackbar" } });
    expect(result.isError).toBe(true);
    expect(textOf(result)).toContain("toast");
  });

  it("searches by alias and class", async () => {
    const sonner = JSON.parse(textOf(await client.callTool({ name: "search_components", arguments: { term: "sonner" } })));
    expect(sonner.hits[0].name).toBe("toast");
    const cls = JSON.parse(textOf(await client.callTool({ name: "search_components", arguments: { term: "rs-dialog" } })));
    expect(cls.hits.map((h: { name: string }) => h.name)).toContain("dialog");
  });

  it("gives install commands and the guide and tokens pages", async () => {
    const install = JSON.parse(textOf(await client.callTool({ name: "get_install", arguments: { name: "dialog" } })));
    expect(install.cli).toBe("npx @noorddev/vlak-cli add dialog");
    expect(install.shadcn).toBe("npx shadcn add https://vlak.dev/r/dialog.json");
    expect(install.package.import).toContain("DialogTitle");
    expect(install.registryDependencies).toContain("button");
    const guide = await client.callTool({ name: "get_guide", arguments: {} });
    const tokens = await client.callTool({ name: "get_tokens", arguments: {} });
    expect(textOf(guide)).toContain("# Vlak guide");
    expect(guide.structuredContent).toMatchObject({ page: "guide", markdown: expect.stringContaining("# Vlak guide") });
    expect(textOf(tokens)).toContain("--bg");
    expect(tokens.structuredContent).toMatchObject({ page: "tokens", markdown: expect.stringContaining("--bg") });
  });

  it("serves resources for the guide, tokens, and every component", async () => {
    const guide = await client.readResource({ uri: "vlak://docs/guide" });
    expect(resourceText(guide)).toContain("# Vlak guide");
    const tokens = await client.readResource({ uri: "vlak://tokens" });
    expect(resourceText(tokens)).toContain("--text");
    const select = await client.readResource({ uri: "vlak://docs/select" });
    expect(resourceText(select)).toContain("# Select");
    const { resources } = await client.listResources();
    expect(resources.map((r) => r.uri)).toContain("vlak://docs/button");
  });

  it("discovers health components and supplies their shared data contracts", async () => {
    const health = await client.readResource({ uri: "vlak://docs/health" });
    expect(resourceText(health)).toContain("Confirm recorded actions");
    const { resources } = await client.listResources();
    expect(resources.map(resource => resource.uri)).toContain("vlak://docs/health");
    const listed = textOf(await client.callTool({ name: "list_components", arguments: { category: "health" } }));
    expect(listed).toContain('"medication-schedule"');
    expect(listed).toContain('"check-in"');
    expect(listed).not.toContain('"button"');
  });

  it("discovers specialised collections and their application contracts", async () => {
    const { resources } = await client.listResources();
    for (const [category, component, contract] of [
      ["civic", "benefit-program", "Supply policy decisions"],
      ["science", "spectrum-plot", "Show the evidence behind a plot"],
      ["creative", "channel-strip", "Connect controls to an engine"],
      ["engineering", "alarm-panel", "Preserve independent states"],
      ["geospatial", "raster-band-mixer", "Assignment is distinct from reprojection"],
      ["robotics", "joint-panel", "Keep coordinate frames explicit"],
      ["electronics", "pad-inspector", "Preserve independent assembly flags"],
      ["microbiology", "colony-plate", "Distinguish annotations from source counts"],
    ] as const) {
      expect(resources.map(resource => resource.uri)).toContain(`vlak://docs/${category}`);
      expect(resourceText(await client.readResource({ uri: `vlak://docs/${category}` }))).toContain(contract);
      const listed = JSON.parse(textOf(await client.callTool({ name: "list_components", arguments: { category } })));
      expect(listed.components.map((item: { name: string }) => item.name)).toContain(component);
      expect(listed.components.every((item: { category: string }) => item.category === category)).toBe(true);
      const detail = JSON.parse(textOf(await client.callTool({ name: "get_component", arguments: { name: component } })));
      expect(detail.docs).toContain("## Props");
      expect(detail.example).toBeTruthy();
    }
  });
});
