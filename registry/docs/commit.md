# Commit

Shows a commit message, full-hash copy, author and time, with expandable changed files.

Category: ai  
Name: `commit`  
Also known as: AI Elements Commit, Git commit, Changed files  
Page: https://vlak.dev/ai/commit/

[AI component index](https://vlak.dev/docs/ai-index.md) · [Integration guide](https://vlak.dev/docs/ai.md) · [AI Elements feature coverage](https://vlak.dev/docs/ai-parity.md)

## When to use

- Inspect a supplied commit and its changed files.
- Use onFileSelect for navigation or an inline diff; the callback receives the full file record.
- Supply timeLabel for application-localized or relative time. The fallback is a stable UTC timestamp.

## When not to

- Running git commands or fetching file content from a display component.
- Passing a shortened hash when the copy action must return the complete revision.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { Commit } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add commit
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/commit.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<article class="rs-commit" aria-label="Commit a1b2c3d"><header class="rs-commit-header"><div class="rs-commit-heading"><span class="rs-commit-message">Retain failed drafts</span><div class="rs-commit-metadata"><code>a1b2c3d</code><span>Mina</span></div></div></header><div class="rs-commit-content"><details class="rs-disclosure"><summary class="rs-disclosure-summary">1 changed file</summary><ul class="rs-commit-list"><li class="rs-commit-file"><code class="rs-commit-path">src/composer.tsx</code><span class="rs-commit-count">18 additions</span></li></ul></details></div></article>
```

## Example

```tsx
import { Commit } from "@noorddev/vlak-react";

<Commit hash="a1b2c3d4e5f60718293a4b5c6d7e8f901234abcd" message="Retain failed drafts" author="Mina" timestamp="2026-09-09T10:20:00Z" defaultOpen files={[{ path: "src/composer.tsx", status: "modified", additions: 18, deletions: 4 }]} />
```

## Props

### Commit

Supplied commit metadata and changed files with exact hash copy and optional file navigation.

Extends `Omit<HTMLAttributes<HTMLElement>, "onCopy" | "title">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `hash` (required) | `string` |  |  |
| `message` (required) | `string` |  |  |
| `author` | `ReactNode` |  |  |
| `avatar` | `ReactNode` |  |  |
| `timestamp` | `string \| Date` |  | ISO date or Date; a supplied timeLabel can use the application's locale or relative clock. |
| `timeLabel` | `string` |  |  |
| `files` | `CommitFile[]` | `[]` |  |
| `defaultOpen` | `boolean` | `false` |  |
| `onFileSelect` | `(file: CommitFile) => void` |  |  |
| `onCopy` | `(hash: string) => void \| Promise<void>` |  |  |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Tab reaches copy, the file disclosure and optional file buttons. |
| Enter, Space | Enter or Space activates copy, disclosure or the focused file callback. |

## Accessibility

- The article includes the shortened hash in its accessible name while copy uses the complete supplied hash.
- Change status and additions/deletions use text, independent of color.
- Timestamp uses a machine-readable time element. Invalid dates are omitted.

## Classes

`rs-commit`, `rs-commit-header`, `rs-commit-heading`, `rs-commit-message`, `rs-commit-metadata`, `rs-commit-content`, `rs-commit-list`, `rs-commit-file`, `rs-commit-path`, `rs-commit-count`

## Dependencies

Registry dependencies: [badge](badge.md), [button](button.md), [collapsible](collapsible.md), [snippet](snippet.md).  
React: `packages/react/src/components/commit.tsx`  
CSS: `packages/core/css/components/commit.css`
