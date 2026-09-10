import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, symlink, writeFile } from "node:fs/promises";
import { request } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";
import { createExportServer } from "./serve-export.mjs";

let temporary, server, port;
before(async () => {
  temporary = await mkdtemp(join(tmpdir(), "vlak-export-test-"));
  const root = join(temporary, "out");
  await mkdir(join(root, "docs"), { recursive: true });
  await Promise.all([
    writeFile(join(root, "index.html"), "Home"), writeFile(join(root, "docs", "index.html"), "Documentation"),
    writeFile(join(root, "guide.html"), "Guide"), writeFile(join(root, "404.html"), "Not found"),
    writeFile(join(root, "clip.mp4"), "0123456789"), writeFile(join(root, "empty.txt"), ""),
    writeFile(join(temporary, "private.txt"), "Must stay outside"),
  ]);
  await symlink(join(temporary, "private.txt"), join(root, "escape.txt"));
  server = createExportServer({ root });
  await new Promise(done => server.listen(0, "127.0.0.1", done));
  port = server.address().port;
});
after(async () => { if (server) await new Promise(done => server.close(done)); if (temporary) await rm(temporary, { recursive: true, force: true }); });
function get(path, headers = {}, method = "GET") {
  return new Promise((done, reject) => {
    const req = request({ hostname: "127.0.0.1", port, path, headers, method, agent: false }, response => {
      const chunks = [];
      response.on("data", chunk => chunks.push(chunk));
      response.on("end", () => done({ status: response.statusCode, headers: response.headers, body: Buffer.concat(chunks).toString() }));
      response.on("error", reject);
    });
    req.on("error", reject); req.end();
  });
}

test("serves export directory indexes, extensionless HTML and the real 404 status", async () => {
  for (const [path, body] of [["/", "Home"], ["/docs/", "Documentation"], ["/docs", "Documentation"], ["/guide", "Guide"]]) {
    const response = await get(path);
    assert.equal(response.status, 200); assert.equal(response.body, body);
    assert.equal(response.headers["content-type"], "text/html; charset=utf-8");
  }
  const missing = await get("/missing?query=ignored");
  assert.equal(missing.status, 404); assert.equal(missing.body, "Not found");
});

test("media requests return bounded, open-ended and suffix byte ranges", async () => {
  for (const [range, body, contentRange] of [["bytes=2-5", "2345", "bytes 2-5/10"], ["bytes=7-", "789", "bytes 7-9/10"], ["bytes=-3", "789", "bytes 7-9/10"], ["bytes=8-99", "89", "bytes 8-9/10"], ["bytes=-99", "0123456789", "bytes 0-9/10"], ["bytes=8-999999999999999999999", "89", "bytes 8-9/10"]]) {
    const response = await get("/clip.mp4", { Range: range });
    assert.equal(response.status, 206, range); assert.equal(response.body, body, range);
    assert.equal(response.headers["content-range"], contentRange);
    assert.equal(response.headers["content-length"], String(body.length));
    assert.equal(response.headers["accept-ranges"], "bytes");
    assert.equal(response.headers["content-type"], "video/mp4");
  }
});

test("invalid or unsatisfiable ranges return 416 without streaming the file", async () => {
  for (const range of ["bytes=10-", "bytes=7-3", "bytes=-0", "bytes=-", "bytes=0-1,3-4", "items=1-2", "bytes=abc-def"]) {
    const response = await get("/clip.mp4", { Range: range });
    assert.equal(response.status, 416, range); assert.equal(response.body, "");
    assert.equal(response.headers["content-range"], "bytes */10");
    assert.equal(response.headers["content-length"], "0");
  }
  const empty = await get("/empty.txt", { Range: "bytes=0-" });
  assert.equal(empty.status, 416); assert.equal(empty.headers["content-range"], "bytes */0");
});

test("HEAD returns the full representation headers without a body; empty files stay valid", async () => {
  const response = await get("/clip.mp4", { Range: "bytes=0-1" }, "HEAD");
  assert.equal(response.status, 200); assert.equal(response.body, "");
  assert.equal(response.headers["content-length"], "10"); assert.equal(response.headers["content-range"], undefined);
  const empty = await get("/empty.txt");
  assert.equal(empty.status, 200); assert.equal(empty.body, ""); assert.equal(empty.headers["content-length"], "0");
  const post = await get("/clip.mp4", {}, "POST");
  assert.equal(post.status, 405); assert.equal(post.headers.allow, "GET, HEAD");
});

test("decoded traversal, escaped symlinks and malformed URLs cannot expose outside files", async () => {
  for (const path of ["/%2e%2e%2fprivate.txt", "/escape.txt"]) {
    const response = await get(path); assert.equal(response.status, 403, path); assert.equal(response.body, "");
  }
  for (const path of ["/%ZZ", "/%00", "/%5c..%5cprivate.txt"]) {
    const response = await get(path); assert.equal(response.status, 400, path); assert.equal(response.body, "");
  }
  assert.equal((await get("/docs/")).status, 200, "server remains usable after rejected paths");
});
