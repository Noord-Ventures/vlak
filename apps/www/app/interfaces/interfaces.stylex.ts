import * as stylex from "@stylexjs/stylex";

const at900 = "@media (min-width: 900px)";
const rail = "@media (min-width: 1024px)";
const phone = "@media (max-width: 640px)";
const at899 = "@media (max-width: 899px)";
const reduce = "@media (prefers-reduced-motion: reduce)";

/**
 * Interfaces posters. Landing tiles sit on the 204, ink --grid-line,
 * no shadow. Specimen is square with a quiet paper lift. Rail is transparent.
 * Crop stills and `body:has(.if-index)` stay in interfaces.css —
 * positional crops + document :has() are not StyleX-owned.
 */
export const interfaces = stylex.create({
  index: {
    display: "flex",
    gap: "var(--gutter)",
    paddingInline: "var(--pad)",
    marginLeft: {
      default: null,
      [rail]: 204,
    },
    flexDirection: {
      default: "row",
      [at899]: "column",
    },
    paddingTop: {
      default: null,
      [at899]: "calc(72px + env(safe-area-inset-top, 0px))",
      [phone]: "calc(56px + env(safe-area-inset-top, 0px))",
    },
  },
  rail: {
    display: {
      default: "none",
      [at900]: "block",
    },
    flexShrink: 0,
    alignSelf: "flex-start",
    position: "sticky",
    top: 0,
    height: "100vh",
    width: 184,
    paddingTop: 120,
    paddingRight: 20,
    paddingBottom: 72,
    paddingLeft: 0,
    overflowY: "auto",
    scrollbarWidth: "none",
    backgroundColor: "transparent",
  },
  railLink: {
    display: "block",
    paddingTop: 5,
    paddingBottom: 5,
    fontSize: "0.8125rem",
    fontWeight: 400,
    letterSpacing: "-0.01em",
    color: "var(--text-secondary)",
    textDecoration: "none",
    transition: {
      default: "color var(--duration-snap) var(--ease)",
      [reduce]: "none",
    },
    ":hover": { color: "var(--text)" },
    ":focus-visible": { color: "var(--text)" },
  },
  list: {
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
      [phone]: "1fr",
    },
    columnGap: "var(--gutter)",
    rowGap: "calc(2 * var(--gutter))",
    paddingBottom: {
      default: 72,
      [phone]: "calc(72px + env(safe-area-inset-bottom, 0px))",
    },
  },
  tile: {
    isolation: "isolate",
    display: "grid",
    gridTemplateRows: "1fr auto",
    height: 408,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "var(--grid-line)",
    borderRadius: 0,
    boxShadow: "none",
    textDecoration: "none",
    color: "inherit",
    overflow: "hidden",
    transition: {
      default: "border-color var(--duration-snap) var(--ease)",
      [reduce]: "none",
    },
    ":hover": { borderColor: "var(--text)" },
    ":focus-visible": {
      borderColor: "var(--text)",
      outlineWidth: 1,
      outlineStyle: "solid",
      outlineColor: "var(--text)",
      outlineOffset: 2,
    },
  },
  tileMatter: {
    paddingTop: 12,
    paddingRight: 20,
    paddingBottom: 14,
    paddingLeft: 20,
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: "var(--grid-line)",
    backgroundColor: "transparent",
  },
  tileTitle: {
    margin: 0,
    marginBottom: 2,
    fontSize: {
      default: "0.9375rem",
      [phone]: "1rem",
    },
    fontWeight: 600,
    letterSpacing: "-0.02em",
    lineHeight: 1.2,
    color: "var(--text)",
  },
  tileVoice: {
    margin: 0,
    fontSize: {
      default: "0.8125rem",
      [phone]: "0.9375rem",
    },
    fontWeight: 400,
    letterSpacing: "-0.01em",
    lineHeight: {
      default: 1.4,
      [phone]: 1.45,
    },
    color: "var(--text-secondary)",
  },
  crop: {
    position: "relative",
    minHeight: 0,
    overflow: "hidden",
    pointerEvents: "none",
    userSelect: "none",
    backgroundColor: "transparent",
  },
  specimen: {
    containerType: "inline-size",
    marginTop: 0,
    height: {
      default: 612,
      [phone]: "clamp(480px, calc(100svh - 148px), 720px)",
    },
    minHeight: {
      default: null,
      [phone]: 480,
    },
    backgroundColor: "var(--bg)",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "var(--divider)",
    borderRadius: 0,
    boxShadow: "none",
    overflow: "hidden",
  },
  vehicleSpecimen: {
    height: {
      default: 720,
      [phone]: "clamp(480px, calc(100svh - 148px), 720px)",
    },
  },
  matter: {
    maxWidth: 592,
    paddingTop: 32,
    paddingBottom: {
      default: 72,
      [phone]: "calc(72px + env(safe-area-inset-bottom, 0px))",
    },
  },
  voice: {
    margin: 0,
    marginBottom: 8,
    fontSize: "0.8125rem",
    fontWeight: 600,
    letterSpacing: "-0.01em",
    color: "var(--text-secondary)",
  },
  story: {
    marginTop: 16,
    marginBottom: 0,
    fontSize: "1.0625rem",
    fontWeight: 400,
    letterSpacing: "-0.01em",
    lineHeight: 1.5,
    color: "var(--text)",
  },
  story2: {
    color: "var(--text-secondary)",
    fontSize: "0.9375rem",
  },
  meta: {
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(2, minmax(0, 184px))",
      [phone]: "1fr",
    },
    gap: 20,
    marginTop: 32,
    padding: 0,
    borderWidth: 0,
    boxShadow: "none",
  },
  v1Status: {
    display: {
      default: "none",
      [phone]: "flex",
    },
    alignItems: "center",
    justifyContent: "space-between",
    height: 44,
    paddingInline: 20,
    fontSize: "0.75rem",
    color: "var(--text)",
    backgroundColor: "var(--bg)",
  },
  v1Nav: {
    display: {
      default: "none",
      [phone]: "flex",
    },
    alignItems: "center",
    justifyContent: "space-between",
    height: 48,
    paddingInline: 16,
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: "var(--divider)",
    backgroundColor: "var(--bg)",
  },
  v1Title: {
    margin: 0,
    fontSize: "1rem",
    fontWeight: 600,
    letterSpacing: "-0.02em",
  },
  v1Action: {
    appearance: "none",
    borderWidth: 0,
    backgroundColor: "transparent",
    color: "var(--text-secondary)",
    minHeight: 44,
    padding: 0,
    cursor: "pointer",
  },
});
