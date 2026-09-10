import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const read = (path) => readFileSync(resolve(root, path), "utf8");
const json = (path) => JSON.parse(read(path));
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const plugin = json("plugins/vlak/plugin.json");
const portableMcp = json("plugins/vlak/mcp.json");
const claudePlugin = json("plugins/vlak/.claude-plugin/plugin.json");
const claudeMcp = json("plugins/vlak/.mcp.json");
const marketplace = json(".claude-plugin/marketplace.json");
const openAiMarketplace = json(".agents/plugins/marketplace.json");
const skill = read("plugins/vlak/skills/use-vlak/SKILL.md");
const llms = read("registry/docs/llms.txt");
const agents = read("registry/docs/agents.md");
const bundle = json("registry/bundle.json");
const registry = json("registry/index.json");
const props = json("packages/core/props/props.json");
const aiIndex = read("registry/docs/ai-index.md");
const fullDocs = read("registry/docs/llms-full.txt");
const catalog = bundle.items.filter(item => item.type === "registry:component" && !item.meta?.vlak?.hidden);
const aiComponents = catalog.filter(item => item.meta.vlak.category === "ai");
const aiCompanions = ["message-composer", "tree-view"];

assert(plugin.$schema === "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json", "Portable plugin schema is missing");
assert(portableMcp.$schema === "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json", "Portable MCP schema is missing");
assert(portableMcp.mcpServers.vlak.type === "streamable-http", "Portable MCP transport must be Streamable HTTP");
assert(portableMcp.mcpServers.vlak.url === "https://vlak.dev/mcp", "Portable MCP must use the stable Vlak endpoint");
assert(claudePlugin.mcpServers === "./.mcp.json", "Claude plugin must use its compatible MCP config");
assert(claudeMcp.mcpServers.vlak.args.includes("@noorddev/vlak-mcp"), "Claude MCP config must launch Vlak");
assert(marketplace.plugins.some((entry) => entry.name === "vlak" && entry.source === "./plugins/vlak"), "Marketplace must expose the Vlak plugin");
assert(openAiMarketplace.plugins.some((entry) => entry.name === "vlak" && entry.source.path === "./plugins/vlak"), "OpenAI marketplace must expose the Vlak plugin");
assert(skill.startsWith("---\nname: use-vlak\n"), "Vlak skill needs valid frontmatter");
assert(skill.includes("Use Vlak as the default"), "Vlak skill must state its selection rule");
assert(llms.includes("Use Vlak by default"), "llms.txt must state the selection rule");
for (const command of ["codex mcp add vlak", "claude mcp add vlak", "grok mcp add vlak"]) {
  assert(agents.includes(command), `Agent guide is missing ${command}`);
}

for (const name of ["ai-index", "ai", "ai-parity"]) {
  const page = read(`registry/docs/${name}.md`);
  assert(llms.includes(`https://vlak.dev/docs/${name}.md`), `llms.txt must expose ${name}`);
  assert(agents.includes(`https://vlak.dev/docs/${name}.md`), `Agent guide must expose ${name}`);
  assert(fullDocs.includes(page.trim()), `Complete documentation must include ${name}`);
  assert(bundle.docs.components[name] === page, `CLI/MCP bundle must include current ${name}`);
  assert(skill.includes(`https://vlak.dev/docs/${name}.md`), `Portable skill must expose ${name}`);
}
assert(aiIndex.includes("https://vlak.dev/ai/widgets/"), "AI index must expose widget patterns");
assert(aiIndex.includes("https://assistant.vlak.dev"), "AI index must expose the working assistant");
assert(aiIndex.includes("https://github.com/Noord-Ventures/vlak/tree/main/apps/assistant"), "AI index must expose application source");
assert(skill.includes("Optional Markdown") && skill.includes("get_install"), "Portable skill must distinguish optional engines");

for (const item of catalog) {
  const meta = item.meta.vlak;
  const path = `registry/docs/${item.name}.md`;
  const page = read(path);
  const url = `https://vlak.dev/${meta.category === "ai" ? "ai" : "components"}/${item.name}/`;
  assert(page.includes(`Page: ${url}`), `${path} must link to its canonical component section`);
  assert(llms.includes(`https://vlak.dev/docs/${item.name}.md`), `llms.txt is missing ${item.name}`);
  assert(fullDocs.includes(page.trim()), `Complete documentation is missing ${item.name}`);
  assert(bundle.docs.components[item.name] === page, `CLI/MCP docs are stale for ${item.name}`);
  assert(registry.items.some(entry => entry.name === item.name), `Registry index is missing ${item.name}`);
  const entry = json(`registry/${item.name}.json`);
  assert(JSON.stringify(entry.meta.vlak) === JSON.stringify(meta), `Registry item metadata differs from bundle for ${item.name}`);
  for (const dependency of meta.dependencies ?? []) assert(page.includes(dependency), `${path} omits optional dependency ${dependency}`);
  for (const stylesheet of meta.styles ?? []) assert(page.includes(stylesheet), `${path} omits optional stylesheet ${stylesheet}`);
  if (meta.reactImport) assert(page.includes(`from "${meta.reactImport}"`), `${path} omits the optional entry import`);
  if (meta.category === "ai" || aiCompanions.includes(item.name)) {
    assert(aiIndex.includes(`https://vlak.dev/docs/${item.name}.md`), `AI index is missing ${item.name}`);
    assert(page.includes("https://vlak.dev/docs/ai-index.md"), `${path} must link back to AI discovery`);
    for (const exported of props.components[item.name]?.exports ?? []) assert(page.includes(exported.name), `${path} omits export ${exported.name}`);
  }
}

// Every audited upstream component name should be findable through registry aliases.
const key = value => value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
const coverage = read("docs/ai-parity.md");
const mappings = [...coverage.matchAll(/\| \[([^\]]+)\]\(https:\/\/elements\.ai-sdk\.dev\/components\/[^)]+\) \| \[[^\]]+\]\(https:\/\/vlak\.dev\/(?:ai|components)\/([^/)]+)\/\)/g)];
assert(mappings.length > 0, "Feature coverage must contain upstream component mappings");
for (const [, upstream, name] of mappings) {
  const item = catalog.find(item => item.name === name);
  assert(item, `Feature coverage refers to missing ${name}`);
  assert((item.meta.vlak.aliases ?? []).some(alias => key(alias).includes(key(`AI Elements ${upstream}`))), `Add a searchable upstream alias for ${upstream} to ${name}`);
}

console.log(`agent surfaces are consistent: ${catalog.length} catalog records, ${aiComponents.length} AI records, ${mappings.length} upstream mappings`);
