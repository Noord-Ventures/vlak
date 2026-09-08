import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { catalogComponents } from "@noorddev/vlak";
import { DocsShell } from "@/components/docs-shell";
import { StructuredData, breadcrumbData } from "@/components/structured-data";
import { pageMetadata } from "@/lib/page-metadata";
import { HOST } from "@/app/specimen";
import { interfaceBySlug } from "@/app/interfaces/catalog";
import { findUseCase, useCases } from "../catalog";

export const dynamicParams = false;

export function generateStaticParams() {
  return useCases.map(useCase => ({ slug: useCase.slug }));
}

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const useCase = findUseCase((await params).slug);
  if (!useCase) notFound();
  return pageMetadata(`/use-cases/${useCase.slug}`, {
    title: useCase.title,
    description: useCase.summary,
  }, { searchTitle: useCase.searchTitle });
}

export default async function UseCasePage({ params }: PageProps) {
  const useCase = findUseCase((await params).slug);
  if (!useCase) notFound();
  const components = useCase.componentNames.map(name => catalogComponents.find(component => component.name === name)).filter(Boolean);
  const studies = useCase.interfaceSlugs.map(interfaceBySlug).filter(Boolean);
  return (
    <DocsShell title={useCase.title} summary={useCase.summary}>
      <StructuredData value={[
        breadcrumbData([
          { name: "Vlak", url: `${HOST}/` },
          { name: "Use cases", url: `${HOST}/use-cases/` },
          { name: useCase.title, url: `${HOST}/use-cases/${useCase.slug}/` },
        ]),
        {
          "@context": "https://schema.org",
          "@type": "TechArticle",
          headline: useCase.searchTitle.replace(" · Vlak", ""),
          description: useCase.summary,
          url: `${HOST}/use-cases/${useCase.slug}/`,
          isPartOf: { "@id": `${HOST}/#website` },
        },
      ]} />
      <h2 className="section-label">Working rules</h2>
      <ul className="docs-list">{useCase.principles.map(rule => <li key={rule}>{rule}</li>)}</ul>
      <h2 className="section-label">Components</h2>
      <ul className="docs-list">{components.map(component => component ? (
        <li key={component.name}><Link className="rs-link" href={`/components/${component.name}/`}>{component.title}</Link>. {component.description}</li>
      ) : null)}</ul>
      <h2 className="section-label">Interfaces</h2>
      <ul className="docs-list">{studies.map(study => study ? (
        <li key={study.slug}><Link className="rs-link" href={`/interfaces/${study.slug}/`}>{study.title}</Link>. {study.law}</li>
      ) : null)}</ul>
      <p className="rs-t-body"><Link className="rs-link" href="/docs/">Install Vlak</Link> or inspect the linked pages for React, CSS, registry, keyboard, and accessibility details.</p>
    </DocsShell>
  );
}
