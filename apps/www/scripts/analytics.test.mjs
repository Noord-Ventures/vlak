import assert from "node:assert/strict";
import test from "node:test";
import { beforeSend, installMethod, isProductionLocation, publicSitePaths, redactUrl } from "../lib/site-analytics.ts";

const paths = new Set([...publicSitePaths, "/components/button"]);

test("only HTTPS production hosts can collect", () => {
  assert(isProductionLocation({ hostname: "vlak.dev", protocol: "https:" }));
  assert(isProductionLocation({ hostname: "www.vlak.dev", protocol: "https:" }));
  for (const hostname of ["localhost", "127.0.0.1", "vlak-git-branch.vercel.app", "vlak.dev.example.com", "getraster.com", "raster.noord.dev"]) {
    assert(!isProductionLocation({ hostname, protocol: "https:" }));
  }
  assert(!isProductionLocation({ hostname: "vlak.dev", protocol: "http:" }));
});

test("page URLs lose query/hash and unknown or private paths are dropped", () => {
  assert.equal(redactUrl("https://vlak.dev/docs/?email=private@example.com#token", paths), "https://vlak.dev/docs");
  assert.equal(redactUrl("https://vlak.dev/components/button/?token=secret", paths), "https://vlak.dev/components/button");
  for (const path of ["/account/private@example.com", "/components/customer-secret", "/docs/private-token"]) {
    assert.equal(redactUrl(`https://vlak.dev${path}?secret=yes#private`, paths), null);
    assert.equal(beforeSend({ type: "pageview", url: `https://vlak.dev${path}` }, paths), null);
    assert.equal(beforeSend({ type: "event", url: `https://vlak.dev${path}`, payload: { name: "github_click" } }, paths), null);
  }
  assert.equal(redactUrl("https://preview.vercel.app/docs", paths), null);
  assert.equal(redactUrl("broken-url", paths), null);
});

test("custom events emit only fixed identifiers, never arbitrary payload fields", () => {
  const event = beforeSend({ type: "event", url: "https://vlak.dev/?token=secret", payload: { name: "network_click", data: { source: "spoofed", destination: "noord", email: "private@example.com" } } }, paths);
  assert.deepEqual(event, { type: "event", url: "https://vlak.dev/", payload: { name: "network_click", data: { source: "vlak", destination: "noord" } } });
  assert.equal(beforeSend({ type: "event", url: "https://vlak.dev/", payload: { name: "form_text", data: { value: "secret" } } }, paths), null);
  assert.equal(beforeSend({ type: "event", url: "https://vlak.dev/", payload: { name: "network_click", data: { destination: "private@example.com" } } }, paths), null);
  assert.equal(beforeSend({ type: "event", url: "https://vlak.dev/", payload: { name: "docs_click", data: { path: "/docs/private-token" } } }, paths), null);
});

test("install-copy classification returns an enum without passing source content", () => {
  assert.equal(installMethod("npm install @noorddev/vlak-react\n// example"), "npm");
  assert.equal(installMethod("npx @noorddev/vlak-cli add button"), "cli");
  assert.equal(installMethod("npx shadcn add https://vlak.dev/r/button.json"), "shadcn");
  assert.equal(installMethod("<input value='private'/>"), null);
  assert.equal(installMethod("npm install private-package"), null);
});
