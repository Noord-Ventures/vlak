import { catalogComponents, vlakCategories } from "@noorddev/vlak";
import { iconGroups } from "@noorddev/vlak-react/components/icon";
import { DocsNavClient } from "./client";

/** Keep full documentation on the server; the interactive rail only needs labels. */
export function DocsNav() {
  return <DocsNavClient
    components={catalogComponents.map(({ name, title, category }) => ({ name, title, category }))}
    groups={vlakCategories.filter(category => catalogComponents.some(component => component.category === category))}
    icons={iconGroups.map(({ title }) => ({ title }))}
  />;
}
