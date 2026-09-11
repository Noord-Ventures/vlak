import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const releaseRoot = fileURLToPath(new URL("../", import.meta.url));
export const releasePackages = [
  { directory: "core", name: "@noorddev/vlak", payload: ["dist", "css", "tokens", "props"] },
  { directory: "react", name: "@noorddev/vlak-react", payload: ["dist"] },
  { directory: "cli", name: "@noorddev/vlak-cli", payload: ["dist"] },
  { directory: "mcp", name: "@noorddev/vlak-mcp", payload: ["dist"] },
];
export const readJson = (root, path) => JSON.parse(readFileSync(resolve(root, path), "utf8"));

export function checkStarterVersion(manifest, version, path) {
  assert.equal(manifest.dependencies?.["@noorddev/vlak-react"], version, `${path} must install the exact public release shown on the site`);
}

export function checkRelease({ root = releaseRoot, tag, publishing = false, generated = false } = {}) {
  const version = readJson(root, "package.json").version;
  assert.match(version, /^\d+\.\d+\.\d+$/, "Releases require a stable semantic version");
  if (publishing) assert.ok(tag, "Publishing requires a version tag. Run the release workflow on v" + version);
  if (tag) assert.equal(tag.replace(/^refs\/tags\//, ""), `v${version}`, "Release tag must match the checked-out package version");
  for (const { directory, name } of releasePackages) {
    const manifest = readJson(root, `packages/${directory}/package.json`);
    assert.equal(manifest.name, name);
    assert.equal(manifest.version, version, `${name} must match the root release version`);
    assert.ok(!manifest.private, `${name} must be publishable`);
    assert.equal(manifest.publishConfig?.access, "public", `${name} must publish publicly`);
  }
  for (const path of ["apps/www/package.json", "server.json", "plugins/vlak/plugin.json", "plugins/vlak/.claude-plugin/plugin.json"]) {
    assert.equal(readJson(root, path).version, version, `${path} must match the release version`);
  }
  for (const path of ["examples/vite-react/package.json", "examples/next-app/package.json"]) checkStarterVersion(readJson(root, path), version, path);
  assert.equal(readJson(root, "examples/workflows/package.json").dependencies?.["@noorddev/vlak-react"], "workspace:*", "Local workflow checks must use the workspace React package");
  const listing = readJson(root, ".claude-plugin/marketplace.json").plugins.find(plugin => plugin.name === "vlak");
  assert.equal(listing?.version, version, "Claude marketplace must match the release version");
  const args = readJson(root, "plugins/vlak/.mcp.json").mcpServers.vlak.args;
  assert.ok(args.includes(`@noorddev/vlak-mcp@${version}`), "The stdio plugin must pin the matching MCP release");
  assert.match(readFileSync(resolve(root, "CHANGELOG.md"), "utf8"), new RegExp(`^## ${version.replaceAll(".", "\\.")}(?: |$)`, "m"), "The release needs a changelog entry");
  if (generated) {
    for (const path of ["registry/bundle.json", "packages/core/props/props.json", "packages/cli/dist/registry/bundle.json", "packages/mcp/dist/registry/bundle.json", "packages/mcp/dist/props.json"]) {
      assert.equal(readJson(root, path).version, version, `${path} is stale; rebuild packages and registry`);
    }
    const bundle = readJson(root, "registry/bundle.json");
    const workflowManifestPath = "examples/workflows/package.json";
    const exportedManifest = JSON.parse(bundle.workflows?.files?.[workflowManifestPath] ?? "{}");
    checkStarterVersion(exportedManifest, version, "Exported workflow kit");
    assert.ok(!JSON.stringify(exportedManifest).includes("workspace:"), "Exported workflows must not require this monorepo");
    const workflowIndex = readJson(root, "registry/workflows/index.json");
    assert.deepEqual(JSON.parse(workflowIndex.files[workflowManifestPath]), exportedManifest, "Workflow index must match the bundled public manifest");
    const names = bundle.items.filter(item => item.type === "registry:component" && !item.meta?.vlak?.hidden).map(item => item.name).sort();
    assert.ok(names.length > 0, "The release registry is empty");
    assert.equal(new Set(names).size, names.length, "The release catalog has duplicate names");
    for (const directory of ["cli", "mcp"]) {
      assert.deepEqual(readJson(root, `packages/${directory}/dist/registry/bundle.json`), bundle, `${directory} must ship the current registry and docs`);
    }
  }
  return version;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  assert.ok([...args].every(arg => ["--generated", "--publishing"].includes(arg)), "Usage: node scripts/check-release.mjs [--generated] [--publishing]");
  const ref = process.env.GITHUB_REF;
  const version = checkRelease({ tag: ref?.startsWith("refs/tags/") ? ref : undefined, publishing: args.has("--publishing"), generated: args.has("--generated") });
  console.log(`Release ${version}: package, site, plugin, server${args.has("--generated") ? ", and generated registry" : ""} versions match.`);
}
