"use client";

import * as React from "react";
import { Icon } from "@noorddev/vlak-react";
import { installMethod, trackSiteEvent } from "@/lib/site-analytics";

async function writeClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.left = "-9999px";
  document.body.appendChild(field);
  field.select();
  const copied = document.execCommand("copy");
  field.remove();
  if (!copied) throw new Error("Clipboard copy failed");
}

export function CopyControl({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<number>(0);

  React.useEffect(() => {
    return () => window.clearTimeout(timer.current);
  }, []);

  async function copy() {
    try {
      await writeClipboard(text);
    } catch {
      return;
    }
    setCopied(true);
    const method = installMethod(text);
    if (method) trackSiteEvent("install_copy", { method });
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      className="code-copy"
      onClick={copy}
      aria-label={copied ? "Copied" : "Copy"}
    >
      {copied ? <Icon name="copied" size={16} /> : <Icon name="copy" size={16} />}
      <span className="rs-sr" aria-live="polite">
        {copied ? "Copied" : ""}
      </span>
    </button>
  );
}

export function CodeBlock({ code }: { code: string }) {
  const lines = code.trim().includes("\n") ? "many" : "one";
  return (
    <div className="code-block" data-lines={lines}>
      {/* Scrolls sideways on narrow screens, so it must take keyboard focus. */}
      <pre tabIndex={0}>{code}</pre>
      <CopyControl text={code} />
    </div>
  );
}
