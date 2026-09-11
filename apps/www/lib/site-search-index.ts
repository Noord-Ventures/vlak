// Import this builder from the static JSON route, never from the client launcher.
import { catalogComponents, domainCollections } from "@noorddev/vlak";
import { interfaces } from "../app/interfaces/catalog";
import { workflowCatalog } from "../../../examples/workflows/catalog";
import { useCases } from "../app/use-cases/catalog";
import type { SiteSearchEntry } from "./site-search";

function entry(href: string, title: string, description: string, section: string, keywords: readonly string[] = []): SiteSearchEntry {
  return { id: href, href, title, description, section, ...(keywords.length ? { keywords: [...new Set(keywords)] } : {}) };
}

const guides = [
  entry("/docs/", "Getting started", "Install React components, copy StyleX source, or use Vlak CSS classes directly.", "Guides", ["Installation", "Setup", "Quick start", "npm", "pnpm", "CLI", "shadcn"]),
  entry("/docs/frameworks/", "Frameworks", "Use Vlak in Next.js, Vite, Remix, React Router, Astro, and plain HTML.", "Guides"),
  entry("/docs/theming/", "Theming", "Customize CSS properties, the dark scheme, module grid, and text scale.", "Guides", ["Dark mode", "Light mode", "Theme", "Colors"]),
  entry("/docs/tokens/", "Tokens", "The neutral scale, typography, grid, radius, motion, and control dimensions.", "Guides", ["Design tokens", "CSS variables", "Spacing", "Typography"]),
  entry("/docs/layers/", "Layers", "Cascade layers, application overrides, and the rs-* class contract.", "Guides", ["CSS cascade", "Specificity", "Overrides"]),
  entry("/docs/stylex/", "StyleX", "Write component styles against Vlak tokens and compile them with Vite or Next.js.", "Guides", ["Source components", "Compiler"]),
  entry("/docs/accessibility/", "Accessibility", "Component naming, keyboard behavior, focus, contrast, and accessibility tests.", "Guides", ["a11y", "WCAG", "Screen readers"]),
  entry("/docs/health/", "Health", "Health, wellness, and medical components with explicit data and action states.", "Guides", ["Healthcare", "Medical", "Wellness"]),
  entry("/docs/agents/", "Agents", "Machine-readable documentation, Markdown, registry data, CLI commands, and MCP tools.", "Guides", ["MCP", "llms.txt", "Agent plugin", "Claude", "Codex"]),
  entry("/docs/choosing-vlak/", "Choosing Vlak", "Compare Vlak with Radix and shadcn and choose a React, CSS, or source workflow.", "Guides", ["Comparison", "Alternatives", "Radix", "shadcn"]),
  ...domainCollections.map(collection => entry(`/docs/${collection.name}/`, collection.title, collection.description, "Guides", [collection.name, ...collection.groups.map(group => group.title)])),
];

const destinations = [
  entry("/components/", "Components", "Browse the complete React component library with examples, props, and keyboard guidance.", "Site", ["Catalogue", "Catalog", "Library"]),
  entry("/ai/", "AI components", "Compose conversations, prompts, tools, widgets, rich responses, voice, and workflows.", "Site", ["AI Elements", "Artificial intelligence", "Assistant interfaces"]),
  entry("/interfaces/", "Interfaces", "Explore complete interface studies built with Vlak components.", "Site", ["Studies", "Examples", "Templates"]),
  entry("/workflows/", "Workflow kits", "Runnable record review, action approval and schedule editing with explicit state and adapter contracts.", "Guides", ["Recipes", "Approval", "Workflow"]),
  entry("/services/", "Workflow modernization", "Scope a bounded improvement with a portable local brief and delivery templates.", "Site", ["Service", "Brief", "Modernization"]),
  entry("/docs/projects/", "Project files", "Save, reopen, recover and export local workspaces.", "Guides", ["Backup", "Recovery"]),
  entry("/docs/updates/", "Safe source updates", "Review installed source changes and recover interrupted CLI updates.", "Guides", ["CLI", "Update", "Provenance"]),
  ...workflowCatalog.flatMap(kit => [
    entry(`/workflows/${kit.id}/`, kit.title, kit.description, "Workflow kits", [kit.id, "Example"]),
    entry(`/workflows/${kit.id}/manifest/`, `${kit.title} manifest`, `States, adapters, ownership, installation and acceptance for the ${kit.title.toLowerCase()} workflow.`, "Workflow kits", [kit.id, "Manifest", "Contract"]),
  ]),
  entry("/starters/", "Starters", "Small Vite and Next.js projects with the package, stylesheet, and a working form already connected.", "Guides", ["Starter", "Vite", "Next.js", "Templates", "StackBlitz"]),
  entry("/showcase/", "Built with Vlak", "Products and experiments built with Vlak, with a public path for submitting your own work.", "Site", ["Showcase", "Community", "Badge", "Submit project", "Tax Scratchpad", "Nicholas Pulido", "NPUX", "Noord", "Personal Site", "Renn", "renatovaldes.com"]),
  entry("/ai/widgets/", "Widget patterns", "Compose application content, third-party React widgets, and embedded provider pages.", "Guides", ["Integrations", "Iframe", "Widget design system"]),
  entry("/use-cases/", "Use cases", "Components and studies for enterprise, consumer, agent, data, science, healthcare, and industrial software.", "Site"),
  entry("/", "Vlak", "A minimal React design system with monochrome surfaces, accessible controls, and CSS tokens.", "Site", ["Home", "Design system"]),
  entry("/about/", "About", "The method, design lineage, and practical constraints behind Vlak.", "Site", ["Principles", "Design philosophy"]),
  entry("/inspiration/", "Inspiration", "Furniture, architecture, and graphic systems behind Vlak.", "Site", ["References", "Design history"]),
  entry("/privacy/", "Privacy", "How Vlak handles website and MCP request data.", "Site", ["Privacy policy", "Analytics"]),
  entry("/terms/", "Terms", "Terms for using the website, hosted MCP server, and software.", "Site", ["Terms of use", "License"]),
];

/** Public canonical pages only. Examples, source, props, and private records never enter the payload. */
export const siteSearchEntries: SiteSearchEntry[] = [
  ...destinations,
  ...guides,
  ...catalogComponents.map(component => entry(
    `/${component.category === "ai" ? "ai" : "components"}/${component.name}/`,
    component.title, component.description, component.category === "ai" ? "AI components" : "Components",
    [component.name, component.category, ...(component.aliases ?? [])],
  )),
  ...interfaces.map(study => entry(`/interfaces/${study.slug}/`, study.title, study.law, "Interfaces", [study.slug, study.what, study.type])),
  ...useCases.map(useCase => entry(`/use-cases/${useCase.slug}/`, useCase.title, useCase.summary, "Use cases", [useCase.slug])),
];
