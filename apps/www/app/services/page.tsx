import type { Metadata } from "next";
import { DocsShell } from "@/components/docs-shell";
import { pageMetadata } from "@/lib/page-metadata";
import { ModernizationBriefWorksheet } from "./worksheet";
import styles from "./services.module.css";

export const metadata: Metadata = pageMetadata("/services", { title: "Workflow modernization", description: "A bounded service for improving one painful existing workflow while preserving necessary systems and integrations." });

export default function ServicesPage() {
  return <DocsShell title="Workflow modernization" summary="A bounded engagement for improving one painful existing workflow while keeping the systems that still matter.">
    <p className="rs-t-body">Vlak studies the real job, agrees a narrow boundary, and delivers a tested workflow with source, evidence, and a handoff. The service is for teams that can provide a live recurring task, a decision owner, representative fixtures, and a safe environment.</p>
    <section className={styles.showcase} aria-label="Illustrative modernization workflow">
      <div className={styles.showcaseIntro}><span className="section-label">A bounded workflow, made legible</span><p className="rs-t-body">The work starts with the existing record and ends with an owned, reviewable handoff.</p><a className={`rs-btn rs-btn-primary ${styles.primaryAction}`} href="#brief-worksheet-title">Start with a brief <span aria-hidden="true">→</span></a></div>
      <section className={styles.workflowFrame} aria-label="Illustrative record review flow">
        <div className={styles.frameHeader}><span>Operational record review</span><span>Example state map</span></div>
        <div className={styles.recordFlow}>
          <div className={styles.recordList}><span className={styles.frameLabel}>Incoming records</span><div className={styles.recordRow}><span><b>R-1042</b><small>North wall sensor check</small></span><em>Needs information</em></div><div className={styles.recordRow}><span><b>R-1043</b><small>Quarterly access review</small></span><em data-tone="ready">Ready for review</em></div><div className={styles.recordRow}><span><b>R-1044</b><small>Archive retention change</small></span><em>Needs information</em></div></div>
          <div className={styles.reviewHandoff}>
            <div className={styles.reviewCard}><span className={styles.frameLabel}>Review decision</span><strong>R-1043 · Quarterly access review</strong><p>Required evidence is present. The reviewer confirms the scoped change against revision 12.</p><div className={styles.stateLine}><span>Ready for review</span><span aria-hidden="true">→</span><b>Approved</b></div></div>
            <div className={styles.handoffCard}><span className={styles.frameLabel}>Owned handoff</span><strong>Decision packet</strong><dl><div><dt>Destination</dt><dd>Operations queue</dd></div><div><dt>Evidence</dt><dd>Revision 13 + audit note</dd></div><div><dt>Recovery</dt><dd>Reopen prior revision</dd></div></dl></div>
          </div>
        </div>
      </section>
      <section className={styles.packetFrame} aria-label="Illustrative brief and handoff preview">
        <div className={styles.frameHeader}><span>From brief to handoff</span><span>What gets agreed</span></div>
        <div className={styles.packetGrid}><div><span className={styles.frameLabel}>Scope brief</span><h2>Access review exception path</h2><p>One weekly review queue. Preserve the directory, approval record, and operator rollback path.</p><ul><li>Named users and decision owner</li><li>Representative fixtures and baseline</li><li>Acceptance and rollback measure</li></ul></div><div className={styles.packetDivider} aria-hidden="true" /><div><span className={styles.frameLabel}>Handoff packet</span><h2>Ready for the operator</h2><p>Source, setup, tested cases, known limits, and a runbook for the agreed support window.</p><div className={styles.packetMeta}><span>Source + provenance</span><span>Verification evidence</span><span>Rollback steps</span></div></div></div>
      </section>
    </section>
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
