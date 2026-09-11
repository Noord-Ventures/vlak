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
import { dirname, join, posix } from "node:path";
import { fileURLToPath } from "node:url";
import { catalogComponents, vlakComponents, vlakTokens } from "@noorddev/vlak";
import { assertReady, installManaged, installed, makeUpdatePlan, safePath, sha } from "./managed";
import type { SourceFile } from "./managed";
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
  dependencies?: string[];
  files: RegistryFile[];
  meta?: {
    vlak?: {
      category?: string;
      snippet?: string;
      cssOnly?: boolean;
      registryDependencies?: string[];
      reactImport?: string;
      dependencies?: string[];
      styles?: string[];
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
  const abs = safePath(cwd, relPath);
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
    results.push(writeFileSafe(cwd, posix.join(cssDir, "fonts/inter", file), readFileSync(src), overwrite));
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
  assertReady(cwd);
  safePath(cwd, config.cssDir); safePath(cwd, config.componentsDir);
  for (const path of [posix.join(config.cssDir, "vlak.css"), ...FONT_FILES.map(file => posix.join(config.cssDir, "fonts/inter", file)), "index.html", CONFIG_FILE]) safePath(cwd, path);
  const cssHref = `${config.cssDir.replace(/\\/g, "/")}/vlak.css`;
  const sourceFiles: SourceFile[] = [
    { path: posix.join(config.cssDir, "vlak.css"), content: loadBundle().css.vlak, owners: ["init"] },
    ...FONT_FILES.map(file => ({ path: posix.join(config.cssDir, "fonts/inter", file), content: readFileSync(join(resolveFontsDir(), file)), owners: ["init"] })),
  ];
  return installManaged(cwd, sourceFiles, `bundled:${loadBundle().version}`, () => {
    const results: WriteResult[] = [];
    results.push(writeFileSafe(cwd, posix.join(config.cssDir, "vlak.css"), loadBundle().css.vlak, options.overwrite ?? false));
    results.push(...copyFonts(cwd, config.cssDir, options.overwrite ?? false));
    results.push(writeFileSafe(cwd, "index.html", starterPage(cssHref), options.overwrite ?? false));
    results.push(writeFileSafe(cwd, CONFIG_FILE, JSON.stringify(config, null, 2) + "\n", options.overwrite ?? false));
    return { value: results, installedPaths: sourceFiles.filter(file => results.find(result => result.path === file.path)?.status !== "skipped").map(file => file.path) };
  });
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

function validateRegistryItem(value: unknown, requestedName: string): RegistryItem {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`Registry item is invalid: ${requestedName}.`);
  const item = value as Record<string, unknown>;
  if (item.name !== requestedName || !Array.isArray(item.files) || item.files.length > 10_000) throw new Error(`Registry item is invalid: ${requestedName}.`);
  for (const file of item.files) {
    if (!file || typeof file !== "object" || Array.isArray(file)) throw new Error(`Registry item has an invalid file: ${requestedName}.`);
    const entry = file as Record<string, unknown>;
    if (typeof entry.path !== "string" || typeof entry.target !== "string" || typeof entry.type !== "string" || typeof entry.content !== "string" || Buffer.byteLength(entry.content) > 16 * 1024 * 1024) throw new Error(`Registry item has an invalid file: ${requestedName}.`);
  }
  const vlak = item.meta && typeof item.meta === "object" && !Array.isArray(item.meta) ? (item.meta as { vlak?: unknown }).vlak : undefined;
  if (vlak !== undefined) {
    if (!vlak || typeof vlak !== "object" || Array.isArray(vlak)) throw new Error(`Registry item has invalid metadata: ${requestedName}.`);
    const metadata = vlak as Record<string, unknown>;
    if (metadata.registryDependencies !== undefined && (!Array.isArray(metadata.registryDependencies) || metadata.registryDependencies.length > 10_000 || metadata.registryDependencies.some(name => typeof name !== "string" || !/^[a-z0-9-]+$/.test(name)))) throw new Error(`Registry item has invalid dependencies: ${requestedName}.`);
    if (metadata.styles !== undefined && (!Array.isArray(metadata.styles) || metadata.styles.length > 10_000 || metadata.styles.some(style => typeof style !== "string" || style.length > 2_048))) throw new Error(`Registry item has invalid styles: ${requestedName}.`);
    if (metadata.cssOnly !== undefined && typeof metadata.cssOnly !== "boolean") throw new Error(`Registry item has invalid metadata: ${requestedName}.`);
  }
  return value as RegistryItem;
}

/**
 * One item from a remote registry. Returns undefined when the registry
 * has no such item (HTTP 404, or no file in a local directory); any other
 * failure (network, bad JSON, 5xx) throws with the location in the message
 * so the user sees what broke instead of "unknown component".
 */
async function readRegistryItem(registry: string, name: string): Promise<RegistryItem | undefined> {
  if (!/^[a-z0-9-]+$/.test(name)) throw new Error("Invalid registry component name.");
  const loc = itemUrl(registry, name);
  if (/^https?:\/\//.test(loc) || loc.startsWith("file:")) {
    const res = await fetch(loc);
    if (res.status === 404) return undefined;
    if (!res.ok) throw new Error(`Registry request failed: ${loc} (${res.status} ${res.statusText})`);
    let value: unknown;
    try {
      value = await res.json();
    } catch (error) {
      throw new Error(`Registry item is not JSON: ${loc} (${(error as Error).message})`);
    }
    return validateRegistryItem(value, name);
  }
  const file = join(registry, `${name}.json`);
  if (!existsSync(file)) return undefined;
  let value: unknown;
  try {
    value = JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    throw new Error(`Registry item is not JSON: ${file} (${(error as Error).message})`);
  }
  return validateRegistryItem(value, name);
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
  const engineStyles = new Set((item.meta?.vlak?.styles ?? [])
    .filter(style => style.startsWith("@noorddev/vlak-react/"))
    .map(style => `styles/vlak/${style.slice("@noorddev/vlak-react/".length)}`));
  for (const file of item.files) {
    // Optional engines may need structural CSS in addition to init's paint.
    // Keep its explicit registry target at the project root.
    if (file.path.endsWith(".css") && engineStyles.has(file.target)) {
      files.push({ path: file.target, content: file.content });
      continue;
    }
    if (!file.path.endsWith(".tsx") && !file.path.endsWith(".ts")) continue;
    // Registry targets are `components/vlak/<tree>`; keep the tree so nested
    // imports (charts/, shared helpers) resolve exactly as they do in the source.
    if (typeof file.content !== "string" || typeof file.target !== "string" || (!file.target.startsWith("components/vlak/") && !file.target.startsWith("vlak/")) || file.target.includes("\0") || file.target.includes("\\") || file.target.split("/").some(part => !part || part === "." || part === "..")) throw new Error("Invalid registry file target.");
    const rel = file.target.replace(/^components\/vlak\//, "").replace(/^vlak\//, "");
    files.push({ path: posix.join(componentsDir, rel), content: file.content });
  }
  return files;
}

/**
 * Vendor a component's React source (plus the shared cx helper) into
 * the project. Init's vlak.css already supplies component paint. Optional
 * engine stylesheets are copied when the registry explicitly includes one.
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
  assertReady(cwd);
  const config = loadConfig(cwd);
  safePath(cwd, config.componentsDir);
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
      const destination = safePath(cwd, file.path);
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
  const sources = resolved.flatMap(item => (item.meta?.vlak?.cssOnly ? [] : planItemFiles(item, config.componentsDir)).map(file => ({ ...file, owners: [item.name] })));
  const outcomes = installManaged(cwd, sources, registry ? `registry:${registry}` : `bundled:${loadBundle().version}`, () => {
    const value: AddOutcome[] = plan.map(({ item, cssOnly, files }) => ({ item, cssOnly, results: files.map(file => writeFileSafe(cwd, file.path, file.content, options.overwrite ?? false)) }));
    const installedPaths = [...new Set(value.flatMap(outcome => outcome.results.filter(result => result.status !== "skipped").map(result => result.path)))];
    return { value, installedPaths };
  });
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
  const searchKey = (value: string) => value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
  const q = searchKey(term);
  if (!q) return [];
  const hits: Array<SearchHit & { score: number }> = [];
  for (const c of catalogComponents) {
    const matched: string[] = [];
    let score = 0;
    if (searchKey(c.name).includes(q)) {
      matched.push("name");
      score += searchKey(c.name) === q ? 100 : 40;
    }
    if (searchKey(c.title).includes(q)) {
      matched.push("title");
      score += 30;
    }
    if ((c.aliases ?? []).some((a) => searchKey(a).includes(q))) {
      matched.push("alias");
      score += 20;
    }
    if (searchKey(c.description).includes(q)) {
      matched.push("description");
      score += 10;
    }
    if (c.classes.some((cls) => searchKey(cls).includes(q))) {
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

/** Pin the exact source bytes in the reviewed plan; apply never fetches a registry. */
export async function updatePlan(cwd: string, registry?: string) {
  const manifest = installed(cwd), config = loadConfig(cwd);
  const installedFingerprint = sha(JSON.stringify(manifest));
  if (manifest.files.some(file => file.source.startsWith("registry:")) && !registry) throw new Error("These files came from a custom registry. Specify --registry explicitly to review its current snapshot.");
  const owners = [...new Set(manifest.files.flatMap(file => file.owners))].filter(name => name !== "init");
  const { resolved, unknown } = registry ? await resolveFromRegistry(registry, owners) : resolveWithDependencies(owners);
  if (unknown.length) throw new Error(`Installed components are missing from the target snapshot: ${unknown.join(", ")}. No removal is assumed.`);
  const sources: SourceFile[] = resolved.flatMap(item => (item.meta?.vlak?.cssOnly ? [] : planItemFiles(item, config.componentsDir)).map(file => ({ ...file, owners: [item.name] })));
  if (manifest.files.some(file => file.owners.includes("init"))) {
    // Keep original destinations even when application config has since moved.
    for (const entry of manifest.files.filter(file => file.owners.includes("init"))) {
      const name = entry.path.split("/").pop()!;
      const content = name === "vlak.css" ? loadBundle().css.vlak : FONT_FILES.includes(name) ? readFileSync(join(resolveFontsDir(), name)) : undefined;
      if (content === undefined) throw new Error(`Unknown foundation file: ${entry.path}`);
      sources.push({ path: entry.path, content, owners: ["init"] });
    }
  }
  const fingerprint = sha(JSON.stringify(sources.map(file => ({ ...file, content: sha(Buffer.from(file.content)) }))));
  if (sha(JSON.stringify(installed(cwd))) !== installedFingerprint) throw new Error("Installed metadata changed while resolving the target snapshot. Generate a fresh plan.");
  return makeUpdatePlan(cwd, sources, `${registry ? `registry:${registry}` : `bundled:${loadBundle().version}`};sha256:${fingerprint}`);
}
