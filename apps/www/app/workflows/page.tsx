import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/page-metadata";
import { workflowCatalog } from "../../../../examples/workflows/catalog";
import { WorkflowCardPreview } from "./workflow-card-preview";
import { WorkflowShell } from "./workflow-shell";

export const metadata: Metadata = pageMetadata("/workflows", { title: "Workflow kits", description: "Runnable workflow references and bounded recipes with explicit states, adapters, ownership, and acceptance checks." });

export default function WorkflowsPage() {
  return <WorkflowShell title="Workflow kits" summary="Try complete task flows, then inspect the state, ownership, and adapter contract behind each one.">
    <p className="rs-t-body workflow-intro">Each example uses supplied local fixtures and the same functions shipped in its kit. The manifest beside it separates reusable workflow logic from the authentication, authorization, and durable services an application must provide.</p>
    <div className="workflow-catalog-grid">{workflowCatalog.map((workflow, index) => <article key={workflow.id} className="workflow-card">
      <WorkflowCardPreview id={workflow.id} />
      <div className="workflow-card-copy"><p className="section-label">{String(index + 1).padStart(2, "0")} / {workflow.status}</p><h2>{workflow.title}</h2><p>{workflow.description}</p><div className="workflow-card-actions"><Link className="rs-btn-primary" href={`/workflows/${workflow.id}/`}>Try example</Link><Link className="rs-btn-ghost" href={`/workflows/${workflow.id}/manifest/`}>Read manifest</Link></div></div>
    </article>)}</div>
  </WorkflowShell>;
}
