import type { Metadata } from "next";
import Link from "next/link";
import { DocsShell } from "@/components/docs-shell";
import { pageMetadata } from "@/lib/page-metadata";
import { workflowCatalog } from "../../../../examples/workflows/catalog";

export const metadata: Metadata = pageMetadata("/workflows", { title: "Workflow kits", description: "Runnable workflow references and bounded recipes with explicit states, adapters, ownership, and acceptance checks." });

export default function WorkflowsPage() {
  return <DocsShell title="Workflow kits" summary="Complete task flows with explicit state, adapters, host responsibilities, and acceptance checks.">
    <p className="rs-t-body">These examples show how Vlak components fit around a real task. Each manifest states what the kit provides, what the host must own, and where the boundary remains.</p>
    <div className="docs-list">{workflowCatalog.map((workflow, index) => <article key={workflow.id} className="docs-card"><p className="section-label">{String(index + 1).padStart(2, "0")} / {workflow.status}</p><h2><Link className="rs-link" href={`/workflows/${workflow.id}/`}>{workflow.title}</Link></h2><p className="rs-t-body">{workflow.description}</p><p className="rs-t-body"><strong>States:</strong> {workflow.states.values.join(", ")}</p><Link className="rs-link-underline" href={`/workflows/${workflow.id}/`}>Read the manifest <span aria-hidden="true">→</span></Link></article>)}</div>
  </DocsShell>;
}
