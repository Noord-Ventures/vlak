# Agent

Inspects an agent’s model, instructions, tool definitions and output schema in a 4px surface.

Category: ai  
Name: `agent`  
Also known as: AI Elements Agent, Agent configuration, Tool definitions  
Page: https://vlak.dev/ai/agent/

## When to use

- Inspect supplied model configuration, instructions and named tools before starting work.
- Use renderSchema to supply a syntax renderer; objects use the bounded JsonViewer by default and strings use CodeBlock.

## When not to

- Executing tool definitions or treating displayed instructions as authorization.
- Assuming this component calls a model or highlights source without a supplied renderer.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { Agent } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add agent
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/agent.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<article class="rs-agent" aria-label="Agent Code reviewer"><header class="rs-agent-header"><span class="rs-agent-title">Code reviewer</span></header><div class="rs-agent-content"><div class="rs-agent-section"><span class="rs-agent-label">Instructions</span><div class="rs-agent-instructions">Review the supplied diff and cite relevant files.</div></div></div></article>
```

## Example

```tsx
import { Agent } from "@noorddev/vlak-react";

<Agent name="Code reviewer" model="Workspace model" instructions="Review the supplied diff." tools={[{ name: "read_file", inputSchema: { type: "object", properties: { path: { type: "string" } } } }]} outputSchema="type Review = { summary: string }" />
```

## Props

### Agent

Inspect agent configuration without instantiating tools or executing instructions.

Extends `Omit<HTMLAttributes<HTMLElement>, "title">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `name` (required) | `string` |  |  |
| `model` | `string` |  |  |
| `instructions` | `ReactNode` |  |  |
| `tools` | `AgentToolDefinition[]` | `[]` |  |
| `outputSchema` | `unknown` |  |  |
| `renderSchema` | `(schema: unknown, context: "input" \| "output") => ReactNode` |  | Optional rich/schema renderer. The default safely displays objects or escaped source text. |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Tab reaches tool disclosures and schema controls. |
| Enter, Space | Enter or Space on a summary expands or collapses a tool schema. |

## Accessibility

- An article has an accessible agent name; model and tool identities are visible text.
- Native tool disclosures provide keyboard access. The default object viewer does not invoke getters.
- Instructions accept React content; applications configure any Markdown renderer they supply.

## Classes

`rs-agent`, `rs-agent-header`, `rs-agent-title`, `rs-agent-content`, `rs-agent-section`, `rs-agent-label`, `rs-agent-instructions`, `rs-agent-description`

## Dependencies

Registry dependencies: [badge](badge.md), [collapsible](collapsible.md), [code-block](code-block.md), [json-viewer](json-viewer.md).  
React: `packages/react/src/components/agent.tsx`  
CSS: `packages/core/css/components/agent.css`
