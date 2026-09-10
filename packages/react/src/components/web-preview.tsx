"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { Button } from "./button";
import { Icon } from "./icon";
import { Input } from "./input";
import { Collapsible } from "./collapsible";
import { WidgetEmbed } from "./widget";

export interface WebPreviewLog { id?: string; level: "log" | "info" | "warn" | "error"; message: string; timestamp?: string | Date }
export interface WebPreviewProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  title?: string;
  url?: string;
  defaultUrl?: string;
  onUrlChange?: (url: string) => void;
  onBack?: () => void;
  onForward?: () => void;
  canGoBack?: boolean;
  canGoForward?: boolean;
  onReload?: () => void;
  logs?: WebPreviewLog[];
  maxLogEntries?: number;
  /** iframe permissions remain application-controlled; scripts and forms are allowed without same-origin access by default. */
  frameProps?: Omit<React.ComponentPropsWithRef<"iframe">, "src" | "srcDoc" | "title" | "children">;
}
export function isPreviewUrl(value: string): boolean {
  if (value === "about:blank") return true;
  if ([...value].some(character => character.charCodeAt(0) <= 32 || character.charCodeAt(0) === 127) || value.startsWith("//") || value.includes("\\")) return false;
  if (value.startsWith("/")) return true;
  try { const url = new URL(value); return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password; } catch { return false; }
}
const styles = stylex.create({
  root: { minWidth: 0, width: "100%", borderWidth: vlak.hairline, borderStyle: "solid", borderColor: { default: vlak.divider, [mq.forcedColors]: "CanvasText" }, borderRadius: vlak.radiusSm, color: vlak.ink, backgroundColor: vlak.paper, fontSize: "0.875rem", lineHeight: 1.45 },
  navigation: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.25rem", padding: "0.5rem", borderBottomWidth: vlak.hairline, borderBottomStyle: "solid", borderBottomColor: vlak.divider },
  address: { minWidth: "8rem", flex: "1 1 auto" },
  body: { minWidth: 0, overflow: "auto" },
  status: { padding: "0.5rem 1rem", margin: 0, color: vlak.gray, fontSize: "0.75rem" },
  console: { padding: "0 1rem 0.75rem", borderTopWidth: vlak.hairline, borderTopStyle: "solid", borderTopColor: vlak.divider },
  logs: { listStyle: "none", margin: 0, padding: 0, maxHeight: "14rem", overflow: "auto", outlineColor: vlak.ink, outlineOffset: 2 },
  log: { display: "grid", gap: "0.25rem", paddingBlock: "0.5rem", borderTopWidth: vlak.hairline, borderTopStyle: "solid", borderTopColor: vlak.divider, color: vlak.ink },
  level: { fontSize: "0.75rem", fontWeight: 600 },
  message: { whiteSpace: "pre-wrap", overflowWrap: "anywhere", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", margin: 0 },
});

/** URL navigation and a sandboxed iframe with host-supplied console messages. */
export const WebPreview = React.forwardRef<HTMLElement, WebPreviewProps>(function WebPreview({ title = "Web preview", url, defaultUrl = "about:blank", onUrlChange, onBack, onForward, canGoBack = false, canGoForward = false, onReload, logs = [], maxLogEntries = 200, frameProps, className, style, children, ...props }, ref) {
  const [innerUrl, setInnerUrl] = React.useState(defaultUrl);
  const current = url ?? innerUrl;
  const [draft, setDraft] = React.useState(current);
  const [status, setStatus] = React.useState("Loading preview…");
  const [validation, setValidation] = React.useState("");
  const [reload, setReload] = React.useState(0);
  const valid = isPreviewUrl(current);
  React.useEffect(() => { setDraft(current); setValidation(""); setStatus("Loading preview…"); }, [current]);
  const navigate = (event: React.FormEvent) => {
    event.preventDefault();
    const candidate = draft.trim();
    if (!isPreviewUrl(candidate)) { setValidation("Enter an http or https URL, a local path starting with /, or about:blank."); return; }
    setValidation("");
    if (url === undefined) setInnerUrl(candidate);
    onUrlChange?.(candidate);
    setStatus(candidate === current ? "Preview address is unchanged." : url === undefined ? "Loading preview…" : "Navigation requested.");
  };
  const root = rs(["rs-web-preview", className], styles.root);
  const navigation = rs(["rs-web-preview-navigation"], styles.navigation);
  const address = rs(["rs-web-preview-address"], styles.address);
  const body = rs(["rs-web-preview-body"], styles.body);
  const statusStyle = rs(["rs-web-preview-status"], styles.status);
  const consoleStyle = rs(["rs-web-preview-console"], styles.console);
  const list = rs(["rs-web-preview-logs"], styles.logs);
  const logStyle = rs(["rs-web-preview-log"], styles.log);
  const level = rs(["rs-web-preview-level"], styles.level);
  const message = rs(["rs-web-preview-message"], styles.message);
  const logLimit = Number.isFinite(maxLogEntries) ? Math.min(2000, Math.max(1, Math.floor(maxLogEntries))) : 200;
  return <section aria-label={title} {...props} ref={ref} className={root.className} style={{ ...root.style, ...style }}>
    <form onSubmit={navigate}><div {...navigation} role="group" aria-label={`${title} navigation`}>{onBack && <Button type="button" variant="subtle" size="icon" aria-label="Back" title="Back" disabled={!canGoBack} onClick={onBack}><Icon name="chevron-left" /></Button>}{onForward && <Button type="button" variant="subtle" size="icon" aria-label="Forward" title="Forward" disabled={!canGoForward} onClick={onForward}><Icon name="chevron-right" /></Button>}
      <Button type="button" variant="subtle" aria-label="Reload preview" disabled={!valid} onClick={() => { setReload(value => value + 1); setStatus("Loading preview…"); onReload?.(); }}>Reload</Button><div {...address}><Input plain aria-label="Preview URL" inputMode="url" value={draft} readOnly={url !== undefined && !onUrlChange} onChange={event => setDraft(event.currentTarget.value)} aria-invalid={!!validation} /></div><Button type="submit" variant="subtle" disabled={url !== undefined && !onUrlChange}>Go</Button>
    </div></form>
    <p {...statusStyle} role={validation || !valid ? "alert" : "status"}>{validation || (!valid ? "This preview address is not supported." : status)}</p>
    <div {...body}>{valid && <WidgetEmbed {...frameProps} key={`${current}:${reload}`} src={current} title={title} onLoad={event => { setStatus("Preview loaded."); frameProps?.onLoad?.(event); }} onError={event => { setStatus("Preview could not load. Try reloading."); frameProps?.onError?.(event); }} />}</div>
    <Collapsible {...consoleStyle} title={`Console (${logs.length})`}><ul {...list} tabIndex={0} aria-label="Preview console messages">{logs.slice(-logLimit).map((log, index) => { const date = log.timestamp == null ? undefined : new Date(log.timestamp); const iso = date && Number.isFinite(date.getTime()) ? date.toISOString() : undefined; return <li key={log.id ?? index} {...logStyle}><span {...level}>{log.level}{iso && <> · <time dateTime={iso}>{iso.slice(11, 19)} UTC</time></>}</span><pre {...message}>{log.message}</pre></li>; })}</ul>{logs.length === 0 && <p {...message}>No console output supplied.</p>}{logs.length > logLimit && <p {...message}>Showing the latest {logLimit} messages.</p>}</Collapsible>{children}
  </section>;
});
