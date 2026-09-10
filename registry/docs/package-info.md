# Package info

Compares current and proposed package versions with change type and expandable dependencies.

Category: ai  
Name: `package-info`  
Also known as: AI Elements Package Info, Dependency change, Package version  
Page: https://vlak.dev/ai/package-info/

[AI component index](https://vlak.dev/docs/ai-index.md) · [Integration guide](https://vlak.dev/docs/ai.md) · [AI Elements feature coverage](https://vlak.dev/docs/ai-parity.md)

## When to use

- Review package additions, removals or version changes before an application performs them.
- Supply explicit changeType and dependency kinds; the component does not infer semantic version compatibility.
- Use actions for application-owned install, compare or inspection controls.

## When not to

- Assuming displayed package metadata is fetched, resolved or installed automatically.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { PackageInfo } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add package-info
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/package-info.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<article class="rs-package-info" aria-label="Package @example/review-ui"><header class="rs-package-info-header"><code class="rs-package-info-name">@example/review-ui</code></header><div class="rs-package-info-versions"><span>Current 1.2.0</span><strong>Proposed 1.3.0</strong></div><p class="rs-package-info-description">Adds draft recovery.</p></article>
```

## Example

```tsx
import { PackageInfo } from "@noorddev/vlak-react";

<PackageInfo name="@example/review-ui" currentVersion="1.2.0" newVersion="1.3.0" changeType="minor" description="Adds draft recovery." dependencies={[{ name: "react", version: "^19.0.0", kind: "peer" }]} />
```

## Props

### PackageInfo

Supplied package changes and dependencies; never resolves or installs packages.

Extends `Omit<HTMLAttributes<HTMLElement>, "title">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `name` (required) | `string` |  |  |
| `currentVersion` | `string` |  |  |
| `newVersion` | `string` |  |  |
| `changeType` | `PackageChangeType` |  |  |
| `description` | `ReactNode` |  |  |
| `dependencies` | `PackageDependency[]` |  |  |
| `actions` | `ReactNode` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Tab reaches dependency disclosure and supplied actions. |
| Enter, Space | Enter or Space toggles the dependency summary. |

## Accessibility

- Current and proposed version labels remain explicit to screen readers.
- Change type uses text instead of color alone.
- Dependency expansion uses a native details element.

## Classes

`rs-package-info`, `rs-package-info-header`, `rs-package-info-name`, `rs-package-info-versions`, `rs-package-info-description`, `rs-package-info-list`, `rs-package-info-actions`

## Dependencies

Registry dependencies: [badge](badge.md), [collapsible](collapsible.md).  
React: `packages/react/src/components/package-info.tsx`  
CSS: `packages/core/css/components/package-info.css`
