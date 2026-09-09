"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { Badge } from "./badge";
import { Button } from "./button";
import { Collapsible } from "./collapsible";
import { SnippetCopy } from "./snippet";

export interface CommitFile { path: string; previousPath?: string; status: "added" | "modified" | "deleted" | "renamed"; additions?: number; deletions?: number }
export interface CommitProps extends Omit<React.HTMLAttributes<HTMLElement>, "onCopy" | "title"> {
  hash: string;
  message: string;
  author?: React.ReactNode;
  avatar?: React.ReactNode;
  /** ISO date or Date; a supplied timeLabel can use the application's locale or relative clock. */
  timestamp?: string | Date;
  timeLabel?: string;
  files?: CommitFile[];
  defaultOpen?: boolean;
  onFileSelect?: (file: CommitFile) => void;
  onCopy?: (hash: string) => void | Promise<void>;
}
const styles = stylex.create({
  root: { minWidth: 0, width: "100%", borderWidth: vlak.hairline, borderStyle: "solid", borderColor: { default: vlak.divider, [mq.forcedColors]: "CanvasText" }, borderRadius: vlak.radiusSm, color: vlak.ink, backgroundColor: vlak.paper, fontSize: "0.875rem", lineHeight: 1.45 },
  header: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem" },
  heading: { display: "grid", gap: "0.25rem", minWidth: 0, flex: "1 1 auto", overflowWrap: "anywhere" },
  message: { fontWeight: 600 },
  metadata: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem", color: vlak.gray, fontSize: "0.75rem" },
  content: { padding: "0 1rem 1rem", minWidth: 0 },
  list: { listStyle: "none", padding: 0, margin: 0, color: vlak.ink },
  file: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem", minWidth: 0, paddingBlock: "0.5rem", borderTopWidth: vlak.hairline, borderTopStyle: "solid", borderTopColor: vlak.divider },
  path: { minWidth: 0, flex: "1 1 auto", overflowWrap: "anywhere", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", textAlign: "start" },
  count: { color: vlak.gray, fontSize: "0.75rem", fontVariantNumeric: "tabular-nums" },
});

/** Supplied commit metadata and changed files with exact hash copy and optional file navigation. */
export const Commit = React.forwardRef<HTMLElement, CommitProps>(function Commit({ hash, message, author, avatar, timestamp, timeLabel, files = [], defaultOpen = false, onFileSelect, onCopy, children, className, style, ...props }, ref) {
  const parsed = timestamp == null ? undefined : new Date(timestamp);
  const iso = parsed && Number.isFinite(parsed.getTime()) ? parsed.toISOString() : undefined;
  const root = rs(["rs-commit", className], styles.root);
  const header = rs(["rs-commit-header"], styles.header);
  const heading = rs(["rs-commit-heading"], styles.heading);
  const messageStyle = rs(["rs-commit-message"], styles.message);
  const metadata = rs(["rs-commit-metadata"], styles.metadata);
  const content = rs(["rs-commit-content"], styles.content);
  const list = rs(["rs-commit-list"], styles.list);
  const fileStyle = rs(["rs-commit-file"], styles.file);
  const path = rs(["rs-commit-path"], styles.path);
  const count = rs(["rs-commit-count"], styles.count);
  return <article aria-label={`Commit ${hash.slice(0, 7)}`} {...props} ref={ref} className={root.className} style={{ ...root.style, ...style }}>
    <header {...header}>{avatar}<div {...heading}><span {...messageStyle}>{message}</span><div {...metadata}><code>{hash.slice(0, 7)}</code>{author}{iso && <time dateTime={iso}>{timeLabel ?? iso.replace("T", " ").slice(0, 16) + " UTC"}</time>}</div></div><SnippetCopy value={hash} label="Copy commit hash" onCopy={onCopy} /></header>
    <div {...content}><Collapsible title={`${files.length} changed ${files.length === 1 ? "file" : "files"}`} defaultOpen={defaultOpen}><ul {...list}>{files.map(file => <li key={file.path} {...fileStyle}>
      <Badge variant="muted">{file.status}</Badge>{onFileSelect ? <Button {...path} type="button" variant="subtle" onClick={() => onFileSelect(file)}>{file.path}</Button> : <code {...path}>{file.path}</code>}
      {file.previousPath && <span {...count}>from {file.previousPath}</span>}{file.additions != null && <span {...count}>{file.additions} additions</span>}{file.deletions != null && <span {...count}>{file.deletions} deletions</span>}
    </li>)}</ul>{files.length === 0 && <p {...count}>No file changes supplied.</p>}</Collapsible>{children}</div>
  </article>;
});
