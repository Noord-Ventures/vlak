import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CodeBlock } from "@/components/code-block";
import { pageMetadata } from "@/lib/page-metadata";
import { getWorkflowKit, workflowCatalog } from "../../../../../../examples/workflows/catalog";
import { WorkflowShell } from "../../workflow-shell";

export function generateStaticParams() { return workflowCatalog.map(workflow => ({ id: workflow.id })); }
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params; const workflow = getWorkflowKit(id as never);
  return pageMetadata(`/workflows/${id}/manifest`, { title: workflow ? `${workflow.title} manifest` : "Workflow manifest", description: workflow ? `Source files, adapters, state transitions, ownership boundaries, and acceptance checks for the ${workflow.title.toLowerCase()} workflow kit.` : "Vlak workflow manifest." });
}

const sourceUrl = (path: string) => `https://github.com/Noord-Ventures/vlak/tree/main/${path}`;

export default async function WorkflowManifestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const workflow = getWorkflowKit(id as never); if (!workflow) notFound();
  const commands = [`cd ${workflow.install.directory}`, ...workflow.install.commands, ...workflow.run.commands];
  return <WorkflowShell title={`${workflow.title} manifest`} summary="Technical contract, ownership boundaries, source files, and acceptance checks for this workflow kit.">
    <div className="workflow-page-actions"><Link className="rs-btn-primary" href={`/workflows/${workflow.id}/`}>Try example</Link><Link className="rs-btn-ghost" href="/workflows/">All workflow kits</Link></div>
    <p className="rs-t-body workflow-manifest-meta">Schema version {workflow.schemaVersion} · kit version {workflow.version} · {workflow.status}</p>
    <div className="workflow-manifest-grid">
      <section><h2 className="section-label">States</h2><p className="rs-t-body">Initial: <code>{workflow.states.initial}</code>. Terminal: {workflow.states.terminal.map(state => <code key={state}>{state} </code>)} Values: {workflow.states.values.join(", ")}.</p></section>
      <section><h2 className="section-label">Components</h2><p className="rs-t-body">{workflow.components.join(", ")}</p></section>
    </div>
    <h2 className="section-label">Adapters</h2><ul className="docs-list">{workflow.adapters.map(adapter => <li key={adapter.id}><strong>{adapter.label}</strong> · {adapter.durability} · <a className="rs-link" href={sourceUrl(adapter.source)}>source</a></li>)}</ul>
    <h2 className="section-label">Ownership</h2><div className="workflow-ownership-grid"><section><h3>Kit provides</h3><ul>{workflow.ownership.kitProvides.map(item => <li key={item}>{item}</li>)}</ul></section><section><h3>Host provides</h3><ul>{workflow.ownership.hostProvides.map(item => <li key={item}>{item}</li>)}</ul></section></div><p className="rs-t-body"><strong>External validation boundary:</strong> {workflow.ownership.externalValidationBoundary}</p>
    <h2 className="section-label">Install and run</h2>{commands.length > 1 ? <CodeBlock code={commands.join("\n")} /> : <p className="rs-t-body">No package installation is required.</p>}<p className="rs-t-body">Run from a source checkout. The browser example uses supplied local fixtures; follow these commands for the standalone reference or recipe.</p>
    <div className="workflow-manifest-grid"><section><h2 className="section-label">Acceptance</h2><ul className="docs-list">{workflow.acceptance.map(item => <li key={item}>{item}</li>)}</ul></section><section><h2 className="section-label">Limitations</h2><ul className="docs-list">{workflow.limitations.map(item => <li key={item}>{item}</li>)}</ul></section></div>
    <h2 className="section-label">Source map</h2><ul className="docs-list workflow-source-list">{workflow.sources.map(source => <li key={`${source.role}-${source.path}`}><a className="rs-link" href={sourceUrl(source.path)}>{source.path}</a><span>{source.role}</span></li>)}</ul>
  </WorkflowShell>;
}
