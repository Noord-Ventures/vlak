"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { chrome } from "@/app/site.stylex";
import { sx } from "@/lib/sx";
import { docsPageForPath } from "@/lib/docs-navigation";

interface Crumb {
  label: string;
  href?: string;
}

type ComponentLabel = { name: string; title: string; category: string };

function trailFor(pathname: string, components: readonly ComponentLabel[], pages: Readonly<Record<string, string>>): Crumb[] {
  const parts = pathname.split("/").filter(Boolean);
  const trail: Crumb[] = [];
  if (parts.length === 0) {
    trail.push({ label: "Home" });
  } else if (parts[0] === "docs") {
    trail.push({ label: "Docs", href: "/docs" });
    const page = docsPageForPath(pathname);
    trail.push({ label: page?.title ?? "Getting started" });
  } else if (["workflows", "services", "showcase"].includes(parts[0]!)) {
    const page = docsPageForPath(pathname);
    trail.push({ label: page?.title ?? "Workflow kits" });
  } else if (parts[0] === "ai") {
    trail.push({ label: "AI", href: "/ai" });
    if (parts[1]) {
      const component = components.find((c) => c.name === parts[1] && c.category === "ai");
      trail.push({ label: parts[1] === "widgets" ? "Widget patterns" : component?.title ?? parts[1] });
    }
  } else if (parts[0] === "about") {
    trail.push({ label: "About" });
  } else if (parts[0] === "starters") {
    trail.push({ label: "Starters" });
  } else if (parts[0] === "updates") {
    trail.push({ label: "Updates" });
  } else if (parts[0] === "use-cases") {
    trail.push({ label: "Use cases", href: "/use-cases" });
    if (parts[1]) trail.push({ label: pages[`/use-cases/${parts[1]}`] ?? parts[1] });
  } else if (parts[0] === "components") {
    trail.push({ label: "Components", href: "/components" });
    if (parts[1]) {
      const component = components.find((c) => c.name === parts[1]);
      trail.push({ label: component?.title ?? parts[1] });
    }
  } else if (parts[0] === "interfaces") {
    trail.push({ label: "Interfaces", href: "/interfaces" });
    if (parts[1]) {
      trail.push({ label: pages[`/interfaces/${parts[1]}`] ?? (parts[1] === "mobile-os" ? "Mobile OS" : parts[1]) });
    }
  }
  return trail;
}

/** Keep visible crumb boxes left of .corner-nav (gap ≥ 8px). Survives library CSS. */
function pinRootClearOfNav(root: HTMLElement) {
  const trail = document.querySelector<HTMLElement>(".site-crumb-bar .rs-crumbs");
  if (window.matchMedia("(max-width: 640px)").matches) {
    root.style.removeProperty("position");
    root.style.removeProperty("top");
    root.style.removeProperty("left");
    root.style.removeProperty("width");
    root.style.removeProperty("max-width");
    root.style.removeProperty("visibility");
    root.style.removeProperty("overflow");
    root.style.removeProperty("height");
    root.style.removeProperty("line-height");
    root.style.removeProperty("display");
    trail?.style.removeProperty("display");
    return;
  }
  if (trail) trail.style.setProperty("display", "none", "important");
  root.style.setProperty("display", "none", "important");
}

/**
 * The fixed top bar, on every page including Home and About.
 * Transparent at rest; once the cover scrolls away it gains the paper
 * background and its bottom hairline, and the breadcrumbs appear.
 */
export function CrumbBarClient({ components, pages }: { components: readonly ComponentLabel[]; pages: Readonly<Record<string, string>> }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const rootRef = React.useRef<HTMLAnchorElement>(null);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 110);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const pin = React.useCallback(() => {
    const root = rootRef.current;
    if (root) pinRootClearOfNav(root);
  }, []);

  React.useLayoutEffect(() => {
    pin();
    window.addEventListener("resize", pin);
    return () => window.removeEventListener("resize", pin);
  }, [pin, pathname, scrolled]);

  const trail = trailFor(pathname, components, pages);

  return (
    <nav
      {...sx(
        `rs-crumb-bar site-crumb-bar${scrolled ? " rs-crumb-bar-scrolled" : ""}`,
        chrome.crumbBar,
        scrolled && chrome.crumbBarScrolled,
      )}
      aria-label="Breadcrumbs"
      data-home={pathname === "/"}
    >
      {/* Root sits outside the inner row so the library’s 1024 inset
          (margin-left: 204px) cannot place “Vlak” on the nav column. */}
      <Link prefetch={false} ref={rootRef} className="rs-crumb-root site-crumb-root" href="/">
        Vlak
      </Link>
      <div className="rs-crumb-bar-inner">
        {trail.length > 0 && (
          <p className="rs-crumbs">
            {trail.map((crumb, index) => {
              const last = index === trail.length - 1;
              return (
                <React.Fragment key={index}>
                  {index > 0 && (
                    <span className="rs-crumbs-sep" aria-hidden="true">
                      /
                    </span>
                  )}
                  {last ? (
                    <span className="rs-crumbs-here">{crumb.label}</span>
                  ) : crumb.href ? (
                    <Link prefetch={false} className="rs-crumbs-link" href={crumb.href}>
                      {crumb.label}
                    </Link>
                  ) : (
                    <span>{crumb.label}</span>
                  )}
                </React.Fragment>
              );
            })}
          </p>
        )}
      </div>
    </nav>
  );
}
