"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { Button } from "./button";
import { Collapsible } from "./collapsible";
import { SnippetCopy } from "./snippet";

export interface StackFrame { raw: string; functionName?: string; filePath?: string; lineNumber?: number; columnNumber?: number; isInternal: boolean }
export interface ParsedStackTrace { errorType?: string; errorMessage: string; frames: StackFrame[]; omittedFrames: number; raw: string }
export interface StackTraceProps extends Omit<React.HTMLAttributes<HTMLElement>, "onCopy"> {
  trace: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onFilePathClick?: (filePath: string, line?: number, column?: number) => void;
  onCopy?: (trace: string) => void | Promise<void>;
  maxFrames?: number;
}

/** Parses V8/Node and Firefox/Safari locations; unknown frame text remains readable. */
export function parseStackTrace(trace: string, maxFrames = 200): ParsedStackTrace {
  const limit = Number.isFinite(maxFrames) ? Math.min(2000, Math.max(1, Math.floor(maxFrames))) : 200;
  const frames: StackFrame[] = [];
  const messages: string[] = [];
  let omittedFrames = 0;
  for (const source of trace.split("\n")) {
    const raw = source.trim();
    if (!raw) continue;
    const v8 = raw.match(/^at\s+(?:(.*?)\s+\((.*)\)|(.*))$/);
    const firefox = !v8 ? raw.match(/^(.*?)@(.+)$/) : null;
    if (!v8 && !firefox && frames.length === 0) { messages.push(raw); continue; }
    if (frames.length >= limit) { omittedFrames++; continue; }
    const location = v8 ? v8[2] ?? v8[3] : firefox?.[2];
    const full = location?.match(/^(.*):(\d+):(\d+)$/);
    const short = !full ? location?.match(/^(.*):(\d+)$/) : null;
    const match = full ?? short;
    const filePath = match?.[1];
    frames.push({ raw, functionName: v8?.[1] || firefox?.[1] || undefined, filePath, lineNumber: match ? Number(match[2]) : undefined, columnNumber: full ? Number(full[3]) : undefined, isInternal: /(?:^node:|[/\\]node_modules[/\\]|(?:^|[/\\])internal[/\\])/.test(filePath ?? raw) });
  }
  const message = messages.join("\n");
  const error = message.match(/^([\w.]*Error|Error|[\w.]*Exception):\s*([\s\S]*)$/);
  return { errorType: error?.[1], errorMessage: error?.[2] ?? message, frames, omittedFrames, raw: trace };
}
const styles = stylex.create({
  root: { minWidth: 0, width: "100%", borderWidth: vlak.hairline, borderStyle: "solid", borderColor: { default: vlak.divider, [mq.forcedColors]: "CanvasText" }, borderRadius: vlak.radiusSm, color: vlak.ink, backgroundColor: vlak.paper, fontSize: "0.875rem", lineHeight: 1.45 },
  header: { display: "flex", gap: "0.75rem", alignItems: "flex-start", padding: "0.75rem 1rem" },
  heading: { minWidth: 0, flex: "1 1 auto", display: "grid", gap: "0.25rem" },
  title: { fontWeight: 600 },
  message: { margin: 0, whiteSpace: "pre-wrap", overflowWrap: "anywhere" },
  content: { padding: "0 1rem 1rem", minWidth: 0 },
  list: { listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "0.5rem" },
  frame: { display: "grid", gap: "0.25rem", minWidth: 0, paddingBlock: "0.25rem", color: vlak.ink, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", overflowWrap: "anywhere" },
  internal: { color: vlak.gray },
  location: { minWidth: 0, width: "fit-content", maxWidth: "100%", textAlign: "start", justifyContent: "flex-start", overflowWrap: "anywhere" },
  note: { margin: 0, color: vlak.gray, fontSize: "0.75rem" },
});

export const StackTrace = React.forwardRef<HTMLElement, StackTraceProps>(function StackTrace({ trace, open, defaultOpen = false, onOpenChange, onFilePathClick, onCopy, maxFrames, children, className, style, ...props }, ref) {
  const parsed = React.useMemo(() => parseStackTrace(trace, maxFrames), [trace, maxFrames]);
  const root = rs(["rs-stack-trace", className], styles.root);
  const header = rs(["rs-stack-trace-header"], styles.header);
  const heading = rs(["rs-stack-trace-heading"], styles.heading);
  const title = rs(["rs-stack-trace-title"], styles.title);
  const message = rs(["rs-stack-trace-message"], styles.message);
  const content = rs(["rs-stack-trace-content"], styles.content);
  const list = rs(["rs-stack-trace-list"], styles.list);
  const locationStyle = rs(["rs-stack-trace-location"], styles.location);
  const note = rs(["rs-stack-trace-note"], styles.note);
  return <article aria-label={parsed.errorType ?? "Stack trace"} {...props} ref={ref} className={root.className} style={{ ...root.style, ...style }}>
    <header {...header}><div {...heading}><span {...title}>{parsed.errorType ?? "Stack trace"}</span>{parsed.errorMessage && <p {...message}>{parsed.errorMessage}</p>}</div><SnippetCopy value={trace} label="Copy stack trace" onCopy={onCopy} /></header>
    <div {...content}><Collapsible title={`${parsed.frames.length} stack ${parsed.frames.length === 1 ? "frame" : "frames"}`} open={open} defaultOpen={defaultOpen} onToggle={event => { const next = event.currentTarget.open; if (open !== undefined && next !== open) event.currentTarget.open = open; if (next !== open) onOpenChange?.(next); }}>
      <ol {...list}>{parsed.frames.map((frame, index) => {
        const frameStyle = rs(["rs-stack-trace-frame", frame.isInternal && "rs-stack-trace-internal"], styles.frame, frame.isInternal && styles.internal);
        const location = frame.filePath ? `${frame.filePath}:${frame.lineNumber}${frame.columnNumber != null ? `:${frame.columnNumber}` : ""}` : frame.raw;
        return <li key={`${index}:${frame.raw}`} {...frameStyle}>{frame.functionName && <span>{frame.functionName}</span>}{frame.filePath && onFilePathClick ? <Button {...locationStyle} type="button" variant="subtle" onClick={() => onFilePathClick(frame.filePath!, frame.lineNumber, frame.columnNumber)}>{location}</Button> : <span>{location}</span>}{frame.isInternal && <span {...note}>Internal frame</span>}</li>;
      })}</ol>{parsed.omittedFrames > 0 && <p {...note}>{parsed.omittedFrames} additional frames omitted. Copy includes the full trace.</p>}{parsed.frames.length === 0 && <p {...note}>No stack frames supplied.</p>}
    </Collapsible>{children}</div>
  </article>;
});
