# Vlak guide

Vlak is a minimal design system built from paper, ink, gray, hairlines, and a 204px module. 114 components in 9 categories: actions (14), forms (27), navigation (9), feedback (13), surfaces (8), content (22), icons (1), charts (7), patterns (13). Version 0.4.0. Site: https://vlak.dev. Source: https://github.com/Noord-Ventures/vlak.

Three install paths share one source, so nothing drifts: the React package (precompiled StyleX plus one stylesheet), the vendored source (the shadcn model, through the Vlak CLI or the shadcn CLI), and CSS only (`rs-*` classes on plain markup).

## Install

### React package

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { Button, Dialog, Field, Input } from "@noorddev/vlak-react";
```

React 18 or 19. Every component is also its own module: `import { Button } from "@noorddev/vlak-react/components/button"`. Stateful components carry `"use client"` already, so they work inside React Server Components trees without a wrapper.

### Vendor the source

```sh
npx @noorddev/vlak-cli init
npx @noorddev/vlak-cli add button dialog
```

`init` writes `styles/vlak.css`, the Inter files, a specimen `index.html`, and `vlak.json`. `add` copies the component's StyleX leaf and its dependencies into `components/vlak/`; shared helpers (`rs.ts`, `cx.ts`, `tokens.stylex.ts`) install once. Vendored leaves need a StyleX compiler (see StyleX below).

### shadcn registry

```sh
npx shadcn add https://vlak.dev/r/button.json
```

The registry at `https://vlak.dev/r/` follows the shadcn registry-item schema. `https://vlak.dev/r/index.json` lists every item; each item's `meta.vlak` carries the category, classes, snippet, example, usage, keyboard, accessibility notes, and aliases.

### CSS only

```html
<link rel="stylesheet" href="node_modules/@noorddev/vlak/css/vlak.css" />
<button class="rs-btn-primary">Primary action</button>
```

`@noorddev/vlak/css` paints every component through `rs-*` classes and needs no JavaScript. Individual files are exported too: `@noorddev/vlak/css/tokens.css`, `@noorddev/vlak/css/components/button.css`. The class names per component are listed on each component page and in `/r/<name>.json` under `meta.vlak.classes`.

## Theming

Set `data-theme="dark"` on the root element for the dark scheme, `data-theme="light"` to pin light. Without either, `prefers-color-scheme` applies. `color-scheme` is set with the tokens, so native controls follow. `ThemeToggle` flips the attribute and stores the choice in `localStorage` under `vlak-theme`.

There is no accent hue. Emphasis comes from weight, size, and spacing. Charts may carry one spot color through the `spot` prop, which sets `--rs-chart-spot`.

Every token is a custom property on `:root`; override them in your own stylesheet. See tokens.md for the full list with light and dark values. The tokens also ship as JSON (`@noorddev/vlak/tokens`) and as a W3C Design Tokens (DTCG) file (`@noorddev/vlak/tokens.dtcg`).

## Cascade layers and overriding

All Vlak CSS sits in cascade layers, in this order: `vlak.tokens`, `vlak.base`, `vlak.type`, `vlak.components`, `vlak.touch`, `vlak.motion`. Unlayered author CSS wins over any of it, so overrides never need `!important`:

```css
.rs-btn-primary { border-radius: 8px; }
```

To override from inside a layer, declare yours after Vlak's: `@layer vlak.motion, app;`.

## StyleX

The leaves are StyleX. Consumers of `@noorddev/vlak-react` need no compiler: the package is precompiled and `@noorddev/vlak-react/css` carries the output. To write your own leaves against Vlak tokens, or to compile vendored leaves, use the token file:

```tsx
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "@noorddev/vlak-react/tokens.stylex";

const styles = stylex.create({
  panel: { borderTop: `1px solid ${vlak.divider}`, padding: vlak.pad, [mq.phone]: { padding: 12 } },
});
```

`vlak` aliases the CSS custom properties (`vlak.ink` is `var(--text)`), so compiled leaves and `rs-*` CSS read the same values. A StyleX compiler must include `@noorddev/vlak-react/tokens.stylex` in its compile so the variable hashes match: Vite uses `@stylexjs/unplugin`; Next.js uses `@stylexjs/postcss-plugin` plus a Babel pass with `@stylexjs/babel-plugin`. Without a compiler, import the package and its stylesheet and skip StyleX entirely.

## Components

Every component applies its styles through `rs([...classes], styles.leaf)`: the same element carries the semantic `rs-*` class (the CSS-only contract) and the compiled StyleX class. Overriding the class works on both paths.

Conventions that hold across the catalogue:

- Performance: a frame has 8.3ms at 120Hz or 16.7ms at 60Hz. User feedback lands within 100ms. Snappy transitions take 200–300ms; deliberate transitions take 300–500ms. At 1s, show progress without stealing focus. Before 10s, explain the wait and preserve the user's place.
- Accessibility: interactive targets are at least 44px by 44px. Ordinary text is at least 4.5:1 against its ground; large text and control boundaries are at least 3:1.
- Reading: body copy stays between 45 and 90 characters per line, with 66 characters as the default measure. Body line-height stays between 1.2 and 1.45 times its font size; Vlak defaults to 1.45.
- Controlled and uncontrolled: `value` / `defaultValue` / `onValueChange` (Select, Combobox, Tabs, RadioGroup, ToggleGroup, Slider, Calendar, DatePicker); `checked` / `defaultChecked` / `onCheckedChange` (Switch); `pressed` / `defaultPressed` / `onPressedChange` (Toggle); `open` / `onClose` (Dialog, AlertDialog, Sheet, Drawer, CommandDialog). Checkbox and Radio are native inputs and use `checked` / `onChange`.
- `className` and `style` merge with the component's own; native attributes and event handlers pass through to the root element (the props tables say which attribute set each component extends).
- Refs: 187 of 188 exported components forward `ref` to their root element; each props table names the element (`ref` in props.json). The rest render a plain element and take no ref.
- Names: components that render no visible label take `aria-label` or `aria-labelledby` (Select, Combobox, Switch, Slider, ButtonGroup, ToggleGroup, RadioGroup, ScrollArea, Carousel, Split). Dialogs are named by their Title part.
- Platform first: `<dialog>`, `<details>`, the Popover API, scroll snap, and native inputs do the work. Where the platform has nothing, the APG pattern applies (listbox, menu, grid, tabs) with full keyboard support, listed on each page.
- Sentence case everywhere. No all caps. Copy is short and matter-of-fact.

## CLI

```sh
npx @noorddev/vlak-cli init [--css-dir <dir>] [--components-dir <dir>] [--registry <url>] [--overwrite]
npx @noorddev/vlak-cli add <component...> [--overwrite] [--registry <url>]
npx @noorddev/vlak-cli list [--json]
npx @noorddev/vlak-cli search <term> [--json]
npx @noorddev/vlak-cli docs <component>
npx @noorddev/vlak-cli tokens [--json]
```

The CLI works offline: the registry snapshot, the CSS, the docs, and Inter ship with it. `--json` prints machine output with no prose.

## Registry

- `https://vlak.dev/r/index.json`: every item without file contents.
- `https://vlak.dev/r/<name>.json`: one item with its files inlined, in the shadcn registry-item schema. `vlak-base` (tokens, base, type), `inter` (the font), and `vlak-lib` (shared helpers) are the foundation items every component depends on.
- `https://vlak.dev/docs/props.json`: every export of every component with its props (name, type, required, default, description) and the DOM attribute type it extends.

## For agents

Vlak is published as data so tools can install and compose it without guessing:

- `https://vlak.dev/llms.txt`: the index of everything below, in the llmstxt.org format. `https://vlak.dev/llms-full.txt` is the whole documentation in one file.
- `https://vlak.dev/docs/index.md`, `https://vlak.dev/docs/guide.md` (this file), `https://vlak.dev/docs/tokens.md`, and `https://vlak.dev/docs/<name>.md` for each component.
- `https://vlak.dev/r/index.json` and `https://vlak.dev/r/<name>.json`: the registry, with `meta.vlak` holding the example, usage, keyboard table, accessibility notes, classes, and aliases.
- `https://vlak.dev/docs/props.json`: the props contract, also shipped as `@noorddev/vlak/props`.
- `npx @noorddev/vlak-cli list --json`, `search <term> --json`, `docs <name>`, `tokens --json`: the same data from the terminal, offline.
- `@noorddev/vlak-mcp`: an MCP server over stdio with `list_components`, `get_component`, `search_components`, `get_tokens`, `get_install`, and `get_guide`, plus `vlak://docs/<name>` resources. Configure it as `{"mcpServers": {"vlak": {"command": "npx", "args": ["-y", "@noorddev/vlak-mcp"]}}}`.
- In code, `import { vlakComponents, vlakTokens } from "@noorddev/vlak"` gives the typed registry and tokens.

When composing an interface: pick components by name or alias from index.md, read the page for the example and the props table, import from `@noorddev/vlak-react`, and keep to the conventions above. Do not invent props; the props tables are generated from the TypeScript sources. Keep the copy in sentence case.
