import { Parser } from "acorn";
import jsx from "acorn-jsx";

type AstNode = { type: string; [key: string]: unknown };
const parser = Parser.extend(jsx());
const blockedKeys = new Set(["__proto__", "prototype", "constructor", "caller", "callee", "arguments"]);
const nativeTags = new Set("a article aside b blockquote br button caption code col colgroup dd del details div dl dt em fieldset figcaption figure footer h1 h2 h3 h4 h5 h6 header hr i input label legend li main mark nav ol optgroup option p pre progress s section select small span strong sub summary sup table tbody td textarea th thead time tr u ul".split(" "));
const allowedNodes = new Set("Program ExpressionStatement JSXFragment JSXOpeningFragment JSXClosingFragment JSXElement JSXOpeningElement JSXClosingElement JSXIdentifier JSXMemberExpression JSXAttribute JSXText JSXExpressionContainer Literal Identifier MemberExpression BinaryExpression LogicalExpression ConditionalExpression ArrayExpression ObjectExpression Property UnaryExpression TemplateLiteral TemplateElement ChainExpression".split(" "));
const voidTags = new Set(["br", "hr", "input", "col"]);

function tagName(node: AstNode): string {
  if (node.type === "JSXIdentifier") return String(node.name);
  if (node.type === "JSXMemberExpression") return `${tagName(node.object as AstNode)}.${tagName(node.property as AstNode)}`;
  throw new Error("Unsupported preview element name.");
}

/** Completes simple open tags while preserving quoted attributes and expression boundaries. */
export function completePreviewJSX(source: string): string {
  const stack: string[] = [];
  let quote = "";
  let expressionDepth = 0;
  let escaped = false;
  let end = source.length;
  for (let index = 0; index < source.length; index++) {
    const char = source[index]!;
    if (quote) { if (escaped) escaped = false; else if (char === "\\") escaped = true; else if (char === quote) quote = ""; continue; }
    if (expressionDepth > 0) { if (["'", '"', "`"].includes(char)) quote = char; else if (char === "{") expressionDepth++; else if (char === "}") expressionDepth--; continue; }
    if (char === "{") { expressionDepth++; continue; }
    if (char !== "<") continue;
    let attributeQuote = "";
    let braces = 0;
    let tagEnd = index + 1;
    for (; tagEnd < source.length; tagEnd++) {
      const value = source[tagEnd]!;
      if (attributeQuote) { if (value === "\\") tagEnd++; else if (value === attributeQuote) attributeQuote = ""; }
      else if (["'", '"', "`"].includes(value)) attributeQuote = value;
      else if (value === "{") braces++;
      else if (value === "}") braces--;
      else if (value === ">" && braces === 0) break;
    }
    if (tagEnd >= source.length) { end = index; break; }
    const tag = source.slice(index, tagEnd + 1);
    const match = tag.match(/^<(\/?)([A-Za-z][\w.-]*|)(?:\s|\/?>)/);
    if (match) {
      const name = match[2]!;
      if (match[1]) { if (stack.at(-1) === name) stack.pop(); }
      else if (!tag.endsWith("/>") && !voidTags.has(name)) stack.push(name);
    }
    index = tagEnd;
  }
  return source.slice(0, end) + [...stack].reverse().map(name => `</${name}>`).join("");
}

/** Validate a data-expression subset before react-jsx-parser can interpret expressions. */
export function validatePreviewJSX(source: string, componentNames: ReadonlySet<string>): void {
  if (source.length > 50000) throw new Error("Preview source exceeds 50,000 characters.");
  const tree = parser.parse(`<>${source}</>`, { ecmaVersion: "latest" }) as unknown as AstNode;
  const queue = [tree];
  let remaining = 3000;
  while (queue.length) {
    if (--remaining < 0) throw new Error("Preview contains too many expressions.");
    const node = queue.pop()!;
    if (!allowedNodes.has(node.type)) throw new Error(`Unsupported preview expression: ${node.type}.`);
    if (node.type === "Identifier" && blockedKeys.has(String(node.name))) throw new Error("Prototype access is not supported in previews.");
    if (node.type === "MemberExpression") {
      const property = node.property as AstNode;
      if (node.computed && property.type !== "Literal") throw new Error("Computed preview properties must use a literal key.");
      if (blockedKeys.has(String(property.type === "Literal" ? property.value : property.name))) throw new Error("Prototype access is not supported in previews.");
    }
    if (node.type === "Property") {
      const key = node.key as AstNode;
      if (node.computed || node.method || node.kind !== "init" || blockedKeys.has(String(key.name ?? key.value))) throw new Error("Unsupported preview object property.");
    }
    if (node.type === "JSXOpeningElement") {
      const name = tagName(node.name as AstNode);
      if (name.split(".").some(part => blockedKeys.has(part))) throw new Error("Unsupported preview component name.");
      if (!nativeTags.has(name) && !componentNames.has(name)) throw new Error(`The element ${name} is not registered for this preview.`);
    }
    if (node.type === "JSXAttribute") {
      const name = String((node.name as AstNode).name);
      if (/^on/i.test(name) || ["dangerouslySetInnerHTML", "srcDoc", "srcdoc", "src", "srcSet", "srcset", "action", "formAction", "formaction", "ref", "is"].includes(name)) throw new Error(`The attribute ${name} is not supported in previews.`);
      if (name === "href") {
        const value = node.value as AstNode | null;
        const text = value?.type === "Literal" ? value.value : undefined;
        if (typeof text !== "string" || !/^(?:https?:\/\/|\/(?!\/)|#)/i.test(text) || [...text].some(character => character.charCodeAt(0) <= 32) || text.includes("\\")) throw new Error("Preview links must use a literal http, https, local or fragment address.");
      }
    }
    for (const value of Object.values(node)) {
      if (value && typeof value === "object" && "type" in value) queue.push(value as AstNode);
      else if (Array.isArray(value)) for (const child of value) if (child && typeof child === "object" && "type" in child) queue.push(child as AstNode);
    }
  }
}

/** Copy plain data without invoking getters or exposing prototype members. */
export function previewBindings(bindings: Record<string, unknown> = {}): Record<string, unknown> {
  let remaining = 3000;
  const copy = (value: unknown, depth: number, parents: Set<object>): unknown => {
    if (--remaining < 0 || depth > 16) throw new Error("Preview bindings exceed the data budget.");
    if (typeof value === "string" && value.length > 100000) throw new Error("Preview bindings contain too much text.");
    if (value === null || ["string", "number", "boolean", "undefined"].includes(typeof value)) return value;
    if (typeof value !== "object") throw new Error("Preview bindings must contain data, not functions.");
    if (parents.has(value)) throw new Error("Preview bindings cannot contain circular data.");
    if (!Array.isArray(value) && ![Object.prototype, null].includes(Object.getPrototypeOf(value))) throw new Error("Preview bindings must contain plain data objects.");
    if (Array.isArray(value) && value.length > 3000) throw new Error("Preview bindings exceed the data budget.");
    const next = new Set(parents).add(value);
    const result: Record<string, unknown> | unknown[] = Array.isArray(value) ? [] : Object.create(null);
    for (const key in value) {
      if (!Object.hasOwn(value, key)) continue;
      const descriptor = Object.getOwnPropertyDescriptor(value, key)!;
      if (blockedKeys.has(key) || !Object.hasOwn(descriptor, "value")) throw new Error("Preview bindings cannot contain accessors or prototype keys.");
      (result as Record<string, unknown>)[key] = copy(descriptor.value, depth + 1, next);
    }
    return result;
  };
  return copy(bindings, 0, new Set()) as Record<string, unknown>;
}
