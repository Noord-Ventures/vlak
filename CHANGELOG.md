# Changelog

## 0.5.0 (unreleased)

This candidate brings the published packages into line with the component reference. It is not a publication announcement. The release is available only after all four npm packages pass the published-release check.

### Components and interactions

- iOS and Android navigation, search, lists, sheets, and controls follow platform conventions and retain system fonts.
- AI conversations, structured results, widgets, approvals, and workflow components include explicit application and provider boundaries. Optional Markdown, highlighting, JSX, and workflow engines remain separate imports.
- Scientific, healthcare, industrial, creative, and data components carry units, record identity, status, and supplied-data contracts.
- Menu placement, dialog focus behavior, input and timeline interactions, and keyboard coverage include the fixes already documented on the site.

### Source and agents

- CLI source updates include baselines, status and diff, reviewed update plans, interrupted-write recovery, and guarded rollback.
- Workflow kits expose example source, adapter contracts, and machine-readable manifests through the registry and MCP server.
- The portable plugin, its Claude-compatible manifest, MCP configuration, server descriptor, and package versions are aligned. The stdio plugin pins this MCP version.

### Distribution

- Five standalone interface starters install the same public Vlak version used by the site. Downloads do not rely on private snapshots or unpublished package aliases.
- Production site builds require all four npm `latest` tags to match the release and verify their tarball integrity, export maps, and generated package payloads against the checkout.
- Release tags must match the package, plugin, registry, and server versions. Published-package verification runs after npm publication and before the site can pass its production gate.

### Upgrade

Install matching 0.5.0 versions of the core and React packages after publication. Keep the existing stylesheet import. For vendored source, review `vlak status`, `vlak diff`, and an update plan before applying changes. Check each optional renderer's documented dependencies before adding it to a project.

## 0.4.0

Vlak becomes a package you can install three ways, with one source of paint behind all of them.

### Architecture

- **StyleX leaves are the single source of paint.** Every component in `packages/react/src/components` is a StyleX leaf that also applies semantic `rs-*` classes. The React package compiles the leaves at build time with `@stylexjs/babel-plugin` and ships one stylesheet (`@noorddev/vlak-react/css`, 42 KB, 12 KB gzipped) with `"use client"` kept on stateful modules and one ESM module per component (`@noorddev/vlak-react/components/<name>`). Consumers need no Babel or PostCSS.
- **vlak.css is generated from the same leaves.** A new core build step, `build-components.mjs`, executes each leaf against a recording stub and projects it onto the `rs-*` classes the component applies, so `@noorddev/vlak/css` (84 KB, 14 KB gzipped) paints plain HTML with identical pixels. Pairing is strict: an unplaced style fails the build. `@noorddev/vlak/css/components.css` serves pages that load the React stylesheet and also render `rs-*` markup.
- **Cascade layers.** Both stylesheets sit in `vlak.tokens`, `vlak.base`, `vlak.type`, `vlak.components`, `vlak.touch`, `vlak.motion`, so unlayered consumer CSS wins without `!important`.
- **Tokens.** `color-scheme` follows the scheme (light, dark, and the system fallback). `--control-border` gives form controls a 3:1 boundary. Contract variables for concentric radius (`--rs-out`, `--rs-gap`, `--rs-in`) and the chart spot. The type scale moves to rem with no root font-size pin. Breakpoints come from `defineConsts` in `tokens.stylex.ts`; the hard-coded media strings are gone.
- **Two-pass React build.** `@noorddev/vlak-react/tokens.stylex` ships uncompiled so a consumer's StyleX compile produces matching hashes; the components import a compiled `tokens.js` at runtime.

### Accessibility

- **Menus and listboxes.** Select is an APG select-only combobox: role `combobox` on the trigger, `aria-activedescendant`, type-ahead, Home, End, PageUp, PageDown. Combobox is an editable combobox with list autocomplete. Command uses the same listbox model with labelled groups. DropdownMenu, ContextMenu, and Menubar share one menu panel: roving tabindex, arrow wrap, first-letter type-ahead, disabled items skipped, focus returned to the trigger. ContextMenu opens on Shift+F10.
- **Calendar and DatePicker.** Calendar is a real grid with a roving cell, arrow, Home, End, PageUp, PageDown navigation, `aria-selected`, and `aria-current`. DatePicker is a labelled dialog that returns focus.
- **Overlays.** Dialog, Sheet, and Drawer share `useNativeDialog`: `h2` titles with generated ids, `aria-labelledby` and `aria-describedby` only while the parts are mounted, `closedby`, focus in on open and back on close, forwarded refs, an optional labelled close button (`closeLabel`), and `dismissable` / `lightDismiss` switches. Tooltip and HoverCard are `role="tooltip"` elements wired through `aria-describedby`, hoverable, dismissed by Escape. Toast pauses on hover and focus, scales its lifetime with length, and has a labelled close. Popover repositions on scroll and resize and uses CSS anchor positioning where supported.
- **Fields and controls.** Field binds hints and errors to its control through `aria-describedby` and `aria-invalid`. Progress is named. Slider has a visible focus ring and a 24px hit area. Every control carries a `forced-colors` branch and a `prefers-reduced-motion` branch. Tabs support Home and End and a vertical `orientation`. Resizable splits are keyboard-operable and stack on the phone. Breadcrumbs are `nav > ol > li` with `aria-current`. Carousel slides are named groups. Avatar (`name`), Alert, NavigationMenu, Sidebar, and ScrollArea have default names and roles.
- **Charts.** Rendered in real pixels, with a keyboard cursor and a status tooltip. Every chart, including Share, Donut, and Sparkline, carries a screen-reader table. Numbers format through `Intl.NumberFormat` with an optional `locale`.
- **Tests.** Three new suites (menus, overlays, controls) with keyboard paths, focus return, aria state, and an axe pass on every interactive component. Biome lints the repository.

### Packaging

- **Registry.** Shared helpers (`cx`, `rs`, `tokens.stylex`, `hidden`) are one `registry:lib` item every component depends on; components that import another component depend on it instead of inlining its source. `bundle.json` drops from 1.8 MB to 650 KB. The Inter item carries the OFL text and the font block the shadcn schema requires. Items declare their StyleX dependencies. Version comes from `package.json`.
- **Registry schema.** Entries carry `example`, `usage` (use and avoid), `keyboard`, `a11y`, and `aliases`. `@noorddev/vlak/props` exports every component's props as JSON (`VlakPropsJson`), generated from the React types.
- **CLI.** `dist/index.js` shrinks from 1.6 MB to 58 KB; the registry snapshot sits beside it and loads on first use. A remote registry that fails (network, bad JSON, 5xx) throws with the location; only a real 404 is "unknown component". `add` keeps nested registry trees intact so chart imports resolve.
- **Repository.** CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, issue and PR templates, CODEOWNERS, a README per package, the root README rewritten for the three install paths, `scratch/` removed, env files ignored, dependencies bumped within ranges.

### Docs

- The site consumes the built packages like any consumer; its own leaves compile through a Babel pre-loader that runs only the StyleX plugin, so SWC is back.
- Component pages: when to use, the three install paths plus CSS only, a React example, props tables per export, keyboard, accessibility, markup, classes, dependencies. The "Not on npm" gate is gone.
- New pages: Frameworks, Theming, Layers, StyleX, Accessibility, Agents. Getting started and Tokens rewritten for the shipped packages.
- Skip link, one `<main>` per page, phone menu with Escape and focus return, photos resized to WebP (18.4 MB to 2.6 MB), three.js loaded on demand.

### Agent surfaces

- `llms.txt`, `llms-full.txt`, and `/docs/<name>.md` on the site, generated from the registry.
- `/r/<name>.json` and `/r/index.json`: the shadcn registry.
- `npx @noorddev/vlak-cli list --json` and `docs <name>`.
- `@noorddev/vlak-mcp`: the registry over the Model Context Protocol.

### Breaking changes

- The 0.1 compat layer is gone: `vlak-compat.css`, `phone.css`, and `init --compat`. Use the `rs-*` names.
- `@noorddev/vlak-react/stylex` is now `@noorddev/vlak-react/tokens.stylex`.
- Combobox no longer opens on focus alone; it opens on click, typing, or Arrow Down.
- Alert renders `role="note"` by default. Pass `live="polite"` or `live="assertive"` for `status` or `alert`.
- ThemeToggle's accessible name is now "Switch to dark scheme" / "Switch to light scheme" and follows the state.
- Charts take `aria-label` or `aria-labelledby` on the component; the label lands on the figure. Use `locale` for number formatting.
- Calendar's `onSelect` and DatePicker's `onChange` are deprecated aliases of `onValueChange`; both accept `value` and `defaultValue`.
- Dialog, Sheet, and Drawer titles render as `h2`. Pass `as` to change the level.

### Migration

1. Replace `@noorddev/vlak-react/stylex` imports with `@noorddev/vlak-react/tokens.stylex`.
2. Import the stylesheet once: `import "@noorddev/vlak-react/css"`. Remove any Babel or PostCSS StyleX configuration you had only for Vlak.
3. Rename `onSelect` to `onValueChange` on Calendar and `onChange` to `onValueChange` on DatePicker.
4. If an Alert announces a change, add `live`. Static alerts need nothing.
5. If your CSS overrides used `!important` to beat Vlak, drop it; unlayered rules win now.
6. If you linked `vlak-compat.css`, finish the `rs-*` rename; `npx @noorddev/vlak-cli init` writes the current stylesheet.

### Icons

- Filled marks use theme-independent transparent detail cuts and a 2px silhouette weight, with optical recuts for arrows, people, folders, layered documents, receipts, utility objects, links, @, hash, and dense system marks. Line marks keep the original 1px language.
- Navigation and action endpoints are continuous, heavy arrows keep breathing room, modifiers align to their host marks, and dense system glyphs retain recognizable interior detail at 12px.

## 0.3.0

Cut 1: a stranger can install Vlak after merge, npm publish, and DNS.

- MIT on the code. Inter stays SIL OFL 1.1 (`packages/core/css/fonts/inter/OFL.txt`).
- Publishable packages: `@noorddev/vlak`, `@noorddev/vlak-react`, `@noorddev/vlak-cli` at 0.3.0. The locked org is `noorddev`. Not private. Types ship in the tarball. `@noorddev/vlak-react` depends on `@noorddev/vlak` so CSS is not a second secret install.
- Default face is vendored Inter (variable, latin + latin-ext). System sans is fallback only. Messina is off.
- Public host is `https://vlak.noord.dev`. Generated registry items, `vlak-base`, and the `inter` item use that host. Dead hosts (`vlak.design`, `vlak-pied`, `vercel.app`) fail CI.
- Documented CLI is `npx @noorddev/vlak-cli init`. `--registry` is implemented (HTTP(S) or a local directory; also `vlak.json.registry`). `init --compat` still writes 0.1 class names.
- Dropped leftover `vlak.design` copy and the `/api/vlak/tokens` + `/api/mcp` pointers. Those routes do not exist on this static export.
- Docs first page and getting started show the one command and Inter.
- Everyday shadcn/ui primitives now install Vlak-style: button group, drawer, empty, field, form (React), input group, item, label, native select, sidebar, spinner, toggle group. Catalog completeness, not a clone. Deferred: sonner (needs the sonner widget), direction (RTL helper, not a primitive), and the AI chat set (attachment, bubble, marker, message, message-scroller) which depend on Radix or `@shadcn/react`.

This release does not npm-publish, create a GitHub Release, or attach `vlak.noord.dev` on Vercel. Those are human steps after merge.
