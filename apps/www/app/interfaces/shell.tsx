import type { ReactNode } from "react";
import Link from "next/link";
import { chrome } from "@/app/site.stylex";
import { sx } from "@/lib/sx";
import { type InterfaceSlug, interfaceBySlug, orderedInterfaces, mobilePatterns } from "./catalog";
import { interfaces } from "./interfaces.stylex";
import { InterfacesNav } from "./nav";
import { StartBuilding } from "./start-building";
import { InterfacePreviewProvider, InterfacePreview, PreviewButton } from "./preview";

const sourceRoot = "https://github.com/Noord-Ventures/vlak/tree/main/apps/www/app/interfaces";

function sourceFor(slug: InterfaceSlug) {
  return `${sourceRoot}/${["graphics", "render", "drive", "orbit", "frontier", "platforms"].includes(slug) ? "concepts" : slug}`;
}

export function InterfaceShell({ slug, children }: { slug: InterfaceSlug; children: ReactNode }) {
  const proto = interfaceBySlug(slug)!;
  const workbench = ["microbiology", "genome", "protein", "robotics", "circuitry", "identity", "patient", "music", "render", "drive", "orbit", "line", "press", "wall", "night", "evening", "room", "graphics", "platforms", "mobile-os", "documentation", "music-player", "video-player", "desktop-os"].includes(slug);
  const ordered = orderedInterfaces;
  const next = ordered[(ordered.findIndex((item) => item.slug === slug) + 1) % ordered.length]!;
  const source = sourceFor(slug);
  return (
    <div {...sx("if-index", interfaces.index)}>
      <InterfacesNav />
      <main id="main" {...sx("site-content-wide", chrome.contentWide)}>
        <section className="if-study" aria-labelledby={`${slug}-name`}>
          <InterfacePreviewProvider slug={slug} title={proto.title}>
          <header className="if-study-bar">
            <h1 id={`${slug}-name`}>{proto.title}</h1>
            <div className="if-study-actions"><PreviewButton /><a className="rs-btn-primary if-build-link" href="#build-with-vlak">Build with Vlak <span aria-hidden="true">↓</span></a></div>
          </header>
          <InterfacePreview><div {...sx(`if-specimen${workbench ? " if-workbench" : ""}`, interfaces.specimen, workbench && interfaces.workbenchSpecimen)}>{children}</div></InterfacePreview>
          <div className="if-study-caption"><p>{proto.use}</p><a href={source}>View source <span aria-hidden="true">↗</span></a></div>
          </InterfacePreviewProvider>
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
              {slug === "drive" && <p className="if-asset-credit"><a href="https://sketchfab.com/3d-models/2022-land-rover-range-rover-evoque-034600db0cc94d64a7f3ccb19c7799fa" target="_blank" rel="noreferrer">2022 Land Rover Range Rover Evoque</a> by <a href="https://sketchfab.com/tonielpro520" target="_blank" rel="noreferrer">tonielpro520</a>, licensed under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>. Original geometry retained, with simplified source contours and monochrome materials.</p>}
              {slug === "render" && <p className="if-asset-credit"><a href="https://sketchfab.com/3d-models/radio-t3-aad3d54384904cfc9b3df8791d254c5c" target="_blank" rel="noreferrer">Radio T3</a> model by <a href="https://sketchfab.com/ludwigangulodi" target="_blank" rel="noreferrer">ludwigangulodi</a>, licensed under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>. Geometry repacked and monochrome materials applied for Vlak. Product design: <a href="https://www.moma.org/collection/works/4134" target="_blank" rel="noreferrer">Dieter Rams and Hochschule für Gestaltung, Ulm, 1958</a>.</p>}
              {slug === "frontier" && <p className="if-asset-credit"><a href="https://sketchfab.com/3d-models/bust-of-athena-6f372d03e69b48ee8901bdc6e48f17b5" target="_blank" rel="noreferrer">Bust of Athena</a> by <a href="https://sketchfab.com/yugengen" target="_blank" rel="noreferrer">yugengen</a>, licensed under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>. Adapted into an animated contour drawing for Vlak.</p>}
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
            <Link href={`/interfaces/${next.slug}/`}><span>Next study</span><strong>{next.title}<span className="if-next-arrow" aria-hidden="true">→</span></strong></Link>
          </nav>
        </div>
      </main>
    </div>
  );
}
