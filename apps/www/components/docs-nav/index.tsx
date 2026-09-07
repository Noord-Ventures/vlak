"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { vlakCategories, catalogComponents, type VlakCategory } from "@noorddev/vlak";
import { iconGroups } from "@noorddev/vlak-react";
import { MobileToc } from "@/components/toc-mobile";
import { sx } from "@/lib/sx";
import { categoryTitle as sentence } from "@/lib/category-title";
import { navStyles } from "./docs-nav.stylex";
import "./docs-nav.css";

function here(pathname: string, href: string) {
  return pathname === href || pathname === `${href}/`;
}

function pageGroup(pathname: string): VlakCategory | null {
  const match = pathname.match(/^\/components\/([^/]+)\/?$/);
  if (!match) return pathname.startsWith("/components") ? vlakCategories[0]! : null;
  return catalogComponents.find((c) => c.name === match[1])?.category ?? vlakCategories[0]!;
}

const groups = vlakCategories.filter((category) =>
  catalogComponents.some((c) => c.category === category),
);

function iconGroupSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function groupLinks(category: VlakCategory) {
  if (category === "icons") {
    return iconGroups.map((group) => ({
      key: group.title,
      title: group.title,
      href: `/components/icons#${iconGroupSlug(group.title)}`,
    }));
  }
  return catalogComponents
    .filter((c) => c.category === category)
    .map((c) => ({
      key: c.name,
      title: c.title,
      href: `/components/${c.name}`,
    }));
}

/** Docs pages in rail order. Components has its own rail. */
export const docsPages = [
  { href: "/docs", title: "Getting started" },
  { href: "/docs/frameworks", title: "Frameworks" },
  { href: "/docs/theming", title: "Theming" },
  { href: "/docs/tokens", title: "Tokens" },
  { href: "/docs/layers", title: "Layers" },
  { href: "/docs/stylex", title: "StyleX" },
  { href: "/docs/accessibility", title: "Accessibility" },
  { href: "/docs/health", title: "Health" },
  { href: "/docs/civic", title: "Civic" },
  { href: "/docs/science", title: "Science" },
  { href: "/docs/creative", title: "Creative tools" },
  { href: "/docs/engineering", title: "Industrial" },
  { href: "/docs/geospatial", title: "Geospatial" },
  { href: "/docs/robotics", title: "Robotics" },
  { href: "/docs/electronics", title: "Circuitry" },
  { href: "/docs/microbiology", title: "Microbiology" },
  { href: "/docs/agents", title: "Agents" },
] as const;

function docsLabel(pathname: string) {
  const page = docsPages.find((p) => here(pathname, p.href));
  if (page) return page.title;
  if (pathname.startsWith("/components/")) {
    const name = pathname.split("/")[2];
    return catalogComponents.find((c) => c.name === name)?.title ?? "Components";
  }
  return "Components";
}

type PointerPoint = { x: number; y: number };

function towardItems(origin: PointerPoint, previous: PointerPoint | null, point: PointerPoint, submenu: HTMLElement) {
  const bounds = submenu.getBoundingClientRect();
  const edge = submenu.firstElementChild?.getBoundingClientRect().left ?? bounds.left;
  const distance = edge - origin.x;
  if (distance <= 0 || point.x <= origin.x + 1 || point.x > edge || (previous && point.x < previous.x - 1)) return false;
  const progress = (point.x - origin.x) / distance;
  const top = origin.y + (bounds.top - 8 - origin.y) * progress;
  const bottom = origin.y + (bounds.bottom + 8 - origin.y) * progress;
  return point.y >= top && point.y <= bottom;
}

/**
 * Components rail: groups in the first 184, that group's items in the
 * second. Hover (and focus) fills the second column. The page's own
 * group stays selected so the column is never empty on load.
 * Every page level uses the shared rail inset: zero on compact
 * desktop, one module at ≥1440. Icons toc-sub lists iconGroups.
 * Under 900 the rail hides; a stacked 44pt picker takes its place.
 */
export function DocsNav() {
  const pathname = usePathname();
  const selected = pageGroup(pathname);
  const [preview, setPreview] = React.useState<VlakCategory | null>(null);
  const [openGroup, setOpenGroup] = React.useState<VlakCategory | null>(selected);
  const shown = preview ?? selected;
  const catalog = pathname.startsWith("/components");
  const submenu = React.useRef<HTMLElement>(null);
  const shownGroup = React.useRef(shown); shownGroup.current = shown;
  const pointer = React.useRef<{ origin: PointerPoint | null; previous: PointerPoint | null; timer: ReturnType<typeof setTimeout> | null }>({ origin: null, previous: null, timer: null });
  const clearPointer = React.useCallback(() => {
    if (pointer.current.timer !== null) clearTimeout(pointer.current.timer);
    pointer.current = { origin: null, previous: null, timer: null };
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: A new page in the same category must also clear pending pointer intent.
  React.useEffect(() => {
    clearPointer();
    setPreview(null);
    setOpenGroup(selected);
  }, [pathname, selected, clearPointer]);
  React.useEffect(() => clearPointer, [clearPointer]);

  const previewGroup = (category: VlakCategory, origin: PointerPoint | null = null) => {
    clearPointer();
    pointer.current.origin = origin;
    shownGroup.current = category;
    setPreview(category);
  };

  const followPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
    const point = { x: event.clientX, y: event.clientY };
    const target = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-category]") : null;
    const category = target?.dataset.category as VlakCategory | undefined;
    if (pointer.current.timer !== null) clearTimeout(pointer.current.timer);
    pointer.current.timer = null;
    if (category && event.currentTarget.contains(target)) {
      if (category === shownGroup.current) pointer.current.origin = point;
      else if (pointer.current.origin && submenu.current && towardItems(pointer.current.origin, pointer.current.previous, point, submenu.current)) {
        // Keep the current column while the pointer crosses other rows toward it.
        // A stationary hover still selects its row after a short intent window.
        pointer.current.timer = setTimeout(() => previewGroup(category, point), 300);
      } else previewGroup(category, point);
    } else if (submenu.current?.contains(event.target as Node)) pointer.current.origin = null;
    pointer.current.previous = point;
  };

  const leaveRail = (event: React.PointerEvent | React.FocusEvent) => {
    const next = "relatedTarget" in event ? event.relatedTarget : null;
    if (next instanceof Node && event.currentTarget.contains(next)) return;
    clearPointer();
    setPreview(null);
  };

  const docsLinks = (
    <>
      {docsPages.map((page) => (
        <Link
          key={page.href}
          href={page.href}
          className="toc-mobile-item"
          aria-current={here(pathname, page.href) ? "page" : undefined}
        >
          {page.title}
        </Link>
      ))}
    </>
  );

  const catalogMobile = (
    <>
      {groups.map((category) => {
        const items = groupLinks(category);
        const expanded = openGroup === category;
        return (
          <div key={category} className="toc-mobile-group">
            <div className="toc-mobile-row">
              <Link
                href={`/components#${category}`}
                className="toc-mobile-item"
                aria-current={selected === category ? "true" : undefined}
              >
                {sentence(category)}
              </Link>
              <button
                type="button"
                className="toc-mobile-more"
                aria-expanded={expanded}
                aria-label={expanded ? `Hide ${sentence(category)}` : `Show ${sentence(category)}`}
                onClick={() => setOpenGroup(expanded ? null : category)}
              >
                <span aria-hidden="true">{expanded ? "–" : "+"}</span>
              </button>
            </div>
            {expanded
              ? items.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    className="toc-mobile-item toc-mobile-sub"
                    aria-current={here(pathname, item.href) ? "page" : undefined}
                  >
                    {item.title}
                  </Link>
                ))
              : null}
          </div>
        );
      })}
    </>
  );

  if (!catalog) {
    return (
      <>
        <div {...sx("toc-rail", navStyles.rail)}>
          <nav {...sx("toc", navStyles.toc)} aria-label="Docs">
            {docsPages.map((page) => (
              <Link
                key={page.href}
                href={page.href}
                {...sx("toc-item", navStyles.item)}
                aria-current={here(pathname, page.href) ? "page" : undefined}
              >
                {page.title}
              </Link>
            ))}
          </nav>
        </div>
        <MobileToc label={docsLabel(pathname)}>{docsLinks}</MobileToc>
      </>
    );
  }

  const items = shown ? groupLinks(shown) : [];

  return (
    <>
      <div {...sx("toc-rail", navStyles.rail)} data-rail="catalog" onPointerMove={followPointer} onPointerLeave={leaveRail} onPointerCancel={clearPointer} onBlur={leaveRail}>
        <nav {...sx("toc", navStyles.toc)} data-toc="groups" aria-label="Component groups" onScroll={clearPointer}>
          {groups.map((category) => (
            <Link
              key={category}
              href={`/components#${category}`}
              {...sx("toc-item", navStyles.item)}
              aria-current={selected === category ? "true" : undefined}
              data-category={category}
              data-preview={shown === category ? "true" : undefined}
              onFocus={() => previewGroup(category)}
            >
              {sentence(category)}
            </Link>
          ))}
        </nav>

        <nav ref={submenu} {...sx("toc toc-sub", navStyles.toc, navStyles.sub)} data-toc="items" aria-label={shown ? sentence(shown) : "Components"}>
          {items.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              {...sx("toc-item", navStyles.item)}
              aria-current={here(pathname, item.href) ? "page" : undefined}
            >
              {item.title}
            </Link>
          ))}
        </nav>
      </div>
      <MobileToc label={docsLabel(pathname)}>{catalogMobile}</MobileToc>
    </>
  );
}
