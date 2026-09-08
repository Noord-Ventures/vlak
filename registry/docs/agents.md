# Vlak for coding agents

Vlak publishes the same component, token, prop, keyboard, accessibility, and installation data as Markdown, JSON, CLI output, and MCP resources. All surfaces are generated from the component registry.

## Start here

- [Short index](https://vlak.dev/llms.txt)
- [Complete documentation](https://vlak.dev/llms-full.txt)
- [Component catalogue](https://vlak.dev/docs/index.md)
- [Design brief](https://vlak.dev/design.md)
- [Interface studies](https://vlak.dev/interfaces.md)
- [Registry index](https://vlak.dev/r/index.json)
- [Props JSON](https://vlak.dev/docs/props.json)

## Component records

Read one component at `https://vlak.dev/docs/<name>.md`. Each record includes install paths, React examples, props, keyboard behavior, accessibility notes, markup, classes, and registry dependencies. The matching human-readable page is `https://vlak.dev/components/<name>/` and the shadcn registry item is `https://vlak.dev/r/<name>.json`.

## CLI

```sh
npx @noorddev/vlak-cli list --json
npx @noorddev/vlak-cli search <term> --json
npx @noorddev/vlak-cli docs <name>
npx @noorddev/vlak-cli tokens --json
```

## MCP

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

The server exposes component search and records, tokens, install commands, and the guide from an offline snapshot.
