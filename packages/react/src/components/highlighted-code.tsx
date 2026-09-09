"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import type { Highlighter, ThemedToken, ThemeRegistration } from "shiki";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { Button } from "./button";

export interface HighlightedCodeProps extends React.HTMLAttributes<HTMLElement> {
  code: string;
  language?: string;
  /** Keep an unfinished source block readable without repeatedly highlighting it. */
  streaming?: boolean;
  lineNumbers?: boolean;
  /** Maximum scrollable source height in pixels. */
  maxHeight?: number;
  copyable?: boolean;
  downloadable?: boolean;
  filename?: string;
  onCopyCode?: (code: string) => void | Promise<void>;
}

const theme: ThemeRegistration = {
  name: "vlak-monochrome", type: "light",
  colors: { "editor.foreground": "#111111", "editor.background": "#ffffff" },
  tokenColors: [
    { scope: ["comment", "punctuation.definition.comment"], settings: { foreground: "#555555", fontStyle: "italic" } },
    { scope: ["keyword", "storage", "entity.name.tag"], settings: { foreground: "#111111", fontStyle: "bold" } },
  ],
};
let highlighter: Promise<Highlighter> | undefined;
const cache = new Map<string, ThemedToken[][]>();
const MAX_CACHE_ENTRIES = 24;
const MAX_SOURCE_LENGTH = 100_000;

async function highlight(code: string, language: string): Promise<ThemedToken[][] | null> {
  if (code.length > MAX_SOURCE_LENGTH) return null;
  const key = JSON.stringify([language, code]);
  const found = cache.get(key);
  if (found) { cache.delete(key); cache.set(key, found); return found; }
  const shiki = await import("shiki");
  if (!Object.hasOwn(shiki.bundledLanguages, language)) return null;
  if (!highlighter) highlighter = shiki.createHighlighter({ langs: [], themes: [theme] }).catch((error) => { highlighter = undefined; throw error; });
  const renderer = await highlighter;
  const grammar = shiki.bundledLanguages[language as keyof typeof shiki.bundledLanguages];
  if (!renderer.getLoadedLanguages().includes(language)) await renderer.loadLanguage(grammar);
  const tokens = renderer.codeToTokens(code, { lang: language as keyof typeof shiki.bundledLanguages, theme: "vlak-monochrome" }).tokens;
  // Never allow a highlighter result to change the supplied source.
  if (tokens.map((line) => line.map((token) => token.content).join("")).join("\n") !== code.replace(/\r\n/g, "\n")) return null;
  cache.set(key, tokens);
  while (cache.size > MAX_CACHE_ENTRIES) cache.delete(cache.keys().next().value!);
  return tokens;
}

const styles = stylex.create({
  root: { margin: "1rem 0", width: "100%", minWidth: 0, overflow: "hidden", borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.divider, borderRadius: vlak.radiusSm, color: vlak.ink, backgroundColor: vlak.paper },
  header: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem", padding: "0.25rem 0.75rem", minHeight: 44, borderBottomWidth: vlak.hairline, borderBottomStyle: "solid", borderBottomColor: vlak.divider },
  language: { flex: "1 1 auto", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: "0.8125rem", color: vlak.gray },
  actions: { display: "flex", alignItems: "center", gap: "0.125rem" },
  action: { width: 44, minWidth: 44, maxWidth: 44, height: 44, padding: 0, flexShrink: 0 },
  icon: { width: 16, height: 16, display: "block" },
  pre: { margin: 0, overflow: "auto", padding: "1rem", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: "0.875rem", lineHeight: 1.45, tabSize: 2, whiteSpace: "pre", outlineWidth: { default: 0, ":focus-visible": 2 }, outlineStyle: "solid", outlineColor: vlak.ink, outlineOffset: -2 },
  line: { display: "block", minHeight: "1.45em" },
  number: { display: "inline-block", minWidth: "3ch", marginInlineEnd: "2ch", textAlign: "end", userSelect: "none", color: vlak.gray },
  token: { color: vlak.ink },
  muted: { color: { default: vlak.gray, [mq.forcedColors]: "CanvasText" } },
  bold: { fontWeight: 600 },
  italic: { fontStyle: "italic" },
  status: { margin: 0, padding: "0 0.75rem 0.5rem", fontSize: "0.8125rem", color: vlak.gray },
});

/** Optional Shiki renderer with lazy grammars, monochrome tokens, and exact-source copy. */
export const HighlightedCode = React.forwardRef<HTMLElement, HighlightedCodeProps>(function HighlightedCode({
  code, language = "text", streaming = false, lineNumbers = false, maxHeight = 400,
  copyable = true, downloadable = true, filename = "code.txt", onCopyCode, className, style, ...props
}, ref) {
  const normalizedLanguage = language.trim().toLowerCase() || "text";
  const [highlighted, setHighlighted] = React.useState<{ code: string; language: string; tokens: ThemedToken[][] } | null>(null);
  const [copyState, setCopyState] = React.useState<"idle" | "pending" | "done" | "error">("idle");
  const version = React.useRef(0);
  React.useEffect(() => {
    let cancelled = false;
    if (!streaming) void highlight(code, normalizedLanguage).then((tokens) => {
      if (!cancelled && tokens) setHighlighted({ code, language: normalizedLanguage, tokens });
    }).catch(() => { /* Plain source remains available if a grammar cannot load. */ });
    return () => { cancelled = true; };
  }, [code, normalizedLanguage, streaming]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: A new source invalidates pending clipboard feedback.
  React.useEffect(() => { version.current++; setCopyState("idle"); return () => { version.current++; }; }, [code]);
  const copy = async () => {
    if (copyState === "pending") return;
    const request = ++version.current;
    setCopyState("pending");
    try {
      if (onCopyCode) await onCopyCode(code); else await navigator.clipboard.writeText(code);
      if (request === version.current) setCopyState("done");
    } catch { if (request === version.current) setCopyState("error"); }
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([code], { type: "text/plain;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = filename; anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };
  const root = rs(["rs-highlighted-code", className], styles.root);
  const header = rs(["rs-highlighted-code-header"], styles.header);
  const languageStyle = rs(["rs-highlighted-code-language"], styles.language);
  const actions = rs(["rs-highlighted-code-actions"], styles.actions);
  const action = rs(["rs-highlighted-code-action"], styles.action);
  const icon = rs(["rs-highlighted-code-icon"], styles.icon);
  const pre = rs(["rs-highlighted-code-pre"], styles.pre);
  const lineStyle = rs(["rs-highlighted-code-line"], styles.line);
  const number = rs(["rs-highlighted-code-number"], styles.number);
  const status = rs(["rs-highlighted-code-status"], styles.status);
  const tokens = !streaming && highlighted?.code === code && highlighted.language === normalizedLanguage ? highlighted.tokens : null;
  const lines = tokens ?? code.split("\n").map((content) => [{ content, fontStyle: 0, color: "#111111" }]);
  return <figure {...props} ref={ref} className={root.className} style={{ ...root.style, ...style }} data-highlighted={Boolean(tokens)}>
    <figcaption {...header}><span {...languageStyle}>{normalizedLanguage}</span><span {...actions}>
      {copyable && <Button {...action} variant="subtle" aria-label="Copy code" title="Copy code" disabled={copyState === "pending"} onClick={() => void copy()}><svg {...icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V4H4v12h4" /></svg></Button>}
      {downloadable && <Button {...action} variant="subtle" aria-label="Download code" title="Download code" onClick={download}><svg {...icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" /></svg></Button>}
    </span></figcaption>
    <pre {...pre} style={{ ...pre.style, maxHeight: Number.isFinite(maxHeight) ? Math.max(44, maxHeight) : 400 }} tabIndex={0} role="group" aria-label={`${normalizedLanguage} source`} dir="ltr"><code>{lines.map((line, index) => <span {...lineStyle} key={index}>
      {lineNumbers && <span {...number} aria-hidden="true">{index + 1}</span>}
      {line.map((token, tokenIndex) => {
        const fontStyle = token.fontStyle ?? 0;
        const muted = token.color?.toLowerCase() === "#555555";
        const sx = rs(["rs-highlighted-code-token", muted && "rs-highlighted-code-muted", Boolean(fontStyle & 2) && "rs-highlighted-code-bold", Boolean(fontStyle & 1) && "rs-highlighted-code-italic"], styles.token, muted && styles.muted, Boolean(fontStyle & 2) && styles.bold, Boolean(fontStyle & 1) && styles.italic);
        return <span {...sx} key={tokenIndex}>{token.content}</span>;
      })}{index < lines.length - 1 ? "\n" : ""}
    </span>)}</code></pre>
    <p {...status} role="status">{copyState === "done" ? "Code copied" : copyState === "error" ? "Could not copy. Select and copy the source." : ""}</p>
  </figure>;
});
