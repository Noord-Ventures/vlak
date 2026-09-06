/**
 * The Vlak MCP server: tools and resources over the registry bundle,
 * the generated docs, and props.json. `createServer` builds it without
 * a transport so the entry point and the tests can attach their own.
 */

import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { type RegistryItem, components, docsFor, findComponent, loadBundle, loadProps } from "./data.js";

const HOST = "https://vlak.dev";
const REACT = "@noorddev/vlak-react";
const CLI = "@noorddev/vlak-cli";

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] });
const json = (value: unknown) => text(JSON.stringify(value, null, 2));

function summary(item: RegistryItem) {
  const meta = item.meta?.vlak ?? {};
  return {
    name: item.name,
    title: item.title,
    description: item.description,
    category: meta.category ?? "",
    aliases: meta.aliases ?? [],
    cssOnly: meta.cssOnly ?? false,
  };
}

export function importLine(name: string): string | undefined {
  const exports = loadProps().components[name]?.exports ?? [];
  const names = exports.map((e) => e.name).sort((a, b) => a.localeCompare(b));
  return names.length ? `import { ${names.join(", ")} } from "${REACT}";` : undefined;
}

export function installFor(name: string) {
  const item = findComponent(name);
  if (!item) return undefined;
  return {
    name,
    package: {
      install: `npm install ${REACT}`,
      css: `import "${REACT}/css";`,
      import: importLine(name) ?? null,
    },
    cli: `npx ${CLI} add ${name}`,
    shadcn: `npx shadcn add ${HOST}/r/${name}.json`,
    cssOnly: {
      stylesheet: `import "@noorddev/vlak/css";`,
      markup: item.meta?.vlak?.snippet ?? "",
    },
    registryDependencies: item.meta?.vlak?.registryDependencies ?? [],
  };
}

export function searchComponents(term: string) {
  const q = term.trim().toLowerCase();
  if (!q) return [];
  const hits: Array<ReturnType<typeof summary> & { matched: string[]; score: number }> = [];
  for (const item of components()) {
    const meta = item.meta?.vlak ?? {};
    const matched: string[] = [];
    let score = 0;
    if (item.name.includes(q)) {
      matched.push("name");
      score += item.name === q ? 100 : 40;
    }
    if (item.title.toLowerCase().includes(q)) {
      matched.push("title");
      score += 30;
    }
    if ((meta.aliases ?? []).some((a) => a.toLowerCase().includes(q))) {
      matched.push("alias");
      score += 20;
    }
    if (item.description.toLowerCase().includes(q)) {
      matched.push("description");
      score += 10;
    }
    if ((meta.classes ?? []).some((c) => c.includes(q))) {
      matched.push("class");
      score += 5;
    }
    if (matched.length) hits.push({ ...summary(item), matched, score });
  }
  return hits.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name)).map(({ score: _score, ...hit }) => hit);
}

export function createServer(): McpServer {
  const version = loadBundle().version;
  const server = new McpServer(
    { name: "vlak", version },
    {
      instructions:
        "Vlak is a minimal design system: React components (precompiled StyleX, one stylesheet), rs-* CSS, and a shadcn-compatible registry. Start with get_guide for install paths and conventions, list_components or search_components to find a component, get_component for its docs, props, and example, get_install for the exact commands, get_tokens for the design tokens.",
    },
  );

  server.registerTool(
    "list_components",
    {
      title: "List Vlak components",
      description: "Every component in the catalogue with name, title, description, category, and aliases. Filter by category: actions, forms, navigation, feedback, surfaces, content, icons, charts, patterns, health, civic, science, creative.",
      inputSchema: { category: z.string().optional().describe("Only this category") },
    },
    ({ category }) => {
      const all = components().map(summary);
      const hits = category ? all.filter((c) => c.category === category.trim().toLowerCase()) : all;
      return json({ version, count: hits.length, components: hits });
    },
  );

  server.registerTool(
    "get_component",
    {
      title: "Get a Vlak component",
      description: "The markdown docs page for a component (install paths, example, props tables, keyboard, accessibility), plus its props as JSON, the CSS-only snippet, the React example, its classes, and aliases. Pass the kebab-case name from list_components or search_components.",
      inputSchema: { name: z.string().describe("Component name, e.g. \"button\" or \"dropdown-menu\"") },
    },
    ({ name }) => {
      const key = name.trim().toLowerCase();
      const item = findComponent(key);
      if (!item) {
        const near = searchComponents(key).slice(0, 5).map((h) => h.name);
        return { ...text(`No component named "${name}".${near.length ? ` Did you mean: ${near.join(", ")}?` : ""} Use list_components or search_components.`), isError: true };
      }
      const meta = item.meta?.vlak ?? {};
      return json({
        ...summary(item),
        docs: docsFor(key) ?? null,
        import: importLine(key) ?? null,
        example: meta.example ?? null,
        snippet: meta.snippet ?? null,
        classes: meta.classes ?? [],
        usage: meta.usage ?? null,
        keyboard: meta.keyboard ?? [],
        a11y: meta.a11y ?? [],
        registryDependencies: meta.registryDependencies ?? [],
        props: loadProps().components[key]?.exports ?? [],
        page: `${HOST}/components/${key}/`,
        registryItem: `${HOST}/r/${key}.json`,
      });
    },
  );

  server.registerTool(
    "search_components",
    {
      title: "Search Vlak components",
      description: "Find components by name, title, description, alias (shadcn/ui, Radix, and common names such as Sonner, Drawer, Combobox), or rs-* class. Returns matches ranked by field.",
      inputSchema: { term: z.string().describe("Search term, e.g. \"menu\", \"snackbar\", \"rs-input\"") },
    },
    ({ term }) => json({ term, hits: searchComponents(term) }),
  );

  server.registerTool(
    "get_tokens",
    {
      title: "Get Vlak tokens",
      description: "The design tokens page: every CSS custom property with its light and dark value and StyleX alias, plus the raw token groups (type scale, grid, radius, motion, breakpoints, control sizes).",
    },
    () => text(docsFor("tokens") ?? "Tokens page not bundled."),
  );

  server.registerTool(
    "get_install",
    {
      title: "Get install commands",
      description: "The three ways to install one component (npm package plus import line, Vlak CLI, shadcn CLI) and the CSS-only markup, with its registry dependencies.",
      inputSchema: { name: z.string().describe("Component name") },
    },
    ({ name }) => {
      const install = installFor(name.trim().toLowerCase());
      if (!install) return { ...text(`No component named "${name}". Use list_components or search_components.`), isError: true };
      return json(install);
    },
  );

  server.registerTool(
    "get_guide",
    {
      title: "Get the Vlak guide",
      description: "Install paths, theming (data-theme, color-scheme), cascade layers and overriding, StyleX usage, the rs-* CSS path, the CLI, the registry, and the conventions every component follows (controlled/uncontrolled props, className merging, forwarded refs, naming). Read this first.",
    },
    () => text(docsFor("guide") ?? "Guide not bundled."),
  );

  server.registerResource(
    "guide",
    "vlak://docs/guide",
    { title: "Vlak guide", description: "Install, theming, layers, StyleX, CLI, registry, conventions", mimeType: "text/markdown" },
    (uri) => ({ contents: [{ uri: uri.href, mimeType: "text/markdown", text: docsFor("guide") ?? "" }] }),
  );

  server.registerResource(
    "health-guide",
    "vlak://docs/health",
    { title: "Health, wellness, and care", description: "Health components, composition guidance, and data and action contracts", mimeType: "text/markdown" },
    (uri) => ({ contents: [{ uri: uri.href, mimeType: "text/markdown", text: docsFor("health") ?? "" }] }),
  );

  for (const [name, title] of [["civic", "Civic"], ["science", "Science"], ["creative", "Creative tools"]] as const) {
    server.registerResource(
      `${name}-guide`,
      `vlak://docs/${name}`,
      { title, description: `${title} components, composition guidance, and data and action contracts`, mimeType: "text/markdown" },
      (uri) => ({ contents: [{ uri: uri.href, mimeType: "text/markdown", text: docsFor(name) ?? "" }] }),
    );
  }

  server.registerResource(
    "tokens",
    "vlak://tokens",
    { title: "Vlak tokens", description: "Every custom property, light and dark, with StyleX aliases", mimeType: "text/markdown" },
    (uri) => ({ contents: [{ uri: uri.href, mimeType: "text/markdown", text: docsFor("tokens") ?? "" }] }),
  );

  server.registerResource(
    "component-docs",
    new ResourceTemplate("vlak://docs/{name}", {
      list: () => ({
        resources: components().map((item) => ({
          uri: `vlak://docs/${item.name}`,
          name: item.name,
          title: item.title,
          description: item.description,
          mimeType: "text/markdown",
        })),
      }),
      complete: {
        name: (value) => components().map((item) => item.name).filter((n) => n.startsWith(value.toLowerCase())),
      },
    }),
    { title: "Vlak component docs", description: "One markdown page per component", mimeType: "text/markdown" },
    (uri, { name }) => {
      const key = String(name).toLowerCase();
      const page = docsFor(key);
      if (!page) throw new Error(`No docs for "${key}"`);
      return { contents: [{ uri: uri.href, mimeType: "text/markdown", text: page }] };
    },
  );

  return server;
}
