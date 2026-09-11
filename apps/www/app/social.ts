import type { Metadata } from "next";
import { DOOR, HOST, LAW, WORD } from "./specimen";

const title = WORD;
const description = LAW;
const image = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: `${WORD}. ${LAW}`,
};

/** Shared card. Title is the word. Description is the law. Image is the poster. */
export const social: Metadata = {
  metadataBase: new URL(HOST),
  title: {
    default: title,
    template: `%s · ${WORD}`,
  },
  description,
  applicationName: WORD,
  alternates: {
    types: { "application/rss+xml": [{ url: "/rss.xml", title: "Vlak updates" }] },
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    title,
    description,
    url: DOOR,
    siteName: WORD,
    locale: "en",
    type: "website",
    images: [image],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [image.url],
  },
};
