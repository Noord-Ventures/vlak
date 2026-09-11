import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { DocsShell } from "@/components/docs-shell";
import { pageMetadata } from "@/lib/page-metadata";
import { CalendarCrop } from "../interfaces/calendar/crop";
import { AndroidCrop, ChatCrop } from "../interfaces/workflow-crops";
import { interfaceStarters } from "./catalog";
import starterPackage from "../../../../packages/react/package.json";
import "./starters.css";

export const metadata: Metadata = pageMetadata("/starters", {
  title: "Starters",
  description: "Download runnable iPhone Duo, Android, calendar, CSV reconciliation and AI conversation starters, plus small Vite and Next.js projects.",
});

const repo = "https://github.com/Noord-Ventures/vlak/tree/main/examples";

const previewLabels: Record<string, string> = {
  ios: "iPhone Duo home screen, folded and unfolded, with widgets and local apps",
  android: "Android home screen with app search, circular app icons and system navigation",
  calendar: "Month calendar with a selected date and the day's agenda",
  reconciliation: "CSV comparison showing matched, conflicting and missing records",
  line: "Research conversation with a local response and follow-up composer",
};

function StarterPreview({ slug }: { slug: string }) {
  return <div className={`starter-visual starter-visual-${slug}`} role="img" aria-label={previewLabels[slug]}>
    {slug === "ios" ? <div className="starter-duo" aria-hidden="true">
      <div>
        <img data-preview-theme="light" src="/images/social/ios-home-closed.png" width={1012} height={1436} alt="" loading="lazy" decoding="async" />
        <img data-preview-theme="dark" src="/images/starters/ios-home-closed-dark.png" width={1012} height={1436} alt="" loading="lazy" decoding="async" />
        <span>Outer screen</span>
      </div>
      <div>
        <img data-preview-theme="light" src="/images/social/ios-home.png" width={1982} height={1418} alt="" loading="lazy" decoding="async" />
        <img data-preview-theme="dark" src="/images/starters/ios-home-dark.png" width={1982} height={1418} alt="" loading="lazy" decoding="async" />
        <span>Inner screen</span>
      </div>
    </div> : <div className="starter-visual-crop" aria-hidden="true">
      {slug === "android" && <AndroidCrop />}
      {slug === "calendar" && <CalendarCrop />}
      {slug === "line" && <ChatCrop />}
      {slug === "reconciliation" && <div className="starter-reconciliation">
        <header><strong>Compare exports</strong><span>Review</span></header>
        <div className="starter-reconciliation-summary"><span>12 matched</span><strong>3 exceptions</strong></div>
        <div className="starter-reconciliation-row starter-reconciliation-columns"><span>Record</span><span>Status</span><span>Amount</span></div>
        {[["0017", "Matched", "84.00"], ["0024", "Conflicting", "62.00 / 64.00"], ["0031", "Missing", "—"]].map(row => <div className="starter-reconciliation-row" key={row[0]}>{row.map((cell, index) => <span key={index}>{cell}</span>)}</div>)}
        <footer>Review exceptions before exporting</footer>
      </div>}
    </div>}
  </div>;
}

export default function StartersPage() {
  return (
    <DocsShell title="Starters" summary="Start from a working interface. Download the source, install the packages and change the parts your product needs.">
      <p className="rs-t-body">Each interface download is a standalone Vite and React project. It includes the study source, styles and sample assets. No account or monorepo setup is needed.</p>
      <p className="rs-t-body">Downloads use Vlak {starterPackage.version}, with package versions pinned to match the study source.</p>
      <div className="starter-gallery">
        {interfaceStarters.map(starter => <section className="starter-card" key={starter.slug} id={starter.slug} aria-labelledby={`starter-${starter.slug}-title`}>
          <StarterPreview slug={starter.slug} />
          <div className="starter-card-copy">
            <h2 id={`starter-${starter.slug}-title`}>{starter.title}</h2>
            <p className="starter-description">{starter.description}</p>
            <div className="starter-actions">
              <a className="starter-button starter-button-primary" href={starter.download} download data-vlak-starter={starter.slug} aria-label={`Download ${starter.title} starter ZIP`}>Download <span aria-hidden="true">↓</span></a>
              <a className="starter-button" href={starter.preview} aria-label={`Try ${starter.title}`}>Try <span aria-hidden="true">→</span></a>
              <a className="starter-button" href={starter.source} aria-label={`View ${starter.title} source`}>View source <span aria-hidden="true">↗</span></a>
            </div>
            <p className="starter-note">{starter.note}</p>
          </div>
        </section>)}
      </div>
      <h2 className="section-label">Run a downloaded starter</h2>
      <p className="rs-t-body">Extract the ZIP, open its folder in a terminal and run the commands below. Use Node 22.12 or newer.</p>
      <CodeBlock code="npm install\nnpm run dev" />
      <p className="rs-t-body">Run <code>npm run build</code> for a static production build. The README names the first file to edit and the behavior that still needs your own implementation.</p>
      <h2 className="section-label">Vite and React</h2>
      <p className="rs-t-body">A client-side settings form with no framework conventions beyond React.</p>
      <div className="starter-actions"><a className="starter-button" href="https://stackblitz.com/github/Noord-Ventures/vlak/tree/main/examples/vite-react">Open in StackBlitz <span aria-hidden="true">↗</span></a><a className="starter-button" href={`${repo}/vite-react`}>View source <span aria-hidden="true">↗</span></a></div>
      <CodeBlock code="pnpm --dir examples/vite-react install\npnpm --dir examples/vite-react dev" />

      <h2 className="section-label">Next.js</h2>
      <p className="rs-t-body">An App Router page with the global Vlak stylesheet loaded from the root layout.</p>
      <div className="starter-actions"><a className="starter-button" href="https://stackblitz.com/github/Noord-Ventures/vlak/tree/main/examples/next-app">Open in StackBlitz <span aria-hidden="true">↗</span></a><a className="starter-button" href={`${repo}/next-app`}>View source <span aria-hidden="true">↗</span></a></div>
      <CodeBlock code="pnpm --dir examples/next-app install\npnpm --dir examples/next-app dev" />

      <h2 className="section-label">Own the next step</h2>
      <p className="rs-t-body">These are activation paths, not screen presets. Replace the example fields, compose the components around your product states, and use the <a className="rs-link" href="/docs/agents/">MCP server</a> when a coding agent needs the component contracts.</p>
      <p className="rs-t-body">For record review, approval and scheduling behavior, explore the <a href="/workflows/">workflow kits</a>.</p>
    </DocsShell>
  );
}
