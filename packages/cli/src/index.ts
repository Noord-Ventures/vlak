import { dirname } from "node:path";
import { mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { applyUpdate, managedStatus, readUpdatePlan, recoverUpdate, safePath } from "./managed";
import { VERSION, add, docsFor, init, list, search, snippetFor, tokensJson, updatePlan, loadBundle } from "./lib";

const HELP = `@noorddev/vlak-cli ${VERSION}, the minimal design system

Usage
  npx @noorddev/vlak-cli init [--css-dir <dir>] [--components-dir <dir>] [--registry <url>] [--overwrite]
  npx @noorddev/vlak-cli add <component...> [--overwrite] [--registry <url>]
  npx @noorddev/vlak-cli list [--json]
  npx @noorddev/vlak-cli search <term> [--json]
  npx @noorddev/vlak-cli docs <component | guide | index | tokens>
  npx @noorddev/vlak-cli tokens [--json]
  npx @noorddev/vlak-cli workflows [--json]
  npx @noorddev/vlak-cli workflow <id> [--output <new-directory>]
  npx @noorddev/vlak-cli status
  npx @noorddev/vlak-cli diff [--registry <url>]
  npx @noorddev/vlak-cli update-plan --output <file> [--registry <url>]
  npx @noorddev/vlak-cli update --plan <file>
  npx @noorddev/vlak-cli recover [--rollback]
  npx @noorddev/vlak-cli help

Commands
  init      Write vlak.css, Inter (SIL OFL 1.1), index.html (specimen), and vlak.json.
            --registry <url> stores a remote registry for add (HTTP(S) or a local directory).
  add       Copy a component's React source into your project.
            CSS-only components need no code; add prints the snippet.
            --registry <url> loads items from that registry instead of the bundled snapshot.
  list      Every component in the registry. --json prints an array with no prose.
  search    Components whose name, title, description, aliases, or classes match the term.
  docs      The markdown page for a component (install, example, props, keyboard,
            accessibility), or the guide, the index, or the tokens page.
  tokens    The design tokens as JSON.
  workflows List runnable workflow kits and recipes.
  workflow  Read a kit manifest, or copy its reference workspace into a new directory.
  status    Show clean, modified and missing installed files.
  diff      Review current file contents against the target registry snapshot.
  update-plan  Save a plan with exact source bytes and local-file preconditions.
  update    Apply a reviewed plan. Conflicts or later edits stop all writes.
  recover   Inspect an interrupted update; --rollback restores recognized original bytes.

Keep .vlak/ with your project: it contains installed provenance and recovery data.
Updates preserve local-only changes and never execute package scripts.

Everything works offline: the registry snapshot, the CSS, the docs, and Inter ship with the CLI.
`;

function parseFlags(argv: string[]): { positional: string[]; flags: Record<string, string | boolean> } {
  const positional: string[] = [];
  const flags: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    } else {
      positional.push(arg);
    }
  }
  return { positional, flags };
}

function reportWrites(results: { path: string; status: string }[]): void {
  for (const r of results) {
    const mark = r.status === "written" ? "+" : r.status === "unchanged" ? "=" : "!";
    const note = r.status === "skipped" ? "  (exists; pass --overwrite to replace)" : "";
    console.log(`  ${mark} ${r.path}${note}`);
  }
}

function registryFlag(flags: Record<string, string | boolean>): string | undefined {
  return typeof flags.registry === "string" ? flags.registry : undefined;
}

const [, , command, ...rest] = process.argv;
const { positional, flags } = parseFlags(rest);
const cwd = process.cwd();

async function main(): Promise<void> {
  switch (command) {
    case "init": {
      const results = init(cwd, {
        cssDir: typeof flags["css-dir"] === "string" ? flags["css-dir"] : undefined,
        componentsDir: typeof flags["components-dir"] === "string" ? flags["components-dir"] : undefined,
        overwrite: Boolean(flags.overwrite),
        registry: registryFlag(flags),
      });
      console.log("Vlak initialized.\n");
      reportWrites(results);
      const cssPath = results.find((r) => r.path.endsWith("vlak.css"))?.path ?? "styles/vlak.css";
      console.log(`
Next steps
  1. Open index.html — the specimen page init writes.
  2. The stylesheet is already linked:
       <link rel="stylesheet" href="${cssPath}" />
  3. Dark scheme: set data-theme="dark" on <html>, or use the control on the specimen.
  4. Inter is bundled (SIL OFL 1.1). System sans is fallback only.
  5. Add components:  npx @noorddev/vlak-cli add button dialog
`);
      break;
    }

    case "add": {
      if (positional.length === 0) {
        console.error("Nothing to add. Usage: npx @noorddev/vlak-cli add <component...>   (see: npx @noorddev/vlak-cli list)");
        process.exit(1);
      }
      const { outcomes, unknown } = await add(cwd, positional, {
        overwrite: Boolean(flags.overwrite),
        registry: registryFlag(flags),
      });
      for (const name of unknown) console.error(`✗ unknown component "${name}". See: npx @noorddev/vlak-cli list`);
      for (const outcome of outcomes) {
        if (outcome.cssOnly) {
          console.log(`${outcome.item.title} (${outcome.item.name}) is CSS-only; already styled by vlak.css.`);
          const snippet = snippetFor(outcome.item.name);
          if (snippet) console.log(`  Markup:\n${snippet.split("\n").map((l) => `    ${l}`).join("\n")}`);
        } else {
          console.log(`${outcome.item.title} (${outcome.item.name})`);
          reportWrites(outcome.results);
        }
      }
      const dependencies = [...new Set(outcomes.flatMap(outcome => outcome.item.dependencies ?? []))].filter(name => name !== "@stylexjs/stylex");
      if (dependencies.length) console.log(`Required packages: ${dependencies.join(", ")}. Install them with your package manager.`);
      const styles = [...new Set(outcomes.flatMap(outcome => outcome.item.meta?.vlak?.styles ?? []))];
      for (const stylesheet of styles) console.log(stylesheet.startsWith("@noorddev/vlak-react/") ? `Import the copied styles/vlak/${stylesheet.slice("@noorddev/vlak-react/".length)} stylesheet in your application.` : `Required stylesheet: import "${stylesheet}";`);
      if (unknown.length > 0) process.exit(1);
      break;
    }

    case "workflows":
    case "workflow": {
      const workflows = (loadBundle() as ReturnType<typeof loadBundle> & { workflows?: { items: { id: string; title: string; description: string }[]; files: Record<string, string> } }).workflows;
      if (!workflows) throw new Error("Workflow catalog is missing. Rebuild the CLI.");
      if (command === "workflows") { console.log(JSON.stringify(workflows.items, null, 2)); break; }
      const kit = workflows.items.find(item => item.id === positional[0]);
      if (!kit) throw new Error("Unknown workflow. Run vlak workflows.");
      if (typeof flags.output === "string") {
        const directory = safePath(cwd, flags.output);
        const entries = Object.entries(workflows.files).map(([path, content]) => {
          if (!path.startsWith("examples/workflows/")) throw new Error("Unexpected workflow source path.");
          return { path: safePath(cwd, `${flags.output}/${path.slice("examples/workflows/".length)}`), content };
        });
        mkdirSync(directory); // A new directory is required; existing work is never merged.
        for (const entry of entries) { mkdirSync(dirname(entry.path), { recursive: true }); writeFileSync(entry.path, entry.content, { flag: "wx" }); }
        console.log(`Copied ${kit.title} and its companion recipes to ${flags.output}. Read README.md for install and run commands. No packages or scripts were executed.`);
      } else console.log(JSON.stringify(kit, null, 2));
      break;
    }

    case "status":
      console.log(JSON.stringify(managedStatus(cwd), null, 2));
      break;

    case "diff":
    case "update-plan": {
      const plan = await updatePlan(cwd, registryFlag(flags));
      if (command === "update-plan") {
        if (typeof flags.output !== "string") throw new Error("Use --output <project-relative file>.");
        writeFileSync(safePath(cwd, flags.output), JSON.stringify(plan, null, 2) + "\n", { flag: "wx" });
        console.log(`Saved ${flags.output}. Review the diff and plan before running update --plan ${flags.output}.`);
      } else {
        console.log(`Target snapshot: ${plan.source}`);
        for (const change of plan.changes) {
          console.log(`\n${change.state}: ${change.path}`);
          if (change.state === "unchanged" || change.state === "local") continue;
          const before = change.before ? readFileSync(safePath(cwd, change.path)) : Buffer.alloc(0);
          const after = change.content === null ? Buffer.alloc(0) : Buffer.from(change.content, "base64");
          if (before.includes(0) || after.includes(0)) { console.log(`Binary: ${change.before ?? "absent"} → ${change.after ?? "absent"}`); continue; }
          console.log(`--- current/${change.path}\n+++ target/${change.path}\n${before.toString().split("\n").map(line => `-${line}`).join("\n")}\n${after.toString().split("\n").map(line => `+${line}`).join("\n")}`);
        }
      }
      break;
    }
    case "update": {
      if (typeof flags.plan !== "string") throw new Error("Use --plan <reviewed plan file>.");
      const path = safePath(cwd, flags.plan);
      if (!statSync(path).isFile() || statSync(path).size > 256 * 1024 * 1024) throw new Error("Update plan must be a regular file no larger than 256 MiB.");
      const plan = readUpdatePlan(cwd, readFileSync(path, "utf8"));
      const result = applyUpdate(cwd, plan);
      console.log(`Updated ${result.changed} files; preserved ${result.preserved} locally edited files.`);
      break;
    }
    case "recover": {
      const result = recoverUpdate(cwd, Boolean(flags.rollback));
      console.log(JSON.stringify(result, null, 2));
      if (result.pending) console.log("Preserve .vlak and review these paths. Run recover --rollback to restore their original bytes.");
      break;
    }

    case "list": {
      const entries = list();
      if (flags.json) {
        console.log(JSON.stringify(entries, null, 2));
        break;
      }
      const byCategory = new Map<string, typeof entries>();
      for (const entry of entries) {
        const group = byCategory.get(entry.category) ?? [];
        group.push(entry);
        byCategory.set(entry.category, group);
      }
      for (const [category, group] of byCategory) {
        console.log(`\n${category}`);
        for (const entry of group) {
          console.log(`  ${entry.name.padEnd(14)} ${entry.description}${entry.cssOnly ? "  [css-only]" : ""}`);
        }
      }
      console.log();
      break;
    }

    case "tokens":
      console.log(tokensJson());
      break;

    case "search": {
      const term = positional.join(" ");
      if (!term) {
        console.error("Nothing to search for. Usage: npx @noorddev/vlak-cli search <term>");
        process.exit(1);
      }
      const hits = search(term);
      if (flags.json) {
        console.log(JSON.stringify(hits, null, 2));
        break;
      }
      if (hits.length === 0) {
        console.log(`No component matches "${term}". See: npx @noorddev/vlak-cli list`);
        break;
      }
      for (const hit of hits) {
        const via = hit.matched.includes("alias") ? `  (${hit.aliases.filter((a) => a.toLowerCase().includes(term.toLowerCase())).join(", ")})` : "";
        console.log(`${hit.name.padEnd(18)} ${hit.title.padEnd(18)} ${hit.description}${via}`);
      }
      break;
    }

    case "docs": {
      const name = positional[0];
      if (!name) {
        console.error("Which page? Usage: npx @noorddev/vlak-cli docs <component | guide | index | tokens>");
        process.exit(1);
      }
      const page = docsFor(name);
      if (!page) {
        console.error(`No docs for "${name}". See: npx @noorddev/vlak-cli list`);
        process.exit(1);
      }
      process.stdout.write(page);
      break;
    }

    case "help":
    case undefined:
    case "--help":
      console.log(HELP);
      break;

    case "--version":
    case "version":
      console.log(VERSION);
      break;

    default:
      console.error(`Unknown command "${command}".\n`);
      console.log(HELP);
      process.exit(1);
  }
}

await main().catch(error => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
