"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MobileToc } from "@/components/toc-mobile";
import { sx } from "@/lib/sx";
import { interfaces } from "./catalog";
import { interfaces as ifx } from "./interfaces.stylex";

function here(pathname: string, href: string) {
  return pathname === href || pathname === `${href}/`;
}

function navigationLabel(label: string) {
  const labels: Record<string, string> = {
    "Genome mapping workspace": "Genome Mapping",
    "Protein sequence workbench": "Protein Sequence",
  };
  return labels[label] ?? label.replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

const navInterfaces = [...interfaces].sort((a, b) =>
  navigationLabel(a.what).localeCompare(navigationLabel(b.what), "en", { numeric: true, sensitivity: "base" }),
);

function currentLabel(pathname: string) {
  if (here(pathname, "/interfaces")) return "Interfaces";
  const slug = pathname.split("/")[2];
  return navigationLabel(interfaces.find((item) => item.slug === slug)?.what ?? "Interfaces");
}

export function InterfacesNav({ rail = true }: { rail?: boolean }) {
  const pathname = usePathname();
  const links = (
    <>
      <Link
        href="/interfaces"
        className="toc-mobile-item"
        aria-current={here(pathname, "/interfaces") ? "page" : undefined}
      >
        Index
      </Link>
      {navInterfaces.map((item) => {
        const href = `/interfaces/${item.slug}`;
        return (
          <Link
            key={item.slug}
            href={href}
            className="toc-mobile-item"
            aria-current={here(pathname, href) ? "page" : undefined}
          >
            {navigationLabel(item.what)}
          </Link>
        );
      })}
    </>
  );

  return (
    <>
      {rail ? (
        <nav {...sx("if-rail", ifx.rail)} aria-label="Interfaces">
          <Link href="/interfaces" {...sx("", ifx.railLink)} aria-current={here(pathname, "/interfaces") ? "page" : undefined}>
            Index
          </Link>
          {navInterfaces.map((item) => {
            const href = `/interfaces/${item.slug}`;
            return (
              <Link key={item.slug} href={href} {...sx("", ifx.railLink)} aria-current={here(pathname, href) ? "page" : undefined}>
                {navigationLabel(item.what)}
              </Link>
            );
          })}
        </nav>
      ) : null}
      <MobileToc label={currentLabel(pathname)} inset={!rail}>
        {links}
      </MobileToc>
    </>
  );
}
