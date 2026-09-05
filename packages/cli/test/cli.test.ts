import { mkdtempSync, readFileSync, existsSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { add, docsFor, init, list, loadConfig, resolveWithDependencies, search } from "../src/lib";

let cwd: string;

beforeEach(() => {
  cwd = mkdtempSync(join(tmpdir(), "vlak-cli-"));
});

afterEach(() => {
  rmSync(cwd, { recursive: true, force: true });
});

describe("init", () => {
  it("writes vlak.css, Inter files, a specimen page, and vlak.json", () => {
    const results = init(cwd);
    expect(results.map((r) => r.status).every((s) => s === "written")).toBe(true);
    const css = readFileSync(join(cwd, "styles/vlak.css"), "utf8");
    expect(css).toContain("VLAK");
    expect(css).toContain(".rs-btn-primary");
    expect(css).toContain("font-family:Inter");
    expect(css).not.toContain("Messina");
    expect(existsSync(join(cwd, "styles/fonts/inter/InterVariable-latin.woff2"))).toBe(true);
    expect(existsSync(join(cwd, "styles/fonts/inter/InterVariable-latin-ext.woff2"))).toBe(true);
    expect(readFileSync(join(cwd, "styles/fonts/inter/OFL.txt"), "utf8")).toContain("SIL Open Font License");
    const page = readFileSync(join(cwd, "index.html"), "utf8");
    expect(page).toContain('href="styles/vlak.css"');
    expect(page).toContain("workhorse of a design system");
    expect(page).toContain("rs-btn-primary");
    expect(page).toContain("184 column + 20 gutter");
    expect(page).toContain("rs-kbd");
    expect(page).toContain("rs-chart");
    expect(page).toContain("scheme-moon");
    expect(page).toContain("Module cells sit flush on the gridline");
    expect(page).not.toContain("Dark scheme");
    expect(page).not.toContain("programme");
    expect(page).not.toContain("No radius");
    expect(page).not.toContain("Hello world");
    expect(page).not.toContain("lighthouse");
    expect(page).not.toContain("U+0041");
    expect(page).not.toContain("Messina");
    expect(page).not.toContain("tailwind");
    expect(page).not.toContain("radix");
    expect(loadConfig(cwd)).toMatchObject({ cssDir: "styles", componentsDir: "components/vlak" });
  });

  it("honors --registry and custom dirs", () => {
    init(cwd, { cssDir: "app/styles", registry: "https://vlak.dev/r" });
    expect(existsSync(join(cwd, "app/styles/vlak.css"))).toBe(true);
    expect(existsSync(join(cwd, "app/styles/fonts/inter/OFL.txt"))).toBe(true);
    expect(loadConfig(cwd).registry).toBe("https://vlak.dev/r");
  });

  it("never clobbers an existing file without overwrite", () => {
    init(cwd);
    writeFileSync(join(cwd, "styles/vlak.css"), "/* mine */");
    const results = init(cwd);
    expect(results[0]!.status).toBe("skipped");
    expect(readFileSync(join(cwd, "styles/vlak.css"), "utf8")).toBe("/* mine */");
    const overwritten = init(cwd, { overwrite: true });
    expect(overwritten[0]!.status).toBe("written");
  });
});

describe("add", () => {
  it("installs all 40 additions and shared helper closures exactly once", async () => {
    const additions = [
      "number-field", "range-slider", "multi-select", "tag-input", "date-range-picker", "time-field", "file-upload", "transfer-list", "inline-edit", "rating",
      "description-list", "metric", "activity-timeline", "code-block", "json-viewer", "diff-viewer", "error-summary", "notification-center", "task-progress", "connection-status",
      "tree-view", "toolbar", "bottom-navigation", "overflow-list", "filter-bar", "query-builder", "sortable-list", "virtual-list", "master-detail", "property-grid",
      "playback-controls", "media-scrubber", "media-player", "waveform", "image-viewer", "canvas-controls", "message-composer", "file-browser", "kanban-board", "scheduler",
    ];
    init(cwd, { componentsDir: "src/ui" });
    const { outcomes, unknown } = await add(cwd, additions, { overwrite: true });
    expect(unknown).toEqual([]);
    const results = outcomes.flatMap(outcome => outcome.results);
    expect(new Set(results.map(result => result.path)).size).toBe(results.length);
    expect(results.every(result => result.status === "written")).toBe(true);
    for (const name of additions) expect(existsSync(join(cwd, "src/ui", `${name}.tsx`)), name).toBe(true);
    for (const helper of ["use-input-value.ts", "use-overlay-position.ts", "merge-refs.ts", "rs.ts", "cx.ts"]) {
      expect(results.filter(result => result.path === `src/ui/${helper}`), helper).toHaveLength(1);
    }
    for (const result of results) {
      const file = join(cwd, result.path);
      for (const match of readFileSync(file, "utf8").matchAll(/from\s*["'](\.[^"']+)["']/g)) {
        const base = join(file, "..", match[1]!);
        expect([`${base}.ts`, `${base}.tsx`, join(base, "index.ts"), join(base, "index.tsx")].some(existsSync), `${result.path}: ${match[1]}`).toBe(true);
      }
    }
    const repeated = await add(cwd, additions);
    const unchanged = repeated.outcomes.flatMap(outcome => outcome.results);
    expect(unchanged).toHaveLength(results.length);
    expect(unchanged.every(result => result.status === "unchanged")).toBe(true);
  });

  it("rejects conflicting shared files before writing any source, even with overwrite", async () => {
    init(cwd);
    const registry = join(cwd, "conflicting-registry");
    mkdirSync(registry);
    mkdirSync(join(cwd, "components/vlak"), { recursive: true });
    writeFileSync(join(cwd, "components/vlak/shared.ts"), "// consumer's helper\n");
    for (const name of ["first", "second"]) {
      writeFileSync(join(registry, `${name}.json`), JSON.stringify({
        name,
        files: [
          { path: `vlak/${name}.tsx`, target: `components/vlak/${name}.tsx`, content: "export {};", type: "registry:component" },
          { path: "vlak/shared.ts", target: name === "first" ? "components/vlak/shared.ts" : "components/vlak/helpers/../shared.ts", content: `// ${name}\n`, type: "registry:file" },
        ],
      }));
    }
    await expect(add(cwd, ["first", "second"], { registry, overwrite: true })).rejects.toThrow("Registry file conflict at components/vlak/shared.ts: first and second");
    expect(readFileSync(join(cwd, "components/vlak/shared.ts"), "utf8")).toBe("// consumer's helper\n");
    expect(existsSync(join(cwd, "components/vlak/first.tsx"))).toBe(false);
    expect(existsSync(join(cwd, "components/vlak/second.tsx"))).toBe(false);
  });

  it("vendors component source plus the shared lib once", async () => {
    init(cwd);
    const { outcomes, unknown } = await add(cwd, ["button"]);
    expect(unknown).toEqual([]);
    expect(outcomes.map((o) => o.item.name)).toEqual(["vlak-lib", "button"]);
    const source = readFileSync(join(cwd, "components/vlak/button.tsx"), "utf8");
    expect(source).toContain("rs-btn-primary");
    expect(source).toContain("@stylexjs/stylex");
    expect(existsSync(join(cwd, "components/vlak/cx.ts"))).toBe(true);
    expect(existsSync(join(cwd, "components/vlak/rs.ts"))).toBe(true);
    expect(readFileSync(join(cwd, "components/vlak/rs.ts"), "utf8")).toContain('from "./cx"');
    expect(existsSync(join(cwd, "components/vlak/tokens.stylex.ts"))).toBe(true);
  });

  it("pulls registry dependencies in install order", async () => {
    init(cwd);
    const { outcomes } = await add(cwd, ["dialog"]);
    expect(outcomes.map((o) => o.item.name)).toEqual(["vlak-lib", "button", "icons", "dialog"]);
    expect(existsSync(join(cwd, "components/vlak/dialog.tsx"))).toBe(true);
    expect(existsSync(join(cwd, "components/vlak/button.tsx"))).toBe(true);
  });

  it("reports unknown names", async () => {
    init(cwd);
    const { unknown } = await add(cwd, ["nope"]);
    expect(unknown).toEqual(["nope"]);
  });

  it("installs every vendored file exactly once across a whole add", async () => {
    init(cwd);
    const { outcomes } = await add(cwd, ["select", "combobox", "date-picker", "bar-chart"]);
    const written = outcomes.flatMap((o) => o.results.map((r) => r.path));
    expect(new Set(written).size).toBe(written.length);
    expect(outcomes.filter((o) => o.item.name === "dropdown-menu")).toHaveLength(1);
    expect(existsSync(join(cwd, "components/vlak/charts/frame.tsx"))).toBe(true);
  });

  it("every vendored import resolves inside the project", async () => {
    init(cwd);
    const { outcomes } = await add(cwd, ["chart", "sidebar", "form", "menubar"]);
    for (const r of outcomes.flatMap((o) => o.results)) {
      const file = join(cwd, r.path);
      const dir = join(file, "..");
      for (const spec of [...readFileSync(file, "utf8").matchAll(/from "(\.[^"]+)"/g)].map((m) => m[1]!)) {
        const base = join(dir, spec);
        expect(
          existsSync(`${base}.ts`) || existsSync(`${base}.tsx`) || existsSync(join(base, "index.ts")),
          `${r.path}: ${spec} resolves`,
        ).toBe(true);
      }
    }
  });

  it("keeps nested trees intact so chart imports resolve", async () => {
    init(cwd);
    await add(cwd, ["chart"]);
    expect(existsSync(join(cwd, "components/vlak/chart.tsx"))).toBe(true);
    expect(existsSync(join(cwd, "components/vlak/charts/index.ts"))).toBe(true);
    expect(existsSync(join(cwd, "components/vlak/charts/line.tsx"))).toBe(true);
    const line = readFileSync(join(cwd, "components/vlak/charts/line.tsx"), "utf8");
    for (const spec of [...line.matchAll(/from "(\.[^"]+)"/g)].map((m) => m[1]!)) {
      const base = join(cwd, "components/vlak/charts", spec);
      expect(
        existsSync(`${base}.ts`) || existsSync(`${base}.tsx`) || existsSync(join(base, "index.ts")),
        `${spec} resolves`,
      ).toBe(true);
    }
  });

  it("writes a React leaf for table", async () => {
    init(cwd);
    const { outcomes } = await add(cwd, ["table"]);
    expect(outcomes[0]!.cssOnly).toBe(false);
    expect(existsSync(join(cwd, "components/vlak/table.tsx"))).toBe(true);
  });

  it("respects a custom componentsDir from vlak.json", async () => {
    init(cwd, { componentsDir: "src/ui" });
    await add(cwd, ["switch"]);
    expect(existsSync(join(cwd, "src/ui/switch.tsx"))).toBe(true);
  });

  it("loads items from --registry (local directory)", async () => {
    init(cwd);
    const registry = join(cwd, "remote-r");
    mkdirSync(registry);
    writeFileSync(
      join(registry, "button.json"),
      JSON.stringify({
        name: "button",
        title: "Button",
        description: "from remote",
        files: [
          {
            path: "vlak/button.tsx",
            content: "export const Button = () => null; // remote\n",
            type: "registry:component",
            target: "components/vlak/button.tsx",
          },
        ],
        meta: { vlak: { cssOnly: false, registryDependencies: [] } },
      }),
    );
    const { outcomes, unknown } = await add(cwd, ["button"], { registry, overwrite: true });
    expect(unknown).toEqual([]);
    expect(readFileSync(join(cwd, "components/vlak/button.tsx"), "utf8")).toContain("remote");
    expect(outcomes[0]!.item.description).toBe("from remote");
  });
});

describe("registry resolution", () => {
  it("resolves every listed component", () => {
    for (const entry of list()) {
      const { resolved, unknown } = resolveWithDependencies([entry.name]);
      expect(unknown).toEqual([]);
      expect(resolved.length).toBeGreaterThan(0);
    }
  });
});

describe("docs", () => {
  it("prints the bundled markdown page for a component", () => {
    const page = docsFor("button")!;
    expect(page).toContain("# Button");
    expect(page).toContain("npx @noorddev/vlak-cli add button");
    expect(page).toContain('import { Button } from "@noorddev/vlak-react"');
    expect(page).toContain("## Props");
    expect(page).toContain("## Keyboard");
  });

  it("serves the guide, the index, and the tokens page", () => {
    expect(docsFor("guide")).toContain("# Vlak guide");
    expect(docsFor("index")).toContain("# Vlak components");
    expect(docsFor("tokens")).toContain("--bg");
  });

  it("has a page for every listed component and none for unknown names", () => {
    for (const entry of list()) expect(docsFor(entry.name), entry.name).toBeTruthy();
    expect(docsFor("nope")).toBeUndefined();
  });
});

describe("search", () => {
  it("matches names, titles, aliases, descriptions, and classes", () => {
    expect(search("menu").map((h) => h.name)).toContain("dropdown-menu");
    expect(search("sonner")[0]?.name).toBe("toast");
    expect(search("side panel")[0]?.name).toBe("sheet");
    expect(search("rs-btn-primary").map((h) => h.name)).toContain("button");
    expect(search("hairline").length).toBeGreaterThan(0);
    expect(search("   ")).toEqual([]);
    expect(search("zzzz-nothing")).toEqual([]);
  });

  it("ranks an exact name first and reports what matched", () => {
    const hits = search("select");
    expect(hits[0]?.name).toBe("select");
    expect(hits[0]?.matched).toContain("name");
    for (const hit of hits) expect(hit.matched.length).toBeGreaterThan(0);
  });
});

describe("list", () => {
  it("returns plain data for --json", () => {
    const entries = list();
    expect(entries.length).toBeGreaterThan(50);
    for (const entry of entries) {
      expect(typeof entry.name).toBe("string");
      expect(typeof entry.category).toBe("string");
      expect(typeof entry.cssOnly).toBe("boolean");
    }
    expect(JSON.parse(JSON.stringify(entries))).toEqual(entries);
  });
});
