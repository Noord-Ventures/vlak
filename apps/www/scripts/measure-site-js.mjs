import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const build = fileURLToPath(new URL("../.next/", import.meta.url));
const manifest = JSON.parse(readFileSync(join(build, "app-build-manifest.json"), "utf8"));
const routes = process.argv.slice(2);

// Union page and ancestor-layout scripts, because both are sent on a cold visit.
// Deferred chunks are excluded; browser checks verify when those are requested.
for (const route of routes.length ? routes : ["/page", "/components/page", "/components/[name]/page"]) {
  const page = manifest.pages[route];
  if (!page) throw new Error(`Route missing from production build: ${route}`);
  const layouts = Object.entries(manifest.pages).filter(([path]) => path.endsWith("/layout")
    && (path === "/layout" || route.startsWith(`${path.slice(0, -7)}/`)));
  const scripts = [...new Set([...page, ...layouts.flatMap(([, files]) => files)])].filter(path => path.endsWith(".js"));
  const bytes = scripts.reduce((total, path) => total + gzipSync(readFileSync(join(build, path)), { level: 9 }).length, 0);
  console.log(JSON.stringify({ route, scripts: scripts.length, gzipBytes: bytes, gzipKiB: Number((bytes / 1024).toFixed(1)) }));
}
