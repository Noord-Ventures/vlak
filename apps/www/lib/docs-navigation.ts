export type DocsNavPage = { href: string; title: string };
export type DocsNavGroup = { title: string; pages: readonly DocsNavPage[] };

export const docsNavigation: readonly DocsNavGroup[] = [
  { title: "Start", pages: [{ href: "/docs", title: "Getting started" }, { href: "/docs/choosing-vlak", title: "Choosing Vlak" }, { href: "/docs/frameworks", title: "Frameworks" }] },
  { title: "Foundations", pages: [{ href: "/docs/tokens", title: "Tokens" }, { href: "/docs/theming", title: "Theming" }, { href: "/docs/accessibility", title: "Accessibility" }, { href: "/docs/layers", title: "Layers" }, { href: "/docs/stylex", title: "StyleX" }] },
  { title: "Build", pages: [{ href: "/docs/agents", title: "Agents" }, { href: "/workflows", title: "Workflow kits" }, { href: "/docs/projects", title: "Project files" }, { href: "/docs/updates", title: "Safe source updates" }] },
  { title: "Domains", pages: [{ href: "/ai", title: "AI components" }, { href: "/docs/electronics", title: "Circuitry" }, { href: "/docs/civic", title: "Civic" }, { href: "/docs/creative", title: "Creative tools" }, { href: "/docs/geospatial", title: "Geospatial" }, { href: "/docs/health", title: "Health" }, { href: "/docs/engineering", title: "Industrial" }, { href: "/docs/microbiology", title: "Microbiology" }, { href: "/docs/robotics", title: "Robotics" }, { href: "/docs/science", title: "Science" }] },
] as const;

export const docsPages = docsNavigation.flatMap(group => group.pages);
export const docsRouteLabels: readonly DocsNavPage[] = [...docsPages, { href: "/services", title: "Workflow modernization" }, { href: "/showcase", title: "Built with Vlak" }];

export function docsPageForPath(pathname: string) {
  return docsRouteLabels.find(page => pathname === page.href || pathname === `${page.href}/`);
}
