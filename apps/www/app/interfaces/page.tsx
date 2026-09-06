import Link from "next/link";
import type { Metadata } from "next";
import { chrome } from "@/app/site.stylex";
import { sx } from "@/lib/sx";
import { interfaces } from "./catalog";
import { InterfaceCrop } from "./crops";
import { InterfacesNav } from "./nav";
import { interfaces as ifx } from "./interfaces.stylex";
import { DOOR } from "../specimen";
import "./interfaces.css";

export const metadata: Metadata = {
  title: "Interfaces",
  description: "Explore working interface studies, inspect their components, and build your own with Vlak. React, CSS, and source included.",
  alternates: { canonical: `${DOOR}/interfaces/` },
};

export default function InterfacesPage() {
  const cover = sx("cover", chrome.cover);
  return (
    <div {...sx("if-index", ifx.index)}>
      <InterfacesNav />
      <main id="main" {...sx("site-content-wide", chrome.contentWide)}>
        <header className={`${cover.className} if-index-cover`} style={cover.style}>
          <h1 className="rs-t-display">Interfaces</h1>
          <p className="rs-t-sub">See what you can build with Vlak.</p>
          <p className="if-index-intro">Working studies, from a conversation to a complete workspace. Try the interactions, inspect the components, and take the source into your own project.</p>
          <div className="if-index-links"><Link href="/docs/">Start building <span aria-hidden="true">→</span></Link><a href="/design.md">Get the design brief <span aria-hidden="true">↗</span></a></div>
        </header>
        <div {...sx("if-list", ifx.list)}>
          {[...interfaces.slice(6), ...interfaces.slice(0, 6)].map((item, index) => (
            <Link key={item.slug} href={`/interfaces/${item.slug}`} {...sx("if-tile", ifx.tile)}>
              <InterfaceCrop slug={item.slug} />
              <div {...sx("if-tile-matter", ifx.tileMatter)}>
                <div className="if-tile-head">
                  <h2 {...sx("", ifx.tileTitle)}>{item.title}</h2>
                  <span aria-hidden="true">↗</span>
                </div>
                <p {...sx("", ifx.tileVoice)}>{item.voice}</p>
                <div className="if-tile-foot"><span>{String(index + 1).padStart(2, "0")} / Interface study</span><span>Explore study <span aria-hidden="true">→</span></span></div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
