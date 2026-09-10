# Model selector

Searches a supplied model catalog by name, provider and capabilities, with metadata and controlled selection.

Category: ai  
Name: `model-selector`  
Also known as: AI Elements Model Selector, Model picker, Provider models, LLM selector  
Page: https://vlak.dev/ai/model-selector/

[AI component index](https://vlak.dev/docs/ai-index.md) · [Integration guide](https://vlak.dev/docs/ai.md) · [AI Elements feature coverage](https://vlak.dev/docs/ai-parity.md)

## When to use

- Supply stable model ids and current provider metadata. Search includes names, descriptions, providers and capabilities.
- Use value/onValueChange for an application-owned selection or defaultValue for local selection.
- Supply icon as decorative React content, contextWindow as a token count and priceLabel as application-verified text.
- Disabled models remain visible but cannot be selected. A removed controlled selection is explained rather than silently replaced.
- CSS-only markup provides native selection; the React composition adds searchable metadata.

## When not to

- Assuming the picker downloads models, calls a provider or updates an SDK connection.
- Hardcoding provider prices into the library.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { ModelSelector } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add model-selector
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/model-selector.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-model-selector"><label class="rs-model-selector-label" for="model">Model</label><select class="rs-input" id="model"><option>Swift · Example provider</option><option>Vision · Example provider</option></select></div>
```

## Example

```tsx
"use client";
import { useState } from "react";
import { ModelSelector } from "@noorddev/vlak-react";

export function ModelPicker({ priceLabel }: { priceLabel?: string }) {
  const [modelId, setModelId] = useState("swift");
  return <ModelSelector value={modelId} onValueChange={setModelId} models={[
    { id: "swift", name: "Swift", provider: "Your provider", capabilities: ["Text", "Fast"], contextWindow: 32000 },
    { id: "vision", name: "Vision", provider: "Your provider", capabilities: ["Images"], priceLabel },
  ]} />;
}
```

## Props

### ModelSelector

Search and select models from an application-supplied catalog, without provider lookups.

Extends `Omit<HTMLAttributes<HTMLDivElement>, "defaultValue">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `models` (required) | `readonly ModelOption[]` |  |  |
| `value` | `string` |  |  |
| `defaultValue` | `string` | `""` |  |
| `onValueChange` | `(modelId: string) => void` |  |  |
| `label` | `string` | `"Model"` |  |
| `disabled` | `boolean` | `false` |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Type | Filters model names and supplied metadata |
| Arrow Down, Arrow Up, Home, End | Navigates available matches, skipping disabled models |
| Enter | Selects the highlighted available model |
| Escape | Closes the list and retains selection |

## Accessibility

- A visible label names the shared Combobox. Disabled matches expose aria-disabled and are skipped during navigation.
- Provider icons are decorative; model names and capability text remain readable.
- The selected model detail has a subtle 1px frame and 4px corners. Native div attributes and ref pass through.

## Classes

`rs-model-selector`, `rs-model-selector-label`, `rs-model-selector-option`, `rs-model-selector-icon`, `rs-model-selector-text`, `rs-model-selector-metadata`, `rs-model-selector-detail`, `rs-model-selector-description`

## Dependencies

Registry dependencies: [combobox](combobox.md), [input](input.md).  
React: `packages/react/src/components/model-selector.tsx`  
CSS: `packages/core/css/components/model-selector.css`
