import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { transformSync } from "esbuild";
import { vlakTokens } from "../src/tokens";
import { vlakComponents } from "../src/registry";

const pkgDir = join(import.meta.dirname, "..");
let vlakCss: string;

/** vlak.css with every @media block removed: what applies at desktop, unconditionally. */
function withoutMedia(css: string): string {
  let out = "";
  let i = 0;
  while (i < css.length) {
    const at = css.indexOf("@media", i);
    if (at === -1) {
      out += css.slice(i);
      break;
    }
    out += css.slice(i, at);
    let depth = 0;
    let j = css.indexOf("{", at);
    for (; j < css.length; j++) {
      if (css[j] === "{") depth++;
      else if (css[j] === "}") {
        depth--;
        if (depth === 0) break;
      }
    }
    i = j + 1;
  }
  return out;
}

function luminanceSpread(hex: string): number {
  const n = hex.length === 4 ? hex.replace(/[0-9a-f]/gi, (c) => c + c) : hex;
  const r = parseInt(n.slice(1, 3), 16);
  const g = parseInt(n.slice(3, 5), 16);
  const b = parseInt(n.slice(5, 7), 16);
  return Math.max(r, g, b) - Math.min(r, g, b);
}

function rgb(hex: string): [number, number, number] {
  return [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
}

function relativeLuminance(color: [number, number, number]): number {
  const linear = color.map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return linear[0]! * 0.2126 + linear[1]! * 0.7152 + linear[2]! * 0.0722;
}

function contrast(foreground: [number, number, number], background: [number, number, number]): number {
  const a = relativeLuminance(foreground);
  const b = relativeLuminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

function composite(ink: [number, number, number], ground: [number, number, number], alpha: number): [number, number, number] {
  return ink.map((channel, i) => channel * alpha + ground[i]! * (1 - alpha)) as [number, number, number];
}

beforeAll(() => {
  // The generated CSS is committed; CI checks it is in sync with the sources
  // (build, then git diff --exit-code). Tests never write into the tree.
  vlakCss = readFileSync(join(pkgDir, "css/vlak.css"), "utf8");
});

describe("generated vlak.css", () => {
  it("bundles the same component rules and order while leaving provenance in standalone files", () => {
    const files = [...new Set(vlakComponents.flatMap(component => component.css))];
    const sources = files.map(file => readFileSync(join(pkgDir, "css", file), "utf8"));
    const bundle = readFileSync(join(pkgDir, "css/components.css"), "utf8");
    // Parse both forms with the existing build dependency. Only comments and
    // formatting are discarded; selectors, declarations, layers and order remain.
    const paint = (css: string) => transformSync(css, { loader: "css", legalComments: "none", minifyWhitespace: true }).code;
    expect(paint(bundle)).toBe(paint(`@layer vlak.components {\n${sources.join("\n")}\n}\n`));
    expect(vlakCss).toContain(bundle.slice(bundle.indexOf("@layer vlak.components")));
    expect(sources.every(source => source.startsWith("/* ── ") && source.split("\n")[0]!.includes("generated from packages/react/src/"))).toBe(true);
    expect(bundle).not.toContain("generated from packages/react/src/");
    expect(vlakCss).not.toContain("generated from packages/react/src/");
    expect(vlakCss).toContain("Typeface: Inter (SIL OFL 1.1)");
  });

  it("keeps the switch rail slim without shrinking its hit area", () => {
    const css = readFileSync(join(pkgDir, "css/components/switch.css"), "utf8");
    const hit = css.match(/\.rs-switch\{([^}]+)\}/)?.[1];
    const rail = css.match(/\.rs-switch::before\{([^}]+)\}/)?.[1];
    expect(hit).toContain("min-width:var(--hit)");
    expect(hit).toContain("min-height:var(--hit)");
    expect(rail).toContain("width:2.75rem");
    expect(rail).toContain("height:1.5rem");
    expect(css).toContain("inset-inline-start:0.21875rem");
    expect(css).toContain("inset-inline-start:1.46875rem");
    expect(css).not.toContain("translateX(");
  });

  it("gives toggle segments breathing room", () => {
    const css = readFileSync(join(pkgDir, "css/components/toggle.css"), "utf8");
    expect(css).toContain("padding-inline:1.25rem");
  });

  it("centers playback and media controls without extra transport block spacing", () => {
    const playbackCss = readFileSync(join(pkgDir, "css/components/playback-controls.css"), "utf8");
    const playerCss = readFileSync(join(pkgDir, "css/components/media-player.css"), "utf8");
    const playback = playbackCss.match(/\.rs-playback-controls\{([^}]+)\}/)?.[1];
    const controls = playerCss.match(/\.rs-media-player-controls\{([^}]+)\}/)?.[1];
    for (const row of [playback, controls]) {
      expect(row).toContain("display:flex");
      expect(row).toContain("align-items:center");
    }
    // One-sided padding enlarges the flex item and shifts Play above Mute and Volume.
    expect(playback).not.toMatch(/(?:^|;)(?:padding|margin)(?:-(?:top|bottom|block(?:-start|-end)?))?:/);

    const play = playbackCss.match(/\.rs-playback-action\{([^}]+)\}/)?.[1];
    const mute = playerCss.match(/\.rs-media-player-action\{([^}]+)\}/)?.[1];
    expect(play).toContain("height:var(--hit)");
    expect(mute).toContain("min-height:var(--hit)");
    for (const action of [play, mute]) expect(action).toContain("min-width:var(--hit)");
  });

  it("keeps media actions compact when phone buttons otherwise fill their row", () => {
    const playerCss = readFileSync(join(pkgDir, "css/components/media-player.css"), "utf8");
    const mute = playerCss.match(/@media \(max-width: 640px\)\{\.rs-media-player-action\{([^}]+)\}\}/)?.[1];
    // CSS-first consumers need an override at the same breakpoint as Button's full width.
    expect(mute).toContain("width:auto");
  });

  it("defines every custom property it uses", () => {
    const used = new Set([...vlakCss.matchAll(/var\((--[a-z-]+)[,)]/g)].map((m) => m[1]!));
    const defined = new Set([...vlakCss.matchAll(/(--[a-z-]+)\s*:/g)].map((m) => m[1]!));
    const missing = [...used].filter((v) => !defined.has(v));
    expect(missing, `var() without definition: ${missing.join(", ")}`).toEqual([]);
  });

  it("mirrors the token values", () => {
    expect(vlakCss).toContain(`--bg: ${vlakTokens.color.light.paper}`);
    expect(vlakCss).toContain(`--text: ${vlakTokens.color.light.ink}`);
    expect(vlakCss).toContain(`--bg: ${vlakTokens.color.dark.black}`);
    expect(vlakCss).toContain(`--radius-sm: ${vlakTokens.radius.small}px`);
    expect(vlakCss).toContain(`--grid-size: ${vlakTokens.grid.module}px`);
    expect(vlakCss).toContain(`--duration-snap: ${vlakTokens.motion.response}`);
    expect(vlakCss).toContain(`--duration-deliberate: ${vlakTokens.motion.deliberate}`);
  });

  it("encodes the interaction and reading budgets", () => {
    expect(vlakTokens.performance.frame).toMatchObject({ hz120: 8.3, hz60: 16.7 });
    expect(vlakTokens.performance.responseInstant.max).toBe(100);
    expect(vlakTokens.performance.thoughtInterruption.at).toBe(1000);
    expect(vlakTokens.performance.attentionLoss.at).toBe(10000);
    expect(vlakTokens.control.desktop.hit).toBeGreaterThanOrEqual(44);
    expect(vlakTokens.control.desktop.height).toBeGreaterThanOrEqual(44);
    expect(vlakTokens.type.measure.minCharacters).toBe(45);
    expect(vlakTokens.type.measure.maxCharacters).toBe(90);
    expect(vlakTokens.type.bodyLineHeight).toBeGreaterThanOrEqual(1.2);
    expect(vlakTokens.type.bodyLineHeight).toBeLessThanOrEqual(1.45);
    expect(vlakTokens.accessibility.contrast.ordinaryText).toBe(4.5);
    expect(vlakTokens.accessibility.contrast.largeText).toBe(3);
  });

  it("meets the contrast floors in both themes", () => {
    const lightGround = rgb(vlakTokens.color.light.paper);
    const darkGround = rgb(vlakTokens.color.dark.black);
    expect(contrast(rgb(vlakTokens.color.light.gray), lightGround)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(rgb(vlakTokens.color.dark.gray), darkGround)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(composite([0, 0, 0], lightGround, 0.42), lightGround)).toBeGreaterThanOrEqual(3);
    expect(contrast(composite([255, 255, 255], darkGround, 0.38), darkGround)).toBeGreaterThanOrEqual(3);
  });

  it("defaults to bundled Inter, with system sans as fallback only", () => {
    expect(vlakCss).toContain("@font-face");
    expect(vlakCss).toContain("font-family:Inter");
    expect(vlakCss).toContain("./fonts/inter/InterVariable-latin.woff2");
    expect(vlakTokens.type.foundry.typeface).toBe("Inter");
    expect(vlakTokens.type.foundry.license).toBe("SIL OFL 1.1");
  });

  it("has balanced braces", () => {
    const open = (vlakCss.match(/\{/g) ?? []).length;
    const close = (vlakCss.match(/\}/g) ?? []).length;
    expect(open).toBe(close);
  });

  it("declares its cascade layers up front, in order", () => {
    const order = vlakCss.match(/@layer ([^;{]+);/)?.[1]?.split(",").map((s) => s.trim());
    expect(order).toEqual([
      "vlak.tokens",
      "vlak.base",
      "vlak.type",
      "vlak.components",
      "vlak.touch",
      "vlak.motion",
    ]);
    for (const name of order ?? []) expect(vlakCss).toContain(`@layer ${name} {`);
    // @font-face must sit outside the layers.
    expect(vlakCss.indexOf("@font-face")).toBeLessThan(vlakCss.indexOf("@layer "));
  });

  it("never uses !important", () => {
    expect(vlakCss).not.toContain("!important");
  });

  it("paints every component at desktop, not only inside a media query", () => {
    // The CSS-first guarantee: a component's primary class has rules that apply
    // unconditionally. Modifier classes may legitimately exist only for phones.
    const desktop = withoutMedia(vlakCss);
    const missing: string[] = [];
    for (const c of vlakComponents) {
      const primary = c.classes[0]!;
      if (!new RegExp(`\\.${primary}(?![\\w-])`).test(desktop)) missing.push(`${c.name}: .${primary}`);
    }
    expect(missing, `components with phone-only paint: ${missing.join(", ")}`).toEqual([]);
  });

  it("stays monochrome: every hex color is a neutral", () => {
    const hexes = [...vlakCss.matchAll(/#[0-9a-f]{3,6}\b/gi)].map((m) => m[0]);
    const hued = hexes.filter((h) => luminanceSpread(h) > 12);
    expect(hued, `hued colors: ${[...new Set(hued)].join(", ")}`).toEqual([]);
  });

  it("paints inline axes with logical properties, so dir=\"rtl\" mirrors for free", () => {
    const components = readFileSync(join(pkgDir, "css/components.css"), "utf8");
    const physical = components.match(/(?:padding|margin|border)-(?:left|right)\b|[;{]\s*(?:left|right)\s*:|text-align\s*:\s*(?:left|right)/g) ?? [];
    expect(physical, "physical inline properties in generated component CSS").toEqual([]);
  });

  it("respects reduced motion and touch", () => {
    expect(vlakCss).toContain("@media(prefers-reduced-motion:reduce)");
    expect(vlakCss).toMatch(/@media\s*\(hover:\s*none\)/);
  });
});

describe("brand hooks", () => {
  const stack = vlakTokens.type.family;
  const read = (file: string) => readFileSync(join(pkgDir, file), "utf8");

  /** The text between the braces of the first block that opens with `opener`. */
  function block(css: string, opener: string): string {
    const at = css.indexOf(opener);
    expect(at, `${opener} is missing`).toBeGreaterThanOrEqual(0);
    const open = css.indexOf("{", at);
    let depth = 0;
    for (let i = open; i < css.length; i++) {
      if (css[i] === "{") depth++;
      else if (css[i] === "}" && --depth === 0) return css.slice(open + 1, i);
    }
    throw new Error(`${opener} is not closed`);
  }

  /** Where two strings first differ, short enough to read in a failure. */
  function firstDifference(a: string, b: string): string {
    let i = 0;
    while (i < a.length && i < b.length && a[i] === b[i]) i++;
    return `first difference at ${i}: ${JSON.stringify(a.slice(Math.max(0, i - 60), i + 80))} against ${JSON.stringify(b.slice(Math.max(0, i - 60), i + 80))}`;
  }

  it("declares --action and --action-text in all three colour blocks, and the fonts once", () => {
    const tokens = read("css/tokens.css");
    const light = block(tokens, ":root {");
    const dark = block(tokens, '[data-theme="dark"] {');
    const system = block(tokens, ':root:not([data-theme="light"]) {');
    // A var() is substituted where it is declared, so a dark wrapper that redefines --text needs its own --action.
    for (const colours of [light, dark, system]) {
      expect(colours).toMatch(/^\s*--action: var\(--text\);/m);
      expect(colours).toMatch(/^\s*--action-text: var\(--bg\);/m);
    }
    expect(light).toContain(`--font-sans: ${stack};`);
    expect(light).toContain("--font-display: var(--font-sans);");
    expect(vlakTokens.type.family).toBe("Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif");
    for (const [name, expected] of [["--action", 3], ["--action-text", 3], ["--font-sans", 1], ["--font-display", 1]] as const) {
      expect(tokens.match(new RegExp(`^\\s*${name}:`, "gm"))?.length, name).toBe(expected);
      expect(vlakCss.match(new RegExp(`^\\s*${name}:`, "gm"))?.length, `${name} in vlak.css`).toBe(expected);
    }
  });

  it("is vlak.css 0.5.0 again once the five hooks take their defaults", () => {
    const released = read("test/fixtures/vlak-0.5.0.css");
    const hooks = /^[ \t]*--(?:action|action-text|font-sans|font-display):[^\n]*\n/gm;
    const fonts = vlakCss.match(/font-family:var\(--font-sans\)/g)?.length ?? 0;
    // The Android leaves spelled a shorter fallback chain than everything else. They share --font-sans now, so
    // 'Segoe UI' and system-ui come before sans-serif in them: a difference only where Inter does not load.
    const legacy = [
      "Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif",
      "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
    ];
    let before = released;
    for (const spelling of legacy) before = before.replaceAll(`font-family:${spelling}`, `font-family:${stack}`);
    const current = vlakCss
      .replace(hooks, "")
      .replaceAll("font-family:var(--font-display);", "")
      .replaceAll("var(--action-text)", "var(--bg)")
      .replaceAll("var(--action)", "var(--text)")
      .replaceAll("var(--font-sans)", stack);
    expect(vlakCss.match(hooks)?.length).toBe(8);
    expect(vlakCss.match(/font-family:var\(--font-display\);/g)?.length).toBe(3);
    // Every Inter stack of 0.5.0 became the hook: no more, no fewer.
    expect(fonts).toBe(15);
    expect(before.split(`font-family:${stack}`).length - 1).toBe(fonts);
    expect(current === before, current === before ? "" : firstDifference(current, before)).toBe(true);
  });

  it("spends --action on the primary action and nothing else", () => {
    const rules = [...vlakCss.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/([^{}]+)\{([^{}]*)\}/g)]
      .filter(([, , body]) => /var\(--action(?:-text)?\)/.test(body!))
      .map(([, selector]) => selector!.trim());
    // A selected, on, checked, active, progress, badge or avatar fill stays ink; docs/brand lists each decision.
    expect(rules).toEqual([".rs-btn-primary", ".rs-btn-primary.rs-inline-btn.rs-inline-field-btn"]);
    expect(read("css/components/button.css")).toContain(".rs-btn-primary{font-weight:600;background-color:var(--action);color:var(--action-text);");
  });

  it("gives the display, display XL and title steps the display face, and no other step", () => {
    const type = read("css/type.css");
    for (const step of ["xl", "display", "title"]) expect(type).toMatch(new RegExp(`\\.rs-t-${step}\\{font-family:var\\(--font-display\\);`));
    for (const step of ["sub", "body", "label"]) expect(type).not.toMatch(new RegExp(`\\.rs-t-${step}\\{[^}]*font-family`));
  });

  it("reaches every face through a hook, inherit or a monospace stack", () => {
    const sources = ["css/components.css", "css/base.css", "css/type.css", "css/touch.css", "css/motion.css"].map(read).join("\n");
    const families = [...new Set([...sources.matchAll(/font-family:([^;}]+)/g)].map((m) => m[1]!.trim()))];
    const stray = families.filter((f) => !["inherit", "var(--font-sans)", "var(--font-display)"].includes(f) && !f.startsWith("ui-monospace"));
    expect(stray, `faces a brand cannot reach: ${stray.join(" | ")}`).toEqual([]);
  });

  it("carries the hooks in the token JSON and the DTCG file as aliases of existing entries", () => {
    const json = JSON.parse(read("tokens/vlak.tokens.json"));
    const dtcg = JSON.parse(read("tokens/vlak.tokens.dtcg.json"));
    expect(json.color.light).toMatchObject({ action: "var(--text)", actionText: "var(--bg)" });
    expect(json.color.dark).toMatchObject({ action: "var(--text)", actionText: "var(--bg)" });
    expect(json.type.display).toBe("var(--font-sans)");
    expect(dtcg.color.light.action.$value).toBe("{color.light.ink}");
    expect(dtcg.color.light["action-text"].$value).toBe("{color.light.paper}");
    expect(dtcg.color.dark.action.$value).toBe("{color.dark.ink}");
    expect(dtcg.color.dark["action-text"].$value).toBe("{color.dark.paper}");
    expect(dtcg.font.sans.$value).toBe("{font.family}");
    expect(dtcg.font.display.$value).toBe("{font.sans}");
    const unresolved: string[] = [];
    const walk = (node: Record<string, unknown>, path: string[]) => {
      for (const [key, value] of Object.entries(node)) {
        if (key === "$value" && typeof value === "string" && /^\{.+\}$/.test(value)) {
          const target = value.slice(1, -1).split(".").reduce<unknown>((at, part) => (at as Record<string, unknown> | undefined)?.[part], dtcg);
          if (!(target && typeof target === "object" && "$value" in target)) unresolved.push(`${path.join(".")} -> ${value}`);
        } else if (value && typeof value === "object" && !Array.isArray(value)) walk(value as Record<string, unknown>, [...path, key]);
      }
    };
    walk(dtcg, []);
    expect(unresolved).toEqual([]);
  });
});
