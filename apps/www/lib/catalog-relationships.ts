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

const counterpartByName = new Map([
  ["ios-switch", "android-switch"],
  ["ios-search-field", "android-search-bar"],
  ["ios-list", "android-list"],
  ["ios-sheet", "android-sheet"],
  ["ios-navigation-bar", "android-app-bar"],
].flatMap(([ios, android]) => [[ios, android] as const, [android, ios] as const]));

export function relatedComponents(name: string, limit = 6) {
  const component = catalogComponents.find(item => item.name === name);
  if (!component || limit <= 0) return [];
  const siblings = catalogComponents.filter(item => item.category === component.category);
  const index = siblings.indexOf(component);
  // Start after this component and wrap, so later entries also receive sibling links.
  const rotated = [...siblings.slice(index + 1), ...siblings.slice(0, index)];
  const counterpart = catalogComponents.find(item => item.name === counterpartByName.get(name));
  return (counterpart ? [counterpart, ...rotated] : rotated).slice(0, limit);
}
