// Read-only registry verification. No install scripts, package publication, or
// filesystem extraction. Production builds must call this after package builds.
import assert from "node:assert/strict";
import { createHash, timingSafeEqual } from "node:crypto";
import { lstatSync, readFileSync, readdirSync } from "node:fs";
import { resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";
import { checkRelease, readJson, releasePackages, releaseRoot } from "./check-release.mjs";

/** npm metadata and tarballs can become publicly visible after publication. */
export class RegistryNotReadyError extends Error {
  constructor(message) { super(message); this.name = "RegistryNotReadyError"; }
}

export function publishedVersion(document, name, version) {
  const manifest = document.versions?.[version];
  if (!manifest) throw new RegistryNotReadyError(`${name}@${version} is not published. Publish all four packages before deploying the site.`);
  assert.equal(manifest.name, name);
  assert.equal(manifest.version, version);
  if (document["dist-tags"]?.latest !== version) throw new RegistryNotReadyError(`${name}: npm latest must be ${version} because the site advertises an unversioned install`);
  return manifest;
}

export function verifyIntegrity(bytes, integrity) {
  assert.equal(typeof integrity, "string", "npm must supply tarball integrity");
  const digest = integrity.split(/\s+/).find(item => item.startsWith("sha512-"));
  assert.ok(digest, "npm tarball must have SHA-512 integrity");
  const expected = Buffer.from(digest.slice("sha512-".length), "base64");
  const actual = createHash("sha512").update(bytes).digest();
  assert.ok(expected.length === actual.length && timingSafeEqual(expected, actual), "Published tarball integrity mismatch");
}

function paxFields(bytes) {
  const fields = {};
  for (let offset = 0; offset < bytes.length;) {
    const space = bytes.indexOf(32, offset), length = Number(bytes.subarray(offset, space).toString());
    assert.ok(space > offset && Number.isSafeInteger(length) && length > space - offset + 1 && offset + length <= bytes.length, "Invalid tar PAX record");
    const field = bytes.subarray(space + 1, offset + length - 1).toString(), equals = field.indexOf("=");
    assert.ok(equals > 0, "Invalid tar PAX field");
    fields[field.slice(0, equals)] = field.slice(equals + 1);
    offset += length;
  }
  return fields;
}

/** Parse regular npm package files in memory. Reject links and path escapes. */
export function tarFiles(compressed) {
  const tar = gunzipSync(compressed, { maxOutputLength: 128 * 1024 * 1024 }), files = new Map();
  const field = (header, start, length) => header.subarray(start, start + length).toString().replace(/\0.*$/s, "");
  let nextPax = {}, globalPax = {};
  for (let offset = 0; offset + 512 <= tar.length;) {
    const header = tar.subarray(offset, offset + 512);
    if (header.every(byte => byte === 0)) break;
    const size = Number.parseInt(field(header, 124, 12).trim() || "0", 8), type = field(header, 156, 1);
    assert.ok(Number.isSafeInteger(size) && size >= 0 && offset + 512 + size <= tar.length, "Invalid tar entry size");
    const bytes = tar.subarray(offset + 512, offset + 512 + size);
    offset += 512 + Math.ceil(size / 512) * 512;
    if (type === "x" || type === "g") {
      if (type === "x") nextPax = paxFields(bytes); else globalPax = { ...globalPax, ...paxFields(bytes) };
      continue;
    }
    const attributes = { ...globalPax, ...nextPax };
    nextPax = {};
    const prefix = field(header, 345, 155);
    const name = attributes.path ?? `${prefix ? `${prefix}/` : ""}${field(header, 0, 100)}`;
    assert.ok(name.startsWith("package/") && !name.includes("\\") && !name.split("/").includes(".."), `Unsafe tar path: ${name}`);
    if (type === "5") continue;
    assert.ok(type === "0" || type === "", `Unsupported tar entry ${name}: ${type}`);
    const path = name.slice("package/".length);
    assert.ok(path && !path.startsWith("/") && !files.has(path), `Invalid or duplicate package path: ${path}`);
    files.set(path, bytes);
  }
  assert.ok(files.has("package.json"), "Published tarball has no package manifest");
  return files;
}

function runtimeFile(path, roots) {
  return !path.endsWith(".map") && roots.some(root => path === root || path.startsWith(`${root}/`));
}

export function builtFiles(directory, roots) {
  const files = new Map();
  function walk(path) {
    const stat = lstatSync(path);
    assert.ok(!stat.isSymbolicLink(), `Release payload cannot contain a symlink: ${path}`);
    if (stat.isDirectory()) for (const name of readdirSync(path).sort()) walk(resolve(path, name));
    else {
      const name = relative(directory, path).replaceAll("\\", "/");
      if (runtimeFile(name, roots)) files.set(name, readFileSync(path));
    }
  }
  for (const root of roots) walk(resolve(directory, root));
  assert.ok(files.size, "Build the local release packages before checking published parity");
  return files;
}

export function comparePayload(expected, published, roots, name) {
  const remote = new Map([...published].filter(([path]) => runtimeFile(path, roots)));
  assert.deepEqual([...remote.keys()].sort(), [...expected.keys()].sort(), `${name}: published runtime/type/CSS payload differs from this checkout`);
  for (const [path, bytes] of expected) assert.ok(bytes.equals(remote.get(path)), `${name}: published ${path} differs from this checkout; publish a new version before updating the site`);
  return remote.size;
}

function publishDependencies(dependencies, version) {
  return Object.fromEntries(Object.entries(dependencies ?? {}).map(([name, value]) => [name, value === "workspace:^" ? `^${version}` : value === "workspace:*" ? version : value]));
}

export function compareManifest(local, published, version) {
  for (const key of ["name", "version", "exports", "main", "types", "sideEffects", "peerDependencies", "peerDependenciesMeta", "engines"]) {
    assert.deepEqual(published[key], local[key], `${local.name}: published ${key} differs`);
  }
  assert.deepEqual(published.dependencies ?? {}, publishDependencies(local.dependencies, version), `${local.name}: published dependencies differ`);
  assert.deepEqual(published.optionalDependencies ?? {}, publishDependencies(local.optionalDependencies, version), `${local.name}: published optional dependencies differ`);
  const bins = value => Object.fromEntries(Object.entries(value ?? {}).map(([name, path]) => [name, path.replace(/^\.\//, "")]));
  assert.deepEqual(bins(published.bin), bins(local.bin), `${local.name}: published executables differ`);
}

export async function fetchBytes(url, fetcher, signal) {
  const target = new URL(url);
  assert.ok(target.protocol === "https:" && target.hostname === "registry.npmjs.org", "Release verification only reads the official npm registry");
  const requestTimeout = AbortSignal.timeout(30_000);
  const response = await fetcher(target.href, { cache: "no-store", signal: signal ? AbortSignal.any([signal, requestTimeout]) : requestTimeout });
  if (response.status === 404) throw new RegistryNotReadyError(`npm has not made ${target.pathname} visible yet (404)`);
  assert.ok(response.ok, `npm returned ${response.status} for ${target.pathname}; publish all four packages before deploying the site`);
  return Buffer.from(await response.arrayBuffer());
}

/** A visibility delay in one package must not hide another package's corruption. */
export async function publishedReports(checks) {
  const results = await Promise.all(checks.map(async check => {
    try { return { report: await check }; }
    catch (error) {
      if (!(error instanceof RegistryNotReadyError)) throw error;
      return { notReady: error };
    }
  }));
  const failure = results.find(result => result.notReady);
  if (failure) throw failure.notReady;
  return results.map(result => result.report);
}

export async function checkPublishedRelease({ root = releaseRoot, fetcher = fetch, signal } = {}) {
  const version = checkRelease({ root, generated: true });
  const reports = await publishedReports(releasePackages.map(async ({ directory, name, payload }) => {
    const local = readJson(root, `packages/${directory}/package.json`);
    const document = JSON.parse((await fetchBytes(`https://registry.npmjs.org/${encodeURIComponent(name)}`, fetcher, signal)).toString());
    const manifest = publishedVersion(document, name, version);
    const archive = await fetchBytes(manifest.dist.tarball, fetcher, signal);
    verifyIntegrity(archive, manifest.dist.integrity);
    const files = tarFiles(archive), packagedManifest = JSON.parse(files.get("package.json").toString());
    compareManifest(local, packagedManifest, version);
    const count = comparePayload(builtFiles(resolve(root, "packages", directory), payload), files, payload, name);
    return `${name}@${version}: latest, SHA-512 integrity, exports, and ${count} payload files match`;
  }));
  return { version, reports };
}

/** Opt-in only after publication; normal production builds still check once. */
export async function verifyWithRegistryReadiness(check, {
  wait = false, maxWaitMs = 10 * 60_000, intervalMs = 20_000,
  now = Date.now, sleep = milliseconds => new Promise(done => setTimeout(done, milliseconds)), onRetry = () => {},
} = {}) {
  if (!wait) return check();
  assert(Number.isSafeInteger(maxWaitMs) && maxWaitMs > 0 && maxWaitMs <= 10 * 60_000, "Registry readiness wait must be bounded to at most ten minutes");
  assert(Number.isSafeInteger(intervalMs) && intervalMs > 0, "Registry readiness interval must be a positive whole number of milliseconds");
  const deadline = now() + maxWaitMs;
  let lastFailure;
  const timeout = () => new Error(`npm registry readiness timed out after ${maxWaitMs / 1000}s; the published release has not passed verification`, { cause: lastFailure });
  for (;;) {
    const remaining = deadline - now();
    if (remaining <= 0) throw timeout();
    try {
      // The same deadline bounds a slow metadata or tarball request too.
      return await check({ signal: AbortSignal.timeout(remaining) });
    } catch (error) {
      if (!(error instanceof RegistryNotReadyError)) throw error;
      lastFailure = error;
      const delay = Math.min(intervalMs, deadline - now());
      if (delay <= 0) throw timeout();
      onRetry({ error, delay, remainingMs: deadline - now() });
      await sleep(delay);
    }
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  assert(args.length === 0 || args.length === 1 && args[0] === "--wait", "Usage: node scripts/check-published-release.mjs [--wait]");
  try {
    const result = await verifyWithRegistryReadiness(options => checkPublishedRelease(options), {
      wait: args[0] === "--wait",
      onRetry: ({ error, delay, remainingMs }) => console.log(`Waiting for npm visibility: ${error.message} Retrying in ${delay / 1000}s (${Math.ceil(remainingMs / 1000)}s remaining).`),
    });
    for (const report of result.reports) console.log(report);
    console.log(`Published release ${result.version} matches this site. Production export may proceed.`);
  } catch (error) {
    console.error(`Published release check failed: ${error.message}`);
    console.error("Keep the existing production site. Complete the npm release, verify all latest tags, then redeploy this checkout. See docs/releases.md.");
    process.exitCode = 1;
  }
}
