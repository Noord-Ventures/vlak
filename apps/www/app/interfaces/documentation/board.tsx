"use client";

import * as React from "react";
import { Button, Field, FieldLabel, Icon, Popover, PopoverBody, PopoverTitle, ToggleGroup } from "@noorddev/vlak-react";
import { SettingsMark } from "@/components/settings-mark";
import { guides, type Guide, type GuideCategory } from "./data";
import { ArticleContents } from "./minimap";
import "./scene.css";

type Category = "All guides" | GuideCategory;
const categories: Category[] = ["All guides", "Foundations", "Components", "Patterns"];
const appearances = [{ value: "system", label: "Auto" }, { value: "light", label: "Light" }, { value: "dark", label: "Dark" }];

function GuideMeta({ guide }: { guide: Guide }) {
  return <div className="dc-meta"><span><Icon name="tag" size={12} />{guide.category}</span><span><Icon name="calendar" size={12} />{guide.date}</span><span><Icon name="clock" size={12} />{guide.readTime} read</span></div>;
}

function ReadingPlate() {
  return <figure className="dc-plate"><svg viewBox="0 0 592 208" role="img" aria-label="Three document sheets arranged along a shared reading grid">
    <g fill="none" stroke="currentColor" strokeWidth="1" strokeLinejoin="round">
      <path opacity=".18" d="M0 176H592M92 18V196M276 18V196M296 18V196M480 18V196" />
      <path fill="var(--bg)" d="M89 146L183 40 326 77 230 183Z" /><path d="M183 40L183 47 320 83M99 145L186 50 310 82" opacity=".5" />
      <path d="M170 78L248 99M161 89L258 115M151 100L248 126M141 111L211 130M131 123L206 143" opacity=".65" />
      <path fill="var(--bg)" d="M241 128L305 39 455 82 391 172Z" /><path d="M305 39V45L449 88M249 127L308 49 440 87" opacity=".5" />
      <path d="M299 73L363 92M291 84L409 118M282 96L401 130M274 108L354 131" opacity=".65" />
      <path d="M440 148L472 153 476 164M471 153L438 159" /><circle cx="80" cy="166" r="3" /><circle cx="490" cy="167" r="3" />
    </g>
  </svg><figcaption>Reading order, carried by the same underlying structure</figcaption></figure>;
}

export function DocumentationBoard() {
  const [selected, setSelected] = React.useState<string | null>(null);
  const [category, setCategory] = React.useState<Category>("All guides");
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [appearance, setAppearance] = React.useState("system");
  const [scale, setScale] = React.useState(100);
  const [contentsNearby, setContentsNearby] = React.useState(false);
  const [contentsFocused, setContentsFocused] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState("");
  const [progress, setProgress] = React.useState(0);
  const [announcement, setAnnouncement] = React.useState("");
  const root = React.useRef<HTMLElement>(null);
  const scroll = React.useRef<HTMLDivElement>(null);
  const rail = React.useRef<HTMLElement>(null);
  const title = React.useRef<HTMLHeadingElement>(null);
  const menuButton = React.useRef<HTMLButtonElement>(null);
  const positions = React.useRef(new Map<string, number>());
  const pendingFocus = React.useRef<string | null>(null);
  const firstRender = React.useRef(true);
  const id = React.useId().replaceAll(":", "");
  const article = guides.find(guide => guide.id === selected);
  const visibleGuides = category === "All guides" ? guides : guides.filter(guide => guide.category === category);
  const key = selected ?? `index-${category}`;
  const sectionId = (section: string) => `dc-${id}-${selected}-${section}`;

  React.useEffect(() => {
    const element = root.current;
    if (!element) return;
    const observer = new ResizeObserver(entries => { if ((entries[0]?.contentRect.width ?? 0) > 840) setMenuOpen(false); });
    observer.observe(element); return () => observer.disconnect();
  }, []);

  function rememberPosition() { positions.current.set(key, scroll.current?.scrollTop ?? 0); }
  function openGuide(guide: Guide) {
    rememberPosition(); pendingFocus.current = "title"; setMenuOpen(false); setSelected(guide.id);
    setActiveSection(""); setAnnouncement(`Opened ${guide.title}`);
  }
  function showIndex(nextCategory = category) {
    rememberPosition(); pendingFocus.current = nextCategory === category && selected ? selected : "title";
    setMenuOpen(false); setSelected(null); setCategory(nextCategory); setAnnouncement(`Showing ${nextCategory.toLowerCase()}`);
  }
  const trackReading = React.useCallback(() => {
    const container = scroll.current;
    if (!container) return;
    positions.current.set(key, container.scrollTop);
    setProgress(Math.round(container.scrollTop / Math.max(1, container.scrollHeight - container.clientHeight) * 100));
    if (article) {
      const headings = [...container.querySelectorAll<HTMLElement>("[data-section]")];
      const top = container.getBoundingClientRect().top + 76;
      const atEnd = container.scrollTop + container.clientHeight >= container.scrollHeight - 1;
      const active = atEnd ? headings.at(-1) : headings.filter(heading => heading.getBoundingClientRect().top <= top).at(-1);
      setActiveSection(active?.dataset.section ?? "");
    }
  }, [key, article]);
  React.useLayoutEffect(() => {
    if (scroll.current) scroll.current.scrollTop = positions.current.get(key) ?? 0;
    trackReading();
    if (firstRender.current) { firstRender.current = false; return; }
    if (pendingFocus.current && pendingFocus.current !== "title") root.current?.querySelector<HTMLButtonElement>(`[data-guide="${pendingFocus.current}"]`)?.focus({ preventScroll: true });
    else title.current?.focus({ preventScroll: true });
    pendingFocus.current = null;
  }, [key, trackReading]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: Text size changes section positions without changing the guide.
  React.useLayoutEffect(() => { trackReading(); }, [scale, trackReading]);

  function readSection(section: string) {
    setMenuOpen(false); setActiveSection(section);
    requestAnimationFrame(() => {
      const heading = section ? root.current?.querySelector<HTMLElement>(`#${sectionId(section)}`) : title.current, container = scroll.current;
      if (!heading || !container) return;
      const top = container.scrollTop + heading.getBoundingClientRect().top - container.getBoundingClientRect().top - 24;
      container.scrollTo({ top: section ? top : 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" }); heading.focus({ preventScroll: true });
    });
  }
  const navigation = (compact = true) => article ? <ArticleContents key={article.id} guide={article} activeSection={activeSection} textScale={scale / 100} compact={compact} expanded={contentsNearby || contentsFocused} onReadSection={readSection} onBack={() => showIndex()} /> : <nav aria-label="Guide categories" className="dc-navigation">{categories.map(item => <Button key={item} variant="ghost" aria-current={category === item ? "page" : undefined} onClick={() => showIndex(item)}>{item}</Button>)}<p className="dc-rail-note">Working notes<br />for building interfaces</p></nav>;
  const next = article ? guides[(guides.indexOf(article) + 1) % guides.length]! : null;

  return <section ref={root} className="dc" aria-label="Documentation reading workspace" data-view={article ? "article" : "index"} data-appearance={appearance} data-menu={menuOpen} data-scrolled={progress > 0} style={{ "--dc-scale": scale / 100 } as React.CSSProperties} onPointerMove={event => {
    if (!article || event.pointerType === "touch") return;
    const rect = rail.current?.getBoundingClientRect();
    setContentsNearby(Boolean(rect?.width && event.clientX >= rect.left && event.clientX <= rect.right + 36 && event.clientY >= rect.top && event.clientY <= rect.bottom));
  }} onPointerLeave={() => setContentsNearby(false)} onKeyDown={event => {
    if (event.key === "Escape" && menuOpen) { event.preventDefault(); setMenuOpen(false); menuButton.current?.focus(); }
  }}>
    <header className="dc-chrome"><Button variant="ghost" className="dc-home" onClick={() => showIndex("All guides")} aria-label={article ? "Back to all guides" : "All documentation guides"}><Icon name={article ? "arrow-left" : "file-text"} size={16} /><span>Field guide</span></Button><div className="dc-reader-path"><span>Documentation</span>{article && <><span>/</span><strong>{article.title}</strong></>}</div><div className="dc-header-actions"><Popover align="end" className="dc-settings" aria-label="Reader settings" trigger={<><SettingsMark /><span className="dc-sr">Reader settings</span></>}>
      <PopoverTitle>Reader settings</PopoverTitle><PopoverBody>Preferences apply to this reader.</PopoverBody>
      <div className="dc-settings-fields">
        <Field><FieldLabel>Appearance</FieldLabel><ToggleGroup aria-label="Reader appearance" value={appearance} options={appearances} onValueChange={setAppearance} /></Field>
        <Field><FieldLabel id={`dc-text-size-${id}`}>Text size</FieldLabel><div className="dc-text-size" role="group" aria-labelledby={`dc-text-size-${id}`}><Button variant="ghost" aria-label="Decrease text size" disabled={scale <= 90} onClick={() => setScale(value => Math.max(90, value - 10))}><Icon name="minus" size={16} /></Button><output aria-label="Text size percentage">{scale}%</output><Button variant="ghost" aria-label="Increase text size" disabled={scale >= 140} onClick={() => setScale(value => Math.min(140, value + 10))}><Icon name="plus" size={16} /></Button></div></Field>
      </div>
    </Popover><Button ref={menuButton} variant="ghost" className="dc-menu-trigger" aria-label={menuOpen ? "Close reading menu" : "Open reading menu"} aria-expanded={menuOpen} aria-controls={`dc-menu-${id}`} onClick={() => setMenuOpen(value => !value)}><Icon name={menuOpen ? "chevron-up" : "chevron-down"} size={16} /></Button></div></header>
    <div className="dc-workspace" inert={menuOpen || undefined}><aside ref={rail} className="dc-rail" onFocusCapture={() => setContentsFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setContentsFocused(false); }}>{navigation()}</aside><div className="dc-scroll" ref={scroll} onScroll={trackReading}><div className="dc-sheet">
      <header className={`dc-hero${article ? " dc-article-hero" : ""}`}><span className="dc-eyebrow">{article ? article.category : "Documentation"}</span><h2 ref={title} tabIndex={-1}>{article?.title ?? (category === "All guides" ? "Guides." : `${category}.`)}</h2>{article && <p className="dc-article-meta"><span>{article.date}</span><span>·</span><span>{article.readTime} read</span></p>}</header>
      {article ? <article className="dc-article" aria-label={article.title}><p className="dc-lead">{article.lead}</p><ReadingPlate />{article.sections.map(section => <section className="dc-article-section" key={section.id}><h3 id={sectionId(section.id)} data-section={section.id} tabIndex={-1}>{section.title}</h3>{section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}{section.points && <ul>{section.points.map(point => <li key={point}>{point}</li>)}</ul>}</section>)}<aside className="dc-more"><span>Keep reading</span><Button variant="ghost" onClick={() => openGuide(next!)}><span><strong>{next!.title}</strong><span>{next!.description}</span></span><Icon name="arrow-right" size={16} /></Button></aside><nav className="dc-article-end" aria-label="Reading navigation"><Button variant="ghost" onClick={() => showIndex()}><Icon name="arrow-left" size={12} />Back to guides</Button><Button variant="ghost" onClick={() => { scroll.current?.scrollTo({ top: 0 }); title.current?.focus({ preventScroll: true }); }}>Back to top<Icon name="arrow-up" size={12} /></Button></nav></article> : <ol className="dc-guide-list">{visibleGuides.map(guide => <li key={guide.id}><div><h3><Button variant="ghost" data-guide={guide.id} onClick={() => openGuide(guide)}>{guide.title}</Button></h3><p>{guide.description}</p></div><GuideMeta guide={guide} /></li>)}</ol>}
      <footer className="dc-page-end"><span>Field guide / 2026</span><span>Original sample documentation</span></footer>
    </div></div></div>
    {menuOpen && <div className="dc-menu" id={`dc-menu-${id}`}>{navigation(false)}</div>}
    <footer className="dc-footer"><span>{article ? article.category : `${visibleGuides.length} guides`}</span><span>{article ? `${Math.min(100, progress)}% read` : "A place to read and return"}</span></footer><span className="dc-sr" role="status">{announcement}</span>
  </section>;
}
