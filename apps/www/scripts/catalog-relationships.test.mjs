import assert from "node:assert/strict";
import { test } from "node:test";
import { catalogComponents } from "@noorddev/vlak";
import { componentForLabel, relatedComponents } from "../lib/catalog-relationships.ts";

const counterpartPairs = [
  ["ios-switch", "android-switch"],
  ["ios-search-field", "android-search-bar"],
  ["ios-list", "android-list"],
  ["ios-sheet", "android-sheet"],
  ["ios-navigation-bar", "android-app-bar"],
];

test("every component in a multi-member category receives a sibling related link", () => {
  const inbound = new Set();
  for (const component of catalogComponents) {
    for (const related of relatedComponents(component.name)) {
      if (related.category === component.category) inbound.add(related.name);
    }
  }
  const missing = catalogComponents.filter(component =>
    catalogComponents.some(sibling => sibling.name !== component.name && sibling.category === component.category) && !inbound.has(component.name),
  );
  assert.deepEqual(missing.map(component => component.name), []);
});

test("native controls prioritize their useful reciprocal platform counterpart", () => {
  for (const [ios, android] of counterpartPairs) {
    assert.equal(relatedComponents(ios)[0]?.name, android);
    assert.equal(relatedComponents(android)[0]?.name, ios);
  }
});

test("related links are deterministic, bounded, unique and never point to themselves", () => {
  const originalOrder = catalogComponents.map(component => component.name);
  const known = new Set(originalOrder);
  for (const component of catalogComponents) {
    const names = relatedComponents(component.name).map(related => related.name);
    assert.ok(names.length <= 6, component.name);
    assert.equal(new Set(names).size, names.length, component.name);
    assert.ok(!names.includes(component.name), component.name);
    assert.ok(names.every(name => known.has(name)), component.name);
    assert.deepEqual(relatedComponents(component.name).map(related => related.name), names);
    assert.deepEqual(relatedComponents(component.name, 2).map(related => related.name), names.slice(0, 2));
  }
  assert.deepEqual(catalogComponents.map(component => component.name), originalOrder);
  assert.deepEqual(relatedComponents("missing-component"), []);
  assert.deepEqual(relatedComponents("ios-sheet", 0), []);
  assert.deepEqual(relatedComponents("ios-sheet", -1), []);
});

test("component labels still resolve names, normalized titles, aliases and Icon", () => {
  assert.equal(componentForLabel("iOS sheet")?.name, "ios-sheet");
  assert.equal(componentForLabel("ANDROID_SEARCH_BAR")?.name, "android-search-bar");
  assert.equal(componentForLabel("UISearchBar")?.name, "ios-search-field");
  assert.equal(componentForLabel("Icon")?.name, "icons");
  assert.equal(componentForLabel("Not a component"), undefined);
});
