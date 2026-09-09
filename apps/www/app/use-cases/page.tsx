import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/page-metadata";
import { DocsNav } from "@/components/docs-nav";
import { chrome } from "@/app/site.stylex";
import { sx } from "@/lib/sx";
import { InterfaceCrop } from "@/app/interfaces/crops";
import { interfaces } from "@/app/interfaces/interfaces.stylex";
import { useCases } from "./catalog";
import "../interfaces/interfaces.css";

export const metadata: Metadata = pageMetadata("/use-cases", {
  title: "Use cases",
  description: "Components and interface studies for enterprise, consumer, agent, data-heavy, scientific, healthcare, and industrial software.",
}, { searchTitle: "React design system use cases · Vlak" });

export default function UseCasesPage() {
  return (
    <div className="site-layout catalog-page">
      <DocsNav />
      <main id="main" {...sx("site-content", chrome.catalogContent)}>
        <header {...sx("cover", chrome.cover)}>
          <h1 className="rs-t-display">Use cases</h1>
          <p className="rs-t-sub">Components and interface studies grouped by the work they support.</p>
        </header>
        <div {...sx("if-list", interfaces.list)}>
          {useCases.map(useCase => (
            <Link key={useCase.slug} href={`/use-cases/${useCase.slug}/`} aria-labelledby={`${useCase.slug}-title`} {...sx("if-tile", interfaces.tile)}>
              <InterfaceCrop slug={useCase.interfaceSlugs[0]} />
              <div {...sx("if-tile-matter", interfaces.tileMatter)}>
                <div className="if-tile-head">
                  <h2 id={`${useCase.slug}-title`} {...sx("", interfaces.tileTitle)}>{useCase.title}</h2>
                  <span aria-hidden="true">↗</span>
                </div>
                <p {...sx("", interfaces.tileVoice)}>{useCase.summary}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
