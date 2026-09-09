// Generates props/props.json from the React sources with the TypeScript
// compiler API: one entry per registry component that has a React file,
// listing the components, hooks, and functions it exports through
// packages/react/src/index.ts, and for each component its own props.
//
//   name         the export, e.g. "Button", "DialogTitle", "toast"
//   kind         component | hook | function
//   extends      the DOM attribute type the props inherit from, e.g.
//                "ButtonHTMLAttributes<HTMLButtonElement>". Inherited
//                attributes are not listed; only props declared in this
//                repository are.
//   ref          the element a forwarded ref resolves to (React.forwardRef's
//                first type argument); absent when no ref is forwarded
//   props[]      name, type (printed by the checker), required, default
//                (from the destructuring default in the signature),
//                description (JSDoc)
//
// Chart entries share components/chart.tsx: an entry that is not the
// owner of a file claims the exports whose name matches its name or a
// word of its title (bar-chart → BarChart, "Donut or share" → Donut,
// Share); the owner keeps the rest.
//
// Run with: npm run build:props  (Node ≥ 22.6)

import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { vlakComponents } from "../src/registry.ts";

const require = createRequire(import.meta.url);
const ts = require("typescript");

const coreDir = fileURLToPath(new URL("..", import.meta.url));
const reactDir = resolve(coreDir, "../react");
const reactSrc = join(reactDir, "src");
const VERSION = JSON.parse(readFileSync(join(coreDir, "package.json"), "utf8")).version;

/* ── Program over the React package ── */
const configPath = join(reactDir, "tsconfig.json");
const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, reactDir);
const rootNames = [
  join(reactSrc, "index.ts"),
  ...vlakComponents.filter((c) => c.react).map((c) => join(reactSrc, c.react)),
];
const program = ts.createProgram({ rootNames, options: parsed.options });
const checker = program.getTypeChecker();

const inRepo = (node) => {
  const file = node.getSourceFile().fileName;
  return file.startsWith(reactSrc) && !file.includes("node_modules");
};

/* ── What index.ts exports, by name ── */
const indexFile = program.getSourceFile(join(reactSrc, "index.ts"));
const indexSymbol = checker.getSymbolAtLocation(indexFile);
const publicNames = new Set(checker.getExportsOfModule(indexSymbol).map((s) => s.name));

/* ── Helpers ── */
const docOf = (symbol) => {
  const text = ts.displayPartsToString(symbol.getDocumentationComment(checker)).trim();
  const deprecated = symbol.getJsDocTags(checker).find((t) => t.name === "deprecated");
  const note = deprecated ? `Deprecated. ${ts.displayPartsToString(deprecated.text ?? []).trim()}`.trim() : "";
  return [text, note].filter(Boolean).join(" ").replace(/\s+/g, " ") || undefined;
};

const resolveAlias = (symbol) => (symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol);

const DOM_TYPE = /^(?:React\.)?((?:[A-Za-z]+HTMLAttributes|HTMLAttributes|SVGAttributes|DOMAttributes|AriaAttributes)\b.*)$/s;
const strip = (text) => text.replace(/\bReact\./g, "").replace(/\s+/g, " ").trim();

/**
 * Walks a props type declaration and collects the DOM attribute types it
 * builds on: heritage clauses of interfaces, members of intersections,
 * the first argument of Omit/Pick/Partial, and references to other local
 * props types (recursively). Returns the printed names.
 */
function domBases(typeNode, seen = new Set()) {
  if (!typeNode) return [];
  const out = [];
  const visit = (node) => {
    if (!node) return;
    if (ts.isIntersectionTypeNode(node)) {
      for (const t of node.types) visit(t);
      return;
    }
    if (ts.isParenthesizedTypeNode(node)) {
      visit(node.type);
      return;
    }
    if (ts.isTypeReferenceNode(node) || ts.isExpressionWithTypeArguments(node)) {
      const text = node.getText();
      const nameNode = ts.isTypeReferenceNode(node) ? node.typeName : node.expression;
      const name = nameNode.getText().replace(/^React\./, "");
      if (["Omit", "Pick", "Partial", "Required"].includes(name) && node.typeArguments?.[0]) {
        const inner = node.typeArguments[0];
        const innerName = inner.getText().replace(/^React\./, "");
        if (DOM_TYPE.test(innerName)) out.push(strip(text));
        else visit(inner);
        return;
      }
      if (DOM_TYPE.test(name) || DOM_TYPE.test(text.replace(/^React\./, ""))) {
        out.push(strip(text));
        return;
      }
      const symbol = checker.getSymbolAtLocation(nameNode);
      const target = symbol && resolveAlias(symbol);
      for (const decl of target?.declarations ?? []) {
        if (!inRepo(decl) || seen.has(decl)) continue;
        seen.add(decl);
        if (ts.isInterfaceDeclaration(decl)) {
          for (const clause of decl.heritageClauses ?? []) for (const t of clause.types) visit(t);
        } else if (ts.isTypeAliasDeclaration(decl)) {
          visit(decl.type);
        }
      }
    }
  };
  visit(typeNode);
  return [...new Set(out)];
}

/** The props type node and the declaration node that carries the parameter, for one export. */
function propsSource(symbol) {
  const decl = symbol.valueDeclaration ?? symbol.declarations?.[0];
  if (!decl) return null;
  if (ts.isFunctionDeclaration(decl)) {
    const param = decl.parameters[0];
    return { fn: decl, param, typeNode: param?.type, type: param ? checker.getTypeAtLocation(param) : null };
  }
  if (ts.isVariableDeclaration(decl) && decl.initializer && ts.isCallExpression(decl.initializer)) {
    const call = decl.initializer;
    const callee = call.expression.getText();
    if (/forwardRef$/.test(callee)) {
      const inner = call.arguments[0];
      const param = inner && (ts.isFunctionExpression(inner) || ts.isArrowFunction(inner)) ? inner.parameters[0] : undefined;
      const typeNode = call.typeArguments?.[1] ?? param?.type;
      const type = typeNode ? checker.getTypeFromTypeNode(typeNode) : param ? checker.getTypeAtLocation(param) : null;
      const ref = call.typeArguments?.[0] ? strip(call.typeArguments[0].getText()) : undefined;
      return { fn: inner, param, typeNode, type, ref };
    }
  }
  return null;
}

/** Destructuring defaults in the first parameter: `size = "md"` → { size: '"md"' }. */
function defaultsOf(param) {
  const out = new Map();
  if (!param || !ts.isObjectBindingPattern(param.name)) return out;
  for (const el of param.name.elements) {
    if (!el.initializer) continue;
    const name = (el.propertyName ?? el.name).getText().replace(/^"|"$/g, "");
    out.set(name, el.initializer.getText().replace(/\s+/g, " "));
  }
  return out;
}

const FLAGS = ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope;

function printType(prop, decl) {
  const declared = decl && (ts.isPropertySignature(decl) || ts.isPropertyDeclaration(decl)) ? decl.type : undefined;
  let text = declared
    ? checker.typeToString(checker.getTypeFromTypeNode(declared), declared, FLAGS)
    : checker.typeToString(checker.getTypeOfSymbolAtLocation(prop, decl ?? indexFile), decl, FLAGS);
  if (/import\(/.test(text) && declared) text = declared.getText();
  return strip(text).replace(/ \| undefined$/, "");
}

function propsOf(type, defaults) {
  const props = [];
  const own = checker
    .getPropertiesOfType(type)
    .map((prop) => ({ prop, decl: (prop.declarations ?? []).find((d) => inRepo(d)) }))
    .filter((p) => p.decl)
    .sort((a, b) => a.decl.getSourceFile().fileName.localeCompare(b.decl.getSourceFile().fileName) || a.decl.pos - b.decl.pos);
  for (const { prop, decl } of own) {
    const entry = {
      name: prop.name,
      type: printType(prop, decl),
      required: !(prop.flags & ts.SymbolFlags.Optional),
    };
    if (defaults.has(prop.name)) entry.default = defaults.get(prop.name);
    const description = docOf(prop);
    if (description) entry.description = description;
    props.push(entry);
  }
  return props;
}

function isComponentLike(symbol, decl) {
  if (!/^[A-Z]/.test(symbol.name)) return false;
  if (ts.isVariableDeclaration(decl) && decl.initializer && ts.isCallExpression(decl.initializer)) {
    return /forwardRef$/.test(decl.initializer.expression.getText());
  }
  return ts.isFunctionDeclaration(decl);
}

function classify(symbol) {
  const target = resolveAlias(symbol);
  const decl = target.valueDeclaration ?? target.declarations?.[0];
  if (!decl || !(target.flags & ts.SymbolFlags.Value)) return null;
  if (isComponentLike(target, decl)) return { kind: "component", target, decl };
  const callable = checker.getTypeOfSymbolAtLocation(target, decl).getCallSignatures().length > 0;
  if (!callable) return null;
  return { kind: /^use[A-Z]/.test(target.name) ? "hook" : "function", target, decl };
}

function exportEntry(symbol) {
  const found = classify(symbol);
  if (!found) return null;
  const { kind, target, decl } = found;
  const entry = { name: symbol.name, kind };
  const description = docOf(target) || (ts.isVariableDeclaration(decl) ? docOf(checker.getSymbolAtLocation(decl.name) ?? target) : undefined);
  if (description) entry.description = description;
  if (kind === "component") {
    const source = propsSource(target);
    if (source?.type) {
      const bases = domBases(source.typeNode);
      if (bases.length) entry.extends = bases.join(" & ");
      if (source.ref) entry.ref = source.ref;
      entry.props = propsOf(source.type, defaultsOf(source.param));
    } else {
      entry.props = [];
    }
  } else {
    entry.props = [];
  }
  return entry;
}

/* ── Which entry owns which export of a shared file ── */
const byFile = new Map();
for (const c of vlakComponents) {
  if (!c.react) continue;
  if (!byFile.has(c.react)) byFile.set(c.react, []);
  byFile.get(c.react).push(c);
}
const squash = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

function claims(component, exportName) {
  const key = squash(exportName);
  if (squash(component.name) === key) return true;
  return component.title.toLowerCase().split(/\s+/).some((w) => w.length > 2 && squash(w) === key);
}

/* ── Build ── */
const components = {};
for (const [file, owners] of byFile) {
  const sourceFile = program.getSourceFile(join(reactSrc, file));
  if (!sourceFile) throw new Error(`${file}: not in the program`);
  const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
  const exported = checker
    .getExportsOfModule(moduleSymbol)
    .filter((s) => publicNames.has(s.name) || owners.some((owner) => owner.reactImport))
    .sort((a, b) => a.name.localeCompare(b.name));
  const entries = exported.map(exportEntry).filter(Boolean);
  const owner = owners[0];
  const taken = new Set();
  for (const c of owners.slice(1)) {
    const mine = entries.filter((e) => claims(c, e.name));
    for (const e of mine) taken.add(e.name);
    components[c.name] = { exports: mine };
  }
  components[owner.name] = { exports: entries.filter((e) => !taken.has(e.name)) };
}

/* Registry order, so the file is stable. */
const ordered = {};
for (const c of vlakComponents) if (components[c.name]) ordered[c.name] = components[c.name];

const outFile = join(coreDir, "props/props.json");
mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, JSON.stringify({ version: VERSION, components: ordered }, null, 2) + "\n");
const count = Object.values(ordered).reduce((n, c) => n + c.exports.length, 0);
console.log(`wrote props/props.json (${Object.keys(ordered).length} components, ${count} exports)`);
