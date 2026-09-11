import type { Metadata } from "next";
import { DocsShell } from "@/components/docs-shell";
import { pageMetadata } from "@/lib/page-metadata";
import { ModernizationBriefWorksheet } from "./worksheet";

export const metadata: Metadata = pageMetadata("/services", { title: "Workflow modernization", description: "A bounded service for improving one painful existing workflow while preserving necessary systems and integrations." });

export default function ServicesPage() {
  return <DocsShell title="Workflow modernization" summary="A bounded engagement for improving one painful existing workflow while keeping the systems that still matter.">
    <p className="rs-t-body">Vlak studies the real job, agrees a narrow boundary, and delivers a tested workflow with source, evidence, and a handoff. The service is for teams that can provide a live recurring task, a decision owner, representative fixtures, and a safe environment.</p>
    <h2 className="section-label">What the pilot covers</h2>
    <ul className="docs-list"><li>Observe the current process, including workarounds, exceptions, handoffs, and recovery.</li><li>Define states, inputs, outputs, preserved integrations, acceptance measures, and rollback.</li><li>Deliver code/reference, test evidence, limitations, and an operator runbook.</li><li>Run a controlled pilot with named users and record completion, assistance, recovery, and repeat use.</li></ul>
    <h2 className="section-label">Boundaries</h2>
    <p className="rs-t-body">The service modernizes one workflow. It does not promise a platform rewrite, replacement of every adjacent system, universal accessibility certification, or indefinite feature delivery. The partner remains responsible for production credentials, backups, retention, downstream systems, and domain decisions unless a separate managed-service responsibility is written into the proposal.</p>
    <h2 className="section-label">Who does what</h2>
    <p className="rs-t-body">The user performs the work. The buyer funds and accepts the outcome. The operator maintains the deployed workflow and integrations. Vlak may design, implement, facilitate, and document the pilot. Delivery source and reference examples are distinct from ongoing monitoring, updates, incident response, and user support.</p>
    <h2 className="section-label">Start with a brief</h2>
    <p className="rs-t-body">Use the local worksheet to name the problem and make the pilot reviewable. It validates required fields and exports Markdown or portable JSON. Reopening creates a non-destructive candidate for confirmation.</p>
    <ModernizationBriefWorksheet />
    <h2 className="section-label">Service templates</h2>
    <p className="rs-t-body">Use the proposal, discovery, acceptance, handoff, and support templates when a real engagement is scoped.</p>
    <ul className="docs-list"><li><a className="rs-link" href="/docs/services/proposal.md">Proposal template</a></li><li><a className="rs-link" href="/docs/services/discovery.md">Discovery guide</a></li><li><a className="rs-link" href="/docs/services/acceptance.md">Acceptance record</a></li><li><a className="rs-link" href="/docs/services/handoff.md">Handoff record</a></li><li><a className="rs-link" href="/docs/services/support.md">Support and offboarding</a></li></ul>
  </DocsShell>;
}
