import assert from "node:assert/strict";
import { createRequire } from "node:module";

// TypeScript is already a declared build dependency of the website.
const ts = createRequire(new URL("../apps/www/package.json", import.meta.url))("typescript");
const resourcePath = value => value.startsWith("/") && !value.startsWith("//")
  && (/^\/(?:interfaces|fonts|docs|images)\//.test(value) || /^\/design\.md(?:[?#].*)?$/.test(value));
const localModule = value => value.startsWith(".") || value.startsWith("@/");
export const packageName = value => value.startsWith("@") ? value.split("/").slice(0, 2).join("/") : value.split("/")[0];

/** Rewrite only syntax nodes, never comments, prose, or lookalike import text. */
export function transformStarterSource({ filename, source, onImport, onAsset, envNames = [] }) {
  if (filename.endsWith(".css")) return transformCss({ source, onImport, onAsset });
  const file = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true);
  assert.equal(file.parseDiagnostics.length, 0, `Cannot parse starter source ${filename}: ${file.parseDiagnostics.map(item => ts.flattenDiagnosticMessageText(item.messageText, " ")).join("; ")}`);
  const edits = [], handled = new Set();
  const replace = (node, text) => edits.push({ start: node.getStart(file), end: node.end, text });
  function moduleNode(node, typeOnly = false) {
    assert(ts.isStringLiteralLike(node), `Dynamic module paths must be literal in ${filename}`);
    handled.add(node);
    const replacement = onImport(node.text, { typeOnly, local: localModule(node.text) });
    if (replacement && replacement !== node.text) replace(node, JSON.stringify(replacement));
  }
  function visit(node) {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      if (node.moduleSpecifier) moduleNode(node.moduleSpecifier, node.isTypeOnly || node.importClause?.isTypeOnly || false);
    } else if (ts.isImportTypeNode(node)) {
      assert(ts.isLiteralTypeNode(node.argument), `Import types must use a literal module in ${filename}`);
      moduleNode(node.argument.literal, true);
    } else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      assert.equal(node.arguments.length, 1, `Dynamic imports must have one literal path in ${filename}`);
      moduleNode(node.arguments[0]);
    } else if (ts.isImportEqualsDeclaration(node) || ts.isCallExpression(node) && node.expression.getText(file) === "require") {
      throw new Error(`CommonJS imports are not supported in a browser starter: ${filename}`);
    } else if (ts.isNewExpression(node) && node.expression.getText(file) === "URL" && node.arguments?.[1]?.getText(file) === "import.meta.url") {
      const path = node.arguments[0];
      assert(ts.isStringLiteralLike(path), `Worker and module asset URLs must be literal in ${filename}`);
      if (localModule(path.text)) moduleNode(path);
    } else if (ts.isPropertyAccessExpression(node) && node.expression.getText(file) === "process.env") {
      throw new Error(`Next/Node environment access must be adapted for Vite: ${filename}: ${node.getText(file)}`);
    } else if (ts.isPropertyAccessExpression(node) && node.expression.getText(file) === "import.meta.env") {
      assert(node.name.text === "BASE_URL" || envNames.includes(node.name.text), `Undeclared starter environment variable ${node.name.text} in ${filename}`);
    }
    if (ts.isStringLiteralLike(node) && !handled.has(node)) {
      if (resourcePath(node.text)) {
        const asset = onAsset(node.text, { kind: "script" });
        const expression = `import.meta.env.BASE_URL + ${JSON.stringify(asset.replace(/^\//, ""))}`;
        replace(node, ts.isJsxAttribute(node.parent) ? `{${expression}}` : `(${expression})`);
      } else if (/url\(\s*["']?\//.test(node.text)) {
        const parts = [], pattern = /url\(\s*(["']?)(\/[^)'"\s]+)\1\s*\)/g;
        let end = 0;
        for (const match of node.text.matchAll(pattern)) {
          if (!resourcePath(match[2])) continue;
          const asset = onAsset(match[2], { kind: "script" });
          parts.push(JSON.stringify(node.text.slice(end, match.index) + "url("), `import.meta.env.BASE_URL`, JSON.stringify(asset.slice(1) + ")"));
          end = match.index + match[0].length;
        }
        if (parts.length) { parts.push(JSON.stringify(node.text.slice(end))); replace(node, `(${parts.join(" + ")})`); }
      }
    } else if (ts.isTemplateExpression(node) && /^\/(?:interfaces|fonts|docs|images)\//.test(node.head.text)) {
      throw new Error(`Computed public asset paths need an explicit portable adapter in ${filename}: ${node.getText(file)}`);
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  let last = source.length;
  for (const edit of edits.sort((a, b) => b.start - a.start)) {
    assert(edit.end <= last, `Overlapping starter transformations in ${filename}`);
    source = source.slice(0, edit.start) + edit.text + source.slice(edit.end);
    last = edit.start;
  }
  return source;
}

function transformCss({ source, onImport, onAsset }) {
  // Keep platform fonts native instead of redistributing the website font files.
  source = source.replace(/@font-face\s*\{[^}]*\}\s*/g, "");
  source = source.replace(/(@import\s+)(["'])([^"']+)\2/g, (_match, prefix, quote, path) => `${prefix}${quote}${onImport(path, { local: localModule(path), typeOnly: false }) ?? path}${quote}`);
  return source.replace(/url\(\s*(["']?)([^)'"\s]+)\1\s*\)/g, (match, _quote, path) => {
    if (/^(?:data:|https?:|#|\/\/)/.test(path)) return match;
    return `url(${JSON.stringify(onAsset(path, { kind: "css" }))})`;
  });
}
