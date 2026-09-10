import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/page-metadata";
import { chrome } from "@/app/site.stylex";
import { sx } from "@/lib/sx";
import { interfaceBySlug } from "../catalog";
import { InterfaceCrop } from "../crops";
import { InterfacesNav } from "../nav";
import { interfaces as ifx } from "../interfaces.stylex";
import "../interfaces.css";

export const metadata: Metadata = pageMetadata("/interfaces/mobile-os", {
  title: "Mobile OS",
  description: "Choose the iOS or Android interface study. Each platform now has its own workspace and preview link.",
  robots: { index: false, follow: true },
});

// A static chooser preserves old links on any export host without guessing a platform.
export default function Page() {
  return (
    <div {...sx("if-index", ifx.index)}>
      <InterfacesNav />
      <main id="main" {...sx("site-content-wide", chrome.contentWide)}>
        <header {...sx("cover", chrome.cover)}>
          <h1 className="rs-t-display">Mobile OS</h1>
          <p className="rs-t-sub">iOS and Android now have their own interface studies.</p>
        </header>
        <div {...sx("if-list", ifx.list)}>
          {(["android", "ios"] as const).map(slug => {
            const study = interfaceBySlug(slug)!;
            return (
              <Link key={slug} href={`/interfaces/${slug}/`} {...sx("if-tile", ifx.tile)}>
                <InterfaceCrop slug={slug} />
                <div {...sx("if-tile-matter", ifx.tileMatter)}>
                  <div className="if-tile-head"><h2 {...sx("", ifx.tileTitle)}>{study.title}</h2><span aria-hidden="true">↗</span></div>
                  <p {...sx("", ifx.tileVoice)}>{study.voice}</p>
                  <div className="if-tile-foot"><span>Explore study</span><span aria-hidden="true">→</span></div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
