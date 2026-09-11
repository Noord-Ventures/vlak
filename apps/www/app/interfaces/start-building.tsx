"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Icon } from "@noorddev/vlak-react";
import { trackSiteEvent } from "@/lib/site-analytics";
import { starterByInterface } from "../starters/catalog";

const install = "npm install @noorddev/vlak-react";

function CopyAction({ text, label, primary = false, onCopied }: { text: string; label: string; primary?: boolean; onCopied?: () => void }) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
      onCopied?.();
    } catch {
      setState("error");
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 2400);
  }

  return <div className="if-copy-action">
    <Button variant={primary ? "primary" : "ghost"} onClick={copy}>
      <Icon name={state === "copied" ? "copied" : "copy"} size={16} />
      {state === "copied" ? "Copied" : label}
    </Button>
    <span className={state === "error" ? "if-copy-error" : "rs-sr"} role="status">
      {state === "error" ? "Clipboard unavailable. Select and copy the text below." : state === "copied" ? "Copied to clipboard" : ""}
    </span>
    {state === "error" && <pre tabIndex={0}>{text}</pre>}
  </div>;
}

export function StartBuilding({ title, slug, source }: { title: string; slug: string; source: string }) {
  const starter = starterByInterface(slug);
  const prompt = `Build a ${title.toLowerCase()} interface with Vlak.\n\nRead https://vlak.dev/design.md and https://vlak.dev/llms.txt first. Use https://vlak.dev/interfaces/${slug}/ as the visual and interaction reference. Inspect the study source at ${source}.\n\nInstall @noorddev/vlak-react and import its stylesheet. Use the documented Vlak components, a clear grid, square structural surfaces, readable type, and sentence case. Adapt the layout for phones with touch-sized controls. Implement the main interactions with local sample data and label any simulated behavior. Check keyboard focus, contrast, spacing, and overflow at mobile and desktop widths. Adapt the content to my product before adding any backend services.`;

  return <section className="if-build" id="build-with-vlak" aria-labelledby="if-build-title">
    <div className="if-build-heading">
      <p className="if-eyebrow">Use this as a starting point</p>
      <h2 id="if-build-title">Build with Vlak</h2>
      <p>Install the components, add the stylesheet, and bring your own content. The study’s source shows how the pieces fit together.</p>
      <div className="if-build-facts"><span>React components</span><span>CSS included</span><span>MIT licensed</span></div>
      {starter && <p><a className="rs-link-underline" href={`/starters/#${slug}`}>Open the {title} starter <span aria-hidden="true">→</span></a></p>}
    </div>
    <div className="if-install">
      <div className="if-install-top"><span>Install the package</span><CopyAction text={install} label="Copy install" primary onCopied={() => { trackSiteEvent("install_copy", { method: "npm" }); trackSiteEvent("interface_install", { slug, method: "npm" }); if (slug === "ios") trackSiteEvent("install_from_duo", { method: "npm" }); }} /></div>
      <pre tabIndex={0}><code>{install}</code></pre>
      <pre tabIndex={0}><code>{'import "@noorddev/vlak-react/css";'}</code></pre>
      <div className="if-build-links"><a className="rs-link-underline" href="/docs/">Installation guide <span aria-hidden="true">→</span></a><a className="rs-link-underline" href={source}>View study source <span aria-hidden="true">↗</span></a></div>
    </div>
    <div className="if-agent-start">
      <div><h3>Start with your coding agent</h3><p>A ready-to-use brief with this study, Vlak’s components, and the <a href="/design.md">design guide</a>.</p></div>
      <CopyAction text={prompt} label="Copy build brief" onCopied={() => trackSiteEvent("setup_copy", { slug })} />
    </div>
  </section>;
}
