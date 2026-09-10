import { interfaceBySlug } from "../interfaces/catalog";
import { FILMED_INTERFACE_SLUGS } from "../interfaces/films";
import { HOST } from "../specimen";

export const dynamic = "force-static";

function xml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}

export function GET() {
  const entries = FILMED_INTERFACE_SLUGS.map((slug) => {
    const item = interfaceBySlug(slug);
    if (!item) throw new Error(`Missing interface film record: ${slug}`);
    return `  <url>
    <loc>${xml(`${HOST}/interfaces/${slug}/`)}</loc>
    <video:video>
      <video:thumbnail_loc>${xml(`${HOST}/interfaces/films/posters/${slug}.jpg`)}</video:thumbnail_loc>
      <video:title>${xml(`${item.title} interface film`)}</video:title>
      <video:description>${xml(item.law)}</video:description>
      <video:content_loc>${xml(`${HOST}/interfaces/films/${slug}.mp4`)}</video:content_loc>
      <video:duration>20</video:duration>
      <video:family_friendly>yes</video:family_friendly>
    </video:video>
  </url>`;
  }).join("\n");

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${entries}
</urlset>\n`, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}

