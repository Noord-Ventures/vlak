import * as stylex from "@stylexjs/stylex";

const at481 = "@media (min-width: 481px)";
const at816 = "@media (min-width: 816px)";
const at1224 = "@media (min-width: 1224px)";
const phone = "@media (max-width: 640px)";
const reduce = "@media (prefers-reduced-motion: reduce)";
const reveal = stylex.keyframes({
  from: { opacity: 0, transform: "translateY(8px)" },
  to: { opacity: 1, transform: "translateY(0)" },
});

/**
 * Homepage specimen. Overlay kill (`html:has(.specimen-page)::before`)
 * and named grid-template-areas stay in specimen.css — StyleX cannot
 * target html from a child; CI greps the named areas and clip-path.
 * Column counts must live here: a 1-col StyleX default would collapse
 * the live 2 / 4 / 6 recuts.
 */
export const specimen = stylex.create({
  page: {
    width: "100%",
    minHeight: "100dvh",
    margin: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
  },
  field: {
    display: "grid",
    width: "100%",
    minHeight: "100dvh",
    margin: 0,
    borderWidth: 0,
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      [at481]: "repeat(2, minmax(0, 1fr))",
      [at816]: "repeat(4, minmax(0, 1fr))",
      [at1224]: "repeat(6, minmax(0, 1fr))",
    },
    gridAutoRows: "minmax(204px, auto)",
    backgroundColor: "var(--divider)",
    padding: 0,
    gap: 1,
    boxShadow: "inset 1px 0 0 var(--grid-line), inset -1px 0 0 var(--grid-line)",
    clipPath: "inset(0)",
  },
  cell: {
    minWidth: 0,
    minHeight: 204,
    padding: 20,
    backgroundColor: "var(--bg)",
    display: "flex",
    flexDirection: "column",
    overflow: "visible",
    borderRadius: 0,
  },
  /** Face / law: 408 module, type on the bottom so it clears the 72 crumb bar. */
  cellEnd: {
    justifyContent: "flex-end",
  },
  cellTall: {
    minHeight: 408,
    justifyContent: "flex-end",
  },
  cellCommand: {
    minHeight: 204,
    justifyContent: "flex-end",
    gap: 20,
  },
  start: {
    display: "grid",
    gridTemplateColumns: { default: "repeat(3, minmax(0, 1fr))", [phone]: "minmax(0, 1fr)" },
    gap: 1,
    // The parent paints the translucent divider; do not composite it twice.
    backgroundColor: "transparent",
  },
  startTile: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    alignItems: "flex-start",
    minWidth: 0,
    minHeight: { default: 204, [phone]: 136 },
    padding: 20,
    gap: 8,
    backgroundColor: "var(--bg)",
    color: "var(--text)",
    textDecoration: "none",
    ":hover": { backgroundColor: "var(--control-fill)" },
    ":focus-visible": {
      outlineWidth: 2,
      outlineStyle: "solid",
      outlineColor: "var(--text)",
      outlineOffset: -4,
    },
  },
  /** Keep the three-path row and AI specimen in one full-width grid region. */
  startRegion: {
    gridArea: "start",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    gap: 1,
  },
  startFeatureTile: {
    minHeight: 612,
    gap: 32,
    justifyContent: "space-between",
  },
  aiDemos: {
    display: "grid",
    gridTemplateColumns: { default: "minmax(0, 1fr)", [at816]: "minmax(0, 1.5fr) minmax(0, 1fr)" },
    gap: { default: 24, [at816]: 40 },
    alignItems: "start",
    width: "100%",
    maxWidth: 1060,
    minWidth: 0,
    marginInlineStart: "auto",
    marginInlineEnd: 0,
    marginBlock: "auto",
  },
  aiStack: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
    minWidth: 0,
    // Reserve the largest playback state so disclosures do not move the next tile.
    minHeight: { default: 680, [at481]: 612 },
  },
  aiExchange: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    gap: 12,
  },
  aiReveal: {
    animationName: { default: reveal, [reduce]: "none" },
    animationDuration: "280ms",
    animationTimingFunction: "ease-out",
    animationFillMode: "both",
  },
  aiCopy: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 0,
  },
  aiTitle: {
    margin: 0,
    fontSize: 17,
    fontWeight: 500,
    lineHeight: 1.45,
  },
  aiLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    minHeight: 44,
    color: "var(--text)",
    textDecoration: "none",
    ":hover": { textDecoration: "underline" },
  },
  aiDescription: {
    margin: 0,
    fontSize: { default: 13, [phone]: 15 },
    lineHeight: 1.45,
    color: "var(--text-secondary)",
  },
  aiContext: {
    margin: 0,
  },
});
