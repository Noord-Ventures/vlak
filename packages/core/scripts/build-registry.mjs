// Generates the distributable registry at <repo>/registry/:
//
//   registry/index.json    shadcn-compatible registry index (no file contents)
//   registry/<name>.json   shadcn-compatible registry-item, contents inlined
//   registry/bundle.json   every item with contents plus the generated docs
//                          markdown, consumed by @noorddev/vlak-cli and
//                          @noorddev/vlak-mcp (both work offline)
//
// Components install two ways: through the vlak CLI (bundles this
// output), or through `npx shadcn add <url>/r/<name>.json` from any
// host serving this directory.
//
// Run with: npm run build:registry  (Node ≥ 22.6). Needs registry/docs
// from scripts/build-docs.mjs; the npm script runs it first.

import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, normalize, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { vlakTokens } from "../src/tokens.ts";
import { vlakComponents } from "../src/registry.ts";
import { workflowStylesheet } from "../../react/scripts/workflow-styles.mjs";

const PUBLIC_HOST = vlakTokens.meta.url;
const REGISTRY_URL = process.env.VLAK_REGISTRY_URL ?? `${PUBLIC_HOST}/r`;
const VERSION = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")).version;

const corePath = (p) => fileURLToPath(new URL(`../${p}`, import.meta.url));
const repoPath = (p) => fileURLToPath(new URL(`../../../${p}`, import.meta.url));
const readCore = (p) => readFileSync(corePath(p), "utf8");
const readReact = (p) => readFileSync(repoPath(`packages/react/src/${p}`), "utf8");

const outDir = repoPath("registry");
mkdirSync(outDir, { recursive: true });
const write = (name, data) => {
  writeFileSync(`${outDir}/${name}`, JSON.stringify(data, null, 2) + "\n");
  console.log(`wrote registry/${name}`);
};

/* The base style every component needs: tokens, page base, type scale,
   reduced-motion rules: everything in vlak.css except components. */
const baseCss = ["tokens.css", "base.css", "type.css", "touch.css", "motion.css"]
  .map((f) => readCore(`css/${f}`))
  .join("\n");

const baseItem = {
  $schema: "https://ui.shadcn.com/schema/registry-item.json",
  name: "vlak-base",
  type: "registry:style",
  title: "Vlak base",
  description:
    "Tokens (light + dark), page base with the visible module grid, type scale, and reduced-motion rules.",
  registryDependencies: [`${REGISTRY_URL}/inter.json`],
  files: [
    {
      path: "vlak/styles/base.css",
      content: baseCss,
      type: "registry:file",
      target: "styles/vlak/base.css",
    },
  ],
  meta: { vlak: { category: "foundation", cssOnly: true } },
};

const interCss = `/* Inter, SIL OFL 1.1. Variable, latin + latin-ext. System sans is fallback only. */
@font-face{
  font-family:Inter;
  font-style:normal;
  font-weight:100 900;
  font-display:swap;
  src:url("${PUBLIC_HOST}/fonts/inter/InterVariable-latin-ext.woff2") format("woff2");
  unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF
}
@font-face{
  font-family:Inter;
  font-style:normal;
  font-weight:100 900;
  font-display:swap;
  src:url("${PUBLIC_HOST}/fonts/inter/InterVariable-latin.woff2") format("woff2");
  unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD
}
`;

const interItem = {
  $schema: "https://ui.shadcn.com/schema/registry-item.json",
  name: "inter",
  type: "registry:font",
  title: "Inter",
  description:
    "Default face. Variable Inter (latin + latin-ext), SIL OFL 1.1. System sans is fallback only.",
  font: {
    family: "Inter",
    provider: "google",
    import: "Inter",
    variable: "--font-sans",
    weight: ["100 900"],
    subsets: ["latin", "latin-ext"],
  },
  files: [
    {
      path: "vlak/styles/inter.css",
      content: interCss,
      type: "registry:file",
      target: "styles/vlak/inter.css",
    },
  ],
  meta: {
    vlak: {
      category: "foundation",
      cssOnly: true,
      license: "SIL Open Font License 1.1",
      licenseUrl: "https://openfontlicense.org",
      licenseText: readCore("css/fonts/inter/OFL.txt"),
    },
  },
};

/* Files every React component imports. They install once, as one
   registry:lib item, and every component depends on it. */
const LIB_FILES = ["cx.ts", "rs.ts", "tokens.stylex.ts", "hidden.stylex.ts", "merge-refs.ts"];
const LIB_ITEM = "vlak-lib";

function posix(p) {
  return p.replaceAll("\\", "/");
}

function resolveLocal(fromRel, spec) {
  const collapsed = posix(normalize(join(dirname(fromRel), spec)));
  const candidates = [collapsed, `${collapsed}.tsx`, `${collapsed}.ts`, `${collapsed}/index.ts`, `${collapsed}/index.tsx`];
  for (const c of candidates) {
    const abs = repoPath(`packages/react/src/${c}`);
    if (existsSync(abs) && lstatSync(abs).isFile()) return c;
  }
  return null;
}

function isLib(rel) {
  return LIB_FILES.includes(rel);
}

/* The component that owns a React entry file. Chart family entries share
   components/chart.tsx; the owner is the first registry entry naming it. */
const ownerOfEntry = new Map();
for (const c of vlakComponents) {
  if (c.react && !ownerOfEntry.has(c.react)) ownerOfEntry.set(c.react, c.name);
}

/* Where a source file lands in the consumer's tree. Entry files take the
   owning component's name; helpers keep their path under vlak/. */
function destFor(srcRel) {
  const owner = ownerOfEntry.get(srcRel);
  if (owner) return `vlak/${owner}${srcRel.endsWith(".tsx") ? ".tsx" : ".ts"}`;
  return `vlak/${srcRel.replace(/^components\//, "")}`;
}

/* Walk a component's imports. Stops at lib files and at other components'
   entry files: those install through registry dependencies, so no source
   is inlined twice across the registry. */
function collectReactGraph(component) {
  const entry = component.react;
  const owner = ownerOfEntry.get(entry);
  const sources = new Map();
  const deps = new Set([LIB_ITEM]);
  if (owner !== component.name) {
    deps.add(owner);
    return { sources, deps };
  }
  const queue = [entry];
  while (queue.length) {
    const rel = queue.shift();
    if (!rel || sources.has(rel)) continue;
    const source = readReact(rel);
    sources.set(rel, source);
    for (const match of source.matchAll(/from ["'](\.[^"']+)["']/g)) {
      const resolved = resolveLocal(rel, match[1]);
      if (!resolved) throw new Error(`${rel}: cannot resolve import ${match[1]}`);
      if (isLib(resolved)) continue;
      const other = ownerOfEntry.get(resolved);
      if (other && other !== component.name) {
        deps.add(other);
        continue;
      }
      queue.push(resolved);
    }
  }
  return { sources, deps };
}

function rewriteImports(source, srcRel, dest) {
  return source.replace(/from ["'](\.[^"']+)["']/g, (_full, spec) => {
    const resolved = resolveLocal(srcRel, spec);
    if (!resolved) throw new Error(`${srcRel}: cannot resolve import ${spec}`);
    const target = destFor(resolved).replace(/\.(tsx|ts)$/, "");
    let rel = posix(relative(dirname(dest), target));
    if (!rel.startsWith(".")) rel = `./${rel}`;
    return `from "${rel}"`;
  });
}

function fileEntry(srcRel, source) {
  const dest = destFor(srcRel);
  const isComponent = dest.endsWith(".tsx");
  return {
    path: dest,
    content: rewriteImports(source, srcRel, dest),
    type: isComponent ? "registry:component" : "registry:file",
    target: `components/${dest}`,
  };
}

const libItem = {
  $schema: "https://ui.shadcn.com/schema/registry-item.json",
  name: LIB_ITEM,
  type: "registry:lib",
  title: "Vlak lib",
  description: "Shared helpers every Vlak React component imports: the rs() class seam, cx, StyleX tokens, and the hidden-element leaf.",
  dependencies: ["@stylexjs/stylex"],
  files: LIB_FILES.map((f) => ({ ...fileEntry(f, readReact(f)), type: "registry:lib" })),
  meta: { vlak: { category: "foundation", cssOnly: false, registryDependencies: [] } },
};

const items = [interItem, baseItem, libItem];

for (const component of vlakComponents) {
  const files = [];
  const deps = new Set(component.registryDependencies ?? []);

  if (component.react) {
    const graph = collectReactGraph(component);
    for (const [srcRel, source] of graph.sources) files.push(fileEntry(srcRel, source));
    for (const d of graph.deps) deps.add(d);
  }

  for (const cssFile of component.css) {
    const base = cssFile.split("/").pop();
    files.push({
      path: `vlak/styles/${base}`,
      content: readCore(`css/${cssFile}`),
      type: "registry:file",
      target: `styles/vlak/${base}`,
    });
  }
  for (const stylesheet of component.styles ?? []) {
    if (!stylesheet.startsWith("@noorddev/vlak-react/")) continue;
    const source = stylesheet.slice("@noorddev/vlak-react/".length);
    if (!source.endsWith(".css") || source.includes("..")) continue;
    files.push({ path: `vlak/styles/${source}`, content: source === "workflow.css" ? workflowStylesheet() : readReact(source), type: "registry:file", target: `styles/vlak/${source}` });
  }

  const registryDependencies = [...deps];
  items.push({
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: component.name,
    type: "registry:component",
    title: component.title,
    description: component.description,
    registryDependencies: [
      `${REGISTRY_URL}/vlak-base.json`,
      `${REGISTRY_URL}/inter.json`,
      ...registryDependencies.map((d) => `${REGISTRY_URL}/${d}.json`),
    ],
    ...(component.react
      ? {
          dependencies: ["@stylexjs/stylex", ...(component.dependencies ?? [])],
          devDependencies: ["@stylexjs/babel-plugin"],
          docs: [
            "Vlak leaves are StyleX. Compile them with @stylexjs/babel-plugin (Vite: @stylexjs/unplugin, Next: @stylexjs/nextjs-plugin). If you would rather not run a compiler, import @noorddev/vlak-react instead: it ships precompiled with one stylesheet.",
            ...(component.styles ?? []).map(style => style.startsWith("@noorddev/vlak-react/")
              ? `Import the copied styles/vlak/${style.slice("@noorddev/vlak-react/".length)} stylesheet in your application.`
              : `Required stylesheet: import "${style}";`),
          ].join("\n"),
        }
      : {}),
    files,
    meta: {
      vlak: {
        category: component.category,
        classes: component.classes,
        snippet: component.snippet,
        cssOnly: !component.react,
        registryDependencies,
        ...(component.reactImport ? { reactImport: component.reactImport } : {}),
        ...(component.dependencies ? { dependencies: component.dependencies } : {}),
        ...(component.styles ? { styles: component.styles } : {}),
        ...(component.hidden ? { hidden: true } : {}),
        ...(component.aliases ? { aliases: component.aliases } : {}),
        ...(component.example ? { example: component.example } : {}),
        ...(component.usage ? { usage: component.usage } : {}),
        ...(component.keyboard ? { keyboard: component.keyboard } : {}),
        ...(component.a11y ? { a11y: component.a11y } : {}),
      },
    },
  });
}

/* The generated markdown docs (scripts/build-docs.mjs), so the CLI and
   the MCP server can print them offline. */
const docsDir = repoPath("registry/docs");
if (!existsSync(docsDir)) throw new Error("registry/docs missing: run `npm run build:docs` first");
const docs = { guide: "", index: "", tokens: "", components: {} };
for (const file of readdirSync(docsDir).sort()) {
  if (!file.endsWith(".md")) continue;
  const name = file.slice(0, -3);
  const text = readFileSync(join(docsDir, file), "utf8");
  if (name in docs && name !== "components") docs[name] = text;
  else docs.components[name] = text;
}

for (const item of items) write(`${item.name}.json`, item);

write("index.json", {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "vlak",
  homepage: vlakTokens.meta.url,
  items: items.map(({ files, ...rest }) => ({
    ...rest,
    files: files.map(({ content, ...file }) => file),
  })),
});

write("bundle.json", {
  name: "vlak",
  version: VERSION,
  css: {
    vlak: readCore("css/vlak.css"),
  },
  items,
  docs,
});
