import { VERSION, add, docsFor, init, list, search, snippetFor, tokensJson } from "./lib";

const HELP = `@noorddev/vlak-cli ${VERSION}, the minimal design system

Usage
  npx @noorddev/vlak-cli init [--css-dir <dir>] [--components-dir <dir>] [--registry <url>] [--overwrite]
  npx @noorddev/vlak-cli add <component...> [--overwrite] [--registry <url>]
  npx @noorddev/vlak-cli list [--json]
  npx @noorddev/vlak-cli search <term> [--json]
  npx @noorddev/vlak-cli docs <component | guide | index | tokens>
  npx @noorddev/vlak-cli tokens [--json]
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

await main();
