import { pageMetadata } from "@/lib/page-metadata";
import Link from "next/link";
import type { Metadata } from "next";
import { chrome } from "@/app/site.stylex";
import { sx } from "@/lib/sx";
import { orderedInterfaces } from "./catalog";
import { InterfaceCrop } from "./crops";
import { InterfacesNav } from "./nav";
import { interfaces as ifx } from "./interfaces.stylex";
import { DOOR } from "../specimen";
import { starterByInterface } from "../starters/catalog";
import "./interfaces.css";

export const metadata: Metadata = pageMetadata("/interfaces", {
  title: "Interfaces",
  description: "Try working interface studies and download each as a standalone Vite and React project. Components, styles, source and setup notes included.",
  alternates: { canonical: `${DOOR}/interfaces/` },
});

export default function InterfacesPage() {
  const cover = sx("cover", chrome.cover);
  return (
    <div {...sx("if-index", ifx.index)}>
      <InterfacesNav />
      <main id="main" {...sx("site-content-wide", chrome.contentWide)}>
        <header className={`${cover.className} if-index-cover`} style={cover.style}>
          <h1 className="rs-t-display">Interfaces</h1>
          <p className="rs-t-sub">See what you can build with Vlak.</p>
          <p className="if-index-intro">Working studies, from a conversation to a complete workspace. Try each interface or download it as a standalone Vite and React project, with source, styles, assets and setup notes included.</p>
          <div className="if-index-links"><Link className="rs-link-underline" href="/docs/">Start building <span aria-hidden="true">→</span></Link><a className="rs-link-underline" href="/design.md">Get design.md <span aria-hidden="true">↗</span></a></div>
        </header>
        <div {...sx("if-list", ifx.list)}>
          {orderedInterfaces.map((item, index) => {
            const starter = starterByInterface(item.slug)!;
            return <article key={item.slug} id={item.slug} aria-labelledby={`interface-${item.slug}-title`} {...sx("if-tile if-download-tile", ifx.tile)}>
              <Link className="if-tile-preview" href={starter.preview} tabIndex={-1} aria-hidden="true" prefetch={false}><InterfaceCrop slug={item.slug} /></Link>
              <div {...sx("if-tile-matter", ifx.tileMatter)}>
                <div className="if-tile-head">
                  <h2 id={`interface-${item.slug}-title`} {...sx("", ifx.tileTitle)}>{item.title}</h2>
                </div>
                <p {...sx("", ifx.tileVoice)}>{item.voice}</p>
                <div className="if-tile-foot"><span>{String(index + 1).padStart(2, "0")} / Interface study</span><span>Vite + React</span></div>
                <div className="if-tile-actions">
                  <Link className="if-tile-action" href={starter.preview} prefetch={false} aria-label={`Try ${item.title}`}>Try <span aria-hidden="true">→</span></Link>
                  <a className="if-tile-action if-tile-download" href={starter.download} download data-vlak-starter={item.slug} aria-label={`Download ${item.title} starter ZIP`}>Download <span aria-hidden="true">↓</span></a>
                  <a className="if-tile-action" href={starter.source} aria-label={`View ${item.title} source`}>View source <span aria-hidden="true">↗</span></a>
                </div>
              </div>
            </article>;
          })}
        </div>
      </main>
    </div>
  );
}
