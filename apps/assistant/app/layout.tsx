import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@noorddev/vlak-react/css";
import "@noorddev/vlak/css/components.css";
import "katex/dist/katex.min.css";
import "./shell.css";

const title = "Live AI assistant reference app · Vlak";
const description = "Try Vlak's React AI components with a live model, file attachments, saved conversations, and tools that ask for approval before making changes.";

export const metadata: Metadata = {
  metadataBase: new URL("https://assistant.vlak.dev"),
  title,
  description,
  alternates: { canonical: "https://assistant.vlak.dev/" },
  robots: { index: false, follow: true },
  openGraph: {
    type: "website", siteName: "Vlak", url: "https://assistant.vlak.dev/",
    title, description,
    images: [{ url: "https://vlak.dev/ai/opengraph-image", width: 1200, height: 630, alt: "Vlak AI components for React" }],
  },
  twitter: {
    card: "summary_large_image", title, description,
    images: ["https://vlak.dev/ai/opengraph-image"],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
