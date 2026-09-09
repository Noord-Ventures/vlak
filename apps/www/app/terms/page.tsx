import { pageMetadata } from "@/lib/page-metadata";
import type { Metadata } from "next";
import { DocsShell } from "@/components/docs-shell";
import { DOOR } from "../specimen";

export const metadata: Metadata = pageMetadata("/terms", {
  title: "Terms",
  description: "Terms for using Vlak's website, hosted MCP server, and software.",
  alternates: { canonical: `${DOOR}/terms/` },
});

export default function TermsPage() {
  return (
    <DocsShell title="Terms" summary="Terms for using Vlak's website, hosted MCP server, and software. Last updated 9 September 2026.">
      <h2 className="section-label">The service</h2>
      <p className="rs-t-body">
        Noord.dev publishes Vlak. These terms cover vlak.dev and the public Vlak MCP endpoint. By using either service, you agree to use it lawfully and not to disrupt, overload, probe, or misuse it.
      </p>

      <h2 className="section-label">Open-source software</h2>
      <p className="rs-t-body">
        Vlak&apos;s published source and packages are licensed under the MIT License. That license governs copying, modification, distribution, and use of the software. These service terms do not take away the rights granted by the MIT License.
      </p>

      <h2 className="section-label">What the MCP server does</h2>
      <p className="rs-t-body">
        The hosted MCP server is unauthenticated and read-only. It returns Vlak component records, documentation, props, design tokens, and installation instructions. It cannot edit a repository, send a message, make a purchase, or change an external service. You remain responsible for reviewing generated code, installation commands, accessibility, security, and fitness for your project before shipping it.
      </p>

      <h2 className="section-label">Availability and changes</h2>
      <p className="rs-t-body">
        Vlak is a work in progress. Components, documentation, tools, endpoints, and availability may change, contain errors, respond slowly, or be withdrawn. Noord.dev may limit access needed to protect the service or other users. When practical, material changes will be documented in the repository or on vlak.dev.
      </p>

      <h2 className="section-label">No warranty</h2>
      <p className="rs-t-body">
        To the maximum extent allowed by law, the hosted service and its content are provided as available, without warranties of accuracy, completeness, availability, merchantability, fitness for a particular purpose, or non-infringement. Nothing on Vlak is legal, medical, financial, or other professional advice.
      </p>

      <h2 className="section-label">Liability</h2>
      <p className="rs-t-body">
        To the maximum extent allowed by law, Noord.dev is not liable for indirect, incidental, special, consequential, or punitive loss, or for loss of data, revenue, profit, goodwill, or business opportunity arising from use of the hosted service. Rights that cannot lawfully be excluded remain unaffected.
      </p>

      <h2 className="section-label">Privacy and contact</h2>
      <p className="rs-t-body">
        The{" "}<a className="rs-link" href="/privacy/">privacy page</a>{" "}explains how Vlak handles request and analytics data. Questions about these terms can be sent to{" "}
        <a className="rs-link" href="mailto:hello@noord.vc">hello@noord.vc</a>.
      </p>
    </DocsShell>
  );
}
