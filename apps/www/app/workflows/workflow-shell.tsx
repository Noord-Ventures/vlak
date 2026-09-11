import type { ReactNode } from "react";
import { chrome } from "@/app/site.stylex";
import { sx } from "@/lib/sx";
import { WorkflowNav } from "./workflow-nav";

export function WorkflowShell({ title, summary, children }: { title: string; summary: ReactNode; children: ReactNode }) {
  const cover = sx("cover", chrome.cover);
  return <div className="site-layout workflow-site-layout">
    <WorkflowNav />
    <main id="main" {...sx("site-content workflow-site-content", chrome.catalogContent)}>
      <header className={cover.className} style={{ ...cover.style, paddingBottom: 8 }}>
        <h1 className="rs-t-display">{title}</h1>
        <p className="rs-t-sub">{summary}</p>
      </header>
      {children}
    </main>
  </div>;
}
