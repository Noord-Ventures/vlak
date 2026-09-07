import { pageMetadata } from "@/lib/page-metadata";
import Link from "next/link";
import type { Metadata } from "next";
import { vlakCategories, catalogComponents, domainCollections } from "@noorddev/vlak";
import { Icon, iconGroups } from "@noorddev/vlak-react";
import { chrome } from "@/app/site.stylex";
import { DocsNav } from "@/components/docs-nav";
import { Preview } from "@/components/preview";
import { sx } from "@/lib/sx";
import { categoryTitle } from "@/lib/category-title";
import { DOOR } from "../specimen";

function iconGroupSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export const metadata: Metadata = pageMetadata("/components", {
  title: "Components",
  description: `${catalogComponents.length} components, each with a live preview, install path, props, keyboard behavior, and accessibility notes.`,
  alternates: { canonical: `${DOOR}/components/` },
});

export default function ComponentsPage() {
  return (
    <div className="site-layout catalog-page">
      <DocsNav />
      <main id="main" {...sx("site-content", chrome.catalogContent)}>
        <header {...sx("cover", chrome.cover)}>
          <h1 className="rs-t-display">Components</h1>
          <p className="rs-t-sub">
            {catalogComponents.length} components, each with a live preview, install path, props, keyboard behavior, and accessibility notes.
          </p>
        </header>
        {vlakCategories.map((category) => {
          if (category === "icons") {
            return (
              <section key={category} id={category}>
                <h2 className="rs-t-title catalog-group">Icons</h2>
                <div {...sx("gallery", chrome.gallery)}>
                  {iconGroups.map((group) => (
                    <div key={group.title} {...sx("gallery-item", chrome.galleryItem)}>
                      <div {...sx("gallery-demo", chrome.galleryDemo)}>
                        <div className="preview-cluster" style={{ flexWrap: "wrap", justifyContent: "center", maxWidth: 280 }}>
                          {group.names.slice(0, 8).map((name) => (
                            <Icon key={name} name={name} size={16} />
                          ))}
                        </div>
                      </div>
                      <div {...sx("gallery-meta", chrome.galleryMeta)}>
                        <h3>
                          <Link
                            href={`/components/icons#${iconGroupSlug(group.title)}`}
                            className="gallery-item-link"
                          >
                            {group.title}
                          </Link>
                        </h3>
                        <p>{group.names.length} marks on a 16px viewBox, drawn with 1px currentColor strokes.</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          }
          const collection = domainCollections.find(item => item.name === category);
          const items = catalogComponents.filter((c) => c.category === category);
          if (items.length === 0) return null;
          return (
            <section key={category} id={category}>
              <h2 className="rs-t-title catalog-group">
                {categoryTitle(category)}
              </h2>
              {category === "health" && (
                <p className="rs-t-body">
                  Readings, daily routines, and care workflows. <Link href="/docs/health" className="rs-link">Building health software</Link>
                </p>
              )}
              {collection && <p className="rs-t-body">{collection.description} <Link href={`/docs/${category}`} className="rs-link">Read the collection guide</Link></p>}
              <div {...sx("gallery", chrome.gallery)}>
                {items.map((c) => (
                  <div key={c.name} {...sx("gallery-item", chrome.galleryItem)}>
                    <div {...sx("gallery-demo", chrome.galleryDemo)}>
                      <Preview name={c.name} snippet={c.snippet} />
                    </div>
                    <div {...sx("gallery-meta", chrome.galleryMeta)}>
                      <h3>
                        <Link href={`/components/${c.name}`} className="gallery-item-link">
                          {c.title}
                        </Link>
                      </h3>
                      <p>{c.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}
