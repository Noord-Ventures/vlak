import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/page-metadata";
import { DocsShell } from "@/components/docs-shell";
import { useCases } from "./catalog";

export const metadata: Metadata = pageMetadata("/use-cases", {
  title: "Use cases",
  description: "Patterns and components for agent, data-heavy, scientific, healthcare, and industrial software.",
}, { searchTitle: "React design system use cases · Vlak" });

export default function UseCasesPage() {
  return (
    <DocsShell title="Use cases" summary="Components and interface studies grouped by the work they support.">
      {useCases.map(useCase => (
        <section key={useCase.slug}>
          <h2 className="section-label"><Link className="rs-link" href={`/use-cases/${useCase.slug}/`}>{useCase.title}</Link></h2>
          <p className="rs-t-body">{useCase.summary}</p>
        </section>
      ))}
    </DocsShell>
  );
}
