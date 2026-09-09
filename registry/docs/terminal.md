# Terminal

Renders streamed console output with incremental ANSI attributes and optional original colors.

Category: ai  
Name: `terminal`  
Also known as: AI Elements Terminal, ANSI output, Console output  
Page: https://vlak.dev/ai/terminal/

## When to use

- Pass the growing output string to retain partial terminal escape sequences across updates.
- The monochrome default preserves bold, italic, underline, strike and inverse states. Set ansiColors to display supplied 16-color, 256-color and truecolor values.
- Provide onClear to request clearing application state. Copy preserves the complete original output, including escape sequences.
- maxCharacters bounds visible source; maxHeight creates a named keyboard-scrollable region.

## When not to

- Treating this output viewer as a shell, process runner or cursor-addressable terminal emulator.
- Assuming output text can execute OSC clipboard commands or turn itself into active links. Such sequences are discarded.
- Forcing follow-scroll while a reader is inspecting earlier output.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { Terminal } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add terminal
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/terminal.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<section class="rs-terminal" aria-label="Terminal"><header class="rs-terminal-header"><span class="rs-terminal-title">Terminal</span><span class="rs-terminal-status" role="status">Output complete</span></header><div class="rs-terminal-content" tabindex="0" role="group" aria-label="Terminal output"><pre class="rs-terminal-pre"><span class="rs-terminal-run rs-terminal-bold">2 tests passed</span></pre></div></section>
```

## Example

```tsx
import { Terminal } from "@noorddev/vlak-react";

<Terminal output={"\u001b[1m2 tests passed\u001b[0m\n"} streaming={false} />
```

## Props

### Terminal

Streaming console output with incremental ANSI attributes; not a shell or terminal emulator.

Extends `Omit<HTMLAttributes<HTMLElement>, "onCopy" | "title">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `output` (required) | `string` |  |  |
| `title` | `ReactNode` | `"Terminal"` |  |
| `streaming` | `boolean` | `false` |  |
| `autoScroll` | `boolean` | `true` |  |
| `ansiColors` | `boolean` | `false` | Explicitly opt into original ANSI colors. The default retains text attributes in monochrome. |
| `onClear` | `() => void` |  |  |
| `onCopy` | `(output: string) => void \| Promise<void>` |  |  |
| `maxHeight` | `Property.MaxHeight<string \| number>` | `"24rem"` |  |
| `maxCharacters` | `number` | `100000` | Maximum visible source characters. Copy retains the complete original output. |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Tab reaches copy, optional clear, jump-to-latest and the output region. |
| Enter, Space | Enter or Space activates the focused button. Scroll keys move the focused output region. |

## Accessibility

- Only the short streaming status is live; token output remains ordinary readable text.
- Reader scroll position is preserved until they return to the end or activate Latest output.
- The cursor is decorative and stops animating with reduced motion.
- Original terminal colors are explicit opt-in and revert to system colors in forced-colors mode. Text remains escaped React content.

## Classes

`rs-terminal`, `rs-terminal-header`, `rs-terminal-title`, `rs-terminal-status`, `rs-terminal-content`, `rs-terminal-pre`, `rs-terminal-cursor`, `rs-terminal-footer`, `rs-terminal-run`, `rs-terminal-bold`, `rs-terminal-dim`, `rs-terminal-italic`, `rs-terminal-underline`, `rs-terminal-strike`, `rs-terminal-underline-strike`, `rs-terminal-inverse`, `rs-terminal-colors`

## Dependencies

Registry dependencies: [button](button.md), [snippet](snippet.md).  
React: `packages/react/src/components/terminal.tsx`  
CSS: `packages/core/css/components/terminal.css`
