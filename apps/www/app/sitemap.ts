import { readdirSync } from "node:fs";
import { join } from "node:path";
import type { MetadataRoute } from "next";
import { catalogComponents, domainCollections } from "@noorddev/vlak";
import { HOST } from "./specimen";

export const dynamic = "force-static";

/** Use the page files and the same records as generateStaticParams. */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = readdirSync(join(process.cwd(), "app"), { recursive: true, encoding: "utf8" });
  const paths = new Set<string>();
  for (const file of pages) {
    if (file !== "page.tsx" && !file.endsWith("/page.tsx")) continue;
    const path = file === "page.tsx" ? "" : file.slice(0, -"/page.tsx".length);
    // This retired route deliberately returns notFound and is disallowed in robots.txt.
    if (path === "swag") continue;
    if (path === "components/[name]") {
      for (const component of catalogComponents) paths.add(`/components/${component.name}/`);
    } else if (path === "docs/[collection]") {
      for (const collection of domainCollections) paths.add(`/docs/${collection.name}/`);
    } else {
      if (path.includes("[") || path.includes("(")) throw new Error(`Unmapped sitemap route: ${path}`);
      paths.add(path ? `/${path}/` : "/");
    }
  }
  return [...paths].sort().map(path => ({ url: new URL(path, HOST).href }));
}
