/**
 * Vlak registry schema: the typed contract every component entry
 * satisfies. The registry drives everything downstream: the docs site,
 * the CLI, the generated registry JSON, and the integrity tests.
 */

export const vlakCategories = [
  "actions",
  "forms",
  "navigation",
  "feedback",
  "surfaces",
  "content",
  "icons",
  "charts",
  "patterns",
  "ios",
  "android",
  "ai",
  "health",
  "civic",
  "science",
  "creative",
  "engineering",
  "geospatial",
  "robotics",
  "electronics",
  "microbiology",
] as const;

export type VlakCategory = (typeof vlakCategories)[number];

export interface VlakComponent {
  /** Kebab-case identifier, unique across the registry. */
  name: string;
  /** Sentence-case display name. */
  title: string;
  description: string;
  category: VlakCategory;
  /** Every CSS class this component introduces (canonical rs- names). */
  classes: string[];
  /** CSS source files, relative to packages/core/css/. Empty when StyleX owns the leaf. */
  css: string[];
  /** React source file, relative to packages/react/src/. Absent for CSS-only entries. */
  react?: string;
  /** Optional renderer entry point. Omitted for components available from the root React package. */
  reactImport?: string;
  /** Additional npm packages required by this optional renderer or adapter. */
  dependencies?: string[];
  /** Additional stylesheets required by an optional rendering engine. */
  styles?: string[];
  /** Other registry components this one's snippet or styles rely on. */
  registryDependencies?: string[];
  /** Minimal HTML snippet in the house style. */
  snippet: string;
  /** Omit from the public catalog, docs rail, and home kit count. Keep CSS, Nest, and math. */
  hidden?: boolean;
  /** React usage example: imports from "@noorddev/vlak-react" plus the JSX. Shown on the docs page, by the CLI, and to agents. */
  example?: string;
  /** When to reach for it, and when not to. One short sentence per item. */
  usage?: { use: string[]; avoid: string[] };
  /** Keyboard interactions, in the order a user meets them. */
  keyboard?: { keys: string; does: string }[];
  /** Accessibility notes: roles, names, focus, what the platform provides. */
  a11y?: string[];
  /** Names other systems use for the same thing (shadcn/ui, Radix, Material), for search and agents. */
  aliases?: string[];
}

/** One prop of an exported React component, extracted from its types. */
export interface VlakProp {
  name: string;
  type: string;
  required: boolean;
  default?: string;
  description?: string;
}

/** One exported React symbol of a registry component. */
export interface VlakExport {
  name: string;
  kind: "component" | "hook" | "function" | "type";
  description?: string;
  /** Native element or attribute set the props extend, e.g. "ButtonHTMLAttributes<HTMLButtonElement>". */
  extends?: string;
  /** Element a forwarded ref resolves to, e.g. "HTMLButtonElement". Absent when the component forwards no ref. */
  ref?: string;
  props: VlakProp[];
}

/** Shape of packages/core/props/props.json, generated from the React sources. */
export interface VlakPropsJson {
  version: string;
  components: Record<string, { exports: VlakExport[] }>;
}

const KEBAB = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

/**
 * Structural validation of a registry. Returns a list of problems;
 * an empty list means the registry is well-formed. File-existence and
 * CSS-parity checks live in the core test suite, which can touch disk.
 */
export function validateRegistry(components: readonly VlakComponent[]): string[] {
  const problems: string[] = [];
  const names = new Set<string>();

  for (const c of components) {
    if (!KEBAB.test(c.name)) problems.push(`${c.name}: name is not kebab-case`);
    if (names.has(c.name)) problems.push(`${c.name}: duplicate name`);
    names.add(c.name);
    if (!c.title) problems.push(`${c.name}: missing title`);
    const sentenceTitle = c.title.replace(/^iOS(?= )/, "Ios");
    if (sentenceTitle !== sentenceTitle.charAt(0).toUpperCase() + sentenceTitle.slice(1) || /[A-Z]{2,}/.test(sentenceTitle))
      problems.push(`${c.name}: title must be sentence case`);
    if (!c.description) problems.push(`${c.name}: missing description`);
    if (!(vlakCategories as readonly string[]).includes(c.category))
      problems.push(`${c.name}: unknown category "${c.category}"`);
    if (c.classes.length === 0) problems.push(`${c.name}: no classes listed`);
    if (c.css.length === 0 && !c.react) problems.push(`${c.name}: no css files listed`);
    if (!c.snippet.trim()) problems.push(`${c.name}: empty snippet`);
  }

  for (const c of components) {
    for (const dep of c.registryDependencies ?? []) {
      if (!names.has(dep)) problems.push(`${c.name}: unknown registry dependency "${dep}"`);
    }
  }

  return problems;
}
