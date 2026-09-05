/**
 * The vlak CLI as a library: every command is a pure-ish function
 * over an explicit cwd so the whole thing is testable without a shell.
 *
 * The CLI carries the entire system with it (CSS + registry + Inter
 * files bundled at build time), so init and add work offline. A remote
 * registry can override the bundle via --registry or vlak.json for
 * out-of-band updates.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { catalogComponents, vlakComponents, vlakTokens } from "@noorddev/vlak";
import { starterPage } from "./starter";

interface Bundle {
  name: string;
  version: string;
  css: { vlak: string };
  items: RegistryItem[];
  /** Generated markdown docs (registry/docs): guide, index, tokens, and one page per component. */
  docs?: { guide: string; index: string; tokens: string; components: Record<string, string> };
}

const here = dirname(fileURLToPath(import.meta.url));

/** First existing path among candidates relative to this module. */
function locate(candidates: string[], what: string): string {
  const found = candidates.map((c) => join(here, c)).find((p) => existsSync(p));
  if (!found) throw new Error(`Vlak ${what} not found. Rebuild @noorddev/vlak-cli (pnpm build) or run from the repo.`);
  return found;
}

let cachedBundle: Bundle | undefined;

/**
 * The registry snapshot the CLI was built with. Read at first use, not
 * bundled into the executable: dist/index.js stays small and `vlak --help`
 * never parses a registry. Published: dist/registry/bundle.json. In-repo:
 * <repo>/registry/bundle.json.
 */
export function loadBundle(): Bundle {
  cachedBundle ??= JSON.parse(readFileSync(locate(["registry/bundle.json", "../../../registry/bundle.json"], "registry bundle"), "utf8")) as Bundle;
  return cachedBundle;
}

export const VERSION: string = (JSON.parse(readFileSync(locate(["../package.json", "package.json"], "package.json"), "utf8")) as { version: string }).version;

export interface RegistryFile {
  path: string;
  content: string;
  type: string;
  target: string;
}

export interface RegistryItem {
  name: string;
  title: string;
  description: string;
  files: RegistryFile[];
  meta?: {
    vlak?: {
      category?: string;
      snippet?: string;
      cssOnly?: boolean;
      registryDependencies?: string[];
    };
  };
}

export interface VlakConfig {
  cssDir: string;
  componentsDir: string;
  registry?: string;
}

export const defaultConfig: VlakConfig = {
  cssDir: "styles",
  componentsDir: "components/vlak",
};

export interface WriteResult {
  path: string;
  status: "written" | "skipped" | "unchanged";
}

const CONFIG_FILE = "vlak.json";
const FONT_FILES = ["InterVariable-latin.woff2", "InterVariable-latin-ext.woff2", "OFL.txt"];

export function loadConfig(cwd: string): VlakConfig {
  const file = join(cwd, CONFIG_FILE);
  if (!existsSync(file)) return { ...defaultConfig };
  return { ...defaultConfig, ...(JSON.parse(readFileSync(file, "utf8")) as Partial<VlakConfig>) };
}

function writeFileSafe(cwd: string, relPath: string, content: string | Buffer, overwrite: boolean): WriteResult {
  const abs = join(cwd, relPath);
  if (existsSync(abs)) {
    const current = readFileSync(abs);
    const next = typeof content === "string" ? Buffer.from(content) : content;
    if (current.equals(next)) return { path: relPath, status: "unchanged" };
    if (!overwrite) return { path: relPath, status: "skipped" };
  }
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, content);
  return { path: relPath, status: "written" };
}

/** Resolve vendored Inter files: published CLI dist, or the core package in-repo. */
export function resolveFontsDir(): string {
  return dirname(locate(["fonts/inter/OFL.txt", "../fonts/inter/OFL.txt", "../../core/css/fonts/inter/OFL.txt", "../../../core/css/fonts/inter/OFL.txt"], "Inter files"));
}

function copyFonts(cwd: string, cssDir: string, overwrite: boolean): WriteResult[] {
  const srcDir = resolveFontsDir();
  const results: WriteResult[] = [];
  for (const file of FONT_FILES) {
    const src = join(srcDir, file);
    if (!existsSync(src)) continue;
    results.push(writeFileSafe(cwd, join(cssDir, "fonts/inter", file), readFileSync(src), overwrite));
  }
  return results;
}

export interface InitOptions {
  cssDir?: string;
  componentsDir?: string;
  overwrite?: boolean;
  registry?: string;
}

/** Write vlak.css, Inter files, a specimen page, and vlak.json. */
export function init(cwd: string, options: InitOptions = {}): WriteResult[] {
  const config: VlakConfig = {
    cssDir: options.cssDir ?? defaultConfig.cssDir,
    componentsDir: options.componentsDir ?? defaultConfig.componentsDir,
  };
  if (options.registry) config.registry = options.registry;
  const results: WriteResult[] = [];
  const cssHref = `${config.cssDir.replace(/\\/g, "/")}/vlak.css`;
  results.push(writeFileSafe(cwd, join(config.cssDir, "vlak.css"), loadBundle().css.vlak, options.overwrite ?? false));
  results.push(...copyFonts(cwd, config.cssDir, options.overwrite ?? false));
  results.push(writeFileSafe(cwd, "index.html", starterPage(cssHref), options.overwrite ?? false));
  results.push(
    writeFileSafe(cwd, CONFIG_FILE, JSON.stringify(config, null, 2) + "\n", options.overwrite ?? false),
  );
  return results;
}

export function getItems(): RegistryItem[] {
  return loadBundle().items;
}

export function findItem(name: string): RegistryItem | undefined {
  return getItems().find((item) => item.name === name);
}

/** Expand names to include registry dependencies (by vlak name), deduped, in install order. */
export function resolveWithDependencies(names: string[]): { resolved: RegistryItem[]; unknown: string[] } {
  const unknown: string[] = [];
  const seen = new Set<string>();
  const resolved: RegistryItem[] = [];
  const visit = (name: string) => {
    if (seen.has(name)) return;
    seen.add(name);
    const item = findItem(name);
    if (!item) {
      unknown.push(name);
      return;
    }
    for (const dep of item.meta?.vlak?.registryDependencies ?? []) visit(dep);
    resolved.push(item);
  };
  for (const name of names) visit(name);
  return { resolved, unknown };
}

export interface AddOptions {
  overwrite?: boolean;
  registry?: string;
}

export interface AddOutcome {
  item: RegistryItem;
  cssOnly: boolean;
  results: WriteResult[];
}

function itemUrl(registry: string, name: string): string {
  return `${registry.replace(/\/$/, "")}/${name}.json`;
}

/**
 * One item from a remote registry. Returns undefined when the registry
 * has no such item (HTTP 404, or no file in a local directory); any other
 * failure (network, bad JSON, 5xx) throws with the location in the message
 * so the user sees what broke instead of "unknown component".
 */
async function readRegistryItem(registry: string, name: string): Promise<RegistryItem | undefined> {
  const loc = itemUrl(registry, name);
  if (/^https?:\/\//.test(loc) || loc.startsWith("file:")) {
    const res = await fetch(loc);
    if (res.status === 404) return undefined;
    if (!res.ok) throw new Error(`Registry request failed: ${loc} (${res.status} ${res.statusText})`);
    try {
      return (await res.json()) as RegistryItem;
    } catch (error) {
      throw new Error(`Registry item is not JSON: ${loc} (${(error as Error).message})`);
    }
  }
  const file = join(registry, `${name}.json`);
  if (!existsSync(file)) return undefined;
  try {
    return JSON.parse(readFileSync(file, "utf8")) as RegistryItem;
  } catch (error) {
    throw new Error(`Registry item is not JSON: ${file} (${(error as Error).message})`);
  }
}

async function resolveFromRegistry(
  registry: string,
  names: string[],
): Promise<{ resolved: RegistryItem[]; unknown: string[] }> {
  const unknown: string[] = [];
  const seen = new Set<string>();
  const resolved: RegistryItem[] = [];
  const visit = async (name: string) => {
    if (seen.has(name)) return;
    seen.add(name);
    const item = await readRegistryItem(registry, name);
    if (!item) {
      unknown.push(name);
      return;
    }
    for (const dep of item.meta?.vlak?.registryDependencies ?? []) await visit(dep);
    resolved.push(item);
  };
  for (const name of names) await visit(name);
  return { resolved, unknown };
}

function planItemFiles(item: RegistryItem, componentsDir: string): Array<{ path: string; content: string }> {
  const files: Array<{ path: string; content: string }> = [];
  for (const file of item.files) {
    if (!file.path.endsWith(".tsx") && !file.path.endsWith(".ts")) continue;
    // Registry targets are `components/vlak/<tree>`; keep the tree so nested
    // imports (charts/, shared helpers) resolve exactly as they do in the source.
    const rel = file.target.replace(/^components\/vlak\//, "").replace(/^vlak\//, "");
    files.push({ path: join(componentsDir, rel), content: file.content });
  }
  return files;
}

/**
 * Vendor a component's React source (plus the shared cx helper) into
 * the project. CSS is not written per-component: init's vlak.css
 * already styles every component. That is the CSS-first model.
 *
 * When --registry or vlak.json.registry is set, items are loaded
 * from that registry (HTTP(S) URL or a local directory of JSON files)
 * instead of the bundled snapshot.
 */
export async function add(
  cwd: string,
  names: string[],
  options: AddOptions = {},
): Promise<{
  outcomes: AddOutcome[];
  unknown: string[];
}> {
  const config = loadConfig(cwd);
  const registry = options.registry ?? config.registry;
  const { resolved, unknown } = registry
    ? await resolveFromRegistry(registry, names)
    : resolveWithDependencies(names);
  // A helper can be part of several registry items without owning a registry
  // entry itself. Deduplicate destinations across the entire command, not just
  // item names. Validate the full plan before writing so conflicting registry
  // definitions never silently select whichever item happened to install last.
  const destinations = new Map<string, { content: string; owner: string }>();
  const plan = resolved.map(item => {
    const cssOnly = item.meta?.vlak?.cssOnly ?? false;
    const files = (cssOnly ? [] : planItemFiles(item, config.componentsDir)).filter(file => {
      const destination = resolve(cwd, file.path);
      const previous = destinations.get(destination);
      if (previous) {
        if (previous.content !== file.content) throw new Error(`Registry file conflict at ${file.path}: ${previous.owner} and ${item.name} provide different contents.`);
        return false;
      }
      destinations.set(destination, { content: file.content, owner: item.name });
      return true;
    });
    return { item, cssOnly, files };
  });
  const outcomes: AddOutcome[] = plan.map(({ item, cssOnly, files }) => ({
    item,
    cssOnly,
    results: files.map(file => writeFileSafe(cwd, file.path, file.content, options.overwrite ?? false)),
  }));
  return { outcomes, unknown };
}

export interface ListEntry {
  name: string;
  title: string;
  description: string;
  category: string;
  cssOnly: boolean;
}

export function list(): ListEntry[] {
  return catalogComponents.map((c) => ({
    name: c.name,
    title: c.title,
    description: c.description,
    category: c.category,
    cssOnly: !c.react,
  }));
}

export function tokensJson(): string {
  return JSON.stringify(vlakTokens, null, 2);
}

export function snippetFor(name: string): string | undefined {
  return vlakComponents.find((c) => c.name === name)?.snippet;
}

/**
 * The markdown page for a component, or one of the general pages
 * ("guide", "index", "tokens"), from the bundled docs. Undefined when
 * there is no such page.
 */
export function docsFor(name: string): string | undefined {
  const docs = loadBundle().docs;
  if (!docs) return undefined;
  if (name === "guide" || name === "index" || name === "tokens") return docs[name];
  return docs.components[name];
}

export interface SearchHit extends ListEntry {
  aliases: string[];
  classes: string[];
  /** Which fields matched, in order of weight: name, title, alias, description, class. */
  matched: string[];
}

/**
 * Catalog components whose name, title, description, aliases, or classes
 * contain the term (case-insensitive). Name and title hits sort first.
 */
export function search(term: string): SearchHit[] {
  const q = term.trim().toLowerCase();
  if (!q) return [];
  const hits: Array<SearchHit & { score: number }> = [];
  for (const c of catalogComponents) {
    const matched: string[] = [];
    let score = 0;
    if (c.name.includes(q)) {
      matched.push("name");
      score += c.name === q ? 100 : 40;
    }
    if (c.title.toLowerCase().includes(q)) {
      matched.push("title");
      score += 30;
    }
    if ((c.aliases ?? []).some((a) => a.toLowerCase().includes(q))) {
      matched.push("alias");
      score += 20;
    }
    if (c.description.toLowerCase().includes(q)) {
      matched.push("description");
      score += 10;
    }
    if (c.classes.some((cls) => cls.includes(q))) {
      matched.push("class");
      score += 5;
    }
    if (matched.length === 0) continue;
    hits.push({
      name: c.name,
      title: c.title,
      description: c.description,
      category: c.category,
      cssOnly: !c.react,
      aliases: c.aliases ?? [],
      classes: c.classes,
      matched,
      score,
    });
  }
  return hits.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name)).map(({ score: _score, ...hit }) => hit);
}
