import { HOST } from "../specimen";
import { updateEntries } from "../updates/entries";

export const dynamic = "force-static";

function xml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}

export function GET() {
  const items = updateEntries.map(entry => {
    const href = `${HOST}/updates/#${entry.id}`;
    const content = `<p>${xml(entry.summary)}</p><ul>${entry.changes.map(change => `<li>${xml(change)}</li>`).join("")}</ul><ul>${[...entry.links, entry.source].map(link => `<li><a href="${xml(new URL(link.href, HOST).href)}">${xml(link.label)}</a></li>`).join("")}</ul>`;
    return `    <item>
      <title>${xml(entry.title)}</title>
      <link>${xml(href)}</link>
      <guid isPermaLink="true">${xml(href)}</guid>
      <pubDate>${new Date(entry.publishedAt).toUTCString()}</pubDate>
      <category>${xml(entry.kind)}</category>
      <description>${xml(content)}</description>
    </item>`;
  }).join("\n");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Vlak updates</title>
    <link>${HOST}/updates/</link>
    <description>Package releases, interface studies, and source updates from Vlak.</description>
    <language>en</language>
    <atom:link href="${HOST}/rss.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date(updateEntries[0]!.publishedAt).toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>\n`, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
