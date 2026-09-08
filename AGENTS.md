# Vlak for agents working on this repository

Vlak is a minimal design system built from paper, ink, gray, hairlines, and a 204px module. This file is for coding agents changing the repository. Agents installing Vlak in their own project want the consumer surfaces at the end.

## Layout

```
packages/core     @noorddev/vlak        tokens (src/tokens.ts), the registry (src/registry.ts), the schema
                                          (src/schema.ts), generated CSS (css/), tokens JSON, props JSON, docs
packages/react    @noorddev/vlak-react  the components: StyleX leaves in src/components/*.tsx, precompiled at build
packages/cli      @noorddev/vlak-cli    init, add, list, search, docs, tokens; bundles the registry snapshot
packages/mcp      @noorddev/vlak-mcp    MCP server over the same snapshot (stdio)
registry/         generated               shadcn registry-item JSON, bundle.json, docs/*.md, llms.txt
apps/www          docs site               Next static export; examples under components/examples/<name>/use.tsx
```

pnpm workspace, Node 22.6 or newer. Root scripts run every package: `pnpm build`, `pnpm test`, `pnpm typecheck`.

## The single source of paint

`packages/react/src/components/*.tsx` is the only place styles are written. Everything else is generated from it and from `packages/core/src/registry.ts`:

- `packages/core/css/components/*.css`, `css/vlak.css`, `css/components.css`: from the leaves (`scripts/build-components.mjs`, `scripts/build.mjs`)
- `packages/core/css/tokens.css`, `tokens/vlak.tokens.json`: from `src/tokens.ts`
- `packages/core/props/props.json`: from the React types (`scripts/build-props.mjs`)
- `registry/*.json`, `registry/bundle.json`, `registry/docs/*`: from the registry, props.json, and the docs generator (`scripts/build-docs.mjs`, `scripts/build-registry.mjs`)

Never edit those outputs by hand. Edit the leaf, the registry, or the tokens, then rebuild. CI rebuilds and fails on any diff, so commit the regenerated files with the change that produced them.

## The rs() pairing rules

Every StyleX key in a leaf must be applied through `rs([...classes], styles.key, ...)`, so the CSS builder can project it onto an `rs-*` class (see the header of `packages/core/scripts/build-components.mjs`):

- One fixed class with one style: `rs(["rs-btn-primary"], styles.base)` becomes `.rs-btn-primary { ... }`.
- N fixed classes with N styles pair by position.
- N classes with a different number of styles become one compound selector `.a.b { ... }`.
- `cond && styles.key` pairs with the class item that shares the same condition: `rs(["rs-tab", selected && "rs-tab-active"], styles.tab, selected && styles.active)`.
- A ternary pairs branch by branch: `variant === "ghost" ? "rs-btn-ghost" : "rs-btn-primary"` with `variant === "ghost" ? styles.ghost : styles.primary`.
- Anything the pairing cannot place fails the build with a message naming the file and key. Keys applied outside `rs()` go in the `MANUAL` table of the builder; keys that are intentionally unused go in `IGNORE`.

Tokens in leaves come from `vlak` and `mq` in `packages/react/src/tokens.stylex.ts`, which alias the CSS custom properties. Add a token in `packages/core/src/tokens.ts`, its custom property in `scripts/build.mjs`, and its alias in `tokens.stylex.ts`, in that order.

## Build and test

```sh
pnpm install
pnpm --filter @noorddev/vlak build:css        # components → tokens → vlak.css → props.json
pnpm --filter @noorddev/vlak build:registry   # docs → registry JSON, bundle, llms.txt
pnpm build                                      # every package (core, react, cli, mcp)
pnpm test                                       # core integrity, react jsdom + axe, cli, mcp
pnpm typecheck
npx biome check .                               # lint; warnings are fine, errors are not
node apps/www/scripts/build-deps.mjs            # what the site build runs first
pnpm dev                                        # docs site at localhost:3000
```

Run the two core builds twice and confirm `git status` is clean the second time: generated files must be byte-stable.

## Doctrine

- Monochrome. Paper, ink, gray. No hue anywhere in the system; a test rejects hex that is not gray. Charts may carry one spot color through `spot`.
- Hairlines (1px), square corners by default, one 4px radius token for controls, the 204px module (184 column + 20 gutter).
- Sentence case. No all caps, no periods in titles, no marketing.
- Platform first: `<dialog>`, `<details>`, the Popover API, scroll snap, native inputs. JavaScript only where the platform has nothing, and then the APG pattern with full keyboard support.
- No `!important` in shipped CSS. Everything sits in cascade layers so consumers override without it.
- Accessibility is required: name, role, keyboard, focus ring, 3:1 control border, `prefers-reduced-motion`, `forced-colors`. Every interactive component has an axe test and a keyboard test.
- Performance budgets: 8.3ms per frame at 120Hz, 16.7ms at 60Hz, and visible feedback within 100ms. Use 200–300ms for snappy transitions and 300–500ms for deliberate ones. At 1s show progress without stealing focus; before 10s explain the wait and preserve the user's place.
- Reading and reach: every interactive target is at least 44px by 44px. Ordinary text is at least 4.5:1, large text and control boundaries are at least 3:1. Body copy stays within 45–90 characters per line and 1.2–1.45 line height; Vlak defaults to 66ch and 1.45.
- Selected states use a full-surface change in fill, ink, or weight. Never mark selection with a vertical bar, leading border, or inset edge stripe.
- When a page shell already names an interface, do not repeat that title inside the specimen. Use the specimen header for context, status, or actions instead.
- Zero runtime dependencies beyond React and `@stylexjs/stylex`.
- Controlled and uncontrolled: `value` / `defaultValue` / `onValueChange` (or `checked` / `onCheckedChange`, `pressed` / `onPressedChange`, `open` / `onClose`). `className` and `style` merge; native attributes pass through; refs forward on the element a consumer would reach for; stateful files start with `"use client"`.

## Adding a component

1. Write the leaf in `packages/react/src/components/<name>.tsx`. Styles through `rs()`, tokens from `tokens.stylex.ts`, classes named `rs-<name>-*`.
2. Add the entry to `packages/core/src/registry.ts`: `name`, `title`, `description`, `category`, `classes`, `css: ["components/<name>.css"]`, `react`, `registryDependencies`, `snippet`, plus `example` (imports from `@noorddev/vlak-react`), `usage` (use and avoid), `keyboard` (only what the code does), `a11y`, and `aliases` (shadcn/ui, Radix, common names). The schema is `packages/core/src/schema.ts`.
3. Export it from `packages/react/src/index.ts`; `props.json` only lists exports found there.
4. Rebuild: `pnpm --filter @noorddev/vlak build:css && pnpm --filter @noorddev/vlak build:registry`.
5. Test in `packages/react/test/`: render, axe, keyboard. Core tests check the registry, CSS parity, props, and docs on their own.
6. Document: `apps/www/components/examples/<name>/use.tsx` for the site gallery; the registry entry already feeds the component page, the CLI, the MCP server, and `registry/docs/<name>.md`.

## Copy voice

Matter-of-fact. Short sentences. Sentence case. No em dashes; use a comma, a semicolon, or a full stop. Say what a thing does and when to reach for it; never sell it. Numbers and units in the description (40px, 1px, 204). Prop names and classes in backticks in markdown, plain in the registry strings.

## Consumer surfaces

Generated from the same sources, served by the site and shipped in the packages:

- `https://vlak.dev/llms.txt` and `llms-full.txt`: the llmstxt.org index and the whole documentation in one file.
- `https://vlak.dev/docs/guide.md`, `index.md`, `tokens.md`, `<name>.md`, `props.json`: markdown per component with install paths, example, props tables, keyboard, accessibility.
- `https://vlak.dev/r/index.json` and `r/<name>.json`: the shadcn-compatible registry; `meta.vlak` carries example, usage, keyboard, a11y, aliases, classes, snippet.
- `npx @noorddev/vlak-cli list --json | search <term> --json | docs <name> | tokens --json`: the same data offline.
- `@noorddev/vlak-mcp`: MCP tools `list_components`, `get_component`, `search_components`, `get_tokens`, `get_install`, `get_guide`; resources `vlak://docs/guide`, `vlak://docs/<name>`, `vlak://tokens`.
- `plugins/vlak`: a portable agent plugin with the MCP server and a provider-neutral `use-vlak` skill. The root `.claude-plugin/marketplace.json` makes it installable in Claude Code and compatible clients.
- In code: `import { vlakComponents, vlakTokens } from "@noorddev/vlak"` and `@noorddev/vlak/props`.
