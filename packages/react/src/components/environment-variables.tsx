"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { Button } from "./button";
import { SnippetCopy } from "./snippet";

export interface EnvironmentVariable { name: string; value: string; required?: boolean; description?: string }
export interface EnvironmentVariablesProps extends Omit<React.HTMLAttributes<HTMLElement>, "onCopy" | "title"> {
  variables: EnvironmentVariable[];
  title?: React.ReactNode;
  showValues?: boolean;
  defaultShowValues?: boolean;
  onShowValuesChange?: (show: boolean) => void;
  onCopy?: (value: string) => void | Promise<void>;
}

/** POSIX shell-safe assignments. Invalid names are rejected rather than emitted as executable shell text. */
export function formatEnvironmentExports(variables: EnvironmentVariable[]): string {
  return variables.map(({ name, value }) => {
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) throw new Error("Invalid environment variable name");
    return `export ${name}='${value.replaceAll("'", "'\\''")}'`;
  }).join("\n");
}
const styles = stylex.create({
  root: { minWidth: 0, width: "100%", borderWidth: vlak.hairline, borderStyle: "solid", borderColor: { default: vlak.divider, [mq.forcedColors]: "CanvasText" }, borderRadius: vlak.radiusSm, color: vlak.ink, backgroundColor: vlak.paper },
  header: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", borderBottomWidth: vlak.hairline, borderBottomStyle: "solid", borderBottomColor: vlak.divider },
  title: { flex: "1 1 auto", fontSize: "0.875rem", lineHeight: 1.45, fontWeight: 600 },
  list: { margin: 0, padding: "0 1rem" },
  row: { display: "grid", gridTemplateColumns: { default: "minmax(0, 1fr) minmax(0, 1fr) auto", [mq.phone]: "minmax(0, 1fr) auto" }, alignItems: "center", gap: "0.5rem", paddingBlock: "0.5rem", borderBottomWidth: vlak.hairline, borderBottomStyle: "solid", borderBottomColor: vlak.divider },
  name: { margin: 0, minWidth: 0, overflowWrap: "anywhere", fontSize: "0.875rem", lineHeight: 1.45 },
  value: { margin: 0, minWidth: 0, overflowWrap: "anywhere", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: "0.875rem", lineHeight: 1.45, gridColumn: { default: "auto", [mq.phone]: "1 / 2" } },
  controls: { display: "flex", flexWrap: "wrap", justifyContent: "flex-end", gap: "0.25rem", margin: 0, gridColumn: { default: "auto", [mq.phone]: "2 / 3" }, gridRow: { default: "auto", [mq.phone]: "1 / 3" } },
  note: { display: "block", margin: 0, color: vlak.gray, fontSize: "0.75rem", lineHeight: 1.45 },
  footer: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem" },
});

/** Masked values with deliberate reveal and exact-value/export copy actions. */
export const EnvironmentVariables = React.forwardRef<HTMLElement, EnvironmentVariablesProps>(function EnvironmentVariables({ variables, title = "Environment variables", showValues, defaultShowValues = false, onShowValuesChange, onCopy, className, style, "aria-label": label, "aria-labelledby": labelledBy, ...props }, ref) {
  const titleId = React.useId();
  const [innerShow, setInnerShow] = React.useState(defaultShowValues);
  const [revealed, setRevealed] = React.useState<Record<string, string>>({});
  const visible = showValues ?? innerShow;
  const setVisible = (show: boolean) => { if (showValues === undefined) setInnerShow(show); setRevealed({}); onShowValuesChange?.(show); };
  let exports = "";
  let validNames = true;
  try { exports = formatEnvironmentExports(variables); } catch { validNames = false; }
  const root = rs(["rs-environment-variables", className], styles.root);
  const header = rs(["rs-environment-variables-header"], styles.header);
  const titleStyle = rs(["rs-environment-variables-title"], styles.title);
  const list = rs(["rs-environment-variables-list"], styles.list);
  const row = rs(["rs-environment-variables-row"], styles.row);
  const name = rs(["rs-environment-variables-name"], styles.name);
  const valueStyle = rs(["rs-environment-variables-value"], styles.value);
  const controls = rs(["rs-environment-variables-controls"], styles.controls);
  const note = rs(["rs-environment-variables-note"], styles.note);
  const footer = rs(["rs-environment-variables-footer"], styles.footer);
  return <section {...props} ref={ref} aria-label={label} aria-labelledby={labelledBy ?? (label == null ? titleId : undefined)} className={root.className} style={{ ...root.style, ...style }}>
    <header {...header}><span {...titleStyle} id={titleId}>{title}</span><Button type="button" variant="subtle" aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? "Hide all values" : "Show all values"}</Button></header>
    <dl {...list}>{variables.map(variable => {
      const shown = visible || revealed[variable.name] === variable.value;
      return <div key={variable.name} {...row}>
        <dt {...name}><code>{variable.name}</code>{variable.required && <span {...note}>Required</span>}{variable.description && <span {...note}>{variable.description}</span>}</dt>
        <dd {...valueStyle}>{shown ? variable.value || "(empty)" : <span role="img" aria-label="Value hidden">••••••••</span>}</dd>
        <dd {...controls}>{!visible && <Button type="button" variant="subtle" aria-label={`${shown ? "Hide" : "Show"} ${variable.name}`} aria-pressed={shown} onClick={() => setRevealed(current => { const next = { ...current }; if (shown) delete next[variable.name]; else next[variable.name] = variable.value; return next; })}>{shown ? "Hide" : "Show"}</Button>}<SnippetCopy value={variable.value} label={`Copy ${variable.name}`} onCopy={onCopy} /></dd>
      </div>;
    })}</dl>
    <footer {...footer}>{variables.length === 0 ? <span {...note}>No environment variables.</span> : validNames ? <><span {...note}>Shell exports</span><SnippetCopy value={exports} label="Copy environment exports" onCopy={onCopy} /></> : <span {...note}>Export unavailable: variable names must contain letters, digits or underscores and cannot start with a digit.</span>}</footer>
  </section>;
});
