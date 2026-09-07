import { pageMetadata } from "@/lib/page-metadata";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { catalogComponents, domainCollections } from "@noorddev/vlak";
import { DocsShell } from "@/components/docs-shell";

export const dynamicParams = false;
export function generateStaticParams() {
  return domainCollections.map(collection => ({ collection: collection.name }));
}
type PageProps = { params: Promise<{ collection: string }> };
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { collection: name } = await params;
  const collection = domainCollections.find(item => item.name === name);
  if (!collection) notFound();
  return pageMetadata(`/docs/${name}`, { title: collection.title, description: collection.description });
}
export default async function CollectionPage({ params }: PageProps) {
  const { collection: name } = await params;
  const collection = domainCollections.find(item => item.name === name);
  if (!collection) notFound();
  return (
    <DocsShell title={collection.title} summary={collection.description}>
      <p className="rs-t-body">Build a specialised workspace with Vlak’s paper, ink, and hairlines. Each component includes a live specimen, a contextual example, and generated documentation for agents.</p>
      <p className="rs-t-body"><Link className="rs-link" href={`/components#${name}`}>Browse the collection</Link></p>
      {collection.groups.map(group => (
        <section key={group.title}>
          <h2 className="section-label">{group.title}</h2>
          <p className="rs-t-body">{group.description}</p>
          <ul className="docs-list">{group.components.map(name => {
            const component = catalogComponents.find(item => item.name === name)!;
            return <li key={name}><Link className="rs-link" href={`/components/${name}`}>{component.title}</Link>. {component.description}</li>;
          })}</ul>
        </section>
      ))}
      <h2 className="section-label">Data and action contracts</h2>
      {collection.contracts.map(rule => <section key={rule.title}><h3 className="docs-sub">{rule.title}</h3><p className="rs-t-body">{rule.description}</p></section>)}
      <p className="rs-t-body">Agents can read <a className="rs-link" href={`/docs/${name}.md`}>this guide as Markdown</a>, filter the MCP catalogue by <code className="rs-code">{name}</code>, or search for individual components through the CLI.</p>
    </DocsShell>
  );
}
