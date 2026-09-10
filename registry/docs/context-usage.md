# Context usage

A native disclosure of context occupancy, token categories and estimated costs from application-supplied rates or model catalogs.

Category: ai  
Name: `context-usage`  
Also known as: AI Elements Context, Token usage, Context window, Token cost, ContextUsage  
Page: https://vlak.dev/ai/context-usage/

[AI component index](https://vlak.dev/docs/ai-index.md) · [Integration guide](https://vlak.dev/docs/ai.md) · [AI Elements feature coverage](https://vlak.dev/docs/ai-parity.md)

## When to use

- Supply usedTokens and maxTokens for context occupancy; usage supplies separate input, output, reasoning and cached-input counts.
- pricing accepts inputPerMillion, outputPerMillion, reasoningPerMillion, cacheReadPerMillion and optional currency. No model catalog or prices are fetched.
- Pass modelId and a supplied Tokenlens or models.dev catalog to resolve a model name, context limit, and rates. Explicit model, maxTokens, and pricing replace their resolved counterparts.
- resolveContextPricing exposes the same lookup for application composition. Qualified provider/model ids select provider pricing; a providerless id must match exactly one model.
- Catalog context tiers require the actual input token count through usage.inputTokens, or inputTokens in resolver options. Unknown, ambiguous, or invalid metadata remains unavailable.
- Cached input is a subset of input; reasoning is a subset of output. Separate rates replace the parent rate for those subsets rather than adding duplicate charges.
- Missing or invalid data displays Unavailable. Costs are estimates from the supplied rates, not provider billing totals.
- Use open/onToggle for a controlled native disclosure or defaultOpen for the initial state. CSS-only markup shows supplied values.

## When not to

- Treating missing token counts or unknown pricing as zero.
- Displaying rates without verifying them in the application that supplies them.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { ContextUsage, resolveContextPricing } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add context-usage
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/context-usage.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<details class="rs-context-usage rs-disclosure"><summary class="rs-disclosure-summary">Context usage · 25%</summary><div class="rs-context-usage-body"><p class="rs-context-usage-metadata">512 of 2,048 tokens</p></div></details>
```

## Example

```tsx
import { ContextUsage, type ContextPricingCatalog } from "@noorddev/vlak-react";

export function ContextExample({ modelId, catalog }: {
  modelId: string;
  catalog: ContextPricingCatalog;
}) {
  return <ContextUsage
    modelId={modelId}
    catalog={catalog}
    usedTokens={1500}
    usage={{ inputTokens: 1000, outputTokens: 500, cachedInputTokens: 200, reasoningTokens: 100 }}
  />;
}
```

## Props

### ContextUsage

Context occupancy and caller-supplied token usage/pricing. No model catalog or prices are fetched.

Extends `Omit<DetailsHTMLAttributes<HTMLDetailsElement>, "title">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDetailsElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `usedTokens` (required) | `number` |  |  |
| `maxTokens` | `number` |  |  |
| `usage` | `TokenUsage` |  |  |
| `pricing` | `TokenPricing` |  |  |
| `modelId` | `string` |  | Optional metadata from an application-owned Tokenlens/models.dev catalog. Explicit limits and rates take precedence. |
| `catalog` | `Readonly<Record<string, { id?: string; models: Readonly<Record<string, ContextModelPricing>>; }>>` |  |  |
| `model` | `string` |  |  |
| `label` | `string` | `"Context usage"` |  |
| `defaultOpen` | `boolean` | `false` |  |

### Functions

- `resolveContextPricing` (function): Resolve cached catalog metadata without fetching, timers, or a bundled pricing snapshot. Qualified provider/model ids select the provider's prices; providerless ids must be unique. Catalogs may be obtained with Tokenlens or models.dev in application/server code.

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Focuses the native disclosure summary |
| Enter, Space | Opens or closes usage details |

## Accessibility

- The summary exposes current occupancy in text. The shared Progress names the token range and clamps its visual extent.
- Unknown limits omit the meter; usage above the supplied limit retains the real count and an explanation.
- Native details attributes and its ref are forwarded.

## Classes

`rs-context-usage`, `rs-context-usage-body`, `rs-context-usage-metadata`, `rs-context-usage-list`, `rs-context-usage-row`, `rs-context-usage-value`

## Dependencies

Registry dependencies: [collapsible](collapsible.md), [progress](progress.md).  
React: `packages/react/src/components/context-usage.tsx`  
CSS: `packages/core/css/components/context-usage.css`
