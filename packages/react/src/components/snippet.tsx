"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { Button } from "./button";
import { Icon } from "./icon";

export interface SnippetCopyProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "onCopy"> {
  value: string;
  label?: string;
  onCopy?: (value: string) => void | Promise<void>;
}
export interface SnippetProps extends Omit<React.HTMLAttributes<HTMLElement>, "onCopy" | "prefix"> {
  code: string;
  prefix?: React.ReactNode;
  label?: string;
  copyLabel?: string;
  copyable?: boolean;
  onCopy?: (value: string) => void | Promise<void>;
}
const styles = stylex.create({
  root: { display: "flex", alignItems: "center", gap: "0.5rem", margin: 0, padding: "0.25rem 0.5rem 0.25rem 0.75rem", minWidth: 0, maxWidth: "100%", borderWidth: vlak.hairline, borderStyle: "solid", borderColor: { default: vlak.divider, [mq.forcedColors]: "CanvasText" }, borderRadius: vlak.radiusSm, color: vlak.ink, backgroundColor: vlak.paper },
  prefix: { color: vlak.gray, flexShrink: 0, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" },
  code: { flex: "1 1 auto", minWidth: 0, overflowX: "auto", whiteSpace: "pre", fontSize: "0.875rem", lineHeight: 1.45, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", outlineColor: vlak.ink, outlineOffset: 2 },
  copy: { display: "inline-flex", alignItems: "center", flexWrap: "wrap", gap: "0.25rem", flexShrink: 0 },
  status: { fontSize: "0.75rem", lineHeight: 1.45, color: vlak.gray, maxWidth: "24ch" },
});

/** Exact-value clipboard action shared by compact developer views. */
export const SnippetCopy = React.forwardRef<HTMLSpanElement, SnippetCopyProps>(function SnippetCopy({ value, label = "Copy snippet", onCopy, className, style, ...props }, ref) {
  const [state, setState] = React.useState<"idle" | "pending" | "done" | "error">("idle");
  const request = React.useRef(0);
  const pending = React.useRef(false);
  // biome-ignore lint/correctness/useExhaustiveDependencies: A changed value invalidates the pending clipboard result.
  React.useEffect(() => { request.current++; pending.current = false; setState("idle"); return () => { request.current++; }; }, [value]);
  const copy = async () => {
    if (pending.current) return;
    pending.current = true;
    const id = ++request.current;
    setState("pending");
    try { if (onCopy) await onCopy(value); else await navigator.clipboard.writeText(value); if (id === request.current) setState("done"); }
    catch { if (id === request.current) setState("error"); }
    finally { if (id === request.current) pending.current = false; }
  };
  const root = rs(["rs-snippet-copy", className], styles.copy);
  const status = rs(["rs-snippet-status"], styles.status);
  return <span {...props} ref={ref} className={root.className} style={{ ...root.style, ...style }}>
    <Button type="button" variant="subtle" size="icon" aria-label={label} title={label} disabled={state === "pending"} onClick={() => { void copy(); }}><Icon name={state === "done" ? "check" : "copy"} /></Button>
    <span {...status} role="status" aria-live="polite">{state === "error" ? "Could not copy. Try again." : state === "done" ? "Copied" : state === "pending" ? "Copying…" : ""}</span>
  </span>;
});

/** A compact, selectable command or code line; the decorative prefix is not copied. */
export const Snippet = React.forwardRef<HTMLElement, SnippetProps>(function Snippet({ code, prefix, label = "Code snippet", copyLabel, copyable = true, onCopy, className, style, ...props }, ref) {
  const root = rs(["rs-snippet", className], styles.root);
  const prefixStyle = rs(["rs-snippet-prefix"], styles.prefix);
  const codeStyle = rs(["rs-snippet-code"], styles.code);
  return <figure aria-label={label} {...props} ref={ref} className={root.className} style={{ ...root.style, ...style }}>
    {prefix != null && <span {...prefixStyle} aria-hidden="true">{prefix}</span>}
    <code {...codeStyle} tabIndex={0}>{code}</code>
    {copyable && <SnippetCopy value={code} label={copyLabel} onCopy={onCopy} />}
  </figure>;
});
