"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../tokens.stylex";
import { rs } from "../rs";
import { Button } from "./button";

export interface DiffLine { kind: "same" | "removed" | "added"; text: string; before?: number; after?: number }
/** Line LCS with bounded memory. Large changes use a truthful coarse replacement. */
export function diffLines(before: string, after: string): DiffLine[] {
  const a = before === "" ? [] : before.split("\n");
  const b = after === "" ? [] : after.split("\n");
  const result: DiffLine[] = [];
  let start = 0;
  while (start < a.length && start < b.length && a[start] === b[start]) { result.push({ kind: "same", text: a[start]!, before: start + 1, after: start + 1 }); start++; }
  let endA = a.length; let endB = b.length;
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) { endA--; endB--; }
  const n = endA - start; const m = endB - start;
  if ((n + 1) * (m + 1) > 1_000_000) {
    for (let i = start; i < endA; i++) result.push({ kind: "removed", text: a[i]!, before: i + 1 });
    for (let j = start; j < endB; j++) result.push({ kind: "added", text: b[j]!, after: j + 1 });
  } else {
    const lcs = new Uint32Array((n + 1) * (m + 1));
    const at = (i: number, j: number) => i * (m + 1) + j;
    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) lcs[at(i, j)] = a[start + i] === b[start + j] ? 1 + lcs[at(i + 1, j + 1)]! : Math.max(lcs[at(i + 1, j)]!, lcs[at(i, j + 1)]!);
    let i = 0; let j = 0;
    while (i < n || j < m) {
      if (i < n && j < m && a[start + i] === b[start + j]) { result.push({ kind: "same", text: a[start + i]!, before: start + i + 1, after: start + j + 1 }); i++; j++; }
      else if (i < n && (j === m || lcs[at(i + 1, j)]! >= lcs[at(i, j + 1)]!)) { result.push({ kind: "removed", text: a[start + i]!, before: start + i + 1 }); i++; }
      else { result.push({ kind: "added", text: b[start + j]!, after: start + j + 1 }); j++; }
    }
  }
  for (let i = endA, j = endB; i < a.length; i++, j++) result.push({ kind: "same", text: a[i]!, before: i + 1, after: j + 1 });
  return result;
}
export interface DiffViewerProps extends React.HTMLAttributes<HTMLDivElement> {
  before: string;
  after: string;
  label?: string;
  view?: "unified" | "split";
  defaultView?: "unified" | "split";
  onViewChange?: (view: "unified" | "split") => void;
  /** Maximum rendered rows per page, clamped to 1–1000. */
  pageSize?: number;
}
const styles = stylex.create({
  root: { width: "100%", minWidth: 0, color: vlak.ink },
  header: { display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", marginBottom: "1rem" },
  tools: { display: "flex", flexWrap: "wrap", gap: "0.5rem" },
  scroll: { overflowX: "auto", borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.divider, outlineColor: vlak.ink, outlineOffset: 2 },
  table: { width: "100%", borderCollapse: "collapse", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: "0.875rem", lineHeight: 1.45, textAlign: "start" },
  cell: { paddingBlock: "0.25rem", paddingInline: "0.75rem", whiteSpace: "pre-wrap", overflowWrap: "anywhere", verticalAlign: "top", textAlign: "start" },
  change: { backgroundColor: vlak.controlFill, fontWeight: 500 },
  number: { color: vlak.gray, width: "3ch", paddingInline: "0.5rem", verticalAlign: "top", fontVariantNumeric: "tabular-nums", textAlign: "end" },
});

/** Monochrome before/after comparison with explicit change labels, never color alone. */
export const DiffViewer = React.forwardRef<HTMLDivElement, DiffViewerProps>(function DiffViewer({ before, after, label = "Changes", view, defaultView = "unified", onViewChange, pageSize = 200, className, style, ...props }, ref) {
  const [inner, setInner] = React.useState(defaultView);
  const current = view ?? inner;
  const lines = React.useMemo(() => diffLines(before, after), [before, after]);
  const limit = Math.max(1, Math.min(1000, Number.isFinite(pageSize) ? Math.floor(pageSize) : 200));
  const [pagination, setPagination] = React.useState({ lines, page: 0 });
  const lastPage = Math.max(0, Math.ceil(lines.length / limit) - 1);
  const page = pagination.lines === lines ? Math.min(pagination.page, lastPage) : 0;
  const start = page * limit;
  const visible = lines.slice(start, start + limit);
  const added = lines.filter(line => line.kind === "added").length;
  const removed = lines.filter(line => line.kind === "removed").length;
  const root = rs(["rs-diff-viewer", className], styles.root);
  const header = rs(["rs-diff-viewer-header"], styles.header);
  const tools = rs(["rs-diff-viewer-tools"], styles.tools);
  const scroll = rs(["rs-diff-viewer-scroll"], styles.scroll);
  const table = rs(["rs-diff-viewer-table"], styles.table);
  const cell = rs(["rs-diff-viewer-cell"], styles.cell);
  const number = rs(["rs-diff-viewer-number"], styles.number);
  const change = rs(["rs-diff-viewer-change"], styles.change);
  return <div ref={ref} {...props} className={root.className} style={{ ...root.style, ...style }}>
    <div {...header}><span>{added} added, {removed} removed</span><div {...tools} role="group" aria-label="Diff layout">{(["unified", "split"] as const).map(mode => <Button key={mode} variant={current === mode ? "primary" : "ghost"} aria-pressed={current === mode} onClick={() => { if (view === undefined) setInner(mode); onViewChange?.(mode); }}>{mode === "unified" ? "Unified" : "Split"}</Button>)}</div></div>
    <div {...scroll} tabIndex={0} role="region" aria-label={label}><table {...table}><caption>{label}</caption><thead><tr><th {...cell} scope="col">Change</th><th {...cell} scope="col">Before</th><th {...cell} scope="col">After</th>{current === "unified" && <th {...cell} scope="col">Content</th>}</tr></thead><tbody>
      {visible.map((line, index) => <tr key={`${start + index}:${line.kind}`} {...(line.kind !== "same" ? change : {})}><th {...cell} scope="row">{line.kind === "same" ? "Unchanged" : line.kind === "added" ? "Added" : "Removed"}</th>{current === "unified" ? <><td {...number}>{line.before ?? ""}</td><td {...number}>{line.after ?? ""}</td><td {...cell}>{line.text || " "}</td></> : <><td {...cell}>{line.kind !== "added" ? line.text || " " : ""}</td><td {...cell}>{line.kind !== "removed" ? line.text || " " : ""}</td></>}</tr>)}
      {!lines.length && <tr><td {...cell} colSpan={current === "unified" ? 4 : 3}>No content to compare</td></tr>}
    </tbody></table></div>
    {lines.length > limit && <nav {...header} aria-label="Diff pages"><p role="status">Lines {start + 1}–{Math.min(start + limit, lines.length)} of {lines.length}</p><div {...tools}><Button variant="ghost" disabled={page === 0} onClick={() => setPagination({ lines, page: page - 1 })}>Previous lines</Button><Button variant="ghost" disabled={page === lastPage} onClick={() => setPagination({ lines, page: page + 1 })}>Next lines</Button></div></nav>}
  </div>;
});
