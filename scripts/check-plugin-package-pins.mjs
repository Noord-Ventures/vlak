import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const npmPin = /^(?:@[a-z0-9._-]+\/)?[a-z0-9._-]+@\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const pythonPin = /^[A-Za-z0-9._-]+(?:\[[A-Za-z0-9_,.-]+\])?==\d+(?:\.\d+)+(?:[A-Za-z0-9.+-]*)$/;
// Lookahead also inspects nested runners instead of consuming them in an outer command.
const runners = /(?=\b(npx|bunx|uvx|npm|pnpm|yarn|bun|uv)(?:\.cmd)?\s+([^\n`;&|]+))/g;
const tokenize = text => (text.match(/(?:"[^"\n]*"|'[^'\n]*'|[^\s"'])+/g) ?? []).map(token => token.replace(/(["'])(.*?)\1/g, "$2"));

export function assertExactPackage(spec, label, python = false) {
  assert.match(spec, python ? pythonPin : npmPin, `${label}: executable package must use an exact version: ${spec}`);
}

export function checkRunner(command, args, label) {
  const runner = basename(command.replaceAll("\\", "/")).replace(/\.cmd$/, "");
  const rest = [...args];
  if (["npm", "pnpm", "yarn", "bun", "uv"].includes(runner)) {
    const prefix = { npm: ["exec"], pnpm: ["dlx"], yarn: ["dlx"], bun: ["x"], uv: ["tool", "run"] }[runner];
    const start = rest.indexOf(prefix[0]);
    if (start < 0) return false;
    assert.ok(rest.slice(0, start).every(token => ["-y", "--yes", "--quiet", "--silent", "--no", "--ignore-scripts"].includes(token)), `${label}: unsupported global runner options; review their package/version handling`);
    assert.ok(prefix.every((word, index) => rest[start + index] === word), `${label}: unsupported runner subcommand`);
    rest.splice(0, start + prefix.length);
  } else if (!["npx", "bunx", "uvx"].includes(runner)) return false;

  const python = runner === "uvx" || runner === "uv";
  let explicitPackage = false;
  while (rest.length) {
    const token = rest.shift();
    if (token === "--") break;
    if (["-y", "--yes", "--no", "-q", "--quiet", "--no-install", "--ignore-scripts"].includes(token)) continue;
    if (["-p", "--package", "--from", "--with"].includes(token)) {
      assertExactPackage(rest.shift() ?? "", label, python);
      if (token !== "--with") explicitPackage = true;
      continue;
    }
    const option = token.match(/^(?:--package|--from|--with)=(.+)$/);
    if (option) {
      assertExactPackage(option[1], label, python);
      if (!token.startsWith("--with=")) explicitPackage = true;
      continue;
    }
    assert.ok(!token.startsWith("-"), `${label}: unsupported runner option ${token}; review its package/version handling`);
    rest.unshift(token);
    break;
  }
  // With --package/--from, the next argument is that package's local binary.
  if (!explicitPackage) assertExactPackage(rest[0] ?? "", label, python);
  return true;
}

export function checkCommandText(text, label) {
  for (const match of text.replace(/\\\r?\n/g, " ").matchAll(runners)) {
    const [command, ...prefix] = match[1].split(/\s+/);
    checkRunner(command, [...prefix, ...tokenize(match[2])], label);
  }
}

export function checkJsonCommands(value, label) {
  if (typeof value === "string") checkCommandText(value, label);
  else if (value && typeof value === "object") {
    if (typeof value.command === "string" && Array.isArray(value.args)) {
      checkRunner(value.command, value.args, label);
      // Shell/env wrappers can split a nested package runner across JSON arguments.
      checkCommandText([value.command, ...value.args].join(" "), label);
    }
    for (const child of Object.values(value)) checkJsonCommands(child, label);
  }
}

export function checkVlakVersions(text, version, label) {
  for (const match of text.matchAll(/@noorddev\/vlak(?:-(?:react|cli|mcp))?@([0-9][0-9A-Za-z.+-]*)/g)) {
    assert.equal(match[1], version, `${label}: Vlak package pin must match plugin release ${version}: ${match[0]}`);
  }
}

export function checkPluginPackagePins(pluginDirectory = resolve(root, "plugins/vlak")) {
  const manifestPath = join(pluginDirectory, ".claude-plugin/plugin.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  assert.equal(manifest.name, "vlak", "Submit plugins/vlak, not the repository marketplace root");
  let files = 0;
  const scan = directory => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      assert.ok(!entry.isSymbolicLink(), `${path}: plugin review inputs must not be symbolic links`);
      if (entry.isDirectory()) scan(path);
      else if ([".json", ".md", ".txt", ".sh", ".bash", ".zsh", ".js", ".mjs", ".ts", ".py", ".yaml", ".yml"].includes(extname(path))) {
        const text = readFileSync(path, "utf8");
        checkVlakVersions(text, manifest.version, path);
        if (extname(path) === ".json") checkJsonCommands(JSON.parse(text), path);
        else checkCommandText(text, path);
        files += 1;
      }
    }
  };
  scan(pluginDirectory);
  return files;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(`Claude plugin package pins verified in ${checkPluginPackagePins()} files; submit plugins/vlak.`);
}
