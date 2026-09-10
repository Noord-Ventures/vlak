# Environment variables

Masks environment values by default, with deliberate reveal, value copy and quoted shell exports.

Category: ai  
Name: `environment-variables`  
Also known as: AI Elements Environment Variables, Environment settings, Secret values  
Page: https://vlak.dev/ai/environment-variables/

[AI component index](https://vlak.dev/docs/ai-index.md) · [Integration guide](https://vlak.dev/docs/ai.md) · [AI Elements feature coverage](https://vlak.dev/docs/ai-parity.md)

## When to use

- Review supplied settings with masked initial values and explicit reveal controls.
- Use showValues and onShowValuesChange for controlled visibility; per-row reveals reset when the value changes.
- Copy a value or all portable shell exports. Export generation rejects invalid assignment names and quotes shell metacharacters.

## When not to

- Treating visual masking as secret storage; values still exist in application memory.
- Using duplicate variable names or copying secret values without a user action.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { EnvironmentVariables, formatEnvironmentExports } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add environment-variables
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/environment-variables.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<section class="rs-environment-variables" aria-labelledby="environment-title"><header class="rs-environment-variables-header"><span class="rs-environment-variables-title" id="environment-title">Environment variables</span></header><dl class="rs-environment-variables-list"><div class="rs-environment-variables-row"><dt class="rs-environment-variables-name"><code>MODEL_NAME</code></dt><dd class="rs-environment-variables-value"><span role="img" aria-label="Value hidden">••••••••</span></dd></div></dl></section>
```

## Example

```tsx
import { EnvironmentVariables } from "@noorddev/vlak-react";

<EnvironmentVariables variables={[{ name: "MODEL_NAME", value: "workspace-model", required: true }, { name: "EXAMPLE_TOKEN", value: "example-only" }]} />
```

## Props

### EnvironmentVariables

Masked values with deliberate reveal and exact-value/export copy actions.

Extends `Omit<HTMLAttributes<HTMLElement>, "onCopy" | "title">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `variables` (required) | `EnvironmentVariable[]` |  |  |
| `title` | `ReactNode` | `"Environment variables"` |  |
| `showValues` | `boolean` |  |  |
| `defaultShowValues` | `boolean` | `false` |  |
| `onShowValuesChange` | `(show: boolean) => void` |  |  |
| `onCopy` | `(value: string) => void \| Promise<void>` |  |  |

### Functions

- `formatEnvironmentExports` (function): POSIX shell-safe assignments. Invalid names are rejected rather than emitted as executable shell text.

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Tab reaches show-all, per-row reveal and copy controls. |
| Enter, Space | Enter or Space activates a focused control; the show-all button exposes its pressed state. |

## Accessibility

- The section and every reveal/copy control have descriptive names.
- Hidden values are absent from rendered text and labelled as hidden; values are never placed in title or data attributes.
- Clipboard success follows the resolved write, failures remain actionable, and pending writes cannot report success for changed data.

## Classes

`rs-environment-variables`, `rs-environment-variables-header`, `rs-environment-variables-title`, `rs-environment-variables-list`, `rs-environment-variables-row`, `rs-environment-variables-name`, `rs-environment-variables-value`, `rs-environment-variables-controls`, `rs-environment-variables-note`, `rs-environment-variables-footer`

## Dependencies

Registry dependencies: [button](button.md), [snippet](snippet.md).  
React: `packages/react/src/components/environment-variables.tsx`  
CSS: `packages/core/css/components/environment-variables.css`
