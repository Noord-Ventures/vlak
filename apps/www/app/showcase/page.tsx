import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { DocsShell } from "@/components/docs-shell";
import { StructuredData } from "@/components/structured-data";
import { pageMetadata } from "@/lib/page-metadata";
import styles from "./showcase.module.css";

export const metadata: Metadata = pageMetadata("/showcase", {
  title: "Built with Vlak",
  description: "Products and experiments built with Vlak, with a public path for submitting your own work.",
  robots: { index: false, follow: false },
});

const badge = `[![Built with Vlak](https://vlak.dev/badges/built-with-vlak.svg?v=2)](https://vlak.dev)`;
const submitUrl = "https://github.com/Noord-Ventures/vlak/issues/new?template=showcase.yml";
const projects = [
  { name: "Tax Scratchpad", url: "https://taxscratchpad.npux.design/", domain: "taxscratchpad.npux.design", image: "/showcase/tax-scratchpad.jpg", description: "A local workspace for exploring hypothetical 2025 federal tax scenarios, comparing assumptions, and tracing the calculations.", author: "Nicholas Pulido · NPUX", post: "https://x.com/NickP_UX/status/2097890666198249625" },
  { name: "Noord", url: "https://noord.dev/", domain: "noord.dev", image: "/showcase/noord.jpg", description: "An applied design lab working on interfaces and visual learning. Home to Vlak.", author: "Noord" },
  { name: "Personal Site", url: "https://www.renatovaldes.com/", domain: "renatovaldes.com", image: "/showcase/renn-20260911.jpg", description: "A personal website bringing together work, books, and essays.", author: "Renn" },
];

export default function ShowcasePage() {
  return (
    <DocsShell title="Built with Vlak" summary="Work made with the system, including the places where its rules were changed or refused.">
      <StructuredData value={{ "@context": "https://schema.org", "@type": "ItemList", name: "Built with Vlak", url: "https://vlak.dev/showcase/", itemListElement: projects.map((project, index) => ({ "@type": "ListItem", position: index + 1, name: project.name, url: project.url, description: project.description, image: `https://vlak.dev${project.image}` })) }} />
      <div className={styles.collection}>{projects.map(project => <article className={styles.project} key={project.url}>
        <img className={styles.preview} src={project.image} alt={`${project.name} website preview`} width="1280" height="800" loading="lazy" />
        <div className={styles.projectBody}><p className={styles.byline}>{project.domain} · {project.author}</p><h2>{project.name}</h2><p>{project.description}</p><div className={styles.projectActions}><a className={`rs-btn-ghost ${styles.visit}`} href={project.url}>Visit website <span aria-hidden="true">→</span></a>{project.post && <a className={`rs-btn-ghost ${styles.visit}`} href={project.post}>Project post <span aria-hidden="true">→</span></a>}</div></div>
      </article>)}</div>
      <h2 className="section-label">Submit a project</h2>
      <p className="rs-t-body">
        If you have shipped or explored something with Vlak, <a className="rs-link" href={submitUrl}>submit it through GitHub</a>. Public products, prototypes, internal tools with a shareable image, and substantial experiments are welcome.
      </p>
      <p className="rs-t-body">Include what you used, what you changed, and one constraint that helped or got in the way. That context is more useful than a logo wall.</p>

      <h2 className="section-label">Add the badge</h2>
      <p className="rs-t-body">The badge is optional. It links back to the system and gives other builders a direct trail to the source.</p>
      <p><a href="https://vlak.dev"><img src="/badges/built-with-vlak.svg?v=2" alt="Built with Vlak" width="132" height="24" /></a></p>
      <CodeBlock code={badge} />

      <h2 className="section-label">See the system in use</h2>
      <p className="rs-t-body">The <a className="rs-link" href="/interfaces/">interface studies</a> also show Vlak applied to product work across agents, healthcare, science, industrial tools, media, and everyday software.</p>
    </DocsShell>
  );
}
