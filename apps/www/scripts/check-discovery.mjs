// Verify emitted HTML and the sitemap rather than metadata source declarations.
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const out = resolve(process.env.SITE_EXPORT || fileURLToPath(new URL("../out", import.meta.url)));
const origin = "https://vlak.dev";
const decode = value => value.replace(/&#(x[\da-f]+|\d+);|&(amp|quot|apos|lt|gt);/gi, (_, number, name) => number
  ? String.fromCodePoint(Number.parseInt(number.replace(/^x/i, ""), /^x/i.test(number) ? 16 : 10))
  : ({ amp: "&", quot: '"', apos: "'", lt: "<", gt: ">" })[name.toLowerCase()]);
const attributes = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/gs)].map(([, key, , value]) => [key.toLowerCase(), decode(value)]));
const tags = (html, tag) => [...html.matchAll(new RegExp(`<${tag}\\b[^>]*>`, "gi"))].map(([tag]) => attributes(tag));
const read = path => readFileSync(join(out, path), "utf8");
const urls = new Set();
const titles = new Map();
const images = new Set();
let checked = 0;

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
  assert(structured.some(item => item["@type"] === "WebSite" && item.url === `${origin}/` && item.name === "Vlak"), `${path}: truthful site identity`);
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
  assert.match(html, /data-preview-open="true"/, `${file}: preview is present on first paint`);
  previews++;
}
for (const path of images) assert(existsSync(join(out, path)), `Missing social image: ${path}`);
const sitemap = [...read("sitemap.xml").matchAll(/<loc>(.*?)<\/loc>/g)].map(([, url]) => decode(url));
assert.equal(new Set(sitemap).size, sitemap.length, "Sitemap URLs are unique");
assert.deepEqual([...sitemap].sort(), [...urls].sort(), "Sitemap contains exactly the indexable exported pages");
assert(tags(read("starter/index.html"), "meta").some(item => item.name === "robots" && /noindex/.test(item.content)), "Hosted starter is excluded from indexing");
const robots = read("robots.txt");
assert.match(robots, /User-agent:\s*\*[\s\S]*Allow:\s*\//i, "Ordinary search crawling stays allowed");
assert.match(robots, /Sitemap: https:\/\/vlak\.dev\/sitemap\.xml/);
const llms = read("llms.txt");
for (const path of ["/design.md", "/interfaces.md"]) assert(llms.includes(`${origin}${path}`), `Agent index includes ${path}`);
for (const [, url] of llms.matchAll(/\]\((https:\/\/vlak\.dev[^\s)]*)\)/g)) {
  const { pathname } = new URL(url);
  assert(existsSync(join(out, pathname)) || existsSync(join(out, pathname, "index.html")), `Broken agent-index link: ${url}`);
}
console.log(`Discovery export passed: ${checked} self-canonical pages, matching sharing metadata, ${images.size} local card images, exact sitemap, ${previews} direct preview links, site identity and agent links.`);
