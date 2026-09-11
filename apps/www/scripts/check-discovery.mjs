// Verify emitted HTML and the sitemap rather than metadata source declarations.
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { catalogComponents } from "@noorddev/vlak";

const out = resolve(process.env.SITE_EXPORT || fileURLToPath(new URL("../out", import.meta.url)));
const origin = "https://vlak.dev";
const decode = value => value.replace(/&#(x[\da-f]+|\d+);|&(amp|quot|apos|lt|gt);/gi, (_, number, name) => number
  ? String.fromCodePoint(Number.parseInt(number.replace(/^x/i, ""), /^x/i.test(number) ? 16 : 10))
  : ({ amp: "&", quot: '"', apos: "'", lt: "<", gt: ">" })[name.toLowerCase()]);
const attributes = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/gs)].map(([, key, , value]) => [key.toLowerCase(), decode(value)]));
const tags = (html, tag) => [...html.matchAll(new RegExp(`<${tag}\\b[^>]*>`, "gi"))].map(([tag]) => attributes(tag));
function sectionContent(html, id) {
  let depth = 0;
  let start;
  for (const match of html.matchAll(/<\/?section\b[^>]*>/gi)) {
    const closing = match[0].startsWith("</");
    if (depth === 0) {
      if (!closing && attributes(match[0]).id === id) {
        start = match.index + match[0].length;
        depth = 1;
      }
      continue;
    }
    depth += closing ? -1 : 1;
    if (depth === 0) return html.slice(start, match.index);
  }
}
const read = path => readFileSync(join(out, path), "utf8");
const urls = new Set();
const titles = new Map();
const images = new Set();
let checked = 0;
const aiComponents = catalogComponents.filter(component => component.category === "ai");

for (const file of readdirSync(out, { recursive: true, encoding: "utf8" })) {
  if (file !== "index.html" && !file.endsWith("/index.html")) continue;
  const html = read(file);
  const head = html.match(/<head>([\s\S]*?)<\/head>/i)?.[1];
  assert(head, `${file}: missing head`);
  const meta = tags(head, "meta");
  if (meta.some(item => /robots/i.test(item.name || "") && /noindex/i.test(item.content || ""))) continue;
  const path = file === "index.html" ? "/" : `/${file.slice(0, -"index.html".length)}`;
  const expected = `${origin}${path}`;
  const titleTags = [...head.matchAll(/<title>([\s\S]*?)<\/title>/gi)];
  assert.equal(titleTags.length, 1, `${path}: one title`);
  const title = decode(titleTags[0][1]);
  assert(title.trim(), `${path}: empty title`);
  assert(!titles.has(title), `${path}: duplicate title with ${titles.get(title)}`);
  titles.set(title, path);
  const descriptions = meta.filter(item => item.name === "description");
  assert.equal(descriptions.length, 1, `${path}: one description`);
  const description = descriptions[0].content;
  assert(description?.trim(), `${path}: empty description`);
  const canonical = tags(head, "link").filter(item => item.rel === "canonical");
  assert.deepEqual(canonical.map(item => item.href), [expected], `${path}: self canonical`);
  const value = name => meta.filter(item => (item.property || item.name) === name).map(item => item.content);
  assert.deepEqual(value("og:url"), [expected], `${path}: shared URL`);
  for (const name of ["og:title", "twitter:title"]) assert.deepEqual(value(name), [title], `${path}: ${name} matches page`);
  for (const name of ["og:description", "twitter:description"]) assert.deepEqual(value(name), [description], `${path}: ${name} matches page`);
  for (const name of ["og:image", "twitter:image"]) {
    assert(value(name).length, `${path}: ${name} present`);
    for (const url of value(name)) {
      const asset = new URL(url);
      assert.equal(asset.origin, origin, `${path}: production image URL`);
      images.add(asset.pathname);
    }
  }
  assert.equal([...html.matchAll(/<h1(?:\s|>)/gi)].length, 1, `${path}: one main heading`);
  const structured = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].map(([, json]) => JSON.parse(json));
  const structuredItems = structured.flat();
  assert(structuredItems.some(item => item["@type"] === "WebSite" && item.url === `${origin}/` && item.name === "Vlak"), `${path}: truthful site identity`);
  if (path.startsWith("/components/") && path !== "/components/") {
    const name = path.split("/")[2];
    const markdown = `/docs/${name}.md`;
    const article = structuredItems.find(item => item["@type"] === "TechArticle");
    assert.equal(article?.mainEntityOfPage, expected, `${path}: component article identifies this page`);
    assert.equal(article?.isPartOf?.["@id"], `${origin}/components/#collection`, `${path}: article belongs to the component catalogue`);
    assert.equal(article?.encoding?.contentUrl, `${origin}${markdown}`, `${path}: article points to its own Markdown`);
    assert.deepEqual(tags(head, "link").filter(item => item.rel === "alternate" && item.type === "text/markdown").map(item => new URL(item.href, origin).href), [`${origin}${markdown}`], `${path}: matching Markdown alternate`);
    assert(existsSync(join(out, markdown)), `${path}: Markdown alternate exists`);
    assert(tags(html, "a").some(item => item.href === markdown), `${path}: readers can reach the same Markdown`);
  }
  if (path.startsWith("/ai/")) {
    assert(structuredItems.some(item => item["@type"] === "BreadcrumbList" && item.itemListElement?.at(-1)?.item === expected), `${path}: AI breadcrumb ends at this page`);
    const article = structuredItems.find(item => item["@type"] === "TechArticle");
    if (path !== "/ai/") {
      assert.equal(article?.url, expected, `${path}: article identifies the current AI page`);
      assert.equal(article?.mainEntityOfPage, expected, `${path}: article main page`);
      assert.equal(article?.isPartOf?.["@id"], `${origin}/ai/#collection`, `${path}: article belongs to the AI catalogue`);
    }
    if (path !== "/ai/widgets/") {
      const name = path.split("/")[2];
      const markdown = `/docs/${name || "ai-index"}.md`;
      const alternatives = tags(head, "link").filter(item => item.rel === "alternate" && item.type === "text/markdown");
      assert.deepEqual(alternatives.map(item => new URL(item.href, origin).href), [`${origin}${markdown}`], `${path}: matching Markdown alternate`);
      assert(existsSync(join(out, markdown)), `${path}: Markdown alternate exists`);
      assert(tags(html, "a").some(item => item.href === markdown), `${path}: Markdown is also linked for readers`);
      if (name) assert(tags(html, "a").some(item => item.href === `/r/${name}.json`), `${path}: source registry is linked`);
    }
    assert(tags(html, "a").some(item => item.href === "/docs/ai.md"), `${path}: complete integration guide is linked`);
  }
  urls.add(expected);
  checked++;
}

// Share-only previews keep the study canonical and stay out of the search index.
let previews = 0;
for (const entry of readdirSync(join(out, "interfaces"), { withFileTypes: true })) {
  if (!entry.isDirectory() || !existsSync(join(out, "interfaces", entry.name, "index.html"))) continue;
  const file = `i/${entry.name}/index.html`;
  assert(existsSync(join(out, file)), `${entry.name}: missing direct preview link`);
  const html = read(file), head = html.match(/<head>([\s\S]*?)<\/head>/i)?.[1] ?? "";
  assert(tags(head, "meta").some(item => item.name === "robots" && /noindex/.test(item.content)), `${file}: preview excludes duplicate indexing`);
  assert.deepEqual(tags(head, "link").filter(item => item.rel === "canonical").map(item => item.href), [`${origin}/interfaces/${entry.name}/`], `${file}: canonical study`);
  assert.deepEqual(tags(head, "meta").filter(item => item.property === "og:url").map(item => item.content), [`${origin}/i/${entry.name}/`], `${file}: direct sharing URL`);
  if (entry.name === "mobile-os") {
    const study = read("interfaces/mobile-os/index.html");
    for (const [path, content] of [["interfaces/mobile-os/index.html", study], [file, html]]) {
      assert(tags(content, "meta").some(item => item.name === "robots" && /noindex/.test(item.content)), `${path}: legacy chooser excludes duplicate indexing`);
      for (const platform of ["android", "ios"]) assert(tags(content, "a").some(item => item.href === `/interfaces/${platform}/`), `${path}: legacy chooser links ${platform} without JavaScript`);
    }
    continue;
  }
  assert.match(html, /data-preview-open="true"/, `${file}: preview is present on first paint`);
  previews++;
}
for (const path of images) assert(existsSync(join(out, path)), `Missing social image: ${path}`);
const interfaceIndex = read("interfaces/index.html");
const interfaceLinks = tags(interfaceIndex, "a").map(item => item.href?.replace(/\/$/, ""));
for (const platform of ["android", "ios"]) {
  assert(interfaceLinks.includes(`/interfaces/${platform}`), `Interface gallery includes ${platform}`);
  assert(read("interfaces.md").includes(`${origin}/interfaces/${platform}/`), `Agent interface catalogue includes ${platform}`);
}
assert(!interfaceLinks.includes("/interfaces/mobile-os"), "Legacy chooser is absent from the active gallery and sidebar");
assert(!read("interfaces.md").includes(`${origin}/interfaces/mobile-os/`), "Agent interface catalogue uses the separate platform routes");

// Every AI entry must be visible in the initial linked catalogue, without hydration.
const aiHtml = read("ai/index.html");
const aiCatalog = aiHtml.match(/<section\b[^>]*aria-labelledby="components"[^>]*>([\s\S]*?)<\/section>/i)?.[1];
assert(aiCatalog, "AI overview has a component catalogue");
const aiLinks = tags(aiCatalog, "a").map(item => new URL(item.href, origin)).filter(url => url.pathname.startsWith("/ai/") || url.pathname.startsWith("/components/"));
const expectedAiLinks = [...aiComponents.map(component => `${origin}/ai/${component.name}/`), `${origin}/ai/widgets/`, `${origin}/components/message-composer/`, `${origin}/components/tree-view/`];
assert.deepEqual(aiLinks.map(url => url.href).sort(), expectedAiLinks.toSorted(), "AI catalogue links every component and companion exactly once before JavaScript");
assert(tags(aiCatalog, "input").some(item => item.type === "search"), "AI catalogue has a named component filter");
const aiStructured = [...aiHtml.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].flatMap(([, json]) => JSON.parse(json));
const aiCollection = aiStructured.find(item => item["@type"] === "CollectionPage");
assert.equal(aiCollection?.["@id"], `${origin}/ai/#collection`, "AI catalogue structured identity");
assert.deepEqual(aiCollection?.mainEntity?.itemListElement?.map(item => item.url).sort(), expectedAiLinks.toSorted(), "AI structured catalogue matches its visible links");
assert(tags(aiHtml, "a").some(item => item.href === "https://assistant.vlak.dev" || item.href === "https://assistant.vlak.dev/"), "Indexed AI page exposes the live assistant");
for (const component of aiComponents) {
  assert(urls.has(`${origin}/ai/${component.name}/`), `${component.name}: AI reference is indexed`);
  assert(!urls.has(`${origin}/components/${component.name}/`), `${component.name}: legacy component route is not a duplicate indexable page`);
}
const sitemap = [...read("sitemap.xml").matchAll(/<loc>(.*?)<\/loc>/g)].map(([, url]) => decode(url));
assert.equal(new Set(sitemap).size, sitemap.length, "Sitemap URLs are unique");
assert.deepEqual([...sitemap].sort(), [...urls].sort(), "Sitemap contains exactly the indexable exported pages");
assert(tags(read("starter/index.html"), "meta").some(item => item.name === "robots" && /noindex/.test(item.content)), "Hosted starter is excluded from indexing");
assert(tags(read("widgets/calendar-demo.html"), "meta").some(item => item.name === "robots" && /noindex/.test(item.content)), "Standalone widget fixture is excluded from indexing");
const robots = read("robots.txt");
assert.match(robots, /User-agent:\s*\*[\s\S]*Allow:\s*\//i, "Ordinary search crawling stays allowed");
assert.match(robots, /Sitemap: https:\/\/vlak\.dev\/sitemap\.xml/);
const llms = read("llms.txt");
const componentHtml = read("components/index.html");
const componentStructured = [...componentHtml.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].flatMap(([, json]) => JSON.parse(json));
const componentCollection = componentStructured.find(item => item["@id"] === `${origin}/components/#collection`);
assert(componentCollection, "Component articles have a matching collection identity");
for (const platform of ["ios", "android"]) {
  const entries = catalogComponents.filter(component => component.category === platform);
  const section = sectionContent(componentHtml, platform);
  assert(section, `${platform}: visible component category`);
  const expectedLinks = entries.map(component => `${origin}/components/${component.name}/`).sort();
  const category = componentCollection.hasPart?.find(item => item["@id"] === `${origin}/components/#${platform}`);
  assert.deepEqual(category?.mainEntity?.itemListElement?.map(item => item.url).sort(), expectedLinks, `${platform}: structured list matches registry`);
  for (const component of entries) {
    assert(tags(section, "a").some(item => item.href?.replace(/\/$/, "") === `/components/${component.name}`), `${component.name}: visible before hydration`);
    const html = read(`components/${component.name}/index.html`);
    for (const link of [`/interfaces/${platform}/`, `/docs/${platform}.md`, `/components/#${platform}`]) {
      assert(tags(html, "a").some(item => item.href === link), `${component.name}: linked platform reference ${link}`);
    }
    assert(read(`docs/${platform}.md`).includes(`${origin}/docs/${component.name}.md`), `${component.name}: indexed in platform Markdown`);
    assert(read(`docs/${component.name}.md`).includes(`${origin}/docs/${platform}.md`), `${component.name}: Markdown platform backlink`);
  }
  const study = read(`interfaces/${platform}/index.html`);
  for (const link of [`/components/#${platform}`, `/docs/${platform}.md`]) assert(tags(study, "a").some(item => item.href === link), `${platform}: interface links related platform references`);
  assert(llms.includes(`${origin}/docs/${platform}.md`), `${platform}: short agent index`);
  assert(read("llms-full.txt").includes(read(`docs/${platform}.md`).trim()), `${platform}: complete agent documentation`);
}
for (const path of ["/design.md", "/interfaces.md", "/docs/ai.md", "/docs/ai-index.md"]) assert(llms.includes(`${origin}${path}`), `Agent index includes ${path}`);
for (const [, url] of llms.matchAll(/\]\((https:\/\/vlak\.dev[^\s)]*)\)/g)) {
  const { pathname } = new URL(url);
  assert(existsSync(join(out, pathname)) || existsSync(join(out, pathname, "index.html")), `Broken agent-index link: ${url}`);
}
for (const path of ["docs/agents.md", "docs/button.md", "docs/props.json"]) assert(existsSync(join(out, path)), `Missing machine-readable surface: ${path}`);
console.log(`Discovery export passed: ${checked} self-canonical pages, matching sharing metadata, ${images.size} local card images, exact sitemap, ${previews} direct preview links, component and AI Markdown alternatives, both mobile platform collections, site identity and agent links.`);
