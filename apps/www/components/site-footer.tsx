import Link from "next/link";
import { person } from "@/app/about/facts";
import { DOOR } from "@/app/specimen";
import { useCases } from "@/app/use-cases/catalog";
import { sx } from "@/lib/sx";
import { VlakMark } from "./vlak-mark";
import { footer } from "./site-footer.stylex";

const groups = [
  {
    id: "vlak",
    title: "Vlak",
    links: [
      { href: "/", title: "Home" },
      { href: "/about/", title: "About" },
      { href: "/updates/", title: "Updates" },
      { href: "/rss.xml", title: "RSS feed" },
      { href: "/privacy/", title: "Privacy" },
      { href: "/terms/", title: "Terms" },
      { href: DOOR, title: "vlak.dev" },
    ],
  },
  {
    id: "resources",
    title: "Resources",
    links: [
      { href: "/components/", title: "Components" },
      { href: "/ai/", title: "AI" },
      { href: "/interfaces/", title: "Interfaces" },
      { href: "/use-cases/", title: "Use cases" },
      { href: "/starters/", title: "Starters" },
      { href: "/workflows/", title: "Workflow kits" },
      { href: "/services/", title: "Workflow modernization" },
      { href: "/showcase/", title: "Built with Vlak" },
      { href: "/docs/", title: "Docs" },
      { href: person.repo, title: "GitHub" },
      { href: `${person.repo}/releases`, title: "GitHub releases" },
    ],
  },
  {
    id: "use-cases",
    title: "Use cases",
    links: [...useCases].sort((a, b) => a.title.localeCompare(b.title, "en")).map(useCase => ({
      href: `/use-cases/${useCase.slug}/`,
      title: useCase.title,
    })),
  },
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div {...sx("site-footer-inner", footer.inner)}>
        <div {...sx("site-footer-brand", footer.brand)} aria-hidden="true">
          <VlakMark />
        </div>
        {groups.map(group => (
          <nav key={group.id} aria-labelledby={`footer-${group.id}`} {...sx("site-footer-nav", footer.group, group.id === "use-cases" && footer.categories)}>
            <h2 id={`footer-${group.id}`} {...sx("site-footer-heading", footer.heading)}>{group.title}</h2>
            <ul {...sx("site-footer-links", footer.links, group.id === "use-cases" && footer.categoryLinks)}>
              {group.links.map(link => (
                <li key={link.href} {...sx("", footer.item)}>
                  <Link prefetch={false} href={link.href} {...sx("site-footer-link", footer.link)}>{link.title}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
        <div {...sx("site-footer-about", footer.about)}>
          <p>
            Vlak was designed and built at <a href="https://noord.dev">Noord</a> in Alkmaar by <a href="https://renatovaldes.com">Renn</a>.
          </p>
          <p>A modernist method translated into practical constraints for product interfaces.</p>
          <p>MIT-licensed. React, CSS, source, and machine-readable data.</p>
        </div>
      </div>
    </footer>
  );
}
