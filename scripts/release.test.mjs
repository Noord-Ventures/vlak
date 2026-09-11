import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { test } from "node:test";
import { checkRelease, checkStarterVersion } from "./check-release.mjs";
import { compareManifest, comparePayload, publishedVersion, tarFiles, verifyIntegrity } from "./check-published-release.mjs";
import { workflowManifestForRelease } from "../packages/core/scripts/workflow-manifest.mjs";

test("release declarations agree and publication requires their exact tag", () => {
  const version = checkRelease();
  assert.equal(checkRelease({ tag: `refs/tags/v${version}`, publishing: true }), version);
  assert.throws(() => checkRelease({ publishing: true }), /requires a version tag/);
  assert.throws(() => checkRelease({ tag: `v${version}-wrong`, publishing: true }), /tag must match/);
});

test("a release cannot advertise a missing npm package or an old latest tag", () => {
  const name = "@noorddev/vlak", version = "0.5.0";
  assert.throws(() => publishedVersion({ versions: {} }, name, version), /not published/);
  const document = { versions: { [version]: { name, version } }, "dist-tags": { latest: "0.4.0" } };
  assert.throws(() => publishedVersion(document, name, version), /npm latest must be/);
  document["dist-tags"].latest = version;
  assert.equal(publishedVersion(document, name, version).version, version);
});

test("advertised form starters cannot stay on the old pre-1.0 range", () => {
  checkStarterVersion({ dependencies: { "@noorddev/vlak-react": "0.5.0" } }, "0.5.0", "starter");
  assert.throws(() => checkStarterVersion({ dependencies: { "@noorddev/vlak-react": "^0.4.0" } }, "0.5.0", "starter"), /exact public release/);
});

test("workflow exports pin public versions without changing their local workspace manifest", () => {
  const local = { dependencies: { "@noorddev/vlak-react": "workspace:*", react: "^19.2.0" }, scripts: { ui: "vite" } };
  const published = workflowManifestForRelease(local, "0.5.0");
  checkStarterVersion(published, "0.5.0", "Exported workflow");
  assert.equal(local.dependencies["@noorddev/vlak-react"], "workspace:*");
  assert.equal(published.dependencies.react, "^19.2.0");
  assert.deepEqual(published.scripts, local.scripts);
  assert.throws(() => workflowManifestForRelease({ dependencies: { "private-lib": "workspace:*" } }, "0.5.0"), /unknown workspace dependency/);
});

test("published archive integrity is required and changed bytes fail", () => {
  const bytes = Buffer.from("release payload"), integrity = `sha512-${createHash("sha512").update(bytes).digest("base64")}`;
  verifyIntegrity(bytes, integrity);
  assert.throws(() => verifyIntegrity(Buffer.from("different payload"), integrity), /integrity mismatch/);
  assert.throws(() => verifyIntegrity(bytes, undefined), /supply tarball integrity/);
  assert.throws(() => verifyIntegrity(bytes, "sha1-abc"), /SHA-512/);
});

test("manifest parity preserves CSS side effects and optional dependencies", () => {
  const local = { name: "@noorddev/vlak-react", version: "0.5.0", sideEffects: ["*.css"], optionalDependencies: { renderer: "^1.0.0" } };
  compareManifest(local, structuredClone(local), local.version);
  assert.throws(() => compareManifest(local, { ...local, sideEffects: false }, local.version), /sideEffects differs/);
  assert.throws(() => compareManifest(local, { ...local, optionalDependencies: {} }, local.version), /optional dependencies differ/);
});

function archive(entries) {
  const blocks = [];
  for (const { name, content = "", type = "0" } of entries) {
    const bytes = Buffer.from(content), header = Buffer.alloc(512);
    header.write(name); header.write(bytes.length.toString(8).padStart(11, "0"), 124); header.write(type, 156);
    blocks.push(header, bytes, Buffer.alloc((512 - bytes.length % 512) % 512));
  }
  return gzipSync(Buffer.concat([...blocks, Buffer.alloc(1024)]));
}

test("npm archive parsing reads files without extraction and rejects links or traversal", () => {
  const manifest = { name: "package/package.json", content: "{}" };
  const files = tarFiles(archive([manifest, { name: "package/dist/index.js", content: "export const ready = true;" }]));
  assert.equal(files.get("dist/index.js").toString(), "export const ready = true;");
  assert.throws(() => tarFiles(archive([manifest, { name: "package/../secret" }])), /Unsafe tar path/);
  assert.throws(() => tarFiles(archive([manifest, { name: "package/dist/link", type: "2" }])), /Unsupported tar entry/);
  assert.throws(() => tarFiles(archive([manifest, manifest])), /duplicate package path/);
});

test("same version with missing exports or stale runtime bytes fails parity", () => {
  const local = new Map([["dist/index.js", Buffer.from("export const IOSSheet = true;")]]);
  assert.equal(comparePayload(local, new Map([...local, ["dist/index.js.map", Buffer.from("machine-specific map")]]), ["dist"], "React"), 1);
  assert.throws(() => comparePayload(local, new Map(), ["dist"], "React"), /payload differs/);
  assert.throws(() => comparePayload(local, new Map([["dist/index.js", Buffer.from("export const Button = true;")]]), ["dist"], "React"), /differs from this checkout/);
});
