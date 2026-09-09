import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { Badge } from "./badge";
import { Collapsible } from "./collapsible";

export type PackageChangeType = "major" | "minor" | "patch" | "added" | "removed";
export interface PackageDependency { name: string; version: string; kind?: "runtime" | "development" | "peer" | "optional" }
export interface PackageInfoProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  name: string;
  currentVersion?: string;
  newVersion?: string;
  changeType?: PackageChangeType;
  description?: React.ReactNode;
  dependencies?: PackageDependency[];
  actions?: React.ReactNode;
}
const styles = stylex.create({
  root: { display: "grid", gap: "0.75rem", padding: "1rem", minWidth: 0, borderWidth: vlak.hairline, borderStyle: "solid", borderColor: { default: vlak.divider, [mq.forcedColors]: "CanvasText" }, borderRadius: vlak.radiusSm, color: vlak.ink, backgroundColor: vlak.paper, fontSize: "0.875rem", lineHeight: 1.45 },
  header: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem" },
  name: { fontWeight: 600, overflowWrap: "anywhere", minWidth: 0, flex: "1 1 auto" },
  versions: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", overflowWrap: "anywhere" },
  description: { color: vlak.gray, margin: 0 },
  list: { paddingInlineStart: "1.25rem", margin: 0, display: "grid", gap: "0.5rem", color: vlak.ink, overflowWrap: "anywhere" },
  actions: { display: "flex", flexWrap: "wrap", gap: "0.5rem" },
});

/** Supplied package changes and dependencies; never resolves or installs packages. */
export const PackageInfo = React.forwardRef<HTMLElement, PackageInfoProps>(function PackageInfo({ name, currentVersion, newVersion, changeType, description, dependencies, actions, children, className, style, ...props }, ref) {
  const root = rs(["rs-package-info", className], styles.root);
  const header = rs(["rs-package-info-header"], styles.header);
  const nameStyle = rs(["rs-package-info-name"], styles.name);
  const versions = rs(["rs-package-info-versions"], styles.versions);
  const descriptionStyle = rs(["rs-package-info-description"], styles.description);
  const list = rs(["rs-package-info-list"], styles.list);
  const actionStyle = rs(["rs-package-info-actions"], styles.actions);
  return <article aria-label={`Package ${name}`} {...props} ref={ref} className={root.className} style={{ ...root.style, ...style }}>
    <header {...header}><code {...nameStyle}>{name}</code>{changeType && <Badge variant="muted">{changeType}</Badge>}</header>
    {(currentVersion || newVersion) && <div {...versions}>{currentVersion && <span>Current {currentVersion}</span>}{currentVersion && newVersion && <span aria-hidden="true">→</span>}{newVersion && <strong>Proposed {newVersion}</strong>}</div>}
    {description != null && <div {...descriptionStyle}>{description}</div>}
    {dependencies != null && <Collapsible title={`Dependencies (${dependencies.length})`}><ul {...list}>{dependencies.map(dependency => <li key={`${dependency.kind}:${dependency.name}`}><code>{dependency.name}</code> {dependency.version}{dependency.kind && ` · ${dependency.kind}`}</li>)}</ul>{dependencies.length === 0 && <p {...descriptionStyle}>No dependencies.</p>}</Collapsible>}
    {children}{actions != null && <div {...actionStyle}>{actions}</div>}
  </article>;
});
