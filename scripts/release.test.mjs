import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { test } from "node:test";
import { checkRelease, checkStarterVersion } from "./check-release.mjs";
import { compareManifest, comparePayload, fetchBytes, publishedReports, publishedVersion, RegistryNotReadyError, tarFiles, verifyIntegrity, verifyWithRegistryReadiness } from "./check-published-release.mjs";
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

test("only missing versions and latest visibility are classified as registry delays", () => {
  const name = "@noorddev/vlak", version = "0.5.0";
  assert.throws(() => publishedVersion({ versions: {} }, name, version), RegistryNotReadyError);
  const document = { versions: { [version]: { name, version } }, "dist-tags": { latest: "0.4.0" } };
  assert.throws(() => publishedVersion(document, name, version), RegistryNotReadyError);
  document.versions[version].name = "wrong-package";
  assert.throws(() => publishedVersion(document, name, version), error => error instanceof assert.AssertionError && !(error instanceof RegistryNotReadyError));
  document.versions[version] = { name, version: "0.4.0" };
  assert.throws(() => publishedVersion(document, name, version), error => error instanceof assert.AssertionError && !(error instanceof RegistryNotReadyError));
});

test("only official registry 404 responses are retriable; auth, outages, and network failures are fatal", async () => {
  const url = "https://registry.npmjs.org/%40noorddev%2Fvlak";
  await assert.rejects(fetchBytes(url, async () => new Response(null, { status: 404 })), RegistryNotReadyError);
  for (const status of [401, 403, 429, 500, 503]) {
    await assert.rejects(fetchBytes(url, async () => new Response(null, { status })), error => error instanceof assert.AssertionError && !(error instanceof RegistryNotReadyError));
  }
  const networkFailure = new TypeError("fetch failed");
  await assert.rejects(fetchBytes(url, async () => { throw networkFailure; }), error => error === networkFailure);
  for (const untrusted of ["https://example.com/package", "http://registry.npmjs.org/package"]) {
    await assert.rejects(fetchBytes(untrusted, () => assert.fail("untrusted registry must not be requested")), /only reads the official npm registry/);
  }
  assert.equal((await fetchBytes(url, async (_url, options) => {
    assert.equal(options.cache, "no-store");
    assert.ok(options.signal instanceof AbortSignal);
    return new Response("public package metadata");
  })).toString(), "public package metadata");
});

test("post-publication readiness retries visibility every twenty seconds and converges", async () => {
  let clock = 0, attempts = 0;
  const delays = [], messages = [], expected = { version: "0.5.0", reports: ["verified"] };
  const result = await verifyWithRegistryReadiness(({ signal }) => {
    assert.ok(signal instanceof AbortSignal);
    assert.equal(signal.aborted, false);
    attempts += 1;
    if (attempts < 3) throw new RegistryNotReadyError(attempts === 1 ? "missing version" : "stale latest");
    return expected;
  }, {
    wait: true, now: () => clock,
    sleep: async delay => { delays.push(delay); clock += delay; },
    onRetry: event => { messages.push(event); },
  });
  assert.equal(result, expected);
  assert.equal(attempts, 3);
  assert.deepEqual(delays, [20_000, 20_000]);
  assert.deepEqual(messages.map(({ remainingMs }) => remainingMs), [600_000, 580_000]);
});

test("registry readiness stops at ten minutes without a final out-of-budget attempt", async () => {
  let clock = 0, attempts = 0;
  const delays = [], missing = new RegistryNotReadyError("not visible");
  await assert.rejects(verifyWithRegistryReadiness(() => {
    attempts += 1;
    throw missing;
  }, {
    wait: true, now: () => clock,
    sleep: async delay => { delays.push(delay); clock += delay; },
  }), error => /readiness timed out after 600s/.test(error.message) && error.cause === missing);
  assert.equal(clock, 600_000);
  assert.equal(attempts, 30);
  assert.deepEqual(delays, Array(30).fill(20_000));
});

test("a slow verification attempt cannot add its duration to the readiness budget", async () => {
  let clock = 0, attempts = 0;
  const delays = [];
  await assert.rejects(verifyWithRegistryReadiness(() => {
    attempts += 1;
    clock += 599_000;
    throw new RegistryNotReadyError("still cached");
  }, {
    wait: true, now: () => clock,
    sleep: async delay => { delays.push(delay); clock += delay; },
  }), /readiness timed out/);
  assert.equal(attempts, 1);
  assert.deepEqual(delays, [1_000]);
  assert.equal(clock, 600_000);
});

test("strict integrity, manifest, and payload failures never retry after publication", async () => {
  const manifest = { name: "@noorddev/vlak-react", version: "0.5.0", sideEffects: ["*.css"] };
  const checks = [
    () => verifyIntegrity(Buffer.from("changed"), `sha512-${createHash("sha512").update("original").digest("base64")}`),
    () => compareManifest(manifest, { ...manifest, sideEffects: false }, manifest.version),
    () => comparePayload(new Map([["dist/index.js", Buffer.from("new")]]), new Map([["dist/index.js", Buffer.from("old")]]), ["dist"], "React"),
  ];
  for (const check of checks) {
    let attempts = 0;
    await assert.rejects(verifyWithRegistryReadiness(() => {
      attempts += 1;
      return check();
    }, { wait: true, sleep: () => assert.fail("strict failures must not sleep") }), assert.AssertionError);
    assert.equal(attempts, 1);
  }
});

test("a visibility delay cannot hide another package's strict failure or cause a retry", async () => {
  const fatal = new Error("published runtime differs");
  let attempts = 0;
  await assert.rejects(verifyWithRegistryReadiness(() => {
    attempts += 1;
    return publishedReports([
      Promise.reject(new RegistryNotReadyError("missing version")),
      Promise.resolve("valid package"),
      Promise.reject(fatal),
      new Promise(() => {}), // A stalled package must not delay a known fatal failure.
    ]);
  }, { wait: true, sleep: () => assert.fail("strict failures must not sleep") }), error => error === fatal);
  assert.equal(attempts, 1);
  await assert.rejects(publishedReports([Promise.resolve("valid"), Promise.reject(new RegistryNotReadyError("missing"))]), RegistryNotReadyError);
  assert.deepEqual(await publishedReports([Promise.resolve("first"), Promise.resolve("second")]), ["first", "second"]);
});

test("normal production verification does not retry even explicit visibility delays", async () => {
  let attempts = 0;
  const missing = new RegistryNotReadyError("missing version");
  await assert.rejects(verifyWithRegistryReadiness(() => {
    attempts += 1;
    throw missing;
  }, { sleep: () => assert.fail("production verification must remain one-shot") }), error => error === missing);
  assert.equal(attempts, 1);
});

test("readiness configuration cannot exceed the ten-minute cap or busy-loop", async () => {
  for (const maxWaitMs of [0, -1, 600_001, Infinity, 0.5]) {
    await assert.rejects(verifyWithRegistryReadiness(() => assert.fail("invalid budget must not check"), { wait: true, maxWaitMs }), /bounded to at most ten minutes/);
  }
  for (const intervalMs of [0, -1, Infinity, 0.5]) {
    await assert.rejects(verifyWithRegistryReadiness(() => assert.fail("invalid interval must not check"), { wait: true, intervalMs }), /positive whole number/);
  }
});
