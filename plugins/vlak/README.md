# Vlak plugin

This portable agent plugin teaches a coding agent when and how to use Vlak and connects it to the read-only Vlak MCP catalogue.

## Claude Code

```sh
claude plugin marketplace add Noord-Ventures/vlak
claude plugin install vlak@vlak
```

## Grok

Grok reads Claude Code marketplaces and plugins. Add the same repository from the Plugins marketplace, or load this folder with `--plugin-dir` while developing.

## ChatGPT and Codex

The package follows the portable Agent Plugins layout. Add the repository marketplace, then install Vlak from that source in the ChatGPT desktop Plugins Directory:

```sh
codex plugin marketplace add Noord-Ventures/vlak
```

Public ChatGPT distribution requires submitting the plugin and a public Streamable HTTP MCP endpoint to the OpenAI plugin directory.

The MCP server can also be installed directly in Codex:

```sh
codex mcp add vlak -- npx -y @noorddev/vlak-mcp
```
