// Generates every derived artifact from the sources of truth:
//
//   src/tokens.ts     →  tokens/vlak.tokens.json   (tokens as JSON)
//                     →  css/tokens.css              (custom properties)
//   css/* sources     →  css/vlak.css              (the whole system, one file)
//
// Run with: npm run build:css  (Node ≥ 22.6)

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { vlakTokens } from "../src/tokens.ts";
import { vlakComponents } from "../src/registry.ts";

const root = (p) => fileURLToPath(new URL(`../${p}`, import.meta.url));
const read = (p) => readFileSync(root(p), "utf8");
const write = (p, text) => {
  writeFileSync(root(p), text);
  console.log(`wrote ${p} (${text.length} bytes)`);
};

/* ── 1. Tokens as JSON ── */
write("tokens/vlak.tokens.json", JSON.stringify(vlakTokens, null, 2) + "\n");

/* ── 2. Tokens as CSS custom properties ── */
const { color, grid, radius, control, motion, type, z } = vlakTokens;
const c1 = grid.column;
const gridImage = `linear-gradient(to right,var(--grid-line) 0,var(--grid-line) 1px,transparent 1px,transparent ${c1}px,var(--grid-line) ${c1}px,var(--grid-line) ${c1 + 1}px,transparent ${c1 + 1}px,transparent ${grid.module}px)`;

const darkBlock = (selector) => `${selector} {
  --bg: ${color.dark.black};
  --text: ${color.dark.white};
  --text-secondary: ${color.dark.gray};
  --accent: ${color.dark.white};
  --divider: ${color.dark.divider};
  --divider-subtle: ${color.dark.dividerSubtle};
  --table-alt: ${color.dark.tableAlt};
  --grid-line: ${color.dark.gridLine};
  --control-border: ${color.dark.controlBorder};
  --control-fill: ${color.dark.controlFill};
  color-scheme: dark;
}`;

const tokensCss = `/* ── Tokens ── GENERATED from src/tokens.ts. Do not edit by hand. */
:root {
  --bg: ${color.light.paper};                        /* paper */
  --text: ${color.light.ink};                      /* ink */
  --text-secondary: ${color.light.gray};            /* gray */
  --accent: ${color.light.ink};                   /* the "accent" is ink; monochrome */
  --divider: ${color.light.divider};
  --divider-subtle: ${color.light.dividerSubtle};
  --table-alt: ${color.light.tableAlt};
  --grid-line: ${color.light.gridLine};
  --control-border: ${color.light.controlBorder};
  --control-fill: ${color.light.controlFill};
  color-scheme: light;
  --radius-sm: ${radius.small}px;           /* slight Vlak radius; standalone buttons */
  --radius: var(--radius-sm);              /* alias — buttons, boxes, dialogs share it; cards stay 0 */
  --radius-chrome: ${radius.chrome}px;
  --gutter: ${grid.gutter}px;
  --pad: ${grid.pad}px;
  /* Concentric: Steve Ruiz innerRadius result. Closed form of the circular-corner fit. Default radius vs --pad is 0. */
  --radius-in: max(0px, calc(var(--radius) - var(--pad)));
  --ease: ${motion.easing};
  --duration-snap: ${motion.snap};
  --duration: ${motion.ease};
  --duration-deliberate: ${motion.deliberate};
  --duration-confirm: ${motion.confirm};
  /* The hover transition every control shares: fill, edge, ink, opacity. */
  --transition: background-color var(--duration) var(--ease), border-color var(--duration) var(--ease), color var(--duration) var(--ease), opacity var(--duration) var(--ease);
  /* Background column grid: ${grid.module}px modules (${grid.column} column + ${grid.gutter} gutter). */
  --grid-image: ${gridImage};
  --grid-size: ${grid.module}px;
  --grid-pos: ${grid.gutter}px 0;
  --text-scale: ${type.textScale.default};
  /* Stacking scale. Native dialog and popover use the top layer instead. */
  --z-raised: ${z.raised};
  --z-sticky: ${z.sticky};
  --z-float: ${z.float};
  --z-overlay: ${z.overlay};
  --z-toast: ${z.toast};
  /* Contract variables a component may set inline: concentric radius and the chart spot color. */
  --rs-out: var(--radius);
  --rs-gap: var(--pad);
  --rs-in: var(--radius-in);
  --rs-chart-spot: var(--text);
  /* Control scale. Every interactive target is at least 44px; phone fields use 16px type. */
  --hit: ${control.desktop.hit / 16}rem;
  --control-h: ${control.desktop.height / 16}rem;
  --control-fs: ${control.desktop.font / 16}rem;
  --control-label: ${control.desktop.label / 16}rem;
}
${darkBlock('[data-theme="dark"]')}
/* System dark scheme applies until the page decides with data-theme. */
@media (prefers-color-scheme: dark) {
${darkBlock(':root:not([data-theme="light"])')}
}
/* Mobile grid (≤${grid.mobile.breakpoint}): two fluid columns, three ${grid.mobile.gutter}px gutters
   (edge · middle · edge). Column width = 50vw − ${grid.mobile.gutter * 1.5}px; the background
   draws all four column-edge lines and content lives between the outer pair. */
@media(max-width:${grid.mobile.breakpoint}px){
  :root{
    --pad:${grid.mobile.pad}px;
    --grid-image:linear-gradient(to right,transparent 0,transparent ${grid.mobile.gutter}px,var(--grid-line) ${grid.mobile.gutter}px,var(--grid-line) ${grid.mobile.gutter + 1}px,transparent ${grid.mobile.gutter + 1}px,transparent calc(50vw - ${grid.mobile.gutter / 2}px),var(--grid-line) calc(50vw - ${grid.mobile.gutter / 2}px),var(--grid-line) calc(50vw - ${grid.mobile.gutter / 2 - 1}px),transparent calc(50vw - ${grid.mobile.gutter / 2 - 1}px),transparent calc(50vw + ${grid.mobile.gutter / 2}px),var(--grid-line) calc(50vw + ${grid.mobile.gutter / 2}px),var(--grid-line) calc(50vw + ${grid.mobile.gutter / 2 + 1}px),transparent calc(50vw + ${grid.mobile.gutter / 2 + 1}px),transparent calc(100vw - ${grid.mobile.gutter + 1}px),var(--grid-line) calc(100vw - ${grid.mobile.gutter + 1}px),var(--grid-line) calc(100vw - ${grid.mobile.gutter}px),transparent calc(100vw - ${grid.mobile.gutter}px));
    --grid-size:100vw;
    --grid-pos:0 0;
  }
}
/* Phone control scale (≤${control.breakpoint}): keep 44px hits and use 16px type on fields. */
@media(max-width:${control.breakpoint}px){
  :root{
    --hit:${control.phone.hit / 16}rem;
    --control-h:${control.phone.height / 16}rem;
    --control-fs:${control.phone.font / 16}rem;
    --control-label:${control.phone.label / 16}rem;
  }
}
`;
write("css/tokens.css", tokensCss);

/* ── 2b. W3C Design Tokens (DTCG) ──
   The same values in the community-group format ($type / $value), so
   Style Dictionary, Figma Variables, and Tokens Studio can ingest them
   without prose in the way. Light and dark are separate groups. */
const dtcg = {
  $schema: "https://tr.designtokens.org/format/",
  $description: `Vlak design tokens. ${vlakTokens.meta.url}`,
  color: {
    $description: "Monochrome. Paper, ink, gray. No accent hue.",
    light: {
      paper: { $type: "color", $value: color.light.paper, $description: "Page ground. --bg" },
      ink: { $type: "color", $value: color.light.ink, $description: "Text and marks. --text" },
      gray: { $type: "color", $value: color.light.gray, $description: "Secondary text. --text-secondary" },
      divider: { $type: "color", $value: color.light.divider, $description: "Hairline. --divider" },
      "divider-subtle": { $type: "color", $value: color.light.dividerSubtle, $description: "Fills only. --divider-subtle" },
      "grid-line": { $type: "color", $value: color.light.gridLine, $description: "Module grid ink. --grid-line" },
      "table-alt": { $type: "color", $value: color.light.tableAlt, $description: "Alternate row. --table-alt" },
      "control-border": { $type: "color", $value: color.light.controlBorder, $description: "Form control boundary, 3:1. --control-border" },
      "control-fill": { $type: "color", $value: color.light.controlFill, $description: "Hover fill of a ghost control. --control-fill" },
    },
    dark: {
      paper: { $type: "color", $value: color.dark.black, $description: "--bg" },
      ink: { $type: "color", $value: color.dark.white, $description: "--text" },
      gray: { $type: "color", $value: color.dark.gray, $description: "--text-secondary" },
      divider: { $type: "color", $value: color.dark.divider, $description: "--divider" },
      "divider-subtle": { $type: "color", $value: color.dark.dividerSubtle, $description: "--divider-subtle" },
      "grid-line": { $type: "color", $value: color.dark.gridLine, $description: "--grid-line" },
      "table-alt": { $type: "color", $value: color.dark.tableAlt, $description: "--table-alt" },
      "control-border": { $type: "color", $value: color.dark.controlBorder, $description: "--control-border" },
      "control-fill": { $type: "color", $value: color.dark.controlFill, $description: "--control-fill" },
    },
    neutral: Object.fromEntries(color.neutralScale.map((v, i) => [String(i), { $type: "color", $value: v }])),
  },
  grid: {
    module: { $type: "dimension", $value: { value: grid.module, unit: "px" }, $description: "--grid-size" },
    column: { $type: "dimension", $value: { value: grid.column, unit: "px" } },
    gutter: { $type: "dimension", $value: { value: grid.gutter, unit: "px" }, $description: "--gutter" },
    pad: { $type: "dimension", $value: { value: grid.pad, unit: "px" }, $description: "--pad" },
  },
  radius: {
    small: { $type: "dimension", $value: { value: radius.small, unit: "px" }, $description: "--radius-sm, aliased by --radius" },
    chrome: { $type: "dimension", $value: { value: radius.chrome, unit: "px" }, $description: "--radius-chrome" },
  },
  control: {
    desktop: {
      hit: { $type: "dimension", $value: { value: control.desktop.hit, unit: "px" }, $description: "--hit" },
      height: { $type: "dimension", $value: { value: control.desktop.height, unit: "px" }, $description: "--control-h" },
      font: { $type: "dimension", $value: { value: control.desktop.font, unit: "px" }, $description: "--control-fs" },
      label: { $type: "dimension", $value: { value: control.desktop.label, unit: "px" }, $description: "--control-label" },
    },
    phone: {
      hit: { $type: "dimension", $value: { value: control.phone.hit, unit: "px" } },
      height: { $type: "dimension", $value: { value: control.phone.height, unit: "px" } },
      font: { $type: "dimension", $value: { value: control.phone.font, unit: "px" } },
      label: { $type: "dimension", $value: { value: control.phone.label, unit: "px" } },
    },
  },
  breakpoint: Object.fromEntries(
    Object.entries(vlakTokens.breakpoints).map(([k, v]) => [k, { $type: "dimension", $value: { value: v, unit: "px" } }]),
  ),
  z: Object.fromEntries(
    Object.entries(z)
      .filter(([, v]) => typeof v === "number")
      .map(([k, v]) => [k, { $type: "number", $value: v, $description: `--z-${k}` }]),
  ),
  motion: {
    response: { $type: "duration", $value: { value: Number.parseFloat(motion.response) * 1000, unit: "ms" } },
    snappy: { $type: "duration", $value: { value: Number.parseFloat(motion.snappy) * 1000, unit: "ms" } },
    deliberate: { $type: "duration", $value: { value: Number.parseFloat(motion.deliberate) * 1000, unit: "ms" }, $description: "--duration-deliberate" },
    snap: { $type: "duration", $value: { value: Number.parseFloat(motion.snap) * 1000, unit: "ms" }, $description: "--duration-snap" },
    ease: { $type: "duration", $value: { value: Number.parseFloat(motion.ease) * 1000, unit: "ms" }, $description: "--duration" },
    confirm: { $type: "duration", $value: { value: Number.parseFloat(motion.confirm) * 1000, unit: "ms" }, $description: "--duration-confirm" },
    easing: {
      $type: "cubicBezier",
      $value: motion.easing.match(/-?[\d.]+/g).map(Number),
      $description: "--ease",
    },
  },
  performance: {
    "frame-120hz": { $type: "duration", $value: { value: vlakTokens.performance.frame.hz120, unit: "ms" } },
    "frame-60hz": { $type: "duration", $value: { value: vlakTokens.performance.frame.hz60, unit: "ms" } },
    "response-instant": { $type: "duration", $value: { value: vlakTokens.performance.responseInstant.max, unit: "ms" } },
    "thought-interruption": { $type: "duration", $value: { value: vlakTokens.performance.thoughtInterruption.at, unit: "ms" } },
    "attention-loss": { $type: "duration", $value: { value: vlakTokens.performance.attentionLoss.at, unit: "ms" } },
  },
  font: {
    family: { $type: "fontFamily", $value: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "system-ui", "sans-serif"] },
    weight: {
      body: { $type: "fontWeight", $value: 500 },
      heading: { $type: "fontWeight", $value: 600 },
    },
  },
};
write("tokens/vlak.tokens.dtcg.json", `${JSON.stringify(dtcg, null, 2)}\n`);

/* ── 3. The whole system as one file ── */
const componentFiles = [];
for (const component of vlakComponents) {
  for (const file of component.css) {
    if (!componentFiles.includes(file)) componentFiles.push(file);
  }
}
/* Standalone component files keep their source provenance. The aggregate
   bundles already have a generated banner, so omit only those repeated headers. */
const readBundleCss = (file) => read(`css/${file}`).replace(
  /^\/\* ── [^\r\n]*: generated from packages\/react\/src\/[^\r\n]* ── \*\/\r?\n/,
  "",
);
/* Cascade layers: every Vlak rule sits in a named layer, so unlayered
   consumer CSS wins without specificity games. @font-face stays outside. */
const layered = [
  ["vlak.tokens", ["tokens.css"]],
  ["vlak.base", ["base.css"]],
  ["vlak.type", ["type.css"]],
  ["vlak.components", componentFiles],
  ["vlak.touch", ["touch.css"]],
  ["vlak.motion", ["motion.css"]],
];

const banner = `/* ═══════════════════════════════════════════════════════════════════
   VLAK, a minimal, CSS-first design system.
   ${vlakTokens.meta.url}

   One ink, no accent hue: emphasis comes from weight, size, and
   spacing. Hairline borders, a ${grid.module}px module grid (${grid.column}px column +
   ${grid.gutter}px gutter), sentence case everywhere.

   Layers: ${layered.map(([name]) => name).join(", ")}.
   Your own unlayered CSS overrides any of it by default.

   GENERATED from the css/ sources. Edit those, then run
   \`npm run build:css\`. Tokens come from src/tokens.ts.

   Typeface: Inter (SIL OFL 1.1), variable, latin + latin-ext.
   Bundled. System sans is fallback only.
   ═══════════════════════════════════════════════════════════════════ */

`;

const vlakCss =
  banner +
  read("css/fonts.css") +
  `\n@layer ${layered.map(([name]) => name).join(", ")};\n\n` +
  layered
    .map(([name, files]) => `@layer ${name} {\n${files.map(readBundleCss).join("\n")}\n}\n`)
    .join("\n");
write("css/vlak.css", vlakCss);

/* ── 4. Components only ──
   For pages that already load @noorddev/vlak-react/css (tokens, base,
   type, and the compiled leaves) but also render plain rs-* markup. */
write(
  "css/components.css",
  `/* Vlak component classes only (layer vlak.components). Load after tokens, base, and type:
   @noorddev/vlak/css carries all of it; @noorddev/vlak-react/css carries the React side. Generated. */
@layer vlak.components {
${componentFiles.map(readBundleCss).join("\n")}
}
`,
);
