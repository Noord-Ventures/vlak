import { vlakComponents } from "@noorddev/vlak";
import { interfaces } from "@/app/interfaces/catalog";
import { useCases } from "@/app/use-cases/catalog";
import { CrumbBarClient } from "./crumb-bar-client";

/** Breadcrumbs need labels, not every component's source, props, and examples. */
export function CrumbBar() {
  return <CrumbBarClient
    components={vlakComponents.map(({ name, title, category }) => ({ name, title, category }))}
    pages={Object.fromEntries([
      ...interfaces.map(({ slug, title }) => [`/interfaces/${slug}`, title]),
      ...useCases.map(({ slug, title }) => [`/use-cases/${slug}`, title]),
    ])}
  />;
}
