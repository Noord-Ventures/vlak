import type { Metadata } from "next";
import Link from "next/link";
import { DocsShell } from "@/components/docs-shell";
import { ChoosingExample } from "@/components/docs-examples/guides";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata("/docs/choosing-vlak", {
  title: "Choosing Vlak",
  description: "When to use Vlak, when to use Radix or shadcn, and how its React, CSS, StyleX, registry, CLI, and MCP surfaces differ.",
}, { searchTitle: "Vlak vs shadcn, Radix, and preset UI libraries · Vlak" });

export default function ChoosingVlakPage() {
  return (
    <DocsShell title="Choosing Vlak" summary="Use the system that matches the amount of product judgment you want to keep.">
      <ChoosingExample />
      <h2 className="section-label">Choose Vlak</h2>
      <ul className="docs-list">
        <li>You want strong typographic, spacing, and interaction rules before choosing a finished product skin.</li>
        <li>You are building dense, technical, scientific, healthcare, industrial, or agent-driven software.</li>
        <li>You need React, plain CSS, vendored StyleX source, and machine-readable component data to share one source.</li>
        <li>You expect to modify the parts and keep the underlying rules.</li>
      </ul>
      <h2 className="section-label">Choose something else</h2>
      <p className="rs-t-body">If you want a preset solution for every screen, use Radix, shadcn, or another established component library. Their ecosystems, examples, and community coverage are broader. Vlak is younger, less complete, and may still be buggy or slow in development.</p>
      <h2 className="section-label">The boundary</h2>
      <p className="rs-t-body">Vlak supplies components and rules for finding a product’s tone without making the interface itself the first decision. It is not a promise that every product category already has a finished template.</p>
      <p className="rs-t-body"><Link className="rs-link" href="/components/">Inspect the components</Link>, <Link className="rs-link" href="/interfaces/">try the interface studies</Link>, or <Link className="rs-link" href="/docs/">start with an install path</Link>.</p>
    </DocsShell>
  );
}
