import type { Metadata } from "next";
import { HOST, LAW, WORD } from "@/app/specimen";

type DiscoveryOptions = {
  /** Search and sharing title. The visible page heading remains authored in the page. */
  searchTitle?: string;
  imagePath?: string;
};

function discoveryTitle(path: string, metadata: Metadata): string {
  const authored = typeof metadata.title === "string"
    ? metadata.title
    : metadata.title && "absolute" in metadata.title
      ? metadata.title.absolute
      : WORD;
  if (path === "/") return `${WORD} · React design system`;
  if (path === "/components") return `React components · ${WORD}`;
  if (path.startsWith("/components/")) return `Accessible React ${authored} component · ${WORD}`;
  if (path === "/interfaces") return `Interface studies · ${WORD}`;
  if (path.startsWith("/interfaces/")) return `${authored} interface study · ${WORD}`;
  if (path === "/docs") return `React design system documentation · ${WORD}`;
  if (path.startsWith("/docs/")) return `${authored} documentation · ${WORD}`;
  return authored === WORD ? WORD : `${authored} · ${WORD}`;
}

/** Describe the same authored page to browsers, search engines and shared links. */
export function pageMetadata(path: string, metadata: Metadata, options: DiscoveryOptions = {}): Metadata {
  const canonical = new URL(`${path.replace(/\/+$/, "")}/`, HOST).href;
  const title = options.searchTitle ?? discoveryTitle(path, metadata);
  const description = metadata.description ?? LAW;
  const family = ["about", "components", "docs", "interfaces"].find(name => path === `/${name}` || path.startsWith(`/${name}/`));
  const prefix = family ? `/${family}` : "";
  const imagePath = options.imagePath ?? (path.startsWith("/components/") ? `${path}/opengraph-image` : `${prefix}/opengraph-image`);
  const image = { url: imagePath, width: 1200, height: 630, alt: `${title}. ${description}` };

  return {
    ...metadata,
    title: { absolute: title },
    metadataBase: new URL(HOST),
    alternates: { ...metadata.alternates, canonical },
    openGraph: { type: "website", siteName: WORD, locale: "en", title, description, url: canonical, images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image.url] },
  };
}
