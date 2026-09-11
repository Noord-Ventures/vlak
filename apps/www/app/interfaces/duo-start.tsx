"use client";

import * as React from "react";
import { Button, Icon } from "@noorddev/vlak-react";
import { trackSiteEvent } from "@/lib/site-analytics";

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

export function DuoStart({ source }: { source: string }) {
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<number>(0);
  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    try {
      await copyInstall();
    } catch {
      return;
    }
    setCopied(true);
    trackSiteEvent("install_copy", { method: "npm" });
    trackSiteEvent("install_from_duo", { method: "npm" });
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1600);
  }

  return <aside className="if-duo-start" id="duo-start" aria-label="Start with the iPhone Duo setup">
    <div className="if-duo-start-copy">
      <strong>Start with this setup</strong>
      <span>Use the prototype source as your reference.</span>
      <code>{install}</code>
    </div>
    <div className="if-duo-start-actions">
      <Button onClick={copy} aria-label={copied ? "Install command copied" : "Copy install command"}>
        <Icon name={copied ? "copied" : "copy"} size={16} />
        {copied ? "Copied" : "Copy install"}
      </Button>
      <a className="rs-link-underline" href="/docs/" onClick={() => trackSiteEvent("docs_from_duo")}>Installation guide <span aria-hidden="true">→</span></a>
      <a className="rs-link-underline" href={source}>GitHub source <span aria-hidden="true">↗</span></a>
    </div>
  </aside>;
}
