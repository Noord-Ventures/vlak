import Link from "next/link";
import { DocsShell } from "@/components/docs-shell";
import { StructuredData, breadcrumbData } from "@/components/structured-data";
import { pageMetadata } from "@/lib/page-metadata";
import { HOST } from "../specimen";
import { updateEntries } from "./entries";

export const metadata = pageMetadata("/updates", {
  title: "Updates",
  description: "Follow Vlak package releases, interface studies, and source updates. Subscribe by RSS or watch releases on GitHub.",
}, { searchTitle: "Releases and updates · Vlak" });

const dateLabel = (date: string) => new Intl.DateTimeFormat("en", {
  year: "numeric", month: "long", day: "numeric", timeZone: "Europe/Amsterdam",
}).format(new Date(date));

export default function UpdatesPage() {
  return <DocsShell title="Updates" summary="Package releases, interface studies, and changes to the source.">
    <StructuredData value={breadcrumbData([
      { name: "Vlak", url: `${HOST}/` },
      { name: "Updates", url: `${HOST}/updates/` },
    ])} />
    <p className="rs-t-body"><a className="rs-link" href="/rss.xml">Subscribe by RSS</a> · <a className="rs-link" href="https://github.com/Noord-Ventures/vlak/releases">Follow GitHub releases</a></p>
    <p className="rs-t-body">Add <a className="rs-link" href="/rss.xml">vlak.dev/rss.xml</a> to your feed reader. On GitHub, use Watch → Custom → Releases for package release notifications. Site and source updates may arrive between package versions; each entry identifies what changed and where it is available.</p>
    {updateEntries.map(entry => <article key={entry.id} id={entry.id}>
      <h2 className="section-label"><a className="rs-link" href={`#${entry.id}`}>{entry.title}</a></h2>
      <p className="rs-t-caption"><time dateTime={entry.publishedAt}>{dateLabel(entry.publishedAt)}</time> · {entry.kind}</p>
      <p className="rs-t-body">{entry.summary}</p>
      <ul className="docs-list">{entry.changes.map(change => <li key={change}>{change}</li>)}</ul>
      <ul className="docs-list">{entry.links.map(link => <li key={link.href}><Link className="rs-link" href={link.href}>{link.label}</Link></li>)}<li><a className="rs-link" href={entry.source.href}>{entry.source.label}</a></li></ul>
    </article>)}
  </DocsShell>;
}
