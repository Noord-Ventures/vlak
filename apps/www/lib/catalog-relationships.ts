import { catalogComponents } from "@noorddev/vlak";

function key(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

const componentByLabel = new Map(
  catalogComponents.flatMap(component => [
    [key(component.name), component],
    [key(component.title), component],
    ...(component.aliases ?? []).map(alias => [key(alias), component] as const),
  ]),
);

export function componentForLabel(label: string) {
  if (key(label) === "icon") return catalogComponents.find(component => component.name === "icons");
  return componentByLabel.get(key(label));
}

export function relatedComponents(name: string, limit = 6) {
  const component = catalogComponents.find(item => item.name === name);
  if (!component) return [];
  return catalogComponents.filter(item => item.name !== name && item.category === component.category).slice(0, limit);
}
