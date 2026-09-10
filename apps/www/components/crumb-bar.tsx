"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { vlakComponents } from "@noorddev/vlak";
import { chrome } from "@/app/site.stylex";
import { interfaceBySlug } from "@/app/interfaces/catalog";
import { sx } from "@/lib/sx";

interface Crumb {
  label: string;
  href?: string;
}

function trailFor(pathname: string): Crumb[] {
  const parts = pathname.split("/").filter(Boolean);
  const trail: Crumb[] = [];
  if (parts.length === 0) {
    trail.push({ label: "Home" });
  } else if (parts[0] === "docs") {
    trail.push({ label: "Docs", href: "/docs" });
    if (parts[1] === "tokens") trail.push({ label: "Tokens" });
    else trail.push({ label: "Getting started" });
  } else if (parts[0] === "ai") {
    trail.push({ label: "AI", href: "/ai" });
    if (parts[1]) {
      const component = vlakComponents.find((c) => c.name === parts[1] && c.category === "ai");
      trail.push({ label: parts[1] === "widgets" ? "Widget patterns" : component?.title ?? parts[1] });
    }
  } else if (parts[0] === "about") {
    trail.push({ label: "About" });
  } else if (parts[0] === "components") {
    trail.push({ label: "Components", href: "/components" });
    if (parts[1]) {
      const component = vlakComponents.find((c) => c.name === parts[1]);
      trail.push({ label: component?.title ?? parts[1] });
    }
  } else if (parts[0] === "interfaces") {
    trail.push({ label: "Interfaces", href: "/interfaces" });
    if (parts[1]) {
      const proto = interfaceBySlug(parts[1]);
      trail.push({ label: proto?.title ?? (parts[1] === "mobile-os" ? "Mobile OS" : parts[1]) });
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
export function CrumbBar() {
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

  const trail = trailFor(pathname);

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
      <Link ref={rootRef} className="rs-crumb-root site-crumb-root" href="/">
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
                    <Link className="rs-crumbs-link" href={crumb.href}>
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
