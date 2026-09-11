# @noorddev/vlak-cli

Installs Vlak into any project. Works offline: the registry snapshot, the CSS, the docs, and Inter ship with the CLI.

```sh
npx @noorddev/vlak-cli init
npx @noorddev/vlak-cli add button dialog
```

## Commands

| Command | What it does |
|---|---|
| `init` | Writes `styles/vlak.css`, Inter (SIL OFL 1.1), a specimen `index.html`, and `vlak.json`. |
| `add <name...>` | Copies a component's React source (StyleX leaves) and its dependencies into `components/vlak/`. Shared helpers install once. |
| `list [--json]` | Every component in the registry, by category. `--json` prints an array of `{ name, title, description, category, cssOnly }`. |
| `search <term> [--json]` | Components whose name, title, description, aliases, or classes match, ignoring spacing and punctuation. `search sonner` finds toast; `search "AI Elements Prompt input"` finds MessageComposer. |
| `docs <name>` | The markdown page for a component: install paths, React example, props table, keyboard, accessibility, classes. Also `docs guide`, `docs index`, `docs tokens`, `docs ai-index`, `docs ai`, and `docs ai-parity`. |
| `tokens [--json]` | The design tokens as JSON. |
| `workflows` | Lists workflow manifests from the bundled registry. |
| `workflow <id> [--output <directory>]` | Prints a manifest or copies its runnable workspace into a new relative directory. Never installs or runs code. |
| `status` | Reports each recorded file as clean, modified, or missing. |
| `diff [--registry <url or dir>]` | Builds the current target snapshot and prints planned changes without writing managed files. |
| `update-plan --output <file> [--registry <url or dir>]` | Saves exact target bytes, file hashes, ownership, and current-file preconditions for review. |
| `update --plan <file>` | Applies a reviewed plan only when its manifest and every current file still match the plan. |
| `recover [--rollback]` | Reports an interrupted update. `--rollback` restores recognized original bytes after checking every affected path for later edits. |

Flags depend on the command: `--css-dir`, `--components-dir`, `--overwrite`, `--registry <url or dir>`, `--output <file>`, `--plan <file>`, `--rollback`, and `--json`.

## Managed updates

`init` and `add` record the exact bytes they successfully install under `.vlak/`. Keep that directory with the project. A later `status`, `diff`, or `update-plan` uses those baselines to distinguish upstream changes from local edits.

Review `diff` or the JSON from `update-plan` before applying it. A clean file can be replaced or removed. A file edited only in the project is preserved when its target bytes did not change. When both the project and target changed, the plan reports a conflict and `update` stops before changing destination files. The CLI does not merge source files.

An update checks the manifest and every planned path before writing destination files. Each destination is replaced through a temporary file. A multi-file update is recoverable rather than one atomic filesystem operation: if it is interrupted, `.vlak/transaction.json` blocks later managed writes until `recover --rollback` restores recognized original bytes. Recovery refuses to write anything when any affected file has a later edit.

Vendored components are StyleX; compile them with `@stylexjs/babel-plugin` (Vite: `@stylexjs/unplugin`, Next: `@stylexjs/postcss-plugin` plus a Babel pass). If you would rather not run a compiler, `npm install @noorddev/vlak-react` ships the same components precompiled with one stylesheet.

## For agents

`list --json`, `search <term> --json`, and `docs <name>` give a coding agent the catalogue, a way to find a component by any common name, and the full page for it, with no network. The same pages are served at `https://vlak.dev/docs/<name>.md` and indexed by `https://vlak.dev/llms.txt`; `@noorddev/vlak-mcp` exposes them as MCP tools.

Start assistant work with `docs ai-index`, then `docs ai` for application integration. `docs ai-parity` maps AI Elements concepts to Vlak without promising upstream import compatibility. Optional Markdown, code, JSX and graph renderers have separate imports, packages and styles documented in their component records. Core components do not require those engines.

## shadcn

The same registry serves `npx shadcn add https://vlak.dev/r/button.json`.

Docs: [vlak.dev](https://vlak.dev). Licence: MIT.
