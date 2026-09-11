import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionApprovalDemo } from "../action-approval-demo";
import { RecordReviewDemo } from "../record-review-demo";
import { ScheduleEditingDemo } from "../schedule-editing-demo";
import { WorkflowShell } from "../workflow-shell";
import { pageMetadata } from "@/lib/page-metadata";
import { getWorkflowKit, workflowCatalog } from "../../../../../examples/workflows/catalog";

export function generateStaticParams() { return workflowCatalog.map(workflow => ({ id: workflow.id })); }
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params; const workflow = getWorkflowKit(id as never);
  return pageMetadata(`/workflows/${id}`, { title: workflow ? `${workflow.title} example` : "Workflow", description: workflow?.description ?? "Vlak workflow example." });
}

export default async function WorkflowPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const workflow = getWorkflowKit(id as never); if (!workflow) notFound();
  return <WorkflowShell title={workflow.title} summary={workflow.description}>
    <div className="workflow-page-actions"><Link className="rs-btn-ghost" href="/workflows/">All workflow kits</Link><Link className="rs-btn-primary" href={`/workflows/${workflow.id}/manifest/`}>Read manifest</Link></div>
    {id === "record-review" ? <RecordReviewDemo /> : id === "action-approval" ? <ActionApprovalDemo /> : <ScheduleEditingDemo />}
    <section className="workflow-example-notes" aria-labelledby="example-boundary-title"><h2 id="example-boundary-title">What this example proves</h2><p>It exercises the kit’s local transition and validation contract with supplied fixture data. The manifest lists the production services and authorization checks that stay outside this browser example.</p><dl><div><dt>Initial state</dt><dd>{workflow.states.initial}</dd></div><div><dt>Terminal state</dt><dd>{workflow.states.terminal.join(", ")}</dd></div><div><dt>Kit version</dt><dd>{workflow.version}</dd></div></dl></section>
  </WorkflowShell>;
}
