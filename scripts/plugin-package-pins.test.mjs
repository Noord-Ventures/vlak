import assert from "node:assert/strict";
import { test } from "node:test";
import { assertExactPackage, checkCommandText, checkJsonCommands, checkPluginPackagePins, checkRunner, checkVlakVersions } from "./check-plugin-package-pins.mjs";

test("the submitted plugin folder contains a usable manifest and exact package commands", () => {
  assert.ok(checkPluginPackagePins() >= 6);
});

test("exact scoped, unscoped and prerelease npm packages are accepted", () => {
  for (const spec of ["@noorddev/vlak-mcp@0.5.0", "shadcn@4.21.4", "tool@1.2.3-beta.1+build.2"]) {
    assert.doesNotThrow(() => assertExactPackage(spec, "fixture"));
  }
});

test("missing versions, tags, ranges, URLs and substitutions fail closed", () => {
  // biome-ignore lint/suspicious/noTemplateCurlyInString: The literal substitution must be rejected, never interpolated.
  for (const spec of ["tool", "@noorddev/vlak-mcp", "tool@latest", "tool@next", "tool@^1.2.3", "tool@~1.2.3", "tool@1", "tool@1.2", "tool@*", "tool@${VERSION}", "github:owner/repo", "https://example.com/tool.tgz"]) {
    assert.throws(() => assertExactPackage(spec, "fixture"), /exact version/);
  }
});

test("Markdown commands check every runner, including nested and continued commands", () => {
  for (const prefix of ["npx", "npx.cmd", "npx -y", "npx --yes", "npm exec --", "npm --yes exec", "pnpm --silent dlx", "pnpm dlx", "yarn dlx", "bunx", "bun x", "codex mcp add vlak -- npx -y"]) {
    checkCommandText(`Run \`${prefix} tool@1.2.3 add button\`.`, "fixture");
    assert.throws(() => checkCommandText(`Run \`${prefix} tool@latest add button\`.`, "fixture"), /exact version/);
  }
  checkCommandText(["npx \\", "    -y tool@1.2.3"].join("\n"), "fixture");
  assert.throws(() => checkCommandText("npx tool@1.2.3; npx other", "fixture"), /exact version/);
  assert.throws(() => checkCommandText("npx tool@1.2.3 && npx other", "fixture"), /exact version/);
  assert.throws(() => checkCommandText('npx tool@1.2.3 --command "npx other"', "fixture"), /exact version/);
});

test("explicit package options are checked while their local binary stays unversioned", () => {
  checkCommandText('npx --package="tool@1.2.3" tool run', "fixture");
  checkRunner("npx", ["-y", "-p", "tool@1.2.3", "-p", "other@2.0.0", "tool"], "fixture");
  checkRunner("npm", ["exec", "--package=tool@1.2.3", "--", "tool"], "fixture");
  assert.throws(() => checkRunner("npx", ["--package=tool@latest", "tool"], "fixture"), /exact version/);
  assert.throws(() => checkRunner("npx", ["--package", "tool@1.2.3", "--package", "other", "tool"], "fixture"), /exact version/);
  assert.throws(() => checkRunner("npx", ["--unknown", "tool@1.2.3"], "fixture"), /unsupported runner option/);
});

test("Python runners require exact versions too", () => {
  checkCommandText("uvx tool==1.2.3", "fixture");
  checkCommandText("uv tool run --from tool==1.2.3 tool", "fixture");
  checkRunner("uvx", ["--from", "tool==1.2.3", "--with", "helper==2.0.0", "tool"], "fixture");
  for (const command of ["uvx tool", "uvx tool>=1.2.3", "uv tool run --from tool tool", "uvx --from tool==1.2.3 --with helper tool", "uvx --with helper==2.0.0 tool", "uvx --with=helper==2.0.0 tool"]) {
    assert.throws(() => checkCommandText(command, "fixture"), /exact version/);
  }
});

test("JSON MCP launchers reject bare packages and accept executable paths", () => {
  assert.throws(() => checkRunner("npx", ["-y", "@noorddev/vlak-mcp"], "MCP"), /exact version/);
  assert.equal(checkRunner("/usr/local/bin/npx", ["-y", "@noorddev/vlak-mcp@0.5.0"], "MCP"), true);
  assert.equal(checkRunner("node", ["./server.js"], "MCP"), false);
  for (const [command, args] of [["env", ["npx", "tool"]], ["cmd", ["/c", "npx", "tool"]], ["sh", ["-c", "npx tool"]], ["npx.cmd", ["tool"]], ["C:\\node\\npx.cmd", ["tool"]]]) {
    assert.throws(() => checkJsonCommands({ mcpServers: { fixture: { command, args } } }, "MCP"), /exact version/);
  }
  checkJsonCommands({ command: "env", args: ["npx", "tool@1.2.3"] }, "MCP");
});

test("Vlak pins in skills, docs and launchers cannot drift from the plugin release", () => {
  for (const name of ["vlak", "vlak-react", "vlak-cli", "vlak-mcp"]) {
    checkVlakVersions(`@noorddev/${name}@0.5.0`, "0.5.0", "fixture");
    assert.throws(() => checkVlakVersions(`@noorddev/${name}@0.5.0`, "0.5.1", "fixture"), /must match plugin release/);
  }
  checkVlakVersions("shadcn@4.21.4", "0.5.0", "fixture");
});
