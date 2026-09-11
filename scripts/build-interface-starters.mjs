import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateRawSync } from "node:zlib";
import { interfaceStarters } from "../apps/www/app/starters/catalog.ts";

const root = fileURLToPath(new URL("../", import.meta.url));
const site = join(root, "apps/www");
export const starterPackageVersion = JSON.parse(readFileSync(join(root, "packages/react/package.json"), "utf8")).version;
if (JSON.parse(readFileSync(join(root, "packages/core/package.json"), "utf8")).version !== starterPackageVersion) throw new Error("Core and React package versions must match before exporting starters");
const analyticsStub = `// The standalone starter does not send website analytics.\nexport function trackSiteEvent(_event: string, _properties?: Record<string, unknown>) {}\n`;

function localPath(from, specifier) {
  const candidate = specifier.startsWith("@/") ? join(site, specifier.slice(2)) : resolve(dirname(from), specifier);
  if (!candidate.startsWith(`${site}/`)) throw new Error(`Starter import leaves the site source: ${specifier}`);
  for (const suffix of ["", ".ts", ".tsx", ".js", ".mjs", "/index.ts", "/index.tsx"]) {
    if (existsSync(candidate + suffix) && statSync(candidate + suffix).isFile()) return candidate + suffix;
  }
  throw new Error(`Missing starter dependency ${specifier} from ${from}`);
}

function projectFiles(starter) {
  const files = new Map();
  function include(filename) {
    const output = `src/${relative(site, filename)}`;
    if (files.has(output)) return;
    let source = relative(site, filename) === "lib/site-analytics.ts" ? analyticsStub : readFileSync(filename, "utf8");
    // The site references locally supplied fonts; exports use the platform fonts already on the device.
    if (output.endsWith("/platform-controls.css")) source = source.replace(/@font-face\s*\{[^}]*\}\s*/g, "");
    files.set(output, Buffer.from(source));
    const dependencies = [];
    const imports = /(?:\b(?:import|export)\s+(?:[^;"']*?\s+from\s*)?|@import\s+)["']([^"']+)["']|new URL\(["']([^"']+)["'],\s*import\.meta\.url\)/g;
    for (const match of source.matchAll(imports)) {
      const specifier = match[1] ?? match[2];
      if (!specifier.startsWith(".") && !specifier.startsWith("@/")) {
        if (!specifier.startsWith("@noorddev/vlak-react") && !["react", "react-dom"].includes(specifier)) throw new Error(`Undeclared package import ${specifier} in ${filename}`);
        continue;
      }
      const dependency = localPath(filename, specifier);
      dependencies.push(dependency);
      if (specifier.startsWith("@/")) {
        const next = relative(dirname(filename), dependency);
        source = source.replaceAll(`"${specifier}"`, `"${next.startsWith(".") ? next : `./${next}`}"`);
      }
    }
    for (const dependency of dependencies) include(dependency);
    for (const match of source.matchAll(/["'(](\/(?:interfaces|fonts)\/[^"')\s]+\.(?:png|jpe?g|webp|svg|gif|woff2?|ttf))["')]/g)) {
      const asset = join(site, "public", match[1]);
      if (!existsSync(asset)) throw new Error(`Missing starter asset ${match[1]}`);
      files.set(`public${match[1]}`, readFileSync(asset));
    }
    if ([".ts", ".tsx", ".js", ".mjs"].includes(extname(filename))) {
      source = source.replace(/(=)?(["'])(\/(?:interfaces|fonts)\/[^"']+\.(?:png|jpe?g|webp|svg|gif|woff2?|ttf))\2/g, (_match, attribute, _quote, asset) => {
        const expression = `import.meta.env.BASE_URL + ${JSON.stringify(asset.slice(1))}`;
        return attribute ? `={${expression}}` : `(${expression})`;
      });
    }
    files.set(output, Buffer.from(source));
  }
  include(join(site, starter.entry));
  for (const style of starter.styles) include(join(site, style));
  const manifest = {
    name: `vlak-${starter.slug}-starter`, version: "0.0.0", private: true, type: "module", license: "MIT",
    engines: { node: ">=22.12.0" },
    scripts: { dev: "vite --host 0.0.0.0", build: "vite build", preview: "vite preview", typecheck: "tsc --noEmit" },
    dependencies: { "@noorddev/vlak": starterPackageVersion, "@noorddev/vlak-react": starterPackageVersion, react: "^19.2.0", "react-dom": "^19.2.0" },
    devDependencies: { "@types/react": "^19.2.0", "@types/react-dom": "^19.2.0", typescript: "~5.9.3", vite: "^7.1.0" },
  };
  const put = (name, value) => files.set(name, Buffer.from(value));
  put("package.json", `${JSON.stringify(manifest, null, 2)}\n`);
  put("tsconfig.json", `${JSON.stringify({ compilerOptions: { target: "ES2022", lib: ["ES2022", "DOM", "DOM.Iterable"], types: ["vite/client"], module: "ESNext", moduleResolution: "bundler", jsx: "react-jsx", strict: true, skipLibCheck: true, allowImportingTsExtensions: true, noEmit: true, resolveJsonModule: true }, include: ["src"] }, null, 2)}\n`);
  put("vite.config.ts", `import { defineConfig } from "vite";\nexport default defineConfig({ base: "./", esbuild: { jsx: "automatic" } });\n`);
  put("index.html", `<!doctype html>\n<html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><meta name="description" content="${starter.description}" /><title>${starter.title} · Vlak starter</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>\n`);
  put("src/main.tsx", `import { createRoot } from "react-dom/client";\nimport "@noorddev/vlak-react/css";\nimport { ${starter.component} } from "./${starter.entry}";\n${starter.styles.map(style => `import "./${style}";`).join("\n")}\nimport "./starter.css";\n\ncreateRoot(document.getElementById("root")!).render(<main className="starter"><${starter.component} {...${JSON.stringify(starter.props)}} /></main>);\n`);
  put("src/starter.css", `:root { font-family: system-ui, sans-serif; background: var(--bg); color: var(--text); }\n* { box-sizing: border-box; }\nbody { margin: 0; }\n.starter { width: min(100%, 1440px); margin-inline: auto; padding: 24px; }\n.mo .mo-device[data-platform="ios"] .mo-phone { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }\n.mo .mo-device[data-platform="android"] .mo-phone { font-family: Roboto, "Noto Sans", system-ui, sans-serif; }\n@media (max-width: 640px) { .starter { padding: 8px; } }\n`);
  put(".gitignore", "node_modules/\ndist/\n*.tsbuildinfo\n.env*\n");
  put("README.md", `# ${starter.title}\n\n${starter.description}\n\n## Run\n\nRequires Node 22.12 or newer and Vlak ${starterPackageVersion}. Dependencies install from npm. No monorepo installation is needed.\n\n\`\`\`sh\nnpm install\nnpm run dev\n\`\`\`\n\nOpen the local URL printed by Vite. \`npm run typecheck\` checks TypeScript; \`npm run build\` creates a static \`dist/\` directory. The build also works when hosted below a subdirectory.\n\n## Make it yours\n\nStart in \`${starter.edit}\`. Source files are copied from the Vlak study, including its local state and styles. The \`src/components\` and \`src/lib\` directories, when present, contain supporting code you own too.\n\n${starter.note}\n\nNo website analytics are sent. The mobile examples retain platform system fonts. Sample images are bundled locally.\n\n[Component documentation](https://vlak.dev/components/) · [Study preview](https://vlak.dev${starter.preview}) · [Upstream source](${starter.source})\n\nMIT licensed. See LICENSE.\n`);
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
