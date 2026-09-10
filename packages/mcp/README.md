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
| `search_components` | `term` | Matches by name, title, description, alias (AI Elements, Sonner, Drawer, Combobox), or `rs-*` class, ranked; spacing and punctuation do not affect matching |
| `get_component` | `name` | The markdown page, props as JSON (name, type, required, default, description, extends), the React example, the CSS snippet, classes, keyboard table, accessibility notes, dependencies |
| `get_install` | `name` | Package install including optional engines, exact import path, required styles, Vlak CLI and shadcn commands, and CSS-only markup |
| `get_tokens` | | The tokens page: every custom property, light and dark, StyleX alias, raw token groups |
| `get_guide` | `page?` | `guide` (default), `agents`, `ai-index`, `ai`, or `ai-parity` |

For an assistant interface, request `get_guide` with `page: "ai-index"` to discover AI components and companion primitives. Read `page: "ai"` for integration and the runnable reference app, or `page: "ai-parity"` to map upstream AI Elements concepts to Vlak APIs. Search terms such as `AI Elements Prompt input` find MessageComposer even though it is part of the wider component catalog. Always use `get_install` for optional renderer subpaths and their extra styles.

## Resources

- `vlak://docs/guide`
- `vlak://docs/agents`, `vlak://docs/ai-index`, `vlak://docs/ai`, `vlak://docs/ai-parity`
- `vlak://docs/<name>` for every component (listed, with completion)
- `vlak://tokens`

The same pages are served at `https://vlak.dev/docs/<name>.md`, indexed by `https://vlak.dev/llms.txt`.

## Data

The server reads `registry/bundle.json` (items, generated docs, CSS) and `props.json`, copied into `dist/` at build time from the workspace. Both are generated from `packages/core/src/registry.ts` and the React sources; nothing is hand-copied.

Docs: [vlak.dev](https://vlak.dev). Licence: MIT.
