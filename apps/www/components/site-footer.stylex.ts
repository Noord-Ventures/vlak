import * as stylex from "@stylexjs/stylex";

const compact = "@media (min-width: 900px) and (max-width: 1279px)";
const tablet = "@media (min-width: 641px) and (max-width: 899px)";
const phone = "@media (max-width: 640px)";

export const footer = stylex.create({
  inner: {
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(4, 184px) minmax(0, 388px)",
      [compact]: "repeat(4, minmax(0, 184px))",
      [tablet]: "repeat(3, minmax(0, 184px))",
      // Keep two columns when labels fit; enlarged text can use one.
      [phone]: "repeat(auto-fit, minmax(min(100%, max(9em, calc((100% - var(--gutter)) / 2))), 1fr))",
    },
    columnGap: "var(--gutter)",
    rowGap: 32,
    alignItems: "start",
    maxWidth: "100%",
  },
  brand: {
    display: "flex",
    width: 20,
    height: 20,
    color: "var(--text)",
    gridColumn: { default: "auto", [tablet]: "1 / -1", [phone]: "1 / -1" },
  },
  group: { minWidth: 0 },
  categories: { gridColumn: { default: "auto", [phone]: "1 / -1" } },
  heading: {
    margin: 0,
    marginBottom: 8,
    fontSize: "inherit",
    lineHeight: 1.45,
    fontWeight: 600,
    color: "var(--text)",
    overflowWrap: "anywhere",
  },
  links: {
    display: "grid",
    margin: 0,
    padding: 0,
    listStyleType: "none",
  },
  categoryLinks: {
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      [phone]: "repeat(auto-fit, minmax(min(100%, max(9em, calc((100% - var(--gutter)) / 2))), 1fr))",
    },
    columnGap: "var(--gutter)",
  },
  item: { minWidth: 0 },
  link: {
    display: "flex",
    alignItems: "center",
    minWidth: 44,
    minHeight: 44,
    paddingBlock: 8,
    lineHeight: 1.45,
    overflowWrap: "anywhere",
    ":focus-visible": {
      outlineWidth: 2,
      outlineStyle: "solid",
      outlineColor: "var(--text)",
      outlineOffset: 2,
    },
  },
  about: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    minWidth: 0,
    maxWidth: 388,
    gridColumn: { default: "auto", [compact]: "2 / -1", [tablet]: "1 / -1", [phone]: "1 / -1" },
  },
});
