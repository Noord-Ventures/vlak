import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
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
  it("keeps the switch rail slim without shrinking its hit area", () => {
    const css = readFileSync(join(pkgDir, "css/components/switch.css"), "utf8");
    const hit = css.match(/\.rs-switch\{([^}]+)\}/)?.[1];
    const rail = css.match(/\.rs-switch::before\{([^}]+)\}/)?.[1];
    expect(hit).toContain("min-width:var(--hit)");
    expect(hit).toContain("min-height:var(--hit)");
    expect(rail).toContain("width:2.75rem");
    expect(rail).toContain("height:1.5rem");
    expect(css).toContain(".rs-switch-thumb-on:dir(rtl){transform:translateX(-20px)}");
  });

  it("gives toggle segments breathing room", () => {
    const css = readFileSync(join(pkgDir, "css/components/toggle.css"), "utf8");
    expect(css).toContain("padding-inline:1.25rem");
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
    expect(vlakCss).toContain("@media(hover:none)");
  });
});
