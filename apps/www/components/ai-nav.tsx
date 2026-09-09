"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as stylex from "@stylexjs/stylex";
import { MobileToc } from "@/components/toc-mobile";
import type { AiPageGroup } from "@/lib/ai-catalog";
import { sx } from "@/lib/sx";
import { navStyles } from "./docs-nav/docs-nav.stylex";
import "./docs-nav/docs-nav.css";

const aiNavStyles = stylex.create({
  rail: { height: "100dvh", minHeight: 0, paddingBottom: 24 },
  toc: {
    minHeight: 0,
    maxHeight: "100%",
    flexShrink: 1,
    paddingTop: 4,
    paddingBottom: 16,
    maskImage: "none",
    scrollbarWidth: "thin",
    overscrollBehaviorY: "contain",
    scrollPaddingBlock: 16,
    "::-webkit-scrollbar": { display: "block", width: 6 },
  },
});

function here(pathname: string, href: string) {
  return pathname === href || pathname === `${href}/`;
}

/** AI pages share the docs rail and its keyboard-accessible phone contents. */
export function AiNav({ groups }: { groups: AiPageGroup[] }) {
  const pages = [{ href: "/ai", title: "Overview" }, ...groups.flatMap(group => group.pages)];
  const pathname = usePathname();
  const current = pages.find((page) => here(pathname, page.href));

  return (
    <>
      <div {...sx("toc-rail", navStyles.rail, aiNavStyles.rail)}>
        <nav {...sx("toc", navStyles.toc, aiNavStyles.toc)} aria-label="AI" tabIndex={0}>
          <Link href="/ai" {...sx("toc-item", navStyles.item)} aria-current={here(pathname, "/ai") ? "page" : undefined}>Overview</Link>
          {groups.map(group => <div className="ai-nav-group" key={group.title}><div className="ai-nav-label">{group.title}</div>{group.pages.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              {...sx("toc-item", navStyles.item)}
              aria-current={here(pathname, page.href) ? "page" : undefined}
            >
              {page.title}
            </Link>
          ))}</div>)}
        </nav>
      </div>
      <MobileToc label={current?.title ?? "AI"}>
        <Link href="/ai" className="toc-mobile-item" aria-current={here(pathname, "/ai") ? "page" : undefined}>Overview</Link>
        {groups.map(group => <div className="ai-nav-group" key={group.title}><div className="ai-nav-label">{group.title}</div>{group.pages.map((page) => (
          <Link
            key={page.href}
            href={page.href}
            className="toc-mobile-item"
            aria-current={here(pathname, page.href) ? "page" : undefined}
          >
            {page.title}
          </Link>
        ))}</div>)}
      </MobileToc>
    </>
  );
}
