import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RecordReviewDemo } from "../record-review-demo";
import { CodeBlock } from "@/components/code-block";
import { DocsShell } from "@/components/docs-shell";
import { pageMetadata } from "@/lib/page-metadata";
import { getWorkflowKit, workflowCatalog } from "../../../../../examples/workflows/catalog";

export function generateStaticParams() { return workflowCatalog.map(workflow => ({ id: workflow.id })); }
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params; const workflow = getWorkflowKit(id as never);
  return pageMetadata(`/workflows/${id}`, { title: workflow?.title ?? "Workflow", description: workflow?.description ?? "Vlak workflow manifest." });
}

const sourceUrl = (path: string) => `https://github.com/Noord-Ventures/vlak/tree/main/${path}`;

export default async function WorkflowPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const workflow = getWorkflowKit(id as never); if (!workflow) notFound();
  return <DocsShell title={workflow.title} summary={workflow.description}>
    <p className="rs-t-body"><Link className="rs-link" href="/workflows/">Workflow kits</Link> · schema version {workflow.schemaVersion} · kit version {workflow.version}</p>
    {id === "record-review" && <RecordReviewDemo />}
    <h2 className="section-label">States</h2><p className="rs-t-body">Initial: <code>{workflow.states.initial}</code>. Terminal: {workflow.states.terminal.map(state => <code key={state}>{state} </code>)} Values: {workflow.states.values.join(", ")}.</p>
    <h2 className="section-label">Adapters</h2><ul className="docs-list">{workflow.adapters.map(adapter => <li key={adapter.id}><strong>{adapter.label}</strong> · {adapter.durability} · <a className="rs-link" href={sourceUrl(adapter.source)}>source</a></li>)}</ul>
    <h2 className="section-label">Ownership</h2><p className="rs-t-body"><strong>Kit provides:</strong> {workflow.ownership.kitProvides.join("; ")}</p><p className="rs-t-body"><strong>Host provides:</strong> {workflow.ownership.hostProvides.join("; ")}</p><p className="rs-t-body"><strong>Validation boundary:</strong> {workflow.ownership.externalValidationBoundary}</p>
    <h2 className="section-label">Install and run</h2><CodeBlock code={[`cd ${workflow.install.directory}`, ...workflow.install.commands, ...workflow.run.commands].join("\n")} /><p className="rs-t-body">Run these commands from a source checkout. The runnable example remains in the repository. For <code>record-review</code>, start the reference server and Vite UI using the commands above, then inspect the <a className="rs-link" href={sourceUrl("examples/workflows/record-review/ui/src/record-review-app.tsx")}>UI source</a>.</p>
    <h2 className="section-label">Components</h2><p className="rs-t-body">{workflow.components.join(", ")}</p>
    <h2 className="section-label">Acceptance</h2><ul className="docs-list">{workflow.acceptance.map(item => <li key={item}>{item}</li>)}</ul>
    <h2 className="section-label">Limitations</h2><ul className="docs-list">{workflow.limitations.map(item => <li key={item}>{item}</li>)}</ul>
    <h2 className="section-label">Source map</h2><ul className="docs-list">{workflow.sources.map(source => <li key={`${source.role}-${source.path}`}><a className="rs-link" href={sourceUrl(source.path)}>{source.path}</a> · {source.role}</li>)}</ul>
  </DocsShell>;
}
