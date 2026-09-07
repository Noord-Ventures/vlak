"use client";

import * as React from "react";
import { Button, Icon } from "@noorddev/vlak-react";
import type { Guide } from "./data";

/** A compact document outline: approach or focus to read it, select a heading to keep it open. */
export function ArticleContents({ guide, activeSection, expanded, compact = true, textScale = 1, onReadSection, onBack }: {
  guide: Guide;
  activeSection: string;
  expanded: boolean;
  compact?: boolean;
  textScale?: number;
  onReadSection: (section: string) => void;
  onBack: () => void;
}) {
  const [pinned, setPinned] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);
  const [readingLines, setReadingLines] = React.useState<number[] | null>(null);
  const navigation = React.useRef<HTMLElement>(null);
  const toggle = React.useRef<HTMLButtonElement>(null);
  const contentsId = React.useId();
  const open = !compact || (!dismissed && (expanded || pinned));
  const headings = [{ id: "", title: guide.title, depth: 0 }, ...guide.sections.map(section => ({ id: section.id, title: section.title, depth: 1 }))];
  // Content estimates supply the first frame; after layout, each mark represents
  // one rendered line of the article rather than a fixed number per section.
  const charactersPerLine = Math.max(32, Math.round(76 / textScale));
  const outline = headings.flatMap((heading, index) => {
    const section = guide.sections[index - 1];
    const text = section ? [...section.paragraphs, ...(section.points ?? [])] : [guide.lead];
    const lineCount = readingLines?.[index] ?? text.reduce((count, paragraph) => count + Math.ceil(paragraph.length / charactersPerLine), 0);
    return [{ ...heading, key: heading.id, kind: "heading" }, ...Array.from({ length: lineCount }, (_, line) => ({ ...heading, depth: 2, key: `${heading.id}-line-${line}`, kind: "line" }))];
  });
  const currentIndex = Math.max(0, outline.findIndex(mark => mark.kind === "heading" && mark.id === activeSection));
  React.useEffect(() => {
    if (!compact) return;
    const article = navigation.current?.closest(".dc")?.querySelector(".dc-article");
    if (!article) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      if (!article.getBoundingClientRect().width) return;
      const countLines = (element: Element) => {
        const range = document.createRange();
        range.selectNodeContents(element);
        const rows: number[] = [];
        for (const rect of range.getClientRects()) {
          if (rect.width && rect.height && !rows.some(top => Math.abs(top - rect.top) < 2)) rows.push(rect.top);
        }
        return rows.length;
      };
      const lead = article.querySelector(".dc-lead");
      const sections = [...article.querySelectorAll(".dc-article-section")];
      const counts = [lead ? countLines(lead) : 0, ...sections.map(section => [...section.querySelectorAll("p, li")].reduce((count, paragraph) => count + countLines(paragraph), 0))];
      setReadingLines(previous => previous?.length === counts.length && previous.every((count, index) => count === counts[index]) ? previous : counts);
    };
    const request = () => { if (!frame) frame = requestAnimationFrame(measure); };
    const observer = new ResizeObserver(request);
    observer.observe(article);
    for (const paragraph of article.querySelectorAll(".dc-lead, .dc-article-section p, .dc-article-section li")) observer.observe(paragraph);
    request();
    return () => { observer.disconnect(); if (frame) cancelAnimationFrame(frame); };
  }, [compact]);
  React.useEffect(() => { if (!expanded) setDismissed(false); }, [expanded]);
  function collapse() { setPinned(false); setDismissed(true); }
  return <nav ref={navigation} aria-label="Guide contents" className="dc-navigation dc-contents" data-expanded={open} data-pinned={pinned} data-compact={compact} data-line-source={readingLines ? "layout" : "content"} style={{ "--dc-outline-height": `${outline.length * 10 + 24}px`, "--dc-outline-count": outline.length } as React.CSSProperties} onKeyDown={event => {
    if (compact && event.key === "Escape" && open) { event.preventDefault(); event.stopPropagation(); collapse(); toggle.current?.focus(); }
  }}>
    {compact ? <Button ref={toggle} variant="ghost" className="dc-outline-toggle" aria-label={pinned ? "Hide guide contents" : "Keep guide contents open"} aria-expanded={open} aria-controls={contentsId} onClick={() => { if (pinned) collapse(); else { setPinned(true); setDismissed(false); } }}><span className="dc-outline-title">Contents</span><span className="dc-outline-marks" aria-hidden="true">{outline.map((heading, index) => {
        const distance = Math.abs(index - currentIndex);
        const width = distance === 0 ? 52 : distance === 1 ? 28 : heading.kind === "heading" ? 24 : distance === 2 ? 20 : 12;
        return <span key={heading.key} data-kind={heading.kind} data-depth={heading.depth} data-current={heading.kind === "heading" && activeSection === heading.id} data-distance={distance} style={{ "--dc-mark-width": `${width}px` } as React.CSSProperties} />;
      })}</span></Button> : <span className="dc-rail-label">Contents</span>}
    <div className="dc-contents-body">
      <div className="dc-outline-reveal"><div><ol id={contentsId} className="dc-outline-links">{headings.map(heading => <li key={heading.id} data-depth={heading.depth}><Button variant="ghost" className="dc-section-link" aria-current={activeSection === heading.id ? "location" : undefined} onClick={() => { setPinned(true); setDismissed(false); onReadSection(heading.id); }}><span className="dc-section-label">{heading.title}</span></Button></li>)}</ol></div></div>
    </div>
    <Button variant="ghost" className="dc-rail-back" onClick={onBack}><Icon name="arrow-left" size={12} />All guides</Button>
  </nav>;
}
