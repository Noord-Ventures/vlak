import { pageMetadata } from "@/lib/page-metadata";
import type { Metadata } from "next";
import { CopyControl } from "@/components/code-block";
import { sx } from "@/lib/sx";
import { INSTALL, LAW, POSTER, WORD } from "./specimen";
import { SpecimenKit } from "./specimen-kit";
import { SpecimenPrinciples } from "./specimen-principles";
import { specimen } from "./specimen.stylex";
import "./specimen.css";

export const metadata: Metadata = pageMetadata("/", {
  title: { absolute: WORD },
  description: LAW,
});

export default function Home() {
  return (
    <main id="main" {...sx("specimen-page", specimen.page)} aria-label="Vlak specimen">
      <div {...sx("specimen", specimen.field)}>
        <section
          {...sx("specimen-cell specimen-cell-face", specimen.cell, specimen.cellTall)}
          aria-label="Face"
        >
          <p className="specimen-face">{WORD}</p>
        </section>

        <section
          {...sx("specimen-cell specimen-cell-law", specimen.cell, specimen.cellTall, specimen.cellEnd)}
        >
          <h1 className="specimen-law">{LAW}</h1>
        </section>

        <nav {...sx("specimen-start", specimen.start)} aria-label="Start with Vlak">
          <a {...sx("specimen-start-tile", specimen.startTile)} href="/starters/" data-start-path="prototype"><strong>Prototype <span aria-hidden="true">↗</span></strong><span>Run an interface and change it.</span></a>
          <a {...sx("specimen-start-tile", specimen.startTile)} href="/docs/agents/" data-start-path="agent"><strong>Use an agent <span aria-hidden="true">↗</span></strong><span>Connect the component docs and rules.</span></a>
          <a {...sx("specimen-start-tile", specimen.startTile)} href="#install-command" data-start-path="install"><strong>Install <span aria-hidden="true">↓</span></strong><span>Add Vlak to your project.</span></a>
        </nav>

        <section {...sx("specimen-cell specimen-cell-command", specimen.cell, specimen.cellCommand)}>
          <div className="specimen-command-copy" id="install-command">
            <div className="specimen-command-row">
              <p className="specimen-command">{INSTALL}</p>
              <CopyControl text={INSTALL} />
            </div>
            <p className="specimen-command-meta">
              <a href="/docs">Getting started</a>
              <span aria-hidden="true"> · </span>
              MIT
              <span aria-hidden="true"> · </span>
              <a href="/docs/choosing-vlak/">When to use Vlak</a>
            </p>
          </div>
        </section>

        <SpecimenPrinciples />

        <section {...sx("specimen-cell specimen-cell-note", specimen.cell, specimen.cellEnd)}>
          <p className="specimen-poster">{POSTER}</p>
        </section>

        <SpecimenKit />
      </div>
    </main>
  );
}
