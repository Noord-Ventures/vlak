"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../tokens.stylex";
import { rs } from "../rs";
import { Button } from "./button";
import { Input } from "./input";

export interface JSONViewerProps extends React.HTMLAttributes<HTMLDivElement> {
  data: unknown;
  label?: string;
  searchable?: boolean;
  /** Bounds rendering of unusually deep data. */
  maxDepth?: number;
  /** Maximum children shown per object or array. */
  maxEntries?: number;
  /** Total node budget across the inspected document. */
  maxNodes?: number;
  /** Maximum string characters displayed per value, before escaping. */
  maxStringLength?: number;
}
interface DataNode { path: string; name: string; value: string; children?: DataNode[]; omitted?: number | "more" }
function shorten(value: string, limit: number): string { return value.length > limit ? `${value.slice(0, limit)}… [truncated]` : value; }
function describe(value: unknown, maxStringLength: number): string {
  if (typeof value === "string") return JSON.stringify(shorten(value, maxStringLength));
  if (value === null) return "null";
  if (typeof value === "object") return Array.isArray(value) ? `Array (${value.length})` : "Object";
  if (typeof value === "function") return "[Function]";
  return String(value);
}
function inspect(value: unknown, name: string, path: string, depth: number, maxDepth: number, maxEntries: number, maxStringLength: number, parents: Set<object>, budget: { remaining: number }): DataNode {
  budget.remaining--;
  const node: DataNode = { name, path, value: describe(value, maxStringLength) };
  if (value === null || typeof value !== "object") return node;
  if (parents.has(value)) return { ...node, value: "[Circular]" };
  if (depth >= maxDepth) return { ...node, value: `${node.value}, depth limit reached` };
  const next = new Set(parents).add(value);
  node.children = [];
  const add = (key: string) => {
    const childName = shorten(key, Math.min(256, maxStringLength));
    const childPath = shorten(`${path}[${JSON.stringify(childName)}]`, 4096);
    // Inspect descriptors, never invoke accessors as a side effect of displaying data.
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (descriptor && !Object.hasOwn(descriptor, "value")) {
      budget.remaining--;
      node.children!.push({ name: childName, path: childPath, value: descriptor.get ? "[Getter]" : "[Setter]" });
    } else node.children!.push(inspect(descriptor?.value, childName, childPath, depth + 1, maxDepth, maxEntries, maxStringLength, next, budget));
  };
  try {
    if (Array.isArray(value)) {
      for (let index = 0; index < Math.min(value.length, maxEntries) && budget.remaining > 0; index++) add(String(index));
      node.omitted = value.length - node.children.length;
    } else {
      // Stop enumerating once the visible budget is filled. Object.entries would
      // read every property value, including getters, before applying that limit.
      for (const key in value) {
        if (!Object.hasOwn(value, key)) continue;
        if (node.children.length >= maxEntries || budget.remaining <= 0) { node.omitted = "more"; break; }
        add(key);
      }
    }
  } catch {
    node.value = `${node.value}, remaining properties could not be inspected`;
  }
  return node;
}
function matches(node: DataNode, query: string): boolean {
  return `${node.path} ${node.value}`.toLocaleLowerCase().includes(query) || Boolean(node.children?.some(child => matches(child, query)));
}
const styles = stylex.create({
  root: { display: "grid", gap: "1rem", width: "100%", minWidth: 0, color: vlak.ink },
  tools: { display: "flex", flexWrap: "wrap", gap: "0.5rem" },
  body: { padding: "1rem", borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.divider, minWidth: 0, overflowWrap: "anywhere", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: "0.875rem", lineHeight: 1.45 },
  summary: { minHeight: vlak.hit, alignContent: "center", cursor: "pointer", borderRadius: vlak.radiusSm, outlineColor: vlak.ink, outlineOffset: 2 },
  children: { paddingInlineStart: "1rem" },
  value: { minHeight: "2rem", alignContent: "center", margin: 0 },
  note: { color: vlak.gray, fontFamily: "inherit" },
});
function JsonNode({ node, query, expand }: { node: DataNode; query: string; expand: boolean }) {
  const [open, setOpen] = React.useState(expand);
  const summary = rs(["rs-json-viewer-summary"], styles.summary);
  const children = rs(["rs-json-viewer-children"], styles.children);
  const value = rs(["rs-json-viewer-value"], styles.value);
  const note = rs(["rs-json-viewer-note"], styles.note);
  if (query && !matches(node, query)) return null;
  if (!node.children) return <p {...value} title={node.path}><span>{node.name}: </span><span>{node.value}</span></p>;
  return <details open={query ? true : open} onToggle={event => setOpen(event.currentTarget.open)}>
    <summary {...summary} title={node.path}>{node.name}: <span {...note}>{node.value}</span></summary>
    <div {...children}>{node.children.map((child, index) => <JsonNode key={`${index}:${child.path}`} node={child} query={query} expand={expand} />)}{node.omitted ? <p {...note}>{node.omitted === "more" ? "Additional entries not displayed" : `${node.omitted} additional entries not displayed`}</p> : null}</div>
  </details>;
}

/** Bounded JSON inspection using native disclosures and path/value search. */
export const JSONViewer = React.forwardRef<HTMLDivElement, JSONViewerProps>(function JSONViewer({ data, label = "Structured data", searchable = true, maxDepth = 8, maxEntries = 100, maxNodes = 1000, maxStringLength = 2000, className, style, ...props }, ref) {
  const [query, setQuery] = React.useState("");
  const [expansion, setExpansion] = React.useState({ open: true, revision: 0 });
  const tree = React.useMemo(() => inspect(data, "$", "$", 0, Math.max(1, Math.min(20, Number.isFinite(maxDepth) ? Math.floor(maxDepth) : 8)), Math.max(1, Math.min(1000, Number.isFinite(maxEntries) ? Math.floor(maxEntries) : 100)), Math.max(100, Math.min(10000, Number.isFinite(maxStringLength) ? Math.floor(maxStringLength) : 2000)), new Set(), { remaining: Math.max(1, Math.min(10000, Number.isFinite(maxNodes) ? Math.floor(maxNodes) : 1000)) }), [data, maxDepth, maxEntries, maxNodes, maxStringLength]);
  const normalized = query.trim().toLocaleLowerCase();
  const root = rs(["rs-json-viewer", className], styles.root);
  const tools = rs(["rs-json-viewer-tools"], styles.tools);
  const body = rs(["rs-json-viewer-body"], styles.body);
  return <div ref={ref} role="region" aria-label={label} {...props} className={root.className} style={{ ...root.style, ...style }}>
    {searchable && <Input label="Search paths and values" type="search" value={query} onChange={event => setQuery(event.target.value)} />}
    <div {...tools}><Button variant="ghost" onClick={() => setExpansion(previous => ({ open: true, revision: previous.revision + 1 }))}>Expand all</Button><Button variant="ghost" disabled={Boolean(normalized)} onClick={() => setExpansion(previous => ({ open: false, revision: previous.revision + 1 }))}>Collapse all</Button></div>
    <div {...body}>{normalized && !matches(tree, normalized) ? <p role="status">No matching paths or values</p> : <JsonNode key={expansion.revision} node={tree} query={normalized} expand={expansion.open} />}</div>
  </div>;
});
