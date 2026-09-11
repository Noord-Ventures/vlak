import * as stylex from "@stylexjs/stylex";

const at900 = "@media (min-width: 900px)";

/**
 * Docs rail. 184 groups + 204 secondaries. No paper cover.
 * Secondaries occupy gutter + column (204), end on the 408 module line.
 * The shared --rail-inset owns the origin at every page level.
 * Layout widths can differ without shifting these navigation columns.
 */
export const navStyles = stylex.create({
  rail: {
    display: {
      default: "none",
      [at900]: "flex",
    },
    flexShrink: 0,
    alignSelf: "flex-start",
    position: "sticky",
    top: 0,
    height: "100vh",
    paddingTop: 120,
    paddingBottom: 72,
    gap: 0,
  },
  toc: {
    width: 184,
    flexShrink: 0,
    height: "100%",
    overflowY: "auto",
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 20,
    scrollbarWidth: "none",
    maskImage:
      "linear-gradient(to bottom, transparent 0, #000 12px, #000 calc(100% - 64px), transparent calc(100% - 8px))",
    "::-webkit-scrollbar": {
      display: "none",
    },
  },
  docs: {
    maskImage: "none",
  },
  docsLabel: {
    margin: 0,
    marginBottom: 4,
    fontSize: "0.75rem",
    fontWeight: 600,
    letterSpacing: 0,
    color: "var(--text-secondary)",
  },
  sub: {
    width: 204,
    marginLeft: 0,
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor: "transparent",
    ":empty": {
      display: "none",
    },
  },
  item: {
    display: "block",
    paddingBlock: 5,
    paddingInline: 0,
    fontSize: "0.8125rem",
    fontWeight: {
      default: 400,
      '[aria-current="page"]': 500,
      '[aria-current="true"]': 500,
    },
    letterSpacing: "-0.01em",
    color: {
      default: "var(--text-secondary)",
      ":hover": "var(--text)",
      ":focus-visible": "var(--text)",
      '[data-preview="true"]': "var(--text)",
      '[aria-current="true"]': "var(--text)",
      '[aria-current="page"]': "var(--text)",
    },
    /* Gray at full opacity: 5:1 on paper. Opacity would drop it under 4.5:1. */
    opacity: 1,
    textDecoration: "none",
    transition: "color var(--duration-snap) var(--ease), opacity var(--duration-snap) var(--ease)",
    outlineWidth: {
      default: null,
      ":focus-visible": 1,
    },
    outlineStyle: {
      default: null,
      ":focus-visible": "solid",
    },
    outlineColor: {
      default: null,
      ":focus-visible": "var(--text)",
    },
    outlineOffset: {
      default: null,
      ":focus-visible": 2,
    },
  },
});
