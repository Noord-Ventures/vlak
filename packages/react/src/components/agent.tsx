"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { Badge } from "./badge";
import { Collapsible } from "./collapsible";
import { CodeBlock } from "./code-block";
import { JSONViewer } from "./json-viewer";

export interface AgentToolDefinition { name: string; description?: string; inputSchema?: unknown }
export interface AgentProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  name: string;
  model?: string;
  instructions?: React.ReactNode;
  tools?: AgentToolDefinition[];
  outputSchema?: unknown;
  /** Optional rich/schema renderer. The default safely displays objects or escaped source text. */
  renderSchema?: (schema: unknown, context: "input" | "output") => React.ReactNode;
}
const styles = stylex.create({
  root: { minWidth: 0, width: "100%", borderWidth: vlak.hairline, borderStyle: "solid", borderColor: { default: vlak.divider, [mq.forcedColors]: "CanvasText" }, borderRadius: vlak.radiusSm, color: vlak.ink, backgroundColor: vlak.paper, fontSize: "0.875rem", lineHeight: 1.45 },
  header: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.75rem", padding: "1rem", borderBottomWidth: vlak.hairline, borderBottomStyle: "solid", borderBottomColor: vlak.divider },
  title: { fontWeight: 600, overflowWrap: "anywhere" },
  content: { display: "grid", gap: "1rem", padding: "1rem", minWidth: 0 },
  section: { display: "grid", gap: "0.5rem", minWidth: 0 },
  label: { fontSize: "0.75rem", color: vlak.gray, fontWeight: 600 },
  instructions: { whiteSpace: "pre-wrap", overflowWrap: "anywhere", minWidth: 0 },
  description: { color: vlak.gray, margin: "0 0 0.75rem", overflowWrap: "anywhere" },
});

/** Inspect agent configuration without instantiating tools or executing instructions. */
export const Agent = React.forwardRef<HTMLElement, AgentProps>(function Agent({ name, model, instructions, tools = [], outputSchema, renderSchema, children, className, style, ...props }, ref) {
  const root = rs(["rs-agent", className], styles.root);
  const header = rs(["rs-agent-header"], styles.header);
  const title = rs(["rs-agent-title"], styles.title);
  const content = rs(["rs-agent-content"], styles.content);
  const section = rs(["rs-agent-section"], styles.section);
  const label = rs(["rs-agent-label"], styles.label);
  const instructionsStyle = rs(["rs-agent-instructions"], styles.instructions);
  const description = rs(["rs-agent-description"], styles.description);
  const schema = (value: unknown, context: "input" | "output") => renderSchema ? renderSchema(value, context) : typeof value === "string" ? <CodeBlock code={value} language={context === "output" ? "TypeScript" : "JSON"} /> : <JSONViewer data={value} label={`${context === "input" ? "Input" : "Output"} schema`} searchable={false} />;
  return <article aria-label={`Agent ${name}`} {...props} ref={ref} className={root.className} style={{ ...root.style, ...style }}>
    <header {...header}><span {...title}>{name}</span>{model && <Badge variant="muted">{model}</Badge>}</header>
    <div {...content}>{instructions != null && <div {...section}><span {...label}>Instructions</span><div {...instructionsStyle}>{instructions}</div></div>}
      {tools.length > 0 && <div {...section}><span {...label}>Tools ({tools.length})</span>{tools.map(tool => <Collapsible key={tool.name} title={tool.name}>{tool.description && <p {...description}>{tool.description}</p>}{tool.inputSchema !== undefined ? schema(tool.inputSchema, "input") : <p {...description}>No input schema supplied.</p>}</Collapsible>)}</div>}
      {outputSchema !== undefined && <div {...section}><span {...label}>Output schema</span>{schema(outputSchema, "output")}</div>}{children}
    </div>
  </article>;
});
