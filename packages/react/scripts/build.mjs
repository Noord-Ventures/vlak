// Builds @noorddev/vlak-react as precompiled StyleX.
//
//   src/**/*.ts(x)  →  dist/**/*.js        one ESM module per source file, StyleX
//                                           already compiled, "use client" kept
//                   →  dist/vlak-react.css
//                                           Vlak base (tokens, page, type, touch,
//                                           motion) + every compiled leaf, in layers
//                   →  dist/tokens.stylex.js
//                                           the token file, NOT compiled, for
//                                           consumers who write StyleX leaves
//                                           against Vlak tokens
//                   →  dist/tokens.js       the same tokens compiled: plain strings,
//                                           what the components import at runtime
//                   →  dist/**/*.d.ts       via tsc
//
// Two passes. Pass 1 strips types and JSX and gives relative imports .js
// extensions. Pass 2 runs the StyleX compiler over the dist files, so var
// hashes derive from `@noorddev/vlak-react:dist/tokens.stylex.js`, the
// exact path a consumer's compiler resolves `@noorddev/vlak-react/tokens.stylex`
// to. Compiled components then import ./tokens.js instead, because the
// StyleX runtime throws on an uncompiled defineVars call and the
// import-the-package path must work with no compiler at all.

import { cpSync, copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { workflowStylesheet } from "./workflow-styles.mjs";

const require = createRequire(import.meta.url);
const babel = require("@babel/core");
const stylexPlugin = require("@stylexjs/babel-plugin");

const pkgDir = fileURLToPath(new URL("..", import.meta.url));
const srcDir = join(pkgDir, "src");
const distDir = join(pkgDir, "dist");
const coreCss = resolve(pkgDir, "../core/css");
const TOKENS = "tokens.stylex.js";

rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });

function walk(dir, test, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, test, acc);
    else if (test.test(name)) acc.push(p);
  }
  return acc;
}

/* Relative imports get explicit .js extensions so Node ESM resolves them. */
function jsExtensions() {
  const fix = (node, file) => {
    const spec = node.value;
    if (!spec.startsWith(".")) return;
    const base = resolve(dirname(file), spec);
    const target = [`${base}.tsx`, `${base}.ts`, join(base, "index.tsx"), join(base, "index.ts")].find((c) => existsSync(c));
    if (!target) return;
    let rel = relative(dirname(file), target).replace(/\\/g, "/").replace(/\.(tsx|ts)$/, ".js");
    if (!rel.startsWith(".")) rel = `./${rel}`;
    node.value = rel;
  };
  return {
    visitor: {
      ImportDeclaration(path, state) {
        fix(path.node.source, state.filename);
      },
      ExportNamedDeclaration(path, state) {
        if (path.node.source) fix(path.node.source, state.filename);
      },
      ExportAllDeclaration(path, state) {
        fix(path.node.source, state.filename);
      },
    },
  };
}

/* After StyleX has resolved (and hashed) tokens.stylex.js, point the
   runtime import at the compiled copy. */
function runtimeTokens() {
  const swap = (node) => {
    if (node?.value?.endsWith(`/${TOKENS}`)) node.value = node.value.replace(TOKENS, "tokens.js");
  };
  return {
    visitor: {
      Program: {
        exit(path) {
          for (const stmt of path.node.body) {
            if (stmt.type === "ImportDeclaration" || stmt.type === "ExportNamedDeclaration" || stmt.type === "ExportAllDeclaration") swap(stmt.source);
          }
        },
      },
    },
  };
}

/* ── Pass 1: TypeScript and JSX out, .js extensions in ── */
const staged = [];
for (const file of walk(srcDir, /\.(ts|tsx)$/)) {
  const result = babel.transformSync(readFileSync(file, "utf8"), {
    filename: file,
    babelrc: false,
    configFile: false,
    sourceMaps: true,
    presets: [
      ["@babel/preset-typescript", { isTSX: file.endsWith(".tsx"), allExtensions: true, onlyRemoveTypeImports: true }],
      ["@babel/preset-react", { runtime: "automatic" }],
    ],
    plugins: [jsExtensions],
  });
  const dest = join(distDir, relative(srcDir, file)).replace(/\.(tsx|ts)$/, ".js");
  mkdirSync(dirname(dest), { recursive: true });
  staged.push({ dest, code: result.code, map: result.map });
  writeFileSync(dest, result.code);
}

/* ── Pass 2: StyleX over dist ── */
const stylexOptions = {
  dev: false,
  runtimeInjection: false,
  treeshakeCompensation: true,
  enableInlinedConditionalMerge: true,
  unstable_moduleResolution: { type: "commonJS", rootDir: pkgDir },
};
const rules = [];
for (const { dest, code, map } of staged) {
  const isTokens = dest.endsWith(`/${TOKENS}`);
  const result = babel.transformSync(code, {
    filename: dest,
    babelrc: false,
    configFile: false,
    sourceMaps: true,
    inputSourceMap: map,
    plugins: [[stylexPlugin, stylexOptions], runtimeTokens],
  });
  if (result.metadata?.stylex) rules.push(...result.metadata.stylex);
  const out = isTokens ? dest.replace(TOKENS, "tokens.js") : dest;
  const mapName = `${out.split("/").pop()}.map`;
  writeFileSync(out, `${result.code}\n//# sourceMappingURL=${mapName}\n`);
  writeFileSync(`${out}.map`, JSON.stringify(result.map));
  if (isTokens) {
    /* Keep the uncompiled token file for StyleX consumers; its own map is pass 1's. */
    writeFileSync(dest, `${code}\n//# sourceMappingURL=${TOKENS}.map\n`);
    writeFileSync(`${dest}.map`, JSON.stringify(map));
  }
}

/* One stylesheet: Vlak base layers + the compiled leaves. */
const compiled = stylexPlugin.processStylexRules(rules, true);
const read = (f) => readFileSync(join(coreCss, f), "utf8");
const base = [
  ["vlak.tokens", "tokens.css"],
  ["vlak.base", "base.css"],
  ["vlak.type", "type.css"],
];
const tail = [
  ["vlak.touch", "touch.css"],
  ["vlak.motion", "motion.css"],
];
const css =
  `/* @noorddev/vlak-react. Vlak base + compiled StyleX leaves. Generated. */\n` +
  read("fonts.css") +
  `\n@layer vlak.engine, vlak.tokens, vlak.base, vlak.type, vlak.components, vlak.touch, vlak.motion;\n\n` +
  base.map(([name, f]) => `@layer ${name} {\n${read(f)}\n}\n`).join("\n") +
  `@layer vlak.components {\n${compiled}\n}\n` +
  tail.map(([name, f]) => `@layer ${name} {\n${read(f)}\n}\n`).join("\n");
writeFileSync(join(distDir, "vlak-react.css"), css);
writeFileSync(join(distDir, "vlak-react.css.d.ts"), "export {};\n");
writeFileSync(join(distDir, "workflow.css"), workflowStylesheet());
writeFileSync(join(distDir, "workflow.css.d.ts"), "export {};\n");
cpSync(join(coreCss, "fonts"), join(distDir, "fonts"), { recursive: true });

/* Types. tokens.js shares the token file's declarations. */
execFileSync("npx", ["tsc", "-p", "tsconfig.build.json"], { cwd: pkgDir, stdio: "inherit" });
copyFileSync(join(distDir, "tokens.stylex.d.ts"), join(distDir, "tokens.d.ts"));

/* Declarations resolve like the JavaScript does under node16 resolution:
   relative specifiers carry .js, and the token import points at the
   compiled copy the runtime loads. */
for (const file of walk(distDir, /\.d\.ts$/)) {
  const dir = dirname(file);
  const fixed = readFileSync(file, "utf8").replace(/(from\s+|import\()(["'])(\.[^"']+)\2/g, (m, lead, q, spec) => {
    if (/\.(js|json|css)$/.test(spec)) return m;
    const target = spec.endsWith("/tokens.stylex") && !file.endsWith("tokens.stylex.d.ts") ? spec.replace(/tokens\.stylex$/, "tokens") : spec;
    const asFile = existsSync(join(dir, `${target}.d.ts`));
    const asDir = existsSync(join(dir, target, "index.d.ts"));
    if (!asFile && !asDir) return m;
    return `${lead}${q}${asFile ? `${target}.js` : `${target}/index.js`}${q}`;
  });
  writeFileSync(file, fixed);
}
console.log(`built dist: ${rules.length} StyleX rules → vlak-react.css (${css.length} bytes)`);
