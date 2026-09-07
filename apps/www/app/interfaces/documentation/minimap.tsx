"use client";

import * as React from "react";
import { Button, Icon } from "@noorddev/vlak-react";
import type { Guide } from "./data";

/** A compact heading outline: approach or focus to read it, select a heading to keep it open. */
export function ArticleContents({ guide, activeSection, expanded, compact = true, onReadSection, onBack }: {
  guide: Guide;
  activeSection: string;
  expanded: boolean;
  compact?: boolean;
  onReadSection: (section: string) => void;
  onBack: () => void;
}) {
  const [pinned, setPinned] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);
  const toggle = React.useRef<HTMLButtonElement>(null);
  const contentsId = React.useId();
  const open = !compact || (!dismissed && (expanded || pinned));
  const headings = [{ id: "", title: guide.title, depth: 0 }, ...guide.sections.map(section => ({ id: section.id, title: section.title, depth: 1 }))];
  React.useEffect(() => { if (!expanded) setDismissed(false); }, [expanded]);
  function collapse() { setPinned(false); setDismissed(true); }
  return <nav aria-label="Guide contents" className="dc-navigation dc-contents" data-expanded={open} data-pinned={pinned} data-compact={compact} onKeyDown={event => {
    if (compact && event.key === "Escape" && open) { event.preventDefault(); event.stopPropagation(); collapse(); toggle.current?.focus(); }
  }}>
    {compact ? <Button ref={toggle} variant="ghost" className="dc-outline-toggle" aria-label={pinned ? "Hide guide contents" : "Keep guide contents open"} aria-expanded={open} aria-controls={contentsId} onClick={() => { if (pinned) collapse(); else { setPinned(true); setDismissed(false); } }}><span>Contents</span></Button> : <span className="dc-rail-label">Contents</span>}
    <div className="dc-contents-body">
      <div className="dc-outline-marks" aria-hidden="true">{headings.map(heading => <span key={heading.id} data-depth={heading.depth} data-current={activeSection === heading.id} />)}</div>
      <div className="dc-outline-reveal"><div><ol id={contentsId} className="dc-outline-links">{headings.map(heading => <li key={heading.id} data-depth={heading.depth}><Button variant="ghost" className="dc-section-link" aria-current={activeSection === heading.id ? "location" : undefined} onClick={() => { setPinned(true); setDismissed(false); onReadSection(heading.id); }}><span className="dc-section-label">{heading.title}</span></Button></li>)}</ol></div></div>
    </div>
    <Button variant="ghost" className="dc-rail-back" onClick={onBack}><Icon name="arrow-left" size={12} />All guides</Button>
  </nav>;
}
