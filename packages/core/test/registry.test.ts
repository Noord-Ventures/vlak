import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import { catalogComponents, vlakComponents } from "../src/registry";
import { vlakCategories, validateRegistry } from "../src/schema";

const cssDir = join(import.meta.dirname, "../css");
const reactSrcDir = join(import.meta.dirname, "../../react/src");

const allCss = vlakComponents
  .flatMap((c) => c.css)
  .map((f) => readFileSync(join(cssDir, f), "utf8"))
  .join("\n");

const allClasses = new Set(vlakComponents.flatMap((c) => c.classes));

function readTree(file: string, seen = new Set<string>()): string {
  const abs = join(reactSrcDir, file);
  if (!existsSync(abs) || seen.has(abs)) return "";
  seen.add(abs);
  const text = readFileSync(abs, "utf8");
  const rels = [
    ...text.matchAll(/from ["']\.\/([^"']+)["']/g),
  ].map((m) => m[1]!);
  let extra = "";
  for (const rel of rels) {
    const target = join(dirname(abs), rel);
    if (existsSync(`${target}.tsx`)) extra += readTree(join(dirname(file), `${rel}.tsx`), seen);
    else if (existsSync(`${target}.ts`)) extra += readTree(join(dirname(file), `${rel}.ts`), seen);
    else if (existsSync(target) && statSync(target).isDirectory()) {
      for (const name of readdirSync(target)) {
        if (name.endsWith(".ts") || name.endsWith(".tsx")) {
          extra += readTree(join(dirname(file), rel, name), seen);
        }
      }
    }
  }
  return text + extra;
}

describe("registry structure", () => {
  it("is well-formed", () => {
    expect(validateRegistry(vlakComponents)).toEqual([]);
  });

  it("preserves iOS branding while requiring sentence case for the rest of a title", () => {
    const entry = vlakComponents.find(component => component.name === "button")!;
    expect(validateRegistry([{ ...entry, title: "iOS navigation bar" }])).toEqual([]);
    expect(validateRegistry([{ ...entry, title: "iOS NAVIGATION" }])).toContain("button: title must be sentence case");
    expect(validateRegistry([{ ...entry, title: "ios navigation bar" }])).toContain("button: title must be sentence case");
  });

  it("hides concentric-radius from the public catalog and keeps the nest rule", () => {
    const nest = vlakComponents.find((c) => c.name === "concentric-radius");
    expect(nest?.hidden).toBe(true);
    expect(catalogComponents.some((c) => c.name === "concentric-radius")).toBe(false);
    expect(catalogComponents).toHaveLength(vlakComponents.filter((c) => !c.hidden).length);
  });

  it("lifts icons and charts into their own catalog sections", () => {
    expect(vlakCategories).toContain("icons");
    expect(vlakCategories).toContain("charts");
    expect(vlakComponents.find((c) => c.name === "icons")?.category).toBe("icons");
    for (const name of ["chart", "bar-chart", "area-chart", "scatter-chart", "donut", "histogram", "small-multiples"]) {
      expect(vlakComponents.find((c) => c.name === name)?.category, name).toBe("charts");
    }
  });

  it("ships CSS for every catalog component (CSS-first)", () => {
    for (const c of catalogComponents) {
      expect(c.css.length, `${c.name} must list its CSS`).toBeGreaterThan(0);
    }
  });

  it("lists every CSS file that exists on disk", () => {
    for (const c of vlakComponents) {
      for (const f of c.css) {
        expect(existsSync(join(cssDir, f)), `${c.name}: css/${f} missing`).toBe(true);
      }
    }
  });

  it("references React sources that exist", () => {
    for (const c of vlakComponents) {
      if (!c.react) continue;
      expect(existsSync(join(reactSrcDir, c.react)), `${c.name}: react src/${c.react} missing`).toBe(true);
    }
  });
});

describe("registry ↔ CSS parity", () => {
  it("every declared class is styled by that component's CSS or a declared dependency's", () => {
    const cssFor = (c: (typeof vlakComponents)[number]): string[] => [
      ...c.css,
      ...(c.registryDependencies ?? []).flatMap((d) => vlakComponents.find((o) => o.name === d)?.css ?? []),
    ];
    for (const c of vlakComponents) {
      const css = cssFor(c).map((f) => readFileSync(join(cssDir, f), "utf8")).join("\n");
      for (const cls of c.classes) {
        expect(css.includes(`.${cls}`), `${c.name}: .${cls} not styled in ${c.css.join(", ")}`).toBe(true);
      }
    }
  });

  it("every declared class is applied by that component's React source", () => {
    for (const c of vlakComponents) {
      if (!c.react) continue;
      const src = readTree(c.react);
      for (const cls of c.classes) {
        expect(src.includes(`"${cls}"`) || src.includes(`${cls} `) || src.includes(`${cls}"`), `${c.name}: ${cls} never applied in ${c.react}`).toBe(true);
      }
    }
  });

  it("every class used in a snippet is declared by some component", () => {
    for (const c of vlakComponents) {
      const used = [...c.snippet.matchAll(/class="([^"]+)"/g)].flatMap((m) => m[1]!.split(/\s+/));
      for (const cls of used) {
        expect(allClasses.has(cls), `${c.name}: snippet uses undeclared class "${cls}"`).toBe(true);
      }
    }
  });

  it("snippets that borrow classes from other components declare the dependency", () => {
    for (const c of vlakComponents) {
      const used = [...c.snippet.matchAll(/class="([^"]+)"/g)].flatMap((m) => m[1]!.split(/\s+/));
      const own = new Set(c.classes);
      for (const cls of used) {
        if (own.has(cls)) continue;
        // Compositions can share a primitive's paint. Any declared provider is
        // valid; catalog ordering must not change which dependency is required.
        const providers = vlakComponents.filter((o) => o.classes.includes(cls));
        expect(providers.length, `${c.name}: no provider for "${cls}"`).toBeGreaterThan(0);
        expect(
          providers.some((provider) => c.registryDependencies?.includes(provider.name)),
          `${c.name}: uses .${cls} without declaring one of its providers (${providers.map((p) => p.name).join(", ")}) as a registry dependency`,
        ).toBe(true);
      }
    }
  });

  it("no CSS class in component files is orphaned from the registry", () => {
    const declared = new Set([...allClasses]);
    const styled = new Set(
      [...allCss.matchAll(/\.((?:rs)-[a-z0-9-]+)/g)].map((m) => m[1]!),
    );
    const orphans = [...styled].filter((cls) => {
      if (declared.has(cls)) return false;
      // Modifier/child classes count as covered when a declared prefix owns them.
      return ![...declared].some((d) => cls.startsWith(`${d}-`));
    });
    expect(orphans, `styled but not in the registry: ${orphans.join(", ")}`).toEqual([]);
  });
});

describe("registry copy for agents", () => {
  const reactIndex = readFileSync(join(reactSrcDir, "index.ts"), "utf8");
  const exported = new Set([...reactIndex.matchAll(/\b([A-Za-z_$][\w$]*)\b/g)].map((m) => m[1]!));

  it("every entry carries an example, usage, accessibility notes, and aliases", () => {
    for (const c of vlakComponents) {
      expect(c.example, `${c.name}: example`).toBeTruthy();
      expect(c.usage?.use.length, `${c.name}: usage.use`).toBeGreaterThan(0);
      expect(c.usage?.avoid.length, `${c.name}: usage.avoid`).toBeGreaterThan(0);
      expect(c.a11y?.length, `${c.name}: a11y`).toBeGreaterThan(0);
      expect(c.aliases?.length, `${c.name}: aliases`).toBeGreaterThan(0);
    }
  });

  it("examples import from the React package and name real exports", () => {
    for (const c of vlakComponents) {
      const imports = [...c.example!.matchAll(/import \{([^}]+)\} from "(@noorddev\/vlak-react(?:\/components\/[a-z-]+)?)"/g)];
      expect(imports.length, `${c.name}: example imports from @noorddev/vlak-react`).toBeGreaterThan(0);
      expect(c.example, `${c.name}: example uses the site alias`).not.toContain("@/components/vlak");
      for (const m of imports) {
        const entry = m[2] === "@noorddev/vlak-react" ? exported : new Set(
          [...readFileSync(join(reactSrcDir, m[2]!.replace("@noorddev/vlak-react/", "") + ".tsx"), "utf8")
            .matchAll(/export (?:const|function|class|interface|type) ([A-Za-z_$][\w$]*)/g)].map((match) => match[1]!),
        );
        if (m[2] !== "@noorddev/vlak-react") expect(m[2], `${c.name}: optional import matches its registry entry`).toBe(c.reactImport);
        for (const name of m[1]!.split(",").map((s) => s.trim().replace(/^type\s+/, "").split(/\s+as\s+/)[0]!).filter(Boolean)) {
          expect(entry.has(name), `${c.name}: example imports "${name}", not exported from ${m[2]}`).toBe(true);
        }
      }
    }
  });

  it("keyboard rows and copy stay in the house voice", () => {
    for (const c of vlakComponents) {
      for (const row of c.keyboard ?? []) {
        expect(row.keys.trim(), `${c.name}: keys`).toBeTruthy();
        expect(row.does.trim(), `${c.name}: does`).toBeTruthy();
      }
      const copy = [...c.usage!.use, ...c.usage!.avoid, ...c.a11y!, ...(c.keyboard ?? []).map((k) => k.does)];
      for (const line of copy) {
        expect(line, `${c.name}: em dash in "${line}"`).not.toContain("—");
        expect(/[A-Z]{4,}/.test(line.replace(/[A-Z]+_[A-Z_]+/g, "")), `${c.name}: all caps in "${line}"`).toBe(false);
      }
      for (const alias of c.aliases!) expect(alias.trim(), `${c.name}: alias`).toBeTruthy();
    }
  });
});
