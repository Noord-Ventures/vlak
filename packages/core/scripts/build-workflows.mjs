import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { workflowCatalog } from "../../../examples/workflows/catalog.ts";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const output = `${root}registry`;
const markdown = kit => `# ${kit.title}\n\n${kit.description}\n\nReference version: ${kit.version}. Status: ${kit.status}.\n\n[Try the example](https://vlak.dev/workflows/${kit.id}/) · [Read the manifest](https://vlak.dev/workflows/${kit.id}/manifest/)\n\n## Run\n\nFrom \`${kit.install.directory}\`:\n\n\`\`\`sh\n${[...kit.install.commands, ...kit.run.commands].join("\n")}\n\`\`\`\n\n## States\n\n${kit.states.values.join(" → ")}\n\n## Acceptance\n\n${kit.acceptance.map(line => `- ${line}`).join("\n")}\n\n## Host responsibilities\n\n${kit.ownership.hostProvides.map(line => `- ${line}`).join("\n")}\n\n${kit.ownership.externalValidationBoundary}\n\n## Limitations\n\n${kit.limitations.map(line => `- ${line}`).join("\n")}\n\n## Source\n\n${kit.sources.map(file => `- [${file.path}](https://github.com/Noord-Ventures/vlak/blob/main/${file.path}) (${file.role})`).join("\n")}\n`;

/** One authored catalog feeds human pages, offline tools and the public registry. */
export function buildWorkflows() {
  const files = {};
  function visit(relative) {
    for (const entry of readdirSync(`${root}${relative}`, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (["node_modules", "dist", "data", ".git"].includes(entry.name) || entry.name.startsWith(".")) continue;
      const path = `${relative}/${entry.name}`;
      if (entry.isDirectory()) visit(path);
      else if (entry.isFile() && (entry.name === "LICENSE" || /\.(?:ts|tsx|css|md|json|html)$/.test(path)) && !entry.name.includes("lock")) files[path] = readFileSync(`${root}${path}`, "utf8");
    }
  }
  visit("examples/workflows");
  const ids = new Set();
  for (const kit of workflowCatalog) {
    if (ids.has(kit.id)) throw new Error(`Duplicate workflow: ${kit.id}`);
    ids.add(kit.id);
    for (const source of kit.sources) if (!(source.path in files)) throw new Error(`Workflow source missing: ${source.path}`);
  }
  const workflows = { schemaVersion: 1, items: workflowCatalog, files };
  mkdirSync(`${output}/workflows`, { recursive: true });
  writeFileSync(`${output}/workflows/index.json`, JSON.stringify(workflows, null, 2) + "\n");
  for (const kit of workflowCatalog) {
    writeFileSync(`${output}/workflows/${kit.id}.json`, JSON.stringify({ schemaVersion: 1, kit, files }, null, 2) + "\n");
    writeFileSync(`${output}/docs/workflow-${kit.id}.md`, markdown(kit));
  }
  const marker = "\n<!-- VLAK_WORKFLOWS -->\n";
  for (const name of ["llms.txt", "llms-full.txt"]) {
    const path = `${output}/docs/${name}`;
    const body = readFileSync(path, "utf8").split(marker)[0];
    const links = workflowCatalog.map(kit => `- [${kit.title} example](https://vlak.dev/workflows/${kit.id}/): ${kit.description}\n- [${kit.title} manifest](https://vlak.dev/workflows/${kit.id}/manifest/): States, adapters, ownership, installation and acceptance.`).join("\n");
    writeFileSync(path, `${body}${marker}\n## Workflow kits and local tools\n\n${links}\n- [Workflow modernization](https://vlak.dev/services/): Local scoping worksheet and service delivery templates.\n- [CSV reconciliation](https://vlak.dev/interfaces/reconciliation/): Exact comparison, exception review, reusable projects and exports.\n\n- [Project files](https://vlak.dev/docs/projects/): Portable projects, browser revisions, conflict handling and recovery.\n- [Safe source updates](https://vlak.dev/docs/updates/): Review pinned CLI updates and recover interrupted writes.\n\nMachine-readable workflows with source: https://vlak.dev/r/workflows/index.json\n${name === "llms-full.txt" ? `\n${workflowCatalog.map(markdown).join("\n")}` : ""}`);
  }
  return workflows;
}
