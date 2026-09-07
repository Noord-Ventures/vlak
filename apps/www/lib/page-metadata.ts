import type { Metadata } from "next";
import { HOST, LAW, WORD } from "@/app/specimen";

/** Describe the same authored page to browsers, search engines and shared links. */
export function pageMetadata(path: string, metadata: Metadata): Metadata {
  const canonical = new URL(`${path.replace(/\/+$/, "")}/`, HOST).href;
  const title = typeof metadata.title === "string"
    ? `${metadata.title} · ${WORD}`
    : metadata.title && "absolute" in metadata.title
      ? metadata.title.absolute
      : WORD;
  const description = metadata.description ?? LAW;
  const family = ["about", "components", "docs", "interfaces"].find(name => path === `/${name}` || path.startsWith(`/${name}/`));
  const prefix = family ? `/${family}` : "";
  const image = { url: `${prefix}/opengraph-image`, width: 1200, height: 630, alt: `${WORD}. ${LAW}` };

  return {
    ...metadata,
    metadataBase: new URL(HOST),
    alternates: { ...metadata.alternates, canonical },
    openGraph: { type: "website", siteName: WORD, locale: "en", title, description, url: canonical, images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image.url] },
  };
}
