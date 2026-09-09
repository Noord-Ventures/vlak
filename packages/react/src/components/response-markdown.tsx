"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Streamdown, defaultRehypePlugins, useIsCodeFenceIncomplete, type Components } from "streamdown";
import { createMathPlugin } from "@streamdown/math";
import { cjk } from "@streamdown/cjk";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { HighlightedCode } from "./highlighted-code";
import { Button } from "./button";

export interface ResponseMarkdownProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  children: string;
  /** True while the application is receiving this response. */
  streaming?: boolean;
  math?: boolean;
  diagrams?: boolean;
  lineNumbers?: boolean;
  /** Only images from these exact origins load. The default renders image descriptions. */
  imageOrigins?: readonly string[];
  /** Origin used to resolve relative image addresses. */
  baseUrl?: string;
  /** Trusted application components override Vlak's Markdown elements. */
  components?: Components;
}

const mathPlugin = createMathPlugin({ errorColor: "currentColor" });
// Keep sanitization, omit raw HTML parsing, and validate links/images separately below.
const rehypePlugins = [defaultRehypePlugins.sanitize!];
const noImages: readonly string[] = [];
const noLinkModal = { enabled: false };

function safeUrl(value: string | undefined, kind: "link" | "image", origins: readonly string[], baseUrl?: string): string | undefined {
  if (!value || Array.from(value).some((character) => character.charCodeAt(0) <= 32 || character.charCodeAt(0) === 127)) return undefined;
  try {
    const parsed = new URL(value, baseUrl ?? "https://vlak.invalid");
    if (kind === "link") return ["https:", "http:", "mailto:"].includes(parsed.protocol) ? value : undefined;
    // Emit the address whose origin was checked, rather than letting the page resolve it again.
    return ["https:", "http:"].includes(parsed.protocol) && origins.includes(parsed.origin) ? parsed.href : undefined;
  } catch { return undefined; }
}

const styles = stylex.create({
  root: { minWidth: 0, width: "100%", color: vlak.ink, fontSize: "0.9375rem", lineHeight: 1.45, overflowWrap: "anywhere", whiteSpace: "normal" },
  paragraph: { margin: "0.75rem 0" },
  h1: { fontSize: "1.5rem", lineHeight: 1.25, fontWeight: 600, margin: "1.25rem 0 0.75rem" },
  h2: { fontSize: "1.25rem", lineHeight: 1.3, fontWeight: 600, margin: "1.25rem 0 0.75rem" },
  h3: { fontSize: "1.0625rem", lineHeight: 1.35, fontWeight: 600, margin: "1rem 0 0.5rem" },
  h4: { fontSize: "1rem", lineHeight: 1.35, fontWeight: 600, margin: "1rem 0 0.5rem" },
  h5: { fontSize: "0.9375rem", lineHeight: 1.4, fontWeight: 600, margin: "1rem 0 0.5rem" },
  h6: { fontSize: "0.9375rem", lineHeight: 1.4, fontWeight: 600, margin: "1rem 0 0.5rem" },
  strong: { fontWeight: 600 },
  list: { margin: "0.75rem 0", paddingInlineStart: "1.5rem" },
  item: { margin: "0.25rem 0", paddingInlineStart: "0.125rem" },
  quote: { margin: "1rem 0", padding: "0 1rem", borderInlineStartWidth: 2, borderInlineStartStyle: "solid", borderInlineStartColor: vlak.divider, color: vlak.gray },
  inline: { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: "0.875em", backgroundColor: vlak.tableAlt, color: vlak.ink, borderRadius: vlak.radiusSm, padding: "0.125rem 0.25rem" },
  link: { color: { default: vlak.gray, ":hover": { default: null, [mq.hover]: vlak.ink }, [mq.forcedColors]: "LinkText" }, textDecoration: "underline", textUnderlineOffset: "0.2em", outlineWidth: { default: 0, ":focus-visible": 2 }, outlineStyle: "solid", outlineColor: vlak.ink, outlineOffset: 2 },
  image: { display: "block", maxWidth: "100%", height: "auto", margin: "0.75rem 0", borderRadius: vlak.radiusSm },
  imageDescription: { color: vlak.gray, fontStyle: "italic" },
  tableRegion: { margin: "1rem 0", maxWidth: "100%", overflow: "auto", borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.divider, borderRadius: vlak.radiusSm, outlineWidth: { default: 0, ":focus-visible": 2 }, outlineStyle: "solid", outlineColor: vlak.ink, outlineOffset: 2 },
  table: { borderCollapse: "collapse", width: "100%", fontSize: "0.875rem" },
  th: { textAlign: "start", fontWeight: 600, backgroundColor: vlak.tableAlt, padding: "0.75rem", borderBottomWidth: vlak.hairline, borderBottomStyle: "solid", borderBottomColor: vlak.divider },
  td: { padding: "0.75rem", verticalAlign: "top", borderBottomWidth: vlak.hairline, borderBottomStyle: "solid", borderBottomColor: vlak.divider },
  rule: { borderWidth: 0, borderTopWidth: vlak.hairline, borderTopStyle: "solid", borderTopColor: vlak.divider, margin: "1.25rem 0" },
  diagram: { margin: "1rem 0", minWidth: 0, borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.divider, borderRadius: vlak.radiusSm, overflow: "hidden" },
  diagramViewport: { maxHeight: 480, overflow: "auto", padding: "1rem", outlineWidth: { default: 0, ":focus-visible": 2 }, outlineStyle: "solid", outlineColor: vlak.ink, outlineOffset: -2 },
  diagramArt: { minWidth: 0, width: "100%" },
  diagramHeader: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem", padding: "0.25rem 0.75rem", minHeight: 44, borderBottomWidth: vlak.hairline, borderBottomStyle: "solid", borderBottomColor: vlak.divider },
  diagramTitle: { flex: "1 1 auto", fontSize: "0.8125rem", color: vlak.gray },
  diagramAction: { width: 44, minWidth: 44, maxWidth: 44, height: 44, padding: 0, flexShrink: 0 },
  diagramIcon: { display: "block", width: 16, height: 16 },
  summary: { cursor: "pointer", minHeight: 44, boxSizing: "border-box", padding: "0.75rem", color: { default: vlak.gray, ":hover": { default: null, [mq.hover]: vlak.ink } }, fontSize: "0.8125rem", outlineWidth: { default: 0, ":focus-visible": 2 }, outlineStyle: "solid", outlineColor: vlak.ink, outlineOffset: -2 },
  feedback: { padding: "0.75rem", margin: 0, fontSize: "0.875rem", color: vlak.gray },
});

const paragraph = rs(["rs-response-markdown-paragraph"], styles.paragraph);
const h1 = rs(["rs-response-markdown-h1"], styles.h1);
const h2 = rs(["rs-response-markdown-h2"], styles.h2);
const h3 = rs(["rs-response-markdown-h3"], styles.h3);
const h4 = rs(["rs-response-markdown-h4"], styles.h4);
const h5 = rs(["rs-response-markdown-h5"], styles.h5);
const h6 = rs(["rs-response-markdown-h6"], styles.h6);
const strong = rs(["rs-response-markdown-strong"], styles.strong);
const list = rs(["rs-response-markdown-list"], styles.list);
const item = rs(["rs-response-markdown-item"], styles.item);
const quote = rs(["rs-response-markdown-quote"], styles.quote);
const inline = rs(["rs-response-markdown-inline"], styles.inline);
const link = rs(["rs-response-markdown-link"], styles.link);
const image = rs(["rs-response-markdown-image"], styles.image);
const imageDescription = rs(["rs-response-markdown-image-description"], styles.imageDescription);
const tableRegion = rs(["rs-response-markdown-table-region"], styles.tableRegion);
const table = rs(["rs-response-markdown-table"], styles.table);
const th = rs(["rs-response-markdown-th"], styles.th);
const td = rs(["rs-response-markdown-td"], styles.td);
const rule = rs(["rs-response-markdown-rule"], styles.rule);

let mermaidQueue = Promise.resolve();
async function renderDiagram(source: string, id: string, dark: boolean): Promise<string> {
  let result = "";
  const pending = mermaidQueue.then(async () => {
    const { default: mermaid } = await import("mermaid");
    mermaid.initialize({
      startOnLoad: false, securityLevel: "strict", suppressErrorRendering: true,
      maxTextSize: 30_000, maxEdges: 500, theme: "base", htmlLabels: false,
      themeVariables: {
        darkMode: dark, background: dark ? "#111111" : "#ffffff", fontFamily: "sans-serif",
        primaryColor: dark ? "#222222" : "#f5f5f5", primaryTextColor: dark ? "#f5f5f5" : "#111111",
        primaryBorderColor: dark ? "#999999" : "#777777", lineColor: dark ? "#999999" : "#777777",
        secondaryColor: dark ? "#1a1a1a" : "#eeeeee", tertiaryColor: dark ? "#2a2a2a" : "#ffffff",
        textColor: dark ? "#f5f5f5" : "#111111", actorTextColor: dark ? "#f5f5f5" : "#111111",
        signalTextColor: dark ? "#f5f5f5" : "#111111", labelTextColor: dark ? "#f5f5f5" : "#111111",
        noteTextColor: dark ? "#f5f5f5" : "#111111", noteBkgColor: dark ? "#222222" : "#eeeeee",
        edgeLabelBackground: dark ? "#222222" : "#eeeeee",
      },
      flowchart: { htmlLabels: false },
      secure: ["securityLevel", "startOnLoad", "maxTextSize", "maxEdges", "htmlLabels", "flowchart", "theme", "themeVariables", "themeCSS"],
    });
    result = (await mermaid.render(id, source)).svg;
  });
  mermaidQueue = pending.catch(() => undefined);
  await pending;
  return result;
}

function Diagram({ source, incomplete }: { source: string; incomplete: boolean }) {
  const id = `vlak-diagram-${React.useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const figureRef = React.useRef<HTMLElement>(null);
  const [dark, setDark] = React.useState<boolean | null>(null);
  const [rendered, setRendered] = React.useState<{ source: string; dark: boolean; svg?: string; error?: string } | null>(null);
  const [scale, setScale] = React.useState(1);
  // biome-ignore lint/correctness/useExhaustiveDependencies: Completing a fence mounts the figure and changes its theme ancestors.
  React.useEffect(() => {
    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    const read = () => {
      const explicit = (figureRef.current?.closest("[data-theme]") ?? document.documentElement).getAttribute("data-theme");
      setDark(explicit === "dark" || (explicit !== "light" && !!media?.matches));
    };
    read();
    const observer = new MutationObserver(read);
    for (let element: Element | null = figureRef.current ?? document.documentElement; element; element = element.parentElement) observer.observe(element, { attributes: true, attributeFilter: ["data-theme"] });
    media?.addEventListener("change", read);
    return () => { observer.disconnect(); media?.removeEventListener("change", read); };
  }, [incomplete]);
  React.useEffect(() => {
    let cancelled = false;
    if (dark !== null && !incomplete && source.length <= 30_000) void renderDiagram(source, id, dark).then((svg) => {
      if (!cancelled) setRendered({ source, dark, svg });
    }).catch(() => { if (!cancelled && dark !== null) setRendered({ source, dark, error: "The diagram could not be rendered. Its source is available below." }); });
    return () => { cancelled = true; };
  }, [source, id, incomplete, dark]);
  const root = rs(["rs-response-markdown-diagram"], styles.diagram);
  const viewport = rs(["rs-response-markdown-diagram-viewport"], styles.diagramViewport);
  const art = rs(["rs-response-markdown-diagram-art"], styles.diagramArt);
  const header = rs(["rs-response-markdown-diagram-header"], styles.diagramHeader);
  const title = rs(["rs-response-markdown-diagram-title"], styles.diagramTitle);
  const action = rs(["rs-response-markdown-diagram-action"], styles.diagramAction);
  const icon = rs(["rs-response-markdown-diagram-icon"], styles.diagramIcon);
  const summary = rs(["rs-response-markdown-summary"], styles.summary);
  const feedback = rs(["rs-response-markdown-feedback"], styles.feedback);
  if (incomplete) return <HighlightedCode code={source} language="mermaid" streaming />;
  const current = rendered?.source === source && rendered.dark === dark ? rendered : null;
  return <figure {...root} ref={figureRef}>
    <figcaption {...header}><span {...title}>Diagram</span>
      <Button {...action} variant="subtle" aria-label="Zoom out diagram" title="Zoom out diagram" disabled={!current?.svg || scale <= 0.5} onClick={() => setScale((value) => Math.max(0.5, value - 0.25))}><svg {...icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M5 12h14" /></svg></Button>
      <Button {...action} variant="subtle" aria-label="Zoom in diagram" title="Zoom in diagram" disabled={!current?.svg || scale >= 2} onClick={() => setScale((value) => Math.min(2, value + 0.25))}><svg {...icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M5 12h14M12 5v14" /></svg></Button>
      <Button variant="subtle" disabled={scale === 1} onClick={() => setScale(1)} aria-label="Reset diagram zoom">{Math.round(scale * 100)}%</Button>
    </figcaption>
    {current?.svg ? <div {...viewport} tabIndex={0} role="group" aria-label="Diagram preview"><div {...art} style={{ ...art.style, width: `${scale * 100}%` }}
      // Mermaid's strict renderer supplies sanitized SVG; model-authored HTML is never injected.
      dangerouslySetInnerHTML={{ __html: current.svg }} /></div> : <p {...feedback} role="status">{source.length > 30_000 ? "The diagram is too large to preview. Its source is available below." : current?.error ?? "Rendering diagram…"}</p>}
    <details><summary {...summary}>Diagram source</summary><HighlightedCode code={source} language="mermaid" filename="diagram.mmd" /></details>
  </figure>;
}

function MarkdownCode({ children, className, diagrams, lineNumbers }: { children?: React.ReactNode; className?: string; diagrams: boolean; lineNumbers: boolean }) {
  const incomplete = useIsCodeFenceIncomplete();
  const source = typeof children === "string" ? children : "";
  const language = /(?:^|\s)language-([^\s]+)/.exec(className ?? "")?.[1] ?? "text";
  if (diagrams && language.toLowerCase() === "mermaid") return <Diagram source={source} incomplete={incomplete} />;
  return <HighlightedCode code={source} language={language} streaming={incomplete} lineNumbers={lineNumbers} />;
}

/** Optional streaming Markdown, math, code, and diagrams with Vlak paint and safe default URLs. */
export const ResponseMarkdown = React.forwardRef<HTMLDivElement, ResponseMarkdownProps>(function ResponseMarkdown({
  children, streaming = false, math = true, diagrams = true, lineNumbers = false,
  imageOrigins = noImages, baseUrl, components, className, style, ...props
}, ref) {
  const root = rs(["rs-response-markdown", className], styles.root);
  const renderers = React.useMemo<Components>(() => ({
    p: ({ children }) => <p {...paragraph}>{children}</p>,
    h1: ({ children, id }) => <h1 {...h1} id={id}>{children}</h1>, h2: ({ children, id }) => <h2 {...h2} id={id}>{children}</h2>,
    h3: ({ children, id }) => <h3 {...h3} id={id}>{children}</h3>, h4: ({ children, id }) => <h4 {...h4} id={id}>{children}</h4>,
    h5: ({ children, id }) => <h5 {...h5} id={id}>{children}</h5>, h6: ({ children, id }) => <h6 {...h6} id={id}>{children}</h6>,
    strong: ({ children }) => <strong {...strong}>{children}</strong>,
    em: ({ children }) => <em>{children}</em>, del: ({ children }) => <del>{children}</del>,
    ul: ({ children }) => <ul {...list}>{children}</ul>, ol: ({ children, start }) => <ol {...list} start={start}>{children}</ol>,
    li: ({ children, id }) => <li {...item} id={id}>{children}</li>,
    blockquote: ({ children }) => <blockquote {...quote}>{children}</blockquote>,
    inlineCode: ({ children }) => <code {...inline}>{children}</code>,
    code: ({ children, className }) => <MarkdownCode diagrams={diagrams} lineNumbers={lineNumbers} className={className}>{children}</MarkdownCode>,
    a: ({ children, href, title, id, ...native }) => {
      const safe = safeUrl(href, "link", imageOrigins, baseUrl);
      if (!safe) return <span>{children}</span>;
      return <a {...link} href={safe} title={title ?? safe} id={id} aria-label={native["aria-label"]} data-footnote-ref={native["data-footnote-ref" as keyof typeof native]}>{children}</a>;
    },
    img: ({ src, alt, title }) => {
      const safe = typeof src === "string" ? safeUrl(src, "image", imageOrigins, baseUrl) : undefined;
      return safe ? <img {...image} src={safe} alt={alt ?? ""} title={title} loading="lazy" referrerPolicy="no-referrer" /> : <span {...imageDescription}>{alt ? `Image: ${alt}` : "Image"}</span>;
    },
    table: ({ children }) => <div {...tableRegion} role="group" aria-label="Response table" tabIndex={0}><table {...table}>{children}</table></div>,
    thead: ({ children }) => <thead>{children}</thead>, tbody: ({ children }) => <tbody>{children}</tbody>, tr: ({ children }) => <tr>{children}</tr>,
    th: ({ children, align }) => <th {...th} style={{ ...th.style, textAlign: align === "char" ? "start" : align ?? "start" }}>{children}</th>,
    td: ({ children, align }) => <td {...td} style={{ ...td.style, textAlign: align === "char" ? "start" : align ?? "start" }}>{children}</td>,
    hr: () => <hr {...rule} />,
    input: ({ checked }) => <input type="checkbox" checked={checked} disabled aria-label={checked ? "Completed task" : "Incomplete task"} />,
    section: ({ children, id }) => <section id={id}>{children}</section>,
    sup: ({ children }) => <sup>{children}</sup>, sub: ({ children }) => <sub>{children}</sub>,
    ...components,
    // Style objects contain stable compiled values; renderer identity follows configuration only.
  }), [diagrams, lineNumbers, imageOrigins, baseUrl, components]);
  const plugins = React.useMemo(() => ({ cjk, ...(math ? { math: mathPlugin } : {}) }), [math]);
  const urlTransform = React.useCallback((url: string, key: string) => safeUrl(url, key === "src" ? "image" : "link", imageOrigins, baseUrl) ?? "", [imageOrigins, baseUrl]);
  return <div {...props} ref={ref} className={root.className} style={{ ...root.style, ...style }}>
    <Streamdown mode={streaming ? "streaming" : "static"} isAnimating={streaming} parseIncompleteMarkdown={streaming} components={renderers} plugins={plugins} rehypePlugins={rehypePlugins} skipHtml urlTransform={urlTransform} linkSafety={noLinkModal} controls={false}>{children}</Streamdown>
  </div>;
});
