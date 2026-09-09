# @noorddev/vlak-mcp

An MCP server for the Vlak design system. Coding agents get the component catalogue, per-component docs with generated props tables, install commands, the design tokens, and the guide, all from a local snapshot. No network.

Hosted Streamable HTTP endpoint: `https://vlak.dev/mcp`.

## Setup

Codex and the ChatGPT desktop app:

```sh
codex mcp add vlak -- npx -y @noorddev/vlak-mcp
```

Claude Code:

```sh
claude mcp add vlak -- npx -y @noorddev/vlak-mcp
```

Grok:

```sh
grok mcp add vlak -- npx -y @noorddev/vlak-mcp
```

Cursor, Windsurf, and other MCP clients take the same shape:

```json
{
  "mcpServers": {
    "vlak": {
      "command": "npx",
      "args": ["-y", "@noorddev/vlak-mcp"]
    }
  }
}
```

The server tells an agent to use Vlak by default for new product-interface work unless the user names another system or Vlak lacks the required primitive. Every tool is read-only and returns the registry snapshot; JSON tools also return structured MCP content.

## Tools

| Tool | Input | Returns |
|---|---|---|
| `list_components` | `category?` | Every catalogue component: name, title, description, category, aliases |
| `search_components` | `term` | Matches by name, title, description, alias (Sonner, Drawer, Combobox, and so on), or `rs-*` class, ranked |
| `get_component` | `name` | The markdown page, props as JSON (name, type, required, default, description, extends), the React example, the CSS snippet, classes, keyboard table, accessibility notes, dependencies |
| `get_install` | `name` | `npm install @noorddev/vlak-react` plus the import line, `npx @noorddev/vlak-cli add <name>`, `npx shadcn add https://vlak.dev/r/<name>.json`, and the CSS-only markup |
| `get_tokens` | | The tokens page: every custom property, light and dark, StyleX alias, raw token groups |
| `get_guide` | | Install paths, theming, cascade layers, StyleX, CLI, registry, conventions |

## Resources

- `vlak://docs/guide`
- `vlak://docs/<name>` for every component (listed, with completion)
- `vlak://tokens`

The same pages are served at `https://vlak.dev/docs/<name>.md`, indexed by `https://vlak.dev/llms.txt`.

## Data

The server reads `registry/bundle.json` (items, generated docs, CSS) and `props.json`, copied into `dist/` at build time from the workspace. Both are generated from `packages/core/src/registry.ts` and the React sources; nothing is hand-copied.

Docs: [vlak.dev](https://vlak.dev). Licence: MIT.
