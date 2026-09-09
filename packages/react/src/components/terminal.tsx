"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { Button } from "./button";
import { SnippetCopy } from "./snippet";
import { appendTerminalOutput, createTerminalParser, type TerminalParserState } from "./terminal-parser";

export interface TerminalProps extends Omit<React.HTMLAttributes<HTMLElement>, "onCopy" | "title"> {
  output: string;
  title?: React.ReactNode;
  streaming?: boolean;
  autoScroll?: boolean;
  /** Explicitly opt into original ANSI colors. The default retains text attributes in monochrome. */
  ansiColors?: boolean;
  onClear?: () => void;
  onCopy?: (output: string) => void | Promise<void>;
  maxHeight?: React.CSSProperties["maxHeight"];
  /** Maximum visible source characters. Copy retains the complete original output. */
  maxCharacters?: number;
}
const blink = stylex.keyframes({ from: { opacity: 1 }, to: { opacity: 0.35 } });
const styles = stylex.create({
  root: { minWidth: 0, width: "100%", borderWidth: vlak.hairline, borderStyle: "solid", borderColor: { default: vlak.divider, [mq.forcedColors]: "CanvasText" }, borderRadius: vlak.radiusSm, color: vlak.ink, backgroundColor: vlak.paper, fontSize: "0.875rem", lineHeight: 1.45 },
  header: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0.75rem", borderBottomWidth: vlak.hairline, borderBottomStyle: "solid", borderBottomColor: vlak.divider },
  title: { fontWeight: 600, flex: "1 1 auto" },
  status: { color: vlak.gray, fontSize: "0.75rem", margin: 0 },
  content: { padding: "1rem", overflow: "auto", outlineColor: vlak.ink, outlineOffset: -2 },
  pre: { margin: 0, whiteSpace: "pre-wrap", overflowWrap: "anywhere", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" },
  run: { color: "inherit", "--terminal-foreground": "inherit", "--terminal-background": "transparent" },
  bold: { fontWeight: 700 },
  dim: { color: vlak.gray },
  italic: { fontStyle: "italic" },
  underline: { textDecorationLine: "underline" },
  strike: { textDecorationLine: "line-through" },
  underlineStrike: { textDecorationLine: "underline line-through" },
  inverse: { color: { default: vlak.paper, [mq.forcedColors]: "HighlightText" }, backgroundColor: { default: vlak.ink, [mq.forcedColors]: "Highlight" } },
  colors: { color: { default: "var(--terminal-foreground, inherit)", [mq.forcedColors]: "CanvasText" }, backgroundColor: { default: "var(--terminal-background, transparent)", [mq.forcedColors]: "Canvas" } },
  cursor: { display: "inline-block", width: "0.5rem", height: "1em", backgroundColor: vlak.ink, verticalAlign: "text-bottom", marginInlineStart: "0.25rem", animationName: { default: blink, [mq.reduce]: "none" }, animationDuration: "800ms", animationDirection: "alternate", animationIterationCount: "infinite" },
  footer: { padding: "0 1rem 0.75rem", color: vlak.gray, fontSize: "0.75rem" },
});

/** Streaming console output with incremental ANSI attributes; not a shell or terminal emulator. */
export const Terminal = React.forwardRef<HTMLElement, TerminalProps>(function Terminal({ output, title = "Terminal", streaming = false, autoScroll = true, ansiColors = false, onClear, onCopy, maxHeight = "24rem", maxCharacters = 100000, className, style, children, ...props }, ref) {
  const cache = React.useRef<{ source: string; parsed: TerminalParserState }>({ source: "", parsed: createTerminalParser() });
  const contentRef = React.useRef<HTMLDivElement>(null);
  const following = React.useRef(true);
  const [atEnd, setAtEnd] = React.useState(true);
  const budget = Number.isFinite(maxCharacters) ? Math.min(2000000, Math.max(100, Math.floor(maxCharacters))) : 100000;
  const source = output.slice(-budget);
  const parsed = React.useMemo(() => {
    const previous = cache.current;
    const append = source.startsWith(previous.source);
    const next = appendTerminalOutput(append ? previous.parsed : createTerminalParser(), append ? source.slice(previous.source.length) : source);
    cache.current = { source, parsed: next };
    return next;
  }, [source]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: New output requests follow-scroll only while the reader is at the end.
  React.useEffect(() => { if (autoScroll && following.current && contentRef.current) contentRef.current.scrollTop = contentRef.current.scrollHeight; }, [output, autoScroll]);
  const root = rs(["rs-terminal", className], styles.root);
  const header = rs(["rs-terminal-header"], styles.header);
  const titleStyle = rs(["rs-terminal-title"], styles.title);
  const status = rs(["rs-terminal-status"], styles.status);
  const content = rs(["rs-terminal-content"], styles.content);
  const pre = rs(["rs-terminal-pre"], styles.pre);
  const cursor = rs(["rs-terminal-cursor"], styles.cursor);
  const footer = rs(["rs-terminal-footer"], styles.footer);
  return <section aria-label={typeof title === "string" ? title : "Terminal output"} {...props} ref={ref} className={root.className} style={{ ...root.style, ...style }}>
    <header {...header}><span {...titleStyle}>{title}</span><span {...status} role="status">{streaming ? "Streaming" : "Output complete"}</span><SnippetCopy value={output} label="Copy terminal output" onCopy={onCopy} />{onClear && <Button type="button" variant="subtle" onClick={onClear}>Clear</Button>}{!atEnd && autoScroll && <Button type="button" variant="subtle" onClick={() => { following.current = true; setAtEnd(true); if (contentRef.current) contentRef.current.scrollTop = contentRef.current.scrollHeight; }}>Latest output</Button>}</header>
    <div ref={contentRef} className={content.className} style={{ ...content.style, maxHeight }} tabIndex={0} role="group" aria-label="Terminal output" onScroll={event => { const node = event.currentTarget; following.current = node.scrollHeight - node.scrollTop - node.clientHeight < 24; setAtEnd(following.current); }}><pre {...pre}>{parsed.runs.map((run, index) => {
      const sx = rs(["rs-terminal-run", run.bold && "rs-terminal-bold", run.dim && "rs-terminal-dim", run.italic && "rs-terminal-italic", run.underline && "rs-terminal-underline", run.strike && "rs-terminal-strike", run.underline && run.strike && "rs-terminal-underline-strike", run.inverse && "rs-terminal-inverse", ansiColors && "rs-terminal-colors"], styles.run, run.bold && styles.bold, run.dim && styles.dim, run.italic && styles.italic, run.underline && styles.underline, run.strike && styles.strike, run.underline && run.strike && styles.underlineStrike, run.inverse && styles.inverse, ansiColors && styles.colors);
      const dynamic = ansiColors ? { "--terminal-foreground": run.inverse ? run.background ?? "var(--bg)" : run.foreground, "--terminal-background": run.inverse ? run.foreground ?? "var(--text)" : run.background } as React.CSSProperties : undefined;
      return <span key={index} className={sx.className} style={{ ...sx.style, ...dynamic }}>{run.text}</span>;
    })}{streaming && <span {...cursor} aria-hidden="true" />}</pre></div>{output.length > budget && <div {...footer}>Earlier output omitted. Copy includes the complete source.</div>}{children}
  </section>;
});
