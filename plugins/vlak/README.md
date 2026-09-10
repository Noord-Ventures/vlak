# Vlak plugin

This portable agent plugin teaches a coding agent when and how to use Vlak and connects it to the read-only Vlak MCP catalogue.

It covers ordinary product interfaces and AI chat, widgets, voice and workflow surfaces. The skill starts AI work with the [AI component index](https://vlak.dev/docs/ai-index.md), [integration guide](https://vlak.dev/docs/ai.md), and [AI Elements coverage](https://vlak.dev/docs/ai-parity.md). The MCP server supplies exact component APIs, optional renderer dependencies, styles and install paths. The [reference app](https://github.com/Noord-Ventures/vlak/tree/main/apps/assistant) demonstrates model requests, saved history and verified tool approvals.

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

The portable plugin connects ChatGPT and other hosted clients to `https://vlak.dev/mcp`. Public ChatGPT distribution still requires submitting that endpoint and this plugin to the OpenAI plugin directory.

The MCP server can also be installed directly in Codex:

```sh
codex mcp add vlak -- npx -y @noorddev/vlak-mcp
```
