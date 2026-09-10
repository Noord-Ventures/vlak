import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { DocsShell } from "@/components/docs-shell";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata("/starters", {
  title: "Starters",
  description: "Small Vite and Next.js projects that make the first Vlak interface runnable without setup decisions.",
});

const repo = "https://github.com/Noord-Ventures/vlak/tree/main/examples";

export default function StartersPage() {
  return (
    <DocsShell title="Starters" summary="Two small projects with the package, stylesheet, and first working form already connected.">
      <h2 className="section-label">Vite and React</h2>
      <p className="rs-t-body">A client-side settings form with no framework conventions beyond React.</p>
      <p className="rs-t-body"><a className="rs-link" href="https://stackblitz.com/github/Noord-Ventures/vlak/tree/main/examples/vite-react">Open in StackBlitz</a> · <a className="rs-link" href={`${repo}/vite-react`}>View source</a></p>
      <CodeBlock code="pnpm --dir examples/vite-react install\npnpm --dir examples/vite-react dev" />

      <h2 className="section-label">Next.js</h2>
      <p className="rs-t-body">An App Router page with the global Vlak stylesheet loaded from the root layout.</p>
      <p className="rs-t-body"><a className="rs-link" href="https://stackblitz.com/github/Noord-Ventures/vlak/tree/main/examples/next-app">Open in StackBlitz</a> · <a className="rs-link" href={`${repo}/next-app`}>View source</a></p>
      <CodeBlock code="pnpm --dir examples/next-app install\npnpm --dir examples/next-app dev" />

      <h2 className="section-label">Own the next step</h2>
      <p className="rs-t-body">These are activation paths, not screen presets. Replace the example fields, compose the components around your product states, and use the <a className="rs-link" href="/docs/agents/">MCP server</a> when a coding agent needs the component contracts.</p>
    </DocsShell>
  );
}

