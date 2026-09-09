import type { ReactNode } from "react";
import { chrome } from "@/app/site.stylex";
import { AiNav } from "@/components/ai-nav";
import { aiPageGroups } from "@/lib/ai-catalog";
import { sx } from "@/lib/sx";
import "./ai-shell.css";

export function AiShell({ title, summary, children, wide = false }: { title: string; summary: ReactNode; children: ReactNode; wide?: boolean }) {
  const cover = sx("cover", chrome.cover);
  const content = sx("site-content", chrome.content);
  return (
    <div className={`site-layout ai-section${wide ? " ai-section-wide" : ""}`}>
      <AiNav groups={aiPageGroups} />
      <main id="main" className={content.className} style={{ ...content.style, ...(wide ? { width: "100%", maxWidth: 1000 } : {}) }}>
        <header className={cover.className} style={{ ...cover.style, paddingBottom: 8, ...(wide ? { maxWidth: 592 } : {}) }}>
          <h1 className="rs-t-display">{title}</h1>
          <p className="rs-t-sub">{summary}</p>
        </header>
        {children}
      </main>
    </div>
  );
}
