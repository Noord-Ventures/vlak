import assert from "node:assert/strict";
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateRawSync } from "node:zlib";
import { interfaceStarters } from "../apps/www/app/starters/catalog.ts";
import { packageName, transformStarterSource } from "./interface-starter-source.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const site = join(root, "apps/www");
export const starterPackageVersion = JSON.parse(readFileSync(join(root, "packages/react/package.json"), "utf8")).version;
if (JSON.parse(readFileSync(join(root, "packages/core/package.json"), "utf8")).version !== starterPackageVersion) throw new Error("Core and React package versions must match before exporting starters");
const analyticsStub = `// The standalone starter does not send website analytics.\nexport function trackSiteEvent(_event: string, _properties?: Record<string, unknown>) {}\n`;

function localPath(from, specifier) {
  const candidate = specifier.startsWith("@/") ? join(site, specifier.slice(2)) : resolve(dirname(from), specifier);
  if (!candidate.startsWith(`${site}/`)) throw new Error(`Starter import leaves the site source: ${specifier}`);
  const candidates = [candidate, ...[".ts", ".tsx", ".js", ".jsx", ".mjs", ".json", "/index.ts", "/index.tsx", "/index.js"].map(suffix => candidate + suffix)];
  if (/\.(m?js|jsx)$/.test(candidate)) candidates.push(candidate.replace(/\.(m?js|jsx)$/, ".ts"), candidate.replace(/\.(m?js|jsx)$/, ".tsx"));
  for (const path of candidates) {
    if (existsSync(path) && statSync(path).isFile()) return path;
  }
  throw new Error(`Missing starter dependency ${specifier} from ${from}`);
}

function inside(directory, path) {
  directory = resolve(directory);
  assert(path.startsWith(`${directory}/`), `Starter path must stay inside ${directory}: ${path}`);
  for (let current = path; current !== directory; current = dirname(current)) assert(!lstatSync(current).isSymbolicLink(), `Starter files must not follow symlinks: ${current}`);
  return path;
}
const scriptExtension = /\.(?:[cm]?tsx?|jsx?)$/;
const relativeImport = (from, to) => { const path = relative(dirname(from), to).replaceAll("\\", "/"); return path.startsWith(".") ? path : `./${path}`; };
const html = value => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

// Generated website copies are ignored by git and can be stale or absent in CI.
// Always take documentation from the canonical release inputs, even if public/ exists.
export function starterAssetSource(path) {
  assert(!isAbsolute(path) && !path.split(/[\\/]/).includes(".."), `Public starter assets must be relative and bounded: ${path}`);
  if (path === "design.md") return inside(root, join(root, "design.md"));
  if (/^docs\/[\w-]+\.md$/.test(path)) return inside(root, join(root, "registry", path));
  return inside(join(site, "public"), resolve(site, "public", path));
}

export function projectFiles(starter) {
  assert.match(starter.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Starter slugs must be safe directory names");
  const dependencies = { ...starter.dependencies, "@noorddev/vlak": starterPackageVersion, "@noorddev/vlak-react": starterPackageVersion, react: "^19.2.0", "react-dom": "^19.2.0" };
  const devDependencies = { ...starter.devDependencies, "@types/react": "^19.2.0", "@types/react-dom": "^19.2.0", typescript: "~5.9.3", vite: "^7.1.0" };
  for (const [name, version] of Object.entries({ ...dependencies, ...devDependencies })) {
    assert.match(name, /^(?:@[a-z0-9._-]+\/)?[a-z0-9._-]+$/, `Invalid starter package name: ${name}`);
    assert.match(version, /^(?:\^|~)?\d+\.\d+\.\d+(?:-[a-z0-9.-]+)?$/, `Starter dependencies must use explicit public semver versions: ${name}`);
    assert(name !== "next", "A standalone starter cannot require Next.js");
  }
  const env = starter.env ?? [];
  for (const variable of env) {
    assert.match(variable.name, /^VITE_[A-Z0-9_]+$/, "Only declared public Vite environment variables may enter the starter");
    if (variable.prop) assert.match(variable.prop, /^[a-zA-Z_$][\w$]*$/, "Environment props must be valid JSX identifiers");
    assert(variable.description?.trim(), `Describe environment variable ${variable.name}`);
  }
  assert.equal(new Set(env.map(variable => variable.name)).size, env.length, "Environment variable names must be unique");
  const files = new Map(), assetDirectories = new Set();
  function copyPublic(path) {
    const absolute = starterAssetSource(path);
    if (statSync(absolute).isDirectory()) {
      for (const entry of readdirSync(absolute).sort()) copyPublic(`${path}/${entry}`);
    } else files.set(`public/${path}`, readFileSync(absolute));
  }
  for (const asset of [...starter.assets ?? [], ...starter.credits ?? []]) copyPublic(asset);
  function include(filename) {
    const output = `src/${relative(site, filename)}`;
    if (files.has(output)) return;
    inside(site, filename);
    if (!scriptExtension.test(filename) && extname(filename) !== ".css") { files.set(output, readFileSync(filename)); return; }
    let source = relative(site, filename) === "lib/site-analytics.ts" ? analyticsStub : readFileSync(filename, "utf8");
    files.set(output, Buffer.from(source));
    source = transformStarterSource({ filename, source, envNames: env.map(variable => variable.name),
      onImport(specifier, { local, typeOnly }) {
        if (!local) {
          const name = packageName(specifier);
          assert(name !== "next", `Next runtime import must be adapted before exporting ${starter.slug}: ${specifier}`);
          assert(Object.hasOwn(dependencies, name) || typeOnly && Object.hasOwn(devDependencies, name), `Undeclared package import ${specifier} in ${filename}; declare it in starter dependencies`);
          return specifier;
        }
        const [, path, suffix] = /^([^?#]*)(.*)$/.exec(specifier);
        const dependency = localPath(filename, path);
        include(dependency);
        return relativeImport(filename, dependency) + suffix;
      },
      onAsset(value, { kind }) {
        const match = /^([^?#]*)(.*)$/.exec(value), path = match[1], suffix = match[2];
        if (path.startsWith("/")) {
          const absolute = starterAssetSource(path.slice(1));
          if (statSync(absolute).isDirectory()) assetDirectories.add(path.slice(1).replace(/\/$/, "") + "/");
          else copyPublic(path.slice(1));
          return kind === "css" ? relativeImport(output, `public${path}`) + suffix : value;
        }
        assert(kind === "css", `Unsupported relative script asset: ${value}`);
        const asset = localPath(filename, path);
        include(asset);
        return relativeImport(filename, asset) + suffix;
      },
    });
    files.set(output, Buffer.from(source));
  }
  include(join(site, starter.entry));
  for (const style of starter.styles) include(join(site, style));
  const manifest = {
    name: `vlak-${starter.slug}-starter`, version: "0.0.0", private: true, type: "module", license: "MIT",
    engines: { node: ">=22.12.0" },
    scripts: { dev: "vite --host 0.0.0.0", build: "vite build", preview: "vite preview", typecheck: "tsc --noEmit" },
    dependencies, devDependencies,
  };
  for (const directory of assetDirectories) assert([...files.keys()].some(path => path.startsWith(`public/${directory}`)), `Referenced public directory has no declared assets: ${directory}`);
  const put = (name, value) => files.set(name, Buffer.from(value));
  const services = starter.networkNotes ?? [];
  const credits = starter.credits ?? [];
  const creditFooter = credits.length ? `<footer className="starter-credits" aria-label="Sample asset attribution">${credits.map((path, index) => `<a href={import.meta.env.BASE_URL + ${JSON.stringify(path)}}>Asset credits${credits.length > 1 ? ` ${index + 1}` : ""}</a>`).join("")}</footer>` : "";
  put("package.json", `${JSON.stringify(manifest, null, 2)}\n`);
  put("tsconfig.json", `${JSON.stringify({ compilerOptions: { target: "ES2022", lib: ["ES2022", "DOM", "DOM.Iterable"], types: ["vite/client"], module: "ESNext", moduleResolution: "bundler", jsx: "react-jsx", strict: true, skipLibCheck: true, allowImportingTsExtensions: true, noEmit: true, resolveJsonModule: true }, include: ["src"] }, null, 2)}\n`);
  put("vite.config.ts", `import { defineConfig } from "vite";\nexport default defineConfig({ base: "./", esbuild: { jsx: "automatic" } });\n`);
  put("index.html", `<!doctype html>\n<html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><meta name="description" content="${html(starter.description)}" /><title>${html(starter.title)} · Vlak starter</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>\n`);
  put("src/main.tsx", `import { createRoot } from "react-dom/client";\nimport "@noorddev/vlak-react/css";\nimport { ${starter.component} } from "./${starter.entry}";\n${starter.styles.map(style => `import "./${style}";`).join("\n")}\nimport "./starter.css";\n\ncreateRoot(document.getElementById("root")!).render(<><main className="starter"><${starter.component} {...${JSON.stringify(starter.props)}}${env.filter(variable => variable.prop).map(variable => ` ${variable.prop}={import.meta.env.${variable.name}}`).join("")} /></main>${creditFooter}</>);\n`);
  put("src/starter.css", `:root { font-family: system-ui, sans-serif; background: var(--bg); color: var(--text); }\n* { box-sizing: border-box; }\nbody { margin: 0; }\n.starter { width: min(100%, 1440px); height: 100svh; min-height: 640px; container-type: inline-size; margin-inline: auto; padding: 24px; }\n.starter-credits { width: min(100%, 1440px); display: flex; flex-wrap: wrap; gap: 8px 20px; margin-inline: auto; padding: 8px 24px; font-size: 12px; }\n.starter-credits a { display: inline-flex; align-items: center; min-height: 44px; color: var(--text); text-underline-offset: 3px; }\n.starter-credits a:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }\n.mo .mo-device[data-platform="ios"] .mo-phone { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }\n.mo .mo-device[data-platform="android"] .mo-phone { font-family: Roboto, "Noto Sans", system-ui, sans-serif; }\n@media (max-width: 640px) { .starter, .starter-credits { padding: 8px; } }\n`);
  put(".gitignore", "node_modules/\ndist/\n*.tsbuildinfo\n.env*\n!.env.example\n");
  put(".env.example", `# Public Vite configuration only. Never put server secrets here.\n${env.length ? env.map(variable => `# ${variable.required ? "Required" : "Optional"}: ${variable.description.replaceAll("\n", "\n# ")}\n${variable.name}=\n`).join("\n") : "# This starter needs no environment variables.\n"}`);
  put("CREDITS.md", `# Asset credits\n\nSource code is MIT licensed. Bundled third-party assets retain their original terms and attribution.\n\n${credits.length ? credits.map(path => `- [${path}](public/${path})`).join("\n") : "No additional attribution files are declared for this study."}\n`);
  const config = env.length ? `\n## Configuration\n\nCopy \`.env.example\` to \`.env.local\` to enable optional services, then restart Vite. Variables beginning with \`VITE_\` are public in browser builds; use public, domain-restricted tokens only.\n\n${env.map(variable => `- \`${variable.name}\` (${variable.required ? "required" : "optional"}): ${variable.description}`).join("\n")}\n` : "";
  put("README.md", `# ${starter.title}\n\n${starter.description}\n\n## Run\n\nRequires Node 22.12 or newer and Vlak ${starterPackageVersion}. Dependencies install from npm. No monorepo installation is needed.\n\n\`\`\`sh\nnpm install\nnpm run dev\n\`\`\`\n\nOpen the local URL printed by Vite. \`npm run typecheck\` checks TypeScript; \`npm run build\` creates a static \`dist/\` directory. The build also works when hosted below a subdirectory.\n${config}\n## Make it yours\n\nStart in \`${starter.edit}\`. Source files are copied from the Vlak study, including its local state and styles. The \`src/components\` and \`src/lib\` directories, when present, contain supporting code you own too.\n\n${starter.note}\n\n## Data and external services\n\nNo website analytics are sent. Platform examples retain native system fonts. Bundled sample assets stay local; see [asset credits](CREDITS.md) for their terms.\n\n${services.length ? services.map(note => `- ${note}`).join("\n") : "No external service is required for the supplied local example."}\n\n[Component documentation](https://vlak.dev/components/) · [Study preview](https://vlak.dev${starter.preview}) · [Upstream source](${starter.source})\n\nSource code is MIT licensed. See LICENSE and CREDITS.md.\n`);
  files.set("LICENSE", readFileSync(join(root, "LICENSE")));
  return files;
}

// A small ZIP writer keeps static exports independent of system zip or another package.
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) { crc ^= byte; for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1)); }
  return (crc ^ 0xffffffff) >>> 0;
}
function zip(files, folder) {
  const entries = [], directory = [];
  let offset = 0;
  for (const [filename, data] of [...files].sort(([a], [b]) => a.localeCompare(b, "en"))) {
    const name = Buffer.from(`${folder}/${filename}`), compressed = deflateRawSync(data), crc = crc32(data);
    const header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50, 0); header.writeUInt16LE(20, 4); header.writeUInt16LE(8, 8); header.writeUInt16LE(33, 12);
    header.writeUInt32LE(crc, 14); header.writeUInt32LE(compressed.length, 18); header.writeUInt32LE(data.length, 22); header.writeUInt16LE(name.length, 26);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0); central.writeUInt16LE(20, 4); central.writeUInt16LE(20, 6); central.writeUInt16LE(8, 10); central.writeUInt16LE(33, 14);
    central.writeUInt32LE(crc, 16); central.writeUInt32LE(compressed.length, 20); central.writeUInt32LE(data.length, 24); central.writeUInt16LE(name.length, 28); central.writeUInt32LE(offset, 42);
    entries.push(header, name, compressed); directory.push(central, name); offset += header.length + name.length + compressed.length;
  }
  const central = Buffer.concat(directory), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.size, 8); end.writeUInt16LE(files.size, 10); end.writeUInt32LE(central.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...entries, central, end]);
}

export function buildInterfaceStarters(outputDirectory) {
  const output = outputDirectory ? resolve(outputDirectory) : join(site, "public/starter");
  if (outputDirectory && existsSync(output) && readdirSync(output).length) throw new Error(`Export directory must be empty: ${output}`);
  mkdirSync(output, { recursive: true });
  for (const starter of interfaceStarters) {
    const files = projectFiles(starter), folder = `vlak-${starter.slug}`;
    if (outputDirectory) for (const [name, content] of files) { const path = join(output, folder, name); mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, content); }
    const archive = zip(files, folder);
    writeFileSync(join(output, `${starter.slug}.zip`), archive);
    console.log(`${starter.slug}: ${files.size} files, ${(archive.length / 1024).toFixed(0)} KiB`);
  }
  return output;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.length && (args.length !== 2 || args[0] !== "--out" || !isAbsolute(args[1]))) throw new Error("Usage: node --experimental-strip-types scripts/build-interface-starters.mjs [--out /absolute/empty/directory]");
  buildInterfaceStarters(args[1]);
}
