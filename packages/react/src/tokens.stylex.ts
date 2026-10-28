import * as stylex from "@stylexjs/stylex";

/**
 * StyleX vars alias Vlak CSS custom properties. Not a second scale.
 * Values live in packages/core/css/tokens.css (generated from src/tokens.ts).
 */
export const vlak = stylex.defineVars({
  paper: "var(--bg)",
  ink: "var(--text)",
  gray: "var(--text-secondary)",
  accent: "var(--accent)",
  /** Fill of the primary action and the label on it. Ink and paper until a product sets them. */
  action: "var(--action)",
  actionText: "var(--action-text)",
  divider: "var(--divider)",
  dividerSubtle: "var(--divider-subtle)",
  tableAlt: "var(--table-alt)",
  gridLine: "var(--grid-line)",
  /** Boundary of a form control: 3:1 against the ground. Hairlines stay decorative. */
  controlBorder: "var(--control-border)",
  /** Hover fill of a ghost control; its edge takes the same colour. */
  controlFill: "var(--control-fill)",
  radiusSm: "var(--radius-sm)",
  radius: "var(--radius)",
  radiusChrome: "var(--radius-chrome)",
  radiusIn: "var(--radius-in)",
  pad: "var(--pad)",
  gutter: "var(--gutter)",
  module: "var(--grid-size)",
  gridImage: "var(--grid-image)",
  gridPos: "var(--grid-pos)",
  hit: "var(--hit)",
  controlH: "var(--control-h)",
  controlFs: "var(--control-fs)",
  controlLabel: "var(--control-label)",
  durationSnap: "var(--duration-snap)",
  duration: "var(--duration)",
  durationDeliberate: "var(--duration-deliberate)",
  durationConfirm: "var(--duration-confirm)",
  ease: "var(--ease)",
  transition: "var(--transition)",
  textScale: "var(--text-scale)",
  hairline: "1px",
  /** Stacking scale. Native dialog and popover use the top layer instead. */
  zRaised: "var(--z-raised)",
  zSticky: "var(--z-sticky)",
  zFloat: "var(--z-float)",
  zOverlay: "var(--z-overlay)",
  zToast: "var(--z-toast)",
});

/** The text face, `--font-sans`: Inter until a product sets it. Same as body in base.css. @font-face stays CSS. */
export const vlakFont = "var(--font-sans)";

/** The display, display XL and title steps, `--font-display`: follows `--font-sans` until a product sets it. */
export const vlakDisplay = "var(--font-display)";

export const vlakMono = "ui-monospace, SFMono-Regular, Menlo, monospace";

/** Compile-time media keys. StyleX only folds defineConsts, not plain strings. */
export const mq = stylex.defineConsts({
  phone: "@media (max-width: 640px)",
  mobileGrid: "@media (max-width: 480px)",
  at900: "@media (min-width: 900px)",
  at899: "@media (max-width: 899px)",
  rail: "@media (min-width: 1024px)",
  wide: "@media (min-width: 1440px)",
  reduce: "@media (prefers-reduced-motion: reduce)",
  touch: "@media (hover: none)",
  /** Visual hover feedback is only for a pointer that can actually hover. */
  hover: "@media (hover: hover) and (pointer: fine)",
  forcedColors: "@media (forced-colors: active)",
});

/** Phone recut (≤640). Desktop stays the poster. */
export const phone = mq.phone;

/** Mobile grid (≤480). */
export const mobileGrid = mq.mobileGrid;

/** Catalog rail. */
export const rail = mq.rail;

/** Wide catalog. */
export const wide = mq.wide;
