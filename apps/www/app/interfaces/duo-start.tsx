"use client";

import * as React from "react";
import { Button, Icon } from "@noorddev/vlak-react";
import { trackSiteEvent } from "@/lib/site-analytics";
import { starterByInterface } from "../starters/catalog";

const install = "npm install @noorddev/vlak-react";

async function copyInstall() {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(install);
    return;
  }
  const field = document.createElement("textarea");
  field.value = install;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.left = "-9999px";
  document.body.appendChild(field);
  field.select();
  const copied = document.execCommand("copy");
  field.remove();
  if (!copied) throw new Error("Clipboard copy failed");
}

export function InterfaceStart({ source, slug, title }: { source: string; slug: string; title: string }) {
  const [copied, setCopied] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const starter = starterByInterface(slug);
  const timer = React.useRef<number>(0);
  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    try {
      await copyInstall();
    } catch {
      setFailed(true);
      return;
    }
    setFailed(false);
    setCopied(true);
    trackSiteEvent("install_copy", { method: "npm" });
    trackSiteEvent("interface_install", { slug, method: "npm" });
    if (slug === "ios") trackSiteEvent("install_from_duo", { method: "npm" });
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1600);
  }

  return <aside className="if-duo-start" id={slug === "ios" ? "duo-start" : "interface-start"} aria-label={`Start with ${title}`}>
    <div className="if-duo-start-copy">
      <strong>Start with this setup</strong>
      <span>{starter ? "Download a working project and change it." : "Use the study source and Vlak components in your project."}</span>
      <code>{install}</code>
      <span role="status" className={failed ? "if-copy-error" : "rs-sr"}>{failed ? "Copy failed. Select the command above to copy it." : ""}</span>
    </div>
    <div className="if-duo-start-actions">
      <a className="rs-btn-primary if-build-link" href={starter ? `/starters/#${slug}` : "/starters/"}>{starter ? "Open starter" : "Browse starters"} <span aria-hidden="true">→</span></a>
      <Button onClick={copy} aria-label={copied ? "Install command copied" : "Copy install command"}>
        <Icon name={copied ? "copied" : "copy"} size={16} />
        {copied ? "Copied" : "Copy install"}
      </Button>
      <a className="rs-link-underline" href="/docs/" onClick={() => { if (slug === "ios") trackSiteEvent("docs_from_duo"); }}>Installation guide <span aria-hidden="true">→</span></a>
      <a className="rs-link-underline" href={source}>GitHub source <span aria-hidden="true">↗</span></a>
    </div>
  </aside>;
}

export function DuoStart({ source }: { source: string }) {
  return <InterfaceStart source={source} slug="ios" title="iPhone Duo" />;
}
