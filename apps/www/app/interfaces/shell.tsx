import type { ReactNode } from "react";
import Link from "next/link";
import { chrome } from "@/app/site.stylex";
import { sx } from "@/lib/sx";
import { type InterfaceSlug, interfaceBySlug, interfaces as catalog, mobilePatterns } from "./catalog";
import { interfaces } from "./interfaces.stylex";
import { InterfacesNav } from "./nav";
import { StartBuilding } from "./start-building";

const sourceRoot = "https://github.com/Noord-Ventures/vlak/tree/main/apps/www/app/interfaces";

function sourceFor(slug: InterfaceSlug) {
  return `${sourceRoot}/${["graphics", "render", "drive", "orbit", "frontier", "platforms"].includes(slug) ? "concepts" : slug}`;
}

export function InterfaceShell({ slug, children }: { slug: InterfaceSlug; children: ReactNode }) {
  const proto = interfaceBySlug(slug)!;
  const ordered = [...catalog.slice(6), ...catalog.slice(0, 6)];
  const next = ordered[(ordered.findIndex((item) => item.slug === slug) + 1) % ordered.length]!;
  const source = sourceFor(slug);
  return (
    <div {...sx("if-index", interfaces.index)}>
      <InterfacesNav />
      <main id="main" {...sx("site-content-wide", chrome.contentWide)}>
        <section className="if-study" aria-labelledby={`${slug}-name`}>
          <header className="if-study-bar">
            <h1 id={`${slug}-name`}>{proto.title}</h1>
            <a className="rs-btn-primary if-build-link" href="#build-with-vlak">Build with Vlak <span aria-hidden="true">↓</span></a>
          </header>
          <div {...sx("if-specimen", interfaces.specimen, slug === "drive" && interfaces.vehicleSpecimen)}>{children}</div>
          <div className="if-study-caption"><p>{proto.use}</p><a href={source}>View source <span aria-hidden="true">↗</span></a></div>
        </section>
        <div className="if-detail-content">
          <section className="if-overview" aria-labelledby={`${slug}-overview`}>
            <div>
              <h2 id={`${slug}-overview`}>Inside the interface</h2>
              <p className="if-story">{proto.story}</p>
              <p className="if-demo-note">{proto.note}</p>
            </div>
            <div className="if-used-components">
              <h2>Components used</h2>
              <ul className="if-component-list">
                {proto.components.map((name) => (
                  <li key={name}><Link href={`/components/${name.toLowerCase().replaceAll(" ", "-").replace("icon", "icons")}/`}>
                    {name}
                  </Link></li>
                ))}
              </ul>
            </div>
          </section>
          <StartBuilding title={proto.title} slug={slug} source={source} />
          <section className="if-modifications" aria-labelledby={`${slug}-modifications`}>
            <h2 id={`${slug}-modifications`}>Component modifications</h2>
            <ul>
              {[...proto.modifications, mobilePatterns[slug]].map((modification) => (
                <li key={modification}>{modification}</li>
              ))}
            </ul>
          </section>
          <nav className="if-next-study" aria-label="Explore interfaces">
            <Link href="/interfaces/">All interfaces <span aria-hidden="true">↗</span></Link>
            <Link href={`/interfaces/${next.slug}/`}><span>Next study</span><strong>{next.title} <span aria-hidden="true">→</span></strong></Link>
          </nav>
        </div>
      </main>
    </div>
  );
}
