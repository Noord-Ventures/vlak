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

console.log("agent surfaces are consistent");
