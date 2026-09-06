// Generates css/components/<name>.css from the StyleX leaves in
// packages/react/src. The leaves are the single source of component
// paint; this script projects them onto the semantic rs-* classes so
// vlak.css paints plain HTML with no compiler.
//
// How a leaf key finds its class: every component applies its styles
// through `rs([classes], styles.key, …)`. A key paired with one fixed
// class becomes `.class{…}`; N fixed classes with N styles pair by
// position; N classes with a different count of styles become a
// compound `.a.b{…}`; `cond && styles.key` pairs with the class item
// that shares the same condition; a ternary pairs branch by branch.
// Anything the pairing cannot place is a build error.
//
// Run with: npm run build:components  (Node ≥ 22.6). The leaves are
// executed against a recording stub, so no StyleX compile is needed.

import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { vlakComponents } from "../src/registry.ts";

const require = createRequire(import.meta.url);
const esbuild = require("esbuild");

const coreDir = fileURLToPath(new URL("..", import.meta.url));
const reactSrc = resolve(coreDir, "../react/src");
const outDir = join(coreDir, "css/components");
const mirror = resolve(coreDir, "../react/.build-components");

/* Leaf keys that are applied outside an rs() call. */
const MANUAL = [
  ["charts/frame.tsx", "styles", "lineDashed", ["rs-chart-line-dashed"]],
  ["charts/frame.tsx", "styles", "lineMuted", ["rs-chart-line-muted"]],
  ["charts/frame.tsx", "styles", "lineDotted", ["rs-chart-line-dotted"]],
  ["badge.tsx", "styles", "base", ["rs-badge", "rs-badge-solid", "rs-badge-muted"]],
  ["badge.tsx", "styles", "solid", ["rs-badge-solid"]],
  ["badge.tsx", "styles", "muted", ["rs-badge-muted"]],
  ["badge.tsx", "styles", "outline", ["rs-badge"]],
  ["alert-dialog.tsx", "styles", "lock", ["rs-alert-dialog"]],
  ["command.tsx", "styles", "palette", ["rs-command-dialog"]],
  ["theme-toggle.tsx", "styles", "inline", ["rs-theme-toggle-inline"]],
];
/* Leaf keys that are intentionally unused. */
const IGNORE = new Set(["charts/area.tsx::styles::area", "input-group.tsx::styles::firstAddon"]);

/* ── 1. Transpile the leaves into a mirror, StyleX pointed at a stub ── */
function walk(dir, re, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, re, acc);
    else if (re.test(name)) acc.push(p);
  }
  return acc;
}
const sources = walk(reactSrc, /\.(ts|tsx)$/);
rmSync(mirror, { recursive: true, force: true });
mkdirSync(mirror, { recursive: true });
const stubPath = join(mirror, "__stylex.mjs");
writeFileSync(
  stubPath,
  `const recs = [];
globalThis.__vlakLeaves = recs;
function caller() {
  for (const l of new Error().stack.split("\\n").slice(1)) {
    const m = l.match(/\\((file:[^)]+):\\d+:\\d+\\)|at (file:[^ ]+):\\d+:\\d+/);
    const f = m && (m[1] || m[2]);
    if (f && !f.includes("__stylex")) return f;
  }
  return "?";
}
export function create(obj) { recs.push({ kind: "create", file: caller(), obj }); return obj; }
export function keyframes(obj) { const name = "kf" + recs.length; recs.push({ kind: "keyframes", file: caller(), obj, name }); return name; }
export function defineVars(obj) { return obj; }
export function defineConsts(obj) { return obj; }
export function props() { return {}; }
export function attrs() { return {}; }
export function defaultMarker() { return "__marker"; }
export const when = new Proxy({}, { get: (_, kind) => (sel) => "__" + String(kind) + sel });
export default { create, keyframes, defineVars, defineConsts, props, attrs, defaultMarker, when };
`,
);
function rewriteImports(code, fileAbs) {
  return code.replace(/from\s+["']([^"']+)["']/g, (m, spec) => {
    if (spec === "@stylexjs/stylex") return `from "${pathToFileURL(stubPath).href}"`;
    if (!spec.startsWith(".")) return m;
    const base = resolve(dirname(fileAbs), spec);
    const target = [base + ".tsx", base + ".ts", join(base, "index.ts"), join(base, "index.tsx")].find((c) => existsSync(c));
    if (!target) return m;
    const rel = relative(dirname(fileAbs), target).replace(/\\/g, "/").replace(/\.(tsx|ts)$/, ".js");
    return `from "${rel.startsWith(".") ? rel : `./${rel}`}"`;
  });
}
for (const src of sources) {
  const out = esbuild.transformSync(readFileSync(src, "utf8"), {
    loader: src.endsWith(".tsx") ? "tsx" : "ts",
    format: "esm",
    jsx: "automatic",
    target: "es2022",
  }).code;
  const dest = join(mirror, relative(reactSrc, src)).replace(/\.(tsx|ts)$/, ".js");
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, rewriteImports(out, src));
}

/* ── 2. Execute every module so each stylex.create() is recorded ── */
globalThis.document = undefined;
for (const f of walk(mirror, /\.js$/)) {
  if (f.includes("__stylex")) continue;
  await import(pathToFileURL(f).href);
}
const srcOf = (fileUrl) => {
  const base = join(reactSrc, relative(mirror, decodeURIComponent(fileUrl.replace(/^file:\/\//, "")))).replace(/\.js$/, "");
  return existsSync(`${base}.tsx`) ? `${base}.tsx` : `${base}.ts`;
};
const recs = globalThis.__vlakLeaves.map((r) => ({ ...r, src: srcOf(r.file) }));
rmSync(mirror, { recursive: true, force: true });

/* ── 3. Name every table and keyframes by its const ── */
const toKebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/_/g, "-").toLowerCase();
const tables = new Map(); // `${src}::${name}` -> obj
const exported = new Map(); // exported const name -> { src, name }
const kfByFile = new Map();
const perFile = new Map();
for (const r of recs) {
  const list = perFile.get(r.src) ?? { creates: [], kfs: [] };
  (r.kind === "create" ? list.creates : list.kfs).push(r);
  perFile.set(r.src, list);
}
for (const [src, { creates, kfs }] of perFile) {
  const code = readFileSync(src, "utf8");
  const names = [...code.matchAll(/(?:export\s+)?const\s+([A-Za-z_$][\w$]*)\s*=\s*stylex\.create\(/g)];
  creates.forEach((r, i) => {
    const name = names[i]?.[1] ?? `__anon${i}`;
    tables.set(`${src}::${name}`, r.obj);
    if (names[i]?.[0].startsWith("export")) exported.set(name, { src, name });
  });
  for (const m of code.matchAll(/export\s+const\s+([A-Za-z_$][\w$]*)\s*=\s*([A-Za-z_$][\w$]*);/g)) {
    if (tables.has(`${src}::${m[2]}`)) exported.set(m[1], { src, name: m[2] });
  }
  const kfNames = [...code.matchAll(/const\s+([A-Za-z_$][\w$]*)\s*=\s*stylex\.keyframes\(/g)].map((m) => m[1]);
  kfs.forEach((r, i) => {
    r.constName = kfNames[i];
    r.cssName = `rs-anim-${toKebab(kfNames[i] ?? r.name)}`;
  });
  kfByFile.set(src, kfs);
}

/* ── 4. Pair leaf keys with the classes they are applied to ── */
function scanBalanced(code, start) {
  let depth = 0;
  let q = null;
  for (let i = start; i < code.length; i++) {
    const c = code[i];
    if (q) {
      if (c === "\\") i++;
      else if (c === q) q = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") q = c;
    else if ("([{".includes(c)) depth++;
    else if (")]}".includes(c) && --depth === 0) return i;
  }
  return -1;
}
function splitTop(s) {
  const out = [];
  let depth = 0;
  let q = null;
  let cur = "";
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) {
      cur += c;
      if (c === "\\") cur += s[++i];
      else if (c === q) q = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") q = c;
    else if ("([{".includes(c)) depth++;
    else if (")]}".includes(c)) depth--;
    else if (c === "," && depth === 0) {
      out.push(cur.trim());
      cur = "";
      continue;
    }
    cur += c;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}
const norm = (s) => s.replace(/\s+/g, " ").trim();
const lit = (s) => s.match(/^["'`]([^"'`]*)["'`]$/)?.[1] ?? null;
function classifyClass(item) {
  const l = lit(item);
  if (l !== null) return { kind: "fixed", cls: l };
  let m = item.match(/^(.+?)\s*&&\s*(["'`][^"'`]*["'`])$/);
  if (m) return { kind: "cond", cond: norm(m[1]), cls: lit(m[2]) };
  m = item.match(/^(.+?)\s*\?\s*(["'`][^"'`]*["'`])\s*:\s*(["'`][^"'`]*["'`])$/);
  if (m) return { kind: "tern", cond: norm(m[1]), a: lit(m[2]), b: lit(m[3]) };
  return { kind: "other" };
}
const REF = "[A-Za-z_$][\\w$]*\\.[A-Za-z_$][\\w$]*";
function classifyStyle(item) {
  if (item.startsWith("...")) return { kind: "spread" };
  if (/stylex\.defaultMarker\(\)/.test(item)) return { kind: "marker" };
  let m = item.match(new RegExp(`^(${REF})$`));
  if (m) return { kind: "fixed", ref: m[1].split(".") };
  m = item.match(new RegExp(`^(.+?)\\s*&&\\s*(${REF})$`));
  if (m) return { kind: "cond", cond: norm(m[1]), ref: m[2].split(".") };
  m = item.match(new RegExp(`^(.+?)\\s*\\?\\s*(${REF})\\s*:\\s*(${REF})$`));
  if (m) return { kind: "tern", cond: norm(m[1]), a: m[2].split("."), b: m[3].split(".") };
  m = item.match(new RegExp(`^(.+?)\\s*\\?\\s*(${REF})\\s*:\\s*(null|undefined|false)$`));
  if (m) return { kind: "cond", cond: norm(m[1]), ref: m[2].split(".") };
  return { kind: "other", text: item };
}

const byReact = new Map(vlakComponents.filter((c) => c.react).map((c) => [join(reactSrc, c.react), c]));
function componentFor(src) {
  if (byReact.has(src)) return byReact.get(src);
  const rel = relative(reactSrc, src);
  if (rel.startsWith("components/charts/")) return vlakComponents.find((c) => c.name === "chart");
  return null;
}
/* Class ownership: the component whose name is the class stem wins; otherwise the first declarer. */
const ownedBy = new Map();
for (const c of vlakComponents) {
  for (const cls of c.classes) {
    const natural = cls === `rs-${c.name}` || cls.startsWith(`rs-${c.name}-`);
    if (!ownedBy.has(cls) || natural) ownedBy.set(cls, c.name);
  }
}
const exportedTables = new Set([...exported.keys()]);
const selectors = new Map(); // `${src}::${name}::${key}` -> Set(class)
const markerByFile = new Map();
const problems = [];
function resolveTable(src, name) {
  if (tables.has(`${src}::${name}`)) return { src, name };
  return exported.get(name) ?? null;
}
function addSel(src, ref, cls, where = "") {
  const t = resolveTable(src, ref[0]);
  if (!t) return;
  // A private leaf may only land on a class its own component owns; a foreign
  // class needs a compound with an own class, or the paint leaks to every instance.
  if (!exportedTables.has(t.name)) {
    const comp = componentFor(t.src);
    const parts = cls.split(".");
    const owners = parts.map((p) => ownedBy.get(p));
    const hasLeaf = (name) => {
      const e = vlakComponents.find((x) => x.name === name);
      return Boolean(e?.react && perFile.has(join(reactSrc, e.react)));
    };
    if (comp && owners.some((o) => o && o !== comp.name && hasLeaf(o)) && !owners.some((o) => o === comp.name || !o)) {
      problems.push(`${where}: ${ref.join(".")} lands on .${cls}, owned by ${owners.find((o) => o && o !== comp.name)}; add an own class`);
    }
  }
  const k = `${t.src}::${t.name}::${ref[1]}`;
  if (!selectors.has(k)) selectors.set(k, new Set());
  selectors.get(k).add(cls);
}
const manualFor = (src, ref) => MANUAL.find(([f, n, k]) => src.endsWith(`/${f}`) && n === ref[0] && k === ref[1]);

for (const src of sources) {
  const code = readFileSync(src, "utf8");
  const re = /(?<![\w$])rs\(/g;
  for (const m of code.matchAll(re)) {
    if (code[m.index - 1] === "." && code.slice(m.index - 3, m.index) !== "...") continue;
    const open = m.index + m[0].length - 1;
    const close = scanBalanced(code, open);
    if (close < 0) continue;
    const args = splitTop(code.slice(open + 1, close));
    if (!args.length || !args[0].startsWith("[")) continue;
    const classItems = splitTop(args[0].slice(1, -1)).map(classifyClass);
    const styleItems = args.slice(1).map(classifyStyle);
    const fixedClasses = classItems.filter((c) => c.kind === "fixed").flatMap((c) => c.cls.split(/\s+/));
    const fixedStyles = styleItems.filter((s) => s.kind === "fixed" && s.ref[0] !== "hidden");
    const positional = fixedClasses.length >= 2 && fixedClasses.length === fixedStyles.length;
    const compound = fixedClasses.length >= 2 && !positional ? fixedClasses.join(".") : null;
    const fixedClass = compound ?? fixedClasses[0] ?? null;
    let fixedIdx = 0;
    const condSeen = {};
    const where = `${relative(reactSrc, src)}:${code.slice(0, m.index).split("\n").length}`;
    for (const s of styleItems) {
      if (s.kind === "spread" || s.kind === "other") continue;
      if (s.kind === "marker") {
        if (fixedClass) markerByFile.set(src, fixedClass);
        continue;
      }
      const refs = s.kind === "tern" ? [s.a, s.b] : [s.ref];
      if (refs.every((r) => manualFor(src, r))) {
        for (const r of refs) for (const c of manualFor(src, r)[3]) addSel(src, r, c);
        continue;
      }
      if (s.kind === "fixed") {
        if (s.ref[0] === "hidden") continue;
        const tern = classItems.find((c) => c.kind === "tern");
        if (!fixedClass && tern) {
          addSel(src, s.ref, tern.a, where);
          addSel(src, s.ref, tern.b, where);
          continue;
        }
        const cls = positional ? fixedClasses[fixedIdx++] : fixedClass;
        if (!cls) problems.push(`${where}: ${s.ref.join(".")} has no class to land on`);
        else addSel(src, s.ref, cls, where);
      } else if (s.kind === "cond") {
        condSeen[s.cond] = (condSeen[s.cond] ?? 0) + 1;
        const seen = condSeen[s.cond];
        const partner = classItems.filter((c) => c.kind === "cond" && c.cond === s.cond)[seen - 1] ?? classItems.find((c) => c.kind === "cond" && c.cond === s.cond);
        if (!partner) problems.push(`${where}: ${s.ref.join(".")} is conditional on "${s.cond}" but no class shares that condition`);
        else addSel(src, s.ref, partner.cls, where);
      } else if (s.kind === "tern") {
        const partner = classItems.find((c) => c.kind === "tern" && c.cond === s.cond);
        if (!partner) problems.push(`${where}: ${s.a.join(".")} / ${s.b.join(".")} ternary has no class ternary with the same condition`);
        else {
          addSel(src, s.a, partner.a, where);
          addSel(src, s.b, partner.b, where);
        }
      }
    }
  }
}
for (const [file, name, key, classes] of MANUAL) {
  for (const [k] of tables) if (k.endsWith(`/${file}::${name}`)) selectors.set(`${k}::${key}`, new Set(classes));
}

/* ── 5. Emit CSS ── */
const UNITLESS = new Set([
  "lineHeight", "fontWeight", "opacity", "zIndex", "flex", "flexGrow", "flexShrink", "order", "gridColumn", "gridRow",
  "gridColumnStart", "gridColumnEnd", "gridRowStart", "gridRowEnd", "columnCount", "aspectRatio", "tabSize",
  "animationIterationCount", "strokeWidth", "fillOpacity", "strokeOpacity", "WebkitLineClamp", "scale", "zoom",
  "fontSizeAdjust", "columns", "orphans", "widows", "strokeMiterlimit", "strokeDashoffset",
]);
const prop = (k) => (k.startsWith("Webkit") || k.startsWith("Moz") ? `-${toKebab(k)}` : toKebab(k));
const val = (k, v) => (typeof v === "number" ? (UNITLESS.has(k) || v === 0 ? String(v) : `${v}px`) : String(v));
function flatten(k, v, conds = [], out = []) {
  if (v === null || v === undefined) return out;
  if (Array.isArray(v)) {
    out.push({ conds, values: v.map((x) => val(k, x)) });
    return out;
  }
  if (typeof v === "object") {
    for (const [ck, cv] of Object.entries(v)) flatten(k, cv, ck === "default" ? conds : [...conds, ck], out);
    return out;
  }
  out.push({ conds, values: [val(k, v)] });
  return out;
}
function selectorFor(cls, conds, src) {
  const media = [];
  let pseudo = "";
  let ancestor = "";
  for (const c of conds) {
    if (c.startsWith("@")) media.push(c.replace(/^@media\s*/, "").trim());
    else if (c.startsWith("__ancestor")) ancestor = c.slice("__ancestor".length);
    else pseudo += c;
  }
  const sel = ancestor ? `.${markerByFile.get(src) ?? "rs-marker"}${ancestor} .${cls}` : `.${cls}${pseudo}`;
  return { sel, media };
}
const cssByComponent = new Map();
for (const [key, obj] of tables) {
  const [src, name] = key.split("::");
  const comp = componentFor(src);
  if (!comp) continue;
  let css = cssByComponent.get(comp.name) ?? `/* ── ${comp.name}: generated from packages/react/src/${relative(reactSrc, src)} ── */\n`;
  if (!cssByComponent.has(comp.name)) cssByComponent.set(comp.name, css);
  const kfs = kfByFile.get(src) ?? [];
  for (const kf of kfs) {
    if (css.includes(`@keyframes ${kf.cssName}`)) continue;
    css += `@keyframes ${kf.cssName}{${Object.entries(kf.obj)
      .map(([stop, decl]) => `${stop}{${Object.entries(decl).map(([p, v]) => `${prop(p)}:${val(p, v)}`).join(";")}}`)
      .join("")}}\n`;
  }
  for (const [styleKey, decls] of Object.entries(obj)) {
    const sels = selectors.get(`${src}::${name}::${styleKey}`);
    const id = `${relative(reactSrc, src).replace(/^components\//, "")}::${name}::${styleKey}`;
    if (!sels || sels.size === 0) {
      if (!IGNORE.has(id)) problems.push(`${id}: leaf key is never applied through rs()`);
      continue;
    }
    const flat = [];
    for (const [p, v] of Object.entries(decls)) {
      if ((p.startsWith(":") || p.startsWith("@") || p.startsWith("__")) && v && typeof v === "object") {
        for (const [np, nv] of Object.entries(v)) for (const f of flatten(np, nv, [p])) flat.push([np, f]);
      } else for (const f of flatten(p, v)) flat.push([p, f]);
    }
    const groups = new Map();
    for (const [p, f] of flat) {
      const parts = [...sels].map((cls) => selectorFor(cls, f.conds, src));
      const gk = `${parts[0].media.join(" and ")}|${parts.map((x) => x.sel).join(",")}`;
      const arr = groups.get(gk) ?? [];
      for (const value of f.values) {
        let vv = value;
        for (const kf of kfs) if (vv.includes(kf.name)) vv = vv.replace(kf.name, kf.cssName);
        arr.push(`${prop(p)}:${vv}`);
      }
      groups.set(gk, arr);
    }
    for (const [k, arr] of groups) if (k.startsWith("|")) css += `${k.slice(1)}{${arr.join(";")}}\n`;
    const byMedia = new Map();
    for (const [k, arr] of groups) {
      if (k.startsWith("|")) continue;
      const [mq, sel] = k.split("|");
      const a = byMedia.get(mq) ?? [];
      a.push(`${sel}{${arr.join(";")}}`);
      byMedia.set(mq, a);
    }
    for (const [mq, rules] of byMedia) css += `@media ${mq}{${rules.join("")}}\n`;
  }
  cssByComponent.set(comp.name, css);
}

/* Structural rules for root classes that carry no paint of their own. */
const STRUCTURAL = {
  collapsible: ".rs-disclosure{display:block}\n",
  "input-group": ".rs-input-group-end .rs-input-addon{border-inline-start-width:1px;border-inline-end-width:0}\n",
};
for (const [name, rule] of Object.entries(STRUCTURAL)) cssByComponent.set(name, (cssByComponent.get(name) ?? "") + rule);

if (problems.length) {
  console.error(`build-components: ${problems.length} problem(s)\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
for (const [name, css] of cssByComponent) writeFileSync(join(outDir, `${name}.css`), css);
console.log(`wrote css/components/*.css (${cssByComponent.size} files from ${tables.size} leaves)`);
