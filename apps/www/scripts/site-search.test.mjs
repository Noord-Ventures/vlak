import { workflowCatalog } from "../../../examples/workflows/catalog.ts";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { register } from "node:module";
import { test } from "node:test";
import { catalogComponents, domainCollections } from "@noorddev/vlak";
import { searchSite } from "../lib/site-search.ts";

// The study catalog uses extensionless TypeScript imports for Next's bundler.
// Resolve those local source imports when exercising the real builder in Node.
register(`data:text/javascript,${encodeURIComponent(`
  export async function resolve(specifier, context, nextResolve) {
    try { return await nextResolve(specifier, context); }
    catch (error) {
      if (error.code === "ERR_MODULE_NOT_FOUND" && /^\\.\\.?\\//.test(specifier) && !/\\.[a-z]+$/i.test(specifier)) {
        return nextResolve(specifier + ".ts", context);
      }
      throw error;
    }
  }
`)}`, import.meta.url);
const { siteSearchEntries } = await import("../lib/site-search-index.ts");
const { interfaces } = await import("../app/interfaces/catalog.ts");
const { useCases } = await import("../app/use-cases/catalog.ts");

const item = (id, title, keywords = [], description = "", section = "Components") => ({ id, href: `/${id}/`, title, keywords, description, section });

test("title exact and prefix matches outrank aliases, which outrank descriptions", () => {
  const entries = [item("description", "Other", [], "A button for actions"), item("alias", "Action", ["Button"]), item("prefix", "Button group"), item("exact", "Button")];
  assert.deepEqual(searchSite(entries, "button").map(entry => entry.id), ["exact", "prefix", "alias", "description"]);
  assert.deepEqual(entries.map(entry => entry.id), ["description", "alias", "prefix", "exact"]);
});

test("API aliases normalize case, punctuation, CamelCase, and diacritics", () => {
  for (const query of ["PromptInput", "promptinput", "prompt input", "PROMPT-INPUT", "prómpt_input"]) {
    assert.equal(searchSite(siteSearchEntries, query)[0]?.href, "/components/message-composer/", query);
  }
  const entries = [item("cafe", "Café menu"), item("preview", "HTML preview")];
  assert.equal(searchSite(entries, "cafe")[0]?.id, "cafe");
  assert.equal(searchSite(entries, "HTMLPreview")[0]?.id, "preview");
});

test("all query words must match, including queries combining names and features", () => {
  assert.equal(searchSite(siteSearchEntries, "prompt screenshot")[0]?.href, "/components/message-composer/");
  assert.equal(searchSite(siteSearchEntries, "promptinput screenshot")[0]?.href, "/components/message-composer/");
  assert.equal(searchSite(siteSearchEntries, "nextjs starter")[0]?.href, "/starters/");
  assert.equal(searchSite(siteSearchEntries, "AI workflow")[0]?.href, "/ai/workflow-canvas/");
  assert.equal(searchSite(siteSearchEntries, "theming")[0]?.href, "/docs/theming/");
  assert.equal(searchSite(siteSearchEntries, "microscopy")[0]?.href, "/interfaces/microscopy/");
  assert.deepEqual(searchSite(siteSearchEntries, "prompt no-such-feature-745"), []);
  assert.deepEqual(searchSite([item("details", "Details")], "AI"), []);
});

test("phone platforms have separate canonical search destinations", () => {
  assert.equal(searchSite(siteSearchEntries, "ios")[0]?.href, "/interfaces/ios/");
  assert.equal(searchSite(siteSearchEntries, "android")[0]?.href, "/interfaces/android/");
  assert.ok(!siteSearchEntries.some(entry => entry.href === "/interfaces/mobile-os/"));
});

test("empty searches suggest useful canonical destinations and limits remain bounded", () => {
  const suggestions = searchSite(siteSearchEntries, "   ");
  assert.deepEqual(suggestions.slice(0, 4).map(entry => entry.href), ["/docs/", "/components/", "/ai/", "/interfaces/"]);
  assert.equal(suggestions.length, 12);
  assert.equal(searchSite(siteSearchEntries, "", 100).length, 16);
  assert.equal(searchSite(siteSearchEntries, "", 2.8).length, 2);
  assert.equal(searchSite(siteSearchEntries, "", Number.NaN).length, 12);
  assert.deepEqual(searchSite(siteSearchEntries, "", 0), []);
  assert.deepEqual(searchSite(siteSearchEntries, "", -1), []);
  assert.equal(searchSite(siteSearchEntries, "components", 100).length, 16);
});

test("every public canonical page is indexed once, including dynamic catalog and study routes", async () => {
  const expected = new Set();
  for (const file of await readdir(new URL("../app/", import.meta.url), { recursive: true })) {
    if (file !== "page.tsx" && !file.endsWith("/page.tsx")) continue;
    const route = file === "page.tsx" ? "" : file.slice(0, -"/page.tsx".length);
    if (["swag", "i/[slug]", "docs/ai", "interfaces/mobile-os"].includes(route)) continue;
    if (route === "components/[name]") {
      for (const component of catalogComponents.filter(component => component.category !== "ai")) expected.add(`/components/${component.name}/`);
    } else if (route === "ai/[name]") {
      for (const component of catalogComponents.filter(component => component.category === "ai")) expected.add(`/ai/${component.name}/`);
    } else if (route === "docs/[collection]") {
      for (const collection of domainCollections) expected.add(`/docs/${collection.name}/`);
    } else if (route === "workflows/[id]") {
      for (const kit of workflowCatalog) expected.add(`/workflows/${kit.id}/`);
    } else if (route === "use-cases/[slug]") {
      for (const useCase of useCases) expected.add(`/use-cases/${useCase.slug}/`);
    } else {
      assert.ok(!route.includes("["), `Unmapped dynamic route ${route}`);
      expected.add(route ? `/${route}/` : "/");
    }
  }
  assert.equal(new Set(siteSearchEntries.map(entry => entry.id)).size, siteSearchEntries.length);
  assert.equal(new Set(siteSearchEntries.map(entry => entry.href)).size, siteSearchEntries.length);
  assert.deepEqual(siteSearchEntries.map(entry => entry.href).sort(), [...expected].sort());
  for (const component of catalogComponents.filter(component => component.category === "ai")) {
    assert.ok(!siteSearchEntries.some(entry => entry.href === `/components/${component.name}/`));
  }
  for (const study of interfaces) assert.ok(siteSearchEntries.some(entry => entry.href === `/interfaces/${study.slug}/`));
});

test("the launcher payload contains navigation data without implementation or private records", async () => {
  for (const entry of siteSearchEntries) {
    assert.ok(entry.title && entry.description && entry.section);
    assert.match(entry.href, /^\/(?:[a-z0-9-]+\/)*$/);
    assert.deepEqual(Object.keys(entry).filter(key => !["id", "href", "title", "description", "section", "keywords"].includes(key)), []);
    assert.ok(!entry.href.startsWith("/api/") && !entry.href.startsWith("/i/"));
    assert.ok(!entry.keywords || entry.keywords.every(value => typeof value === "string"));
  }
  assert.ok(Buffer.byteLength(JSON.stringify(siteSearchEntries)) < 160_000, "Navigation payload unexpectedly includes heavy catalogue data");
  const utility = await readFile(new URL("../lib/site-search.ts", import.meta.url), "utf8");
  assert.ok(!/^import\s/m.test(utility), "Browser ranking utility imports a runtime registry or component module");
});
