"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../tokens.stylex";
import { rs } from "../rs";
import { Button } from "./button";

export interface CodeBlockProps extends React.HTMLAttributes<HTMLElement> {
  code: string;
  language?: string;
  lineNumbers?: boolean;
  wrap?: boolean;
  copyable?: boolean;
  onCopyCode?: (code: string) => void | Promise<void>;
}
const styles = stylex.create({
  root: { margin: 0, width: "100%", minWidth: 0, borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.divider, color: vlak.ink, backgroundColor: vlak.paper },
  header: { display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", padding: "0.75rem", borderBottomWidth: vlak.hairline, borderBottomStyle: "solid", borderBottomColor: vlak.divider },
  pre: { margin: 0, overflowX: "auto", padding: "1rem", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: "0.875rem", lineHeight: 1.45, tabSize: 2, outlineColor: vlak.ink, outlineOffset: -2 },
  wrap: { whiteSpace: "pre-wrap", overflowWrap: "anywhere" },
  line: { display: "block", minHeight: "1.45em" },
  number: { display: "inline-block", userSelect: "none", color: vlak.gray, minWidth: "3ch", marginInlineEnd: "2ch", textAlign: "end" },
  status: { fontSize: "0.875rem", color: vlak.gray },
});

/** Plain source with optional numbering and honest asynchronous copy feedback. */
export const CodeBlock = React.forwardRef<HTMLElement, CodeBlockProps>(function CodeBlock({ code, language = "Text", lineNumbers = false, wrap = false, copyable = true, onCopyCode, className, style, ...props }, ref) {
  const [copyState, setCopyState] = React.useState<"idle" | "pending" | "done" | "error">("idle");
  const request = React.useRef(0);
  React.useEffect(() => { request.current++; setCopyState("idle"); return () => { request.current++; }; }, [code]);
  const copy = async () => {
    const id = ++request.current;
    setCopyState("pending");
    try { if (onCopyCode) await onCopyCode(code); else await navigator.clipboard.writeText(code); if (id === request.current) setCopyState("done"); }
    catch { if (id === request.current) setCopyState("error"); }
  };
  const root = rs(["rs-code-block", className], styles.root);
  const header = rs(["rs-code-block-header"], styles.header);
  const pre = rs(["rs-code-block-pre", wrap && "rs-code-block-wrap"], styles.pre, wrap && styles.wrap);
  const line = rs(["rs-code-block-line"], styles.line);
  const number = rs(["rs-code-block-number"], styles.number);
  const status = rs(["rs-code-block-status"], styles.status);
  const lines = code.split("\n");
  return <figure ref={ref} {...props} className={root.className} style={{ ...root.style, ...style }}>
    <figcaption {...header}><span>{language}</span>{copyable && <Button variant="ghost" disabled={copyState === "pending"} onClick={copy}>{copyState === "done" ? "Copied" : copyState === "pending" ? "Copying" : "Copy code"}</Button>}<span {...status} role="status">{copyState === "error" ? "Could not copy. Select and copy the code." : copyState === "done" ? "Code copied" : ""}</span></figcaption>
    <pre {...pre} tabIndex={0} aria-label={`${language} source`}><code>{lineNumbers ? lines.map((text, index) => <span key={`${index}:${text}`} {...line}><span {...number} aria-hidden="true">{index + 1}</span>{text}{index < lines.length - 1 ? "\n" : ""}</span>) : code}</code></pre>
  </figure>;
});
