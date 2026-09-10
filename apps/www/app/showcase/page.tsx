import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { DocsShell } from "@/components/docs-shell";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata("/showcase", {
  title: "Built with Vlak",
  description: "Products and experiments built with Vlak, with a public path for submitting your own work.",
});

const badge = `[![Built with Vlak](https://vlak.dev/badges/built-with-vlak.svg)](https://vlak.dev)`;
const submitUrl = "https://github.com/Noord-Ventures/vlak/issues/new?template=showcase.yml";

export default function ShowcasePage() {
  return (
    <DocsShell title="Built with Vlak" summary="Work made with the system, including the places where its rules were changed or refused.">
      <h2 className="section-label">Submit a project</h2>
      <p className="rs-t-body">
        The collection begins with real work rather than placeholder logos. If you have shipped or explored something with Vlak, <a className="rs-link" href={submitUrl}>submit it through GitHub</a>. Public products, prototypes, internal tools with a shareable image, and substantial experiments are welcome.
      </p>
      <p className="rs-t-body">Include what you used, what you changed, and one constraint that helped or got in the way. That context is more useful than a logo wall.</p>

      <h2 className="section-label">Add the badge</h2>
      <p className="rs-t-body">The badge is optional. It links back to the system and gives other builders a direct trail to the source.</p>
      <p><a href="https://vlak.dev"><img src="/badges/built-with-vlak.svg" alt="Built with Vlak" width="132" height="24" /></a></p>
      <CodeBlock code={badge} />

      <h2 className="section-label">See the system in use</h2>
      <p className="rs-t-body">Until community submissions arrive, the <a className="rs-link" href="/interfaces/">interface studies</a> show Vlak applied to product work across agents, healthcare, science, industrial tools, media, and everyday software.</p>
    </DocsShell>
  );
}

