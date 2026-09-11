"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MobileToc } from "@/components/toc-mobile";
import { navStyles } from "@/components/docs-nav/docs-nav.stylex";
import { sx } from "@/lib/sx";

const links = [
  { href: "/workflows", title: "Workflow kits" },
  { href: "/workflows/record-review", title: "Record review example" },
  { href: "/workflows/record-review/manifest", title: "Record review manifest" },
  { href: "/workflows/action-approval", title: "Action approval example" },
  { href: "/workflows/action-approval/manifest", title: "Action approval manifest" },
  { href: "/workflows/schedule-editing", title: "Schedule editing example" },
  { href: "/workflows/schedule-editing/manifest", title: "Schedule editing manifest" },
] as const;

function here(pathname: string, href: string) {
  return pathname === href || pathname === `${href}/`;
}

export function WorkflowNav() {
  const pathname = usePathname();
  const contents = links.map(link => <Link key={link.href} href={link.href} className="toc-mobile-item" aria-current={here(pathname, link.href) ? "page" : undefined}>{link.title}</Link>);
  return <>
    <div {...sx("toc-rail", navStyles.rail)}><nav {...sx("toc", navStyles.toc)} aria-label="Workflow kits">{links.map(link => <Link key={link.href} href={link.href} {...sx("toc-item", navStyles.item)} aria-current={here(pathname, link.href) ? "page" : undefined}>{link.title}</Link>)}</nav></div>
    <MobileToc label="Workflow kits">{contents}</MobileToc>
  </>;
}
