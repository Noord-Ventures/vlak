import { readdirSync } from "node:fs";
import { join } from "node:path";
import type { MetadataRoute } from "next";
import { catalogComponents, domainCollections } from "@noorddev/vlak";
import { HOST } from "./specimen";
import { workflowCatalog } from "../../../examples/workflows/catalog";
import { useCases } from "./use-cases/catalog";

export const dynamic = "force-static";

/** Use the page files and the same records as generateStaticParams. */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = readdirSync(join(process.cwd(), "app"), { recursive: true, encoding: "utf8" });
  const paths = new Set<string>();
  for (const file of pages) {
    if (file !== "page.tsx" && !file.endsWith("/page.tsx")) continue;
    const path = file === "page.tsx" ? "" : file.slice(0, -"/page.tsx".length);
    // Retired pages, private collections, compatibility choosers and share-only previews are not indexed.
    if (path === "swag" || path === "showcase" || path === "i/[slug]" || path === "docs/ai" || path === "interfaces/mobile-os") continue;
    if (path === "components/[name]") {
      for (const component of catalogComponents) {
        if (component.category !== "ai") paths.add(`/components/${component.name}/`);
      }
    } else if (path === "ai/[name]") {
      for (const component of catalogComponents) {
        if (component.category === "ai") paths.add(`/ai/${component.name}/`);
      }
    } else if (path === "docs/[collection]") {
      for (const collection of domainCollections) paths.add(`/docs/${collection.name}/`);
    } else if (path === "workflows/[id]") {
      for (const kit of workflowCatalog) paths.add(`/workflows/${kit.id}/`);
    } else if (path === "workflows/[id]/manifest") {
      for (const kit of workflowCatalog) paths.add(`/workflows/${kit.id}/manifest/`);
    } else if (path === "use-cases/[slug]") {
      for (const useCase of useCases) paths.add(`/use-cases/${useCase.slug}/`);
    } else {
      if (path.includes("[") || path.includes("(")) throw new Error(`Unmapped sitemap route: ${path}`);
      paths.add(path ? `/${path}/` : "/");
    }
  }
  return [...paths].sort().map(path => ({ url: new URL(path, HOST).href }));
}
