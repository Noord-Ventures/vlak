"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { Badge } from "./badge";
import { Collapsible } from "./collapsible";

export interface SchemaProperty { name: string; type: string; required?: boolean; description?: string; properties?: SchemaProperty[]; items?: SchemaProperty }
export interface SchemaParameter extends SchemaProperty { location?: "path" | "query" | "header" | "cookie" }
export interface SchemaDisplayProps extends React.HTMLAttributes<HTMLElement> {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";
  path: string;
  description?: React.ReactNode;
  parameters?: SchemaParameter[];
  requestBody?: SchemaProperty[];
  responseBody?: SchemaProperty[];
  /** Bounds recursive schema rendering. Defaults to 6 levels and 200 properties. */
  maxDepth?: number;
  maxNodes?: number;
}
const styles = stylex.create({
  root: { minWidth: 0, width: "100%", borderWidth: vlak.hairline, borderStyle: "solid", borderColor: { default: vlak.divider, [mq.forcedColors]: "CanvasText" }, borderRadius: vlak.radiusSm, color: vlak.ink, backgroundColor: vlak.paper, fontSize: "0.875rem", lineHeight: 1.45 },
  header: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.75rem", padding: "1rem", borderBottomWidth: vlak.hairline, borderBottomStyle: "solid", borderBottomColor: vlak.divider },
  path: { minWidth: 0, overflowWrap: "anywhere" },
  content: { padding: "1rem", display: "grid", gap: "0.75rem", minWidth: 0 },
  description: { margin: 0, color: vlak.gray, overflowWrap: "anywhere" },
  list: { listStyle: "none", margin: 0, paddingInlineStart: "0.75rem", display: "grid", gap: "0.75rem", minWidth: 0 },
  property: { display: "grid", gap: "0.25rem", minWidth: 0, color: vlak.ink },
  line: { display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center", overflowWrap: "anywhere", minWidth: 0 },
  note: { fontSize: "0.75rem", color: vlak.gray },
});

/** Endpoint documentation with bounded, expandable object and array schemas. */
export const SchemaDisplay = React.forwardRef<HTMLElement, SchemaDisplayProps>(function SchemaDisplay({ method, path, description, parameters, requestBody, responseBody, maxDepth = 6, maxNodes = 200, children, className, style, ...props }, ref) {
  const root = rs(["rs-schema-display", className], styles.root);
  const header = rs(["rs-schema-display-header"], styles.header);
  const pathStyle = rs(["rs-schema-display-path"], styles.path);
  const content = rs(["rs-schema-display-content"], styles.content);
  const descriptionStyle = rs(["rs-schema-display-description"], styles.description);
  const list = rs(["rs-schema-display-list"], styles.list);
  const propertyStyle = rs(["rs-schema-display-property"], styles.property);
  const line = rs(["rs-schema-display-line"], styles.line);
  const note = rs(["rs-schema-display-note"], styles.note);
  const depthLimit = Number.isFinite(maxDepth) ? Math.min(20, Math.max(1, Math.floor(maxDepth))) : 6;
  let remaining = Number.isFinite(maxNodes) ? Math.min(2000, Math.max(1, Math.floor(maxNodes))) : 200;
  const renderProperties = (properties: SchemaParameter[], depth: number, parents: Set<SchemaProperty>): React.ReactNode => {
    const nodes: React.ReactNode[] = [];
    for (const [index, property] of properties.entries()) {
      if (remaining-- <= 0) { nodes.push(<li key="limit" {...note}>More properties omitted.</li>); break; }
      const nested = property.properties ?? (property.items ? [property.items] : undefined);
      const circular = parents.has(property);
      const nextParents = new Set(parents).add(property);
      nodes.push(<li key={`${index}:${property.name}`} {...propertyStyle}><div {...line}><code>{property.name}</code><Badge variant="muted">{property.type}</Badge>{property.location && <span {...note}>{property.location}</span>}{property.required && <strong {...note}>Required</strong>}</div>
        {property.description && <p {...descriptionStyle}>{property.description}</p>}
        {nested && (circular ? <span {...note}>Recursive reference.</span> : depth >= depthLimit ? <span {...note}>Depth limit reached.</span> : <Collapsible title={`${property.items ? "Items" : "Properties"} of ${property.name}`} defaultOpen={depth === 0}>{renderProperties(nested, depth + 1, nextParents)}</Collapsible>)}
      </li>);
    }
    return <ul {...list}>{nodes}</ul>;
  };
  return <article aria-label={`${method} ${path}`} {...props} ref={ref} className={root.className} style={{ ...root.style, ...style }}>
    <header {...header}><Badge variant="muted">{method}</Badge><code {...pathStyle}>{path}</code></header>
    <div {...content}>{description != null && <div {...descriptionStyle}>{description}</div>}
      {parameters != null && <Collapsible title={`Parameters (${parameters.length})`} defaultOpen>{parameters.length ? renderProperties(parameters, 0, new Set()) : <p {...descriptionStyle}>No parameters.</p>}</Collapsible>}
      {requestBody != null && <Collapsible title="Request body" defaultOpen>{requestBody.length ? renderProperties(requestBody, 0, new Set()) : <p {...descriptionStyle}>No request body.</p>}</Collapsible>}
      {responseBody != null && <Collapsible title="Response body" defaultOpen>{responseBody.length ? renderProperties(responseBody, 0, new Set()) : <p {...descriptionStyle}>No response body.</p>}</Collapsible>}{children}
    </div>
  </article>;
});
