import { createReadStream, realpathSync } from "node:fs";
import { realpath, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const defaultRoot = fileURLToPath(new URL("../out", import.meta.url));
const types = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json", ".map": "application/json", ".webmanifest": "application/manifest+json", ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8", ".md": "text/markdown; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif", ".webp": "image/webp", ".avif": "image/avif", ".ico": "image/x-icon",
  ".woff": "font/woff", ".woff2": "font/woff2", ".ttf": "font/ttf", ".otf": "font/otf", ".mp4": "video/mp4", ".m4v": "video/mp4", ".webm": "video/webm", ".mov": "video/quicktime",
  ".mp3": "audio/mpeg", ".m4a": "audio/mp4", ".wav": "audio/wav", ".ogg": "audio/ogg", ".flac": "audio/flac", ".vtt": "text/vtt; charset=utf-8", ".pdf": "application/pdf", ".wasm": "application/wasm", ".glb": "model/gltf-binary", ".gltf": "model/gltf+json",
};
const contains = (root, file) => file === root || file.startsWith(root + sep);

/** Serve a static Next export with the byte-range responses media elements need.
 * Both browser-test entry points use this server so preload and seeking behave
 * the same in CI. The caller owns listen() and close(). */
export function createExportServer({ root = defaultRoot } = {}) {
  const directory = realpathSync(resolve(root));

  async function findFile(candidate) {
    try {
      const file = await realpath(candidate);
      if (!contains(directory, file)) throw Object.assign(new Error("Outside export"), { status: 403 });
      const info = await stat(file);
      if (info.isDirectory()) return findFile(resolve(file, "index.html"));
      return info.isFile() ? { file, size: info.size } : null;
    } catch (error) {
      if (error.code === "ENOENT" || error.code === "ENOTDIR") return null;
      throw error;
    }
  }

  async function serve(request, response) {
    if (request.method !== "GET" && request.method !== "HEAD") {
      response.writeHead(405, { Allow: "GET, HEAD", "Content-Length": "0" });
      response.end(); return;
    }
    let pathname;
    try { pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname); }
    catch { response.writeHead(400); response.end(); return; }
    if (pathname.includes("\0") || pathname.includes("\\")) { response.writeHead(400); response.end(); return; }
    const candidate = resolve(directory, `.${pathname}`);
    if (!contains(directory, candidate)) { response.writeHead(403); response.end(); return; }
    let entry = await findFile(candidate);
    if (!entry) entry = await findFile(`${candidate.replace(/[\\/]$/, "")}.html`);
    let status = 200;
    if (!entry) { entry = await findFile(resolve(directory, "404.html")); status = 404; }
    if (!entry) { response.writeHead(404, { "Content-Length": "0" }); response.end(); return; }

    const { file, size } = entry;
    const headers = { "Content-Type": types[extname(file).toLowerCase()] ?? "application/octet-stream", "Accept-Ranges": "bytes" };
    let start = 0, end = size - 1;
    // Range applies to successful GET representations, not HEAD or a 404 body.
    if (status === 200 && request.method === "GET" && request.headers.range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(request.headers.range.trim());
      const length = BigInt(size);
      let from = 0n, to = length - 1n;
      let valid = Boolean(match && (match[1] || match[2]) && size > 0);
      if (valid) {
        if (match[1]) { from = BigInt(match[1]); if (match[2]) to = BigInt(match[2]) < length ? BigInt(match[2]) : length - 1n; }
        else { const suffix = BigInt(match[2]); valid = suffix > 0n; from = suffix < length ? length - suffix : 0n; }
        valid = valid && from < length && from <= to;
      }
      if (!valid) {
        response.writeHead(416, { ...headers, "Content-Range": `bytes */${size}`, "Content-Length": "0" });
        response.end(); return;
      }
      start = Number(from); end = Number(to); status = 206;
      headers["Content-Range"] = `bytes ${start}-${end}/${size}`;
    }
    headers["Content-Length"] = String(size === 0 ? 0 : end - start + 1);
    response.writeHead(status, headers);
    if (request.method === "HEAD" || size === 0) { response.end(); return; }
    const stream = createReadStream(file, { start, end });
    stream.on("error", () => response.destroy());
    response.on("close", () => stream.destroy());
    stream.pipe(response);
  }

  return createServer((request, response) => {
    serve(request, response).catch(error => {
      if (response.headersSent) response.destroy();
      else { response.writeHead(error.status === 403 ? 403 : 500, { "Content-Length": "0" }); response.end(); }
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length && (args.length !== 2 || args[0] !== "--port" || !/^\d+$/.test(args[1]))) throw new Error("Usage: node apps/www/scripts/serve-export.mjs [--port 3016]");
  const port = args.length ? Number(args[1]) : 3016;
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error("Port must be an integer between 0 and 65535");
  const server = createExportServer();
  await new Promise((done, reject) => { server.once("error", reject); server.listen(port, "127.0.0.1", done); });
  console.log(`Export server ready at http://127.0.0.1:${server.address().port}`);
  const stop = () => { server.close(); server.closeAllConnections(); };
  process.once("SIGINT", stop); process.once("SIGTERM", stop);
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
