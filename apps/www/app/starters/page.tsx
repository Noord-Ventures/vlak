import type { Metadata } from "next";
import { DocsShell } from "@/components/docs-shell";
import { pageMetadata } from "@/lib/page-metadata";
import { interfaceStarters } from "./catalog";
import { LegacyStartersRedirect } from "./legacy-redirect";

export const metadata: Metadata = pageMetadata("/interfaces", {
  title: "Interfaces",
  description: "Preview an interface and download its standalone Vite and React project.",
  robots: { index: false, follow: true },
});

export default function LegacyStartersPage() {
  return (
    <DocsShell title="Interfaces" summary="Starter downloads now live beside the interface previews.">
      <LegacyStartersRedirect />
      <p className="rs-t-body">
        <a className="rs-link" href="/interfaces/">Browse interfaces</a> to try a study or download its source.
      </p>
      <ul className="docs-list" aria-label="Choose an interface">
        {interfaceStarters.map(starter => (
          <li key={starter.slug}><a className="rs-link" href={`/interfaces/#${starter.slug}`}>{starter.title}</a></li>
        ))}
      </ul>
      <p className="rs-t-body">
        Looking for the small Vite or Next.js form example? They are in the{" "}
        <a className="rs-link" href="/docs/#base-examples">installation guide</a>.
      </p>
    </DocsShell>
  );
}
