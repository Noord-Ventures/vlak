"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { Collapsible } from "./collapsible";
import { Refs, RefItem } from "./refs";

export interface CitationSource { id: string; title: string; url: string; description?: string; quote?: string }
export interface SourcesProps extends Omit<React.DetailsHTMLAttributes<HTMLDetailsElement>, "title"> {
  sources: readonly CitationSource[];
  label?: string;
  defaultOpen?: boolean;
}
/** External web addresses and document-relative references; executable URL schemes are omitted. */
export function sourceHref(value: string): string | undefined {
  const input = value.trim();
  if (!input || Array.from(input).some(character => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127)) return undefined;
  try { const url = new URL(input, "https://vlak.invalid"); return url.protocol === "https:" || url.protocol === "http:" ? input : undefined; } catch { return undefined; }
}
const styles = stylex.create({
  root: { minWidth: 0, color: vlak.ink },
  list: { paddingInlineStart: "1.25rem" },
  link: { display: "flex", alignItems: "center", minHeight: vlak.hit, minWidth: vlak.hit, color: { default: vlak.gray, ":hover": { default: null, [mq.hover]: vlak.ink } }, textDecoration: "underline", textUnderlineOffset: 3, overflowWrap: "anywhere", ":focus-visible": { outlineWidth: 2, outlineStyle: "solid", outlineColor: vlak.ink, outlineOffset: 2 } },
  description: { margin: "0.25rem 0 0", fontSize: vlak.controlLabel, lineHeight: 1.45 },
  quote: { margin: "0.5rem 0 0", padding: "0.75rem", backgroundColor: vlak.tableAlt, borderRadius: vlak.radiusSm, color: vlak.ink, fontSize: vlak.controlFs, lineHeight: 1.45 },
  empty: { margin: 0, fontSize: vlak.controlFs, color: vlak.gray, lineHeight: 1.45 },
});

/** A counted native disclosure of application-supplied source links and optional quotes. */
export const Sources = React.forwardRef<HTMLDetailsElement, SourcesProps>(function Sources({ sources, label = "Sources", defaultOpen = false, className, style, ...props }, ref) {
  const root = rs(["rs-sources", className], styles.root);
  const list = rs(["rs-sources-list"], styles.list);
  const link = rs(["rs-sources-link"], styles.link);
  const description = rs(["rs-sources-description"], styles.description);
  const quote = rs(["rs-sources-quote"], styles.quote);
  const empty = rs(["rs-sources-empty"], styles.empty);
  return <Collapsible {...props} ref={ref} title={`${label} (${sources.length})`} defaultOpen={defaultOpen} className={root.className} style={{ ...root.style, ...style }}>
    {sources.length ? <Refs {...list}>{sources.map(source => <RefItem key={source.id}>
      {sourceHref(source.url) ? <a {...link} href={sourceHref(source.url)} target="_blank" rel="noopener noreferrer" aria-label={`${source.title} (new tab)`}>{source.title}<span aria-hidden="true"> ↗</span></a> : <span>{source.title}</span>}
      {source.description && <p {...description}>{source.description}</p>}
      {source.quote && <blockquote {...quote}>{source.quote}</blockquote>}
    </RefItem>)}</Refs> : <p {...empty}>No sources supplied.</p>}
  </Collapsible>;
});
